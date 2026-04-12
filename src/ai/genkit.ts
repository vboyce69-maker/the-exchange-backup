import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Centralized Model Configuration for 'The Exchange'.
 * Primary: Gemini 2.0 Flash (Latest, high speed)
 * Fallback: Gemini 1.5 Flash (Highly stable)
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
 * 
 * @param promptFn - A function that executes the Genkit prompt or generate call.
 * @returns A structured result indicating success, model used, and any errors.
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
    // Check for common recoverable errors or specific model failures
    const isRecoverable = 
      errorMessage.includes('404') || 
      errorMessage.includes('429') || 
      errorMessage.includes('500') || 
      errorMessage.includes('not found') ||
      errorMessage.includes('unsupported');
    
    if (isRecoverable) {
      console.warn(`[AI SECURITY] Primary model (${PRIMARY_MODEL}) failed: ${errorMessage}. Attempting fallback to ${FALLBACK_MODEL}...`);
      try {
        // Attempt with Fallback Model
        const fallbackResult = await promptFn({ model: FALLBACK_MODEL });
        return { 
          ok: true, 
          output: fallbackResult, 
          modelUsed: FALLBACK_MODEL, 
          error: `Recovered with fallback: ${errorMessage}` 
        };
      } catch (fallbackError: any) {
        console.error(`[AI SECURITY] Critical: Fallback model (${FALLBACK_MODEL}) also failed: ${fallbackError.message}`);
        return { 
          ok: false, 
          output: null, 
          error: fallbackError.message, 
          modelUsed: FALLBACK_MODEL 
        };
      }
    }

    // For non-recoverable errors (e.g. invalid prompt schema), fail fast
    return { 
      ok: false, 
      output: null, 
      error: errorMessage, 
      modelUsed: PRIMARY_MODEL 
    };
  }
}
