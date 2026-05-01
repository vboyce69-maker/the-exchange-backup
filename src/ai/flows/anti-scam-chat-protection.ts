'use server';
/**
 * @fileOverview Advanced Tiered AI Security Agent for Chat Fraud Prevention.
 */

import {ai, runWithModelSafe} from '@/ai/genkit';
import {z} from 'genkit';
import { detectScam } from '@/lib/scam-rules';

const maxDuration = 120; // Compliance with Next.js Server Action rules (not exported)

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
  prompt: `You are an expert Anti-Fraud AI for 'The Exchange' marketplace. 
A message was flagged by the Layer 2 Risk Engine for patterns: {{{matchedRules}}}.
Detected issues: {{{ruleExplanation}}}

MESSAGE CONTENT:
"{{{message}}}"

TASK:
Analyze the INTENT. Is this a legitimate trade inquiry or a social engineering attempt?
High risk signals: Asking for WhatsApp early, demanding EFT/Direct Pay, fake courier stories.
Low risk signals: Asking about item specs, price negotiation within reason, meeting at safe zones.

Provide a final intent risk level and reasoning.`,
});

export async function antiScamChatProtection(input: AntiScamChatProtectionInput): Promise<AntiScamChatProtectionOutput> {
  const result = detectScam(input.message, input.userTrustScore);
  const requiresAi = result.score > 60;
  let aiVerdict = null;

  if (requiresAi) {
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

  let finalDecision = result.action as any;
  let finalReason = result.explanation;

  if (aiVerdict) {
    if (aiVerdict.intentRisk === 'malicious') {
      finalDecision = 'block';
      finalReason = `AI Threat Detection: ${aiVerdict.reasoning}`;
    } else if (aiVerdict.intentRisk === 'suspicious') {
      finalDecision = 'hold';
      finalReason = `Security Warning (AI): ${aiVerdict.reasoning}`;
    } else if (aiVerdict.intentRisk === 'safe') {
      finalDecision = result.score >= 30 ? 'warn' : 'allow';
      finalReason = 'AI verification: Potential pattern recognized but intent appears safe.';
    }
  }

  return {
    isSuspicious: finalDecision !== 'allow',
    riskScore: result.score,
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
