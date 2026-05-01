'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Updated to log warnings instead of throwing, preventing unnecessary page crashes.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Log to console for developer visibility without crashing the UI
      console.warn('Firebase Permission Notice:', error.message);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  return null;
}