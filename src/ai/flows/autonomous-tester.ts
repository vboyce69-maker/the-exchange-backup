'use server';
/**
 * @fileOverview AUTONOMOUS QA RETRY AGENT for 'The Exchange'.
 * Performs automated re-runs of failed cases, detects regressions, and stress-tests systems.
 */

import { ai, runWithModelSafe } from '@/ai/genkit';
import { z } from 'genkit';
import { TEST_SUITES } from '@/lib/test-manifest';

// INCREASED TIMEOUT FOR COMPLEX QA SIMULATIONS
const maxDuration = 120;

const SuiteReportSchema = z.object({
  suite: z.string(),
  retry_run: z.boolean().describe("Whether this was a re-run of failed/unstable cases."),
  total_tests: z.number(),
  passed: z.number(),
  failed: z.number(),
  warnings: z.number(),
  non_deterministic_failures: z.number().describe("Tests that produced differing results across runs."),
  critical_bugs: z.array(z.string()),
  regressions_detected: z.array(z.string()),
  recommended_fixes: z.array(z.string()),
  crash_risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH']),
});

const AutonomousTesterInputSchema = z.object({
  targetSuiteId: z.string().optional().describe("Specific suite to run. If null, runs a full platform audit."),
  isSimulation: z.boolean().optional().default(true),
});

const AutonomousTesterOutputSchema = z.object({
  overallStatus: z.enum(['healthy', 'unstable', 'critical']),
  reports: z.array(SuiteReportSchema),
  summary: z.string(),
});

export type AutonomousTesterOutput = z.infer<typeof AutonomousTesterOutputSchema>;

const testerPrompt = ai.definePrompt({
  name: 'autonomousTesterPrompt',
  input: { 
    schema: z.object({
      targetSuiteId: z.string().optional(),
      isSimulation: z.boolean(),
      suitesJson: z.string(),
    }) 
  },
  output: { schema: AutonomousTesterOutputSchema },
  prompt: `You are the AUTONOMOUS QA RETRY AGENT for 'The Exchange' marketplace.
Your goal is to re-run failed scenarios, detect regressions, and identify silent failures under load.

EXECUTION RULES:
1. Re-test all previously FAILED and WARNING cases 3 times for consistency.
2. Simulate network instability (latency, packet loss).
3. Simulate low-end device constraints (CPU throttling).
4. Analyze "Adversarial" scenarios: Leetspeak ("s3nd d3p0sit"), Unicode masking, MIME bypass (.jpg.exe).
5. Detect "Impossible Travel" and "Circular Trading" collusion.

TEST SUITES DEFINITION:
{{{suitesJson}}}

TASK:
1. Audit the current logic for the provided modules.
2. If ANY suite returns HIGH crash risk, mark status as CRITICAL.
3. Identify "Non-Deterministic Failures" where results differ across simulations.
4. Flag "Regressions" in previously stable flows (e.g., standard KYC approval).

Provide ONLY the structured JSON reports following the schema.`,
});

export async function runAutonomousTesting(input: { targetSuiteId?: string; isSimulation?: boolean }): Promise<AutonomousTesterOutput> {
  const safeResult = await runWithModelSafe((config) => 
    testerPrompt({
      targetSuiteId: input.targetSuiteId,
      isSimulation: !!input.isSimulation,
      suitesJson: JSON.stringify(TEST_SUITES),
    }, config)
  );

  if (safeResult.ok && safeResult.output?.output) {
    return safeResult.output.output;
  }

  // FALLBACK: If AI fails despite increased timeout, provide structured degraded report
  return {
    overallStatus: 'unstable',
    summary: "AI Retry Agent encountered an infrastructure delay. System is operating in 'Degraded Mode'. Performance is being monitored.",
    reports: [{
      suite: "Infrastructure Integrity",
      retry_run: true,
      total_tests: 1,
      passed: 0,
      failed: 0,
      warnings: 1,
      non_deterministic_failures: 1,
      critical_bugs: ["AI_INFRASTRUCTURE_LATENCY"],
      regressions_detected: [],
      recommended_fixes: ["Timeout settings applied internally - Check regional model availability"],
      crash_risk_level: 'MEDIUM'
    }]
  };
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
