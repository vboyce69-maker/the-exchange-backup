import * as logger from "firebase-functions/logger";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

interface PaystackBank {
  name: string;
  code: string;
}

interface PaystackListBanksResponse {
  status: boolean;
  message: string;
  data: PaystackBank[];
}

interface PaystackCreateRecipientResponse {
  status: boolean;
  message: string;
  data?: {
    recipient_code: string;
  };
}

function normalizeBankName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function resolveBankCode(
  storedBankName: string,
  paystackSecretKey: string
): Promise<string> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/bank?currency=ZAR`, {
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `resolveBankCode: Paystack List Banks API request failed with status ${response.status}`
    );
  }

  const result = (await response.json()) as PaystackListBanksResponse;

  if (!result.status) {
    throw new Error(`resolveBankCode: Paystack List Banks API returned an error: ${result.message}`);
  }

  const target = normalizeBankName(storedBankName);
  const match = result.data.find((bank) => normalizeBankName(bank.name) === target);

  if (!match) {
    throw new Error(
      `resolveBankCode: no exact match found for stored bank name "${storedBankName}" ` +
        `(normalized: "${target}"). This seller's bank name may be misspelled, abbreviated ` +
        `differently than Paystack's records, or not a bank Paystack supports for transfers.`
    );
  }

  return match.code;
}

export async function createTransferRecipient(
  accountNumber: string,
  bankCode: string,
  sellerName: string,
  paystackSecretKey: string
): Promise<string> {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transferrecipient`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "basa",
      name: sellerName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: "ZAR",
    }),
  });

  const result = (await response.json()) as PaystackCreateRecipientResponse;

  if (!response.ok || !result.status || !result.data?.recipient_code) {
    throw new Error(
      `createTransferRecipient: Paystack rejected recipient creation for account ` +
        `ending in ${accountNumber.slice(-4)}: ${result.message ?? "unknown error"}`
    );
  }

  logger.info("Paystack transfer recipient created", {
    recipientCode: result.data.recipient_code,
  });

  return result.data.recipient_code;
}