'use server';
/**
 * @fileOverview Advanced AI Security Agent for Chat Fraud Prevention.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { detectScamText, DetectionResult } from '@/lib/scam-rules';

const AntiScamChatProtectionInputSchema = z.object({
  message: z.string().describe('The chat message to be analyzed for fraud indicators.'),
});
export type AntiScamChatProtectionInput = z.infer<typeof AntiScamChatProtectionInputSchema>;

const AntiScamChatProtectionOutputSchema = z.object({
  isSuspicious: z.boolean(),
  riskScore: z.number(),
  decision: z.enum(['allow', 'warn', 'flag', 'block']),
  reason: z.string(),
  audit: z.object({
    normalizedText: z.string(),
    matchedRules: z.array(z.string()),
    explanation: z.string(),
  }),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

export async function antiScamChatProtection(input: AntiScamChatProtectionInput): Promise<AntiScamChatProtectionOutput> {
  const result = detectScamText(input.message);
  
  return {
    isSuspicious: result.score > 0,
    riskScore: result.score,
    decision: result.action,
    reason: result.explanation,
    audit: {
      normalizedText: result.normalizedText,
      matchedRules: result.matchedRules,
      explanation: result.explanation
    }
  };
}
