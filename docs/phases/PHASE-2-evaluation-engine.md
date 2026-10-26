# Phase 2 — Evaluation engine and API

**Effort:** about 75 minutes. **Read first:** `docs/05-AI-EVALUATION-ENGINE.md` (all of it), `docs/04-DATA-FLOW-AND-CONTRACTS.md` §3–§5, `docs/03-ARCHITECTURE.md` §6.

**Goal:** the whole evaluation flow works through the HTTP API with real Gemini: start an attempt, submit, receive a follow-up, reply, receive a scored result. Storage is in memory for now. Route tests cover the contract with the model and the auth faked.

---

## Steps

### 2.1 Environment

Add to `server/env.ts`: `GEMINI_API_KEY` (string, min 10; required when `NODE_ENV` is `production`), `GEMINI_MODEL` (default `gemini-3.8-flash`), `FIREBASE_PROJECT_ID` (string; required in production). Put real values in your local `.env` (git-ignored).

### 2.2 Model adapter — `server/services/gemini.ts`

Implement `StructuredModel` and `createGeminiModel` from `05` §9. **Open the four doc URLs listed there first** and check the parameter names against `node_modules/@google/genai/dist/genai.d.ts`. Strip the `$schema` key from `z.toJSONSchema()` output. Use `AbortController` or a `Promise.race` timeout of 40 s. Wrap every failure (network, API error, timeout, `JSON.parse`, zod) in `ModelError`.

### 2.3 Prompts — `server/prompts/evaluator.ts`, `server/prompts/followUp.ts`

Pure builders returning `{ system, input }`, with the system instructions verbatim and the input templates from `05` §6. Export `neutraliseDelimiters(text)`, which replaces `<student_answer>`, `</student_answer>`, `<student_reply>` and `</student_reply>` (case-insensitive) with `[student_answer]` / `[student_reply]`. Render the artifact block per task type: the code in a fenced `c` block; the data table as a Markdown table; the client email as `From / Subject / body`.

Tests (`tests/prompts.test.ts`): snapshot of each builder for one task; `neutraliseDelimiters` cases; the evaluator input never contains the student's profile fields (pass a profile-shaped object nowhere — the builder signature has no profile parameter).

### 2.4 Evaluator service — `server/services/evaluator.ts`

```ts
export class EvaluationUnavailable extends Error {}

/** Grades the main answer; one retry; throws EvaluationUnavailable. */
export async function evaluateAnswer(model: StructuredModel, task: PublicTask, grader: Grader, answer: string): Promise<ModelEvaluation>;

/** In-character follow-up; never throws (falls back to grader.followUp.fallbackMessage). */
export async function generateFollowUp(model: StructuredModel, task: PublicTask, grader: Grader, answer: string): Promise<FollowUp>;

/** Grades the follow-up reply; one retry; throws EvaluationUnavailable. */
export async function evaluateFollowUp(
  model: StructuredModel, task: PublicTask, grader: Grader, answer: string, followUp: FollowUp, reply: string,
): Promise<CriterionJudgement>;

/** Pure: verified criteria + checkpoints + scoreTask -> TaskResult. */
export function buildResult(
  task: PublicTask, grader: Grader, answer: string, mainEvaluation: ModelEvaluation, reply: string, followUpJudgement: CriterionJudgement,
): TaskResult;
```

`evaluateAnswer` builds the per-task schema with `modelEvaluationSchema(task.rubric.map(c => c.id))`, then rejects duplicate or missing criterion IDs (counts as a failed try). `buildResult` uses `verifyJudgement` on each main criterion (source `'answer'`) and on the follow-up judgement (source `'followUp'`, criterion `grader.followUp.criterion`), runs `runCheckpoints(grader.checkpoints, answer)`, calls `scoreTask`, and copies `strengths`, `improvements` and `summary` from the main evaluation.

Log one line per model call: `{ event, taskId, ms, ok, retries }`. Never log answer text.

### 2.5 Store — `server/store/Store.ts`, `server/store/memoryStore.ts`, `server/lib/ids.ts`

```ts
export interface UserRecord { profile: Profile | null; publishedPassportId: string | null; createdAt: string; updatedAt: string }

export interface Store {
  getUser(uid: string): Promise<UserRecord | null>;
  saveProfile(uid: string, profile: Profile): Promise<UserRecord>;
  setPublishedPassportId(uid: string, passportId: string | null): Promise<void>;
  createAttempt(data: Omit<Attempt, 'id'>): Promise<Attempt>;
  getAttempt(id: string): Promise<Attempt | null>;
  updateAttempt(id: string, patch: Partial<Omit<Attempt, 'id' | 'uid'>>): Promise<Attempt>;
  listAttempts(uid: string): Promise<Attempt[]>;               // sorted by startedAt ascending
  savePassport(snapshot: PassportSnapshot, ownerUid: string): Promise<void>;
  getPassport(passportId: string): Promise<PassportSnapshot | null>;   // never includes ownerUid
  deletePassport(passportId: string): Promise<void>;
}
```

`server/lib/ids.ts`: `randomId(length, alphabet)` using `crypto.randomInt`; `attemptId()` gives 20 chars from `[A-Za-z0-9]` (same shape as a Firestore auto-ID); `passportId()` gives 12 chars from `abcdefghijklmnopqrstuvwxyz234567`.

`MemoryStore` uses `Map`s and returns `structuredClone` copies, so callers cannot mutate stored state. `tests/store.test.ts` is a contract test suite written as a function `runStoreContract(makeStore)`, run against `MemoryStore` now and reused for `FirestoreStore` in Phase 3 if credentials are available.

### 2.6 Middleware

- `server/middleware/auth.ts`:
  ```ts
  export interface AuthUser { uid: string; provider: string; name?: string }
  export type VerifyToken = (idToken: string) => Promise<AuthUser>;
  /** 401 unless a valid Bearer ID token is present; puts the user on res.locals.user. */
  export function requireAuth(verifyToken: VerifyToken): express.RequestHandler;
  /** Reads the authenticated user set by requireAuth. */
  export function currentUser(res: express.Response): AuthUser;
  ```
  The production `VerifyToken`, created in `server/index.ts`:
  ```ts
  import { initializeApp } from 'firebase-admin/app';
  import { getAuth } from 'firebase-admin/auth';
  const adminApp = initializeApp({ projectId: env.FIREBASE_PROJECT_ID });
  const verifyToken: VerifyToken = async (token) => {
    const decoded = await getAuth(adminApp).verifyIdToken(token);
    return { uid: decoded.uid, provider: decoded.firebase.sign_in_provider, name: decoded.name };
  };
  ```
- `server/middleware/validate.ts`: `validate({ body?, params? })` parses with zod, replaces `req.body` with the parsed value (params are read through a typed helper), and sends 400 `invalid_request` on failure.
- `server/middleware/rateLimit.ts` (express-rate-limit v8): `globalLimit` (300 per 15 min per IP), `evalLimit` (10 per 10 min, keyed by `res.locals.user.uid`), `publicPassportLimit` (60 per min per IP). With a custom `keyGenerator` that may fall back to the IP, use the library's `ipKeyGenerator(req.ip)` helper (v8 requirement for IPv6). The handler returns 429 `{ error: 'rate_limited' }`. Use `standardHeaders: 'draft-8'`, `legacyHeaders: false`. Export factory functions (`createRateLimits()`), and call them inside `createApp`, so every app instance (and every test) gets fresh counters.

### 2.7 Routes

Grow `AppDeps` to `{ web?, store, model, verifyToken }` and mount routers in `createApp`.

- `server/routes/tasks.ts`: `GET /api/tasks` returns `{ tasks: PUBLIC_TASKS }`.
- `server/routes/attempts.ts` (all behind `requireAuth`):
  - `POST /api/attempts`: unknown task → 404. If the user has an attempt for this task with `status !== 'complete'`, return it with 200. Otherwise create `{ uid, taskId, taskVersion, status: 'in_progress', startedAt: now, model: model.modelId }` and return 201.
  - `GET /api/attempts/:attemptId`: not found or not owned → 404.
  - `POST /api/attempts/:attemptId/submit` (`evalLimit`): owned, `status === 'in_progress'` else 409 `invalid_state`. **First** save `answer`, `clientSignals`, `submittedAt` (the answer is never lost). Then `Promise.allSettled([evaluateAnswer(...), generateFollowUp(...)])`. If the evaluation was rejected → 503 `evaluation_unavailable` (the status stays `in_progress`). Otherwise save `mainEvaluation`, `followUp`, `status: 'awaiting_follow_up'` and return the view.
  - `POST /api/attempts/:attemptId/follow-up` (`evalLimit`): owned, `status === 'awaiting_follow_up'` else 409. Save `followUpAnswer`. `evaluateFollowUp`; on failure → 503. `buildResult`. `integrity = { durationSec: round((completedAt − startedAt) / 1000), ...clientSignals, injectionSuspected: looksLikeInjection(answer) || looksLikeInjection(reply) }`. Save `followUpJudgement`, `result`, `integrity`, `completedAt`, `status: 'complete'`. Return the view with `modelAnswer`.
  - `toView(attempt)`: drop `uid`, `mainEvaluation`, `followUpJudgement`; add `modelAnswer` from the grader only when complete.
- `server/routes/me.ts` (behind `requireAuth`):
  - `GET /api/me`: `{ profile, identityVerified: user.provider === 'google.com', attempts: views, passport: buildPassportPreview(attempts, PUBLIC_TASKS), published }`. Use **one** `listAttempts` call.
  - `PUT /api/me/profile`: `ProfileBody`, then `saveProfile`, then return `{ profile }`.

### 2.8 Tests

`tests/helpers/fakeModel.ts`: `FakeModel implements StructuredModel`, constructed with a queue of `unknown | Error` items. Each `generateJson` call shifts one item, throws it if it is an Error, else returns `schema.parse(item)` (so invalid canned output exercises the zod path).

`tests/helpers/testApp.ts`: builds `createApp` with `MemoryStore`, a `FakeModel`, and `verifyToken` that maps `'token-alice'` to `{ uid: 'alice', provider: 'anonymous' }`, `'token-bob'` to `{ uid: 'bob', provider: 'google.com', name: 'Bob' }`, and throws for anything else.

`tests/evaluator.test.ts`: the six cases in `05` §9 ("Testing without the real model"), plus `buildResult` on a canned evaluation for the client task, which must reproduce the worked example's numbers when given the same levels, quotes and answer text.

`tests/routes.test.ts` (supertest):
1. Full happy path for one task: start (201), start again (200, same ID), submit (200, `awaiting_follow_up`, `followUp.message` present, no `result`, no `mainEvaluation`), follow-up (200, `complete`, `result.overall` is an integer, `modelAnswer` present, `integrity.durationSec ≥ 0`).
2. No token or a bad token → 401 on every authenticated route.
3. Bob cannot `GET` or `submit` Alice's attempt → 404.
4. Submit twice → second is 409. Follow-up before submit → 409.
5. Answer of 39 characters → 400. Unknown body key → 400. Body over 32 kB → 413.
6. Model fails twice on submit → 503; then `GET` shows `in_progress` with the saved answer; a retry with a working model succeeds.
7. Follow-up generation fails but evaluation succeeds → 200 with `followUp.generatedBy === 'fallback'`.
8. Eleventh submit within 10 minutes for one user → 429.
9. `GET /api/tasks` response contains no `modelAnswer`, `referenceNotes`, `checkpoints` or `fallbackMessage` (search the JSON string).
10. `GET /api/me` aggregates: after one completed attempt, `passport.coverage.completed === 1`.

### 2.9 Calibration — `scripts/calibrate.ts`

Implement as described in `05` §9 (weak answers: reuse the ones from `tests/graders.test.ts`). Run `npm run calibrate` with the real key. Expected: model answers ≥ 75, weak answers ≤ 40. Paste the output into a scratch note for the README's Testing section (Phase 6). If calibration is off, adjust the evaluator system-instruction wording, re-run, and update the prompt snapshot.

### 2.10 Deploy

Deploy with `GEMINI_API_KEY` (secret), `GEMINI_MODEL`, `FIREBASE_PROJECT_ID` and `STORE=memory`. With no UI wired yet, check the live service with `/healthz` and `GET /api/tasks`, and confirm `POST /api/attempts` without a token returns 401.

---

## Acceptance criteria

- [ ] `npm run verify` green; `tests/routes.test.ts` covers all 10 scenarios; `server/` coverage ≥ 80%.
- [ ] `npm run calibrate` run against real Gemini; model answers ≥ 75 and weak answers ≤ 40 for all three tasks (output saved).
- [ ] Locally (`npm run dev`, `STORE=memory`), a manual run with a real Firebase ID token completes the full flow. (Phase 4 gives a UI; until then this check is optional.)
- [ ] Live: `/api/tasks` returns three tasks with no grader fields; unauthenticated `POST /api/attempts` returns 401.

## Fallbacks

- If `interactions.create` rejects the schema or the shape differs: switch the adapter to `models.generateContent` (`05` §9). Nothing outside `gemini.ts` changes.
- If calibration cannot reach the targets within 20 minutes: ship the closest result, record the numbers honestly in the README, and move on.
