# Vayentra Gurukula CBSE: NCERT Reference & Original AI Video Lessons

## Release status — Nov 2026
Feature branch: feature/cbse-ncert-ai-video-library (based on feature/remove-abacus-module).
**Draft technical implementation, not independently build-tested or production-ready.**
The application now has class 1–10 core subject reference navigation (48 initial grade/subject entries), source metadata, a reviewed-topic database, a teacher video authoring studio, original-video asset publication gate, and student/public video library.
Four pilot topic drafts are present in Class 7 CBSE Mathematics. No video files have been generated or published.
Core subject lists are a navigation scaffold and must not be represented as the complete current NCERT textbook inventory.

## Legal and editorial boundaries
- NCERT owns its textbook pages, figures and source content. The official textbook portal says copies may not be republished or hosted in software and textbook links need written permission.
- Publisher metadata and official domains are provided as plain text only while linking rights are pending.
- Do not scrape official textbook PDFs, copy chapter images/diagrams, or use NCERT text verbatim in AI-generation input without rights.
- Create original pedagogical explanations, storyboard drawings, examples, narration, animations, practice items and captions.
- Vayentra cannot imply that NCERT endorsed, co-produced or certified any original AI video.
- Use external resource access to official NCERT/ePathshala/DIKSHA websites, subject to their terms and permissions.
- Store license/permission records, the approver and academic-year/version metadata before deep links are exposed.

## What has been implemented
1. server/data/cbseCatalog.js: 10 class categories and initial core subjects, with official source publisher/domain records.
2. server/db/migrations.js migration 007: cbse_subject_sources, cbse_topics, cbse_lesson_videos; all seeded as source permission pending; draft topic and video records.
3. server/routes/cbseLibrary.js: browse class/subject references and only published original videos, no answer keys or unverified content in the public API; authenticated teacher/admin topic authoring; original script review; video publish approval.
4. src/components/CbseNcertLibrary.tsx: class/subject/topic navigation, NCERT attribution, original MP4/WebM video player for published assets, truthful empty/loading/error states.
5. src/components/CbseVideoStudio.tsx: teacher topic creation, storyboard prompt copy, script review and approved-host video publishing.
6. src/views/PublicView.tsx and StudentView.tsx integrate learning library; TeacherView.tsx integrates authoring studio.
7. server/tests/cbse_ncert_library.test.js: source reference coverage and authorization tests.

## Production workflow for every topic
Phase 1: Curriculum reviewer consults the current official NCERT English textbook for that grade/subject/edition, records approved chapter/topic metadata, textbook title, year and page references WITHOUT copying book pages.
Phase 2: Subject teacher approves 3–8 learning objectives and misconception checks for one topic.
Phase 3: Produce ORIGINAL AI-assisted video brief (Vayentra word problems, animations, diagrams, teacher script), usually 3–6 minutes depending on class and topic.
Phase 4: Render via a connected video provider. Generate English voiceover, accurate captions, slides/animations and accessible text transcript.
Phase 5: Teacher reviews scientific/mathematical correctness and age suitability, checks that no book content was copied, and verifies timing and audio.
Phase 6: Host original MP4/WebM on an institute-controlled approved HTTPS host or a protected local /media/lessons path. Configure ALLOWED_LESSON_VIDEO_HOSTS (comma-separated).
Phase 7: Teacher publishes using the video studio. Non-existent or unreviewed video never displays a play button.
Phase 8: Link a short 3-question check, a practice worksheet and an optional teacher intervention to Learning Compass once those APIs are implemented.

## Original reusable AI video storyboard prompt
Create a 3-to-5-minute English educational animation for Vayentra Gurukula for CBSE Class {GRADE}, Subject {SUBJECT}, Chapter {CHAPTER}, Topic {TOPIC}.
Explain the central idea using only original text, diagrams and invented examples; do not include NCERT scans or reproduce copyrighted illustrations.
Scene 1 (0–20s): Child-friendly practical hook.
Scene 2 (20–65s): Concrete visual analogy.
Scene 3 (65–155s): Two fully worked examples with error checks.
Scene 4 (155–205s): Common misconception explained gently.
Scene 5 (205–260s): 2 independent practice challenges with answer reveals.
Produce voiceover script, scene descriptions, timing, subtitle transcript, pronunciation notes and a 3-question formative quiz. Cite NCERT as a separate reference to consult externally, never as source material reproduced.
Require teacher review of every script and final render before publication.

## Age-appropriate content design
- Classes 1–2: 2–3 minute visual counting, phonics, stories, concrete manipulatives and no rapid overstimulation.
- Classes 3–5: 3–4 minute diagrams, nature observations, language and number reasoning.
- Classes 6–8: 4–6 minute concept models, practice and misconception checks.
- Classes 9–10: 5–8 minute worked problem/experiment models and board-style application with correct science and maths notation.

## Important gaps and status
- Core CBSE class/subject reference scaffolds exist; complete textbook-grade-subject-chapter-topic mapping is **NOT YET COMPLETE**.
- NCERT permission for deep textbook links is **NOT CONFIRMED**.
- No actual AI videos have been generated, uploaded or linked. This must happen separately.
- Video file storage and provider API connection are not configured by this branch.
- Student watch-history, video transcripts, chapter-wise quizzes, analytics and adaptive recommendations are future work.
- Existing security concerns in authentication/user ownership must be addressed before production.

## Release/QA checklist
- On isolated test database, run migrations and confirm 10 grades and >=40 grade/subject source entries; no NCERT PDFs in repository.
- Verify unapproved subjects/topics never claim verified NCERT coverage; reject nonexistent class/subject.
- Verify unpublished video status has no playback URL.
- Verify teacher can author only for assigned grade and subject; parent/student/guest cannot author.
- Verify only approved HTTPS hosts and exact media formats are accepted.
- Verify video publish requires original script, teacher review, rights clearance, correct grade/subject.
- Verify mobile view at 360/390/768/1280/1440px and keyboard/reader access.
- Verify existing attendance, homework, Learning Compass, parent reporting and Abacus removal remain intact.
- Run npm test and npm run build. Do not claim success until executed.

## Exact Antigravity integration workflow
Start with git status, save/backup uncommitted work, git fetch origin, compare current local code with origin/feature/cbse-ncert-ai-video-library, and selectively apply this feature without overwriting newer local work.
Run isolated database migrations, tests, build, browser walkthrough and resolve any errors. Do not reset/merge/push/deploy until user approval.

**Final educational promise:** Every student can choose a class and subject and find accurate source references. Only real, original, teacher-approved AI video lessons become playable.