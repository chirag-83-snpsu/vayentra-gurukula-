# Vayentra ONE — Class 1 Mathematics, Chapter 1: Original Picture PlayLab
**Curriculum mapping:** NCERT Class 1 Joyful Mathematics, Chapter 1 "Finding the Furry Cat!" (Pre-number Concepts)
**Academic year:** 2026–27 reference, subject to teacher checking the current printed NCERT edition
**Independent current syllabus source:** Directorate of Education 2026–27, Class 1 Maths, chapter 1 (spatial relations, sorting, matching and grouping)
https://edustud.nic.in/edu/Syllabus_2026_27/1/1_math_english_2026_27.pdf
**Official NCERT chapter index:** https://ciet.ncert.gov.in/audio-book/118
**Vayentra original materials:** "Milo's Discovery Day", original lesson scripts, concept examples, practice, picture scenes, guided actions and optional device text-to-speech. Do not copy NCERT book pages, images, songs, exercises or accompanying audio.

## Learning goals (what a child can SHOW, not merely memorise)
1. Place a safe object ON a sturdy surface or UNDER it, then say what changed.
2. Move an item INSIDE or OUTSIDE a container and explain the position.
3. Use ABOVE and BELOW relative to a reference point, without unsafe climbing.
4. Use NEAR and FAR, explicitly naming what the object is near/far FROM.
5. Distinguish BESIDE, IN FRONT OF and BEHIND using a stated viewing direction.
6. Identify TOP and BOTTOM of a drawing, page or object.
7. Order simple BEFORE and AFTER events without imposing a single "correct" family routine.
8. Explain what matches by COLOUR, SHAPE or SIZE.
9. Change the SORTING rule and show that groups can change.

## Nine original short guided lessons
| # | Concept | Explorer picture | Evidence question count | Family activity |
|---|---|---|---|---|
| 1 | On or Under? | Milo with a table | 4 | Soft toy on/under table |
| 2 | Inside or Outside? | Milo with a basket | 4 | Paper ball in/out of box |
| 3 | Above or Below? | Paper kite and tree | 4 | Find two objects at different heights |
| 4 | Near or Far? | Milo and bench | 4 | Explain near/far relative to chair |
| 5 | Beside, In Front, Behind | Milo and bench | 4 | Soft toy at three safe chair positions |
| 6 | Top or Bottom? | Paper star and shelf | 4 | Draw at top/bottom of a page |
| 7 | Before or After? | Three original morning pictures | 4 | Draw three routine pictures in order |
| 8 | Find a Matching Friend | Coloured circles and squares | 4 | Match pairs by explicit rule |
| 9 | Sort It Again! | Four coloured size/shape objects | 4 | Sort paper shapes by different attributes |

Earlier Class 1 "Where Is the Little Puppy?" original school starter is preserved as chapter position 1; these nine new concepts become positions 2–10. The name of the official textbook chapter is the mapping only, not a claim the original Vayentra story comes from the textbook.

## Teacher facilitation for each 6–10 minute micro-lesson
1. WELCOME — Ask a short oral question based on a familiar object; avoid lecture or screen-only instruction.
2. EXPLORE — Invite the child to tap a position/rule button in the SVG, then name the resulting relationship.
3. SAY IT — Child describes a picture with a complete simple sentence; adult reads labels if necessary.
4. ACT IT — Child repeats the spatial relation with a soft toy, paper drawing or classroom materials.
5. CHECK — Child answers up to four original practice questions with calm, specific feedback.
6. EXTEND — Ask an unseen "what if" and invite the child to draw or explain.
7. REVIEW — Teacher records if the child needs another oral explanation. A perfect MCQ result is formative evidence, not a verified mastery certificate.

## Source accuracy and inclusive delivery
- Above vs on: ABOVE does NOT necessarily mean TOUCHING.
- Top/bottom: use a page or diagram; never encourage climbing furniture.
- Behind/in front: must be explained relative to viewpoint.
- Near/far: requires reference point; statements change with position.
- Match/sort: several valid groupings may exist depending on the explicit rule.
- Before/after: daily routines may vary across households; avoid moralising preferences.
- The illustrative shape explorer has minimal contrast-friendly text and keyboard-accessible tap buttons; no item is draggable-only.
- A parent can use OS/browser-generated optional read-aloud on supported devices. This is not a professionally narrated educational video and may vary by locale, voice availability and device. No voice recording/upload is implemented.
- Each family activity can be completed WITHOUT a screen after the initial prompt.
- Adult supervision for young children: avoid small choking hazards, sharp objects, climbing or outdoor unsupervised location games.
- Assess via listening and demonstration as well as written multiple-choice choices. Do not make children read long paragraphs independently.
- Use character illustrations which are Vayentra-original; no NCERT artwork or text is bundled.
- Review spelling, phonics, sentence length, visuals, syllabic accessibility, right answers and age suitability.

## Technical implementation
Branch: feature/one-grade1-maths-ch1-playlab
Base: feature/one-grade1-curriculum-ai-money
New files:
- server/data/grade1MathsChapter1.js: original nine concept stories, steps, scene metadata, 36 questions and rationales.
- src/components/OneGrade1MathsScene.tsx: original React/SVG picture explorer, tap controls, matching cards, sequence picture strip.
- src/styles/one-grade1-maths.css: mobile and keyboard accessible styling.
- server/tests/grade1_maths_ch1_playlab.test.js: migration and guarded content end-to-end tests.
Existing files extended:
- server/db/migrations.js: migration 015 with table one_foundation_picture_scenes and 9 draft concept/unit rows linked to existing chapter 1; exactly 36 new private questions.
- server/routes/grade1Curriculum.js: protected student/family lesson response includes original pictureScene, guidedSteps and guardianGuide only after academic publication. Pre-answer correct indices/rationales stay server-only.
- src/components/OneGrade1Explorer.tsx: interactive scene, guided steps, parent notes and optional device read-aloud in existing Class1 portal.
- server/tests/grade1_curriculum_phase1.test.js: expected database counts updated.

## Database counts after migration 015 on an isolated clean test DB
Migration 014 baseline: 39 original Grade1 units, 71 questions.
Migration 015 adds 9 Math ch1 units, 36 questions.
TOTAL: 48 Class1 draft units and 107 question records (28 CBSE units + 20 Karnataka units).
Chapter 1 Class1 CBSE Maths: 10 original units (prior starter + 9 new), with their own review statuses.
Migrations have NO PUBLISHED status on first run and grant NO entitlement.

## Security / publication
- Protected learner catalogue: verified Class1 ownership and current board/grade; no cross-student ID guessing.
- Draft lesson returns 404 after temporary pilot grant, not the text or private question keys.
- Teacher submits for review, independent academic reviewer validates, admin publishes only after source track/subject/chapter, rights and age-appropriateness are verified.
- Guardian-supervised learner requires matching guardian + reviewed consent record. Temporary academic pilot access is separate from paid subscription.
- Attempts are stored append-only, with idempotency; no client-controlled scores; no automatic teacher-confirmed mastery.
- Withdrawn lessons vanish but historic attempts remain.
- Never use real child records or production migrations in test runs.

## Antigravity QA handoff
1. Protect local Step3 QA fixes and original Class1 branch edits. Do not hard-reset or overwrite local work. Fetch this feature branch and compare before integration.
2. Stop DB writers and use a consistent SQLite backup. Restore to an isolated test path. Check ledger migration 011 canonical + 012,013,014 BEFORE migration 015. Do NOT merge competing migration 011.
3. Run migration 015; assert 9 draft scenes, 36 private questions and 48 Grade1 draft units; also confirm original Class4 concepts are unchanged.
4. Run:
   npm ci
   npm test
   npm run build
   NODE_ENV=test node --test --test-concurrency=1 server/tests/grade1_maths_ch1_playlab.test.js
5. Test with fictional Class1 CBSE enrolment. Guardian preview should show official chapter outline but no unapproved lesson. Grant pilot; draft still returns 404.
6. Using real qualified teachers on fictional test records, verify chapter source/edition, all nine story concepts and all 36 answer keys; submit review, approve and publish ONE unit in test.
7. Open Parent Family Portal → Learning Universe → Class 1 Subjects → Mathematics → Finding the Furry Cat! → a published concept; test each tap position and confirm the picture actually changes. Check screen-reader descriptions and keyboard toggles.
8. Click Read Aloud on supported browsers; test start/stop and unsupported browser fallback. Stop audio when navigating away. The device voice is not a recorded video.
9. Complete concept check; verify private answers, save, idempotency on retry, last attempt in parent view, other learner forbidden and class4 learner forbidden.
10. Withdraw and ensure unit is hidden while assessment history is retained. Test low-end mobile widths 360,390,768,1024,1440; 200% zoom, reduced-motion, Hindi/Kannada core typefaces unaffected.
11. Regress all Step3 266 tests (as reported), Class1 AI/Money draft gates, other Class1 subjects, student/paper/parent dashboards and attendance.
12. Record full logs and screenshots. NO PRODUCTION DEPLOY OR CONTENT PUBLICATION WITHOUT FOUNDER APPROVAL.

## Next grade-by-grade authoring milestone
Do Class 1 Joyful Mathematics Chapter 2 (shapes, roll and slide), then Chapters 3 through 13; simultaneously commission school-language English/Hindi and verified Karnataka textbooks. After teacher-approved first-grade scope is complete, create Grade2 based on the same reusable foundation-unit model. AI and Money Skills remain original Vayentra tracks throughout Classes 1–10.
