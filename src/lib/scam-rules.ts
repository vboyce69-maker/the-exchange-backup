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
  // --- Category: Strict Contact Blocking (+90 -> BLOCK) ---
  {
    id: 'strict_phone_numbers',
    category: 'off_platform',
    weight: 90,
    patterns: [
      '060', '061', '062', '063', '064', '065', '066', '067', '068', '069',
      '070', '071', '072', '073', '074', '075', '076', '077', '078', '079',
      '080', '081', '082', '083', '084', '085', '086', '087', '088', '089',
      'plus27', '277', '276', '278', 'cell', 'mobile', 'whatsapp'
    ],
    explanation: 'Phone numbers are strictly prohibited. Keep all communication within The Exchange for your safety.'
  },
  
  // --- Category: Social Media Blocking (+90 -> BLOCK) ---
  {
    id: 'strict_social_media',
    category: 'off_platform',
    weight: 90,
    patterns: [
      'facebook', 'instagram', 'twitter', 'tiktok', 'linkedin', 'snapchat', 
      'fbme', 'igme', 'wa.me', 'tme', 'xcom', 'messenger'
    ],
    explanation: 'Social media links or profiles are blocked to prevent off-platform fraud.'
  },

  // --- Category: External Payment Request (+40) ---
  {
    id: 'external_payment',
    category: 'advance_fee',
    weight: 40,
    patterns: ['bank transfer', 'eft', 'capitec pay', 'ozow', 'cash send', 'instant money', 'pay me direct', 'outside the app', 'direct payment', 'deposit first'],
    explanation: 'Request for external payment detected. This bypasses Protected Hold.'
  },

  // --- Category: Price Anomaly (+20) ---
  {
    id: 'price_anomaly',
    category: 'price_anomaly',
    weight: 20,
    patterns: ['discount 70', '70 off', 'half price', 'unbelievable deal', 'urgent sale price', 'way below market'],
    explanation: 'Price-related pressure or anomaly detected.'
  },

  // --- Category: Courier & Collection Scams ---
  {
    id: 'courier_scam',
    category: 'courier_scam',
    weight: 35,
    patterns: ['courier', 'driver', 'collect', 'pickup', 'agent', 'delivery man', 'collection fee'],
    explanation: 'Request for courier pickup often linked to fake payment scams.'
  },

  // --- Category: Phishing & High Risk ---
  {
    id: 'phishing',
    category: 'phishing',
    weight: 50,
    patterns: ['verify account', 'account blocked', 'login here', 'security update', 'click here', 'otp', 'verification code'],
    explanation: 'High-risk phishing attempt detected.'
  }
];

/**
 * Analyzes text for scam patterns with Layer 2 scoring logic.
 * @param text The raw input text.
 * @param userTrustScore A value from 0-100 (higher = more trusted). 
 *                       Scores < 20 represent "New Accounts".
 */
export function detectScam(text: string, userTrustScore: number = 50): DetectionResult {
  const normalized = normalizeText(text);
  let score = 0;
  const matchedRules: string[] = [];
  const reasons: string[] = [];
  const ruleWeights: Record<string, number> = {};

  // 1. Behavior Rule Match
  SCAM_RULES.forEach(rule => {
    const hasPattern = rule.patterns.some(p => normalized.includes(p));
    if (hasPattern) {
      score += rule.weight;
      matchedRules.push(rule.id);
      reasons.push(rule.explanation);
      ruleWeights[rule.id] = rule.weight;
    }
  });

  // 2. New Account Check (+10)
  if (userTrustScore < 20) {
    score += 10;
    matchedRules.push('new_account_penalty');
    reasons.push('Message from a new or unverified account.');
    ruleWeights['new_account_penalty'] = 10;
  }

  score = Math.max(0, Math.min(100, score));

  // 3. Threshold Logic
  let action: DetectionAction = 'allow';
  let severity: Severity = 'none';

  if (score >= 90) {
    // Critical score -> Immediate Block
    action = 'block';
    severity = 'critical';
  } else if (score > 60) {
    // High score -> send to AI analysis (Hold)
    action = 'hold';
    severity = 'high';
  } else if (score >= 30) {
    // Threshold 30–60 → warn user
    action = 'warn';
    severity = 'medium';
  } else {
    // Threshold < 30 → allow
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
