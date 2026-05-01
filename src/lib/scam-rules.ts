/**
 * @fileOverview Production-Grade Scam Detection Engine
 * Implements normalization, weighted pattern matching, and contextual risk scoring.
 * Aligned with Seller Onboarding API Spec (v1).
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

export function normalizeText(text: string): string {
  if (!text) return '';
  let normalized = text.toLowerCase();
  Object.entries(SYMBOL_MAP).forEach(([symbol, letter]) => {
    normalized = normalized.split(symbol).join(letter);
  });
  normalized = normalized.replace(/[^a-z0-9\s]/g, '');
  normalized = normalized.replace(/(.)\1{2,}/g, '$1$1');
  let prev;
  do {
    prev = normalized;
    normalized = normalized.replace(/\b([a-z0-9])\s+([a-z0-9])\b/gi, '$1$2');
  } while (normalized !== prev);
  return normalized.trim().replace(/\s+/g, ' ');
}

export const SCAM_RULES: ScamRule[] = [
  {
    id: 'strict_phone_numbers',
    category: 'off_platform',
    weight: 95,
    patterns: ['whatsapp', 'call me', 'number is', 'dm me', 'contact me', 'phone', 'cell', 'mobile', '+27', '072', '082', '071', '073', '074', '076', '078', '079', '081', '083', '084', '060', '061', '062', '063', '064', '065'],
    explanation: 'Sharing contact details is prohibited. Keep discussions inside The Exchange for protection.'
  },
  {
    id: 'social_media',
    category: 'off_platform',
    weight: 95,
    patterns: ['facebook', 'instagram', 'twitter', 'tiktok', 'linkedin', 'snapchat', 'fbme', 'wa.me', 'insta', 'messenger', 'x.com', 't.me'],
    explanation: 'Off-platform links are blocked to maintain verified trade logs and prevent fraud.'
  },
  {
    id: 'urgency_scam',
    category: 'urgency',
    weight: 60,
    patterns: ['urgent sale', 'must go today', 'moving tomorrow', 'no time wasters', 'payment before viewing', 'deposit to secure', 'first come first serve', 'cash only today'],
    explanation: 'High-urgency language and requests for deposits before viewing are common scam indicators.'
  },
  {
    id: 'external_payment',
    category: 'advance_fee',
    weight: 80,
    patterns: ['bank transfer', 'eft', 'cash send', 'instant money', 'pay me direct', 'deposit first', 'direct payment'],
    explanation: 'Direct payment requests bypass our Protected Hold. Never pay outside the app.'
  },
  {
    id: 'courier_scam',
    category: 'courier_scam',
    weight: 45,
    patterns: ['courier', 'driver', 'collect', 'pickup', 'agent', 'delivery man', 'paxi', 'aramex'],
    explanation: 'Potential courier scam detected. Always meet at Safe Zones for physical item trades.'
  }
];

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

  if (userTrustScore < 30) {
    score += 15;
    matchedRules.push('low_trust_penalty');
    reasons.push('Risk flag: Interaction with a low-trust or unverified account.');
  }

  score = Math.max(0, Math.min(100, score));

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
