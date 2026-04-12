/**
 * @fileOverview Test Manifest for AI Generative Testing Agents.
 * Defines Golden Scenarios and Synthetic Edge Case Data.
 */

export const GOLDEN_SCENARIOS = [
  {
    id: "GS_01_KYC_SUCCESS",
    name: "Full Biometric Onboarding",
    flow: "/verify",
    actions: ["Enter Name", "Upload ID", "Face Scan"],
    expectedResult: "isIdVerified = true"
  },
  {
    id: "GS_02_AUCTION_BID",
    name: "Competitive Bidding Flow",
    flow: "/listings/[id]",
    actions: ["Check Status", "Enter Valid Bid", "Confirm Bid"],
    expectedResult: "highestBidderId = currentUser.uid"
  }
];

export const SYNTHETIC_EDGE_CASES = {
  malformed_bids: [
    { value: -100, reason: "Negative value" },
    { value: "999.999.999", reason: "Multiple decimal points" }
  ],
  scam_phrases: [
    "WhatsApp me at 082...",
    "Pay deposit via E-Wallet first",
    "Send me your CVV for verification"
  ],
  network_failure: {
    scenario: "Connection drop during payment authorization",
    expectedBehavior: "Permanent offline banner + retry logic"
  }
};