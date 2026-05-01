'use server';
/**
 * @fileOverview AI Identity Verification Flow.
 * Matches live biometric selfies against uploaded ID documents.
 */

import { ai, runWithModelSafe } from '@/ai/genkit';
import { z } from 'genkit';

const maxDuration = 120;

const VerifyIdentityInputSchema = z.object({
  idPhotoDataUri: z.string().describe("Data URI of the ID document photo. Must be base64."),
  selfieDataUri: z.string().describe("Data URI of the live selfie captured via camera. Must be base64."),
  fullName: z.string().describe("The user's full name as provided in the verification form."),
});
export type VerifyIdentityInput = z.infer<typeof VerifyIdentityInputSchema>;

const VerifyIdentityOutputSchema = z.object({
  isVerified: z.boolean().describe("Whether the identity is successfully verified based on facial matching."),
  confidenceScore: z.number().describe("Confidence score of the biometric match (0-100)."),
  reason: z.string().describe("Human-readable explanation for approval or rejection."),
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
  prompt: `You are a Senior AI Security Officer for 'The Exchange' marketplace.
Your task is to perform critical KYC (Know Your Customer) biometric verification.

PRIMARY TASKS:
1. FACIAL RECOGNITION: Compare the facial landmarks in the live selfie with the portrait photo on the ID document. 
2. LIVENESS CHECK: Look for signs of 'screen-of-a-screen' photos, printed photo spoof, or digital masks (reject if suspected).
3. NAME VALIDATION: Verify if the 'fullName' ({{{fullName}}}) appears on the ID document correctly.
4. CONSISTENCY: Ensure the document looks like a legitimate South African ID, Driver's License, or Passport.

MEDIA INPUTS:
- ID DOCUMENT: {{media url=idPhotoDataUri}}
- LIVE BIOMETRIC SELFIE: {{media url=selfieDataUri}}

SCORING CRITERIA:
- High confidence (90+): Identical landmarks, clear name match.
- Medium confidence (70-80): Slight lighting differences but same person.
- Low confidence (<60): Drastic age difference, poor quality, or mismatch.

REJECTION RULE: If the faces do not match, set isVerified to false regardless of other factors.`,
});

/**
 * Handles the identity verification process using multi-model fallback.
 * Wraps calls in try/catch to return structured failure instead of crashing.
 */
export async function verifyIdentity(input: VerifyIdentityInput): Promise<VerifyIdentityOutput> {
  try {
    const result = await runWithModelSafe((config) => verifyIdentityPrompt(input, config));

    if (result.ok && result.output?.output) {
      return result.output.output;
    }

    return {
      isVerified: false,
      confidenceScore: 0,
      reason: "The Identity Verification engine is currently experiencing a high-load delay. Please wait 60 seconds and try your face scan again.",
    };
  } catch (err) {
    console.error("Identity Flow Critical Fault:", err);
    return {
      isVerified: false,
      confidenceScore: 0,
      reason: "A technical error occurred during biometric analysis. Please ensure you are in a well-lit area and retry.",
    };
  }
}

const verifyIdentityFlow = ai.defineFlow(
  {
    name: 'verifyIdentityFlow',
    inputSchema: VerifyIdentityInputSchema,
    outputSchema: VerifyIdentityOutputSchema,
  },
  async (input) => {
    return verifyIdentity(input);
  }
);
