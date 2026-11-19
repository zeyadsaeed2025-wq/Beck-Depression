# Firestore Security Specification

## 1. Data Invariants
1. **Default Deny**: No collection outside explicitly matched paths can be read or written.
2. **Examinee PII & Report Isolation**: Unauthenticated examinees can NEVER `get`, `list`, `update`, or `delete` documents in `/examinees` or `/sessions`. Knowing or guessing another examinee's code cannot expose any past record or report.
3. **Zero-PII Code Registry**: `/codeRegistry/{code}` stores only `{ code, createdAt }` with `allow list: if false` so duplicate codes are prevented without exposing examinee identities or scraping codes.
4. **Immutable BDI Protection**: `/customTests/bdi-1971-ar` is permanently blocked from creation, modification, or deletion in Firestore rules. The official BDI-IA items, options, scores, instructions, and norms remain immutable in code.
5. **Doctor Verification**: Doctor dashboard access requires Firebase Auth (`request.auth != null && request.auth.token.email_verified == true`), matching the project's Google Sign-In decision.
6. **Immutable Audit Trail**: `/auditLogs/{logId}` supports `create` and `read` only for verified doctors, and permanently denies `update` and `delete`.
7. **Temporal Integrity**: All `createdAt` and `updatedAt` timestamps must strictly equal `request.time`.

## 2. Dirty Dozen Payloads (Expected: PERMISSION_DENIED)
1. Unauthenticated `get` on `/examinees/MNU-1001` -> DENIED.
2. Unauthenticated `list` on `/sessions` -> DENIED.
3. Unauthenticated `list` on `/codeRegistry` (attempting to scrape all codes) -> DENIED.
4. Unauthenticated `create` on `/examinees/MNU-1001` with extra shadow field `{ isAdmin: true }` -> DENIED.
5. Unauthenticated `create` on `/sessions/sess_1` with fake `createdAt` in the past -> DENIED.
6. Unauthenticated `create` on `/sessions/sess_1` with `status: "reviewed"` -> DENIED.
7. Unauthenticated `update` on `/sessions/sess_1` -> DENIED.
8. Unauthenticated `delete` on `/sessions/sess_1` -> DENIED.
9. Unauthenticated `get` on draft `/customTests/draft_test_1` -> DENIED.
10. Authenticated doctor attempting to write or delete `/customTests/bdi-1971-ar` -> DENIED.
11. Authenticated doctor attempting to update `/auditLogs/log_1` -> DENIED.
12. Unverified-email token attempting to read `/sessions` or create `/customTests/test_1` -> DENIED.
