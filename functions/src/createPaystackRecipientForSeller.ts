import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { resolveBankCode, createTransferRecipient } from "./paystackRecipient";

const paystackSecretKey = defineSecret("PAYSTACK_SECRET_KEY");

interface CreateRecipientRequestData {
  bankName: string;
  accountNumber: string;
  recipientName: string;
}

export const createPaystackRecipientForSeller = onCall(
  { secrets: [paystackSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to register payout details.");
    }

    const { bankName, accountNumber, recipientName } = request.data as CreateRecipientRequestData;

    if (
      typeof bankName !== "string" ||
      bankName.trim() === "" ||
      typeof accountNumber !== "string" ||
      accountNumber.trim() === "" ||
      typeof recipientName !== "string" ||
      recipientName.trim() === ""
    ) {
      throw new HttpsError(
        "invalid-argument",
        "bankName, accountNumber, and recipientName are all required."
      );
    }

    const secretKey = paystackSecretKey.value();

    try {
      const bankCode = await resolveBankCode(bankName, secretKey);
      const recipientCode = await createTransferRecipient(
        accountNumber,
        bankCode,
        recipientName,
        secretKey
      );

      logger.info(
        `createPaystackRecipientForSeller: recipient created for seller ${request.auth.uid}.`,
        { sellerId: request.auth.uid }
      );

      return { success: true, recipientCode };
    } catch (error) {
      logger.error(
        `createPaystackRecipientForSeller: failed for seller ${request.auth.uid}.`,
        { error }
      );
      throw new HttpsError(
        "failed-precondition",
        error instanceof Error
          ? error.message
          : "Could not verify your banking details with our payment provider. Please check your bank name and account number and try again."
      );
    }
  }
);