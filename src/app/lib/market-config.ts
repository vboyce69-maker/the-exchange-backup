/**
 * @fileOverview Centralized Marketplace Configuration.
 * Defines the parameters for the Founding 1000 program and standard fees.
 */

export const MARKET_CONFIG = {
  FOUNDING_LIMIT: 1000,
  SIMULATED_FILLED_SLOTS: 0, // Reset to 0 to start counter at 1000
  STANDARD_LISTING_FEE: 20.00, // R20.00 for non-founding members
  CURRENCY: 'ZAR',
  PROTECTED_HOLD_FEE_PERCENT: 5, // 5% fee for escrow services
};

export function isFoundingSlotAvailable(currentCount: number): boolean {
  return currentCount < MARKET_CONFIG.FOUNDING_LIMIT;
}
