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
  action: 'allow' | 'warn' | 'flag' | 'block';
  normalizedText: string;
  explanation: string;
}

const SYMBOL_MAP: Record<string, string> = {
  '@': 'a', '4': 'a', '3': 'e', '1': 'i', '!': 'i', '0': 'o', '5': 's', '$': 's', '7': 't', '8': 'b',
};

/**
 * Normalizes text to defeat obfuscation.
 */
export function normalizeText(text: string): string {
  let normalized = text.toLowerCase();
  
  // 1. Replace symbols with letters
  Object.entries(SYMBOL_MAP).forEach(([symbol, letter]) => {
    normalized = normalized.split(symbol).join(letter);
  });

  // 2. Remove punctuation and special chars
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');

  // 3. Join spaced out words (e.g., w h a t s a p p -> whatsapp)
  // We look for sequences of single letters separated by spaces
  normalized = normalized.replace(/\b([a-z])\s+(?=[a-z]\b)/g, '$1');

  // 4. Collapse multiple spaces
  normalized = normalized.trim().replace(/\s+/g, ' ');

  return normalized;
}

export const SCAM_RULES: ScamRule[] = [
  {
    id: 'courier_cheque',
    category: 'courier_scam',
    weight: 4,
    patterns: ['courier', 'cheque', 'driver', 'collect', 'pickup', 'delivery man'],
    explanation: 'Requests for courier collection often involve fake payment or insurance fees.'
  },
  {
    id: 'insurance_fees',
    category: 'fee_scam',
    weight: 5,
    patterns: ['insurance fee', 'refundable', 'clearance', 'release fee', 'activation fee', 'holding fee'],
    explanation: 'Asking for "refundable" fees before a sale is a classic advance-fee fraud.'
  },
  {
    id: 'phishing_account',
    category: 'phishing',
    weight: 8,
    patterns: ['account blocked', 'login here', 'verify account', 'security update', 'click here'],
    explanation: 'Attempts to redirect users to fake login pages to steal credentials.'
  },
  {
    id: 'off_platform',
    category: 'redirect',
    weight: 3,
    patterns: ['whatsapp', 'telegram', 'email', 'phone number', 'call me', 'chat off app', 'insta'],
    explanation: 'Scammers prefer moving to unmonitored platforms like WhatsApp.'
  },
  {
    id: 'payment_first',
    category: 'eft_scam',
    weight: 6,
    patterns: ['eft first', 'bank transfer', 'pay before', 'deposit needed', 'immediate transfer', 'capitec pay now'],
    explanation: 'Requests for immediate payment before meeting are high risk.'
  },
  {
    id: 'suspicious_links',
    category: 'links',
    weight: 7,
    patterns: ['bitly', 'tinyurl', 'http', 'https', 'www', 'link', 'qr code'],
    explanation: 'Suspicious links often lead to phishing or malware.'
  },
  {
    id: 'urgency',
    category: 'social_engineering',
    weight: 2,
    patterns: ['urgent', 'fast', 'quick', 'today only', 'immediately', 'now or never', 'emergency'],
    explanation: 'Creating artificial urgency prevents victims from thinking clearly.'
  }
];

const CO_OCCURRENCE_BOOSTS = [
  { terms: ['courier', 'insurance'], boost: 5 },
  { terms: ['whatsapp', 'payment'], boost: 4 },
  { terms: ['urgent', 'link'], boost: 5 },
  { terms: ['bank', 'code'], boost: 6 }
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
      reasons.push(`Dangerous combination detected: ${boost.terms.join(' + ')}`);
    }
  });

  let action: 'allow' | 'warn' | 'flag' | 'block' = 'allow';
  let severity: DetectionResult['severity'] = 'none';

  if (score >= 7) {
    action = 'block';
    severity = 'critical';
  } else if (score >= 4) {
    action = 'flag';
    severity = 'high';
  } else if (score >= 1) {
    action = 'warn';
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
