# levelUp
A minimalist gym tracker to log repetitions, weights, and rest periods, designed to monitor your history and ensure consistent progressive overload.

Sprint 1 - setup

Commands

- npm install
- cp .env.example .env
- npm run dev
- npm run import-machines (downloads sample machines to data/machines.json and images to public/assets/machines/)

Example .env (use your Firebase project values)

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

Assets

- public/assets/prototypes/IMG_0785.PNG
- public/assets/prototypes/IMG_0786.PNG

## Sprint 2 — Dashboard (Coder tasks)

Run dev server:

  npm run dev

Optional: run Firestore emulator (if configured) to test writes locally.

To run unit tests for sessions:

  npm run test -- src/__tests__/sessions.save.test.ts

Testing saving a session locally:

- Sign in with Google in the app and open Dashboard
- Select a machine, edit sets, and click "Save Session"
- Verify a document appears under /users/{uid}/sessions in your Firestore (or emulator) with createdAt set by server


## Sprint 4 — Dashboard polish & QA

Additions in this branch/PR:

- Pre-fill session editor with last session per machine, global restSeconds and user weight.
- Edit and delete session support (SessionDetail shows Edit/Delete which call updateSession/deleteSession).
- MachineSelector now displays machine image when available; import-machines script optionally uploads images to Firebase Storage when UPLOAD_IMAGES=true and FIREBASE_STORAGE_BUCKET is configured.
- CSV export script to dump sessions for a user: scripts/export-sessions.js
- Client-side helper to download CSV for last N sessions: src/lib/export.ts
- Unit tests for sessions save/update/delete: src/__tests__/sessions.save.test.ts
- Playwright E2E skeleton under e2e/

How to validate locally

1) Install deps

  npm install

2) Run emulator / app

  # optional: start Firestore emulator
  firebase emulators:start --only firestore

  # start web app
  npm run dev

3) Import machines (optional)

  npm run import-machines -- --output=data/machines.json

  To enable upload to Firebase Storage during import (optional):

  UPLOAD_IMAGES=true FIREBASE_STORAGE_BUCKET=your-bucket GOOGLE_APPLICATION_CREDENTIALS=/path/to/creds.json node scripts/import-machines.js --output=data/machines.json

  If uploads are not configured the script will download images to public/assets/machines/ and set local paths in data/machines.json.

4) Export CSV (server-side)

  # Install firebase-admin if not present
  npm install firebase-admin --save-dev
  # If using emulator, ensure FIRESTORE_EMULATOR_HOST is set in your shell
  node scripts/export-sessions.js --uid=USER_ID --out=./out.csv --limit=200

5) Export CSV (client-side)

  From the running app, use the helper src/lib/export.ts (example usage in Dashboard could be added) to download last N sessions as CSV.

6) Run unit tests

  npm run test

7) E2E skeleton

  The e2e/ folder contains Playwright config and a skeleton test. To run Playwright tests locally:

  npm i -D @playwright/test
  npx playwright test --project=chromium

Environment variables

- Required: VITE_FIREBASE_*, see top of README
- Optional: UPLOAD_IMAGES=true to attempt uploads in import-machines.js
- Optional (server scripts): GOOGLE_APPLICATION_CREDENTIALS for firebase-admin or when uploading images

Branch & commits

Work was committed on branch: sprint4/dashboard-polish

