# CIPC Intellectual Property & Technical Specification Portfolio
**Project:** The Exchange | Premium Verified Marketplace
**Jurisdiction:** South Africa (CIPC / Companies Act / Copyright Act)

This document serves as the formal Technical Specification for protecting "The Exchange" against unauthorized replication. It defines the proprietary "Trade Secrets" and original "Literary/Artistic Works" that constitute the platform's unique value.

---

## 1. Proprietary Payment Logic: "Protected Payment Hold"
**IP Type:** Trade Secret / Business Process
- **Mechanism:** Unlike standard e-commerce, the platform implements a three-tier escrow-style hold. Funds are captured from the Buyer via South African-specific channels (Capitec Pay, Ozow EFT) but restricted from Seller payout until a dual-confirmation trigger (Meetup Arrival + Manual Release).
- **Unique Identifier:** The integration of the "Safety Check-in" as a prerequisite for fund release is a unique business method belonging to The Exchange Marketplace (Pty) Ltd.

## 2. The "Reliability Score" Algorithm
**IP Type:** Proprietary Algorithm (Trade Secret)
- **Factors:** The score is not a simple average. It uses a weighted multi-factor calculation:
    1. **Punctuality:** Based on GPS "Arrived" timestamps at Safe Zones.
    2. **Consistency:** Ratio of initiated vs. completed safety check-ins.
    3. **Identity Weight:** Verified biometric users receive a 1.2x multiplier on trust growth.
- **Copy Protection:** The specific weighting values (the "weights") are proprietary and not disclosed to users, making the trust system difficult to replicate effectively.

## 3. Safe-Zone Meetup & Arrival Tracker
**IP Type:** Original Functional Design / User Interface
- **Workflow:** The system automatically identifies vetted "Safe Zones" (SAPS stations, high-security malls) and calculates the **Haversine distance** to the buyer's home.
- **Dynamic Safety Monitoring:** The "Safe Arrival" countdown is a defining feature. It uses estimated travel time based on local South African urban traffic averages (40km/h) to monitor user safety post-trade.

## 4. Biometric KYC (Identity Verification)
**IP Type:** Proprietary Workflow
- **Process:** Comparing government-issued ID documents against a live browser-based facial scan using Genkit AI. The specific "Liveness Check" UI and the automated mapping to the "Verified" badge are core assets.

## 5. Visual Identity & "The Exchange" Branding
**IP Type:** Trademark (TM1 Filing Pending)
- **Primary Color:** Dependable Blue (#225BC3) - Represents stability and banking-grade security.
- **Accent Color:** Aqua (#34CBED) - Represents modern tech and clarity.
- **Typography:** Plus Jakarta Sans (custom weights).

---

## Legal Strategy for South Africa
1. **Company Registration:** Register as "The Exchange Marketplace (Pty) Ltd" via CIPC.
2. **Trademark Filing:** File Class 35 (Marketplace) and Class 42 (Software/SaaS).
3. **Copyright Assertion:** This technical specification and the source code (Literary Work) are protected upon creation. This repository serves as the primary evidence of the "Date of First Publication."

*Note: For a formal CIPC submission, this document should be converted to PDF and attached to your application for Trademark or Patent of unique business methods where applicable.*