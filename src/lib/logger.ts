import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "@/firebase";
import { sanitizeMetadata } from "./sanitize";

/**
 * Production Platform Logger (Phase 8)
 * Refactored to use Cloud Functions for secure server-side logging.
 */
export class PlatformLogger {
  private logFn;

  constructor() {
    const functions = getFunctions(firebaseApp);
    this.logFn = httpsCallable(functions, "logAuditEvent");
  }

  async logSecurityEvent(type: string, userId: string, metadata: any = {}) {
    try {
      await this.logFn({
        category: "SECURITY",
        type,
        metadata: sanitizeMetadata({ ...metadata, severity: metadata.severity || "info" }),
      });
    } catch (e) {
      console.error("[Logger] Failed to log security event via CF", e);
    }
  }

  async logAdminAction(adminId: string, action: string, targetId: string, metadata: any = {}) {
    try {
      await this.logFn({
        category: "ADMIN",
        type: action,
        metadata: sanitizeMetadata({ ...metadata, targetId }),
      });
    } catch (e) {
      console.error("[Logger] Failed to log admin action via CF", e);
    }
  }

  async logFraudDetection(userId: string, ruleId: string, score: number, context: string) {
    try {
      // Fraud events could also be a separate CF or part of this one
      await this.logFn({
        category: "FRAUD",
        type: "DETECTION",
        metadata: sanitizeMetadata({ ruleId, score, context }),
      });
    } catch (e) {
      console.error("[Logger] Failed to log fraud event via CF", e);
    }
  }
}
