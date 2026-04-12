/**
 * @fileOverview Production-Grade Scam Detection Engine
 * Implements normalization, weighted pattern matching, and contextual risk scoring.
 */

export type DetectionAction = 'allow' | 'warn' | 'hold' | 'block';
export type Severity = 'none' | 'low' | 'medium' | 'high' | 'critical';

export interface ScamRule {
  id: string;
  category: 'off_platform' | 'courier_scam' | 'advance_fee' | 'phishing' | 'urgency' | 'impersonation' | 'price_anomaly';
  weight: number;
  patterns: string[];
  explanation: string;
}

export interface DetectionResult {
  score: number;
  action: DetectionAction;
  severity: Severity;
  matchedRules: string[];
  reasons: string[];
  normalizedText: string;
  explanation: string;
  audit: {
    ruleWeights: Record<string, number>;
  };
}

const SYMBOL_MAP: Record<string, string> = {
  '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '8': 'b', '(': 'c', '[': 'l', '|': 'i',
};

/**
 * Normalizes user-generated text to defeat obfuscation.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  let normalized = text.toLowerCase();
  
  // 1. Symbol substitution
  Object.entries(SYMBOL_MAP).forEach(([symbol, letter]) => {
    normalized = normalized.split(symbol).join(letter);
  });

  // 2. Remove noise and punctuation (keep alphanumeric and spaces)
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');

  // 3. Handle character stretching (e.g., "haaaaalp" -> "halp")
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');

  // 4. Recursive join for spaced-out words (e.g., "w h a t s a p p" -> "whatsapp")
  // Detects single characters separated by spaces and joins them
  let prev;
  do {
    prev = normalized;
    normalized = normalized.replace(/\b([a-z0-9])\s+([a-z0-9])\b/gi, '$1$2');
  } while (normalized !== prev);

  // 5. Collapse whitespace
  normalized = normalized.trim().replace(/\s+/g, ' ');

  return normalized;
}

export const SCAM_RULES: ScamRule[] = [
  // --- Category: Off-Platform Redirection ---
  {
    id: 'whatsapp_redirect',
    category: 'off_platform',
    weight: 35,
    patterns: ['whatsapp', 'watsapp', 'whatsap', 'whtsapp', 'wsap', 'number', 'phone', 'contact me on', 'call me', 'text me'],
    explanation: 'Attempt to move communication off-platform where platform protections do not apply.'
  },
  {
    id: 'telegram_redirect',
    category: 'off_platform',
    weight: 30,
    patterns: ['telegram', 'tme', 'tele'],
    explanation: 'Redirection to encrypted apps often used by scammers.'
  },
  
  // --- Category: Courier & Collection Scams ---
  {
    id: 'courier_fake_pay',
    category: 'courier_scam',
    weight: 40,
    patterns: ['courier', 'driver', 'collect', 'pickup', 'agent', 'delivery man', 'collection fee'],
    explanation: 'Request for courier pickup or third-party collection is a high-risk scam pattern.'
  },
  {
    id: 'cheque_scam',
    category: 'courier_scam',
    weight: 50,
    patterns: ['cheque', 'bank guaranteed', 'clears in', 'proof of payment attached'],
    explanation: 'Fraudulent cheque or fake proof-of-payment detected.'
  },

  // --- Category: Advance Fee Fraud ---
  {
    id: 'advance_fee_insurance',
    category: 'advance_fee',
    weight: 60,
    patterns: ['insurance fee', 'refundable fee', 'holding fee', 'security deposit', 'release fee', 'clearance fee', 'activation fee'],
    explanation: 'Request for advance payment or "insurance" before a transaction is a definitive scam indicator.'
  },
  {
    id: 'overpayment_refund',
    category: 'advance_fee',
    weight: 45,
    patterns: ['accidentally paid', 'overpaid', 'refund the difference', 'send the change', 'overpaid by mistake'],
    explanation: 'Overpayment scam pattern detected. Never refund cash to a driver or agent.'
  },

  // --- Category: Phishing & Impersonation ---
  {
    id: 'fake_verification',
    category: 'phishing',
    weight: 70,
    patterns: ['verify account', 'account blocked', 'login here', 'security update', 'click here', 'confirm payment via link', 'verification code', 'otp'],
    explanation: 'Phishing attempt detected. The platform will never ask for your login or OTP via chat.'
  },
  {
    id: 'platform_impersonation',
    category: 'impersonation',
    weight: 80,
    patterns: ['support team', 'exchange agent', 'official support', 'security department', 'payment staff', 'escrow manager'],
    explanation: 'Unauthorized attempt to impersonate platform staff.'
  },

  // --- Category: Urgency & Pressure ---
  {
    id: 'urgency_scam',
    category: 'urgency',
    weight: 15,
    patterns: ['urgent', 'immediately', 'now or never', 'send now', 'quick payment', 'fast release'],
    explanation: 'Artificial urgency used to bypass user caution.'
  }
];

const CO_OCCURRENCE_BOOSTS = [
  { terms: ['courier', 'insurance'], boost: 40 },
  { terms: ['whatsapp', 'payment'], boost: 25 },
  { terms: ['login', 'verify'], boost: 50 },
  { terms: ['overpaid', 'refund'], boost: 40 }
];

/**
 * Analyzes text for scam patterns with contextual scoring.
 * @param text The raw input text.
 * @param userTrustScore A value from 0-100 (higher = more trusted).
 */
export function detectScam(text: string, userTrustScore: number = 50): DetectionResult {
  const normalized = normalizeText(text);
  let score = 0;
  const matchedRules: string[] = [];
  const reasons: string[] = [];
  const ruleWeights: Record<string, number> = {};

  SCAM_RULES.forEach(rule => {
    const hasPattern = rule.patterns.some(p => normalized.includes(p));
    if (hasPattern) {
      score += rule.weight;
      matchedRules.push(rule.id);
      reasons.push(rule.explanation);
      ruleWeights[rule.id] = rule.weight;
    }
  });

  // Apply contextual boosts
  CO_OCCURRENCE_BOOSTS.forEach(boost => {
    if (boost.terms.every(term => normalized.includes(term))) {
      score += boost.boost;
      reasons.push(`Dangerous combination: ${boost.terms.join(' + ')} detected.`);
    }
  });

  // Adjust score based on trust
  // New users (low trust) have scores inflated, trusted users have scores buffered.
  if (userTrustScore < 20) score += 15; // Penalty for brand new/unverified
  if (userTrustScore > 80) score -= 20; // Buffer for established verified users

  score = Math.max(0, Math.min(100, score));

  let action: DetectionAction = 'allow';
  let severity: Severity = 'none';

  if (score >= 85) {
    action = 'block';
    severity = 'critical';
  } else if (score >= 60) {
    action = 'hold';
    severity = 'high';
  } else if (score >= 30) {
    action = 'warn';
    severity = 'medium';
  } else if (score >= 1) {
    action = 'allow';
    severity = 'low';
  }

  return {
    score,
    action,
    severity,
    matchedRules,
    reasons: Array.from(new Set(reasons)),
    normalizedText: normalized,
    explanation: reasons.join(' '),
    audit: { ruleWeights }
  };
}
