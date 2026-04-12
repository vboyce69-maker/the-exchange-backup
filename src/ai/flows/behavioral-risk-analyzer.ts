
'use server';
/**
 * @fileOverview Behavioral Risk AI Agent (EDR/XDR Mindset).
 * 
 * Inspired by CrowdStrike Falcon and Bitdefender GravityZone.
 * Analyzes session metadata and user actions to detect high-risk anomalies.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const BehavioralRiskInputSchema = z.object({
  userId: z.string(),
  actionType: z.string().describe("The action being performed (e.g., 'login', 'high_value_bid', 'profile_update')"),
  locationContext: z.string().optional().describe("Geographic or IP context."),
  previousRiskScore: z.number().optional().default(0),
  deviceFingerprint: z.string().optional().describe("Mocked device identifier."),
});

const BehavioralRiskOutputSchema = z.object({
  riskLevel: z.enum(['safe', 'low', 'medium', 'high', 'critical']),
  confidence: z.number().min(0).max(100),
  recommendation: z.enum(['allow', 'flag', 'mfa_challenge', 'block']),
  reasoning: z.string().describe("Explanation of the threat detection logic."),
  threatIndicators: z.array(z.string()).describe("Specific indicators triggered (e.g., 'impossible_travel', 'credential_stuffing_pattern')"),
});

export type BehavioralRiskInput = z.infer<typeof BehavioralRiskInputSchema>;
export type BehavioralRiskOutput = z.infer<typeof BehavioralRiskOutputSchema>;

const riskPrompt = ai.definePrompt({
  name: 'behavioralRiskPrompt',
  input: { schema: BehavioralRiskInputSchema },
  output: { schema: BehavioralRiskOutputSchema },
  prompt: `You are an AI Security Operations Center (SOC) Analyst for 'The Exchange'.
Your goal is to perform real-time Behavioral Risk Analysis, similar to CrowdStrike Falcon EDR.

SCENARIO DATA:
- User ID: {{{userId}}}
- Action: {{{actionType}}}
- Context: {{#if locationContext}}{{{locationContext}}}{{else}}Standard Environment{{/if}}
- Previous Score: {{{previousRiskScore}}}

THREAT DETECTION LOGIC:
1. IMPOSSIBLE TRAVEL: If location has changed drastically in minutes.
2. BRUTE FORCE: Repeated high-value bid attempts from new devices.
3. ACCOUNT TAKEOVER (ATO): Sensitive profile changes immediately followed by a withdrawal or high-value purchase.
4. BOT BEHAVIOR: Rapid-fire listing creation (spam/scam).

Evaluate the risk level and provide a security recommendation.`,
});

export async function analyzeBehavioralRisk(input: BehavioralRiskInput): Promise<BehavioralRiskOutput> {
  const { output } = await riskPrompt(input);
  return output!;
}
