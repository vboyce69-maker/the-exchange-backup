import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import * as crypto from "crypto";

const db = getFirestore();

const paystackSecretKey = defineSecret("PAYSTACK_SECRET_KEY");

interface PaystackChargeSuccessEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    status: string;
    metadata?: {
      transactionId?: string;
    };
  };
}

interface TransactionData {
  amount: number;
  status: "pending_payment" | "held" | "released" | "cancelled";
}

export const paystackWebhook = onRequest(
  { secrets: [paystackSecretKey] },
  async (request, response) => {
    if (request.method !== "POST") {
      response.status(405).send("Method not allowed");
      return;
    }

    const signature = request.headers["x-paystack-signature"];

    if (typeof signature !== "string" || signature.trim() === "") {
      logger.warn("paystackWebhook: missing x-paystack-signature header. Rejecting.");
      response.status(401).send("Missing signature");
      return;
    }

    const secretKey = paystackSecretKey.value();

    const expectedHash = crypto
      .createHmac("sha512", secretKey)
      .update(request.rawBody)
      .digest("hex");

    if (expectedHash !== signature) {
      logger.error("paystackWebhook: signature verification failed. Rejecting request.");
      response.status(401).send("Invalid signature");
      return;
    }

    const event = request.body as PaystackChargeSuccessEvent;

    if (event.event !== "charge.success") {
      logger.info(`paystackWebhook: received unhandled event type "${event.event}". Ignoring.`);
      response.status(200).send("OK");
      return;
    }

    const transactionId = event.data.metadata?.transactionId;

    if (!transactionId) {
      logger.error(
        "paystackWebhook: charge.success event has no metadata.transactionId. Cannot process.",
        { reference: event.data.reference }
      );
      response.status(200).send("OK");
      return;
    }

    const transactionRef = db.collection("transactions").doc(transactionId);
    const transactionSnap = await transactionRef.get();

    if (!transactionSnap.exists) {
      logger.error(
        `paystackWebhook: charge.success references transactionId ${transactionId}, which does not exist in Firestore.`,
        { reference: event.data.reference }
      );
      response.status(200).send("OK");
      return;
    }

    const transaction = transactionSnap.data() as TransactionData;

    if (transaction.status !== "pending_payment") {
      logger.info(
        `paystackWebhook: transaction ${transactionId} is already in status "${transaction.status}", not "pending_payment". Skipping (likely a duplicate webhook delivery).`
      );
      response.status(200).send("OK");
      return;
    }

    const expectedAmountInCents = Math.round(transaction.amount * 100);

    if (event.data.amount !== expectedAmountInCents) {
      logger.error(
        `paystackWebhook: amount mismatch for transaction ${transactionId}. Expected ${expectedAmountInCents} cents, Paystack reports ${event.data.amount} cents. NOT releasing to held status — requires manual review.`,
        { transactionId, reference: event.data.reference }
      );
      response.status(200).send("OK");
      return;
    }

    await transactionRef.update({
      status: "held",
      paystackReference: event.data.reference,
    });

    logger.info(
      `paystackWebhook: transaction ${transactionId} confirmed paid and moved to "held".`,
      { transactionId, reference: event.data.reference }
    );

    response.status(200).send("OK");
  }
);