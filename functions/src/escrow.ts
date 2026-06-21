import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

/**
 * Creates a secure escrow hold.
 * This can only be called by authenticated users.
 */
export const createEscrowHold = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in.");
  }

  const { transactionId, amount } = request.data;

  if (!transactionId || !amount || amount <= 0) {
    throw new HttpsError("invalid-argument", "Missing or invalid transaction data.");
  }

  try {
    const holdData = {
      transactionId,
      userId: request.auth.uid,
      amount,
      status: "held",
      heldAt: FieldValue.serverTimestamp(),
      type: "PLATFORM_ESCROW",
    };

    const docRef = await db.collection("escrowHolds").add(holdData);
    logger.info(`Escrow hold created for transaction ${transactionId}`, { holdId: docRef.id });

    return { success: true, holdId: docRef.id };
  } catch (error) {
    logger.error("Error creating escrow hold", error);
    throw new HttpsError("internal", "Internal server error occurred.");
  }
});

/**
 * Releases an escrow hold.
 * Only callable by admins.
 */
export const releaseEscrowHold = onCall(async (request) => {
  if (!request.auth || !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "Only admins can release funds.");
  }

  const { holdId } = request.data;

  if (!holdId) {
    throw new HttpsError("invalid-argument", "Missing hold ID.");
  }

  try {
    const holdRef = db.collection("escrowHolds").doc(holdId);
    await holdRef.update({
      status: "released",
      releasedAt: FieldValue.serverTimestamp(),
      releasedBy: request.auth.uid,
    });

    logger.info(`Escrow hold ${holdId} released by admin ${request.auth.uid}`);
    return { success: true };
  } catch (error) {
    logger.error("Error releasing escrow hold", error);
    throw new HttpsError("internal", "Internal server error occurred.");
  }
});
