import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Robust Model Configuration for 'The Exchange'.
 * Prioritized for cost-efficiency first (8B), then stability (Flash), then capability (Pro).
 */
export const MODELS_TO_TRY = [
  'googleai/gemini-1.5-flash-8b', // Lowest Cost - Primary for high-volume moderation
  'googleai/gemini-1.5-flash',    // Balanced - Secondary fallback
  'googleai/gemini-1.5-pro',      // High Capability - Ultimate fail-safe
];

export const ai = genkit({
  plugins: [googleAI()],
  model: MODELS_TO_TRY[0],
});

/**
 * Model-safe execution wrapper.
 * Iterates through available models to ensure completion even during API outages or version conflicts.
 */
export async function runWithModelSafe<T>(
  promptFn: (config: { model: any }) => Promise<T>
): Promise<{ ok: boolean; output: T | null; error?: string; modelUsed: string }> {
  const errors: string[] = [];

  for (const modelId of MODELS_TO_TRY) {
    try {
      console.log(`[AI-SAFE] Attempting execution with model: ${modelId}`);
      const result = await promptFn({ model: modelId });
      return { ok: true, output: result, modelUsed: modelId };
    } catch (error: any) {
      const msg = error.message || String(error);
      console.warn(`[AI-SAFE] Model ${modelId} failed: ${msg}`);
      errors.push(`${modelId}: ${msg}`);
      
      // If the error is a 404 (Not Found) or 403 (Forbidden), we definitely want to try the next model.
      continue;
    }
  }

  // If all models in the list failed
  const finalErrorMessage = `AI Infrastructure Error: All models failed. Debug log: ${errors.join(' | ')}`;
  console.error(`[AI-CRITICAL] ${finalErrorMessage}`);

  return { 
    ok: false, 
    output: null, 
    error: finalErrorMessage, 
    modelUsed: 'none' 
  };
}
