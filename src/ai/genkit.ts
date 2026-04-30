import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Robust Model Configuration for 'The Exchange'.
 * Prioritized for stability and cost-efficiency.
 * Using '-latest' aliases to prevent 404 errors in specific regions.
 */
export const MODELS_TO_TRY = [
  'googleai/gemini-1.5-flash-latest', // Primary: High speed, low cost
  'googleai/gemini-1.5-pro-latest',   // Fallback: Maximum reasoning capability
];

export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-1.5-flash-latest',
});

/**
 * Model-safe execution wrapper.
 * Iterates through available models to ensure completion even during API outages.
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
      console.warn(`[AI-SAFE] Model execution failed for ${modelId}: ${msg}`);
      errors.push(`${modelId}: ${msg}`);
      
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
