import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Robust Model Configuration for 'The Exchange'.
 * - Flash: Primary (High speed, low cost)
 * - Pro: Fallback (Complex reasoning / ID matching)
 */
export const MODELS_TO_TRY = [
  'googleai/gemini-1.5-flash',
  'googleai/gemini-1.5-pro',
];

export const ai = genkit({
  plugins: [googleAI()],
  // Set the most stable flash model as global default
  model: 'googleai/gemini-1.5-flash',
});

/**
 * Enhanced Model-safe execution wrapper.
 * Implements Fallback, Latency Tracking, and Error Classification.
 */
export async function runWithModelSafe<T>(
  promptFn: (config: { model: any }) => Promise<T>
): Promise<{ ok: boolean; output: T | null; error?: string; modelUsed: string; latency: number }> {
  const errors: string[] = [];
  const startTime = Date.now();

  for (const modelId of MODELS_TO_TRY) {
    const attemptStart = Date.now();
    try {
      console.log(`[AI-SAFE] Attempting execution with model: ${modelId}`);
      
      const result = await promptFn({ model: modelId });
      const latency = Date.now() - attemptStart;
      const totalLatency = Date.now() - startTime;

      console.info(`[AI-SUCCESS] Model: ${modelId} | Latency: ${latency}ms | Total: ${totalLatency}ms`);
      
      return { 
        ok: true, 
        output: result, 
        modelUsed: modelId, 
        latency: totalLatency 
      };
    } catch (error: any) {
      const msg = error.message || String(error);
      const latency = Date.now() - attemptStart;
      
      // Error Classification
      let category = 'UNKNOWN_FAILURE';
      if (msg.includes('404')) category = 'MODEL_MISMATCH_OR_UNAVAILABLE';
      else if (msg.includes('429')) category = 'RATE_LIMIT_EXCEEDED';
      else if (msg.includes('500') || msg.includes('503')) category = 'GOOGLE_API_OUTAGE';

      console.warn(`[AI-RETRY] ${category} for ${modelId} after ${latency}ms: ${msg}`);
      errors.push(`${modelId} (${category}): ${msg}`);
      
      // Attempt the next model in the fallback chain
      continue;
    }
  }

  const finalLatency = Date.now() - startTime;
  const finalErrorMessage = `AI Infrastructure Error: All models in fallback chain failed. Context: ${errors.join(' | ')}`;
  console.error(`[AI-CRITICAL] Total Latency: ${finalLatency}ms | ${finalErrorMessage}`);

  return { 
    ok: false, 
    output: null, 
    error: finalErrorMessage, 
    modelUsed: 'none',
    latency: finalLatency
  };
}