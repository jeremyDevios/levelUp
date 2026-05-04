# Firestore Schema — levelUp

This document describes the Firestore collections and document shapes used for user sessions and tracked weights.

## Collections

- users/{uid}/sessions/{sessionId}
  - Stores exercise session data per user.

Fields:
- machineId: string
- sets: array of objects { reps: number, weightKg: number, note?: string }
- restSeconds: number
- createdAt: timestamp
- updatedAt: timestamp

Example document (JSON):

{
  "machineId": "leg-press-01",
  "sets": [
    { "reps": 8, "weightKg": 120 },
    { "reps": 6, "weightKg": 140, "note": "failed last rep" }
  ],
  "restSeconds": 90,
  "createdAt": "2024-05-01T14:32:00Z",
  "updatedAt": "2024-05-01T14:45:00Z"
}

Notes:
- Use server timestamps for createdAt/updatedAt (FieldValue.serverTimestamp()).
- Keep the sets array bounded in size where possible (e.g., limit to typical max sets) to avoid large documents.

- users/{uid}/weights/{weightId}
  - Stores one-off or tracked weights (e.g., body weight entries or recorded measurements).

Fields:
- weightKg: number
- note?: string
- createdAt: timestamp

Example document (JSON):

{
  "weightKg": 82.3,
  "note": "morning measurement",
  "createdAt": "2024-05-01T07:15:00Z"
}

Recommended indexes

- Query by machineId and createdAt (collectionGroup query across sessions):
  - collection: sessions (collectionGroup)
  - fields: machineId ASC, createdAt DESC
  - reason: frequently query sessions for a given machine sorted by createdAt (e.g., show recent sessions for a machine across a user or for analytics).

- Query recent weights for a user:
  - single-field index on users/*/weights.createdAt DESC (default single-field indexes are usually sufficient)

Index notes:
- If you query sessions only within a single user's subcollection (users/{uid}/sessions), Firestore's automatic single-field indexes may be enough. For queries across many users (collectionGroup: sessions) or composite queries (machineId + createdAt), create explicit composite indexes.
- Keep indexes minimal and add only as required by actual queries to limit index storage and write costs.

Security considerations

- Sensitive user data is stored under users/{uid} subcollections. Enforce strict security rules so users can only access their own documents.
- Do not store long-form PHI/PII unencrypted in documents; if required, use encryption before writing to Firestore.
