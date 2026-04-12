'use server';
/**
 * @fileOverview Advanced AI Security Agent for Chat Fraud Prevention.
 * 
 * - antiScamChatProtection - Performs multi-layered contextual analysis.
 * - Detects: Social Engineering, Overpayment Scams, Proof of Payment (PoP) Fraud, and Phishing.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AntiScamChatProtectionInputSchema = z.object({
  message: z.string().describe('The chat message to be analyzed for fraud indicators.'),
});
export type AntiScamChatProtectionInput = z.infer<typeof AntiScamChatProtectionInputSchema>;

const AntiScamChatProtectionOutputSchema = z.object({
  isSuspicious: z.boolean().describe('True if the message contains fraud indicators.'),
  reason: z.string().optional().describe('Contextual explanation for the security action.'),
  riskLevel: z.enum(['low', 'medium', 'high', 'critical']).describe('Calculated risk score.'),
  securityAction: z.enum(['none', 'warn', 'block', 'flag_for_review']).describe('Automated response.'),
  detectedPatterns: z.array(z.string()).optional().describe('Specific scam patterns identified.'),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

const AntiScamChatProtectionPrompt = ai.definePrompt({
  name: 'antiScamChatProtectionPrompt',
  input: {schema: AntiScamChatProtectionInputSchema},
  output: {schema: AntiScamChatProtectionOutputSchema},
  prompt: `You are a Senior AI Cyber-Fraud Analyst for 'The Exchange'. 
Your task is to detect sophisticated marketplace scams that bypass simple keyword filters.

ANALYZE FOR THESE SOPHISTICATED PATTERNS:
1. OVERPAYMENT SCAM: "I'll send extra money for the courier, just pay them the difference."
2. PROOF OF PAYMENT (PoP) FRAUD: "I've sent the money, here is the screenshot [fake link]. Please release the item."
3. COURIER DEPOSIT: "I'm sending a courier with cash, but you need to pay the 'insurance fee' first."
4. SOCIAL ENGINEERING: "My child is sick, I need this laptop for school, can I pay half now and half later?"
5. OFF-PLATFORM STEALTH: Redirection attempts using obfuscation (e.g., "W-H-A-T-S-A-P-P", "0 8 2 ...", "insta-gram").
6. FAKE SUPPORT: "The Exchange Support: Your payment is held, click here to verify."

Analyze this message:
"{{{message}}}"

SCORING RULES:
- If PHISHING, FAKE SUPPORT, or COURIER DEPOSITS detected: isSuspicious=true, riskLevel='critical', securityAction='block'.
- If OFF-PLATFORM or OVERPAYMENT detected: isSuspicious=true, riskLevel='high', securityAction='block'.
- If suspicious urgency or emotional manipulation detected: isSuspicious=true, riskLevel='medium', securityAction='warn'.

Provide a reason that educates the user on the specific scam type detected.`,
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
