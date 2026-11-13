# Vayentra ONE — Antigravity Integration & Production Safety Runbook

**Source branch:** \`origin/feature/vayentra-one-longitudinal-foundation\`
**Base branch:** \`feature/premium-homepage-v3-learning-admissions\`
**Current delivery:** An initial foundation, NOT a paid nationwide launch.

## Integrate safely
1. In Antigravity terminal, save the output of \`git status --short\` and \`git branch --show-current\`. Never overwrite uncommitted work.
2. \`git fetch origin\`
3. Review \`git log --oneline HEAD..origin/feature/vayentra-one-longitudinal-foundation\` and \`git diff --stat HEAD...origin/feature/vayentra-one-longitudinal-foundation\`.
4. Branch off your current local working state after protecting changes. Integrate new files and migrations selectively. The \`server/db/vayentra.sqlite\` binary is tracked in the original repository; **DO NOT stage, merge or push this file** with any student data.
5. Stop backend services and make a real SQLite backup using \`sqlite3 server/db/vayentra.sqlite ".backup 'vayentra-pre-one-backup.sqlite'"\` in a private, ignored location, then restart. Test the backup opens and has the expected student counts. Avoid an unsafe raw copy while WAL is active.
6. Run \`npm ci\`.
7. Run \`npm test\`; the branch's \`NODE_ENV=test\` database defaults to isolated \`:memory:\`. Do not override \`VAYENTRA_DB_PATH\` with your live database during tests.
8. Run \`npm run build\` and fix TypeScript, Vite and CSS issues.
9. Use \`npm run dev:backend\` then \`npm run dev:frontend\` in separate terminals.
10. Check /, /login, /admissions, /app and all existing dashboards.
11. Apply migration 011 to a **copy** of the actual data before considering the live local application.
12. Present actual test logs, screenshots and defects. Do not merge/push/deploy without founder approval.

## New features in this branch
- Premium homepage: Vayentra ONE identity journey section, without public fee details.
- Parent Family Hub: **My Vayentra Journey** tab, Classes 1–10 timeline, report-score journal, pending secure vault.
- Admin Console: **Vayentra ONE** tab for permanent identity, reviewed guardian consent, year progression.
- Admin Console: **ONE Curriculum Studio** for board/class/edition, subject, chapter and original concept drafts, editorial review and controlled publication.
- New \`/api/v1/journey\` for academic history, catalogue and administrative transitions.
- New \`/api/v1/one-content\` for the content factory and privately entitled learning outline.
- Migration 011 creates the schema; creates 20 verified-*pending* curriculum shells, not fabricated lesson lists.
- New isolated automated tests for permissions, curriculum reviews and annual learner preservation.
- Future SQLite files and private uploads ignored via \`.gitignore\`; pre-existing committed SQLite binary still requires explicit remediation.

## Local demo scenario
1. Log in as a permitted admin in a local test environment (NEVER reuse seeded demo credentials in production).
2. Open Admin Console → Vayentra ONE; find the existing learner ID from Students Roster.
3. Create a pending member for 2026-27.
4. In a test environment, record a legitimately tested guardian review reference and notice version.
5. Activate the academic membership — payment entitlement remains \`not_configured\`; there is no charge.
6. Log in as the linked parent and open My Vayentra Journey; view the current year.
7. Add sample marks. Verify "Parent reported — unverified" label.
8. Admin promotes the student to next school year; check same student ID, historic mark entry and completed prior-year batches.
9. Test cross-account access denial and log errors.
10. Open ONE Curriculum Studio; select board/class. Draft a subject and chapter only if verified against the correct curriculum edition, and draft ORIGINAL learning content.

## Explicit P0 release blockers
- \`server/routes/auth.js\` still contains unverified Google credential decoding and legacy student-lookup assumptions. It MUST be hardened and reviewed; do not enable production login for real children until fixed.
- Demo/shared passwords, default PINs and pre-seeded demo consent flags remain in the inherited application. Remove before any real public rollout.
- Login/portal still has to complete student-to-account linking across all paths, not just the new protected journey APIs.
- Age-appropriate guardian identity, verifiable consent and consent withdrawal/review flow require legal and engineering sign-off.
- Existing \`cors({origin:'*'})\` must be replaced with correctly configured production allowed origins.
- Secure document uploads have NOT been built; no mark-card file should be uploaded or stored in GitHub, public folders or application source.
- Payment plan policy and private pricing are not approved. No checkout, refund, recurring collection, subscription renewal or entitlements are live.
- Curriculum tracks have no verified chapter mappings at launch and no automatic copied textbooks.
- Class 10 graduation requires authentic school/board result checks; no automatic certificate.
- Security review must include IDOR, role escalation, sensitive data logs, data backup/restore, DDoS/rate controls, CSRF and token sessions.

## Key tests
| Test | Expected |
|---|---|
| Guest views programme / ONE story | Accessible, no price or child data |
| Guest requests learner marks | 401 |
| Student/other parent requests another learner's timeline | 403 |
| Parent marks without verified active membership | Rejected |
| Admin enrols without valid academic year | 400 |
| Admin activates without reviewed guardian record | 403 |
| Admin promotes 2026-27 to 2028-29 | 409 |
| Admin promotes Class 7→8 | New active year, old completed, attendance unchanged |
| Parent uploads mark-card before vault | No supported API; interface clearly disabled |
| Admin publishes concept without editorial/rights review | Rejected |
| Grade 10 attempts another class promotion | Blocked for graduation review |
| Payment offer on homepage | Absent |
| Different board/edition | Different curriculum track; prior records retained |
| No Vayentra ONE enrolment yet | Parent sees a truthful pending state |

## Definition of done for foundation
- All existing and new tests PASS in isolated DB.
- Production build PASS.
- Responsive browser QA PASS for 360/390/768/1024/1440px.
- No change to actual student or fee data without reviewed migration.
- Security release blockers are tracked, not ignored.
- Academic content remains unpublished until educator-approved.
- Sign-off evidence includes code commit SHA, test logs, schema migration check and before/after screenshots.

## Rejected shortcuts
No default consent flags. No public textbook PDF hosting. No fabricated mark cards or board percentages. No full auto-publishing of AI lessons. No unencrypted "document vault" inside SQLite or \`public/\`. No promises of guaranteed SSLC/CBSE scores. No public advertising of founder's private draft price.

## Questions for the founder / product owner after technical review
1. Does "the founder's private proposed price" mean a one-time payment, monthly fee, annual membership or different policy? Keep the answer in a private commercial plan, not the public GitHub repository.
2. Are physical tutorials and national online subscription separate products?
3. Who are the two educator reviewers for CBSE and Karnataka State curricula?
4. What institution-approved method will verify parent/guardian identity and marksheets?
5. What retention/export experience should be offered after Class 10?
