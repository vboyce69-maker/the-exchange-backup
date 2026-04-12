'use server';
/**
 * @fileOverview Behavioral Risk AI Agent with Centralized Model Config.
 */

import { ai, runWithModelSafe } from '@/ai/genkit';
import { z } from 'genkit';

const BehavioralRiskInputSchema = z.object({
  userId: z.string(),
  actionType: z.string().describe("Action being performed"),
  metadata: z.record(z.any()).optional(),
  previousRiskScore: z.number().optional().default(0),
});

const BehavioralRiskOutputSchema = z.object({
  riskLevel: z.enum(['safe', 'low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(100),
  recommendation: z.enum(['allow', 'flag', 'mfa_challenge', 'block']),
  reasoning: z.string(),
  threatIndicators: z.array(z.string()),
});

export type BehavioralRiskInput = z.infer<typeof BehavioralRiskInputSchema>;
export type BehavioralRiskOutput = z.infer<typeof BehavioralRiskOutputSchema>;

const riskPrompt = ai.definePrompt({
  name: 'behavioralRiskPrompt',
  input: { 
    schema: BehavioralRiskInputSchema.extend({
      metadataJson: z.string(),
    }) 
  },
  output: { schema: BehavioralRiskOutputSchema },
  prompt: `You are an AI Security Operations Center (SOC) Analyst.
Perform real-time Behavioral Risk Analysis for 'The Exchange'.

Context:
- Action: {{{actionType}}}
- Score History: {{{previousRiskScore}}}
- Metadata: {{{metadataJson}}}`,
});

export async function analyzeBehavioralRisk(input: BehavioralRiskInput): Promise<BehavioralRiskOutput> {
  const result = await runWithModelSafe((config) => 
    riskPrompt({
      ...input,
      metadataJson: JSON.stringify(input.metadata || {}),
    }, config)
  );

  if (result.ok && result.output?.output) {
    return result.output.output;
  }

  // Default safe-fallthrough if AI is down
  return {
    riskLevel: 'medium',
    confidence: 0,
    recommendation: 'flag',
    reasoning: 'Behavioral analysis AI is temporarily unavailable. Marking for manual review as a precaution.',
    threatIndicators: ['AI_SERVICE_UNAVAILABLE']
  };
}

const behavioralRiskFlow = ai.defineFlow(
  {
    name: 'behavioralRiskFlow',
    inputSchema: BehavioralRiskInputSchema,
    outputSchema: BehavioralRiskOutputSchema,
  },
  async (input) => {
    return analyzeBehavioralRisk(input);
  }
);
