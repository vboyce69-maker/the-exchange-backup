# The Exchange | Master Application Portfolio
**Version:** 1.8.0 (Production-Ready Technical Specification)
**Jurisdiction:** South Africa (CIPC, POPIA, CPA, and FICA Compliant)

---

## 1. Executive Summary
"The Exchange" is a high-trust, premium marketplace designed to eliminate commerce fraud in South Africa. By integrating biometric identity verification, AI-driven scam detection, and a proprietary "Protected Payout" escrow system, we provide a "Trust Layer" for both P2P traders and professional "Bulk Lot" business sellers.

## 2. Core Feature Set
- **Biometric KYC**: Multi-pillar verification (Phone, RSA ID validation, AI Face-Match).
- **Protected Payout Hold**: Funds are restricted in escrow until dual-confirmation at a SAPS Safe Zone.
- **AI Falcon Engine**: Real-time tiered scam detection for chat and listings.
- **Timed Auctions**: Secure bidding withFirestore-backed atomic updates.
- **Founding 100 Program**: Loyalty incentives for early-adopter verified sellers.
- **Live Meetup Tracker**: Real-time GPS distance calculation and "Safe-Home" monitoring.

## 3. Technical Architecture
- **Framework**: Next.js 15+ (App Router).
- **Styling**: Tailwind CSS + ShadCN UI (Custom Premium Blue/Aqua Theme).
- **Backend**: Firebase (Auth, Firestore, Storage, App Hosting).
- **AI Logic**: Genkit 1.x with Google Gemini 1.5 Flash (Optimized for cost and speed).

## 4. AI Security Logic (The Falcon Engine)

### 4.1. Tiered Chat Protection
Every message is passed through a three-layer filter:
1. **Rule-Based**: Normalizes text (handling leetspeak like "Wh4tsApp") and checks against known off-platform redirection patterns.
2. **Weighted Risk Scoring**: Assigns penalties for low-trust users or suspicious terminology.
3. **Genkit Intent Analysis**: Gemini 1.5 Flash analyzes the *intent* of flagged messages to differentiate between a "Courier Story" scam and a legitimate inquiry.

### 4.2. Biometric Verification Logic
The verification flow uses AI to compare a government-issued ID document against a live selfie:
- **Liveness Check**: Detecting digital masks or printed photo spoofs.
- **Facial Landmark Matching**: Comparing 100+ points on the face to ensure the person listing is the person on the ID.

## 5. Critical System Code

### 5.1. AI Scam Detection Flow
The platform utilizes a multi-stage validation hook that intercepts all user-generated content.

### 5.2. Secure Firestore Rules
Permissions are restricted so users can only access their own private data while maintaining public marketplace visibility for listings.

## 6. Intellectual Property & Trade Secrets
1. **The "Reliability Score" Algorithm**: Proprietary multi-factor weighting (GPS punctuality, trade volume, biometric status).
2. **Safe-Zone Arrival Prerequisite**: The unique business process of coupling GPS check-ins with escrow fund release.

---
*© 2026 The Exchange Marketplace (Pty) Ltd. Prepared for CIPC Technical Portfolio Submission.*