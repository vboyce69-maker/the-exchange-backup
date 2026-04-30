import { genkit } from 'genkit';
import { googleAI, gemini15Flash, gemini15Pro } from '@genkit-ai/google-genai';

/**
 * Robust Model Configuration for 'The Exchange'.
 * Prioritized for stability and cost-efficiency.
 * Using imported model references from the Google AI plugin to prevent 404 string mismatches.
 */
export const MODELS_TO_TRY = [
  gemini15Flash,    // Balanced - Primary Choice
  gemini15Pro,      // High Capability - Ultimate fail-safe
];

export const ai = genkit({
  plugins: [googleAI()],
  model: gemini15Flash,
});

/**
 * Model-safe execution wrapper.
 * Iterates through available models to ensure completion even during API outages or version conflicts.
 */
export async function runWithModelSafe<T>(
  promptFn: (config: { model: any }) => Promise<T>
): Promise<{ ok: boolean; output: T | null; error?: string; modelUsed: string }> {
  const errors: string[] = [];

  for (const modelRef of MODELS_TO_TRY) {
    try {
      // Use the model name from the reference for logging
      const modelId = (modelRef as any).name || 'unknown-model';
      console.log(`[AI-SAFE] Attempting execution with model: ${modelId}`);
      
      const result = await promptFn({ model: modelRef });
      return { ok: true, output: result, modelUsed: modelId };
    } catch (error: any) {
      const msg = error.message || String(error);
      console.warn(`[AI-SAFE] Model execution failed: ${msg}`);
      errors.push(msg);
      
      // Attempt the next model in the fallback chain
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
