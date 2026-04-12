# Technical Specification & Requirements
**Project:** The Exchange | Premium Verified Marketplace
**Version:** 1.0.0 (AI-Ready Build)

## 1. Functional Requirements
- **Authentication**: Phone-based OTP with Firebase Auth for sybil-attack prevention.
- **KYC**: Multi-step biometric verification using Genkit AI.
- **Escrow**: "Protected Payment Hold" logic where funds are restricted until dual meetup confirmation.
- **Auctions**: Real-time bidding with automated bid increments and "Ending Soon" prioritization.
- **Liquidity Optimization**: AI-driven "Seller Demand Insights" to guide listing volume.

## 2. Non-Functional Requirements
- **Security**: POPIA and CPA compliance for all data handling.
- **Resilience**: Handle 3G/Low-signal scenarios with persistent local caching.
- **Reliability**: Behavioral Risk Analysis (EDR/XDR) to prevent bots and scams.

## 3. Data Integrity Roadmap
All document paths follow the structure defined in `backend.json`. The AI agent must verify the following critical constraints:
- `highestBid` MUST always be > `price` in an active auction.
- `status` transitions: `available` -> `pending_meetup` -> `sold`.
- `reliabilityScore` is calculated based on successful meetup-to-sale conversion ratios.