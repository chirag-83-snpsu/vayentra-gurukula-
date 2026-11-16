# PHASE 0 — Vayentra ONE Security Integration Handoff
Source branch: origin/feature/one-phase0-secure-foundation
Base: origin/feature/vayentra-one-longitudinal-foundation
Status: COMMITTED / UNTESTED IN ANTIGRAVITY / PRODUCTION INTENTIONALLY BLOCKED

## Changes in this milestone
1. Selected the Vayentra ONE identity ledger as development baseline, rather than a blind merge with the competing Learner Passport 011 migration.
2. Added a fail-closed check for existing 011_learner_passport_year_history when ONE migration 011 would run.
3. Removed email/password student-to-child fallback using stu-001 and inferred names. Student must be explicitly present in one_student_account_links.
4. An unlinked student's existing JWT cannot hydrate authorised child records in the session middleware.
5. Blocked the insecure Google credential route that previously accepted decoded but unverified JWT payloads.
6. Blocked pseudo-SMS OTP endpoints that never actually sent messages and used a reusable static code. Both require a real external provider implementation.
7. Disabled Google and Mobile OTP options in the authentication modal; email/password remains available in DEVELOPMENT.
8. Parent self-add cannot submit another guardianId for their own role; input grade/board validated.
9. New child profiles created through the legacy self-add route remain has_consent=0. No pretend DPDP consent records are inserted.
10. Production startup raises VAYENTRA_RELEASE_BLOCKED. This is deliberate: existing demo seeding and child-data handling require a production-specific cleanup and audit before the block may be removed.
11. Replaced permissive wildcard CORS with an explicit allowlist controlled by VAYENTRA_ALLOWED_ORIGINS.
12. Added phase0_identity_safety.test.js: invalid Google/OTP, explicit student link, denial to unlinked user, guardian spoof prevention, pending consent.
13. New product-wide build plan and canonical identity architecture decision.

## IMPORTANT remaining security deficiencies
These changes are necessary but NOT enough for a child-data platform.
- Existing migration 001 contains shared seeded password hashes and default PINs. Production release remains blocked until a dedicated clean bootstrap replaces demo account creation and existing credentials are rotated.
- Parent/child PINs and some profile fields can be returned through auth APIs and copied into localStorage. Replace this with server-only verification, minimised response DTOs and secure session storage after testing all dependent UI.
- Parent self-added child profile is pending and must not automatically become a verified membership. Build an actual evidence-driven guardian verification flow.
- Existing staff roles with broader child access than assigned batches need a complete RBAC/ABAC audit.
- Existing auto-created 20 board/grade catalogue rows are draft shells. No completeness claim.
- Rate limiting, password reset, staff MFA, secure cookie/CSRF strategy, audit log privacy, production secrets, upload safety and provider webhooks remain.
- Cross-branch migration 011 reconciliation needs evidence from the user's actual local database.
- All updated code is currently GitHub-only; no frontend build, Node tests or browser test results are available from this GitHub editing session.

## Antigravity implementation instructions
**NEVER modify real children or production database as a first test.**

A. Capture original working tree
   git status --short
   git branch --show-current
   git fetch origin
   git log --oneline --max-count=8
   git diff --stat HEAD...origin/feature/one-phase0-secure-foundation

B. Save all uncommitted local work safely; use a clean integration branch. Do NOT run git reset --hard.

C. Stop the local backend and take an SQLite-consistent backup of the working database using the SQLite backup API or sqlite3 .backup. Keep the backup in a private ignored location, then test restoring it. Inspect migration identifiers from a disposable copy:
   SELECT name FROM migrations WHERE name LIKE '011_%';

D. If the result contains 011_learner_passport_year_history, STOP the migration and produce a reconciled forward-only adapter plan. DO NOT apply one model over the other.
If it contains 011_vayentra_one_longitudinal_spine, keep the ONE model.
If neither, run ONE migrations only on a test copy first.

E. Run:
   npm ci
   npm test
   npm run build

F. Test browser routes at localhost:3000. Verify:
- public homepage and enrolment enquiry
- email/password login for student, parent, teacher, admin
- Google and OTP clearly disabled; no successful fake login
- student role cannot view unrelated child academic records
- parent role cannot view unrelated child records
- Admin Console -> Vayentra ONE, Curriculum Studio
- Student learning page, parent progress page
- attendance, homework, diagnostics and class 10 video draft records
- 360/390/768/1024/1440 responsive widths and keyboard navigation

G. Run negative security tests for forgeable IDs, old tokens, deleted links and unauthenticated routes.
H. Show exact test logs, actual screenshots, database counts, any migration conflict and risk register.

STOP after Phase 0 evidence and request founder review before integrating on live data, turning on any payment provider, or making a production deployment.

## Next code milestone after Phase 0 passes
Phase 1 — guardian-first onboarding and secure permanent learner identity. Design API to create a provisional student under verified guardian control; admin approves and activates academic-year record; no payment or mark-card collection yet. Build real first-use student dashboard using a verified grade and board instead of a client-supplied class selector.
