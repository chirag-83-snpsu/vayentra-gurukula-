# ADR 001 — One canonical Vayentra learner identity and migration history
Status: ADOPTED FOR DEVELOPMENT, subject to isolated migration rehearsal and founder approval.
Base branch: feature/vayentra-one-longitudinal-foundation
Safety branch: feature/one-phase0-secure-foundation

## Decision
Vayentra ONE is the canonical academic-history implementation for the next engineering milestones. Keep the existing stable students.id as the internal learner identity. The public-facing Learner Number should be a distinct, unique, immutable and non-guessable display value, which must be validated before it is exposed. Reuse one_student_account_links for explicit user-to-student association; one_memberships for learner participation; one_academic_years for grade history; one_mark_entries for academic results. Preserve relationships to legacy homework and attendance.

Membership identity and paid entitlement MUST remain separate. Do not expose the founder's private ₹599 price in a public repo or marketing pages. No checkout is activated until its billing term, taxes, refunds and entitlements are approved.

## Why
Two diverged implementations currently exist:
- feature/learner-id-academic-year-promotion introduced 011_learner_passport_year_history with learner_passports, learner_academic_years, learner_student_accounts.
- feature/vayentra-one-longitudinal-foundation introduced 011_vayentra_one_longitudinal_spine with one_memberships, one_academic_years, one_student_account_links, one_mark_entries and one_* curriculum tables.

Applying them together would create two sources of truth. Similar capabilities must be ported deliberately, not merged at the migration number. This safety branch now blocks ONE startup migrations if the competing 011 identifier is present.

## Safe reconciliation procedure
1. Inspect the local working tree and original SQLite migration ledger before switching branches.
2. Create an offline backup using the SQLite backup API; test restoring the backup.
3. Inspect table names, migration markers and real student IDs on a DISPOSABLE copy of the DB; never migrate the original first.
4. If the original already has 011_learner_passport_year_history, STOP. Write a forward-only migration adapter mapping learner_passports.student_id → one_memberships.student_id, matching guardian links and year histories, with a human-reviewed record-level reconciliation report. Do not delete or silently overwrite either ledger until reconciled.
5. If the original already has 011_vayentra_one_longitudinal_spine, retain that schema as canonical; do not apply the competing passport migration.
6. If neither 011 is present, apply the ONE implementation to an isolated copy; validate foreign keys, counts, attendance, homework, marks, guardian links, membership and year records.
7. Only after reconciliation tests pass may legacy Passport components be adapted to the ONE APIs and the obsolete model retired.
8. Never remove any historical academic record automatically.

## Identity guarantees
- One internal learner identity across grades; never infer it from name, browser-selected class, a guessed student ID or token payload.
- Guardian-to-child access must be server-authorised, revocable and purpose-specific. School-year verification does not prove guardian identity.
- Academic-year updates use atomic, validated state transitions and idempotency protections; repeat, school transfer and Class 10 completion require their own review workflows.
- No child data in public URLs, JSON logs, static hosting or demonstration screenshots.
- Audit all write actions and export/private document access.

## Consequences
Vayentra ONE curriculum CMS and academic-year tools can be developed against one schema. Tests from the other branch may be ported as independent test cases; its migration 011 and Passport tables are NOT copied. The next task after Phase 0 is an actual end-to-end guardian onboarding and learner identity API with verified admin approval.
