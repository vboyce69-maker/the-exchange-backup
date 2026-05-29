# The Exchange | Premium Verified Marketplace

This is a high-trust, local peer-to-peer and professional marketplace built with Next.js, Firebase, and Genkit.

## Repository
**Main Backup:** [https://github.com/vboyce69-maker/the-exchange-backup.git](https://github.com/vboyce69-maker/the-exchange-backup.git)

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

## Troubleshooting: Email Verification
If verification emails are not arriving:
1. **Authorized Domains**: Add your app domain to the "Authorized domains" list in the Firebase Console (Authentication > Settings).
2. **Spam Folder**: Check your spam/junk folder as automated links are often filtered.
3. **Phone Users**: If you signed up via phone, ensure you've added an email to your profile in the **Account Hub**.

## How to Preview on Mobile
The Exchange is a **Mobile-Responsive Web App**. You can view the full mobile experience on your physical device:
1. **Get the URL**: Copy the preview URL from the address bar of the internal browser in this workspace.
2. **Open on Phone**: Open your mobile browser (Safari/Chrome) and paste the URL.
3. **Add to Home Screen**: For the best experience, use the "Add to Home Screen" feature in your mobile browser.