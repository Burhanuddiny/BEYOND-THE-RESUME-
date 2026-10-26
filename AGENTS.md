# Beyond the Resume — agent rules

You are building **Beyond the Resume**: a workplace-simulation platform where a college student (especially from a tier-2 or tier-3 college) completes realistic junior-engineer tasks — debug a C program, analyse a small dataset and explain a finding, respond professionally to a client reporting a bug — gets them evaluated by an AI evaluator against a published rubric, faces one realistic follow-up from a simulated colleague or client, and earns a **Skill Passport**: a public, read-only page a recruiter can open to see the actual work and the scores behind it.

The repo already contains a working front-end prototype (React + Tailwind, pink "vintage" theme) with **fake, hard-coded scores**. Your job is to turn it into a real, deployed, tested product without losing the look.

**Before writing any code, read `docs/README.md` and then the documents it lists, in order.** Work through `docs/phases/` one phase at a time. When this file and another document disagree, this file wins.

## How we are judged (optimise for this, in this order)

1. An automated code assessment scores the public GitHub repo on: **Problem Statement Alignment, Code Quality, Security, Efficiency, Testing, Accessibility, Google Services usage.** This alone decides the Top 10.
2. The Cloud Run link must work. A broken deployed link disqualifies the team, even from a Top 10 score.
3. Only the **final** submission's score counts, not the best one. Never submit a build that is worse than the previous one.
4. Top 10 teams pitch to human judges with a live demo.

(These rules come from the previous PromptWars event this team entered. Confirm them at the briefing; see `docs/06-IMPLEMENTATION-PLAN.md` §1.)

## Non-negotiable rules

1. **Deploy first, deploy often.** Cloud Run must have a working build from Phase 0 onward. After every phase: `npm run verify`, deploy, open the live URL.
2. **`npm run verify` is the gate.** It runs typecheck, lint, tests, build and the bundle check. Nothing is committed to `main`, deployed, or submitted while it is red.
3. **The model judges; the code verifies and decides.** Gemini returns a level (0–4) per rubric criterion *with quotes from the student's answer*. Code checks every quote really appears in the answer, runs deterministic checkpoints, and computes every number with the pure functions in `shared/scoring.ts`. Never let the model output a final score, and never show a number that was not computed by that code.
4. **No fake numbers, anywhere.** Delete every hard-coded score, percentile, "campus median", "benchmark", "+17% over average", fake passport ID, and unsourced statistic from the UI. If a number is shown, it was computed from real data or it is cited in `docs/01-RESEARCH.md`.
5. **Answer keys never reach the browser.** Model answers, reference notes, checkpoints and follow-up briefs live only in `server/graders/`. The client bundle is checked for this by `npm run check:bundle`. The "Auto-Fill Sample" button is removed.
6. **Student text is untrusted input.** Validate every request body with zod. Wrap student text in delimiters in prompts, tell the model it is data, and flag injection attempts (`server/lib/injection.ts`). Validate every model response with zod before use.
7. **No secrets in the repo or the client.** `GEMINI_API_KEY` lives in Secret Manager and reaches the server as an environment variable. The Firebase web config is public by design and is served from `/api/config`. Firestore is reachable only through the server (security rules deny all client access).
8. **Check the docs before using a Gemini or Firebase API surface.** SDKs change. Before writing Gemini code, open the URLs in `docs/05-AI-EVALUATION-ENGINE.md` §9 and copy the current snippet. Model IDs are environment variables, never literals scattered in code.
9. **Reuse before writing.** Keep the existing pages, components, colours and copy style. Change behaviour, not the look. Reuse the existing `@` path alias (`@/shared/...`).
10. **Stay in scope.** Three tasks, done deeply. Build only what the current phase lists. Stretch items only after every earlier phase is deployed and green.
11. **Repo hygiene.** Single `main` branch, no binaries, no bitmap images, `.env` never committed, `package-lock.json` committed.

## Stack (fixed — do not substitute)

- Node.js 22 (≥ 22.12), TypeScript **6.0.x** (`~6.0.3`; typescript-eslint does not support 7 yet), ES modules, one `package.json`, one container.
- Web: Vite 8 + React 19 + Tailwind CSS v4 (already set up), `lucide-react` icons, no router library, no state library, no UI kit.
- Server: Express 5, `helmet`, `express-rate-limit`, `compression`, `zod` v4, `@google/genai` (Gemini), `firebase-admin` (Auth token verification + Firestore).
- Client auth: `firebase` web SDK (Anonymous + Google sign-in).
- Tests: Vitest 5, `supertest`, `@testing-library/react`, `jsdom`, `axe-core`, `@vitest/coverage-v8`.
- Lint: ESLint 9 flat config, `typescript-eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`.
- Deploy: Cloud Run in `asia-south1`, `gcloud run deploy --source .` with the repo `Dockerfile`, secrets via `--set-secrets`.

## Code style

- `strict: true`. No `any`, no non-null assertions (`!`), no `@ts-ignore`.
- Pure logic (scoring, evidence verification, checkpoints, passport aggregation, injection detection, schemas) lives in `shared/` or `server/lib/` — outside React components and outside Express handlers — so it is unit-testable.
- The server is built by a factory, `createApp({ store, model, verifyToken })`, so tests inject fakes. No module-level singletons that tests cannot replace.
- One-line JSDoc on every exported function. Comments explain constraints, not what the code does.
- Errors returned to the client are `{ error: 'short_code' }` with no internal detail. Details go to structured logs (`server/lib/log.ts`). Never log student answers, ID tokens or API keys.
- No dead code, no commented-out code, no stray `console.log`.

## Accessibility is part of the product

- Every interactive element is a real `<button>`, `<a>` or form control with a visible label or `aria-label`.
- Visible focus ring on everything focusable; full keyboard operation; logical heading order (one `h1` per page).
- Scores are never shown by colour alone: always a number and a text band ("Proficient").
- Long-running actions (evaluation takes 5–20 s) announce progress in an `aria-live="polite"` region.
- WCAG 2.2 AA contrast. Check the light pink-on-white text in the existing theme and darken any token that fails.
- Respect `prefers-reduced-motion`. Layout works at 360 px wide and at 200% zoom.

## Working method

- One phase at a time. At the start of a phase, restate its acceptance criteria. At the end, show evidence each one is met (test output, live URL check, screenshot).
- Write the test in the same step as the logic it covers.
- Use the browser to check every UI change at 360 px and 1280 px widths before calling it done.
- If something is blocked for more than 15 minutes, take the fallback named in the phase doc and move on. Record what was cut in the README's "Known limitations".
- Commit after each green step with a conventional message (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
