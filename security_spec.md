# Security Specification - Yachay & Raíces Cloud Sync

## 1. Data Invariants
1. Every document under `/users/{userId}` and its subcollections (`private/{docId}`, `certificates/{certId}`) belongs strictly to the authenticated owner (`request.auth.uid == userId`).
2. PII fields (`email`, `username`, detailed progress) live inside `/users/{userId}/private/{docId}` and are readable/writable only by the verified owner.
3. No client may create or mutate another user's profile, cloud state, or certificates, nor inject arbitrary shadow fields (`hasOnly(...)` + `hasAll(...)` enforced).
4. Document IDs are bounded (`<= 128` chars) and alphanumeric/dash/underscore (`^[a-zA-Z0-9_\\-]+$`).
5. Timestamps (`createdAt`, `updatedAt`) are strictly validated against `request.time`.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated read on `/users/uid1/private/cloudState` -> `PERMISSION_DENIED`.
2. Cross-user read on `/users/uid2` while signed in as `uid1` -> `PERMISSION_DENIED`.
3. Cross-user write with `uid: 'uid2'` under `/users/uid1` -> `PERMISSION_DENIED`.
4. Unverified email write (`email_verified == false`) -> `PERMISSION_DENIED`.
5. Shadow field injection (`{ ...validUser, isAdmin: true }`) -> `PERMISSION_DENIED`.
6. Client-forged timestamp (`createdAt: new Date(0)`) -> `PERMISSION_DENIED`.
7. Oversized `displayName` (`> 100` chars) -> `PERMISSION_DENIED`.
8. Oversized document ID (`> 128` chars or invalid chars `$`) -> `PERMISSION_DENIED`.
9. Modifying immutable `uid` or `createdAt` during update -> `PERMISSION_DENIED`.
10. Unbounded array (`completedLessonIds` with > 200 items) -> `PERMISSION_DENIED`.
11. Certificate creation without parent `/users/{userId}` existing -> `PERMISSION_DENIED`.
12. Collection list scraping across `/users` by non-owner -> `PERMISSION_DENIED`.
