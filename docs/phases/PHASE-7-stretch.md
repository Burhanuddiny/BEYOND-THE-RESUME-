# Phase 7 — Stretch (only when phases 0–6 are deployed and green)

Pick in this order. Each item is independent; ship one completely (tests, deploy, README) before starting the next. Never submit a stretch item that makes `verify` red: the final submission must be the best green build.

---

## S1. Link preview for shared passports (30 min)

When a passport link is pasted into LinkedIn or WhatsApp, the preview currently shows the generic site title. Server-side: for `GET /p/:passportId`, read the snapshot and return `index.html` with the `<title>`, `og:title` ("{name} — Skill Passport"), `og:description` ("Readiness {overall}/100 across {completed} workplace simulations") and `twitter:card` replaced, HTML-escaping every value. Cache the template string in memory. Test that a name containing `<script>` is escaped.

## S2. "Ask a senior" hint chat (45 min)

In the writing step, a small panel: "Stuck? Ask {stakeholder.name} (3 questions)". Socratic only: the persona answers with a guiding question or a pointer, never the answer.
- `POST /api/attempts/:id/hints` `{ question: string (5–300) }`, `evalLimit`, at most 3 per attempt (409 `hint_limit`).
- The prompt includes the task brief and the grader's reference notes, with the rule: "Never state a bug, cause, fix or wording from the reference notes. Ask a question that helps the candidate notice it themselves. Max 50 words."
- Store `hints: { question, answer }[]` on the attempt; show "Hints used: 2" in the integrity facts and on the passport.
- Tests: the 4th hint → 409; the hints count appears in the result view.

## S3. A fourth task as pure data (40 min)

Proves the "add a task" story. Suggested: **"Review a pull request"** — a short diff of a Python function that adds pagination to an API endpoint with an off-by-one in the page offset, a missing upper bound on `page_size`, and an unhandled empty result. The student writes review comments. Stakeholder: the PR author, a junior teammate who pushes back politely on one comment.

Files: `shared/tasks/review-pull-request.ts`, `server/graders/review-pull-request.ts`, entries in both indexes. The grader tests from Phase 1 cover it automatically. Calibrate it. Update the README's "Adding a task" section with the real file list.

## S4. Placement-cell export (30 min)

On My Passport, **Download as JSON** (the snapshot), via a Blob and `URL.createObjectURL`. A recruiter or placement cell can archive it. Mention a cohort dashboard as the scale path in the README.
