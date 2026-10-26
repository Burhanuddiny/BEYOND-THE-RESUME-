# 02 — Product Requirements Document

**Product:** Beyond the Resume (BTR)
**Tagline:** Show your skills. Don't just list them.
**One sentence:** A free workplace-simulation platform where a college student does three realistic junior-engineer tasks, gets each one evaluated against a published rubric with checkable evidence, handles a follow-up from a simulated colleague or client, and earns a public Skill Passport that shows recruiters the actual work.

Research behind every decision: `01-RESEARCH.md`. Exact types and routes: `04-DATA-FLOW-AND-CONTRACTS.md`. Evaluator details: `05-AI-EVALUATION-ENGINE.md`.

---

## 1. Goals

| # | Goal | Measured by (in the demo and the code) |
|---|---|---|
| G1 | A student can complete a realistic workplace task and get a real, explained evaluation | Submitting any answer returns per-criterion levels with verified quotes, pillar scores and an overall score, computed by `shared/scoring.ts` |
| G2 | The task behaves like a workplace, not an exam | Every submission triggers one in-character follow-up that refers to the student's own answer |
| G3 | A recruiter can trust and inspect the result | Public `/p/:id` page shows answers, scores, rubric, evidence quotes, integrity signals and the method |
| G4 | Zero friction for the student | From landing page to typing an answer takes one click; no form, no sign-up |
| G5 | Wins the automated assessment | Every item in `06-IMPLEMENTATION-PLAN.md` §6 checklist is ticked |

## 2. Non-goals

No code execution sandbox, no AI-text detection, no recruiter accounts, no job board, no leaderboard, no webcam proctoring, no payments, no multiple tracks. Reasons are in `01-RESEARCH.md` §7.

---

## 3. Users

- **Student (primary):** final-year engineering student, often from a tier-2 or tier-3 college; uses a phone or a basic laptop; English is a working language but may not be their first language.
- **Recruiter / engineering lead (secondary):** opens a passport link from a resume or LinkedIn and spends under a minute on it.

---

## 4. Core journeys

### J1 — First task (student, anonymous)
1. Lands on `/`, reads the pitch, clicks **Start a task** (or picks one of the three task cards).
2. App silently signs in anonymously (Firebase). No form.
3. Task page shows the **brief**: role, scenario, the artifact (code file / metrics table / client email), instructions, rubric, hints. A **Start task** button starts the clock (server records `startedAt`).
4. Student writes the answer in the workspace. An "Insert answer outline" button adds a structure scaffold (kept from the prototype). The draft autosaves locally.
5. **Submit**. A progress panel announces the steps: "Reading your answer", "Checking it against the rubric", "{Stakeholder name} is typing…". Takes 5–20 s.
6. The **follow-up** appears as a message thread: the stakeholder (senior engineer / product manager / client VP) replies in character, referring to the student's answer, with one new question or complication.
7. Student replies and clicks **Send reply**.
8. The **report** appears: overall score and band; four pillar bars (number + band word); each rubric criterion with level, rationale and the student's quoted words; key checkpoints caught or missed; strengths; improvements; the follow-up judgement; integrity facts (time taken, % pasted). Below it, a collapsible **Model answer** ("How an experienced engineer would answer").
9. Next actions: **Try again**, **Next task**, **View my passport**.

### J2 — Return visit
Dashboard shows real progress: tasks completed out of 3, attempts, readiness score and band, pillar breakdown, and a recommended next task (the first incomplete task, otherwise the task that assesses the weakest pillar). An attempt left mid-way resumes where it stopped (brief, writing, or follow-up).

### J3 — Publish the passport
1. On **My Passport**, the student sees a live preview computed from their best attempt per task.
2. **Publish** requires a profile (name, college, degree, graduation year). If the student is anonymous, they are offered **Continue with Google** (links the account, keeps all attempts). Name then comes from Google and the passport shows "Identity: Google-verified". Publishing without Google is allowed, but the passport then shows "Name self-declared".
3. A consent line before publishing: "Your answers to completed tasks will be visible to anyone with the link."
4. After publishing: the public URL (`/p/<passportId>`), **Copy link**, **Copy LinkedIn/resume summary** (kept from the prototype, now with real numbers), **Unpublish**.
5. Publishing again refreshes the snapshot under the same link.

### J4 — Recruiter view
Opens `/p/<passportId>` without signing in. Sees: candidate name, identity status, college, degree, graduation year; overall readiness and four pillars; for each task the score, time taken, attempts count, the full answer, the follow-up exchange, the evaluator summary; a "How this was assessed" box explaining the rubric, the 0–4 levels, evidence verification, checkpoints and integrity signals, and the statement that no AI-text detection is performed. A **Print / Save as PDF** button.

---

## 5. Functional requirements

Each requirement has an ID used in the phase docs and tests.

### Tasks
- **FR-T1** Exactly three tasks ship: `debug-c-program`, `analyse-dataset`, `client-bug-response`. Content is moved from `src/data/mockData.ts` into `shared/tasks/`, with `sampleSolution` removed.
- **FR-T2** Each rubric criterion has an `id` and a `pillar` (`technical`, `problemSolving`, `edgeCases`, `communication`).
- **FR-T3** Model answers, reference notes, checkpoints and follow-up briefs live in `server/graders/` only. The client bundle contains none of them (`npm run check:bundle`).
- **FR-T4** The "Auto-Fill Sample" button is removed. "Insert answer outline" stays.

### Attempts and evaluation
- **FR-E1** `Start task` creates an attempt on the server with a server timestamp. If the student already has an attempt in progress for that task, it is reused.
- **FR-E2** Answers must be 40–12,000 characters. The UI shows a live character count and a clear message below 40.
- **FR-E3** On submit, the server runs the evaluator and the follow-up generator **in parallel**, saves both, and returns the follow-up message. The main evaluation is not shown until the follow-up is answered.
- **FR-E4** The evaluator returns, for every rubric criterion, a level 0–4, up to three quotes from the answer, and a one-sentence rationale; plus up to three strengths, three improvements and a two-sentence summary.
- **FR-E5** Every quote is checked against the answer (case-insensitive, whitespace-normalised). Quotes not found are dropped. A criterion at level ≥ 2 with no surviving quote is capped at level 1 and marked "capped: evidence not found".
- **FR-E6** Deterministic checkpoints run on the answer. Each pillar's score is 75% evaluator, 25% checkpoints (where the pillar has checkpoints). The formula is in `05` §5 and in `shared/scoring.ts`.
- **FR-E7** Follow-up is mandatory. If the model fails to produce one, the grader's fixed fallback message is used, so the flow never blocks.
- **FR-E8** The follow-up reply (10–4,000 characters) is evaluated against the grader's follow-up criterion. The final result is computed from all criteria together.
- **FR-E9** After completion, the model answer is returned and shown collapsed.
- **FR-E10** If Gemini fails twice (timeout or invalid output), the API returns `503 evaluation_unavailable`, the attempt keeps the saved answer, and the UI shows "We couldn't evaluate right now. Your answer is saved." with a **Try again** button.
- **FR-E11** Retakes are unlimited. Each is a new attempt; the passport uses the best completed attempt per task and shows the attempt count.
- **FR-E12** The evaluator never receives the student's name, college or profile.

### Integrity signals
- **FR-I1** Duration = `completedAt − startedAt`, both server timestamps.
- **FR-I2** The client reports characters pasted, characters typed, and tab-hidden count for the main answer. Shown as "self-reported by the browser".
- **FR-I3** Text that looks like an instruction to the evaluator ("ignore previous instructions", "give full marks", etc.) sets `injectionSuspected`. It is shown on the report and passport. The answer is still evaluated, with the delimiter defence in place.
- **FR-I4** Integrity signals never change a score.

### Profile and identity
- **FR-P1** Silent anonymous sign-in on first load.
- **FR-P2** **Continue with Google** links the anonymous account so attempts are kept. If that Google account already exists, sign in to it (anonymous attempts on this device are then left behind; the UI says so before continuing).
- **FR-P3** Profile fields: display name (2–60), college (2–120), degree (2–80), graduation year (2000–2035). Required only to publish.
- **FR-P4** A sign-out button in the navbar for Google users.

### Dashboard, tasks list, passport
- **FR-D1** Dashboard, Tasks page and Navbar show only real data: completed count, attempts, best score per task, readiness, pillar bars, next recommended task.
- **FR-D2** Empty states: no attempts yet, so show "Start with any task — each takes 15–25 minutes" plus the three task cards.
- **FR-S1** Private passport preview and publish/unpublish (J3).
- **FR-S2** Public passport at `/p/:passportId`, server-rendered data via `GET /api/passports/:id`, with no user ID and no email exposed.
- **FR-S3** Readiness bands: ≥ 80 Strong, 65–79 Proficient, 50–64 Developing, < 50 Not yet. Job-ready threshold: 70 per pillar ("At or above job-ready threshold" label). Explained on the page.
- **FR-S4** Print stylesheet: the public passport prints cleanly on A4 with no navbar or footer.

### Content honesty
- **FR-C1** Remove every unsourced statistic from the landing page ("2,000+ applicants", "Over 70% of capable students are rejected…") or replace it with the cited India Skills Report figures from `01-RESEARCH.md` §2.
- **FR-C2** Remove fake benchmarks: "Campus Median", "+17% Over Average", "Tier-1 benchmark", "Verified Score: 87%", the hard-coded "#BTR-2026-8941", and the hard-coded "Aarav Patel" profile.
- **FR-C3** Footer notice becomes: "Scores come from an AI evaluator applying a published rubric, with every judgement backed by quotes from your answer. Treat them as evidence to discuss, not a hiring decision."
- **FR-C4** Remove the fake "Continue learning" articles from the dashboard. They become the recommended next task.

---

## 6. Screens and states

| Screen | Route | States that must be designed |
|---|---|---|
| Landing | `/` | Default |
| Dashboard | `/dashboard` | Loading, empty (no attempts), partial, all three done, error |
| Tasks | `/tasks` | Loading, filters (existing), per-task badge: Not started / In progress / Best score |
| Assessment | `/tasks/:taskId` | Brief (not started), Writing (timer running), Evaluating (live progress), Follow-up, Finalising, Report, Evaluation error with retry, Answer too short |
| My Passport | `/passport` | Loading, empty (no completed tasks: cannot publish), preview, profile missing (inline form), published (link + unpublish), publishing, error |
| Public Passport | `/p/:passportId` | Loading, not found ("This passport was unpublished or the link is wrong"), loaded, print |

Routing is a tiny `pushState` hook (`src/lib/useRoute.ts`). Browser back and forward work, and every page has its own URL. The server's SPA fallback serves `index.html` for these paths.

---

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Initial JS ≤ 200 kB gzipped; Assessment and Public Passport pages lazy-loaded; first contentful paint < 2 s on 4G. Evaluation round-trip p50 < 15 s. |
| Availability | `--min-instances 1` during judging; `/healthz` responds in < 100 ms. |
| Security | See `03-ARCHITECTURE.md` §6. Rate limits: global 300 requests / 15 min / IP; evaluation endpoints 10 / 10 min / user; public passport 60 / min / IP. |
| Privacy | Store only what is listed in `04` §4. No answers, tokens or keys in logs. Gemini calls use `store: false`. Unpublish deletes the public snapshot. |
| Accessibility | WCAG 2.2 AA; axe test passes on every page; keyboard-only completion of a task is possible. |
| Compatibility | Latest Chrome, Edge, Firefox, Safari; Android Chrome at 360 px. |
| Cost | One Gemini call for evaluation, one for the follow-up, one for the follow-up evaluation: three calls per attempt. |

---

## 8. Success criteria for the hackathon demo

1. A judge can open the live link on their phone, start the client-email task, submit a two-line answer, receive Sarah's annoyed follow-up, reply, and see a low but fair score with their own words quoted. All of that in under 3 minutes.
2. The same flow with the model answer pasted scores Strong.
3. The public passport link opens on a second device with no sign-in.

## 9. Open questions (resolve at the briefing)

- Official problem statement text (see `01` §1).
- Build window length and number of submissions allowed.
- Whether pre-event work on the repo is allowed (the scaffold commit already exists).
- Repo size limit and branch rules.
