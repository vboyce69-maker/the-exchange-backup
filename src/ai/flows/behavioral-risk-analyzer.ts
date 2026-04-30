'use server';
/**
 * @fileOverview Behavioral Risk AI Agent.
 */

import { ai, runWithModelSafe } from '@/ai/genkit';
import { z } from 'genkit';

// INCREASED TIMEOUT
export const maxDuration = 120;

const BehavioralRiskInputSchema = z.object({
  userId: z.string(),
  actionType: z.string().describe("Action being performed (e.g., login, create_listing, place_bid)"),
  metadata: z.record(z.any()).optional().describe("Contextual data like IP, user agent, location, or payload"),
  previousRiskScore: z.number().optional().default(0),
});

const BehavioralRiskOutputSchema = z.object({
  riskLevel: z.enum(['safe', 'low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(100),
  recommendation: z.enum(['allow', 'flag', 'mfa_challenge', 'block']),
  reasoning: z.string(),
  threatIndicators: z.array(z.string()).describe("Specific detected threats like 'VELOCITY_ANOMALY', 'IMPOSSIBLE_TRAVEL', or 'MALICIOUS_INPUT'"),
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
  prompt: `You are an AI Security Operations Center (SOC) Analyst for 'The Exchange'.
Perform real-time Behavioral Risk Analysis to protect the marketplace from hackers, bots, and malicious actors.

CONTEXT:
- User ID: {{{userId}}}
- Action Type: {{{actionType}}}
- History Risk Score: {{{previousRiskScore}}}
- Metadata Context: {{{metadataJson}}}

TASKS:
1. Detect 'Impossible Travel' (e.g., login from different countries within minutes).
2. Detect 'Velocity Attacks' (e.g., too many actions per second).
3. Detect 'Malicious Payloads' (e.g., XSS or SQLi patterns in text input).
4. Detect 'Sybil Attacks' (e.g., multiple accounts sharing unique fingerprint).

Provide a clear security recommendation and threat indicators.`,
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

  return {
    riskLevel: 'medium',
    confidence: 0,
    recommendation: 'flag',
    reasoning: 'AI Security Engine is temporarily unavailable. Marking for manual review as a fail-safe.',
    threatIndicators: ['AI_DIAGNOSTIC_INTERRUPT']
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
