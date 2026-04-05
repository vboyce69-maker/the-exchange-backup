'use server';
/**
 * @fileOverview An AI agent for detecting and flagging suspicious content in chat messages.
 *
 * - antiScamChatProtection - A function that analyzes chat messages for scam indicators.
 * - AntiScamChatProtectionInput - The input type for the antiScamChatProtection function.
 * - AntiScamChatProtectionOutput - The return type for the antiScamChatProtection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AntiScamChatProtectionInputSchema = z.object({
  message: z.string().describe('The chat message to be analyzed for suspicious content.'),
});
export type AntiScamChatProtectionInput = z.infer<typeof AntiScamChatProtectionInputSchema>;

const AntiScamChatProtectionOutputSchema = z.object({
  isSuspicious: z.boolean().describe('True if the message is deemed suspicious, false otherwise.'),
  reason: z.string().optional().describe('An explanation of why the message is suspicious, if applicable.'),
  flaggedKeywords: z.array(z.string()).optional().describe('A list of specific keywords or patterns that triggered the flagging.'),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

const AntiScamChatProtectionPrompt = ai.definePrompt({
  name: 'antiScamChatProtectionPrompt',
  input: {schema: AntiScamChatProtectionInputSchema},
  output: {schema: AntiScamChatProtectionOutputSchema},
  prompt: `You are an AI assistant designed to detect and flag suspicious content in chat messages for an online marketplace.
Your goal is to identify common scam tactics, including but not limited to:
- Requests for personal information (e.g., bank details, social security numbers, full home addresses).
- Attempts to move the conversation off-platform (e.g., asking to chat on WhatsApp, email, or other external apps).
- Offers that are too good to be true.
- Urgent requests for money or gift cards.
- Messages containing suspicious or unexpected links.
- Messages containing phone numbers.
- Any other common scam phrases or patterns.

Analyze the following chat message and determine if it is suspicious.
If it is suspicious, set 'isSuspicious' to true, provide a brief 'reason', and list any 'flaggedKeywords' or patterns found.
If it is not suspicious, set 'isSuspicious' to false and leave 'reason' and 'flaggedKeywords' empty.

Chat Message: {{{message}}}`,
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
