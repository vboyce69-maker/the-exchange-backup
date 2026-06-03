"use client";

import { useEffect } from "react";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";

/**
 * An invisible component that listens for globally emitted 'permission-error' events.
 * Surfaces contextual errors to the development overlay for agentive fixing.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const handleError = (error: FirestorePermissionError) => {
      // Re-throw to trigger the Next.js development overlay/error boundary
      // This is essential for debugging Security Rules in real-time.
      if (process.env.NODE_ENV === 'development') {
        throw error;
      } else {
        console.error("Firebase Permission Error:", error.message);
      }
    };

    errorEmitter.on("permission-error", handleError);

    return () => {
      errorEmitter.off("permission-error", handleError);
    };
  }, []);

  return null;
}
