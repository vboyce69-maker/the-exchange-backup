
'use server';
/**
 * @fileOverview AI Identity Verification Flow.
 * 
 * - verifyIdentity: Compares an ID document with a live selfie to verify authenticity.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const VerifyIdentityInputSchema = z.object({
  idPhotoDataUri: z.string().describe("Data URI of the ID document photo."),
  selfieDataUri: z.string().describe("Data URI of the live selfie."),
  fullName: z.string().describe("The user's full name as provided in the form."),
});
export type VerifyIdentityInput = z.infer<typeof VerifyIdentityInputSchema>;

const VerifyIdentityOutputSchema = z.object({
  isVerified: z.boolean().describe("Whether the identity is successfully verified."),
  confidenceScore: z.number().describe("Confidence score of the match (0-100)."),
  reason: z.string().describe("Reason for approval or rejection."),
  extractedDetails: z.object({
    nameMatch: z.boolean().describe("Whether the name on the ID matches the provided name."),
    idNumber: z.string().optional().describe("The ID number extracted from the document."),
  }).optional(),
});
export type VerifyIdentityOutput = z.infer<typeof VerifyIdentityOutputSchema>;

const verifyIdentityPrompt = ai.definePrompt({
  name: 'verifyIdentityPrompt',
  input: { schema: VerifyIdentityInputSchema },
  output: { schema: VerifyIdentityOutputSchema },
  prompt: `You are an AI Security Officer for 'The Exchange' marketplace.
Your task is to perform KYC (Know Your Customer) verification by comparing an ID document and a live selfie.

TASKS:
1. Compare the face in the live selfie with the photo on the ID document.
2. Check if the 'fullName' ({{{fullName}}}) matches the name visible on the ID.
3. Look for signs of digital tampering or "screen-of-a-screen" photos (rejection criteria).

ID Document: {{media url=idPhotoDataUri}}
Live Selfie: {{media url=selfieDataUri}}

Provide a confidence score and a clear reason for your decision. 
If the faces match and the name is consistent, set isVerified to true.`,
});

export async function verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityOutput> {
  return verifyIdentityFlow(input);
}

const verifyIdentityFlow = ai.defineFlow(
  {
    name: 'verifyIdentityFlow',
    inputSchema: VerifyIdentityInputSchema,
    outputSchema: VerifyIdentityOutputSchema,
  },
  async (input) => {
    const { output } = await verifyIdentityPrompt(input);
    return output!;
  }
);
