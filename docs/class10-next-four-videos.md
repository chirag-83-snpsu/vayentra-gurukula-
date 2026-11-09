# Vayentra Gurukula — Class 10 Next Four Original Lesson Videos

**Branch:** `feature/class10-next-four-video-lessons`

**Status:** Original MP4 narration preview files completed and delivered as downloadable chat artifacts. GitHub includes topic and assessment **draft records only**. Do not claim any of the four videos are published, hosted or teacher-approved.

## Added learning videos

| Grade | Subject | Topic ID | Downloaded teacher review video | Approx. length |
|---|---|---|---|---|
| 10 | Mathematics | `vg-cbse10-maths-arithmetic-progressions` | `maths_arithmetic_progressions_TEACHER_REVIEW.mp4` | 2:40 |
| 10 | Mathematics | `vg-cbse10-maths-trigonometric-ratios` | `maths_trigonometry_ratios_TEACHER_REVIEW.mp4` | 2:29 |
| 10 | Science | `vg-cbse10-science-ohms-law` | `science_ohms_law_TEACHER_REVIEW.mp4` | 2:36 |
| 10 | Science | `vg-cbse10-science-photosynthesis` | `science_photosynthesis_TEACHER_REVIEW.mp4` | 2:45 |

Each file contains eight professionally styled, original illustrated text slides, computer-generated English voice narration, an original worked example and misconception warning. Separate .srt files and transcripts are included in the downloadable video pack.

**Quality disclosure:** These are branded instructional **slide-video previews**, not motion-rich generative AI films. Ask the academic faculty to validate and improve graphics, narration and timing before student release.

## Technical implementation

- `server/data/class10NextLessonBatch.js` contains four original storyboards, topic IDs and 12 low-stakes practice items.
- `server/db/migrations.js` migration 009 creates **draft** topics, draft quizzes and teacher-review video script outlines; it does not publish or modify existing student data.
- `server/tests/class10_next_four_lessons.test.js` adds checks for 4 topics, 12 answers and unpublished content privacy.
- `server/routes/cbseLibrary.js` now checks that local file assets exist on disk and have nonzero content before marking local videos ready.
- Existing `CbseVideoStudio` in the Admin/Teacher portals already lists these entries after the migration and allows staff to submit approved video URLs and durations.
- Student/public catalogue remains limited to faculty-approved **published** lessons. Video quiz is revealed only with a published and playable video.

## Apply to current Antigravity project

1. **Preserve local work.** Run `git status`, back up the SQLite DB, and `git fetch origin`.
2. Compare the current branch to `origin/feature/class10-next-four-video-lessons`. Integrate selectively rather than force checkout, reset or merge over uncommitted work.
3. Prepare an isolated test SQLite DB and apply migration 009. Inspect the four draft rows in the Admin CBSE Video Studio, Class 10 Mathematics/Science.
4. Download the **Vayentra_Class10_More_Lesson_Videos_Pack.zip** artifact from this conversation and extract it outside the repository.
5. For local playback testing, place reviewed MP4s in `public/media/lessons/` with the following target names:
   - `vg-cbse10-maths-arithmetic-progressions.mp4`
   - `vg-cbse10-maths-trigonometric-ratios.mp4`
   - `vg-cbse10-science-ohms-law.mp4`
   - `vg-cbse10-science-photosynthesis.mp4`
6. **Review all academic content** against the 2026–27 official CBSE curriculum and the age-appropriate current NCERT textbooks as source references. No NCERT text or figures are reproduced.
7. Review captions, calculations, drawings, sound, and 12 answer keys. Correct mistakes and re-render as needed. Do not treat the current synthetic voice track as polished production audio.
8. Use Admin/Teacher Video Studio to publish only approved media. Enter the corresponding local path `/media/lessons/<filename>.mp4` and confirmed duration in seconds after actually checking playback.
9. Run `npm test`, `npm run build`, browser test desktop/mobile, and verify attendance, Learning Compass, homework, parent and security workflows still work.
10. Never commit private student records, database binaries or arbitrary copyrighted NCERT pages to the repository.

## Release checklist

- [ ] Two Mathematics lessons academically reviewed and approved
- [ ] Two Science lessons academically reviewed and approved
- [ ] All 12 quiz keys and explanations independently reviewed
- [ ] Video and SRT checked from start to finish and corrected
- [ ] Original content / source usage permissions cleared
- [ ] Local MP4 URLs respond successfully and play in Safari/Chrome
- [ ] Migration 009 passes isolated test database
- [ ] No draft exposed through public API before publication
- [ ] Full build, automated tests and responsive browser tests passed
- [ ] Guardian/student access and session ownership verified
- [ ] Teacher signs off the final release

## Content expansion priorities after review

- Mathematics: Pair of Linear Equations; Polynomials and Zeroes; Areas Related to Circles; Coordinate Geometry
- Science: Light: Reflection & Refraction; Acids, Bases & Salts; Human Eye; Carbon Compounds

Use the same format for each next batch: 8 original scenes → age-appropriate narration → teacher review → 3 misconception-tagged questions → controlled release → measured learning improvement.

**External curriculum source:** https://cbseacademic.nic.in/curriculum_2027.html

**NCERT publisher portal:** https://ncert.nic.in/textbook.php

No affiliation or endorsement by CBSE or NCERT is implied. The videos are Vayentra-created original instructional material.
