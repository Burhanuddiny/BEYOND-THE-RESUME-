# Phase 5 — Skill Passport: publish, share, recruiter view

**Effort:** about 45 minutes. **Read first:** `docs/02-PRD.md` J3, J4, FR-S1 to FR-S4, `docs/04-DATA-FLOW-AND-CONTRACTS.md` §1 (passport types), §3, §6.

**Goal:** a student publishes a passport, and anyone with the link sees the evidence without signing in.

---

## Steps

### 5.1 Server — `server/routes/passports.ts`

- `POST /api/passport` (auth):
  1. Load the user and attempts. No profile → 409 `profile_required`. No complete attempt → 409 `nothing_to_publish`.
  2. `preview = buildPassportPreview(attempts, PUBLIC_TASKS)`.
  3. Reuse `user.publishedPassportId` if set; otherwise `passportId()` from `server/lib/ids.ts` (retry once if `getPassport` finds a collision).
  4. With `auth = currentUser(res)`, the snapshot is `{ ...preview, passportId, ...profile, identityVerified: auth.provider === 'google.com', track: 'Junior Software Developer', issuedAt (keep the original if republishing), updatedAt: now }`. If identity is verified and `auth.name` is set, use it as `displayName` (the profile name is the fallback).
  5. `savePassport(snapshot, uid)`, `setPublishedPassportId(uid, passportId)`.
  6. Return `{ passportId, path: '/p/' + passportId }`.
- `DELETE /api/passport` (auth): if published, `deletePassport` and `setPublishedPassportId(uid, null)`. 204 either way (idempotent).
- `GET /api/passports/:passportId` (public, `publicPassportLimit`): validate the ID format (400 if invalid), 404 if missing, else `{ passport }`. Set `Cache-Control: no-store` (a student can unpublish at any time).

`GET /api/me` already returns `published: { passportId } | null` from `user.publishedPassportId`.

Tests (add to `tests/routes.test.ts`, or a new `tests/passport-routes.test.ts`):
- Publish without a profile → 409 `profile_required`; with a profile but no complete attempt → 409 `nothing_to_publish`.
- Publish, then `GET` the public route without a token → 200; the body contains no `ownerUid`, no `uid` and no email.
- Republish → same `passportId`, `issuedAt` unchanged, `updatedAt` changed.
- Anonymous publish → `identityVerified: false`; Google (`token-bob`) → `true`.
- Unpublish → public `GET` 404; unpublish again → 204.
- Malformed ID → 400; unknown well-formed ID → 404.

### 5.2 Profile form — `src/components/ProfileForm.tsx`

Fields from `ProfileBody`: Full name, College, Degree (placeholder "B.Tech, Computer Science"), Graduation year (`<input type="number" inputMode="numeric" min="2000" max="2035">`). Every field has a `<label>`. Inline errors are tied to their fields with `aria-describedby`. Saves via `PUT /api/me/profile`. If signed in with Google, pre-fill the name from the Firebase user.

### 5.3 My Passport — `src/pages/SkillPassportPage.tsx`

Rebuild on real data, keeping the existing visual style:

- **Header:** name (or "Your passport"), track, college and degree when known; readiness `ScoreBadge`; coverage "2 of 3 tasks".
- **Overview tab:** `PillarBar` per pillar with the job-ready threshold. "Not assessed yet" for missing pillars.
- **Evidence tab:** per completed task (best attempt): title, score, completed date, attempts count, time taken, the answer (collapsed), the follow-up exchange, the summary.
- **Publish panel** (right column on desktop, below on mobile), in order of state:
  1. No completed task: explain "Complete at least one task to publish", plus a link to Tasks. The publish button is not shown.
  2. Missing profile: `ProfileForm` inline.
  3. Anonymous: a callout, "Publish under your Google name to show a verified identity", with **Continue with Google** (`signInWithGoogle`), and below it a quieter option, "Publish with the name I entered". Handle `credential-already-in-use` with the confirm dialog described in Phase 3 (a native `<dialog>` element with `showModal()`, a labelled heading, and Cancel / Switch account buttons).
  4. Consent line above the button: "Your answers to completed tasks will be visible to anyone with the link."
  5. **Publish passport** shows its pending state ("Publishing…"); on success: the full link (`location.origin + path`) in a read-only input, **Copy link** (with a "Copied" confirmation in an `aria-live` region), **Open**, **Copy LinkedIn summary**, **Update** (republish) and **Unpublish** (asks for confirmation).
- **Copy LinkedIn summary** text (real values only):
  ```
  I completed {completed} realistic junior-engineer work simulations on Beyond the Resume — {task titles joined by ", "}.
  Readiness: {overall}/100 ({band label}). See my actual answers and how they were scored: {link}
  ```
- Remove the hard-coded "#BTR-2026-8941", "Campus Median", "+17% Over Average", "Audited Rubrics", "Recorded in Session" and every other demo label.

### 5.4 Public passport — `src/pages/PublicPassportPage.tsx` (lazy-loaded)

Fetches `GET /api/passports/:id` without a token (it must work with no Firebase initialisation: do not call `useAuth` on this page, and do not render `AuthButton`; show a minimal header with the logo and a "Build your own passport" link).

Layout, top to bottom:
1. Name, plus "Identity: Google-verified" or "Name self-declared"; college, degree, graduation year; track; issued and updated dates; the passport ID in small monospace.
2. Readiness `ScoreBadge` and coverage; pillar bars with the threshold.
3. Per task (cards): title and code, score and band, completed date, time taken, attempts, % pasted, tab-hidden count; the evaluator summary; criteria with level and verified quotes; the full answer in a `<details>`; the follow-up message and reply.
4. **How this was assessed** box: "Each answer was graded by an AI evaluator (Google Gemini) against the published rubric on a 0–4 scale. Every judgement had to quote the candidate's own words; quotes that could not be found were discarded and the level capped. 25% of each pillar comes from fixed checks for key points. Time is measured by our server; paste and tab counts are reported by the candidate's browser. We do not attempt to detect AI-written text. Scores are evidence to discuss, not a hiring decision."
5. **Print / Save as PDF** button (`window.print()`).

States: loading; not found ("This passport was unpublished, or the link is incorrect."); error with retry.

Set `document.title` to "{name} — Skill Passport · Beyond the Resume", and add `<meta name="robots" content="noindex">` dynamically on this page (passports are shared by link, not meant for search engines).

### 5.5 Print stylesheet — `src/index.css`

`@media print`: hide the header, footer and every button; force a white background and black text; expand all `<details>` content (render answers in full in print by giving them a print-only duplicate block, since `<details>` cannot be force-opened by CSS); `break-inside: avoid` on task cards; A4 margins with `@page { margin: 16mm; }`.

### 5.6 Deploy

Deploy, then publish a passport from one device and open the link on another.

---

## Acceptance criteria

- [ ] All route tests in 5.1 pass; `npm run verify` green.
- [ ] Live: publish as anonymous ("Name self-declared"), then link Google and republish ("Google-verified"), with the same URL both times.
- [ ] Live: the passport link opens on a second device or browser profile with no sign-in, and shows the real answers.
- [ ] Unpublish makes the link show the not-found state.
- [ ] Print preview shows a clean A4 document with the answers included.
- [ ] No fake labels remain on the passport pages.

## Fallbacks

- If Google linking misbehaves: ship self-declared names only and note it in Known limitations.
- If time is short: skip the print stylesheet and the LinkedIn summary (cut order in `06` §2).
