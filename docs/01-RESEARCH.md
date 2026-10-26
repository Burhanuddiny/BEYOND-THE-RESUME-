# 01 — Research

What problem Beyond the Resume solves, for whom, what already exists, and what that means for what we build in a hackathon. Every factual claim has a source in §8.

---

## 1. The challenge as we understand it

The official challenge text was not available when this was written. This is the problem statement as reconstructed from the team's own prototype (landing page, task list and metadata), which mirrors the brief:

> College students — especially from tier-2 and tier-3 colleges — have real skills but no way to prove them. Resumes all look the same ("Proficient in Python, C++, SQL, Git"), and recruiters filter on college name and keywords. Build a **workplace simulation platform** where students demonstrate practical skills by doing realistic tasks — for example **debug a C program**, **analyse a small dataset and explain a finding**, **respond professionally to a client reporting a software bug** — and come away with **evidence** of what they can do.

**Action for the team at the briefing:** read the official problem statement word for word, and compare it with the paragraph above. If it names anything we have not planned for (a specific number of tasks, a recruiter-side feature, a particular track, a language requirement), add it to the PRD before Phase 1. The README's "problem statement → feature → file" table (doc 08) must quote the official text, not this reconstruction.

The phrases that matter, and what each one demands of the product:

| Phrase in the brief | What it demands |
|---|---|
| "workplace simulation" | Tasks must feel like a day at work: a real artifact (a code file, a metrics dashboard, an angry email), a colleague or client who reacts to what you did. Not a quiz. |
| "demonstrate practical skills" | The student produces work (code, analysis, an email), not multiple-choice answers. |
| "debug a C program / analyse a dataset / respond to a client" | Three tasks covering three different skill families: code, data, communication. All three must be first-class. |
| "evidence" / "beyond the resume" | Output is proof a third party can inspect: the actual answer, how it was scored, against what rubric. |
| "tier-2 and tier-3 colleges" | Free, works on a low-end laptop or phone, no setup, no paid tools, judged on the work, not the college name. |

---

## 2. Why the problem is real

**Employability is improving but still leaves a large gap.** India Skills Report 2026 (Wheebox/ETS with CII, AICTE and AIU; 700,000+ candidates tested) puts national graduate employability at **56.35%**, up from 54.81%. B.E./B.Tech graduates are at **70.15%** (down slightly from 71.5%). Computer science graduates score highest, at 80%. So roughly three in ten engineering graduates are assessed as not yet employable. And the test only tells you whether you clear a bar; it does not give an employer evidence of what you can do.

**The signal problem is getting worse, not better.** AI tools now let a candidate produce a polished, keyword-matched resume in seconds, so polish stops telling a recruiter anything. Products in this space now say this openly: Flowmind ("Every application looks polished, so polish tells you nothing. Evidence tasks give reviewers an actual role-related work sample to read") and Ksham ("Your code is your resume").

**Work samples are an established way to predict job performance.** The U.S. Office of Personnel Management's assessment guidance says work-sample tests have high content validity, high criterion-related validity ("performance on the tests relates highly to performance on the job"), are perceived by applicants as very fair, and generally show little or no performance difference between demographic groups. Their two drawbacks are cost: they are "costly to develop" and "time consuming and expensive to administer", because a trained assessor has to rate each one. **That cost is exactly what an AI evaluator removes.** This is the core insight of the product, and it belongs in the pitch.

**Simulations measurably help candidates get hired.** Forage, the best-known virtual job simulation platform, reports students are "3.3x more likely to land a job after participating in a job simulation" (company claim). A 2021 Citi Ventures write-up adds employer-side data: at one enterprise, 9% of applicants had done a Forage course but they got 30% of interviews and 70% of offers. These are vendor numbers. Use them as evidence that employers value simulations, not as proof of causation.

---

## 3. Who we build for

**Primary user — Aarav (the persona already in the prototype).** Final-year B.Tech CSE at an AKTU-affiliated college. Knows C, some Python, has done a mini-project. Applies through job portals and campus drives, and is filtered out before any engineer reads his work. He has a mid-range Android phone and a shared laptop. He has never worked in a company, so he does not know what "good" looks like for an incident email or a metrics write-up. He needs to (a) practise real work safely, (b) learn what good looks like, and (c) get something he can link from his resume and LinkedIn.

**Secondary user — Meera, a recruiter or engineering lead at a startup** (the person who opens the passport link). She has 30 seconds per candidate. She does not trust self-declared skills or certificates. She will trust: the candidate's actual answer, how it was scored and against which rubric, how long it took, and whether the candidate held up when challenged with a follow-up.

**Tertiary — a placement officer at a tier-3 college.** Out of scope for the build. Mention it as the scale path in the pitch: "a cohort dashboard for placement cells".

---

## 4. What already exists

| Product | What it does | Gap we fill |
|---|---|---|
| **Forage** (theforage.com) | Free, self-paced job simulations built with large employers; you compare your work with a model answer and get a certificate | **No evaluation of your work** (self-comparison only); certificate proves completion, not quality; built for big global brands |
| **Ksham** (ksham.in) | Real production-bug challenges in a browser IDE with automated grading and telemetry | Code only (no data or communication tasks); aimed at employers screening, heavy setup |
| **TaskLearn** (tasklearn.app) | Real-world tasks with instant AI feedback and skill badges | Generic, global; badge is a certificate, not inspectable evidence |
| **Flowmind** (flowmind.io) | Employers give candidates the same short work task; reviewers get a brief with evidence | Employer-side tool; the candidate cannot build a portfolio with it |
| **Hirable** (hirable.co.in) | Company-specific interview prep with typed scenarios and an adaptive follow-up question | Interview prep, not proof; no public evidence page |
| **SkillBridge** (a tier-2/3 student project) | Blind human review of skill evidence, gig marketplace | Needs human reviewers; does not scale |
| **HackerRank / LeetCode-style platforms** | Algorithm puzzles with test cases | Tests puzzles, not day-1 work; no communication or data reasoning |

**What nobody combines:** (1) realistic tasks across code, data and communication; (2) automatic, rubric-based evaluation with evidence you can check; (3) a simulated colleague who reacts to what you wrote; (4) a free, public, recruiter-readable passport that shows the actual work. That combination is our position.

**Ideas worth borrowing:**
- From Forage: reveal the **model answer after submission**, so the student learns what good looks like.
- From Hirable: **one adaptive follow-up** generated from the student's own answer. It is also the strongest anti-copy measure available to us: pasting a ChatGPT answer is easy, but reacting to a new twist from a colleague is much harder to fake.
- From Flowmind: show **evidence quotes**. Every judgement points at the exact words in the answer that earned it.
- From SkillBridge: **judge the work, not the college**. The evaluator never sees the student's name or college.

---

## 5. Insights that drive the design

1. **Trust is the product.** A recruiter believes a score only if they can see why it was given. So every criterion shows a level, a one-line rationale, and the quoted evidence from the answer. Quotes are checked by code: if the model "quotes" something the student never wrote, that evidence is dropped and the score is capped. This also answers the obvious judge question, "what if the AI hallucinates?"
2. **The model judges; the code decides.** Gemini rates each rubric criterion on a 0–4 scale with anchored descriptions (more reliable than asking for a percentage). Code turns levels into scores with a fixed, tested formula, and blends in deterministic checkpoints (for example "did the answer mention `sizeof(int)`?"). The same answer always maps to the same arithmetic.
3. **A simulation reacts.** After the first submission, the client, PM or senior engineer replies in character with one follow-up that targets a gap in *this* answer. The student answers once more. This is what makes it a simulation rather than an exam, and the demo moment judges will remember.
4. **Honest integrity signals beat fake proctoring.** We record time on task (server-measured), how much of the answer was pasted versus typed, and tab switches. We show them on the passport as plain facts, and never as an accusation or a score penalty. We say clearly that we do not detect AI-written text, because no detector is reliable.
5. **No fake numbers.** The prototype shows invented benchmarks ("Campus Median", "+17% Over Average", "Tier-1 benchmark"). An automated code assessment and a sharp judge will both notice. A fixed, explained job-ready threshold (70/100 per pillar) is honest and still motivating.
6. **Zero friction to start.** Anonymous sign-in happens silently on first visit, so a student (or a judge) can start a task in one click. Google sign-in is asked for only when they want to publish a passport under their real name.

---

## 6. What wins *this* hackathon

The previous PromptWars event this team entered used an automated code assessment to pick the Top 10, with a working Cloud Run link required. Assume the same until the briefing says otherwise. The plan is ordered around it:

| Criterion | What we do |
|---|---|
| Problem statement alignment | The three named tasks, done deeply; README maps each phrase of the brief to a feature and a file |
| Code quality | Strict TypeScript, shared types, pure logic separated from React and Express, ESLint clean, CI |
| Security | Answer keys server-only (with a build check), zod everywhere, helmet + CSP, rate limits, Firebase token verification, Firestore locked to the server, prompt-injection handling, secrets in Secret Manager |
| Efficiency | Public task content bundled (no fetch to start a task), evaluation and follow-up generation run in parallel, compression and immutable caching, lazy-loaded heavy pages |
| Testing | Table-driven scoring tests, evidence-verification tests, grader tests (the model answer must hit every checkpoint), route tests with Gemini mocked, security-header tests, an axe accessibility test, a bundle-leak test |
| Accessibility | Labels, focus, live regions, contrast fixes, numbers plus words (never colour alone), 360 px layout |
| Google services | Gemini API (evaluation + follow-up), Firebase Authentication, Cloud Firestore, Cloud Run, Secret Manager, Cloud Build, Artifact Registry, Cloud Logging — each one actually called |

For the human pitch, one moment does the work: a judge types a deliberately weak answer to the client email, and "Sarah from Nordic Apparel" replies, annoyed, about exactly what was missing. Then the passport shows the judge's own words quoted as evidence.

---

## 7. Deliberate non-goals (and why)

| Not building | Why |
|---|---|
| Running student code (C compiler or sandbox) | A code-execution sandbox on Cloud Run is a security liability that would cost us Security points and hours of build time. The C task is a *code review and fix* task: checkpoints plus the evaluator cover it. Mentioned as a future step. |
| AI-text detection | Unreliable and unfair. Integrity signals plus the live follow-up are the honest alternative. |
| Recruiter accounts, job marketplace, messaging | A second product. The public passport link is the recruiter feature. |
| Many tracks or dozens of tasks | Depth over breadth. Tasks are data files; adding one is documented (stretch phase). |
| Proctoring with webcam or face detection | Invasive, adds friction for the exact users we serve, and is easy to get wrong in a hackathon. |
| Leaderboards | They rank students against each other, which works against "judged on your work, not your college". |

---

## 8. Sources

Read on 2026-10-19.

- India Skills Report 2026 (Wheebox/ETS): https://wheebox.com/assets/pdf/ISR_Report_2026.pdf
- India Today, "Decoding the India Skills Report 2026" (56.35% national, 70.15% B.E./B.Tech, 700,000+ candidates): https://www.indiatoday.in/india-today-insight/story/ai-tech-skills-improving-employability-decoding-the-india-skills-report-2026-2820561-2025-11-16
- Times of India on engineering employability trend: https://timesofindia.indiatimes.com/education/careers/news/are-engineering-graduates-back-in-demand-computer-science-and-it-drive-b-tech-employability-surge-in-india/articleshow/127798524.cms
- U.S. OPM, Work Samples and Simulations: https://www.opm.gov/policy-data-oversight/assessment-and-selection/other-assessment-methods/work-samples-and-simulations
- Forage home page (3.3x claim) and "What is a virtual job simulation": https://www.theforage.com/ , https://www.theforage.com/blog/basics/virtual-work-experience
- Citi Ventures on Forage hiring outcomes: https://www.citi.com/ventures/perspectives/pressrelease/investing-in-forage.html
- Flowmind: https://www.flowmind.io/
- Ksham: https://ksham.in/
- TaskLearn: https://tasklearn.app/
- Hirable: https://hirable.co.in/
- SkillBridge: https://skillbridge.debarghya.org/
- Gemini models (gemini-3.8-flash recommended for new projects): https://ai.google.dev/gemini-api/docs/models
- Gemini Interactions API and structured outputs: https://ai.google.dev/gemini-api/docs/interactions-overview , https://ai.google.dev/gemini-api/docs/structured-output
