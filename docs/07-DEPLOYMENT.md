# 07 — Deployment and Google Cloud / Firebase setup

Steps 1–3 are done **once, by a human, in the browser and terminal**, before or at the start of Phase 0. Step 4 is run after every phase.

Region: `asia-south1` (Mumbai) everywhere, for latency to Indian users.

---

## 1. Google Cloud project (10 minutes)

1. Create or pick a project at https://console.cloud.google.com with billing enabled. Note the **Project ID** (below: `PROJECT_ID`).
2. Install the gcloud CLI if needed, then in a terminal:

```bash
gcloud auth login
gcloud config set project PROJECT_ID
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com secretmanager.googleapis.com \
  firestore.googleapis.com identitytoolkit.googleapis.com
```

3. Create a Gemini API key at https://aistudio.google.com/apikey (choose the same project). Store it in Secret Manager:

```bash
printf "%s" "PASTE_GEMINI_KEY" | gcloud secrets create gemini-api-key --data-file=-
```

4. Give the Cloud Run runtime service account access to the secret and to Firestore:

```bash
SA="$(gcloud projects describe PROJECT_ID --format='value(projectNumber)')-compute@developer.gserviceaccount.com"
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$SA" --role=roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding PROJECT_ID --member="serviceAccount:$SA" --role=roles/datastore.user
```

(Verifying Firebase ID tokens needs no extra role: the Admin SDK checks them against Google's public keys.)

## 2. Firestore (3 minutes)

```bash
gcloud firestore databases create --location=asia-south1
```

Then in https://console.firebase.google.com (after step 3 links the project) open **Firestore Database → Rules**, paste the contents of `firestore.rules` from the repo, and **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

The server uses the Admin SDK, which bypasses rules. Browsers can never read or write directly.

## 3. Firebase Authentication (7 minutes)

1. https://console.firebase.google.com → **Add project** → choose the **existing** Google Cloud project `PROJECT_ID`. Analytics: off.
2. **Build → Authentication → Get started → Sign-in method**: enable **Anonymous** and **Google** (set the support email).
3. **Project settings → General → Your apps → Add app → Web** (no hosting). Copy `apiKey`, `authDomain`, `projectId` and `appId` from the config shown. These are public identifiers, not secrets.
4. After the first deploy (step 4), go to **Authentication → Settings → Authorized domains → Add domain** and add the Cloud Run hostname (for example `beyond-the-resume-abc123-el.a.run.app`). `localhost` is authorised by default.

## 4. Deploy (every phase)

```bash
npm run verify
gcloud run deploy beyond-the-resume \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated \
  --memory 512Mi --cpu 1 \
  --min-instances 1 --max-instances 5 \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest \
  --set-env-vars GEMINI_MODEL=gemini-3.8-flash,STORE=firestore,FIREBASE_PROJECT_ID=PROJECT_ID,FIREBASE_WEB_API_KEY=WEB_API_KEY,FIREBASE_AUTH_DOMAIN=PROJECT_ID.firebaseapp.com,FIREBASE_APP_ID=WEB_APP_ID
```

- Phase 0 has no Gemini or Firebase code yet. Deploy it with only `--set-env-vars STORE=memory`, and add the rest from Phase 2 and Phase 3 onward.
- `--min-instances 1` keeps the link warm for judges (no cold start).
- After the deploy, open `https://<service-url>/healthz` and expect `{"ok":true}`.

Check logs when something fails:

```bash
gcloud run services logs read beyond-the-resume --region asia-south1 --limit 50
```

## 5. Environment variables

Validated at start-up by `server/env.ts` (zod). The server refuses to start if a required variable is missing, and the log line names it.

| Variable | Required | Example | Used by |
|---|---|---|---|
| `PORT` | set by Cloud Run | `8080` | `server/index.ts` (default 3000) |
| `NODE_ENV` | set in Dockerfile | `production` | static serving vs Vite middleware |
| `GEMINI_API_KEY` | from Phase 2 | (secret) | `server/services/gemini.ts` |
| `GEMINI_MODEL` | no | `gemini-3.8-flash` (default) | `server/services/gemini.ts` |
| `STORE` | no | `firestore` (default in production) or `memory` | `server/index.ts` |
| `FIREBASE_PROJECT_ID` | from Phase 3 | `btr-hackathon` | Admin SDK init, `/api/config` |
| `FIREBASE_WEB_API_KEY` | from Phase 3 | `AIza...` | `/api/config` |
| `FIREBASE_AUTH_DOMAIN` | from Phase 3 | `btr-hackathon.firebaseapp.com` | `/api/config` |
| `FIREBASE_APP_ID` | from Phase 3 | `1:123:web:abc` | `/api/config` |

`.env.example` (replace the AI Studio placeholder file with this):

```
# Copy to .env for local development. Never commit .env.
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
STORE=memory
FIREBASE_PROJECT_ID=
FIREBASE_WEB_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_APP_ID=
```

Local development: `npm run dev` loads `.env` with `dotenv` (already a dependency). With `STORE=memory` nothing needs Google credentials except Gemini. To use Firestore locally, run `gcloud auth application-default login` and set `STORE=firestore`.

## 6. Dockerfile (written in Phase 0)

```dockerfile
FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
USER node
EXPOSE 8080
CMD ["node", "dist-server/index.js"]
```

`.dockerignore`:

```
node_modules
dist
dist-server
coverage
.git
.env
.env.*
!.env.example
docs
tests
```

## 7. Pre-submission check (every submission)

1. `npm run verify` green on the commit being submitted.
2. Deployed; `/healthz` ok.
3. On a phone, in an incognito window, on mobile data: open the URL, complete one task end to end (brief, answer, follow-up, report).
4. Open the public passport link on a second device; it loads without signing in.
5. The repository is public, `main` is pushed, and the deployed revision matches the commit.
