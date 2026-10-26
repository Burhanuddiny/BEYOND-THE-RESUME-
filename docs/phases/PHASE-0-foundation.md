# Phase 0 — Foundation and first deploy

**Effort:** about 45 minutes. **Read first:** `AGENTS.md`, `docs/03-ARCHITECTURE.md` §5–§7, `docs/06-IMPLEMENTATION-PLAN.md` §4, `docs/07-DEPLOYMENT.md`.

**Goal:** the existing front end is served by an Express server, the toolchain (install, typecheck, lint, test, build, CI) is green, and the app is live on Cloud Run. No product behaviour changes yet.

**Human first:** do `docs/07-DEPLOYMENT.md` steps 1–3 (Cloud project, secret, Firestore, Firebase). If they are not done yet, Phase 0 can still deploy with `STORE=memory`.

---

## Steps

### 0.1 Fix dependencies

The clean install currently fails (`esbuild ^0.25` vs Vite 8's peer range `^0.27 || ^0.28`). `typescript-eslint` requires TypeScript `<6.1`. Both fixes were verified on 2026-10-19.

In `package.json`:
- Rename `"name"` to `"beyond-the-resume"`, keep `"private": true`, add `"engines": { "node": ">=22.12" }`.
- Set `"esbuild": "^0.28.0"` and `"typescript": "~6.0.3"`.
- Move the packages only the browser bundle or the build needs to `devDependencies`: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `tailwindcss`, `react`, `react-dom`, `lucide-react`. (They are bundled into `dist/` at build time; the runtime image does not need them.)
- Remove the unused `motion` and `autoprefixer` (Tailwind v4 needs no autoprefixer; `motion` is not imported anywhere — check with `grep -rn "motion" src` first).

Then install (this exact set resolves without conflicts, verified):

```bash
npm install
npm install express@^5.3.0 helmet@^8.3.0 express-rate-limit@^8.7.1 compression@^1.8.2 zod@^4.6.7 firebase-admin@^14.5.0
npm install -D firebase@^13.0.0 @types/express@^5 @types/compression @types/supertest supertest@^7.3.1 \
  vitest@^5.0.5 @vitest/coverage-v8@^5.0.5 jsdom@^30 @testing-library/react@^16.3.3 @testing-library/dom axe-core@^4.14.0 \
  eslint@^9 @eslint/js@^9 typescript-eslint@^8.72.0 eslint-plugin-react-hooks@^7.1.1 eslint-plugin-jsx-a11y@^6.10.2 globals
```

Runtime `dependencies` must end up as exactly: `@google/genai`, `compression`, `dotenv`, `express`, `express-rate-limit`, `firebase-admin`, `helmet`, `zod`. (`firebase` is the browser SDK, bundled, so it goes in devDependencies.)

Commit `package-lock.json`.

### 0.2 Scripts

Replace `scripts` with the canonical set in `docs/06-IMPLEMENTATION-PLAN.md` §4.

### 0.3 `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "types": ["vite/client", "node"],
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "skipLibCheck": true,
    "allowImportingTsExtensions": true,
    "noEmit": true,
    "paths": { "@/*": ["./*"] }
  },
  "include": ["src", "shared", "server", "tests", "scripts", "vite.config.ts", "vitest.config.ts"]
}
```

Turning on `strict` may surface errors in the existing pages. Fix them properly (types, not casts to `any`).

### 0.4 `eslint.config.js`

```js
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import globals from 'globals';

export default tseslint.config(
  { ignores: ['dist', 'dist-server', 'coverage', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: { 'react-hooks': reactHooks, 'jsx-a11y': jsxA11y },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      'no-console': ['error', { allow: ['error'] }],
    },
  },
);
```

If an import name differs in the installed plugin versions, check the plugin README in `node_modules` and adapt. Fix every lint error in existing code. (This config was run on the current `src/` on 2026-10-19: it loads correctly and reports 22 errors, mostly unused `lucide-react` imports and variables, plus `react-hooks/set-state-in-effect` in `AssessmentPage.tsx`. That page is rewritten in Phase 4; for now, fix it by keying the component on the task ID from `App.tsx` (`<AssessmentPage key={task.id} ... />`) and initialising state from props, instead of resetting state in an effect.) `server/lib/log.ts` will write with `process.stdout.write`, so it needs no `console`.

### 0.5 `vitest.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname, '.') } },
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
    coverage: { provider: 'v8', include: ['shared/**', 'server/**', 'src/lib/**'], reporter: ['text', 'json-summary'] },
  },
});
```

React tests opt in to the DOM with a first-line comment: `// @vitest-environment jsdom`.

### 0.6 Server skeleton

`server/env.ts`: a zod schema over `process.env`. Phase 0 fields: `NODE_ENV` (`development` | `production` | `test`, default `development`), `PORT` (coerced number, default 3000), `STORE` (`memory` | `firestore`, default `memory`). Later phases add the Gemini and Firebase variables from `docs/07-DEPLOYMENT.md` §5. Export `loadEnv(source = process.env)`. On failure, log which variables are wrong (names only) and exit with code 1.

`server/lib/log.ts`:

```ts
type Severity = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR';
/** Writes one JSON line that Cloud Logging parses (severity + message + fields). */
export function log(severity: Severity, message: string, fields: Record<string, unknown> = {}): void {
  process.stdout.write(JSON.stringify({ severity, message, ...fields, time: new Date().toISOString() }) + '\n');
}
```

`server/middleware/security.ts`: export `securityMiddleware(opts: { production: boolean; authDomain?: string })`, which returns an array of handlers:
- `helmet({ contentSecurityPolicy: production ? { directives } : false, crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' } })`. **The COOP setting matters:** helmet's default `same-origin` breaks Firebase `signInWithPopup`.
- CSP directives (production only; Vite dev needs inline scripts and websockets):
  ```
  default-src 'self'
  script-src 'self' https://apis.google.com
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
  font-src 'self' https://fonts.gstatic.com
  img-src 'self' data: https://*.googleusercontent.com
  connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseinstallations.googleapis.com
  frame-src https://<authDomain> https://accounts.google.com https://apis.google.com
  frame-ancestors 'none'
  object-src 'none'
  base-uri 'self'
  form-action 'self'
  ```
  (`style-src 'unsafe-inline'` is needed for React `style` attributes. Leave `frame-src` out if `authDomain` is unset.)
- A middleware that sets `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`.

`server/app.ts`:

```ts
export interface AppDeps {
  web?: express.RequestHandler;     // Vite dev middleware; when absent, serve distDir
  distDir?: string;                 // default path.resolve('dist'); tests point it at a fixture folder
  // Later phases add: store, model, verifyToken, firebaseWebConfig
}

/** Builds the Express app. No listening, no side effects; tests call this directly. */
export function createApp(deps: AppDeps, env: Env): express.Express
```

Order of middleware:
1. `app.set('trust proxy', 1)` (Cloud Run is behind one proxy; rate limits need the real IP).
2. `securityMiddleware(...)`, `compression()`, `express.json({ limit: '32kb' })`.
3. `GET /healthz` returns `{ ok: true }`.
4. `/api` routers (added in later phases), then `app.use('/api', (_req, res) => res.status(404).json({ error: 'not_found' }))`.
5. Web: if `deps.web`, `app.use(deps.web)`. Otherwise `express.static(dist, { index: false, setHeaders })`, where hashed files under `/assets/` get `Cache-Control: public, max-age=31536000, immutable`. Then the SPA fallback: Express 5 syntax `app.get('/{*splat}', ...)` sends `dist/index.html` with `Cache-Control: no-cache`.
6. Error handler (`server/middleware/errors.ts`): body-parser `entity.too.large` → 413 `payload_too_large`; JSON `SyntaxError` → 400 `invalid_request`; `ApiError(status, code)` → its status and code; anything else → log it and return 500 `internal`.

`server/index.ts`:

```ts
import 'dotenv/config';
const env = loadEnv();
let web: express.RequestHandler | undefined;
if (env.NODE_ENV !== 'production') {
  const { createServer } = await import('vite');
  const vite = await createServer({ server: { middlewareMode: true }, appType: 'spa' });
  web = vite.middlewares;
}
const app = createApp({ web }, env);
app.listen(env.PORT, () => log('INFO', 'listening', { port: env.PORT }));
```

Resolve `dist/` relative to the process working directory (`path.resolve('dist')`), since the bundled file lives in `dist-server/`.

Add `dist-server` to `.gitignore`.

### 0.7 Docker

Create `Dockerfile` and `.dockerignore` exactly as in `docs/07-DEPLOYMENT.md` §6.

### 0.8 CI — `.github/workflows/ci.yml`

```yaml
name: ci
on: [push, pull_request]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run verify
```

### 0.9 First tests

- `tests/health.test.ts`: supertest `GET /healthz` → 200 `{ ok: true }`; `GET /api/nope` → 404 `{ error: 'not_found' }`; an oversized JSON body to any API path → 413.
- `tests/bundle.test.ts`: skip when `dist/` does not exist (`describe.skipIf(!existsSync('dist'))`). Read every `dist/assets/*.js`. Assert none matches the Google API key pattern `/AIza[0-9A-Za-z_-]{35}/`. (Phase 1 extends this test.)

### 0.10 Deploy

Run `npm run verify`, then deploy with `docs/07-DEPLOYMENT.md` §4 using only `--set-env-vars STORE=memory`. Open the URL.

---

## Acceptance criteria

- [ ] `rm -rf node_modules && npm ci` succeeds on a clean checkout.
- [ ] `npm run verify` is green (typecheck, lint, tests, build, bundle check).
- [ ] `npm run dev` serves the existing UI on http://localhost:3000 with hot reload.
- [ ] `npm run build && npm start` (with `NODE_ENV=production`) serves the built UI; a deep link like `/tasks` returns the app, not a 404.
- [ ] The live Cloud Run URL shows the existing landing page; `/healthz` returns `{"ok":true}`.
- [ ] Response headers on the live URL include `content-security-policy`, `permissions-policy`, `cross-origin-opener-policy: same-origin-allow-popups`, and gzip/br `content-encoding` on JS.
- [ ] The CI workflow is green on GitHub.

## Fallbacks

- If `gcloud run deploy --source` fails to build: read the Cloud Build log link it prints; the usual cause is a missing `package-lock.json` or a devDependency needed at runtime.
- If an ESLint plugin's flat-config export name differs: adapt to its README. Do not drop the plugin.
