"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

/**
 * Standardized Firebase Initialization for 'The Exchange'.
 * Implements a safer singleton pattern for client-side environments.
 */
let app: any;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
}

export { auth, db, storage };
export const firestore = db;
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
    };
  }

  const currentApp =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return {
    firebaseApp: currentApp,
    auth: getAuth(currentApp),
    firestore: getFirestore(currentApp),
    storage: getStorage(currentApp),
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
