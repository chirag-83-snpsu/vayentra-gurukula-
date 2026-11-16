# Vayentra ONE — PHASE 1: Guardian Admission → Permanent Learner Identity → Learning Universe

Status: Source committed. Static JS source checks only; not locally built, deployed or tested with real child data.
Branch: feature/one-phase1-guardian-enrolment
Base: feature/one-phase0-secure-foundation

## Delivered
- Migration 012_one_guardian_admission_applications: private queue with guardian ownership, idempotency, reviews and optional linked student ID. Reuses canonical ONE migration 011; it does not introduce a conflicting identity system.
- Authenticated guardian application submission and list endpoints.
- Admin review, approve and reject endpoints. An approved application is fulfilled transactionally, creating the existing students-style canonical permanent ID, a nonguessable public enrollment number, one_memberships, one_consent_reviews, one_academic_years and a journey audit event.
- Membership identity is active, paid entitlement remains not_configured. No payment or invoice is created.
- Parent Family Portal: Enrol a learner and Learning Universe. New parents with no children land on the application form.
- Admin Console: ONE Enrolment Applications.
- Student Learn Hub: the default opening screen is My Learning Universe, driven by verified grade and board data. Existing legacy demo learning stays separate.
- Parent-only guardian-supervised learner home for linked and approved children.
- Retired the older direct /api/v1/auth/child/add endpoint with HTTP 410.
- Portal student view now checks authenticated student role.

## Lifecycle / pilot
1. Authenticated TEST parent opens Family Portal > Enrol a learner.
2. Submits fictional learner name, Class 4, CBSE, academic year 2026-27, and guardian acknowledgement. This remains a SUBMITTED request; no student account exists yet.
3. Authenticated TEST admin reviews independent guardian authority and consent evidence outside the app, chooses verification method, enters a non-sensitive internal case reference, and explicitly approves.
4. One database transaction creates ONE permanent student ID, one public learner number, one active academic-year record, one membership with no paid entitlement and a private review + audit.
5. The parent refreshes their Family Portal and opens Learning Universe for the approved child. Server decides grade, board, year and verified course availability. No student can choose a different identity or unlock draft lessons by changing UI parameters.
6. Later work must design guardian-controlled student account invitation/recovery. This phase intentionally does not issue default passwords or PINs.

## API contracts
Parent-only:
POST /api/v1/one-onboarding/guardian/applications
JSON example: {"childName":"Fictional Pilot Learner","grade":4,"board":"CBSE","academicYear":"2026-27","guardianAcknowledgement":true,"idempotencyKey":"onboarding-pilot-2026-001"}
GET /api/v1/one-onboarding/guardian/applications
GET /api/v1/one-onboarding/guardian/learners/:studentId/home

Admin-only:
GET /api/v1/one-onboarding/admin/applications?status=submitted
POST /api/v1/one-onboarding/admin/applications/:id/approve
JSON: {"confirmed":true,"verificationMethod":"verified_in_person","evidenceReference":"INTERNAL-CASE-1234"}
POST /api/v1/one-onboarding/admin/applications/:id/reject
JSON: {"confirmed":true,"reason":"Evidence could not be verified."}

Student-only:
GET /api/v1/one-onboarding/learner/me (server resolves own linked student ID)

All endpoints use bearer authentication. Approval attestation does not prove by itself that the off-platform verification process happened.

## Antigravity release checks
1. git status, protect local work, git fetch origin; DO NOT force-merge with the competing Learner Passport migration 011.
2. Back up SQLite using a consistent backup and validate an isolated restore. Rehearse migration 012 on disposable test database first.
3. Run npm ci, npm test, npm run build and targeted NODE_ENV=test node --test --test-concurrency=1 server/tests/one_onboarding_phase1.test.js.
4. With fictional test users, check guest and unlinked parent rejections; submit guardian application; verify no child is created preapproval; check idempotent retry; attempt unauthorised admin action (403).
5. Confirm staff approval without evidence (400), approved action (201), repeated approval (200), no second child record, one academic year, one consent review, one audit entry and entitlement not_configured.
6. Verify guardian sees approved learner and another guardian cannot read the child's record.
7. Check student /learner/me derives ID only from the server-validated account link.
8. Test newly approved child after a session refresh: Family Portal > Learning Universe. Only verified subjects and published concepts may appear; most catalogue shells are not yet verified.
9. Regress: existing attendance, homework, teacher review, Learning Compass, existing students, Vayentra ONE academic-year history, admissions enquiries, homepage and login.
10. Browser QA at 360/390/768/1024/1440 widths; keyboard and reduced-motion support; appropriate backend error states.
11. Do not use genuine child data until guardian-verification SOP, privacy notice, data retention and role permissions pass security/legal review.
12. No deployment or payment activation without founder signoff and evidence.

## Known limitations
- Public self-service creation and verified contact setup for brand-new guardians is not completed; guardian must already have a properly provisioned parent account.
- Student account invite, age-appropriate sign-in and recovery are intentionally not completed; newly approved children are accessible through the guardian-supervised view.
- Phase 0 production launch block remains. Legacy demo credentials/PINs, browser token storage, other API scopes and consent privacy procedures need remediation.
- Manual staff attestation is not automatic documentary verification.
- Private mark-card storage, content production, payments, refunds and recurring subscription policies are separate phases.
- No fabricated completed 1–10 course library, false results, or public ₹599 pricing.
- Source-level checks are not build/test/browser verification.

## Next milestone
Produce one complete, original, academically approved Class 4 CBSE Mathematics chapter with real prerequisite mapping, worked explanations, interactive practice, question bank, teacher sign-off and parent progress report. Only expand to more grades after the vertical slice meets the educational quality gate.
