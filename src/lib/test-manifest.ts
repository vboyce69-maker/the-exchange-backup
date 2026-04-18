/**
 * @fileOverview Test Manifest for AI Generative Testing Agents.
 * Defines Golden Scenarios and Sophisticated Synthetic Edge Case Data for Security.
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
  },
  {
    id: "GS_03_SAFE_MEETUP",
    name: "Secure Arrival Confirmation",
    flow: "/messages",
    actions: ["Mark as Arrived", "Confirm Safe Home"],
    expectedResult: "Escrow Release Triggered"
  }
];

export const SYNTHETIC_EDGE_CASES = {
  malformed_bids: [
    { value: -100, reason: "Negative value rejection" },
    { value: "999.999.999", reason: "Multiple decimal point sanitization" },
    { value: 0.000001, reason: "Sub-cent bid floor enforcement" }
  ],
  sophisticated_scam_phrases: [
    "I'll send a courier with a cheque, just pay the insurance of R500 first",
    "Account blocked! Log in here to verify: bit.ly/fake-exchange-login",
    "Please send your W-H-A-T-S-A-P-P number for faster payment",
    "I am paying R2000 extra for the laptop, please send the change to my driver",
    "Payment successful. See Proof of Payment at [image-url-link]"
  ],
  behavioral_anomalies: [
    { type: "VELOCITY", description: "10 listings created in 60 seconds", threshold: "HIGH" },
    { type: "IMPOSSIBLE_TRAVEL", description: "Login from Johannesburg then London in 5 mins", threshold: "CRITICAL" },
    { type: "PRICE_MANIPULATION", description: "Listing price dropped from R10000 to R100 before auction close", threshold: "HIGH" },
    { type: "PAYLOAD_INJECTION", description: "<script>alert('hack')</script> detected in description", threshold: "BLOCK" }
  ],
  network_failure: {
    scenario: "Connection drop during payment authorization",
    expectedBehavior: "Permanent offline banner + bid freezing"
  }
};
