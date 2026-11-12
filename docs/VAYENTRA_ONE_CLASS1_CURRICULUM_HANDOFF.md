# Vayentra ONE — Class 1 Curriculum + AI & Money Skills / Engineering Handoff

Branch: feature/one-grade1-curriculum-ai-money
Base: feature/one-phase2-class4-maths-concept-studio
New migration: 014_one_class1_curriculum_ai_money
Release state: DEVELOPMENT. Source JS syntax checked only; npm build, runtime DB and browser tests not executed here. Existing Step 3 QA changes may still be LOCAL in Antigravity. Preserve them when integrating.

## Sources and academic distinction
- CBSE Class 1 English — Mridang, 9 original NCERT CHAPTER TITLES from NCERT CIET https://www.ciet.ncert.gov.in/audio-book/115.
- CBSE Class 1 Hindi — Sarangi, 19 NCERT chapter titles from https://www.ciet.ncert.gov.in/audio-book/117.
- CBSE Class 1 Mathematics — Joyful Mathematics, 13 NCERT chapter titles from https://www.ciet.ncert.gov.in/audio-book/118.
- Karnataka State Class 1 — Kannada, English, Maths and EVS mapped as school subjects. Karnataka school edition, language order and Nali Kali differences require independent teacher validation before chapter-title publication; do NOT invent the chapter list.
- Additional Vayentra Original Enrichment (not NCERT/KTBS mandated): AI & Digital Thinking (8 lessons) and Money & Life Skills (8 lessons), duplicated in separate board-specific learning maps.
- CBSE's CT & AI curriculum for 2026–27 explicitly addresses Grades 3–8, so original Class 1 AI is unplugged preparation: patterns, sorting, stepwise instructions, finding errors, tool awareness, fairness and online privacy.
- Money lessons for Class 1 are pretend-play counting, needs/wants, saving, sharing and very simple spending choices; never investment, debt, real transactions or child financial stress.

## Content counts: expected after migration 014 on a CLEAN TEST database
- 41 CBSE school textbook chapter TITLE rows: 9 English + 19 Hindi + 13 Maths.
- Four Karnataka school subjects with zero *invented* official chapter titles; each has one Vayentra ORIGINAL starter-activity chapter, clearly separated from official textbooks.
- Two original enrichment subjects per board, each with 8 lesson-topic chapters.
- 39 original foundation teaching units as DRAFT: 19 CBSE and 20 Karnataka.
- 71 original private formative question records: 32 enrichment lessons x 2 questions plus 7 subject starter lessons x 1 question.
- No auto-verified curriculum, no published lessons, no payment entitlement, no direct child chatbot.
- These chapter title maps are not a claim of full curriculum completion; most school subject chapters do not yet have original teaching lessons.

## Code introduced
- server/data/grade1Curriculum.js: source-backed subject and chapter titles; 16 original age-appropriate AI & Money lessons; 7 original school subject starters.
- server/db/migrations.js: migration 014 creates foundation lessons, private answers, practice attempts, reviewer and publication ledger, private pilot grants; adds mapped official chapter titles and draft original units.
- server/routes/grade1Curriculum.js: board/grade/guardian-authorised curriculum, unit and practice APIs; staff academic preview, request review, independent approval, controlled publication, withdrawal, and admin 90-day non-paying pilot access.
- src/components/OneGrade1Explorer.tsx and src/styles/one-grade1.css: mobile-first school subject cards, chapter status, short story-led activities, adult-supported formative checks, replay-aware progress.
- src/components/OneGrade1Editorial.tsx: CBSE/Karnataka reviewer view and teacher/admin approval workflow.
- src/components/OneLearnerLaunchpad.tsx, src/views/AdminView.tsx, src/views/TeacherView.tsx and src/views/ReviewerView.tsx: integrated Class 1 learning and editorial navigation.
- server/tests/grade1_curriculum_phase1.test.js: automatic source count, draft isolation, anti-IDOR, verified course publishing, reviewer role, limited pilot access, answer-key privacy, scored practice and safe withdrawal.
- docs/VAYENTRA_ONE_CLASS1_TO_10_AI_FINANCE_ROADMAP.md: proposed Grade 1–10 original AI/finance progression.

## Private endpoints
GET /api/v1/grade1/me/catalogue | GET /me/units/:unitId | POST /me/attempts — verified linked student.
GET /api/v1/grade1/guardian/:studentId/catalogue | GET /guardian/:studentId/units/:unitId | POST /guardian/:studentId/attempts — owning guardian.
GET /api/v1/grade1/editor/map?board=CBSE or STATE — teacher/reviewer/admin only; contains private keys for content review.
POST /api/v1/grade1/editor/units/:unitId/request-review — teacher/admin.
POST /api/v1/grade1/editor/units/:unitId/review — reviewer only.
POST /api/v1/grade1/editor/units/:unitId/publish — admin only after verified track, subject, chapter, content rights and independent reviewer approval.
POST /api/v1/grade1/editor/units/:unitId/withdraw — admin only; retains attempts.
POST /api/v1/grade1/admin/pilot-grants — admin; valid verified Class 1 learner, maximum 90 days, NO paid entitlement change.

## Antigravity exact integration instructions
1. Inspect git status, local branch, recent commits, and any UNPUSHED Step 3 QA fixes. Protect those changes. Fetch this remote branch and compare; do not run hard reset or blindly merge.
2. STOP backend DB writers; back up SQLite using a consistent backup and prove restoration to a disposable test database. Verify the migration ledger, and STOP on competing migration 011.
3. Apply migration 014 to the isolated test DB only. Confirm counts above, foreign keys, unchanged real student IDs, no auto-published lessons or invented school chapters.
4. Run npm ci; npm test; npm run build. Run NODE_ENV=test node --test --test-concurrency=1 server/tests/grade1_curriculum_phase1.test.js. Record actual logs.
5. Use fictional Class 1 CBSE and Karnataka learners via Step 2 reviewed admission; verify board-specific school subject lists and original AI/Money offerings.
6. Confirm draft lessons remain inaccessible even if an administrator grants non-paying pilot access. Test anonymous, unrelated guardian, student, teacher, reviewer and admin access restrictions.
7. As a teacher submit an actual original lesson; a qualified reviewer validates the exact book edition and language, all answers and explanations; admin confirms track, subject, chapter, original-rights record and publishes one unit.
8. With fictional owning parent and approved temporary grant, open Learning Universe → Class 1 Subjects · AI · Money Skills. Open the published unit; confirm story, activity, question options but NO pre-submission answer indexes. Submit answers, verify score and explanation, idempotency and progress after refresh.
9. Withdraw the unit and check it disappears from learner view, while the historic attempt row remains.
10. Run keyboard, 200% zoom, screen reader, Hindi/Kannada font and mobile checks at 360/390/768/1024/1440 widths. Ensure no text or diagram overflow.
11. Regress the complete Step 3 Class 4 Concept Studio test suite, admissions, academic-year tracking, homework, attendance, Learning Compass and parent privacy.
12. Report actual test screenshots, academic verification status, remaining security risks and a GO/NO-GO. Do not deploy, push unapproved user local changes, merge into main, activate payments or use real children for testing.

## Known limitations
- Only Class 1 is built at this stage. There are NOT full course videos or complete all-subject lessons.
- State textbook chapter numbers/titles require verified editions and teachers; original Vayentra activities do not replace official chapters.
- The first 16 enrichment modules and seven school subject starters require actual academic review and original media before students can use them.
- Class 1 lesson audio, narration, subtitles, animated explanations and teacher intervention are later production work.
- Production remains blocked by Phase 0 security review. Guardian verification, age-appropriate login, staff scope and child data privacy remain unresolved.
- The existing 266-test Step 3 report was supplied by the user, but its local fixes were not necessarily pushed to the GitHub branch from which this Class 1 feature originated.
- Do not claim Grade 1 complete until every adopted textbook edition's chapter has verified Vayentra explanatory content; then begin Grade 2 using the reusable data model.


## Important update: Chapter 1 Maths expansion (migration 015)
On the descendant branch feature/one-grade1-maths-ch1-playlab, the Class 1 Mathematics chapter 1 implementation adds 9 original picture-led micro-lessons and 36 private question records. The combined DB count now becomes 48 original Class 1 units (28 CBSE + 20 Karnataka) and 107 private practice questions, NOT the earlier 39/71 baseline above. The new source of truth for this expansion, testing, and original story content is docs/VAYENTRA_ONE_CLASS1_MATHS_CH1_PLAYLAB_HANDOFF.md. Always check which branch/migrations are present before asserting counts. No lessons are automatically published.
