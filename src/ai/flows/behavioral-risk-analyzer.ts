'use server';
/**
 * @fileOverview Behavioral Risk AI Agent (EDR/XDR Mindset).
 * 
 * Inspired by CrowdStrike Falcon. Analyzes session behavior to detect
 * high-risk anomalies like Account Takeover (ATO) and Velocity Attacks.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const BehavioralRiskInputSchema = z.object({
  userId: z.string(),
  actionType: z.string().describe("Action being performed (e.g., 'listing_creation', 'bid_acceptance', 'profile_edit')"),
  metadata: z.record(z.any()).optional().describe("Contextual data like IP, location, or price delta."),
  previousRiskScore: z.number().optional().default(0),
});

const BehavioralRiskOutputSchema = z.object({
  riskLevel: z.enum(['safe', 'low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(100),
  recommendation: z.enum(['allow', 'flag', 'mfa_challenge', 'block']),
  reasoning: z.string().describe("Explanation of the threat detection logic."),
  threatIndicators: z.array(z.string()).describe("Specific indicators triggered."),
});

export type BehavioralRiskInput = z.infer<typeof BehavioralRiskInputSchema>;
export type BehavioralRiskOutput = z.infer<typeof BehavioralRiskOutputSchema>;

const riskPrompt = ai.definePrompt({
  name: 'behavioralRiskPrompt',
  input: { schema: BehavioralRiskInputSchema },
  output: { schema: BehavioralRiskOutputSchema },
  prompt: `You are an AI Security Operations Center (SOC) Analyst.
Perform real-time Behavioral Risk Analysis for 'The Exchange'.

ANALYZE FOR:
1. VELOCITY ATTACK: User creating more than 5 high-value listings in under 10 minutes.
2. PRICE MANIPULATION: Sudden 50%+ drop in listing price followed by immediate bid acceptance (potential laundering/scam).
3. IMPOSSIBLE TRAVEL: Actions performed from two distinct geographic regions in South Africa (e.g., JHB then CTN) within 5 minutes.
4. ACCOUNT TAKEOVER (ATO): Change of bank details/phone followed immediately by bid acceptance or high-value bidding.
5. METADATA ANOMALY: Use of Tor, VPNs, or proxy IP ranges during sensitive transactions.

Context:
- Action: {{{actionType}}}
- Score History: {{{previousRiskScore}}}
- Metadata: ${JSON.stringify('{{{metadata}}}')}

Evaluate the risk level and provide a security recommendation.`,
});

export async function analyzeBehavioralRisk(input: BehavioralRiskInput): Promise<BehavioralRiskOutput> {
  const { output } = await riskPrompt(input);
  return output!;
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
