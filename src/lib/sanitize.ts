/**
 * PII Sanitization Utility (POPIA Compliance)
 * Recursively redacts sensitive fields like passwords, emails, and phone numbers from logging metadata.
 */
export function sanitizeMetadata(data: any): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeMetadata);
  }

  const sanitized: any = {};
  const sensitiveKeys = ["password", "token", "secret", "apiKey", "email", "phoneNumber", "idNumber", "card"];

  for (const key in data) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sensitiveKeys.find(s => sk.toLowerCase() === s.toLowerCase()) || sk.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof data[key] === "object") {
      sanitized[key] = sanitizeMetadata(data[key]);
    } else {
      sanitized[key] = data[key];
    }
  }

  return sanitized;
}

export default sanitizeMetadata;
