# Technical Specification & Requirements
**Project:** The Exchange | Premium Verified Marketplace
**Version:** 1.2.0 (Identity Persistence & Storage Optimized)

## 1. Functional Requirements
- **Authentication**: Phone-based OTP with Firebase Auth for sybil-attack prevention.
- **KYC**: Multi-step biometric verification using Genkit AI.
- **Escrow**: "Protected Payment Hold" logic where funds are restricted until dual meetup confirmation.
- **Auctions**: Real-time bidding with automated bid increments and "Ending Soon" prioritization.
- **Liquidity Optimization**: AI-driven "Seller Demand Insights" to guide listing volume.

## 2. Infrastructure & Persistence Architecture
- **Public Assets**: Listing photos served via Firebase Storage with public read access.
- **Private KYC Data**: ID documents and selfies stored in a restricted `/kyc/{userId}/` path. Access is strictly controlled by Firebase Storage Security Rules.
- **Persistence Strategy**: User profiles are synchronized on every login between Auth and Firestore. Identity state (Verified/Unverified) is cached in real-time listeners for immediate cross-session availability.
- **Optimization**: Mandatory client-side resizing (Max 1200px width) for listing photos to reduce storage costs.

## 3. Cost Estimates (Blaze Plan)
- **Storage**: $0.026/GB (Estimated 200 listings per GB with compression).
- **AI Processing**: Gemini 1.5 Flash 8B prioritized for sub-cent per-request costs.
- **Egress**: $0.12/GB (Majority of traffic served via CDN caching).

## 4. Data Integrity Roadmap
All document paths follow the structure defined in `backend.json`. The AI agent must verify the following critical constraints:
- `highestBid` MUST always be > `price` in an active auction.
- `status` transitions: `available` -> `pending_meetup` -> `sold`.
- `reliabilityScore` is calculated based on successful meetup-to-sale conversion ratios.
- **Session Continuity**: All verified identity attributes must persist across device changes.
