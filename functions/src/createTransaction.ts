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

    const buyerEmail =
      typeof request.auth.token.email === "string" && request.auth.token.email.trim() !== ""
        ? request.auth.token.email
        : `${buyerId}@theexchange.placeholder`;

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
        accessCode: result.data.access_code,
        reference: result.data.reference,
      };
    } catch (error) {
      logger.error(
        `createTransaction: Paystack initialization failed AFTER Firestore transaction ${transactionRef.id} was created. Listing ${listingId} is now stuck in pending_sale with no way to pay.`,
        { error }
      );
      throw new HttpsError(
        "internal",
        "Your purchase was registered but we couldn't start the payment process. Please contact support."
      );
    }
  }
);