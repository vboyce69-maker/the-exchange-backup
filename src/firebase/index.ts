"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getFunctions, Functions } from "firebase/functions";
import { firebaseConfig } from "./config";

/**
 * Standardized Firebase Initialization for 'The Exchange'.
 * Implements a safer singleton pattern for client-side environments.
 */
let app: any;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null | null;
let functions: Functions | null = null;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

  // Initialize App Check (reCAPTCHA v3)
  if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app);
}

export { auth, db, storage, functions };
export const firebaseApp = app;

/**
 * Returns the initialized SDK instances.
 * Used by the FirebaseClientProvider to bootstrap the context.
 */
export function initializeFirebase() {
  if (typeof window === "undefined") {
    // Return mock or empty objects for SSR safety
    return {
      firebaseApp: null,
      auth: null as any,
      firestore: null as any,
      storage: null as any,
      functions: null as any,
    };
  }

  const currentApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return {
    firebaseApp: currentApp,
    auth: getAuth(currentApp),
    firestore: getFirestore(currentApp),
    storage: getStorage(currentApp),
    functions: getFunctions(currentApp),
  };
}

export * from "./provider";
export * from "./client-provider";
export * from "./firestore/use-collection";
export * from "./firestore/use-doc";
export * from "./non-blocking-updates";
export * from "./non-blocking-login";
export * from "./errors";
export * from "./error-emitter";

export default app;