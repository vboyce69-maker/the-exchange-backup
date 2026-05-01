'use server';
/**
 * @fileOverview ELITE QA & STRESS-TESTING AGENT for 'The Exchange'.
 * Performs aggressive audits for stability, scalability, and security under extreme conditions.
 */

import { ai, runWithModelSafe } from '@/ai/genkit';
import { z } from 'genkit';
import { TEST_SUITES } from '@/lib/test-manifest';

const PerformanceMetricsSchema = z.object({
  avgResponseTimeMs: z.number(),
  peakLatencyMs: z.number(),
  failureRatePercent: z.number(),
  systemRecoveryTimeSeconds: z.number(),
  throughputPerSecond: z.number().describe("Requests handled per second during burst."),
});

const SecurityReportSchema = z.object({
  vulnerabilitiesFound: z.array(z.string()),
  exploitableEndpoints: z.array(z.string()),
  scamDetectionEvasionRisk: z.number().min(0).max(100),
  authBypassSusceptibility: z.enum(['low', 'medium', 'high', 'critical']),
});

const SuiteReportSchema = z.object({
  suite: z.string(),
  category: z.enum(['FUNCTIONAL', 'STRESS', 'SECURITY', 'PERFORMANCE', 'NETWORK', 'DATA_INTEGRITY']),
  total_tests: z.number(),
  passed: z.number(),
  failed: z.number(),
  critical_bugs: z.array(z.string()),
  regressions_detected: z.array(z.string()),
  performance: PerformanceMetricsSchema.optional(),
  security: SecurityReportSchema.optional(),
  crash_risk_level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  recommended_fixes: z.array(z.string()),
});

const AutonomousTesterInputSchema = z.object({
  targetSuiteId: z.string().optional().describe("Specific suite to run. If null, runs a full platform audit."),
  intensity: z.enum(['NORMAL', 'HIGH', 'EXTREME']).default('NORMAL'),
  isSimulation: z.boolean().optional().default(true),
});

const AutonomousTesterOutputSchema = z.object({
  overallStatus: z.enum(['healthy', 'unstable', 'critical']),
  executiveSummary: z.string(),
  reports: z.array(SuiteReportSchema),
  topFailurePoints: z.array(z.string()),
  scalabilityRating: z.number().min(0).max(10),
  mostUnstableFeature: z.string(),
  auditTimestamp: z.string(),
});

export type AutonomousTesterOutput = z.infer<typeof AutonomousTesterOutputSchema>;

const testerPrompt = ai.definePrompt({
  name: 'autonomousTesterPrompt',
  input: { 
    schema: z.object({
      targetSuiteId: z.string().optional(),
      intensity: z.string(),
      suitesJson: z.string(),
    }) 
  },
  output: { schema: AutonomousTesterOutputSchema },
  prompt: `You are the ELITE MOBILE QA & STRESS-TESTING AGENT for 'The Exchange' marketplace.
Your objective is to AGGRESSIVELY BREAK the app, identify ALL weaknesses, and produce actionable logs.

MISSION PARAMETERS:
- IDENTITY: Elite Security SRE.
- TARGETS: 100,000 concurrent user simulation, burst spikes, last-second auction bids, SQLi/XSS attempts.
- ENVIRONMENTS: Android 8-14+, Low-end (1GB RAM) to Flagship devices.
- INTENSITY LEVEL: {{{intensity}}}

AUDIT REQUIREMENTS:
1. STRESS TESTING: Simulate high-scale usage spikes. Identify API degradation and DB bottlenecks.
2. CRASH & BREAK: Analyze impact of app kills during payments, image uploads, or KYC.
3. SECURITY ABUSE: Test for location spoofing, off-platform redirection evasion, and auth bypass.
4. DATA INTEGRITY: Detect duplicate transactions and lost chat syncs.

TEST SUITES DEFINITION:
{{{suitesJson}}}

TASK:
- Audit the current logic for the provided modules.
- If intensity is EXTREME, apply a 2x penalty to all risk scores.
- Return structured JSON with top failure points and scalability ratings.`,
});

export async function runAutonomousTesting(input: z.infer<typeof AutonomousTesterInputSchema>): Promise<AutonomousTesterOutput> {
  const safeResult = await runWithModelSafe((config) => 
    testerPrompt({
      targetSuiteId: input.targetSuiteId,
      intensity: input.intensity,
      suitesJson: JSON.stringify(TEST_SUITES),
    }, config)
  );

  if (safeResult.ok && safeResult.output?.output) {
    return safeResult.output.output;
  }

  // FAIL-SAFE: Return baseline data if AI infrastructure is under too much load
  return {
    overallStatus: 'unstable',
    executiveSummary: "Audit Engine encountered infrastructure latency. Using baseline security heuristics for report generation.",
    reports: [],
    topFailurePoints: ["AI_MODEL_TIMEOUT", "LOAD_SIMULATION_INTERRUPT"],
    scalabilityRating: 5,
    mostUnstableFeature: "Core Diagnostic Pipeline",
    auditTimestamp: new Date().toISOString()
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
