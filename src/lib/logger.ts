import { collection, addDoc, serverTimestamp, Firestore } from "firebase/firestore";

/**
 * Production Platform Logger (Phase 8)
 * Centralizes security, audit, and error logging across the application.
 */
export class PlatformLogger {
  constructor(private db: Firestore) {}

  async logSecurityEvent(type: string, userId: string, metadata: any = {}) {
    try {
      await addDoc(collection(this.db, "auditLogs"), {
        category: "SECURITY",
        type,
        userId,
        metadata,
        timestamp: serverTimestamp(),
        severity: metadata.severity || "info",
      });
    } catch (e) {
      console.error("[Logger] Failed to log security event", e);
    }
  }

  async logAdminAction(adminId: string, action: string, targetId: string, metadata: any = {}) {
    try {
      await addDoc(collection(this.db, "auditLogs"), {
        category: "ADMIN",
        adminId,
        action,
        targetId,
        metadata,
        timestamp: serverTimestamp(),
      });
    } catch (e) {
      console.error("[Logger] Failed to log admin action", e);
    }
  }

  async logFraudDetection(userId: string, ruleId: string, score: number, context: string) {
    try {
      await addDoc(collection(this.db, "fraudEvents"), {
        userId,
        ruleId,
        score,
        context,
        timestamp: serverTimestamp(),
        status: "flagged",
      });
    } catch (e) {
      console.error("[Logger] Failed to log fraud event", e);
    }
  }
}
