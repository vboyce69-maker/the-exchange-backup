import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

// ---------- Types ----------

interface MeetupLocation {
  lat: number;
  lng: number;
  label: string; // e.g. SAPS Safe Zone name
}

interface LiveLocation {
  lat: number;
  lng: number;
  accuracy: number; // meters, from navigator.geolocation / Capacitor Geolocation
  updatedAt: FirebaseFirestore.Timestamp;
}

type MeetupStatus = 'unset' | 'proposed' | 'confirmed' | 'cancelled';

// ---------- Helpers ----------

function assertAuthed(auth: { uid: string } | undefined): string {
  if (!auth) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }
  return auth.uid;
}

async function getTransactionOrThrow(transactionId: string) {
  const ref = db.collection('transactions').doc(transactionId);
  const snap = await ref.get();
  if (!snap.exists) {
    throw new HttpsError('not-found', 'Transaction not found.');
  }
  return { ref, data: snap.data()! };
}

function assertParticipant(uid: string, txData: FirebaseFirestore.DocumentData) {
  const { buyerId, sellerId } = txData;
  if (uid !== buyerId && uid !== sellerId) {
    throw new HttpsError('permission-denied', 'You are not part of this transaction.');
  }
}

function isValidCoord(lat: unknown, lng: unknown): lat is number {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 && lat <= 90 &&
    lng >= -180 && lng <= 180
  );
}

// Rejects fixes with very poor accuracy or that are stale relative to "now" on submit.
// 100m accuracy is generous for Android low-end devices indoors; tune as needed.
const MAX_ACCEPTABLE_ACCURACY_METERS = 100;

function assertReasonableAccuracy(accuracy: unknown) {
  if (typeof accuracy !== 'number' || accuracy <= 0) {
    throw new HttpsError('invalid-argument', 'A valid GPS accuracy value is required.');
  }
  if (accuracy > MAX_ACCEPTABLE_ACCURACY_METERS) {
    throw new HttpsError(
      'failed-precondition',
      `GPS signal too weak (accuracy ${Math.round(accuracy)}m). Move to an open area and try again.`
    );
  }
}

// ---------- proposeMeetup ----------
// Either buyer or seller proposes a meeting point. Resets confirmation state.

export const proposeMeetup = onCall(async (request) => {
  const uid = assertAuthed(request.auth);
  const { transactionId, location } = request.data as {
    transactionId: string;
    location: MeetupLocation;
  };

  if (!transactionId || typeof transactionId !== 'string') {
    throw new HttpsError('invalid-argument', 'transactionId is required.');
  }
  if (!location || !isValidCoord(location.lat, location.lng) || !location.label) {
    throw new HttpsError('invalid-argument', 'A valid meetup location with label is required.');
  }

  const { ref, data } = await getTransactionOrThrow(transactionId);
  assertParticipant(uid, data);

  await ref.update({
    meetup: {
      status: 'proposed' as MeetupStatus,
      proposedBy: uid,
      location,
      proposedAt: FieldValue.serverTimestamp(),
      confirmedBy: [uid], // proposer implicitly confirms their own proposal
      confirmedAt: null,
      liveLocations: {}, // reset any stale live tracking from a prior proposal
    },
  });

  return { success: true, status: 'proposed' };
});

// ---------- confirmMeetup ----------
// The OTHER participant (not the proposer) confirms the proposed point.

export const confirmMeetup = onCall(async (request) => {
  const uid = assertAuthed(request.auth);
  const { transactionId } = request.data as { transactionId: string };

  if (!transactionId || typeof transactionId !== 'string') {
    throw new HttpsError('invalid-argument', 'transactionId is required.');
  }

  const { ref, data } = await getTransactionOrThrow(transactionId);
  assertParticipant(uid, data);

  const meetup = data.meetup;
  if (!meetup || meetup.status !== 'proposed') {
    throw new HttpsError('failed-precondition', 'No pending meetup proposal to confirm.');
  }
  if (meetup.proposedBy === uid) {
    throw new HttpsError('failed-precondition', 'You cannot confirm your own proposal — waiting on the other party.');
  }
  if (Array.isArray(meetup.confirmedBy) && meetup.confirmedBy.includes(uid)) {
    throw new HttpsError('failed-precondition', 'You already confirmed this meetup.');
  }

  const confirmedBy = [...(meetup.confirmedBy ?? []), uid];
  const bothPartiesConfirmed =
    confirmedBy.includes(data.buyerId) && confirmedBy.includes(data.sellerId);

  await ref.update({
    'meetup.confirmedBy': confirmedBy,
    'meetup.status': bothPartiesConfirmed ? 'confirmed' : 'proposed',
    'meetup.confirmedAt': bothPartiesConfirmed ? FieldValue.serverTimestamp() : null,
  });

  return { success: true, status: bothPartiesConfirmed ? 'confirmed' : 'proposed' };
});

// ---------- cancelMeetup ----------
// Either party can cancel a proposed (not yet confirmed) meetup, or both must re-propose after.

export const cancelMeetup = onCall(async (request) => {
  const uid = assertAuthed(request.auth);
  const { transactionId } = request.data as { transactionId: string };

  const { ref, data } = await getTransactionOrThrow(transactionId);
  assertParticipant(uid, data);

  await ref.update({
    meetup: {
      status: 'unset' as MeetupStatus,
      proposedBy: null,
      location: null,
      proposedAt: null,
      confirmedBy: [],
      confirmedAt: null,
      liveLocations: {},
    },
  });

  return { success: true, status: 'unset' };
});

// ---------- updateLiveLocation ----------
// Called periodically (e.g. every 10-15s) by buyer/seller clients once meetup.status === 'confirmed'.
// Validates accuracy and writes only the caller's own location — never trusts a uid in the payload.

export const updateLiveLocation = onCall(async (request) => {
  const uid = assertAuthed(request.auth);
  const { transactionId, lat, lng, accuracy } = request.data as {
    transactionId: string;
    lat: number;
    lng: number;
    accuracy: number;
  };

  if (!transactionId || typeof transactionId !== 'string') {
    throw new HttpsError('invalid-argument', 'transactionId is required.');
  }
  if (!isValidCoord(lat, lng)) {
    throw new HttpsError('invalid-argument', 'A valid lat/lng is required.');
  }
  assertReasonableAccuracy(accuracy);

  const { ref, data } = await getTransactionOrThrow(transactionId);
  assertParticipant(uid, data);

  if (!data.meetup || data.meetup.status !== 'confirmed') {
    throw new HttpsError(
      'failed-precondition',
      'Live location can only be shared after both parties confirm the meetup point.'
    );
  }

  const liveLocation: LiveLocation = {
    lat,
    lng,
    accuracy,
    updatedAt: FieldValue.serverTimestamp() as unknown as FirebaseFirestore.Timestamp,
  };

  await ref.update({
    [`meetup.liveLocations.${uid}`]: liveLocation,
  });

  return { success: true };
});