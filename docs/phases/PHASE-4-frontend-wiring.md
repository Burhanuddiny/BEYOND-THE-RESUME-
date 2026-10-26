# Phase 4 — Front-end wiring (first submission)

**Effort:** about 90 minutes. **Read first:** `docs/02-PRD.md` §4–§6, `docs/04-DATA-FLOW-AND-CONTRACTS.md` §7, `AGENTS.md` (Accessibility).

**Goal:** the student journey J1 and J2 work on the live URL with real data, and every fake number is gone. Keep the existing visual design (colours, fonts, card styles in `src/index.css`); change behaviour, not the look.

---

## Steps

### 4.1 Routing — `src/lib/useRoute.ts`

```ts
export type Route =
  | { name: 'landing' }
  | { name: 'dashboard' }
  | { name: 'tasks' }
  | { name: 'task'; taskId: string }
  | { name: 'passport' }
  | { name: 'publicPassport'; passportId: string }
  | { name: 'notFound' };

/** Pure: pathname -> Route. */
export function parseRoute(pathname: string): Route;
/** Pure: Route -> pathname. */
export function routePath(route: Route): string;
/** Current route plus navigate(); listens to popstate. */
export function useRoute(): { route: Route; navigate(route: Route): void };
```

Paths: `/`, `/dashboard`, `/tasks`, `/tasks/:taskId`, `/passport`, `/p/:passportId`. `navigate` calls `history.pushState`, scrolls to the top (smooth only when the user has not asked for reduced motion), sets `document.title` (for example "Debug a C Program · Beyond the Resume"), and moves focus to the page's `h1` (give each `h1` `tabIndex={-1}`).

`src/components/Link.tsx`: renders a real `<a href={routePath(to)}>`. On a plain left click (no modifier keys), it prevents the default and calls `navigate`. This keeps "open in new tab" working and gives screen readers real links. Replace the `onNavigate('x')` buttons that are really navigation with `Link`.

Tests (`tests/route.test.ts`): `parseRoute` / `routePath` round-trip for every route; unknown paths give `notFound`; a task ID that is not in the catalogue gives `notFound`.

### 4.2 `src/App.tsx`

- Wrap everything in `AuthProvider`.
- Remove the `submissions` state, `localStorage` sync, `handleSubmitTask` and `studentProfile` state. Data comes from `useMe()`.
- Render pages by `route.name`. Lazy-load the heavy pages: `const AssessmentPage = lazy(() => import('./pages/AssessmentPage'))` and the same for `PublicPassportPage`, inside `<Suspense fallback={<StatusMessage kind="loading" />}>`.
- The public passport route renders without the student Navbar's personal bits (Phase 5).
- Add a `notFound` page: one sentence and a link home.

### 4.3 Shared UI pieces — `src/components/`

- `StatusMessage.tsx`: `kind: 'loading' | 'error' | 'empty'`, a title, optional body and action. Loading uses `role="status"`; error uses `role="alert"`.
- `PillarBar.tsx`: label, score number, band word and a bar. The bar is decorative (`aria-hidden`); the text carries the meaning. Shows a tick mark at `JOB_READY_THRESHOLD` with a visually hidden label.
- `ScoreBadge.tsx`: "78 · Proficient".

### 4.4 The assessment flow — `src/pages/AssessmentPage.tsx`

Keep the existing two-column layout (brief on the left with the Material / Rubric / Hints tabs; workspace on the right). Drive the right column with a pure reducer in `src/lib/assessmentFlow.ts`:

```ts
export type FlowState =
  | { step: 'brief' }                                  // not started, or viewing after completion
  | { step: 'starting' }
  | { step: 'writing'; attempt: AttemptView }
  | { step: 'submitting'; attempt: AttemptView }
  | { step: 'followUp'; attempt: AttemptView }
  | { step: 'replying'; attempt: AttemptView }
  | { step: 'report'; attempt: AttemptView };
export type FlowEvent =
  | { type: 'start' } | { type: 'started'; attempt: AttemptView }
  | { type: 'submit' } | { type: 'submitted'; attempt: AttemptView }
  | { type: 'reply' } | { type: 'replied'; attempt: AttemptView }
  | { type: 'failed' }                                 // returns to the previous editable step
  | { type: 'viewReport'; attempt: AttemptView } | { type: 'retake' };
/** Pure state transition. */
export function flowReducer(state: FlowState, event: FlowEvent): FlowState;
/** Initial step from the user's attempts for this task. */
export function initialFlow(attempts: AttemptView[], taskId: string): FlowState;
```

`initialFlow`: an attempt with `in_progress` gives `writing`; `awaiting_follow_up` gives `followUp`; otherwise `brief`. Test every transition in `tests/assessmentFlow.test.ts`, including `failed` from `submitting` back to `writing` with the attempt kept.

Screens:

1. **Brief.** The existing brief. The right column shows the objective, "About {estimatedMinutes} minutes", what happens next ("You'll write your answer, then {stakeholder.name} will reply to it"), and a primary **Start task** button. If a completed attempt exists: "Your best: 78 · Proficient", with **View last report** and **Try again**.
2. **Writing.** Textarea with a visible label "Your answer", the "Insert answer outline" button (only when the box is empty, otherwise it asks before replacing), a live character count ("38 / 40 minimum" until valid), and an elapsed timer from `attempt.startedAt` (`role="timer"`, `aria-live="off"`). `useIntegrity` is attached to the textarea. The draft autosaves to `localStorage['btr:draft:' + attempt.id]` (try/catch, debounced 500 ms). **Submit answer** is disabled until 40 characters.
3. **Submitting.** The textarea becomes read-only. A panel with an indeterminate progress bar and one honest sentence in an `aria-live="polite"` region: "Evaluating your answer against the rubric. {stakeholder.name} is reading it too — this usually takes 5–20 seconds." Do not show fake step-by-step progress.
4. **Follow-up.** A message thread: the student's answer (collapsed to 4 lines, expandable), then the stakeholder's message as a chat bubble with initials avatar, name and role. Move focus to the message heading ("{name} replied"). A reply textarea (label "Your reply to {name}", minimum 10 characters) and **Send reply**.
5. **Replying.** Same honest progress pattern: "Evaluating your reply…".
6. **Report.** `EvaluationReport` (4.5). Move focus to its heading. Actions: **Try again** (retake), **Next task** (`Link`), **View my passport** (`Link`). Clear the draft.

Errors (map `ApiError.code` to text, shown with `StatusMessage kind="error"` next to the button that failed; the flow returns to the editable step with the text kept):
- `evaluation_unavailable`: "We couldn't evaluate right now. Your answer is saved — try again in a moment." plus **Try again** (calls submit again; the attempt is still `in_progress` server-side).
- `rate_limited`: "You've submitted several times in a few minutes. Please wait a little and try again."
- `network`: "You seem to be offline. Your draft is saved on this device."
- `invalid_state`: refresh the attempt from `GET /api/attempts/:id` and re-derive the step.
- Anything else: "Something went wrong. Your answer is saved."

Also in this file: **remove the red highlighting of saturated rows** in the data table (it pointed at the answer). The table gets a `<caption>` ("Production metrics, 16:00–21:00 UTC") and `scope="col"` headers.

### 4.5 `src/components/EvaluationReport.tsx`

Props: `{ task: PublicTask; attempt: AttemptView }` (attempt is complete). Sections, in order:

1. Heading "Your evaluation", `ScoreBadge` with the overall score, and the evaluator `summary`.
2. Pillars: a `PillarBar` per assessed pillar.
3. "How each criterion was judged": for each `VerifiedCriterion`, the criterion name, "Level 3 of 4 — Solid", the rationale, and the verified quotes as `<blockquote>` items labelled "From your answer" (or "From your reply"). If `capped`: a note, "Capped at level 1: the evaluator's evidence could not be found in your text." If `rejectedEvidence > 0` and not capped: "N quoted passage(s) could not be matched and were ignored."
4. "Key points": checkpoints as a list, each with an icon **and** the word "Caught" or "Missed".
5. Strengths and improvements (two short lists).
6. "How you handled {stakeholder.name}": their message, your reply, and the follow-up criterion's level and rationale.
7. Integrity facts: "Completed in 18 min · 6% of the answer pasted · tab hidden 2 times (browser-reported)". If `injectionSuspected`: "Your answer contained text that looks like instructions to the evaluator. It was graded as written, and this is shown on your passport."
8. `<details>` **Model answer** — "How an experienced engineer might answer", rendered as preformatted text.

Level names come from one map in `shared/pillars.ts` (`LEVEL_LABEL: Record<Level, string>` = Missing, Attempted, Partial, Solid, Exemplary).

### 4.6 `src/lib/useIntegrity.ts`

As in `04` §7: counts pasted and typed characters on the textarea, and tab-hidden events while the page is in the writing step. Returns `{ signals, reset }`. Event listeners are added and removed in an effect.

### 4.7 Dashboard — `src/pages/DashboardPage.tsx`

From `useMe()`:
- Greeting: profile name if set, else "Welcome".
- Stats: tasks completed "2 of 3", completed attempts, readiness `ScoreBadge` (or "Complete a task to see your readiness").
- Pillars: `PillarBar` for each pillar in `passport.pillars`; pillars not yet assessed show "Not assessed yet".
- Next recommended task: `recommendNextTask(passport, PUBLIC_TASKS)` (add it to `shared/passport.ts`, with tests). It returns the first task with no completed attempt; if all are done, the task whose result has the lowest score in the passport's weakest pillar.
- Task list with each task's status: Not started / In progress / Best 78.
- **Delete**: "Verified Score: 87%", the `SKILL_CATEGORIES` usage, the "Continue learning" articles, "Demonstration Preview" labels.
- States: loading, error (with retry), empty (no attempts: the three task cards and "Each takes 15–25 minutes").

### 4.8 Tasks page, Navbar, Footer, Landing

- **Tasks page:** real per-task status badges from `useMe()`. Keep the filters.
- **Navbar:** the completed count comes from `useMe()`; add `AuthButton`; keep the mobile menu (it needs `aria-expanded` and `aria-controls`).
- **Footer:** replace the "Simulation Notice" with the FR-C3 text from the PRD.
- **Landing page:** keep the structure and voice. Apply FR-C1:
  - Delete "Recruiters receive 2,000+ applicants for a single junior vacancy" and "Over 70% of capable students are rejected before an engineer ever reads their work."
  - Replace them with cited facts: "India Skills Report 2026 tested over 700,000 candidates: around 3 in 10 B.E./B.Tech graduates were not rated employable — and a test score still doesn't show an employer what you can do." Add a small "Source: India Skills Report 2026" line linking to the PDF from `01-RESEARCH.md` §8.
  - "How it works" step 3: mention the follow-up ("a colleague or client replies to what you wrote").
  - Update the "Automated Semantic AI Engine: Roadmap V2" badge to describe what now exists: "AI evaluation with verified evidence".

### 4.9 Remove the prototype's demo data

Delete `src/data/mockData.ts` and `src/types/index.ts`. Fix every import to use `@/shared/...`. Grep must find no `demoScores`, `demoFeedback`, `INITIAL_`, `SKILL_CATEGORIES`, `CONTINUE_LEARNING`, `Aarav`, `BTR-2026-8941`, `Campus Median`, `benchmark` (except the fixed `JOB_READY_THRESHOLD` wording) in `src/`.

### 4.10 Accessibility pass on what changed

Every button has a text label; the icon-only ones (copy, menu) have `aria-label`. Textareas have `<label>`s. Status updates use `role="status"` or `aria-live`. Focus is visible (add a shared `:focus-visible` outline in `src/index.css` using the brand colour `#9E3D58`, 2 px, offset 2 px). Check at 360 px and 1280 px.

Add `tests/a11y.test.tsx` now (jsdom): render `EvaluationReport` with a fixture of a complete attempt, plus the Tasks page with a stubbed `useMe`; run `axe-core`'s `axe.run(container)` and expect zero violations. Phase 6 extends it to every page.

### 4.11 Deploy and first submission

`npm run verify`, deploy, then the pre-submission check in `docs/07-DEPLOYMENT.md` §7 (the passport step is not applicable yet). **Make the first submission.**

---

## Acceptance criteria

- [ ] On the live URL, in a fresh incognito window: landing → task → Start → write → Submit → follow-up appears referring to the answer → reply → report with pillars, verified quotes, checkpoints, follow-up judgement, integrity facts and the model answer.
- [ ] Reloading the page during the follow-up step returns to the follow-up step; reloading during writing restores the draft.
- [ ] Dashboard and Tasks show real numbers, matching `/api/me`.
- [ ] The grep in 4.9 returns nothing.
- [ ] Back and forward buttons work; every page has its own URL; a task URL opened directly works.
- [ ] Initial JS chunk ≤ 200 kB gzipped (Vite build output); Assessment is a separate chunk.
- [ ] Tests: route, flow reducer, `recommendNextTask`, a11y for the report — all green.
- [ ] First submission made.

## Fallbacks

- If the follow-up step is unstable on stage: it never blocks (the fallback message is always available), so debug the UI step, not the model.
- If time is short: build the report sections 1, 2, 3, 6 and 8 first; 4, 5 and 7 can follow in Phase 6.
