import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { v4 as uuidv4 } from "uuid";
import { calculateFees } from "./feeCalculator";

const db = getFirestore();

const paystackSecretKey = defineSecret("PAYSTACK_SECRET_KEY");

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface ConfirmReceiptRequestData {
  transactionId: string;
}

interface TransactionData {
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;
  status: "pending_payment" | "held" | "released" | "cancelled";
}

interface SellerProfileData {
  outstandingBoostDebt?: number;
  banking?: {
    paystackRecipientCode?: string;
  };
}

interface ListingData {
  sellerWasProAtCreation?: boolean;
  boostDebt?: number;
}

interface PaystackInitiateTransferResponse {
  status: boolean;
  message: string;
  data?: {
    transfer_code: string;
    status: string;
  };
}

export const confirmReceiptAndRelease = onCall(
  { secrets: [paystackSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to confirm receipt.");
    }

    const { transactionId } = request.data as ConfirmReceiptRequestData;

    if (typeof transactionId !== "string" || transactionId.trim() === "") {
      throw new HttpsError("invalid-argument", "A valid transactionId is required.");
    }

    const transactionRef = db.collection("transactions").doc(transactionId);
    const transactionSnap = await transactionRef.get();

    if (!transactionSnap.exists) {
      throw new HttpsError("not-found", "Transaction not found.");
    }

    const transaction = transactionSnap.data() as TransactionData;

    if (transaction.buyerId !== request.auth.uid) {
      throw new HttpsError(
        "permission-denied",
        "Only the buyer on this transaction can confirm receipt."
      );
    }

    if (transaction.status !== "held") {
      throw new HttpsError(
        "failed-precondition",
        `This transaction cannot be released because its status is "${transaction.status}", not "held".`
      );
    }

    const sellerProfileRef = db.collection("userProfiles").doc(transaction.sellerId);
    const sellerProfileSnap = await sellerProfileRef.get();

    if (!sellerProfileSnap.exists) {
      logger.error(
        `confirmReceiptAndRelease: seller profile ${transaction.sellerId} not found for transaction ${transactionId}. Transaction remains held.`
      );
      throw new HttpsError(
        "internal",
        "Seller profile could not be found. The transaction has not been released; please contact support."
      );
    }

    const sellerProfile = sellerProfileSnap.data() as SellerProfileData;
    const recipientCode = sellerProfile.banking?.paystackRecipientCode;

    if (!recipientCode) {
      logger.error(
        `confirmReceiptAndRelease: seller ${transaction.sellerId} has no paystackRecipientCode on file. Transaction ${transactionId} remains held.`
      );
      throw new HttpsError(
        "failed-precondition",
        "The seller's payout details are not fully set up. The transaction has not been released; please contact support so the seller can complete their banking verification."
      );
    }

    const listingRef = db.collection("publicListings").doc(transaction.listingId);
    const listingSnap = await listingRef.get();
    const listing = (listingSnap.exists ? listingSnap.data() : {}) as ListingData;

    const secretKey = paystackSecretKey.value();

    const feeResult = calculateFees({
      salePrice: transaction.amount,
      wasProAtListingCreation: listing.sellerWasProAtCreation === true,
      listingBoostDebt: typeof listing.boostDebt === "number" ? listing.boostDebt : 0,
      accountBoostDebt:
        typeof sellerProfile.outstandingBoostDebt === "number"
          ? sellerProfile.outstandingBoostDebt
          : 0,
    });

    if (feeResult.sellerPayout <= 0) {
      logger.warn(
        `confirmReceiptAndRelease: seller payout for transaction ${transactionId} is R0 after commission and boost debt. No transfer will be initiated.`,
        { feeResult }
      );

      await transactionRef.update({
        status: "released",
        releasedAt: FieldValue.serverTimestamp(),
      });

      await sellerProfileRef.update({
        outstandingBoostDebt: feeResult.remainingAccountBoostDebt,
      });

      return { success: true, sellerPayout: 0, feeResult };
    }

    const amountInCents = Math.round(feeResult.sellerPayout * 100);
    const transferReference = uuidv4();

    let transferResult: PaystackInitiateTransferResponse;

    try {
      const response = await fetch(`${PAYSTACK_BASE_URL}/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "balance",
          amount: amountInCents,
          recipient: recipientCode,
          reason: `The Exchange payout for transaction ${transactionId}`,
          reference: transferReference,
        }),
      });

      transferResult = (await response.json()) as PaystackInitiateTransferResponse;

      if (!response.ok || !transferResult.status) {
        throw new Error(transferResult.message ?? "unknown error");
      }
    } catch (error) {
      logger.error(
        `confirmReceiptAndRelease: Paystack transfer failed for transaction ${transactionId}, seller ${transaction.sellerId}. Transaction remains held.`,
        { error, transferReference, amountInCents }
      );
      throw new HttpsError(
        "internal",
        "The payout to the seller could not be processed. The transaction has not been released; please contact support."
      );
    }

    await transactionRef.update({
      status: "released",
      releasedAt: FieldValue.serverTimestamp(),
      payoutAmount: feeResult.sellerPayout,
      commissionAmount: feeResult.commissionAmount,
      paystackTransferReference: transferReference,
    });

    await sellerProfileRef.update({
      outstandingBoostDebt: feeResult.remainingAccountBoostDebt,
    });

    if (listingSnap.exists && (listing.boostDebt ?? 0) > 0) {
      await listingRef.update({ boostDebt: 0 });
    }

    logger.info(
      `confirmReceiptAndRelease: transaction ${transactionId} released. Seller ${transaction.sellerId} paid R${feeResult.sellerPayout}.`,
      { transactionId, feeResult, transferReference }
    );

    return { success: true, sellerPayout: feeResult.sellerPayout, feeResult };
  }
);