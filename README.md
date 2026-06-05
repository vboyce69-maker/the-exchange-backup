# The Exchange | Premium Verified Marketplace

This is a high-trust, local peer-to-peer and professional marketplace built with Next.js, Firebase, and Genkit.

## 📄 Master Documentation
For the full application specification, feature list, and technical architecture (including AI logic), please refer to:
**[docs/FULL_APP_PORTFOLIO.md](./docs/FULL_APP_PORTFOLIO.md)**

## 🚀 GitHub Backup & Portability
To copy this application to your own GitHub repository, execute the following commands in your workspace terminal:

### 1. Initial Setup
```bash
npm run git:setup
```

### 2. Push to GitHub
```bash
npm run git:push
```
*Note: If you want to use a different repository, update the 'origin' URL in package.json or run `git remote set-url origin <your-repo-url>`.*

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

## Deployment
Since terminal commands cannot be executed directly by the AI, please use these scripts in your local terminal:

### Firebase Setup & Deployment
```bash
npm run firebase:login  # Log in to your Firebase account
npm run firebase:init   # Connect this code to your Firebase project
npm run firebase:deploy # Deploy rules, indexes, and hosting
```