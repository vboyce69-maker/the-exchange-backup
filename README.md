# The Exchange | Premium Verified Marketplace

This is a high-trust, local peer-to-peer and professional marketplace built with Next.js, Firebase, and Genkit.

## Repository
**Main Backup:** [https://github.com/vboyce69-maker/the-exchange-backup.git](https://github.com/vboyce69-maker/the-exchange-backup.git)

## How to Preview on Mobile (APK Alternative)
The Exchange is configured as a **Progressive Web App (PWA)**, which is the web alternative to an APK. You can install it on your phone now:
1. **Get the URL**: Copy the preview URL from the address bar of the internal browser in this workspace.
2. **Open on Phone**: Open your mobile browser (Safari on iOS, Chrome on Android) and paste the URL.
3. **Install**:
   - **Android**: Tap the three dots menu and select **"Install App"**.
   - **iOS**: Tap the "Share" button and select **"Add to Home Screen"**.
The app will now appear on your home screen with its own icon and run without the browser interface.

## Infrastructure
The application is built on **Firebase**, leveraging Google Cloud's high-performance infrastructure. This choice was made to ensure:
1. **Real-time Sync**: Using Firestore for live bidding and instant chat.
2. **Secure Identity**: Using Firebase Phone Auth for sybil-attack prevention.
3. **AI Integration**: Seamlessly running Genkit for biometric KYC and scam detection.

## Business Strategy
The Exchange positions itself as the "Trust Layer" for South African commerce. By integrating professional business verification (inspired by platforms like Globalfy) and AI-driven security (Genkit), we ensure a marketplace that is:
1. **Scam-Proof**: Through Biometric KYC and Protected Payments.
2. **Business-Ready**: Supporting Pty Ltd sellers with high-volume "Bulk Lot" trades.
3. **CPA Compliant**: Enforcing Consumer Protection Act standards for all transactions.

## How to Sync & Deploy
Since terminal commands cannot be executed directly by the AI, please use these scripts in your local terminal:

### 1. GitHub Backup
```bash
npm run git:setup  # Initialize and connect to your repo
npm run git:push   # Push current code to GitHub
```

### 2. Firebase Setup & Deployment
```bash
npm run firebase:login  # Log in to your Firebase account
npm run firebase:init   # Connect this code to your Firebase project
npm run firebase:deploy # Deploy rules, indexes, and hosting
```

## Founding 100 Program
The first 100 verified sellers receive R0 listing fees and a lifetime "Founding Member" badge.