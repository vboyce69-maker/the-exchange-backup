"use client";

import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Firestore } from "firebase/firestore";

/**
 * Logs a system error to Firestore for AI analysis and admin review.
 */
export function logSystemError(
  db: Firestore,
  error: Error & { digest?: string },
  context?: { componentStack?: string; userId?: string },
) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    digest: error.digest,
    componentStack: context?.componentStack,
    userId: context?.userId || "anonymous",
    timestamp: new Date().toISOString(),
    status: "new",
    resolved: false,
    severity: "unclassified",
    userAgent:
      typeof window !== "undefined" ? window.navigator.userAgent : "server",
  };

  try {
    const errorCol = collection(db, "systemErrors");
    addDocumentNonBlocking(errorCol, errorData);
  } catch (e) {
    console.error("Failed to log system error:", e);
  }
}
