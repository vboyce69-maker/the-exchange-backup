'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';

/**
 * Standardized Firebase Initialization for 'The Exchange'.
 * Always prefers the explicit firebaseConfig for reliable client-side bootstrap.
 */
export function initializeFirebase() {
  if (!getApps().length) {
    // Explicitly initialize with config to ensure credentials are present before Firestore calls
    const firebaseApp = initializeApp(firebaseConfig);
    return getSdks(firebaseApp);
  }

  const app = getApp();
  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';