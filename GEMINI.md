# Project Instructions for Gemini

## Scope Discipline — MANDATORY

1. *Stay in scope.* Only touch the files necessary to complete the exact task described. Never modify, "improve," refactor, or "fix" any file that wasn't explicitly part of the request — even if you notice something that looks wrong elsewhere.

2. *Don't fix unrelated issues silently.* If you notice an unrelated problem in a file outside the current task's scope, STOP. Do not fix it. Instead, report it in plain language as a separate note at the end of your response, and wait for explicit approval before touching it.

3. *High-caution files* — never modify these unless the task explicitly names them:
    - firestore.rules
    - src/firebase/index.ts
    - src/lib/logger.ts
    - src/lib/sanitize.ts
    - Any file related to App Check, authentication, or PII redaction/sanitization

4. *Never swap dependencies, providers, or SDKs* (e.g. reCAPTCHA v3 → Enterprise, removing a sanitization function call, changing security rule logic, changing Firebase config) unless explicitly asked for that exact change by name.

5. *End-of-task summary required.* Before finishing any task, output a plain-language list of every file you touched and a one-sentence description of what changed in each — not a diff, a summary. If a file in that list wasn't part of the original task, flag it explicitly as OUT OF SCOPE — UNINTENDED so it's easy to spot.

## Project Context

- Stack: Next.js 15, Firebase (Firestore, Auth, Storage, App Hosting, Cloud Functions), Capacitor 6 (Android), TypeScript, Firebase Genkit + Gemini for AI flows.
- Terminal environment: PowerShell (use Select-String, Get-ChildItem, not Unix-only commands).
- Workflow: gated commits are mandatory — silence from the user is not approval to commit. Always run npm run build at repo root AND inside functions/ before any commit is proposed.
- Keep diffs tightly scoped — surprise diffs in unrelated files are a recurring problem and must be avoided.