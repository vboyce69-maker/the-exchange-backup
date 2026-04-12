'use server';
/**
 * @fileOverview Advanced AI Security Agent for Chat Fraud Prevention.
 * Orchestrates deterministic rules and AI-driven behavioral analysis.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { detectScam } from '@/lib/scam-rules';

const AntiScamChatProtectionInputSchema = z.object({
  message: z.string().describe('The chat message to be analyzed for fraud indicators.'),
  userTrustScore: z.number().optional().default(50),
});
export type AntiScamChatProtectionInput = z.infer<typeof AntiScamChatProtectionInputSchema>;

const AntiScamChatProtectionOutputSchema = z.object({
  isSuspicious: z.boolean(),
  riskScore: z.number(),
  decision: z.enum(['allow', 'warn', 'hold', 'block']),
  reason: z.string(),
  audit: z.object({
    normalizedText: z.string(),
    matchedRules: z.array(z.string()),
    explanation: z.string(),
  }),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

export async function antiScamChatProtection(input: AntiScamChatProtectionInput): Promise<AntiScamChatProtectionOutput> {
  // 1. Deterministic Rule Scan (Fast & Reliable)
  const result = detectScam(input.message, input.userTrustScore);
  
  // 2. High-Risk AI Verification
  // If the score is ambiguous, we can use Genkit for deeper intent analysis
  // (Omitted for latency, but structure is ready for expansion)
  
  return {
    isSuspicious: result.score > 0,
    riskScore: result.score,
    decision: result.action as any,
    reason: result.explanation,
    audit: {
      normalizedText: result.normalizedText,
      matchedRules: result.matchedRules,
      explanation: result.explanation
    }
  };
}
