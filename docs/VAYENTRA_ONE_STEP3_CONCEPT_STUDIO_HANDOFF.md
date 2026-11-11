# Vayentra ONE — Step 3: Class 4 CBSE Mathematics Concept Studio

**Branch:** feature/one-phase2-class4-maths-concept-studio
**Base:** feature/one-phase1-guardian-enrolment
**Status:** Development implementation on GitHub. Original content is DRAFT and must not be auto-published. Full build, migrations and API/browser tests not yet run in Antigravity.

## Current chapter / verified source target
Board: CBSE | Class: 4 | Mathematics | NCERT Maths Mela (first edition 2025) | 2026–27 curriculum track | Chapter 1: Shapes Around Us.
Official NCERT textbook index: https://ncert.nic.in/textbook.php?cemm1=ps-14
The textbook itself is NOT copied or bundled. Vayentra originals were drafted to support the chapter's geometry concepts. A qualified teacher must validate every objective and check the current edition before final publication. The pilot chapter should not be represented as syllabus-complete until its official mapping checklist is signed.

## Delivered in branch
- Migration 013_one_concept_studio_shapes_pilot adds:
  one_studio_units (draft → teacher_review → reviewed → published), questions with answer keys on server,
  practice attempts, time-limited pilot grants, independent review decisions, publication/withdrawal audit events.
- Original writing: six micro-lessons and 24 original MCQs with rationales and misconception tags:
  1. Meet the shapes you can hold — solid shapes and real-world models.
  2. Faces, edges and corners — cube, cuboid and pyramid features.
  3. Prisms, pyramids and patterns — shape families, F+V−E exploration.
  4. From flat paper to a solid — nets, spatial folding and paper activities.
  5. Angles and strong triangles — acute, right, obtuse and rigidity.
  6. Inside a circle — centre, radius, diameter and 2r.
- Interactive lightweight original SVG diagrams; audio/video media are NOT yet recorded or hosted. A storyboarding and instructor checklist is provided separately.
- Student & guardian Concept Studio with visual intro, prior knowledge, explanation, worked example, misconception, offline activity, interactive four-choice formative checks and server-returned feedback.
- Learner progression uses one authenticated student identity, while parent-supported activity explicitly checks the guardian's relationship and verified enrolment; changing query parameters cannot select another learner.
- Every attempt is persisted with retry idempotency, server-side grading, 8/day per-unit practice guard and learner-specific progress summary. Practice evidence is NOT a school mark or a teacher-confirmed mastery certificate.
- Editor preview available for teacher/reviewer/admin, with private answer keys visible only to staff.
- Teacher/admin submit a draft to review. Independent role=reviewer signs off with review evidence. Role=admin publishes ONLY after textbook track verified, subject and chapter reviewed, independent reviewer approved and original-content rights attested. Withdrawals are audit-recorded.
- Admin-only 90-day maximum pilot grant for an active, consent-reviewed Class 4 CBSE child. This is NEVER treated as payment or paid subscription and changes NO fee record.
- Parent Family Portal → Learning Universe → Concept Studio; Student → My Learning Universe → Concept Studio; Staff → Concept Editorial.
- Existing Learning Compass, admissions, student accounts, parent dashboard, attendance, homework and Class 10 video drafts retained.

## API endpoints
All endpoints mounted at /api/v1/one-studio and require authentication.

Learner:
GET /me/course
GET /me/units/:unitId
POST /me/attempts

Guardian supervised:
GET /guardian/:studentId/course
GET /guardian/:studentId/units/:unitId
POST /guardian/:studentId/attempts
GET /guardian/:studentId/progress

Editorial:
GET /editor/preview — teacher, reviewer, admin; includes private answer keys for review.
POST /editor/units/:unitId/request-review — teacher/admin.
POST /editor/units/:unitId/review — reviewer only.
POST /editor/units/:unitId/publish — admin only, all reviewer/source/rights gates.
POST /editor/units/:unitId/unpublish — admin only, reason auditable.
POST /admin/pilot-grants — admin only; verified active Class 4 CBSE learner, expiry within 90 days.
GET /admin/students/:studentId/progress — admin only.

Learner response hides answer keys and rationales before submission; the grading endpoint reveals only the feedback after answers have been saved.
No public learning price is set, and no payment or subscription checkout is implemented.

## Testing instructions in Antigravity
1. `git status --short`; protect local work. Fetch branch, inspect current migration ledger, and back up the existing SQLite with an SQLite-consistent backup.
2. STOP if the competing migration 011 schema is present; reconcile instead of force-merging.
3. On an isolated test DB, rehearse migration 013, verify exactly six draft lessons and 24 new questions. All statuses must be DRAFT.
4. Run `npm ci`, `npm test`, `npm run build`. Capture real logs.
5. Run the targeted Phase 2 test: `NODE_ENV=test node --test --test-concurrency=1 server/tests/one_studio_phase2.test.js`.
6. Test with fictional TEST guardian and admin: approve Class 4 CBSE enrolment (Step 2); verify lesson access is 403 before pilot grant and publication.
7. As teacher request review; as reviewer review original content against NCERT; as admin first verify current Class4 track, Mathematics subject, and Chapter1 in ONE Curriculum Studio. Only then publish approved unit. Do not simulate this with real data until teacher validates it.
8. Grant limited test pilot access to a fictitious learner; no payment or subscription entitlement should be enabled.
9. Confirm the private learner course shows ONLY published units. Draft questions, answer indexes and explanations must not leak before an attempt.
10. Submit four choices; verify exact server score, stored result, post-submission rationale and progress. Repeat the same idempotency key: only one attempt. Changed answers with the same key must be rejected.
11. Verify a guardian can view only their own learner, a student cannot forge another ID, guests receive 401, and teachers/reviewers cannot approve payments or issue pilot grants.
12. Unpublish a unit. It should immediately vanish from student view while prior learning evidence remains recorded for internal support.
13. Check mobile widths 360,390,768,1024,1440, keyboard focus, screen-reader SVG descriptions, no horizontal scroll and network error states.
14. Regress admission, attendance, homework, Learning Compass, Vayentra ONE promotions and Class10 lesson library.
15. Do not deploy, overwrite production data, activate payments or claim full chapter syllabus coverage without founder + academic + security approval.

## Academic publication checklist (teacher must inspect)
- Confirm title, chapter number and edition against NCERT Class 4 2026–27; reconcile changes for schools on other editions.
- Review shape definitions, face/edge/vertex counts, prisms, pyramids, nets, angle figures, triangle stability and circle radius/diameter.
- Check every drawing as well as text; an inaccurate diagram fails the whole unit.
- Solve all 24 questions independently. Ensure each has one unambiguously correct choice, appropriate explanations and clear language.
- For young learners, test each visual on a low-end Android phone and read all text aloud. Check activity safety with parents.
- Confirm no copied textbook diagrams, chapter passages or third-party images have been embedded.
- Reviewer signs each unit. Admin records rights and verifies textbook track, subject and chapter separately.
- If a unit is inaccurate, return it for revision; do not bypass review or silently publish.

## Outstanding items
- Actual MP4 videos, human narration, captions and playback integration: NOT BUILT in Step 3.
- Independent secure child account provisioning: prior-step blocker; guardian-supervised view supported.
- Teacher assignment-scoped learner reports, teacher feedback comments and parent digest: follow-up work.
- Cross-device login/session protection, legacy demo credentials, child consent policy, data deletion/retention, DB replication and production deployment remain blocked pending audit.
- Content beyond six concept lesson drafts is not present or verified; do not market the full Class1–10 curriculum as complete.
- As with prior branches, we have GitHub source checks but not true build/browser test results.

## Next milestone (Step 4)
Teacher review and publication of the six pilot lessons, original video production, real teacher intervention on formative results, parent progress report and first 10 family UAT. No expansion into all subjects until one complete chapter gets academic and user acceptance.
