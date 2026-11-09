# Permanent Learner ID and Academic-Year Promotion
Branch: feature/learner-id-academic-year-promotion
Base: feature/learning-passport-platform-foundation
Release status: development only; not yet tested in a local browser, migrated against real records or deployed.

## Delivered
- Migration 011_learner_passport_year_history adds stable learner_passports, learner_academic_years, learner_guardian_links, learner_student_accounts, learner_promotion_events, and a private event audit.
- Existing students.id is NEVER changed; historic attendance, assignments, homework and other foreign keys remain valid.
- Migrated class/year snapshots are pending_review until a real administrator verifies school records. Guardian relationships are legacy_unverified; school-year approval is NOT guardianship approval.
- New admin and parent student registration calls create a permanent passport transactionally.
- Authenticated GET /api/v1/passport/me and GET /api/v1/passport/students/:studentId return only authorised current learner/year records.
- Admin endpoints review learner roster, verify a year, promote to the next grade, and explicitly link one student account to one enrolled student.
- Promoting from Grade 4 in school year 2026-27 to Grade 5 in 2027-28 closes the old school year, opens the new one, updates legacy students.grade and completes old batch enrolments. It does not delete attendance, homework or prior records.
- Retry-safe promotion uses one idempotency key per intended promotion. Reusing a key with conflicting destination fails.
- Student Learn Hub and Parent Family Hub each gain a read-only Learning Passport view.
- Admin Console adds Passport Records with explicit verification and promotion controls, next to the founder-only Vision prototype.
- Student session lookup is now based on an explicit account-to-student link instead of a static fallback student ID or name match.
- Google sign-in with unverified JWT payload has been disabled pending a properly configured and independently tested provider verification integration. Email/password remains.
- NODE_ENV=test now directs SQLite to a separate ignored test database, and migration backups use the selected DB path.

## API and allowed roles
GET /api/v1/passport/me — linked parent or linked student.
GET /api/v1/passport/students/:studentId — admin, linked guardian or explicitly linked student.
GET /api/v1/passport/admin/roster — admin only.
POST /api/v1/passport/admin/students/:studentId/verify — admin only; requires confirmed, grade, board, yearKey.
POST /api/v1/passport/admin/students/:studentId/promote — admin only; requires confirmed, fromYearId, nextYearKey and idempotencyKey.
POST /api/v1/passport/admin/students/:studentId/link-student-account — admin only; requires confirmed and studentUserId.

## Safe integration steps in Antigravity
1. Check git status and protect any uncommitted source and database work.
2. Back up the original SQLite database safely (including WAL content). Never commit copies or upload real child data.
3. Fetch and compare this branch to local code. Merge selectively, not by force-reset.
4. Test schema migration 011 against an isolated disposable database first.
5. Run npm ci; npm run build; npm test. Report real errors and pass counts, not guesses.
6. Specifically run the isolated in-memory promotion suite in server/tests/passport_promotion.test.js.
7. Check private API ownership restrictions using server/tests/passport_access_control.test.js.
8. Confirm Class 4 -> 5 keeps the permanent learner number and original student ID.
9. Confirm the previous school year is COMPLETED, current year ACTIVE and old attendance/homework records remain intact.
10. Confirm retrying the SAME idempotency key does not advance to Grade 6.
11. Confirm only administrators can verify or promote, and unlinked learners cannot view another profile.
12. Reassign new grade batches manually after promoting; old batch memberships become completed.
13. Verify parent and student Passport timelines, cross-child switching, responsive UI, attendance, lessons, homework, diagnostics and the existing admissions workflow.
14. Do not merge, reset, deploy, publish or activate payments without founder approval.

## Release blockers and honest limitations
- Historical year, grade and guardian relationships migrated from older data need verification, not automatic trust.
- Default credentials/PIN seeding, OTP flows, consent claims, access-control coverage across all other endpoints, current frontend token storage and CORS need a separate P0 security audit.
- Google sign-in is unavailable until issuer, audience, signature, expiry and verified email are handled by a real verified OAuth library.
- Parent self-registration currently contains older consent logic requiring privacy and security review.
- Passport year promotion supports only sequential next-grade moves for CBSE and Karnataka State. Grade repeats, skipped grades, Class 10 graduation, correction of historical errors and new-board transfers need separate audited workflows.
- The private document vault for mark cards and upload pipeline are NOT yet implemented.
- The new product still has no live subscriptions. Founder must confirm whether private ₹599 pricing means a one-time payment, monthly, annual or other billing term.
- No guaranteed Class 10 percentage may be advertised.
- Build, test, browser QA and deployment have not been performed by this code-only GitHub session.

## Next milestone
Complete release-blocking security checks, verified guardian onboarding and account linking, then build one full Class 4 CBSE Mathematics teacher-reviewed chapter with concept explanations, authentic question checks, diagnostic/remedial flows and parent reporting.
