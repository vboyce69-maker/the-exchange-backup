/**
 * @fileOverview Comprehensive Test Manifest for QA Testing Agent.
 * Defines scenarios for KYC, Scam Detection, Location Tracking, and Auth Stress Testing.
 * Optimized for the Elite QA Retry Agent.
 */

export const TEST_SUITES = {
  KYC_VERIFICATION: [
    {
      id: "GS_01_KYC",
      name: "Valid ID + Selfie Match",
      input: "valid_rsa_id_match",
      expected: "APPROVED",
    },
    {
      id: "KYC_RACE_CONDITION",
      name: "Concurrent Duplicate ID Submission",
      input: "double_post_id",
      expected: "CONSISTENCY_CHECK_PASSED",
    },
    {
      id: "KYC_002_RETRY",
      name: "Expired ID (Retry Run)",
      input: "expired_id",
      expected: "REJECTED (KYC_002)",
    },
    {
      id: "KYC_MIME_BYPASS",
      name: "Executable Disguised as JPG",
      input: "malformed_mime",
      expected: "REJECTED_SANITIZE",
    },
    {
      id: "KYC_TIMEOUT_STRESS",
      name: "OCR Service Latency (>5s)",
      input: "slow_ocr_response",
      expected: "ASYNC_STABLE",
    },
  ],
  SCAM_DETECTION: [
    {
      id: "LEETSPEAK_EVASION",
      name: "Leetspeak Detection",
      input: "W3st3rn Un10n - s3nd d3p0sit",
      expected: "NLP_SCAM_FLAG",
    },
    {
      id: "UNICODE_MASKING",
      name: "Unicode Invisible Chars",
      input: "W\u200BhatsA\u200Bpp m\u200Be",
      expected: "SCAM_FLAG_HIGH",
    },
    {
      id: "IMAGE_OCR_RETRY",
      name: "Rotated Text in Photo",
      input: "rotated_phone_number_image",
      expected: "OCR_FLAG_SUCCESS",
    },
    {
      id: "COURIER_STORY_AI",
      name: "Social Engineering Intent",
      input: "I am sending a courier to collect",
      expected: "HOLD_FOR_REVIEW",
    },
  ],
  MEETUP_TRACKER: [
    {
      id: "GPS_GRADUAL_DRIFT",
      name: "Gradual GPS Drift Spoof",
      expected: "SPOOF_DETECTED_ANOMALY",
    },
    {
      id: "MOCK_PROVIDER_INJECTION",
      name: "Fake GPS App Simulation",
      expected: "HARD_BLOCK_PROVIDER",
    },
    {
      id: "SESSION_HARD_STOP",
      name: "Server-side Session Termination",
      expected: "ZERO_LOCATION_RETENTION",
    },
    {
      id: "RAPID_JUMP_RETRY",
      name: "Realistic Pause/Jump Pattern",
      expected: "TRAJECTORY_VALIDATED",
    },
  ],
  AUTH_VERIFICATION: [
    {
      id: "SMS_TARGET_ZA_01",
      name: "RSA Phone OTP Handshake",
      input: "+27614304746",
      expected: "INITIATION_SUCCESS",
    },
    {
      id: "SMS_RETRY_BACKOFF",
      name: "Rapid OTP Request Throttling",
      input: "+27614304746",
      expected: "429_TOO_MANY_REQUESTS",
    },
    {
      id: "INVALID_FORMAT_REJECTION",
      name: "Malformed ZA Number Rejection",
      input: "012345",
      expected: "FORMAT_ERROR",
    },
  ],
  STRESS_LOAD: [
    {
      id: "LOAD_100K_CONCURRENT",
      name: "100,000 Concurrent Users",
      expected: "API_LATENCY_PEAK",
    },
    {
      id: "BURST_10X_SPIKE",
      name: "10x Traffic Spike in 30s",
      expected: "AUTOSCALE_TRIGGER",
    },
    {
      id: "LONG_TAIL_CONCURRENCY",
      name: "72-Hour Continuous Load",
      expected: "MEMORY_LEAK_ZERO",
    },
  ],
  SECURITY_ADVERSARIAL: [
    {
      id: "SQL_INJECTION_CHAT",
      name: "SQLi via Chat Input",
      input: "' OR 1=1 --",
      expected: "INPUT_SANITIZED",
    },
    {
      id: "XSS_LISTING_DESCRIPTION",
      name: "XSS via Listing Description",
      input: "<script>alert('xss')</script>",
      expected: "BLOCKED_BY_CONTENT_POLICY",
    },
    {
      id: "AUTH_TOKEN_REPLAY",
      name: "JWT Reuse Simulation",
      expected: "401_UNAUTHORIZED",
    },
    {
      id: "API_RATE_LIMIT_BYPASS",
      name: "Rapid API Exhaustion",
      expected: "429_TOO_MANY_REQUESTS",
    },
  ],
  DATA_INTEGRITY: [
    {
      id: "DUPLICATE_PAYMENT_INIT",
      name: "Simultaneous Payment Click",
      expected: "IDEMPOTENCY_LOCK",
    },
    {
      id: "RACE_CONDITION_BID",
      name: "Last-Second simultaneous Bid",
      expected: "ATOMIC_BID_STABLE",
    },
    {
      id: "LOST_MESSAGE_SYNC",
      name: "Offline Sync Verification",
      expected: "PERSISTENT_SYNC_RECOVERY",
    },
  ],
};

export const GOLDEN_SCENARIOS = [
  {
    id: "GS_01_KYC_SUCCESS",
    name: "Full Biometric Onboarding",
    flow: "/verify",
    actions: ["Enter Name", "Upload ID", "Face Scan"],
    expectedResult: "isIdVerified = true",
  },
];
