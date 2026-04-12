/**
 * @fileOverview Advanced Scam Detection Logic
 * Reusable core module for Marketplace Security.
 */

export interface ScamRule {
  id: string;
  category: string;
  weight: number;
  patterns: string[];
  explanation: string;
}

export interface DetectionResult {
  score: number;
  blocked: boolean;
  severity: 'none' | 'low' | 'medium' | 'high' | 'critical';
  matchedRules: string[];
  reasons: string[];
  action: 'allow' | 'allow_with_warning' | 'hold_for_review' | 'block';
  normalizedText: string;
  explanation: string;
}

const SYMBOL_MAP: Record<string, string> = {
  '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '8': 'b',
};

/**
 * Normalizes text to defeat sophisticated obfuscation.
 */
export function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // 1. Replace symbols with letters
  Object.entries(SYMBOL_MAP).forEach(([symbol, letter]) => {
    normalized = normalized.split(symbol).join(letter);
  });

  // 2. Remove punctuation and special chars (keeping spaces temporarily)
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');

  // 3. Join spaced out words (e.g., w h a t s a p p -> whatsapp)
  let prev;
  do {
    prev = normalized;
    normalized = normalized.replace(/\b([a-z])\s+([a-z])\b/gi, '$1$2');
  } while (normalized !== prev);

  // 4. Collapse multiple spaces and trim
  normalized = normalized.trim().replace(/\s+/g, ' ');

  return normalized;
}

export const SCAM_RULES: ScamRule[] = [
  {
    id: 'courier_cheque',
    category: 'fake_courier_pickup',
    weight: 25,
    patterns: ['courier', 'cheque', 'driver', 'collect', 'pickup', 'delivery man'],
    explanation: 'Requests for courier collection or third-party drivers are high risk in peer-to-peer trades.'
  },
  {
    id: 'insurance_fees',
    category: 'fee_scam',
    weight: 30,
    patterns: ['insurance', 'refundable', 'clearance', 'release fee', 'activation fee', 'holding fee'],
    explanation: 'Advance-fee fraud indicator detected. Scammers often request small "insurance" payments before meeting.'
  },
  {
    id: 'phishing_link',
    category: 'phishing_verification_link',
    weight: 40,
    patterns: ['login here', 'verify account', 'security update', 'click here', 'bitly', 'tinyurl', 'qr code'],
    explanation: 'Suspicious redirect or verification request detected. Never enter your credentials on external links.'
  },
  {
    id: 'overpayment',
    category: 'overpayment_refund',
    weight: 45,
    patterns: ['accidentally paid', 'overpaid', 'refund the difference', 'send the change', 'driver change'],
    explanation: 'Classic overpayment scam pattern. Scammers pretend to overpay via fake Proof of Payment and ask for a cash refund.'
  },
  {
    id: 'off_platform',
    category: 'off_platform_redirect',
    weight: 20,
    patterns: ['whatsapp', 'telegram', 'watsapp', 'whatsap', 'phone number', 'insta', 'message me on'],
    explanation: 'Attempt to move communication off-platform to avoid security monitoring.'
  },
  {
    id: 'bank_otp',
    category: 'bank_detail_or_code_request',
    weight: 60,
    patterns: ['otp', 'one time pin', 'verification code', 'bank details', 'reflect later', 'pop attached'],
    explanation: 'Direct request for sensitive banking/OTP data. This is a high-severity fraud indicator.'
  },
  {
    id: 'urgency',
    category: 'urgent_release_of_goods',
    weight: 15,
    patterns: ['urgent', 'immediately', 'now or never', 'release item', 'fast payment', 'send now'],
    explanation: 'High pressure social engineering used to bypass your natural caution.'
  }
];

const CO_OCCURRENCE_BOOSTS = [
  { terms: ['courier', 'insurance'], boost: 35 },
  { terms: ['payment', 'urgent'], boost: 30 },
  { terms: ['overpaid', 'refund'], boost: 40 },
  { terms: ['login', 'link'], boost: 45 },
  { terms: ['whatsapp', 'payment'], boost: 25 },
  { terms: ['bank', 'otp'], boost: 60 }
];

export function detectScamText(text: string): DetectionResult {
  const normalized = normalizeText(text);
  let score = 0;
  const matchedRules: string[] = [];
  const reasons: string[] = [];

  SCAM_RULES.forEach(rule => {
    const hasPattern = rule.patterns.some(p => normalized.includes(p));
    if (hasPattern) {
      score += rule.weight;
      matchedRules.push(rule.id);
      reasons.push(rule.explanation);
    }
  });

  // Apply boosts for dangerous combinations
  CO_OCCURRENCE_BOOSTS.forEach(boost => {
    if (boost.terms.every(term => normalized.includes(term))) {
      score += boost.boost;
      reasons.push(`High-Risk Combination: ${boost.terms.join(' + ')} detected.`);
    }
  });

  // Decisions based on 0-100 scale
  let action: DetectionResult['action'] = 'allow';
  let severity: DetectionResult['severity'] = 'none';

  if (score >= 80) {
    action = 'block';
    severity = 'critical';
  } else if (score >= 60) {
    action = 'hold_for_review';
    severity = 'high';
  } else if (score >= 30) {
    action = 'allow_with_warning';
    severity = 'medium';
  } else if (score >= 1) {
    action = 'allow';
    severity = 'low';
  }

  return {
    score,
    blocked: action === 'block',
    severity,
    matchedRules,
    reasons: Array.from(new Set(reasons)),
    action,
    normalizedText: normalized,
    explanation: reasons.join(' ')
  };
}
