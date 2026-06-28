import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";

const db = getFirestore();

const paystackSecretKey = defineSecret("PAYSTACK_SECRET_KEY");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface CreateTransactionRequestData {
  listingId: string;
}

interface ListingData {
  sellerId: string;
  price: number;
  status: "available" | "pending_sale" | "sold";
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data?: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

/**
 * Creates a pending transaction for a listing and initializes a Paystack
 * payment session for the buyer.
 *
 * IMPORTANT: this function does NOT lock the listing. The listing stays
 * "available" until paystackWebhook confirms the charge actually succeeded.
 * Locking here, before payment is confirmed, would let a buyer who opens
 * checkout and never completes payment hold the item hostage indefinitely
 * -- there is currently no cleanup function to recover a listing stuck in
 * "pending_sale" with no successful payment behind it. Locking happens
 * exclusively in paystackWebhook, on confirmed "charge.success".
 */
export const createTransaction = onCall(
  { secrets: [paystackSecretKey] },
  async (request) => {
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

    let transactionAmount = 0;
    let sellerId = "";

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

        // This is the check that prevents double payment: once
        // paystackWebhook confirms a buyer's payment, it locks the listing
        // to "pending_sale" and every other buyer is blocked right here.
        if (listing.status !== "available") {
          throw new HttpsError(
            "failed-precondition",
            listing.status === "pending_sale"
              ? "This item is already pending a sale to another buyer."
              : "This item has already been sold."
          );
        }

        if (
          typeof listing.price !== "number" ||
          !Number.isFinite(listing.price) ||
          listing.price <= 0
        ) {
          logger.error(
            `createTransaction: listing ${listingId} has an invalid price (${listing.price}). Cannot create transaction.`
          );
          throw new HttpsError(
            "internal",
            "This listing's price is invalid. Please contact support."
          );
        }

        transactionAmount = listing.price;
        sellerId = listing.sellerId;

        // Note: the listing is deliberately NOT updated here. See the
        // function-level comment above for why.
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

    const buyerEmail =
      typeof request.auth.token.email === "string" && request.auth.token.email.trim() !== ""
        ? request.auth.token.email
        : undefined;

    if (!buyerEmail) {
      // The transaction doc above is harmless to leave in "pending_payment"
      // -- it never locked the listing, so nothing is stuck. It's left in
      // place (rather than deleted) as an audit trail of the failed attempt.
      logger.warn(
        `createTransaction: buyer ${buyerId} has no email on their auth token. Cannot initialize Paystack for transaction ${transactionRef.id}.`
      );
      throw new HttpsError(
        "failed-precondition",
        "We couldn't find an email address on your account. Please add one in your profile settings before purchasing."
      );
    }

    const secretKey = paystackSecretKey.value();
    const amountInCents = Math.round(transactionAmount * 100);

    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: buyerEmail,
          amount: amountInCents,
          currency: "ZAR",
          metadata: {
            transactionId: transactionRef.id,
            listingId,
            buyerId,
            sellerId,
          },
        }),
      });

      const result = (await response.json()) as PaystackInitializeResponse;

      if (!response.ok || !result.status || !result.data) {
        throw new Error(result.message ?? "unknown error");
      }

      logger.info(
        `createTransaction: Paystack transaction initialized for transaction ${transactionRef.id}.`,
        { transactionId: transactionRef.id, reference: result.data.reference }
      );

      return {
        success: true,
        transactionId: transactionRef.id,
        authorizationUrl: result.data.authorization_url,
        accessCode: result.data.access_code,
        reference: result.data.reference,
      };
    } catch (error) {
      // Unlike the original version of this function, a failure here is
      // NOT catastrophic: the listing was never locked, so it's still
      // "available" and the buyer (or anyone else) can simply try again.
      logger.error(
        `createTransaction: Paystack initialization failed for transaction ${transactionRef.id}, listing ${listingId}. Listing remains "available" -- no cleanup needed.`,
        { error }
      );
      throw new HttpsError(
        "internal",
        "We couldn't start the payment process. Please try again."
      );
    }
  }
);