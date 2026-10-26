# 06 — Implementation plan

The order of work, the time budget, how we submit, the scoring checklist, and what to do when something breaks. Each phase has its own step-by-step document in `docs/phases/`.

---

## 1. Assumptions to confirm at the briefing

| Assumption | If it turns out different |
|---|---|
| Automated code assessment on the 7 criteria in `AGENTS.md` decides the Top 10 | Re-read the criteria and re-prioritise §6 |
| A working Cloud Run link is mandatory | If another host is allowed, still use Cloud Run (it is a Google-services point) |
| Only the final submission counts | If best-of counts, submit more often |
| Build window of about 6–8 hours | Under 5 hours: drop Phase 5 (public passport) to a minimal version and skip Phase 7. Multi-day: do everything including Phase 7 |
| Pre-existing scaffold commits are allowed | If not, ask whether the docs folder may stay; the code plan does not depend on the old code |
| Official problem statement matches `01-RESEARCH.md` §1 | Update the PRD and the README mapping table before Phase 1 |

---

## 2. Phases and budget

| Phase | Doc | Effort | Ends with |
|---|---|---|---|
| 0 Foundation | `phases/PHASE-0-foundation.md` | 45 min | Install fixed, Express serves the app, `verify` green, **deployed to Cloud Run** |
| 1 Domain core | `phases/PHASE-1-domain-core.md` | 60 min | Shared types, tasks, graders, scoring, evidence, passport aggregation — all unit-tested; answer keys out of the client |
| 2 Evaluation engine | `phases/PHASE-2-evaluation-engine.md` | 75 min | Real Gemini evaluation and follow-up through the API (memory store), route tests green, calibration run |
| 3 Auth + persistence | `phases/PHASE-3-auth-and-persistence.md` | 60 min | Firebase anonymous + Google sign-in, Firestore store, profile route, deployed |
| 4 Front-end wiring | `phases/PHASE-4-frontend-wiring.md` | 90 min | Full student journey on the live URL, zero fake data. **First submission** |
| 5 Public passport | `phases/PHASE-5-public-passport.md` | 45 min | Publish, `/p/:id`, share, print |
| 6 Hardening | `phases/PHASE-6-hardening-and-submission.md` | 45 min | Checklist §6 all ticked, README done. **Second submission** |
| 7 Stretch | `phases/PHASE-7-stretch.md` | rest | Only if 0–6 are green and deployed |
| Freeze | — | 15 min | Final verify, deploy, phone check, final submission |

Total for phases 0–6: about 7 hours. If the window is shorter, the cut order is: Phase 7, then the print stylesheet and LinkedIn copy (Phase 5), then Google account linking (keep anonymous only, with self-declared names), then the follow-up *evaluation* (keep the follow-up message, score the main answer only). **Never cut**: the evaluator, evidence verification, tests, the security middleware, or the deploy.

### Two agents in parallel (optional)

Antigravity's Agent Manager can run two agents. Only these pairs have disjoint file scopes:

- During Phase 2: **Agent A** does `server/services/**`, `server/prompts/**`, `server/routes/attempts.ts`, `tests/evaluator.test.ts`. **Agent B** does Phase 3's `src/lib/firebase.ts`, `src/lib/useAuth.ts`, `server/middleware/auth.ts`, `server/store/firestoreStore.ts`.
- During Phase 4: **Agent A** does `src/pages/AssessmentPage.tsx` and its components. **Agent B** does Dashboard, Tasks, Navbar, Footer and the Landing copy.

Everything else is sequential. Phase 1 must be finished before anything else starts, because it defines the types everything imports.

---

## 3. Submission strategy

- **Submission 1** at the end of Phase 4: the full student journey works on the live URL.
- **Submission 2** at the end of Phase 6: hardened, documented.
- **Final** at the freeze: only if `verify` is green and a full journey works on a phone. Otherwise re-submit the last green commit.
- Before every submission: `npm run verify`, deploy, open the live URL in an incognito window on a phone, complete one task end to end, open the public passport on a second device.

---

## 4. Canonical `package.json` scripts

Set these in Phase 0 and do not rename them.

```json
{
  "dev": "tsx watch server/index.ts",
  "build": "vite build && esbuild server/index.ts --bundle --platform=node --format=esm --packages=external --outfile=dist-server/index.js",
  "start": "node dist-server/index.js",
  "typecheck": "tsc --noEmit",
  "lint": "eslint .",
  "test": "vitest run",
  "test:coverage": "vitest run --coverage",
  "check:bundle": "vitest run tests/bundle.test.ts",
  "verify": "npm run typecheck && npm run lint && npm run test && npm run build && npm run check:bundle",
  "calibrate": "tsx scripts/calibrate.ts",
  "clean": "node -e \"for (const d of ['dist','dist-server']) require('fs').rmSync(d,{recursive:true,force:true})\""
}
```

`tests/bundle.test.ts` is skipped when `dist/` does not exist, so `npm test` passes before a build. `verify` runs it after the build.

---

## 5. Definition of done (every phase)

1. The phase's acceptance criteria are each shown with evidence (command output, a screenshot, or a URL checked).
2. `npm run verify` is green.
3. Deployed (`docs/07-DEPLOYMENT.md` §4), and `/healthz` plus the changed feature checked on the live URL.
4. Committed with a conventional message and pushed to `main`.
5. Anything cut or deferred is written in the README's "Known limitations".

---

## 6. Scoring checklist

Walk this line by line in Phase 6. Each line names where the evidence lives.

**Problem statement alignment**
- [ ] README opens with the official problem statement and a table mapping each phrase to a feature and a file.
- [ ] The three named tasks exist and work end to end: `shared/tasks/`, `server/graders/`.
- [ ] Work is evaluated, with evidence: `server/services/evaluator.ts`, `shared/evidence.ts`.
- [ ] Simulation reacts (follow-up): `server/services/followUp.ts`.
- [ ] Recruiter-facing proof: `/p/:id`, `src/pages/PublicPassportPage.tsx`.
- [ ] No fake statistics anywhere in the UI.

**Code quality**
- [ ] `strict: true`; zero `any`, `!` or `@ts-ignore` (`grep -rn "any\b\|@ts-ignore" shared server src` comes back clean).
- [ ] ESLint clean with typescript-eslint, react-hooks and jsx-a11y.
- [ ] Shared types used by both sides; pure logic outside React and Express.
- [ ] JSDoc on exported functions; no dead or commented-out code; no `console.log`.
- [ ] CI workflow runs `verify` on every push and is green.
- [ ] Conventional commits.

**Security**
- [ ] No secret in the repo or the bundle; `.env.example` only.
- [ ] Answer keys server-only; `check:bundle` passes; `/api/tasks` test proves no grader fields leak.
- [ ] helmet with an explicit CSP; `Permissions-Policy` denies camera, microphone and geolocation.
- [ ] Rate limits on all routes, stricter on evaluation and public passport.
- [ ] zod `.strict()` validation on every body and param; JSON body limit 32 kB.
- [ ] ID token verified on every authenticated route; ownership checks return 404.
- [ ] Prompt-injection handling: delimiters, system instruction, evidence caps, flag; described in README.
- [ ] `firestore.rules` denies all client access and is deployed.
- [ ] Container runs as non-root; `npm audit --omit=dev` has no high or critical findings.
- [ ] Logs contain no answers, tokens or keys.

**Efficiency**
- [ ] Task content bundled (no fetch to show a brief).
- [ ] Evaluation and follow-up generation run in parallel (`Promise.allSettled`).
- [ ] Assessment and Public Passport pages lazy-loaded (`React.lazy`); initial JS ≤ 200 kB gzipped.
- [ ] `compression`; immutable cache headers for hashed assets; `index.html` not cached.
- [ ] `/api/me` makes one Firestore query for attempts, not one per task.
- [ ] Gemini `thinking_level: 'low'`; three calls per attempt, no more.

**Testing**
- [ ] Scoring: worked example plus every boundary.
- [ ] Evidence verification, passport aggregation, injection scan, schemas.
- [ ] Graders: model answer hits every checkpoint; weak and paste-back answers do not.
- [ ] Evaluator with the fake model: retry, fallback, caps, invalid output.
- [ ] Routes with supertest: happy path, 400, 401, 404 ownership, 409 state, 429, 503.
- [ ] Security headers test.
- [ ] axe accessibility test on every page.
- [ ] Bundle-leak test.
- [ ] Coverage figure in the README (aim for 80%+ on `shared/` and `server/`).

**Accessibility**
- [ ] Every rule in `AGENTS.md` "Accessibility is part of the product".
- [ ] Keyboard-only run through one full task.
- [ ] Contrast checked on the pink theme; failing tokens darkened.
- [ ] `aria-live` progress during evaluation; focus moves to the follow-up message, then to the report heading.
- [ ] 360 px and 200% zoom checked.

**Google services**
- [ ] README table: Gemini, Firebase Auth, Firestore, Cloud Run, Secret Manager, Cloud Build, Artifact Registry, Cloud Logging — each with the file that uses it.
- [ ] Each one is really exercised on the live deployment.

---

## 7. Risks and fallbacks

| Risk | Fallback |
|---|---|
| `interactions.create` shape differs or rejects the schema | Switch the adapter body to `models.generateContent` with `responseJsonSchema` (see `05` §9). Nothing else changes. |
| Gemini slow (> 20 s) at the venue | Keep `thinking_level: 'low'`; try `gemini-3.5-flash-lite` via `GEMINI_MODEL`; the progress UI keeps the wait honest |
| Gemini quota or key problem on demo day | `GEMINI_MODEL` env change; second key in Secret Manager; the demo video as last resort |
| Firebase popup blocked or third-party cookies blocked | Anonymous mode still works end to end; publishing with a self-declared name is allowed (FR-P2) |
| Firestore not set up in time | `STORE=memory` on Cloud Run with `--max-instances 1` keeps the demo working (data resets on restart); note in Known limitations |
| Calibration shows scores too generous | Tighten the wording in the evaluator system instruction ("not generous", anchors); never change the formula to hide it |
| CSP blocks Firebase or Google Fonts | Read the browser console; add the exact origin listed in the violation to the allow-list in `server/middleware/security.ts` |
| A late change breaks the build | Final submission is the last commit where `verify` passed and the phone check succeeded |

---

## 8. How to drive the coding agent (for the human)

Use one prompt per phase, in this form:

> Read `AGENTS.md`, `docs/README.md` and `docs/phases/PHASE-N-....md` completely, plus the documents that phase lists under "Read first". Restate the acceptance criteria. Then implement the phase step by step, writing tests alongside the code. Run `npm run verify` and fix everything until it is green. Deploy using `docs/07-DEPLOYMENT.md` §4 and check the live URL. Show me evidence for each acceptance criterion. Commit and push.

If the agent drifts (adds a library, invents a number, skips tests), point it back to the specific rule in `AGENTS.md` by number.
