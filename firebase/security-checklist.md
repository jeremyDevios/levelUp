# Firebase Security Checklist (Sprint 1) — Minimal, practical steps

This one-page checklist summarizes essential steps to secure Firestore & Storage for initial deployment.

1) Development & Testing
- Use Firebase emulators for local dev: `firebase emulators:start --only firestore,storage`.
  - Test rules with emulator and automated tests: `firebase emulators:exec "npm test"`.
- Do NOT use production credentials in dev. Use emulator or a dedicated low-privilege project.

2) Authentication & App Attestation
- Require authentication for writes to user data (rules enforced in firestore.rules & storage.rules).
- Enable Firebase App Check (reCAPTCHA v3 or Play Integrity) on clients to reduce scraping / abuse.
  - For server-to-server CI, use a service account (see CI section).

3) Firestore Rules & Access Patterns
- Principle: deny-by-default; allow only what is necessary.
- Use the provided minimal rules in firebase/firestore.rules:
  - /users/{uid} readable/writable only by request.auth.uid == uid
  - /users/{uid}/sessions/{sessionId} only owner can read/write
  - /machines is public read-only
- Example permitted write (client JS):

  const db = getFirestore(app);
  await setDoc(doc(db, 'users', uid, 'sessions', sessionId), {
    machineId: 'machine-123',
    startedAt: serverTimestamp()
  });

4) Storage Rules & Upload Constraints
- Use firebase/storage.rules: uploads allowed only when request.auth.uid matches target folder.
- Enforce contentType startsWith("image/") and size limit (e.g., 5 MiB) in rules to stop abusive uploads.
- Consider making reads public (CDN) or restrict with App Check / signed URLs if needed.

5) Rate-limiting, Abuse & Bots
- Firestore rules cannot perform rate-limiting. Mitigate abuse by:
  - Enabling App Check to block unauthorized clients.
  - Using Cloud Functions or a server-side proxy with per-user rate-limits.
  - Adding quotas on writes/creates in your application layer.

6) Images provenance & scraping risks
- If crawling images from a third-party site (e.g., interval.fr), verify licenses and permissions before storing/serving.
  - If images are not freely licensed, do NOT store or re-publish them. Use names, icons, or obtain written permission.
  - Store source URL and license metadata alongside any downloaded asset for audit.
- Remove/extract EXIF metadata on upload to avoid leaking user/device info.
- Scan uploaded images for malware (VirusTotal / Cloud Vision moderation / antivirus in Cloud Function)

7) Indexes (minimal recommended)
- Sessions are stored as subcollections under users. To query sessions across users by machineId and date, add a collection-group index:
  - collectionGroup: "sessions", fields: [ machineId ASC, startedAt DESC ]
- Optionally index machines by name or slug if you perform text queries.

8) CI / Deployment Access
- Do NOT use a personal long-lived token for CI. Prefer a minimal service account with limited roles (Firestore Viewer/Datastore User + Storage Object Admin as needed).
- If using firebase CLI token in CI (FIREBASE_TOKEN), create a CI-specific token and store it in secrets store (GitHub Actions Secrets / GitLab CI variables).
- Prefer workload identity / service account JSON with least privilege for GCP-native CI.

9) Monitoring & Post-deploy
- Enable logging / audit for Firestore and Storage access in GCP Console.
- Set alerts for sudden spikes in reads/writes or storage egress.
- Periodically review security rules and rotate keys / service account credentials.

10) Quick verification steps before production
- Run emulator-based rule tests covering allowed/denied paths (reads, writes, uploads >size limit, wrong user id).
- Verify App Check is enforced on production clients.
- Confirm indexes are created and queries perform as expected.

---
Minimal commit trailer to include in Git commit message:

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
