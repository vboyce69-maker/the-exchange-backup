import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Optimized Model Configuration for 'The Exchange'.
 * Primary: Gemini 1.5 Flash 8B (Extremely low cost, high speed)
 * Fallback: Gemini 1.5 Flash (Standard reliability)
 */
export const PRIMARY_MODEL = 'googleai/gemini-1.5-flash-8b';
export const FALLBACK_MODEL = 'googleai/gemini-1.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model: PRIMARY_MODEL,
});

/**
 * Model-safe execution wrapper.
 * Gracefully handles 404, 429, and 500 errors by attempting a fallback model.
 * Focuses on cost-efficiency by starting with the lightest models.
 */
export async function runWithModelSafe<T>(
  promptFn: (config: { model: any }) => Promise<T>
): Promise<{ ok: boolean; output: T | null; error?: string; modelUsed: string }> {
  try {
    // Attempt with Primary (Low Cost) Model
    console.log(`[AI-COST-SAVER] Attempting execution with primary model: ${PRIMARY_MODEL}`);
    const result = await promptFn({ model: PRIMARY_MODEL });
    return { ok: true, output: result, modelUsed: PRIMARY_MODEL };
  } catch (error: any) {
    const errorMessage = (error.message || String(error)).toLowerCase();
    console.error(`[AI] Primary model error: ${errorMessage}`);
    
    // Determine if the error is recoverable
    const isRecoverable = 
      errorMessage.includes('404') || 
      errorMessage.includes('429') || 
      errorMessage.includes('500') || 
      errorMessage.includes('403') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('unsupported') ||
      errorMessage.includes('version');
    
    if (isRecoverable) {
      console.warn(`[AI] Falling back to standard model to maintain uptime...`);
      try {
        const fallbackResult = await promptFn({ model: FALLBACK_MODEL });
        return { 
          ok: true, 
          output: fallbackResult, 
          modelUsed: FALLBACK_MODEL, 
          error: `Recovered with fallback: ${errorMessage}` 
        };
      } catch (fallbackError: any) {
        console.error(`[AI] All models failed:`, fallbackError.message);
        return { 
          ok: false, 
          output: null, 
          error: `Infrastructure Error: No AI models available.`, 
          modelUsed: 'unknown' 
        };
      }
    }

    return { 
      ok: false, 
      output: null, 
      error: errorMessage, 
      modelUsed: PRIMARY_MODEL 
    };
  }
}
