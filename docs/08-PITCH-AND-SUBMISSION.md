# 08 — README, submission and pitch

---

## 1. README outline (written in Phase 6)

The README is read by the automated assessment and by judges. Order matters: alignment first.

1. **Title, tagline, live link, 30-second demo video link** (hosted outside the repo).
2. **The problem** — the official problem statement, quoted.
3. **How Beyond the Resume answers it** — a table: phrase from the brief → feature → file(s). Example rows:
   | Brief | Feature | Where |
   |---|---|---|
   | "debug a C program" | Code-review task with a real buggy C file, rubric, checkpoints | `shared/tasks/debug-c-program.ts`, `server/graders/debug-c-program.ts` |
   | "analyse a small dataset and explain a finding" | Production-metrics incident task with an executive summary | `shared/tasks/analyse-dataset.ts`, `server/graders/analyse-dataset.ts` |
   | "respond professionally to a client" | Escalation email task with an in-character client follow-up | `shared/tasks/client-bug-response.ts`, `server/graders/client-bug-response.ts` |
   | "workplace simulation" | Stakeholder follow-up generated from your own answer | `server/services/followUp.ts` |
   | "prove skills / beyond the resume" | Evidence-backed evaluation and public Skill Passport | `server/services/evaluator.ts`, `shared/evidence.ts`, `src/pages/PublicPassportPage.tsx` |
4. **The student journey** — five steps with one screenshot strip (SVG or a link, no bitmap in the repo).
5. **How evaluation works** — the model judges, the code decides: 0–4 anchors, quote verification, checkpoints, the formula and the worked example from `05` §5.
6. **Architecture** — the diagram from `03` §1 and the decisions D1–D10, one line each.
7. **Google services** — the table from `03` §4.
8. **Security and privacy** — answer keys server-only (with the bundle check), prompt-injection handling, auth and ownership, rate limits, CSP, Firestore locked, what is stored and what is not, `store: false` on Gemini calls, unpublish.
9. **Accessibility** — what was done and how it is tested.
10. **Testing** — how to run; what is covered; coverage figure; the calibration results table (model answer vs weak answer per task).
11. **Run locally / deploy** — commands from `07`.
12. **Adding a task** — the three files to add (public task, grader, test expectations) and the version rule.
13. **Known limitations and next steps** — no code execution (next: sandboxed compile in a separate service), no AI-text detection (by design), three tasks only, placement-cell cohort dashboard, more tracks (data analyst, QA, DevOps), regional-language task briefs.

---

## 2. Submission description (platform field)

> Beyond the Resume is a free workplace-simulation platform that helps college students, especially from tier-2 and tier-3 colleges, prove what they can do instead of listing it. Students take three realistic junior-engineer tasks: review and fix a crashing C program, analyse a production-metrics table and explain the root cause, and answer an angry client's escalation email. Each answer is evaluated by Gemini against a published rubric, and every judgement must quote the student's own words. The code verifies the quotes, runs deterministic checkpoints and computes the score with a tested formula, so the model judges but never decides. Then the simulation reacts: the client, product manager or senior engineer replies in character to what the student actually wrote, and the student must handle it. Results build a public Skill Passport that shows recruiters the real work, the scores and how they were earned. Built on Cloud Run, Gemini, Firebase Authentication, Firestore and Secret Manager.

---

## 3. Demo script (90 seconds, rehearse it)

Before the pitch: open the live URL in a fresh incognito window. Have a second device with a published passport already open. Have the 60-second backup recording ready.

1. **(10 s)** Landing page: "Every resume says 'Proficient in C'. Here is how a student proves it."
2. **(15 s)** Click the client-email task. Show Sarah's angry email. "This is day one at work, not a quiz."
3. **(15 s)** Hand the keyboard to a judge: "Reply to Sarah however you like." (Or type a deliberately weak two-liner yourself: "Hi Sarah, we are looking into it, will update soon.") Submit. Point at the live progress panel.
4. **(15 s)** Sarah's follow-up appears, annoyed, referring to "update soon". "She reacted to *your* answer. You can't paste your way through this." Type a short reply and send it.
5. **(20 s)** The report: a low score that is fair. Point at a criterion: "Every judgement quotes your words. If the AI invents a quote, the code throws it away and caps the score." Open the model answer.
6. **(15 s)** Switch to the second device: the public passport. "This is what a recruiter sees: the actual work, how long it took, how it was scored. No college name decides anything."

## 4. Pitch (3 minutes)

1. **The person (20 s).** "Aarav is in his final year at a tier-3 college in UP. He can debug C better than half the people interviewing him, but his resume says exactly what everyone else's says, and nobody opens his GitHub."
2. **The insight (25 s).** "Employers have known for decades that work samples predict job performance better than resumes. They don't use them because a human has to grade every one. Gemini removes that cost, if you can trust it."
3. **The demo (90 s).** Section 3.
4. **Why you can trust the score (25 s).** "The model judges; the code decides. Levels with quoted evidence, quotes verified, deterministic checkpoints, one tested formula. Show `shared/scoring.ts` and the grader test: the model answer must hit every checkpoint, a weak answer must not."
5. **Scale (15 s).** "A task is two data files. Next: placement-cell dashboards for a whole cohort, and new tracks."
6. **Close (5 s).** "Show your skills. Don't just list them."

## 5. Likely judge questions

| Question | Answer |
|---|---|
| Can't a student paste a ChatGPT answer? | They can paste the first answer. They then have to handle a follow-up written against that exact answer, and the passport shows time taken and how much was pasted. We do not claim to detect AI text, because no detector is reliable, so we show honest signals instead. |
| What if Gemini hallucinates or is too generous? | It cannot invent evidence: quotes are verified in code, and unsupported high levels are capped. Scores come from a tested formula, 25% deterministic checkpoints. We calibrated on model and weak answers (README table). |
| Why not run the C code? | Executing untrusted code on our server is a security risk we chose not to take in a hackathon. The task is a code review, the way it happens at work; a sandboxed compile service is the next step. |
| Why would a recruiter trust a passport? | It is read-only on our domain, generated only from evaluated attempts, shows the actual answers, and says exactly how it was scored. |
| Privacy? | Anonymous by default. Nothing is public until the student publishes, and unpublishing deletes it. Gemini calls are made with `store: false`. No answers in logs. |
| What does it cost to run? | Three Flash calls per attempt. |
