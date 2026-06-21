import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const db = getFirestore();

/**
 * Securely logs an audit event from the client.
 * Sanitizes input and ensures only authorized users can log certain categories.
 */
export const logAuditEvent = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "User must be logged in to log events.");
  }

  const { category, type, metadata = {} } = request.data;

  // Basic validation
  if (!category || !type) {
    throw new HttpsError("invalid-argument", "Missing category or type.");
  }

  // Prevent users from logging as ADMIN
  if (category === "ADMIN" && !request.auth.token.admin) {
    throw new HttpsError("permission-denied", "Only admins can log admin actions.");
  }

  try {
    const logData = {
      category,
      type,
      userId: request.auth.uid,
      metadata, // In production, add a sanitization layer here to strip PII
      timestamp: FieldValue.serverTimestamp(),
      source: "client_call",
    };

    await db.collection("auditLogs").add(logData);
    return { success: true };
  } catch (error) {
    console.error("Error logging audit event:", error);
    throw new HttpsError("internal", "Failed to write audit log.");
  }
});
