import { toast } from "@/hooks/use-toast";
import { PlatformLogger } from "./logger";

/**
 * Standardized Security Error Handler (Phase 8)
 * Ensures technical details are logged securely while users see safe messages.
 */
export class SafeErrorHandler {
  private static logger = new PlatformLogger();

  /**
   * Processes an error, logs it to the backend, and shows a user-friendly toast.
   * @param error The original error object.
   * @param userContext Brief description of what the user was trying to do.
   */
  static handle(error: any, userContext: string) {
    // 1. Log the full technical error to our secure audit logs
    this.logger.logSecurityEvent("CLIENT_ERROR", "SYSTEM", {
      context: userContext,
      message: error.message,
      stack: error.stack,
      code: error.code,
    });

    // 2. Log to console ONLY in development
    if (process.env.NODE_ENV === "development") {
      console.error(`[Technical Error] ${userContext}:`, error);
    }

    // 3. Show the user a safe, generic message
    toast({
      variant: "destructive",
      title: "Market Sync Error",
      description: `We couldn't ${userContext.toLowerCase()}. Please try again or contact support if the issue persists.`,
    });
  }
}
