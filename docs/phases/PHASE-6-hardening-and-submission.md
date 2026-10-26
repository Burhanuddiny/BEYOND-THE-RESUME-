# Phase 6 — Hardening, README, second submission

**Effort:** about 45 minutes. **Read first:** `docs/06-IMPLEMENTATION-PLAN.md` §6 (the checklist), `docs/08-PITCH-AND-SUBMISSION.md` §1, `docs/03-ARCHITECTURE.md` §6.

**Goal:** every line of the scoring checklist is ticked with evidence, the README is complete, and the second submission is made.

---

## Steps

### 6.1 Security tests — `tests/security.test.ts`

Against `createApp` in production mode (`NODE_ENV=production`, fake deps):
- `GET /` has `content-security-policy` with `default-src 'self'`, `frame-ancestors 'none'` and `object-src 'none'`; `x-content-type-options: nosniff`; `referrer-policy`; `permissions-policy` containing `camera=()`; `cross-origin-opener-policy: same-origin-allow-popups`; no `x-powered-by`.
- Hashed asset responses have `immutable` caching; `index.html` has `no-cache`. (Create a temporary `dist/` fixture inside the test's temp directory, or point the static root at a fixture folder through `AppDeps`.)
- A 33 kB body → 413. A malformed JSON body → 400 `invalid_request`. An unknown route under `/api` → 404 JSON.
- Rate limiting: the 61st public-passport request in a minute → 429.
- Error responses never contain a stack trace or the word `Error:`.

### 6.2 Secrets and dependencies

- `git grep -nE "AIza[0-9A-Za-z_-]{35}|BEGIN PRIVATE KEY|GEMINI_API_KEY=.+"` finds nothing (except `.env.example` with an empty value).
- `npm audit --omit=dev`: no high or critical findings. If one exists, update the package; if no fix exists, record it in Known limitations with the advisory ID.
- Confirm the logs contain no answer text: run one attempt locally and read the log lines.

### 6.3 Accessibility — extend `tests/a11y.test.tsx`

Run `axe-core` on: Landing, Dashboard (empty and populated), Tasks, Assessment (brief, writing, follow-up and report states with fixtures), My Passport (each publish-panel state) and Public Passport (loaded and not-found). Zero violations.

Manual pass, recorded in the README:
- Keyboard only: complete one task end to end, publish, open the link.
- Contrast: check the theme's light pink text (for example `#876472`, `#7A5060` on `#FAF0F3` / `#FFF9FA`) with a contrast checker; darken any token below 4.5:1 for body text.
- 360 px width and 200% browser zoom: no horizontal scroll, nothing clipped.
- `prefers-reduced-motion: reduce`: no smooth scrolling and no transform animations (wrap hover-lift transitions in a `@media (prefers-reduced-motion: no-preference)` block).
- One `h1` per page; headings in order; landmarks (`header`, `nav`, `main`, `footer`).

### 6.4 Efficiency check

- `npm run build` output: record the initial chunk size (gzip) in the README; it must be ≤ 200 kB.
- Lighthouse (Chrome DevTools, mobile) on the live landing page: Performance, Accessibility and Best Practices ≥ 90. Fix what it flags if cheap (for example, add `font-display: swap`, already in the Google Fonts URL; `width`/`height` on any inline SVG).
- `/api/me` makes one attempts query (check the code).

### 6.5 Code quality sweep

- `grep -rnE ":\s*any\b|as any|@ts-ignore|@ts-expect-error|console\.log" shared server src scripts` returns nothing.
- Every exported function has a one-line JSDoc.
- No unused files (the old `src/data` and `src/types` are gone).
- `npm run test:coverage`: record the figures for `shared/`, `server/` and `src/lib/` in the README.

### 6.6 README

Write `README.md` from the outline in `docs/08-PITCH-AND-SUBMISSION.md` §1, with real numbers: test count, coverage, calibration results, bundle size, Lighthouse scores. Include the "problem statement → feature → file" table with the **official** problem statement text. Link to `docs/` for depth. Keep it scannable: tables and short paragraphs.

Update `metadata.json`'s description if the product description changed. Update `index.html`'s `<meta name="description">` and Open Graph tags to the final tagline and description.

### 6.7 Deploy and second submission

Run the full pre-submission check in `docs/07-DEPLOYMENT.md` §7 (including the passport on a second device). **Make the second submission.** Paste the submission description from `08` §2.

---

## Acceptance criteria

- [ ] Every checkbox in `docs/06-IMPLEMENTATION-PLAN.md` §6 is ticked, with the evidence location noted in the PR description or README.
- [ ] `tests/security.test.ts` and the extended `tests/a11y.test.tsx` pass.
- [ ] README complete with real figures.
- [ ] Second submission made from a green commit, and the live URL passes the pre-submission check.
