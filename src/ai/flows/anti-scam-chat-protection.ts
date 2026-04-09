
'use server';
/**
 * @fileOverview An AI agent for detecting and flagging suspicious content in chat messages.
 * 
 * - antiScamChatProtection - A function that analyzes chat messages for scam indicators.
 * - Layered defense: Blocks high-risk phrases and identifies behavioral anomalies.
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
  securityAction: z.enum(['none', 'warn', 'block', 'flag_for_review']).describe('The automated action to take.'),
  blockedPhrases: z.array(z.string()).optional().describe('Phrases that triggered blocking.'),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

const AntiScamChatProtectionPrompt = ai.definePrompt({
  name: 'antiScamChatProtectionPrompt',
  input: {schema: AntiScamChatProtectionInputSchema},
  output: {schema: AntiScamChatProtectionOutputSchema},
  prompt: `You are an AI Cyber Security Officer for 'The Exchange' marketplace. 
Your goal is to protect users from marketplace fraud, phishing, and off-platform payment scams (defense-in-depth).

CRITICAL SECURITY PATTERNS:
1. OFF-PLATFORM REQUESTS: "WhatsApp me", "Email me directly", "Call me at", "Payment outside the app".
2. DEPOSIT SCAMS: "Pay a deposit to hold", "Booking fee required first", "Courier fee".
3. PHISHING: Links to fake login pages, "Verify your account here [link]".
4. URGENCY/PRESSURE: "Need to sell today", "Send money now or I sell to someone else".
5. BANK DETAILS: Asking for CVV, PIN, or OTP codes.

Analyze this message:
"{{{message}}}"

SCORING LOGIC:
- If PHISHING or BANK DETAILS are detected: isSuspicious=true, riskLevel='high', securityAction='block'.
- If OFF-PLATFORM or DEPOSIT requests are detected: isSuspicious=true, riskLevel='high', securityAction='block'.
- If general suspicious behavior is detected: isSuspicious=true, riskLevel='medium', securityAction='warn'.

Provide a concise, helpful reason that educates the user on why the message was flagged.`,
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
