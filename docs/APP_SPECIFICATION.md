# The Exchange | Master Application Specification
**Version:** 1.5.0 (AI-Hardened & Cost-Optimized)
**Jurisdiction:** South Africa (CIPC / POPIA / FICA Compliant)

## 1. Project Mission
"The Exchange" is a high-trust, premium marketplace designed to eliminate commerce fraud in South Africa. It serves both individual P2P traders and professional "Bulk Lot" business sellers.

---

## 2. Technical Stack
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS + ShadCN UI (Custom Blue/Aqua/Orange theme)
- **Backend:** Firebase (Auth, Firestore, Storage)
- **AI Engine:** Genkit 1.x (Google Generative AI)
- **Model Strategy:** Multi-Tier Fallback
    1. **Primary:** `gemini-1.5-flash-8b` (Cost-Efficiency)
    2. **Secondary:** `gemini-1.5-flash` (Performance)
    3. **Tertiary:** `gemini-1.5-pro` (Complexity / Fail-safe)

---

## 3. Core Business Logic

### 3.1. Protected Payment Hold (Escrow)
- **Trigger:** Buyer initiates checkout via Capitec Pay/EFT/Card.
- **Hold:** Funds are captured but restricted in platform escrow.
- **Release:** Requires dual-confirmation:
    1. **Meetup Arrival:** Both parties must be tracked within 200m of a SAPS Safe Zone.
    2. **Buyer Release:** Manual confirmation of item condition post-inspection.

### 3.2. Auction House Mechanics
- **Timed Auctions:** Listings have a strict `auctionEndDate`.
- **Bid Increments:** Managed via Firestore non-blocking updates.
- **Winner Selection:** Highest bidder at expiry initiates the `pending_meetup` state.

### 3.3. Founding 100 Program
- **Scarcity Logic:** First 100 verified sellers receive:
    - R0 Listing Fees.
    - Permanent "Founding Member" profile badge.
    - Complimentary "Featured" boost on all listings.

---

## 4. AI Security Architecture

### 4.1. Tiered Scam Detection (Falcon Engine)
1. **Layer 1 (Rule-Based):** RegEx and pattern matching for off-platform redirection (e.g., "WhatsApp me").
2. **Layer 2 (Risk Scoring):** Weighted scoring (+15 for numbers, +40 for bank terms).
3. **Layer 3 (AI Intent):** Gemini 1.5 Flash 8B analyzes deep context (Social Engineering detection).
4. **Layer 4 (Moderation):** Automatic `block` or `hold` based on Layer 3 verdict.

### 4.2. Biometric KYC (4-Pillar Verification)
- **Pillar 1:** Phone Auth (RSA Mobile Network).
- **Pillar 2:** ID Document Scan (OCR & Tamper detection).
- **Pillar 3:** Biometric Liveness (Selfie vs. ID Photo comparison via AI).
- **Pillar 4:** Proof of Residence (FICA compliance).

---

## 5. Live Meetup & Vehicle Tracker
- **Mechanism:** Haversine distance calculation between Buyer/Seller and Safe Zone.
- **UI:** Real-time proximity markers and ETA calculation.
- **Safety Feature:** "Safe-Home" tracker monitors movement for 30 mins post-trade.

---

## 6. Firestore Schema (Entities)

### `userProfiles/{userId}`
- `isIdVerified`: boolean
- `reliabilityScore`: number (0-100)
- `transactionsCompleted`: number
- `isFoundingMember`: boolean

### `publicListings/{listingId}`
- `status`: `available` | `auction_active` | `pending_meetup` | `sold`
- `isAuction`: boolean
- `isBulk`: boolean
- `price`: number
- `highestBid`: number

### `systemErrors/{errorId}`
- `aiResolution`: { rootCause, suggestedFix, severity }
- `status`: `new` | `analyzed` | `resolved`

---

## 7. Cost Optimization Strategy
1. **Model Selection:** Default all flows to `gemini-1.5-flash-8b`.
2. **Caching:** Market Insights and static AI analysis are cached in `localStorage` for 1 hour.
3. **Storage:** Mandatory client-side image compression (max 1200px) before Firebase Storage upload.
