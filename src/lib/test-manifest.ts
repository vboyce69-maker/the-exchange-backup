/**
 * @fileOverview Comprehensive Test Manifest for QA Testing Agent.
 * Defines scenarios for KYC, Scam Detection, Location Tracking, and Auth Stress Testing.
 */

export const TEST_SUITES = {
  KYC_VERIFICATION: [
    { id: "USER_A", name: "Valid ID + Selfie Match", input: "valid_rsa_id_match", expected: "APPROVED" },
    { id: "USER_B", name: "Expired ID", input: "expired_id", expected: "REJECTED (KYC_002)" },
    { id: "USER_C", name: "Selfie Mismatch", input: "id_selfie_mismatch", expected: "REJECTED + MANUAL_REVIEW" },
    { id: "USER_D", name: "Duplicate Identity", input: "existing_id_record", expected: "DUPLICATE_IDENTITY" },
    { id: "USER_E", name: "Blurry Image", input: "corrupt_data", expected: "RETRY_PROMPT" },
    { id: "USER_F", name: "Unsupported Country", input: "foreign_id", expected: "GRACEFUL_REJECTION" },
    { id: "USER_G", name: "KYC Bypass Attempt", input: "direct_listing_navigation", expected: "REDIRECT_BLOCK" }
  ],
  SCAM_DETECTION: [
    { id: "PRICE_ANOMALY", name: "90% Below Market", input: "R100 for MacBook Pro", expected: "PRICE_ANOMALY_ALERT" },
    { id: "SPAM_FLOOD", name: "10 listings in 60s", input: "velocity_attack", expected: "SPAM_FLOOD_BLOCK" },
    { id: "NLP_PHRASES", name: "Scam Phrasing", input: "send deposit first via Western Union", expected: "NLP_SCAM_FLAG" },
    { id: "OCR_BYPASS", name: "Embedded Phone in Image", input: "image_with_072_text", expected: "OCR_CONTACT_BYPASS_ALERT" },
    { id: "NEW_ACCOUNT_RISK", name: "New Account High Value", input: "$2000 item by <24h user", expected: "NEW_ACCOUNT_HIGH_VALUE_FLAG" }
  ],
  MEETUP_TRACKER: [
    { id: "MID_SESSION_DISABLE", name: "Location Disabled Mid-Session", expected: "PARTNER_ALERT" },
    { id: "GPS_SPOOF", name: "Coordinates Spoofing (>200km/h)", expected: "LOCATION_SPOOF_DETECTED" },
    { id: "EARLY_COMPLETION", name: "Pre-Arrival Completion", expected: "EARLY_COMPLETION_WARNING" },
    { id: "NETWORK_DROP", name: "Reconnection Grace", expected: "RECONNECT_NO_CRASH" }
  ],
  AUTH_SECURITY: [
    { id: "BRUTE_FORCE", name: "1,000 Login Attempts", expected: "LOCK_AFTER_5" },
    { id: "JWT_REUSE", name: "Expired Token Reuse", expected: "401_UNAUTHORIZED" },
    { id: "IMPOSSIBLE_TRAVEL", name: "JHB to London in 5 mins", expected: "SUSPICIOUS_LOGIN_ALERT" }
  ]
};

export const GOLDEN_SCENARIOS = [
  {
    id: "GS_01_KYC_SUCCESS",
    name: "Full Biometric Onboarding",
    flow: "/verify",
    actions: ["Enter Name", "Upload ID", "Face Scan"],
    expectedResult: "isIdVerified = true"
  }
];

export const SYNTHETIC_EDGE_CASES = {
  malformed_bids: [
    { value: -100, reason: "Negative value rejection" }
  ],
  behavioral_anomalies: [
    { type: "VELOCITY", description: "10 listings created in 60 seconds", threshold: "HIGH" },
    { type: "IMPOSSIBLE_TRAVEL", description: "Login from Johannesburg then London in 5 mins", threshold: "CRITICAL" }
  ]
};
