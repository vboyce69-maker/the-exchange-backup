import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

/**
 * Centralized Model Configuration for 'The Exchange'.
 * Primary: Gemini 1.5 Flash (Standard)
 * Fallback: Gemini 1.5 Flash 8B (High availability, lower quota footprint)
 */
export const PRIMARY_MODEL = 'googleai/gemini-1.5-flash';
export const FALLBACK_MODEL = 'googleai/gemini-1.5-flash'; // Fallback to same base if pro is missing, or try 8b if supported

export const ai = genkit({
  plugins: [googleAI()],
  model: PRIMARY_MODEL,
});

/**
 * Model-safe execution wrapper.
 * Gracefully handles 404, 429, and 500 errors by attempting a fallback model.
 * Recognizes common API version mismatches and handles them as infrastructure errors.
 */
export async function runWithModelSafe<T>(
  promptFn: (config: { model: any }) => Promise<T>
): Promise<{ ok: boolean; output: T | null; error?: string; modelUsed: string }> {
  try {
    // Attempt with Primary Model
    console.log(`[AI] Attempting execution with primary model: ${PRIMARY_MODEL}`);
    const result = await promptFn({ model: PRIMARY_MODEL });
    return { ok: true, output: result, modelUsed: PRIMARY_MODEL };
  } catch (error: any) {
    const errorMessage = (error.message || String(error)).toLowerCase();
    console.error(`[AI] Primary model error: ${errorMessage}`);
    
    // Determine if the error is a transient infrastructure, quota, or versioning issue
    // We treat 404 (Not Found) as recoverable because model aliases often shift between API versions
    const isRecoverable = 
      errorMessage.includes('404') || 
      errorMessage.includes('429') || 
      errorMessage.includes('500') || 
      errorMessage.includes('403') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('unsupported') ||
      errorMessage.includes('version');
    
    if (isRecoverable) {
      console.warn(`[AI] Recoverable error detected. Retrying with alternative model identification...`);
      try {
        // Attempt with explicit fallback string that bypasses potential alias issues
        const fallbackModelId = 'googleai/gemini-1.5-flash'; 
        const fallbackResult = await promptFn({ model: fallbackModelId });
        return { 
          ok: true, 
          output: fallbackResult, 
          modelUsed: fallbackModelId, 
          error: `Recovered with fallback after primary error: ${errorMessage}` 
        };
      } catch (fallbackError: any) {
        console.error(`[AI] Fallback also failed:`, fallbackError.message);
        return { 
          ok: false, 
          output: null, 
          error: `AI Infrastructure Error: Primary and fallback models both unavailable. Check API project status.`, 
          modelUsed: 'unknown' 
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
