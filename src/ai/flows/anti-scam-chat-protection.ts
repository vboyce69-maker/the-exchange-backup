
'use server';
/**
 * @fileOverview An AI agent for detecting and flagging suspicious content in chat messages.
 *
 * - antiScamChatProtection - A function that analyzes chat messages for scam indicators.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AntiScamChatProtectionInputSchema = z.object({
  message: z.string().describe('The chat message to be analyzed for suspicious content.'),
});
export type AntiScamChatProtectionInput = z.infer<typeof AntiScamChatProtectionInputSchema>;

const AntiScamChatProtectionOutputSchema = z.object({
  isSuspicious: z.boolean().describe('True if the message is deemed suspicious, false otherwise.'),
  reason: z.string().optional().describe('An explanation of why the message is suspicious.'),
  riskLevel: z.enum(['low', 'medium', 'high']).describe('The severity of the scam risk.'),
  blockedPhrases: z.array(z.string()).optional().describe('Phrases that triggered blocking.'),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

const AntiScamChatProtectionPrompt = ai.definePrompt({
  name: 'antiScamChatProtectionPrompt',
  input: {schema: AntiScamChatProtectionInputSchema},
  output: {schema: AntiScamChatProtectionOutputSchema},
  prompt: `You are an AI security guard for LocalBid Exchange. 
Your primary goal is to block messages that contain common marketplace scam indicators.

CRITICAL SCAM PHRASES TO BLOCK (Mark as HIGH risk and isSuspicious: true):
- "pay deposit" or "payment first"
- "courier will collect" or "send a driver"
- "send OTP" or "verification code"
- "pay via link"
- "outside the platform"

Other suspicious indicators:
- Asking for bank details or social security numbers.
- Extremely urgent tone regarding payment.
- Unusual payment methods (gift cards, crypto).

Analyze this message:
Message: "{{{message}}}"

If the message contains one of the CRITICAL SCAM PHRASES, you MUST block it (isSuspicious: true, riskLevel: 'high').
Provide a clear reason for the user to understand the risk.`,
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
    const {output} = await AntiScamChatProtectionPrompt(input);
    return output!;
  }
);
