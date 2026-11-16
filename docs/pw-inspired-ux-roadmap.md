# Vayentra Gurukula — PW-inspired learning experience

Design principle: adapt useful edtech workflows without copying Physics Wallah branding, content, visuals, code or unsubstantiated claims.

## Changes made
- New Class 1–10 and CBSE/Karnataka State Board learning pathway discovery on the public homepage.
- Relevant programme descriptions and direct links to the existing curriculum explorer.
- Student Learn Hub now exposes Daily Practice using the existing flashcards.
- Practice progress is read from and saved to the backend; failed requests never claim success.
- Student flashcard APIs enforce student role and card ownership, and validate review payloads.
- Original Vayentra navy/gold responsive card styling and accessible focus/navigation.
- Prominent unverified public claims reduced; curriculum buttons no longer imply unavailable class-specific demos.
- New regression checks in server/tests/daily_practice_security.test.js.

## Missing product features
- Full chapter-specific practice banks, notes and workbook downloads for all classes/boards.
- A real course enquiry CRM with verified teacher/schedule/fee information.
- Live/recorded class library and backend lesson association.
- Teacher-reviewed doubt resolution with tracking and parent feedback.
- Longitudinal analytics combining attendance, assignments, diagnostics and assessments.

## Critical launch gate
- Existing auth/identity and other student API endpoints require a full security review.
- The app has historically included sample users and data; don't deploy secrets or personal student data.
- Create isolated test database; run npm ci, npm test, npm run build and browser verification.
- Test guest, parent, teacher, student and admin permissions.
- Test 360/390/768/1280/1440px screen widths and keyboard usage.
- Verify no incorrect claims or non-functional CTAs remain.
- Protect all existing homework, attendance and diagnostic workflows from regressions.

## Antigravity workflow
Start with git status, compare local code against origin/feature/pw-inspired-learning-experience, port changes selectively, preserve newer local files and data, run full QA, report unresolved issues, and do not push/merge/deploy without approval.

Verification: changes were committed to GitHub branch but not executed on the user's local computer.