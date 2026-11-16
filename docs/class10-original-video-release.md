# Class 10 CBSE Original Video Lessons — Vayentra Pilot

**Status:** Draft educational videos made; NOT teacher-approved, uploaded, or published.
**Branch:** `feature/class10-original-video-lessons`
**Based on:** `feature/cbse-ncert-ai-video-library`
**Academic context:** CBSE 2026–27 Class X and NCERT reference portal.

## Two new original lesson packs

| ID | Subject | Topic | Video duration | Publication |
|---|---|---|---|---|
| `vg-cbse10-maths-quadratic-factorisation` | Mathematics | Solving Quadratic Equations by Factorisation | 3 min 20 sec | Draft |
| `vg-cbse10-science-balancing-equations` | Science | Balancing Chemical Equations | 3 min 13 sec | Draft |

Each pack has 10 original scenes, a source-reference declaration, an educational objective, a teacher intervention recommendation, and 3 practice questions with feedback and misconception signals. The MP4 previews use **synthetic computer narration** and original designed slides, not cinematic generative video; narration and pacing should be refined by the academic team.

**The binary MP4 files are supplied as downloadable chat artifacts, not committed to GitHub.** Do not assume this branch contains published media.

## Implemented application changes
- `server/data/class10PilotLessons.js`: Original 10-scene source scripts, original questions, keys and descriptions.
- `server/db/migrations.js` migration 008: Seeds two draft lesson topics, unpublished original video scripts, and six question-bank records. Creates `cbse_topic_practice_items` table.
- `server/routes/cbseLibrary.js`: Student/public practice questions exposed only for genuinely published topics with ready video media; score and explanations returned after a complete submission. Teacher/admin answer-key preview is protected.
- `src/components/CbseLessonCheck.tsx`: Three-question concept check and explanation UI; no minor data stored in this first pilot.
- `src/components/CbseLessonQuestionReview.tsx`: Protected teacher review of the three answers and misconception signals.
- `src/components/CbseNcertLibrary.tsx`: Displays the quiz beneath an actually approved playable video only.
- `src/components/CbseVideoStudio.tsx`, `src/views/AdminView.tsx`: Admin and assigned teachers can inspect and approve original topic/video drafts.
- `server/tests/class10_original_lessons.test.js`: Tests for draft privacy, answer-key protection, correct grading and malformed submissions.

## Content validation and original visuals

**Mathematics:** Factor `x² − 5x + 6 = 0` into `(x − 2)(x − 3) = 0`, roots `2` and `3`. Group `2x² − 7x + 3` into `(2x − 1)(x − 3) = 0`, roots `½` and `3`.

Maths check answers:
1. `x² − 7x + 10 = 0` → `2` and `5`.
2. `x² + 3x + 2 = 0` → `−1` and `−2`.
3. `(2x − 1)(x − 3) = 0` → `½` and `3`.

**Science:** Balance water synthesis as `2H₂ + O₂ → 2H₂O`, and magnesium oxide as `2Mg + O₂ → 2MgO`. Emphasize that `2H₂O` is not `H₂O₂`.

Science check answers:
1. `2H₂ + O₂ → 2H₂O`.
2. `2Mg + O₂ → 2MgO`.
3. Altering `H₂O` to `H₂O₂` changes the substance.

No NCERT textbook prose, textbook diagrams, PDF pages or videos were copied into original lessons. NCERT/CBSE are external academic references; no endorsement is implied.

## Releasing after teacher approval

1. Run `git status` to protect local changes, `git fetch origin` and compare to `origin/feature/class10-original-video-lessons`.
2. Integrate selectively into the latest local app. Back up the current SQLite DB and apply migration 008 only against an isolated test database first.
3. Run `npm test` and `npm run build`. Test course and diagnostic regression workflows.
4. Have Class 10 Mathematics/Science teachers review content, visuals, equations, pronunciation, student suitability, captions and answer keys.
5. Replace robotic draft narration with a fluent teacher voice and refine animations where necessary. Verify rights to all assets.
6. Upload the final reviewed MP4 to an approved media host, for example to a dedicated `/media/lessons/` folder in the Vite `public/` directory for local preview, or an authorized HTTPS video CDN.
7. Confirm the file URL actually streams and plays across mobile and desktop before publication. In Teacher or Admin Video Studio, select Class 10, subject and lesson, inspect answers, and submit the approved URL and video duration.
8. The public page then displays the real video and the three-question practice. Verify quiz GET hides answers, POST grades correctly, and results are not falsely represented as saved academic progress.
9. Notify parents only after explicit approved launch and privacy checks.

Example local preview file names:
- `public/media/lessons/vg-cbse10-maths-quadratic-factorisation.mp4` — duration about 200 seconds.
- `public/media/lessons/vg-cbse10-science-balancing-equations.mp4` — duration about 193 seconds.

Avoid committing large media files or sensitive data unintentionally. Check your actual deployment/media host before switching to production.

## Class 7 Learning Compass concurrent pilot

The Class 7 Mathematics Learning Compass baseline remains on the branch unchanged. Keep it a teacher-approved, small-cohort pilot with a diagnostic baseline, misconception grouping, short intervention and parallel reassessment. No claims of measured improvement are supported yet.

## QA release gates
- Draft video and answer keys inaccessible to guest/student/parent.
- Original video content verified by qualified faculty, including accuracy and age-appropriateness.
- No copyrighted textbook media used without rights.
- Grade 10 published only after real video file playback confirmation.
- Three reviewed items per new Class 10 topic; quiz scored on backend after complete submission.
- Duplicate answer IDs and invalid choices rejected.
- Full authentication, registration, attendance, homework and guardian regression suite passes.
- Mobile, accessibility, keyboard and subtitle checks pass.
- No changes to existing student records or tracked SQLite binary.
- Do not assume successful tests or release until actually run in Antigravity.

## Authoritative sources
- CBSE official 2026–27 curriculum: https://cbseacademic.nic.in/curriculum_2027.html
- CBSE Class X 2026–27 sample papers: https://cbseacademic.nic.in/SQP_CLASSX_2026-27.html
- NCERT textbooks: https://ncert.nic.in/textbook.php
- CIET Grade 10 science activity reference: https://ciet.ncert.gov.in/activity/grade10
