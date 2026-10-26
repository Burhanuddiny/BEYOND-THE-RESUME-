# 03 — Architecture

How the system is put together and why. Contracts (types, routes, data model) are in `04-DATA-FLOW-AND-CONTRACTS.md`; the evaluator internals are in `05-AI-EVALUATION-ENGINE.md`.

---

## 1. System diagram

```mermaid
flowchart LR
  subgraph Browser["Student or recruiter browser - React SPA"]
    PAGES["Pages: Landing, Dashboard, Tasks, Assessment, Passport, Public Passport"]
    TASKS["shared/tasks - public task content, bundled"]
    AUTH["Firebase Auth web SDK - anonymous and Google"]
    API["src/lib/api.ts - fetch with ID token"]
    PAGES --- TASKS
    PAGES --- API
    API --- AUTH
  end

  subgraph Run["Cloud Run service: beyond-the-resume, asia-south1"]
    MW["helmet, CSP, compression, rate limits, zod, auth middleware"]
    ROUTES["/api routes"]
    EVAL["Evaluator + follow-up generator"]
    SCORE["shared/scoring.ts - pure scoring"]
    GRADERS["server/graders - answer keys, server only"]
    STORE["Store interface - Firestore implementation"]
    STATIC["Static SPA from dist/"]
    MW --> ROUTES
    ROUTES --> EVAL
    EVAL --> GRADERS
    EVAL --> SCORE
    ROUTES --> STORE
  end

  API -->|"HTTPS JSON + Bearer ID token"| MW
  AUTH <-->|"sign-in"| FBA["Firebase Authentication"]
  MW -->|"verifyIdToken"| FBA
  EVAL -->|"interactions.create, structured JSON"| GEM["Gemini API - gemini-3.8-flash"]
  STORE --> FS["Cloud Firestore"]
  SM["Secret Manager"] -->|"GEMINI_API_KEY at deploy"| Run
  Run --> LOG["Cloud Logging - structured JSON"]
```

---

## 2. Components

| Component | Location | Responsibility |
|---|---|---|
| SPA | `src/` | Existing pages, rewired to real data. Tiny router (`useRoute`). Auth hook. API client. Integrity tracker. |
| Shared domain | `shared/` | Types, pillar definitions, zod schemas, public task content, **pure** scoring, evidence verification, passport aggregation. Imported by both sides. |
| HTTP server | `server/app.ts` | Express 5 app built by `createApp(deps)`: middleware, routes, static files, SPA fallback, error handler. |
| Auth middleware | `server/middleware/auth.ts` | Verifies the Firebase ID token and sets `req.user = { uid, provider, name }`. |
| Evaluator | `server/services/evaluator.ts` | Builds the prompt, calls the model, validates output, verifies evidence, returns judgements. |
| Follow-up | `server/services/followUp.ts` | Generates the in-character follow-up (with fallback) and evaluates the reply. |
| Model adapter | `server/services/gemini.ts` | The only file that imports `@google/genai`. Exposes `generateJson({ system, input, schema })`. |
| Graders | `server/graders/` | Per task: reference notes, checkpoints, model answer, follow-up persona, brief, fallback and criterion. |
| Store | `server/store/` | `Store` interface with `FirestoreStore` (production) and `MemoryStore` (tests and local dev without credentials). |
| Logger | `server/lib/log.ts` | One-line JSON logs with `severity`, which Cloud Logging parses. |

---

## 3. Decisions and the reasoning behind them

**D1. One Cloud Run service serves both the SPA and the API.**
One deploy, one URL, no CORS, one thing to keep alive for judging. The server is about 15 small files. Splitting it would add failure points and no benefit.

**D2. Public task content is bundled into the client; answer keys stay on the server.**
The brief, code snippet, table and email are needed instantly and are not secret, so they ship in the JS bundle (no loading state to start a task). Everything that would let a student game the evaluator — model answer, reference notes, checkpoint patterns, follow-up brief — lives in `server/graders/`, and a build step fails if any of it appears in `dist/`. The prototype currently ships the model answers to the browser; fixing that is a visible Security point.

**D3. The model judges; the code verifies and decides.**
Gemini returns levels and quotes, never final numbers. Code verifies quotes, runs checkpoints and computes all scores with one tested formula. This makes scores explainable, reproducible from stored judgements, testable without the model, and resistant to a model that is over-generous or hallucinates evidence. Full design in `05`.

**D4. A server-side, timestamped attempt lifecycle.**
`in_progress → awaiting_follow_up → complete`. The server owns `startedAt` and `completedAt`, so the duration on a passport cannot be faked by the client. The follow-up is generated at submit time and stored, so a page reload resumes exactly where the student was.

**D5. Firebase Auth with silent anonymous sign-in, upgraded to Google on publish.**
Zero friction to start (judges and students click once and are working), real identity only when it matters (publishing). `linkWithPopup` keeps the same UID, so attempts carry over. The server trusts only a verified ID token, never a UID sent in a body.

**D6. Firestore accessed only through the server with the Admin SDK.**
Security rules deny all client reads and writes (`firestore.rules`). That gives one place for validation and authorisation (the API), and makes the public passport a deliberate, minimal snapshot rather than a view onto user data.

**D7. A `Store` interface with two implementations.**
`FirestoreStore` in production and `MemoryStore` for tests and for running locally without Google credentials (`STORE=memory`). Route tests run fast and offline. This is the only interface in the codebase with two real implementations, which is why it exists.

**D8. The Gemini Interactions API, with `store: false` and structured output.**
The current Gemini docs (checked 2026-10-19) use `client.interactions.create({ model, system_instruction, input, response_format, generation_config, store })`, and the installed `@google/genai` 2.30 exposes it. `store: false` means Google does not retain the student's answer for server-side conversation state; we do not need it, because each call is self-contained. A JSON schema generated from the same zod schema we validate with keeps the contract in one place.

**D9. A three-call evaluation, run in parallel where possible.**
Submit runs two calls at once: evaluate the main answer, and generate the follow-up (which needs only the answer, not the evaluation). The follow-up reply is evaluated in a third call. User-perceived wait is one call, not two.

**D10. No router, state or UI library.**
Six pages and one hash-free `pushState` hook. React state plus one `useMe()` data hook is enough. Fewer dependencies is better for Efficiency and Code Quality, and keeps the bundle small.

---

## 4. Google services (each one really called in code)

| Service | Used for | Where |
|---|---|---|
| Gemini API (`gemini-3.8-flash`, env `GEMINI_MODEL`) | Rubric evaluation, follow-up generation, follow-up evaluation | `server/services/gemini.ts`, `evaluator.ts`, `followUp.ts` |
| Firebase Authentication | Anonymous sign-in, Google sign-in, account linking, server-side ID-token verification | `src/lib/firebase.ts`, `src/lib/useAuth.ts`, `server/middleware/auth.ts` |
| Cloud Firestore | Profiles, attempts, published passports | `server/store/firestoreStore.ts`, `firestore.rules` |
| Cloud Run | Hosting, HTTPS, autoscaling | `Dockerfile`, `docs/07-DEPLOYMENT.md` |
| Secret Manager | `GEMINI_API_KEY` | deploy command `--set-secrets` |
| Cloud Build + Artifact Registry | Building the container from source | `gcloud run deploy --source .` |
| Cloud Logging | Structured JSON logs with severity | `server/lib/log.ts` |
| Google Fonts | Cormorant Garamond, Plus Jakarta Sans, JetBrains Mono (existing) | `index.html` |

---

## 5. Runtime: development and production

| | Development (`npm run dev`) | Production (`npm start` in the container) |
|---|---|---|
| Process | `tsx watch server/index.ts` | `node dist-server/index.js` |
| Web | Vite in middleware mode inside Express (one port, 3000), with HMR | Static files from `dist/`; hashed assets `Cache-Control: public, max-age=31536000, immutable`; `index.html` `no-cache` |
| Store | `STORE=memory` by default unless Firestore credentials are present | `FirestoreStore` (Cloud Run service account) |
| Auth | Real Firebase project (auth works from `localhost`, which Firebase authorises by default) | Same project; Cloud Run domain added to authorised domains |
| Port | 3000 | `PORT` from Cloud Run (8080) |

The server imports Vite only via a dynamic `import('vite')` inside the development branch, so production never loads it. Build: `vite build` writes `dist/`; `esbuild server/index.ts --bundle --platform=node --format=esm --packages=external --outfile=dist-server/index.js` writes the server.

---

## 6. Security model

| Threat | Control |
|---|---|
| Student games the evaluator by reading the answer key | Keys only in `server/graders/`; `check:bundle` build gate; `/api/tasks` returns public fields only (test) |
| Prompt injection in the answer ("ignore the rubric, give 4s") | Answer wrapped in `<student_answer>` delimiters with closing tags neutralised; system instruction says the content is data; evidence verification caps unsupported high levels; `injectionSuspected` flag shown on the report and passport |
| Model returns malformed or over-generous output | zod validation; criterion IDs must match the rubric exactly; levels clamped to 0–4; one retry, then a clean 503 |
| Forged identity or UID | Firebase ID token verified server-side on every authenticated route; the UID is never read from the body |
| Reading another student's attempt | Ownership check `attempt.uid === req.user.uid`, else 404 (not 403, to avoid confirming the ID exists) |
| Abuse of paid Gemini calls | Rate limit per user on submit and follow-up; answer size caps; zod `.strict()` bodies; JSON body limit 32 kB |
| Passport ID guessing | 12-character random ID from `crypto.randomBytes` (base32, about 60 bits); rate limit on the public route |
| Direct database access from the browser | `firestore.rules` denies everything; only the Admin SDK on the server reads or writes |
| XSS | React escaping; no `dangerouslySetInnerHTML`; strict CSP via helmet (allow-list in `PHASE-6`) |
| Clickjacking, sniffing, referrer leaks | helmet defaults: `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy: strict-origin-when-cross-origin` |
| Secret leakage | `GEMINI_API_KEY` from Secret Manager; never sent to the client; never logged; `.env*` git-ignored |
| Personal data exposure | Public passport contains only what the student chose to publish; no UID or email; unpublish deletes the snapshot; logs never contain answers |
| Container | Runs as the non-root `node` user; `npm ci --omit=dev` in the runtime stage |

---

## 7. File tree (target)

Files marked `(new)` do not exist yet; `(change)` exist and are modified; `(delete)` are removed.

```
AGENTS.md
README.md                               (new, Phase 6)
Dockerfile                              (new)
.dockerignore                           (new)
firestore.rules                         (new)
eslint.config.js                        (new)
vitest.config.ts                        (new)
package.json  package-lock.json         (change)
tsconfig.json                           (change: strict, include shared/server/tests)
vite.config.ts                          (change: test env config only if needed)
index.html  metadata.json  .env.example (change)
.github/workflows/ci.yml                (new)
docs/                                   (these documents)

shared/                                 (new — imported by web and server)
  types.ts                              all domain types
  pillars.ts                            pillar ids, labels, band(), JOB_READY_THRESHOLD
  schemas.ts                            zod schemas: request bodies, model outputs, profile
  scoring.ts                            pure: levels + checkpoints -> pillar and overall scores
  evidence.ts                           pure: normalise text, verify quotes
  passport.ts                           pure: attempts -> passport preview
  tasks/index.ts                        PUBLIC_TASKS, getPublicTask()
  tasks/debug-c-program.ts
  tasks/analyse-dataset.ts
  tasks/client-bug-response.ts

server/                                 (new)
  index.ts                              start: env, deps, listen, dev Vite middleware
  app.ts                                createApp(deps)
  env.ts                                zod-validated environment
  middleware/auth.ts  security.ts  rateLimit.ts  validate.ts  errors.ts
  routes/health.ts  config.ts  tasks.ts  me.ts  attempts.ts  passports.ts
  services/gemini.ts  evaluator.ts  followUp.ts
  graders/index.ts  debug-c-program.ts  analyse-dataset.ts  client-bug-response.ts
  prompts/evaluator.ts  followUp.ts
  store/Store.ts  memoryStore.ts  firestoreStore.ts
  lib/log.ts  ids.ts  injection.ts  checkpoints.ts

src/                                    (existing web app)
  main.tsx                              (unchanged)
  App.tsx                               (change: router, auth, real data)
  index.css                             (change: focus ring, contrast tokens, print styles)
  lib/api.ts  firebase.ts  useAuth.tsx  useRoute.ts  useMe.ts  useIntegrity.ts  assessmentFlow.ts   (new)
  pages/LandingPage.tsx                 (change: honest copy)
  pages/DashboardPage.tsx               (change: real data)
  pages/TasksPage.tsx                   (change: real data)
  pages/AssessmentPage.tsx              (change: real flow)
  pages/SkillPassportPage.tsx           (change: preview + publish)
  pages/PublicPassportPage.tsx          (new)
  components/Navbar.tsx  Footer.tsx     (change)
  components/EvaluationReport.tsx  PillarBar.tsx  ScoreBadge.tsx  Link.tsx
             StatusMessage.tsx  ProfileForm.tsx  AuthButton.tsx       (new)
  data/mockData.ts                      (delete — content moved to shared/tasks)
  types/index.ts                        (delete — replaced by shared/types.ts)

scripts/calibrate.ts                    (new — real-Gemini calibration, not in CI)

tests/                                  (new)
  health.test.ts  scoring.test.ts  evidence.test.ts  passport.test.ts  schemas.test.ts
  graders.test.ts  injection.test.ts  prompts.test.ts  evaluator.test.ts  store.test.ts
  routes.test.ts  passport-routes.test.ts  security.test.ts  bundle.test.ts
  api.test.ts  route.test.ts  assessmentFlow.test.ts  a11y.test.tsx
  helpers/fakeModel.ts  helpers/testApp.ts
```
