'use server';
/**
 * @fileOverview Advanced AI Security Agent for Chat Fraud Prevention.
 * 
 * - antiScamChatProtection - Performs multi-layered contextual analysis and weighted risk scoring.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { normalizeText, SCAM_RULES, CO_OCCURRENCE_BOOSTS } from '@/lib/scam-rules';

const AntiScamChatProtectionInputSchema = z.object({
  message: z.string().describe('The chat message to be analyzed for fraud indicators.'),
});
export type AntiScamChatProtectionInput = z.infer<typeof AntiScamChatProtectionInputSchema>;

const AntiScamChatProtectionOutputSchema = z.object({
  isSuspicious: z.boolean().describe('True if the message contains fraud indicators.'),
  riskScore: z.number().describe('Calculated risk score from 0 to 100.'),
  decision: z.enum(['allow', 'warn', 'hold', 'block']).describe('Automated response decision.'),
  reason: z.string().describe('Contextual explanation for the security action.'),
  detectedPatterns: z.array(z.string()).optional().describe('Specific scam patterns identified.'),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

const AntiScamChatProtectionPrompt = ai.definePrompt({
  name: 'antiScamChatProtectionPrompt',
  input: {schema: AntiScamChatProtectionInputSchema},
  output: {schema: AntiScamChatProtectionOutputSchema},
  prompt: `You are a Senior AI Cyber-Fraud Analyst for 'The Exchange'.
Analyze the following chat message for sophisticated marketplace fraud.

INPUT DATA:
Normalized Message: {{{normalizedMessage}}}
Scam Rules: ${JSON.stringify(SCAM_RULES)}
Co-occurrence Boosts: ${JSON.stringify(CO_OCCURRENCE_BOOSTS)}

ANALYSIS TASK:
1. Identify if any patterns from the Scam Rules are present in the normalized message.
2. Calculate a Risk Score (0-100) based on base scores and co-occurrence boosts.
3. Determine a decision based on these thresholds:
   - 0 to 29: allow
   - 30 to 59: warn
   - 60 to 79: hold
   - 80+: block

DECISION LOGIC:
- If PHISHING or CREDENTIAL THEFT (OTP) is detected: Score must be at least 80, Decision MUST be 'block'.
- If OVERPAYMENT or COURIER FRAUD is detected: Score must be at least 60.
- If multiple suspicious patterns co-occur (e.g., Courier + Insurance), boost the score significantly.

Provide the final analysis including the total calculated risk score and a reason that educates the user.`,
});

export async function antiScamChatProtection(input: AntiScamChatProtectionInput): Promise<AntiScamChatProtectionOutput> {
  return antiScamChatProtectionFlow(input);
}

const antiScamChatProtectionFlow = ai.defineFlow(
  {
    name: 'antiScamChatProtectionFlow',
    inputSchema: AntiScamChatProtectionInputSchema,
    outputSchema: AntiScamChatProtectionOutputSchema,
  },
  async (input) => {
    const normalized = normalizeText(input.message);
    const {output} = await AntiScamChatProtectionPrompt({
      ...input,
      normalizedMessage: normalized
    });
    return output!;
  }
);
