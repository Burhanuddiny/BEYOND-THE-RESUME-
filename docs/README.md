# Beyond the Resume — planning documents

These documents are the blueprint for building Beyond the Resume. They were written so that a coding agent (Antigravity with Gemini) can build the whole product end to end without guessing. The always-on rules are in `/AGENTS.md`.

Written on 2026-10-19. Library versions and Gemini API shapes were checked on that date (see each document for the exact checks).

## Reading order

| # | Document | What it answers | Read when |
|---|---|---|---|
| 1 | [01-RESEARCH.md](01-RESEARCH.md) | What is the problem, who has it, what exists already, what wins this hackathon | Before anything else |
| 2 | [02-PRD.md](02-PRD.md) | What exactly the product does: users, journeys, features, acceptance criteria | Before anything else |
| 3 | [03-ARCHITECTURE.md](03-ARCHITECTURE.md) | How the pieces fit: components, decisions and why, Google services, security model, file tree | Before Phase 0 |
| 4 | [04-DATA-FLOW-AND-CONTRACTS.md](04-DATA-FLOW-AND-CONTRACTS.md) | Every type, every API route, the Firestore data model, sequence diagrams | Before Phase 1; keep open while coding |
| 5 | [05-AI-EVALUATION-ENGINE.md](05-AI-EVALUATION-ENGINE.md) | The heart of the product: prompts, schemas, evidence verification, scoring formula, follow-ups, all three graders | Before Phase 1 and Phase 2 |
| 6 | [06-IMPLEMENTATION-PLAN.md](06-IMPLEMENTATION-PLAN.md) | The phase order, time budget, submission strategy, scoring checklist, risks | Before Phase 0 |
| 7 | [07-DEPLOYMENT.md](07-DEPLOYMENT.md) | Google Cloud and Firebase setup by hand, deploy commands, environment variables | Before Phase 0 (setup), every deploy |
| 8 | [08-PITCH-AND-SUBMISSION.md](08-PITCH-AND-SUBMISSION.md) | README outline, submission text, demo script, pitch | Phase 6 and the pitch |

## Phase documents

Build in this order. Each phase ends with `npm run verify` green, a deploy, and the live URL checked.

| Phase | Document | Outcome |
|---|---|---|
| 0 | [phases/PHASE-0-foundation.md](phases/PHASE-0-foundation.md) | Install fixed, Express server, Docker, lint, tests, CI, first Cloud Run deploy |
| 1 | [phases/PHASE-1-domain-core.md](phases/PHASE-1-domain-core.md) | Shared types, public tasks, server-only graders, scoring and evidence logic, all unit-tested |
| 2 | [phases/PHASE-2-evaluation-engine.md](phases/PHASE-2-evaluation-engine.md) | Gemini evaluator, follow-up generator, attempts API, in-memory store, route tests |
| 3 | [phases/PHASE-3-auth-and-persistence.md](phases/PHASE-3-auth-and-persistence.md) | Firebase Auth (anonymous + Google), Firestore store, profile |
| 4 | [phases/PHASE-4-frontend-wiring.md](phases/PHASE-4-frontend-wiring.md) | Real assessment flow in the UI, real dashboard and passport, all fake data gone. **First submission.** |
| 5 | [phases/PHASE-5-public-passport.md](phases/PHASE-5-public-passport.md) | Publish, public recruiter page `/p/:id`, share and print |
| 6 | [phases/PHASE-6-hardening-and-submission.md](phases/PHASE-6-hardening-and-submission.md) | Security, accessibility and quality sweep, README. **Second submission.** |
| 7 | [phases/PHASE-7-stretch.md](phases/PHASE-7-stretch.md) | Only if everything above is green: more tasks, "ask a senior" hint chat |

## Where the current code stands (2026-10-19)

- A front-end prototype exists: `src/pages/` (Landing, Dashboard, Tasks, Assessment, Skill Passport), `src/components/` (Navbar, Footer), task content in `src/data/mockData.ts`.
- **`npm install` fails on a clean clone**: `esbuild ^0.25` conflicts with Vite 8's peer range. Bumping to `esbuild ^0.28.0` fixes it (verified). Phase 0 step 1.
- After that fix, `tsc --noEmit` and `vite build` pass. TypeScript 7.0.2 is installed, but `typescript-eslint` supports only `<6.1`, so Phase 0 pins `typescript ~6.0.3` (verified: the current code typechecks cleanly on 6.0.3).
- There is **no server, no AI call, no database, no tests, no Dockerfile**. All scores are hard-coded in `src/App.tsx` (`handleSubmitTask`) and `src/data/mockData.ts`.
- Model answers (`sampleSolution`) are shipped to the browser, and an "Auto-Fill Sample" button pastes them into the answer box.
