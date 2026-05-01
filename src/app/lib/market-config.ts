/**
 * @fileOverview Centralized Marketplace Configuration.
 * Defines the parameters for the Founding 1000 program, fees, and trust limits.
 */

export const MARKET_CONFIG = {
  FOUNDING_LIMIT: 1000,
  SIMULATED_FILLED_SLOTS: 0,
  STANDARD_LISTING_FEE: 20.00,
  CURRENCY: 'ZAR',
  PROTECTED_HOLD_FEE_PERCENT: 5,
  
  // TRUST & SECURITY LIMITS
  MAX_UNVERIFIED_LISTINGS: 3,
  BASE_TRUST_SCORE: 50,
  WEIGHTS: {
    ID_VERIFIED: 20,
    PHONE_VERIFIED: 10,
    EMAIL_VERIFIED: 10,
    SUSPICIOUS_IP_PENALTY: -30,
    SCAM_PATTERN_PENALTY: -50,
  },
  SCAM_THRESHOLD_BLOCK: 70,
  SCAM_THRESHOLD_FLAG: 40,
};

export function isFoundingSlotAvailable(currentCount: number): boolean {
  return currentCount < MARKET_CONFIG.FOUNDING_LIMIT;
}

export function calculateInitialTrust(verification: { phone: boolean; email: boolean; id: boolean }): number {
  let score = MARKET_CONFIG.BASE_TRUST_SCORE;
  if (verification.phone) score += MARKET_CONFIG.WEIGHTS.PHONE_VERIFIED;
  if (verification.email) score += MARKET_CONFIG.WEIGHTS.EMAIL_VERIFIED;
  if (verification.id) score += MARKET_CONFIG.WEIGHTS.ID_VERIFIED;
  return Math.min(100, score);
}
