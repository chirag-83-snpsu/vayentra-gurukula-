# VAYENTRA LEARNING COMPASS — Diagnostic Learning Product & Antigravity Implementation Brief
Version: Pilot 0.1 (teacher-guided, not autonomous)
Branch: feature/learning-compass-diagnostics
Status: CODE DRAFT — NOT production-ready or independently tested

## Programme proposition
**Diagnose the concept, not the child. Teach the missing step, not the whole chapter again.**
A tuition-centre-first diagnostic practice system designed to support 1–10 CBSE, Karnataka State Board and ICSE, with English-only web UI and human-supervised teaching.
Tamil Nadu's November 2026 rollout is a reference for *operating model*, not a claimed partnership, endorsement, licensed replication, or evidence of outcomes.

## Pilot boundaries
Class 7 CBSE Mathematics, four concepts and eight multiple-choice items:
- Integer ordering/subtracting negatives
- Signed multiplication and division
- Brackets/order of operations
- Equation formation

The item set is seeded in DRAFT state, invisible to students until teacher confirmation. Before publishing, an educator must vet content against the current school curriculum, validate distractors, reading level, and answer key. This is a programming prototype and cannot establish diagnostic reliability with 2 items per concept.

## Pedagogy architecture
1. **Placement**: verify class, board, subject, batch and guardian consent.
2. **Baseline**: 8–15 minutes for Class 7 pilot; no public rankings.
3. **Response analysis**: each incorrect option maps to a tentative misconception code. Report *signals*, never diagnoses of intelligence or ability.
4. **Human review**: teacher examines responses, knows what lesson the child recently attended and decides root cause.
5. **Intervention**: one concrete explanation, 1 real-world or hands-on activity, 5 targeted practice questions, and a due date.
6. **Recheck**: later parallel/alternate questions, not the identical item bank; expand after psychometric review.
7. **Guardian report**: simple strengths, focus areas, teacher instructions and reassessment; no peer scores.

## Age bands
- Classes 1–3: teacher-administered oral/pictorial tasks, reading fluency, numeracy, no unsupervised written online test.
- Classes 4–5: short concept checks with diagrams and feedback.
- Classes 6–8: scenario-based diagnostics 15–25 minutes, 8–15 items per domain.
- Classes 9–10: CBSE/State/ICSE curriculum-mapped diagnostic strands, prerequisite algebra, physical science, text evidence, applied problem solving; 20–30 minutes.
Initial UI is English-only; English-medium support must not be falsely interpreted as comprehensive vernacular accessibility.

## Science & English future taxonomy
Science: observation vs inference, experimental variables, units, diagrams, graph interpretation, causal reasoning, chapter-specific facts.
English: comprehension, inference, evidence selection, grammar in context, vocabulary, structured expression. Written responses require human marking.
Mathematics: number sense, arithmetic fluency, sign errors, equation formation, geometric visualization, units and word problems.

## Integration points (Yashdev baseline)
Frontend: src/views/TeacherView.tsx, StudentView.tsx, ParentView.tsx
New components: src/components/LearningCompass.tsx, ParentLearningCompass.tsx
Backend: server/routes/diagnostics.js mounted at /api/v1/diagnostics
DB: server/db/migrations.js migration 006; existing student/batch/RBAC
Tests: server/tests/learning_compass.test.js

## Pilot API
- GET /api/v1/diagnostics/forms (authenticated, role filtered)
- GET /api/v1/diagnostics/forms/:formId (student cannot see answers)
- POST /api/v1/diagnostics/forms/:formId/publish (assigned teacher/admin, explicit review)
- POST /api/v1/diagnostics/forms/:formId/submit (enrolled student, one attempt)
- GET /api/v1/diagnostics/attempts/:attemptId (student/guardian/assigned teacher/admin)
- GET /api/v1/diagnostics/student/:studentId/attempts (authorized guardian or student)
- GET /api/v1/diagnostics/forms/:formId/attempts (assigned teacher/admin)
- POST /api/v1/diagnostics/attempts/:attemptId/approve-plan (assigned teacher/admin)

## Production blockers / required follow-up
- Independently run build, migrations and tests in isolated test DB; no browser or build execution was possible through the GitHub connector.
- Ensure secure authentication and correct student identity mapping. The Yashdev baseline has a student-ID fallback to a seeded profile; review/remove before production.
- Review OAuth/OTP flows in existing code; JWT payload parsing is not proof of signature verification.
- Fix role-based access ownership edge cases, and review CORS / security headers.
- Add student and guardian explicit consent status/withdrawal flows and data retention/deletion. Do not collect unnecessary PII.
- Support alternate item banks, second attempts, longitudinal data, psychometric calibration, accessibility, visual/diagram items, response timing only if pedagogically justified.
- Add institute admin authoring UI for 1–10, questions, rubric versions, approved item sets and audit trails.
- Add teacher moderation to edit/delete plans, individualized follow-up assignment, retest and interpretation.
- Add PDF parent summary, opt-in messaging only after verified delivery; avoid claims of WhatsApp delivery without provider receipts.
- Handle student selecting different child in parent dashboard and stale tokens; privacy tests across multiple guardians.
- Provide operational backup/restore, indexes, retention and secure deployment.

## Acceptance criteria / QA
P0:
- Unauthenticated: 401 all private endpoints.
- Parent cannot access unrelated child (403).
- Student cannot retrieve correct answers before submission/publishing.
- Teacher cannot see or alter unrelated batch.
- Draft cannot be submitted.
- Invalid/duplicate response IDs and duplicate attempts fail; no partial writes.
- Concurrent duplicate submission produces at most one attempt.
- Existing attendance/homework/parent data unchanged.
P1:
- Teacher sees correct answer/explanation, reviews before publication.
- Teacher approves a plan and corresponding student + parent see exactly that plan.
- On refresh/restart, stored attempt persists.
- Empty, loading, 403, API error states accurately shown.
- All screens remain English-only and mobile responsive.
P2:
- Accessibility audit, keyboard, contrast, focus, reduced motion.
- Recheck with alternate items and longitudinal progress tracking.

## Pilot success criteria (proposal, not measured results)
Run with consented 15–30 learners across one or two groups for 4–6 weeks.
Record baseline + teacher judgement, intervention assignment completion, parallel recheck scores,
student experience, teacher prep minutes, perceived clarity and guardian feedback.
Compare progress cautiously; avoid claims of causal learning gains without matched comparisons.
Goal: >=80% of students complete baseline and teacher gets an actionable intervention report within one session.
Publish real outcomes only after measurement, privacy review and methodology disclosure.

## Exact Antigravity instructions
1. Start with git status. Protect working data and uncommitted local files.
2. Inspect code diff between current local branch, yashdev, and feature/learning-compass-diagnostics.
3. Do not overwrite newer local implementation: selectively port the diagnostic module.
4. Create an isolated test DB, migrate and run npm test / npm run build.
5. Run real browser walkthroughs for student, teacher, parent and admin; include failures.
6. Resolve all P0 blockers and provide evidence, not assumed passing tests.
7. Expand content gradually by curriculum and subject with teacher approval, not autogenerated unsupervised scores.
8. Never push, merge, deploy or change production data without explicit approval.
