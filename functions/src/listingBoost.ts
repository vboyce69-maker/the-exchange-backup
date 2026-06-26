import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

export const BOOST_AMOUNT = 20;
export const BOOST_DURATION_HOURS = 48;

interface BoostListingRequestData {
  listingId: string;
}

export const boostListing = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to boost a listing.");
  }

  const { listingId } = request.data as BoostListingRequestData;

  if (typeof listingId !== "string" || listingId.trim() === "") {
    throw new HttpsError("invalid-argument", "A valid listingId is required.");
  }

  const listingRef = db.collection("publicListings").doc(listingId);

  return db.runTransaction(async (transaction) => {
    const listingSnap = await transaction.get(listingRef);

    if (!listingSnap.exists) {
      throw new HttpsError("not-found", "Listing not found.");
    }

    const listing = listingSnap.data() as { sellerId: string; isBoosted?: boolean };

    if (listing.sellerId !== request.auth!.uid) {
      throw new HttpsError("permission-denied", "You can only boost your own listings.");
    }

    if (listing.isBoosted === true) {
      throw new HttpsError(
        "already-exists",
        "This listing is already boosted. Only one active boost per listing is allowed."
      );
    }

    const now = Timestamp.now();
    const expiresAt = Timestamp.fromMillis(now.toMillis() + BOOST_DURATION_HOURS * 60 * 60 * 1000);

    transaction.update(listingRef, {
      isBoosted: true,
      boostDebt: BOOST_AMOUNT,
      boostedAt: now,
      boostExpiresAt: expiresAt,
    });

    logger.info(`Listing ${listingId} boosted by ${request.auth!.uid}`, {
      listingId,
      sellerId: request.auth!.uid,
      boostDebt: BOOST_AMOUNT,
    });

    return {
      success: true,
      boostDebt: BOOST_AMOUNT,
      boostExpiresAt: expiresAt.toMillis(),
    };
  });
});