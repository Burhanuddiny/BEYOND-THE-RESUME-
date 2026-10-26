# Phase 1 — Domain core

**Effort:** about 60 minutes. **Read first:** `docs/04-DATA-FLOW-AND-CONTRACTS.md` §1–§2, `docs/05-AI-EVALUATION-ENGINE.md` §2–§5, §7–§8.

**Goal:** all pure domain logic exists and is unit-tested: shared types, the public task catalogue, server-only graders, evidence verification, scoring, passport aggregation, checkpoints and the injection scan. Answer keys leave the client bundle. No AI calls yet.

---

## Steps

### 1.1 `shared/types.ts` and `shared/schemas.ts`

Copy them exactly from `docs/04-DATA-FLOW-AND-CONTRACTS.md` §1 and §2.

### 1.2 `shared/pillars.ts`

```ts
export const PILLARS: readonly { id: PillarId; label: string; description: string }[] = [
  { id: 'technical', label: 'Technical Accuracy', description: 'Correct code, data reasoning and use of tools.' },
  { id: 'problemSolving', label: 'Problem-Solving', description: 'Finding the real root cause and a workable fix.' },
  { id: 'edgeCases', label: 'Edge-Case Handling', description: 'Failure modes, unexpected inputs and handling the unexpected.' },
  { id: 'communication', label: 'Workplace Communication', description: 'Clear, calm, structured writing for colleagues and clients.' },
];
export const JOB_READY_THRESHOLD = 70;
export const BAND_LABEL: Record<Band, string> = { strong: 'Strong', proficient: 'Proficient', developing: 'Developing', not_yet: 'Not yet' };
/** Maps a 0-100 score to a band: >=80 strong, >=65 proficient, >=50 developing, else not_yet. */
export function band(score: number): Band;
```

### 1.3 Public task catalogue — `shared/tasks/`

Create one file per task plus `index.ts` exporting `PUBLIC_TASKS: readonly PublicTask[]` (in this order: `debug-c-program`, `analyse-dataset`, `client-bug-response`) and `getPublicTask(id): PublicTask | undefined`.

Move the content from `src/data/mockData.ts` `WORKPLACE_TASKS`, with these changes:
- Drop `sampleSolution` (it moves to the grader in step 1.6).
- Rename `evaluationRubric` to `rubric`, and add `id` and `pillar` to each criterion from the table in `docs/05-AI-EVALUATION-ENGINE.md` §7.
- `version: 1` on every task.
- `codeSnippet` becomes `{ filename: 'transaction_buffer.c', language: 'c', code }`. In `code`, **delete these comments**, which name or hint at the bugs: `// Wait, is list freed?`, `// Bug 1: Incorrect allocation size calculation`, `// Bug 2: Off-by-one boundary`, `// Notice: Caller owns id_buffer, but what if realloc fails later?`, `// Bug 3: Missing free(ids), causing heap memory accumulation!`. Keep `// Function under review:`.
- `dataSnippet`: **remove the giveaway annotations** "(Saturated)" from the DB-pool cells (keep the numbers: `'99%'`, `'98%'`). Keep the hour labels such as "18:00 (Peak Start)"; those are the kind of notes an on-call engineer writes. In Phase 4, also remove the red highlighting of saturated rows in `AssessmentPage.tsx`, because it points at the answer.
- `stakeholder`:
  - debug-c-program: `{ name: 'Priya Raman', role: 'Senior Backend Engineer, FinStream' }`
  - analyse-dataset: `{ name: 'Rahul Mehta', role: 'Product Manager, Checkout' }`
  - client-bug-response: `{ name: 'Sarah Jenkins', role: 'VP of E-Commerce, Nordic Apparel' }`
- `hints` (replace the shared "Senior Engineer Guidance" text, which named the checkpoints outright):
  - debug-c-program: `['Read the function the way the caller will use it: what could they pass in?', 'Check every size and every loop bound against the type being stored.', 'For each allocation, ask who is responsible for releasing it.']`
  - analyse-dataset: `['Look for the first metric that approaches its limit, not the one that moves most.', 'A metric rising at the same time is not automatically the cause.', 'Your reader is a product manager: lead with what happened and what we will do.']`
  - client-bug-response: `['Sarah needs to know three things: that you understand the impact, what is being done, and when she will hear from you next.', 'Avoid blaming anyone, including third parties, before the root cause is known.', 'Plain language beats technical detail for a business stakeholder.']`
- `answerOutline` (move from `handleInsertOutline` in `AssessmentPage.tsx`, neutralised so it does not give the answer):
  - debug-c-program: `` `1. ISSUES FOUND AND ROOT CAUSE:\n- \n\n2. CORRECTED CODE:\n\n\n3. NOTES FOR THE CALLER:\n- ` ``
  - analyse-dataset: `` `INCIDENT SUMMARY\n\n1. WHAT HAPPENED:\n\n2. WHY IT HAPPENED:\n\n3. WHAT WE RECOMMEND:\n- Immediate:\n- Longer term:` ``
  - client-bug-response: `` `Subject: Re: URGENT: Checkout failing for mobile customers\n\nDear Sarah,\n\n\n\nBest regards,\n` ``

### 1.4 `shared/evidence.ts`, `shared/scoring.ts`, `shared/passport.ts`

Implement exactly as specified in `docs/05-AI-EVALUATION-ENGINE.md` §3 and §5, each with its test file (`tests/evidence.test.ts`, `tests/scoring.test.ts`, `tests/passport.test.ts`) covering every case listed there, including the worked example.

`shared/scoring.ts` also exports a helper used by the evaluator:

```ts
/** Applies quote verification and the evidence cap to one model judgement. Pure. */
export function verifyJudgement(
  judgement: CriterionJudgement,
  criterion: RubricCriterion,
  sourceText: string,
  source: 'answer' | 'followUp',
): VerifiedCriterion;
```

### 1.5 `server/lib/checkpoints.ts` and `server/lib/injection.ts`

As specified in `05` §4 and §8, with `tests/injection.test.ts` (true positives and the two false-positive guards).

### 1.6 Graders — `server/graders/`

One file per task plus `index.ts` (`GRADERS: Record<string, Grader>`, `getGrader(taskId)`). Copy reference notes, checkpoints (the regexes exactly), follow-up persona, brief, fallback, criterion and follow-up reference notes from `05` §7. `modelAnswer` is the task's former `sampleSolution` from `mockData.ts`, unchanged.

`tests/graders.test.ts`: the six checks listed at the end of `05` §7. These patterns were tested against the prototype's text on 2026-10-19: the model answers hit 6 of 6, short weak answers hit 0, and pasted-back task text hits at most 2 (only after the C-snippet comments in step 1.3 are removed).

### 1.7 `tests/schemas.test.ts`

`SubmitBody` rejects 39 characters, accepts 40, rejects 12,001, rejects unknown keys. `ProfileBody` boundaries. `modelEvaluationSchema(['a','b'])` rejects a level of 5 and an unknown criterion ID.

### 1.8 Switch the UI to the shared catalogue (keep it compiling)

- Replace every import of `WORKPLACE_TASKS` with `PUBLIC_TASKS` from `@/shared/tasks`, and `TaskScenario` with `PublicTask`. Rename `evaluationRubric` to `rubric` where it is read.
- Delete `WORKPLACE_TASKS` from `src/data/mockData.ts`. The demo profile, submissions and skill categories stay there **temporarily**; Phase 4 deletes the file.
- **Remove the "Auto-Fill Sample" button** and `handleLoadSample` from `AssessmentPage.tsx`.
- "Insert answer outline" now inserts `task.answerOutline`. The hints tab renders `task.hints`. The code panel's filename comes from `task.codeSnippet.filename`.

### 1.9 Extend `tests/bundle.test.ts`

For every grader: take a 40-character slice from the middle of `modelAnswer`, and one from `referenceNotes`. Assert that no file in `dist/assets/` contains either. Also assert none contains the string `referenceNotes` or `fallbackMessage`.

---

## Acceptance criteria

- [ ] `npm run verify` green, including the bundle test after a build.
- [ ] `grep -rn "sampleSolution\|Auto-Fill" src shared` returns nothing.
- [ ] Tests exist and pass for: evidence (≥ 9 cases), scoring (worked example + boundaries), passport (≥ 6 cases), schemas, graders (6 checks × 3 tasks), injection.
- [ ] Coverage of `shared/` ≥ 90% (`npm run test:coverage`).
- [ ] The deployed app still works: tasks list, each task's brief (with the cleaned C snippet and data table), outline and hints.

## Fallbacks

- If a checkpoint test fails on a regex after copying: compare character by character with `05` §7; a lost backslash is the usual cause.
