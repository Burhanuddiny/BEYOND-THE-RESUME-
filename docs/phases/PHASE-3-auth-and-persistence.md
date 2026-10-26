# Phase 3 — Authentication and persistence

**Effort:** about 60 minutes. **Read first:** `docs/03-ARCHITECTURE.md` D5–D7, `docs/04-DATA-FLOW-AND-CONTRACTS.md` §4, §6, §7, `docs/07-DEPLOYMENT.md` §2–§3.

**Goal:** real users and real storage. The browser signs in silently (anonymous) and can upgrade to Google; the server stores everything in Firestore; the Firebase web config comes from the server at runtime.

**Human first:** `docs/07-DEPLOYMENT.md` §2 and §3 must be done (Firestore database, rules published, Anonymous + Google providers enabled, web app registered).

---

## Steps

### 3.1 Environment and config route

Add `FIREBASE_WEB_API_KEY`, `FIREBASE_AUTH_DOMAIN` and `FIREBASE_APP_ID` to `server/env.ts` (required in production). Pass `authDomain` into `securityMiddleware` so the CSP `frame-src` allows it.

`server/routes/config.ts`: `GET /api/config` returns `{ firebase: { apiKey, authDomain, projectId, appId } }` with `Cache-Control: public, max-age=300`. These values are public identifiers by Firebase's design; they are served at runtime so the container image does not depend on build-time variables.

### 3.2 `server/store/firestoreStore.ts`

```ts
/** Store backed by Cloud Firestore via the Admin SDK. */
export function createFirestoreStore(db: Firestore, prefix = ''): Store;
```

- In `server/index.ts`: `const db = getFirestore(adminApp); db.settings({ ignoreUndefinedProperties: true });` **before any read or write**. (Firestore rejects `undefined` fields, and optional fields like `submittedAt` are undefined until set.)
- Collections: `${prefix}users`, `${prefix}attempts`, `${prefix}passports`.
- `createAttempt`: `const ref = db.collection(...).doc();` (auto-ID, 20 chars), then `ref.set(data)`, then return `{ id: ref.id, ...data }`.
- `updateAttempt`: `ref.update(patch)`, then read back and return.
- `listAttempts(uid)`: `.where('uid', '==', uid).get()`, sorted in memory by `startedAt`. No composite index needed.
- `savePassport`: `set({ ...snapshot, ownerUid })`. `getPassport`: read and remove `ownerUid` before returning.
- `saveProfile`: `set({ profile, updatedAt, createdAt (only if new) }, { merge: true })`.

`server/index.ts` picks the store: `env.STORE === 'firestore' ? createFirestoreStore(db) : new MemoryStore()`.

Run the store contract suite from Phase 2 against Firestore **only** when `FIRESTORE_TEST=1` and credentials are present (`describe.skipIf`), with `prefix = 'test_' + random`, deleting its documents afterwards. It is skipped in CI. Run it once locally after `gcloud auth application-default login` and note the result.

### 3.3 `firestore.rules`

Commit the deny-all rules from `docs/07-DEPLOYMENT.md` §2 at the repo root (the human already published them in the console).

### 3.4 Client Firebase — `src/lib/firebase.ts`

```ts
import { initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

let authPromise: Promise<Auth> | null = null;
/** Initialises Firebase once, from the server-provided public config. */
export function getFirebaseAuth(): Promise<Auth> {
  authPromise ??= fetch('/api/config')
    .then((r) => { if (!r.ok) throw new Error('config_unavailable'); return r.json(); })
    .then(({ firebase }) => getAuth(initializeApp(firebase)));
  return authPromise;
}
```

### 3.5 Auth state — `src/lib/useAuth.tsx`

An `AuthProvider` (React context) wrapping the app, plus a `useAuth()` hook returning:

```ts
interface AuthState {
  status: 'loading' | 'ready' | 'error';
  user: { uid: string; isAnonymous: boolean; displayName: string | null } | null;
  signInWithGoogle(): Promise<void>;
  signOut(): Promise<void>;
  getIdToken(): Promise<string>;
}
```

Behaviour:
1. On mount: `getFirebaseAuth()`, then `onAuthStateChanged`. If there is no user, call `signInAnonymously(auth)`. `status` becomes `ready` once a user exists.
2. `signInWithGoogle()`: if the current user is anonymous, `linkWithPopup(user, new GoogleAuthProvider())`. On `auth/credential-already-in-use`, the Google account already has its own history. The UI (Phase 5) shows a confirm dialog: "This Google account already has progress. Switch to it? Tasks done on this device as a guest stay behind." If confirmed, `signInWithCredential(auth, GoogleAuthProvider.credentialFromError(err))`. If the user is not anonymous, use `signInWithPopup`.
3. **After a link or sign-in, call `user.getIdToken(true)`** so the server sees the new `sign_in_provider` claim (`google.com`).
4. `signOut()`: `auth.signOut()`; the mount effect then signs in anonymously again (a fresh guest).
5. `auth/popup-blocked` and `auth/popup-closed-by-user` are reported to the caller as a friendly message, not thrown into the console.

### 3.6 API client — `src/lib/api.ts`

```ts
export class ApiError extends Error { constructor(public status: number, public code: string) { super(code); } }
/** fetch wrapper: JSON in/out, Bearer ID token when `token` is given, ApiError on non-2xx. */
async function request<T>(method: string, path: string, opts: { body?: unknown; token?: string } = {}): Promise<T>;
```

One exported function per route in `04` §3, each typed with the shared types (`getMe(token)`, `startAttempt(token, taskId)`, `getAttempt(token, id)`, `submitAttempt(token, id, body)`, `sendFollowUp(token, id, body)`, `saveProfile(token, profile)`, `publishPassport(token)`, `unpublishPassport(token)`, `getPublicPassport(id)`). A network failure becomes `ApiError(0, 'network')`.

Tests (`tests/api.test.ts`, jsdom): with `fetch` stubbed, a 409 `{ error: 'invalid_state' }` becomes `ApiError(409, 'invalid_state')`; the Authorization header is set; a network failure becomes `ApiError(0, 'network')`.

### 3.7 `src/lib/useMe.ts`

```ts
/** Loads /api/me for the signed-in user; refresh() after any change. */
export function useMe(): { data: MeResponse | null; loading: boolean; error: ApiError | null; refresh(): Promise<void> };
```

Reloads automatically when `user.uid` changes (after a Google link with a switch, or a sign-out).

### 3.8 Navbar auth control — `src/components/AuthButton.tsx`

- Loading: a small neutral placeholder, the same size (no layout shift).
- Anonymous: a secondary button "Save progress with Google" (Google "G" as inline SVG, `aria-label` included).
- Google user: initials avatar + first name; a menu or button "Sign out".
- Wrap the app in `AuthProvider` in `src/App.tsx`.

### 3.9 Deploy

Deploy with the full env set from `docs/07-DEPLOYMENT.md` §4 (`STORE=firestore`). Then add the Cloud Run hostname to Firebase **Authorized domains** (§3 step 4).

---

## Acceptance criteria

- [ ] `npm run verify` green.
- [ ] Live: on first visit, the browser network tab shows `/api/config` then a successful Firebase anonymous sign-in, and `GET /api/me` returns 200 with no profile and no attempts.
- [ ] Live: "Save progress with Google" links the account; `GET /api/me` then returns `identityVerified: true` with the **same** set of attempts as before linking.
- [ ] Live: starting an attempt (temporarily via the console, `await (await fetch(...))`) creates a document in `attempts` visible in the Firestore console.
- [ ] Firestore rules deny direct client access (in the Firebase console Rules playground, a read of `attempts/x` from an authenticated user is denied).
- [ ] No CSP violations in the browser console during sign-in.

## Fallbacks

- Popup blocked in a browser: it still works anonymously. Publishing with a self-declared name is allowed (FR-P2).
- Firestore not ready: deploy with `STORE=memory --max-instances 1`, and note in Known limitations that data resets on restart.
- CSP blocks a Firebase request: copy the blocked origin from the console error into the matching directive in `security.ts`.
