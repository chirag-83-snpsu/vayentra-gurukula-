# LEARNING PASSPORT — ENGINEERING DELIVERY ROADMAP & C1–C5 QA RELEASE GATES
Status: Plan, not evidence of complete implementation.

## Development strategy
Do NOT attempt to generate and deploy 10 grades × 2 boards × all subjects × all chapters in one autonomous code run. First deliver one secure, reproducible academic-year and concept vertical slice, validate with real staff and selected families, then expand through a measured content coverage tracker.

First sequence:
A. Identity hardening & DB migration safety.
B. Permanent Learner ID + guardian-linked one-time enrolment.
C. Class/year versioned passport, grade promotion, parent-only vault.
D. Authoritative grade/board content CMS, source and publisher rights.
E. One complete original chapter with micro-lessons & assessments, then expand.
F. Safe membership billing only after pricing period, refund, tax and service terms are approved.
G. Family analytics, teacher workflows, monitoring and multi-city scaling.

## C1 Test generation sources
Black box: founder's core story (enrol once, class transition, authorised guardian, full concept coverage, grade history, no public price).
White box: existing React AppContext, Express auth middleware, SQLite migrations, current NCERT library and assessment state.
Error guessing: duplicate requests, network retries, forged student IDs, forged Google JWTs, expired tokens, late payment webhooks, corrupted uploads, historical year mismatch and wrong board.
Model-based: enrollment → approval → active learner → academic-year promotion → Class 10 completion → archive/export.
Missing or incomplete: verified real parent/teacher UAT, provider payment sandbox events, data-protection counsel, production-grade threat model and current textbook edition audits.

## C2 Testing levels and examples
UNIT:
- Grade 4 CBSE enrollment draft accepted; grade 11 rejected.
- Grade 4 → 5 allowed, grade 4 → 6 requires separate approval, grade repeat requires staff review.
- Unverified school mark cards never produce a verified percentage.
- Private price plan without a billing interval is rejected.
INTEGRATION:
- Guardian auth → linked learner query only; querying a different learner returns 403.
- Admission approval → unique learner identity; duplicate POST idempotency yields same learner, not a second one.
- Promotion → previous enrolment retained, exactly one new year created, atomic rollback on failure.
- File vault → signed upload → scan → private download → consent review → deletion.
- Payment → server-created order → verified webhook → entitlement; duplicate event harmless.
SYSTEM:
- Full Class 4 enrollment to Class 5 promotion with retention of old work, documents, and data export.
- Grade 5 topic opens only approved media; new topic assessment writes reliable evidence.
- Parent dashboard displays only linked child, accurate attendance and reviewed marks.
REGRESSION:
- Existing admissions inbox, attendance, assignments, parent portal, Learning Compass, Class 10 six video drafts, no Abacus, no Kannada interface controls.
UAT:
- Class 4 student + parent, Class 10 exam learner + parent, teacher, admin and privacy-support role; low-data mobile phones and unstable networks.

## C3 Nonfunctional requirements
Security: no public child data, no hardcoded passwords, signed Google JWT verified by issuer/audience/signature, signed provider webhooks, rate limits, encrypted private documents, RBAC/ABAC and audit logs.
Robustness: stale browser state and offline reconnection do not duplicate attendance, promotions, payments or homework submissions.
Performance: target first-use homepage responsiveness, navigable low-end Android experience and lesson payload size budgets; set realistic thresholds with baseline measurements rather than inventing pass results.
Accessibility: responsive 360–1440+, keyboard-only journeys, labels, image descriptions, captions, 200% zoom, contrast, reduced-motion.
Load & stress: run repeatable benchmark with staged learner profiles under 100/500/1000 concurrent virtual sessions; assess P95, DB locks, queue retry, scaling and recovery. Do NOT claim capacity before measuring.
Safety: no age-based persuasive manipulation, no targeted advertising profiling of minors, optional breaks, parent oversight and original/licensed curriculum.

## C4 Artifacts under test
- UI: homepage, guardian admission, login, Learn Hub, Passport, documents, teacher and family dashboards.
- API: auth, owner checks, enrolment, promotion, concepts, attempts, payment, webhooks.
- DB: guardian links, versions, unique index, append-only academic records, file metadata, entitlement ledger.
- Infrastructure: CI, environment secrets, CDN, object storage, database backups, queue, WAF, logs, monitoring.
- Content: per-grade syllabus mapping, accuracy review, copyright provenance, rubric correctness, videos/subtitles/contrast.
- Privacy: notices, withdrawal, retention, deletion, incident escalation, access logging.

## C5 Process and release closure
1. Requirements acceptance: signed founder decisions and teaching/syllabus scope.
2. Test specification: per-feature traceability entries, negative cases, PII access tests and expected result fixtures.
3. Automation: unit/integration in CI, API contracts, seeded isolated DB, E2E with Playwright, accessibility scanning, secrets check and dependency audit.
4. Execution: every PR must include actual test log, changed-file review and migration rollback plan.
5. Defect logging: severity S0/S1 blocks release; reproduce steps, owner, screenshot/video and linked requirement.
6. Closure: explicit teacher signoff, child-data security audit, 0 open S0/S1, reconciled payments, document permissions, acceptable measured performance, verified backup restore and founder UAT approval.

## Release criteria per phase
P0 Security: verified tokens and guardian ownership; 0 anonymous access to private student API; no default seed credentials in production; test DB isolated.
P1 Identity: one canonical child ID, unique guardian link and 100% access-control negative cases pass.
P2 Progression: promotion/repeat/transfer audited and idempotent; previous year unmodified.
P3 Content: verified class-board-year textbook mapping; published content all teacher reviewed, 0 known factual errors in sampled release suite; no unauthorized textbook copying.
P4 Learning: end-to-end concept flow has original instruction, media, practice, feedback, teacher intervention and reliable mastery evidence.
P5 Billing: signed terms, sandbox payment pass, callback replay and failure recovery, reconciliation and refund tests, no public ₹599 advertisement.
P6 Production: user consent and notices, secure deletion/export, backup restore, operational dashboards, pilot UAT and measured load capacity.

## First recommended vertical slice
Class 4 CBSE Mathematics, one CURRENT teacher-verified chapter (chosen only after checking edition).
- Guardian creates one learner ID.
- Teacher uploads approved 4–8 original micro-concept lessons based on ACTUAL chapter structure.
- Each lesson includes concept objective, 3 checked questions and documented misconception support.
- Weekly assessment + teacher commentary + parent view.
- Grade 4 academic-year record remains when staff approves a Class 5 promotion to an empty draft workspace.
- One private mark-card upload and export.
This showcases the entire differentiated platform safely before making impossible full-curriculum promises.

## Content production KPI
Maintain an editorial spreadsheet/table with board, grade, academic year, textbook edition, subject, chapter, concept count, original assets status, academic reviewer, rights review, accessibility/caption status, published status, version change and latest audit date. Show *coverage* separately from *planned coverage*.

## Current branch content checklist
- Master architecture doc: yes.
- Domain policy module and tests: yes; execution still required.
- Founder-only high-fidelity Learner Passport UI preview: yes; browser build still required.
- Actual long-lived learner identity migrations/API: NOT YET BUILT.
- School mark card upload storage: NOT YET BUILT.
- Commercial checkout or recurring mandates: intentionally NOT BUILT until billing terms specified.
- 1–10 complete approved curricular lessons: NOT YET BUILT.
- Full deployment/test evidence: NOT YET AVAILABLE.

## Concrete prompt for Antigravity
"Integrate origin/feature/learning-passport-platform-foundation after checking git status, local branches and working tree. Preserve all uncommitted work and existing attendance, lessons, admissions and student records. Review the new internal Admin Console Learning Passport Vision. Run existing and new domain policy unit tests, npm run build, npm test and mobile browser smoke tests. Do not change authentication, payment or production DB automatically. Next propose and implement P0 security fixes as a separate PR with negative authorization tests. Then implement P1 guardian/learner identity in an isolated test DB with an additive versioned migration, one-time enrolment, unique ID and student self-profile authorization. Do not use real child data, imply all curricula are published, or start charging. Report tested results, any failed security requirements and migration plans. Do not reset, merge or deploy without explicit approval."
