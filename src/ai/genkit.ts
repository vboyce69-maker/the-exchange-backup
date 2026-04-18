import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Centralized Model Configuration for 'The Exchange'.
 * Primary: Gemini 2.0 Flash (Stable, High speed)
 * Fallback: Gemini 1.5 Flash (Highly available, resilient)
 */
export const PRIMARY_MODEL = 'googleai/gemini-2.0-flash';
export const FALLBACK_MODEL = 'googleai/gemini-1.5-flash';

export const ai = genkit({
  plugins: [googleAI()],
  model: PRIMARY_MODEL,
});

/**
 * Model-safe execution wrapper.
 * Gracefully handles 404, 429, and 500 errors by attempting a fallback model.
 */
export async function runWithModelSafe<T>(
  promptFn: (config: { model: any }) => Promise<T>
): Promise<{ ok: boolean; output: T | null; error?: string; modelUsed: string }> {
  try {
    // Attempt with Primary Model
    const result = await promptFn({ model: PRIMARY_MODEL });
    return { ok: true, output: result, modelUsed: PRIMARY_MODEL };
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    
    // Determine if the error is a transient infrastructure or quota issue
    const isRecoverable = 
      errorMessage.includes('404') || 
      errorMessage.includes('429') || 
      errorMessage.includes('500') || 
      errorMessage.includes('not found') ||
      errorMessage.includes('unsupported');
    
    if (isRecoverable) {
      console.warn(`Primary model (${PRIMARY_MODEL}) failed: ${errorMessage}. Attempting fallback...`);
      try {
        // Attempt with Fallback Model
        const fallbackResult = await promptFn({ model: FALLBACK_MODEL });
        return { 
          ok: true, 
          output: fallbackResult, 
          modelUsed: FALLBACK_MODEL, 
          error: `Recovered with fallback after primary error: ${errorMessage}` 
        };
      } catch (fallbackError: any) {
        console.error(`Fallback model (${FALLBACK_MODEL}) also failed:`, fallbackError.message);
        return { 
          ok: false, 
          output: null, 
          error: `Both primary and fallback models failed. Last error: ${fallbackError.message}`, 
          modelUsed: FALLBACK_MODEL 
        };
      }
    }

    // Non-recoverable error (e.g., validation error)
    return { 
      ok: false, 
      output: null, 
      error: errorMessage, 
      modelUsed: PRIMARY_MODEL 
    };
  }
}
