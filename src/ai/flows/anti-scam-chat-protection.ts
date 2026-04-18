'use server';
/**
 * @fileOverview Advanced Tiered AI Security Agent for Chat Fraud Prevention.
 * 
 * ARCHITECTURE:
 * 1. Rule-Based Detection (Fast/Free)
 * 2. Risk Scoring Engine
 * 3. AI Intent Analysis (Only for High-Risk/Ambiguous cases)
 * 4. Final Moderation Decision
 */

import {ai, runWithModelSafe} from '@/ai/genkit';
import {z} from 'genkit';
import { detectScam } from '@/lib/scam-rules';

const AntiScamChatProtectionInputSchema = z.object({
  message: z.string().describe('The chat message to be analyzed for fraud indicators.'),
  userTrustScore: z.number().optional().default(50),
});
export type AntiScamChatProtectionInput = z.infer<typeof AntiScamChatProtectionInputSchema>;

const AntiScamChatProtectionOutputSchema = z.object({
  isSuspicious: z.boolean(),
  riskScore: z.number(),
  decision: z.enum(['allow', 'warn', 'hold', 'block']),
  reason: z.string(),
  aiAnalysisPerformed: z.boolean().describe('Whether the heavy AI model was invoked for this message.'),
  audit: z.object({
    normalizedText: z.string(),
    matchedRules: z.array(z.string()),
    explanation: z.string(),
    aiReasoning: z.string().optional(),
  }),
});
export type AntiScamChatProtectionOutput = z.infer<typeof AntiScamChatProtectionOutputSchema>;

/**
 * AI Intent Analyzer Prompt
 * Only invoked when deterministic rules detect a potential but ambiguous threat.
 */
const intentAnalyzer = ai.definePrompt({
  name: 'intentAnalyzer',
  input: { 
    schema: z.object({ 
      message: z.string(), 
      matchedRules: z.array(z.string()),
      ruleExplanation: z.string()
    }) 
  },
  output: { 
    schema: z.object({
      intentRisk: z.enum(['safe', 'suspicious', 'malicious']),
      reasoning: z.string(),
      suggestedAction: z.enum(['allow', 'warn', 'block']),
    })
  },
  prompt: `You are an expert Anti-Fraud AI. 
A message was flagged by deterministic rules for patterns: {{{matchedRules}}}.
Detected issues: {{{ruleExplanation}}}

MESSAGE CONTENT:
"{{{message}}}"

TASK:
Analyze the INTENT of this message. Is it a legitimate trade inquiry or a social engineering attempt?
Scammers often use character obfuscation (spaced out letters), fake urgency, or specific platform redirection.
Legitimate users might mention numbers for logistics, but scammers usually demand off-platform payment.

Provide a final intent risk level and reasoning.`,
});

export async function antiScamChatProtection(input: AntiScamChatProtectionInput): Promise<AntiScamChatProtectionOutput> {
  // 1. DETERMINISTIC RULE SCAN (Layer 1 & 2)
  // This is fast, local, and free.
  const result = detectScam(input.message, input.userTrustScore);
  
  // 2. CONDITIONAL AI ANALYSIS (Layer 3)
  // We only call the LLM if the risk is significant but not yet definitive (Score 30 to 84).
  // Scores < 30 are considered safe enough. Scores >= 85 are auto-blocked.
  const isAmbiguous = result.score >= 30 && result.score < 85;
  let aiVerdict = null;

  if (isAmbiguous) {
    const aiResult = await runWithModelSafe((config) => 
      intentAnalyzer({
        message: input.message,
        matchedRules: result.matchedRules,
        ruleExplanation: result.explanation
      }, config)
    );

    if (aiResult.ok && aiResult.output?.output) {
      aiVerdict = aiResult.output.output;
    }
  }

  // 3. FINAL DECISION LOGIC (Layer 4)
  let finalDecision = result.action as any;
  let finalReason = result.explanation;

  if (aiVerdict) {
    if (aiVerdict.intentRisk === 'malicious') {
      finalDecision = 'block';
      finalReason = `AI Threat Detection: ${aiVerdict.reasoning}`;
    } else if (aiVerdict.intentRisk === 'suspicious') {
      finalDecision = 'hold';
      finalReason = `Security Warning: ${aiVerdict.reasoning}`;
    } else if (aiVerdict.intentRisk === 'safe') {
      // AI determined it's safe despite rule flags (e.g., false positive)
      finalDecision = 'allow';
      finalReason = 'AI verification: Potential pattern recognized but intent appears safe.';
    }
  }

  return {
    isSuspicious: finalDecision !== 'allow',
    riskScore: aiVerdict?.intentRisk === 'malicious' ? 95 : result.score,
    decision: finalDecision,
    reason: finalReason,
    aiAnalysisPerformed: !!aiVerdict,
    audit: {
      normalizedText: result.normalizedText,
      matchedRules: result.matchedRules,
      explanation: result.explanation,
      aiReasoning: aiVerdict?.reasoning
    }
  };
}
