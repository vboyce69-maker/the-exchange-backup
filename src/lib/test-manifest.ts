/**
 * @fileOverview Comprehensive Test Manifest for QA Testing Agent.
 * Defines scenarios for KYC, Scam Detection, Location Tracking, and Auth Stress Testing.
 * Optimized for the QA Retry Agent.
 */

export const TEST_SUITES = {
  KYC_VERIFICATION: [
    { id: "GS_01_KYC", name: "Valid ID + Selfie Match", input: "valid_rsa_id_match", expected: "APPROVED" },
    { id: "KYC_RACE_CONDITION", name: "Concurrent Duplicate ID Submission", input: "double_post_id", expected: "CONSISTENCY_CHECK_PASSED" },
    { id: "KYC_002_RETRY", name: "Expired ID (Retry Run)", input: "expired_id", expected: "REJECTED (KYC_002)" },
    { id: "KYC_MIME_BYPASS", name: "Executable Disguised as JPG", input: "malformed_mime", expected: "REJECTED_SANITIZE" },
    { id: "KYC_TIMEOUT_STRESS", name: "OCR Service Latency (>5s)", input: "slow_ocr_response", expected: "ASYNC_STABLE" }
  ],
  SCAM_DETECTION: [
    { id: "LEETSPEAK_EVASION", name: "Leetspeak Detection", input: "W3st3rn Un10n - s3nd d3p0sit", expected: "NLP_SCAM_FLAG" },
    { id: "UNICODE_MASKING", name: "Unicode Invisible Chars", input: "W\u200BhatsA\u200Bpp m\u200Be", expected: "SCAM_FLAG_HIGH" },
    { id: "IMAGE_OCR_RETRY", name: "Rotated Text in Photo", input: "rotated_phone_number_image", expected: "OCR_FLAG_SUCCESS" },
    { id: "AI_FALLBACK_STRESS", name: "AI Model Null Response Fallback", input: "model_timeout", expected: "RULE_BASED_TRIGGERED" }
  ],
  MEETUP_TRACKER: [
    { id: "GPS_GRADUAL_DRIFT", name: "Gradual GPS Drift Spoof", expected: "SPOOF_DETECTED_ANOMALY" },
    { id: "MOCK_PROVIDER_INJECTION", name: "Fake GPS App Simulation", expected: "HARD_BLOCK_PROVIDER" },
    { id: "SESSION_HARD_STOP", name: "Server-side Session Termination", expected: "ZERO_LOCATION_RETENTION" },
    { id: "RAPID_JUMP_RETRY", name: "Realistic Pause/Jump Pattern", expected: "TRAJECTORY_VALIDATED" }
  ],
  RELIABILITY_SCORE: [
    { id: "MICRO_TX_COLLUSION", name: "Micro-transaction Collusion", expected: "INFLATION_PREVENTED" },
    { id: "CIRCULAR_TRADING", name: "3-Account Circular Trade", expected: "AUDIT_LOG_FLAG" },
    { id: "RAPID_FAKE_REVIEWS", name: "Velocity Review Spike", expected: "ACCOUNT_TEMP_HOLD" }
  ],
  CRASH_LOAD: [
    { id: "LOAD_1500_CONCURRENT", name: "1,500 Concurrent Users", expected: "STABLE_LATENCY" },
    { id: "DB_WRITE_ROLLBACK", name: "Partial Transaction Failure", expected: "ATOMIC_ROLLBACK" },
    { id: "MIME_WHITELIST_BYPASS", name: ".jpg.exe Upload Attempt", expected: "SILENT_REJECT_LOG" }
  ],
  AUTH_SECURITY: [
    { id: "JWT_REUSE_RETRY", name: "Token Replay Attack", expected: "401_UNAUTHORIZED" },
    { id: "BRUTE_FORCE_RETRY", name: "Locked After 5 Failures", expected: "ACCOUNT_LOCK_ENFORCED" },
    { id: "FINGERPRINT_MISMATCH", name: "Session Hijack Simulation", expected: "STEP_UP_VERIFICATION" }
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
