/**
 * @fileOverview Centralized Marketplace Configuration.
 * Defines the parameters for the Founding 100 program, fees, and trust limits.
 * Aligned with Seller Onboarding API Spec (v1).
 */

export const MARKET_CONFIG = {
  FOUNDING_LIMIT: 100,
  SIMULATED_FILLED_SLOTS: 0,
  STANDARD_LISTING_FEE: 20.0,
  FOUNDING_MEMBER_FEE: 0.0,
  CURRENCY: "ZAR",
  PROTECTED_HOLD_FEE_PERCENT: 5,

  // LIMIT CONTROL RULES
  LIMITS: {
    UNVERIFIED: 3,
    VERIFIED_INDIVIDUAL: 10,
    VERIFIED_BUSINESS: 99999, // Unlimited
  },

  // TRUST & SECURITY WEIGHTS
  BASE_TRUST_SCORE: 50,
  WEIGHTS: {
    ID_VERIFIED: 20,
    PHONE_VERIFIED: 10,
    BUSINESS_VERIFIED: 30,
    SUSPICIOUS_IP_PENALTY: -30,
    SCAM_PATTERN_PENALTY: -50,
  },

  // RISK ENGINE THRESHOLDS
  RISK_THRESHOLD: {
    BLOCK: 70,
    LIMIT: 40,
  },
};

export function getListingLimit(profile: any): number {
  if (!profile) return MARKET_CONFIG.LIMITS.UNVERIFIED;

  // Founding Members (verified early) unlock unlimited listings
  if (profile.isFoundingMember && profile.kycStatus === "verified") {
    return MARKET_CONFIG.LIMITS.VERIFIED_BUSINESS;
  }

  if (profile.sellerType === "business" && profile.kycStatus === "verified") {
    return MARKET_CONFIG.LIMITS.VERIFIED_BUSINESS;
  }
  if (profile.kycStatus === "verified") {
    return MARKET_CONFIG.LIMITS.VERIFIED_INDIVIDUAL;
  }
  return MARKET_CONFIG.LIMITS.UNVERIFIED;
}

export function calculateTrustScore(profile: any): number {
  let trust = MARKET_CONFIG.BASE_TRUST_SCORE;

  if (!profile) return trust;

  if (profile.isIdVerified || profile.idVerified)
    trust += MARKET_CONFIG.WEIGHTS.ID_VERIFIED;
  if (profile.phoneVerified || profile.phone)
    trust += MARKET_CONFIG.WEIGHTS.PHONE_VERIFIED;

  const isBusinessVerified =
    (profile.sellerType === "business" && profile.kycStatus === "verified") ||
    profile.businessVerified;

  if (isBusinessVerified) {
    trust += MARKET_CONFIG.WEIGHTS.BUSINESS_VERIFIED;
  }

  if (profile.riskScore > 50) trust -= 40;

  return Math.max(0, Math.min(100, trust));
}

export function isFoundingSlotAvailable(currentCount: number): boolean {
  return currentCount < MARKET_CONFIG.FOUNDING_LIMIT;
}
