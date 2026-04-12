'use server';
/**
 * @fileOverview Autonomous AI Testing Agent.
 * 
 * This agent reads the 'test-manifest.ts', iterates through scenarios,
 * and performs virtual analysis of app logic and simulated state.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { GOLDEN_SCENARIOS, SYNTHETIC_EDGE_CASES } from '@/lib/test-manifest';

const AutonomousTesterInputSchema = z.object({
  targetScenarioId: z.string().optional().describe("Specific scenario to run. If null, runs all."),
});

const TestResultSchema = z.object({
  scenarioId: z.string(),
  name: z.string(),
  status: z.enum(['pass', 'fail', 'warning']),
  findings: z.string(),
  anomalies: z.array(z.string()).optional(),
});

const AutonomousTesterOutputSchema = z.object({
  overallStatus: z.enum(['healthy', 'unstable', 'critical']),
  results: z.array(TestResultSchema),
  summary: z.string(),
});

export type AutonomousTesterOutput = z.infer<typeof AutonomousTesterOutputSchema>;

const testerPrompt = ai.definePrompt({
  name: 'autonomousTesterPrompt',
  model: 'googleai/gemini-1.5-flash',
  input: { 
    schema: AutonomousTesterInputSchema.extend({
      scenariosJson: z.string(),
      edgeCasesJson: z.string(),
    }) 
  },
  output: { schema: AutonomousTesterOutputSchema },
  prompt: `You are an Autonomous AI QA Engineer for 'The Exchange'. 
Your goal is to simulate a comprehensive mobile application testing process walkthrough.

RESOURCES:
- Golden Scenarios: {{{scenariosJson}}}
- Synthetic Edge Cases: {{{edgeCasesJson}}}

TASKS:
1. Evaluate 'Requirement Analysis': Does the logic support 'Scam-Proof' commerce?
2. Perform 'Security Testing': Analyze the scam phrases and verify if blocking logic is sufficient.
3. Perform 'Functional Testing': Verify auction bid logic (Bid must be > Price).
4. Simulate 'Interrupt Testing': Evaluate the efficacy of local draft persistence.

Provide a detailed report on the app's health and any detected vulnerabilities. 
For the 'findings' field, provide a detailed, context-rich description of the results.
Ensure the output strictly follows the required JSON schema.`,
});

export async function runAutonomousTesting(input: { targetScenarioId?: string }): Promise<AutonomousTesterOutput> {
  try {
    const { output } = await testerPrompt({
      ...input,
      scenariosJson: JSON.stringify(GOLDEN_SCENARIOS),
      edgeCasesJson: JSON.stringify(SYNTHETIC_EDGE_CASES),
    });
    
    if (!output) {
      throw new Error("AI Agent returned an empty report.");
    }
    
    return output;
  } catch (error: any) {
    console.error("Autonomous Tester Error:", error);
    // Return a structured error response instead of crashing the server action
    return {
      overallStatus: 'unstable',
      summary: `System Stability Warning: ${error.message || "The AI Security Agent encountered a connectivity issue."}`,
      results: [{
        scenarioId: "AUTO_AUDIT_FAIL",
        name: "Security Engine Integrity Audit",
        status: 'fail',
        findings: "The autonomous testing agent could not complete its analysis due to an upstream model error. Manual verification of the risk engine is required.",
        anomalies: [error.message || "Unknown API Error"]
      }]
    };
  }
}

const autonomousTesterFlow = ai.defineFlow(
  {
    name: 'autonomousTesterFlow',
    inputSchema: AutonomousTesterInputSchema,
    outputSchema: AutonomousTesterOutputSchema,
  },
  async (input) => {
    return runAutonomousTesting(input);
  }
);
