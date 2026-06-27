import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";

const db = getFirestore();

interface CreateTransactionRequestData {
  listingId: string;
}

interface ListingData {
  sellerId: string;
  price: number;
  status: "available" | "pending_sale" | "sold";
}

export const createTransaction = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "You must be signed in to make a purchase.");
  }

  const { listingId } = request.data as CreateTransactionRequestData;

  if (typeof listingId !== "string" || listingId.trim() === "") {
    throw new HttpsError("invalid-argument", "A valid listingId is required.");
  }

  const buyerId = request.auth.uid;
  const listingRef = db.collection("publicListings").doc(listingId);
  const transactionRef = db.collection("transactions").doc();

  try {
    await db.runTransaction(async (firestoreTransaction) => {
      const listingSnap = await firestoreTransaction.get(listingRef);

      if (!listingSnap.exists) {
        throw new HttpsError("not-found", "Listing not found.");
      }

      const listing = listingSnap.data() as ListingData;

      if (listing.sellerId === buyerId) {
        throw new HttpsError("invalid-argument", "You cannot buy your own listing.");
      }

      if (listing.status !== "available") {
        throw new HttpsError(
          "failed-precondition",
          "This listing is no longer available for purchase. It may have just been sold or is pending another buyer's purchase."
        );
      }

      if (typeof listing.price !== "number" || !Number.isFinite(listing.price) || listing.price <= 0) {
        logger.error(
          `createTransaction: listing ${listingId} has an invalid price (${listing.price}). Cannot create transaction.`
        );
        throw new HttpsError(
          "internal",
          "This listing's price is invalid. Please contact support."
        );
      }

      firestoreTransaction.update(listingRef, {
        status: "pending_sale",
      });

      firestoreTransaction.set(transactionRef, {
        listingId,
        buyerId,
        sellerId: listing.sellerId,
        amount: listing.price,
        status: "pending_payment",
        createdAt: FieldValue.serverTimestamp(),
      });
    });
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }

    logger.error(
      `createTransaction: unexpected error creating transaction for listing ${listingId}, buyer ${buyerId}.`,
      { error }
    );
    throw new HttpsError(
      "internal",
      "Something went wrong creating your transaction. Please try again."
    );
  }

  logger.info(
    `createTransaction: transaction ${transactionRef.id} created for listing ${listingId}, buyer ${buyerId}.`
  );

  return { success: true, transactionId: transactionRef.id };
});