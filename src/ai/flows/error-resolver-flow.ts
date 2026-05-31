"use server";
/**
 * @fileOverview AI Error Resolution Agent.
 */

import { ai, runWithModelSafe } from "@/ai/genkit";
import { z } from "genkit";

const maxDuration = 120; // Internal constraint, not exported

const ErrorResolverInputSchema = z.object({
  errorMessage: z.string(),
  stackTrace: z.string().optional(),
  componentStack: z.string().optional(),
  userContext: z.record(z.any()).optional(),
});
export type ErrorResolverInput = z.infer<typeof ErrorResolverInputSchema>;

const ErrorResolverOutputSchema = z.object({
  rootCause: z.string().describe("The primary reason the error occurred."),
  explanation: z
    .string()
    .describe("A plain-English explanation for non-technical admins."),
  suggestedFix: z
    .string()
    .describe("Technical steps or code snippets to resolve the issue."),
  severity: z.enum(["low", "medium", "high", "critical"]),
  isRecoverable: z.boolean(),
});
export type ErrorResolverOutput = z.infer<typeof ErrorResolverOutputSchema>;

const resolverPrompt = ai.definePrompt({
  name: "errorResolverPrompt",
  input: { schema: ErrorResolverInputSchema },
  output: { schema: ErrorResolverOutputSchema },
  prompt: `You are a Senior Site Reliability Engineer (SRE) and AI Debugger.
Analyze the following application error from 'The Exchange' marketplace.

Error Message: {{{errorMessage}}}
Stack Trace: {{{stackTrace}}}
Component Stack: {{{componentStack}}}

Metadata:
- Platform: Next.js (App Router)
- Stack: Firebase, Genkit, Tailwind, ShadCN

Task:
1. Identify if this is a network issue, a permission (Firestore) issue, or a code logic bug.
2. Provide a clear explanation of what the user experienced.
3. Provide a concrete technical suggestion to fix it.

If the error contains 'Missing or insufficient permissions', focus on Firestore Security Rules.`,
});

export async function resolveSystemError(
  input: ErrorResolverInput,
): Promise<ErrorResolverOutput> {
  try {
    const result = await runWithModelSafe((config) =>
      resolverPrompt(input, config),
    );

    if (result.ok && result.output?.output) {
      return result.output.output;
    }
  } catch (err) {
    console.error("Error Resolver AI Failure:", err);
  }

  return {
    rootCause: "AI_DIAGNOSTIC_FAILURE",
    explanation:
      "The AI Debugger encountered a rate limit or infrastructure delay and could not analyze this specific crash.",
    suggestedFix:
      "Check logs manually in the Firebase console or try again in 60 seconds.",
    severity: "medium",
    isRecoverable: true,
  };
}

export const errorResolverFlow = ai.defineFlow(
  {
    name: "errorResolverFlow",
    inputSchema: ErrorResolverInputSchema,
    outputSchema: ErrorResolverOutputSchema,
  },
  async (input) => {
    return resolveSystemError(input);
  },
);
