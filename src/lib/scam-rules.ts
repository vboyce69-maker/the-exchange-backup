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
    weight: 95,
    patterns: [
      '060', '061', '062', '063', '064', '065', '066', '067', '068', '069',
      '070', '071', '072', '073', '074', '075', '076', '077', '078', '079',
      '080', '081', '082', '083', '084', '085', '086', '087', '088', '089',
      'plus27', '277', '276', '278', 'cell', 'mobile', 'whatsapp', 'call me',
      'number is', 'dm me', 'contact me', 'phone'
    ],
    explanation: 'Sharing phone numbers or contact details is strictly prohibited. Keep all communication within The Exchange for your safety.'
  },
  
  // --- Category: Social Media Blocking (+95 -> BLOCK) ---
  {
    id: 'strict_social_media',
    category: 'off_platform',
    weight: 95,
    patterns: [
      'facebook', 'instagram', 'twitter', 'tiktok', 'linkedin', 'snapchat', 
      'fbme', 'igme', 'wa.me', 'tme', 'xcom', 'messenger', 'insta', 'fb group',
      'my page', 'follow me', 'telegram'
    ],
    explanation: 'Social media links or profiles are blocked to prevent off-platform fraud and maintain verified trade logs.'
  },

  // --- Category: External Payment Request (+60) ---
  {
    id: 'external_payment',
    category: 'advance_fee',
    weight: 60,
    patterns: ['bank transfer', 'eft', 'capitec pay', 'ozow', 'cash send', 'instant money', 'pay me direct', 'outside the app', 'direct payment', 'deposit first'],
    explanation: 'Request for external payment detected. All payments must stay in Protected Hold.'
  },

  // --- Category: Courier & Collection Scams (+40) ---
  {
    id: 'courier_scam',
    category: 'courier_scam',
    weight: 40,
    patterns: ['courier', 'driver', 'collect', 'pickup', 'agent', 'delivery man', 'collection fee'],
    explanation: 'Potential courier scam detected. Always meet at Safe Zones for physical items.'
  }
];

/**
 * Analyzes text for scam patterns with Layer 2 scoring logic.
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
    action = 'block';
    severity = 'critical';
  } else if (score > 60) {
    action = 'hold';
    severity = 'high';
  } else if (score >= 30) {
    action = 'warn';
    severity = 'medium';
  } else {
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
