import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Centralized Model Configuration for 'The Exchange'.
 * Primary: Gemini 2.0 Flash (Stable, High speed)
 * Fallback: Gemini 1.5 Pro (Deep reasoning)
 */
export const PRIMARY_MODEL = 'googleai/gemini-2.0-flash';
export const FALLBACK_MODEL = 'googleai/gemini-1.5-pro';

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
    const result = await promptFn({ model: PRIMARY_MODEL });
    return { ok: true, output: result, modelUsed: PRIMARY_MODEL };
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    const isRecoverable = 
      errorMessage.includes('404') || 
      errorMessage.includes('429') || 
      errorMessage.includes('500') || 
      errorMessage.includes('not found') ||
      errorMessage.includes('unsupported');
    
    if (isRecoverable) {
      try {
        const fallbackResult = await promptFn({ model: FALLBACK_MODEL });
        return { 
          ok: true, 
          output: fallbackResult, 
          modelUsed: FALLBACK_MODEL, 
          error: `Recovered with fallback: ${errorMessage}` 
        };
      } catch (fallbackError: any) {
        return { 
          ok: false, 
          output: null, 
          error: fallbackError.message, 
          modelUsed: FALLBACK_MODEL 
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
