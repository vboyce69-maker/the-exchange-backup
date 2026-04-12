/**
 * @fileOverview Scam Detection Rules and Normalization Logic
 */

export interface ScamRule {
  id: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  baseScore: number;
  patterns: string[];
  reasonCode: string;
  enabled: boolean;
}

export const SCAM_RULES: ScamRule[] = [
  {
    id: "fake_pop",
    category: "fake_proof_of_payment",
    severity: "high",
    baseScore: 40,
    patterns: ["proof of payment", "pop", "payment confirmation", "screenshot attached", "reflect later"],
    reasonCode: "POP_FRAUD",
    enabled: true
  },
  {
    id: "overpayment",
    category: "overpayment_refund",
    severity: "critical",
    baseScore: 60,
    patterns: ["accidental payment", "extra money", "refund difference", "send the change", "my driver"],
    reasonCode: "OVERPAYMENT_SCAM",
    enabled: true
  },
  {
    id: "courier_scam",
    category: "fake_courier_pickup",
    severity: "high",
    baseScore: 35,
    patterns: ["send a courier", "courier collect", "insurance fee", "delivery insurance", "shipping fee first"],
    reasonCode: "COURIER_FRAUD",
    enabled: true
  },
  {
    id: "phishing",
    category: "phishing_verification_link",
    severity: "critical",
    baseScore: 70,
    patterns: ["account blocked", "verify account", "login here", "click this link", "qr code", "verify identity link"],
    reasonCode: "PHISHING_ATTEMPT",
    enabled: true
  },
  {
    id: "off_platform",
    category: "off_platform_redirect",
    severity: "medium",
    baseScore: 25,
    patterns: ["whatsapp", "watsapp", "telegram", "insta", "number", "chat off app"],
    reasonCode: "OFF_PLATFORM_STEALTH",
    enabled: true
  },
  {
    id: "identity_theft",
    category: "bank_detail_or_code_request",
    severity: "critical",
    baseScore: 80,
    patterns: ["otp", "one time pin", "verification code", "bank details", "pin code"],
    reasonCode: "CREDENTIAL_THEFT",
    enabled: true
  }
];

export const CO_OCCURRENCE_BOOSTS = [
  { terms: ["courier", "insurance"], boost: 35 },
  { terms: ["proof", "urgency"], boost: 30 },
  { terms: ["overpaid", "refund"], boost: 40 },
  { terms: ["verify", "link"], boost: 45 },
  { terms: ["whatsapp", "payment"], boost: 25 },
  { terms: ["otp", "code"], boost: 60 }
];

/**
 * Normalizes input text to defeat common obfuscation techniques.
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse whitespace
    .replace(/[.\-_]/g, '') // Remove punctuation separators (w-h-a-t-s-a-p-p -> whatsapp)
    .replace(/(.)\1{2,}/g, '$1$1'); // Collapse repeated characters (whaaaaatsapp -> whatsapp)
}
