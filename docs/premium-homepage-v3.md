# Vayentra Gurukula — Premium Home V3: Learning Demonstrations + Admissions

**Feature branch:** `feature/premium-homepage-v3-learning-admissions`
**Base:** `feature/premium-homepage-v2`
**Status:** Implementation committed, but full app build/browser tests require Antigravity; no production deployment.

## Why V3
Screenshots of V2 show credible navy/gold branding but excessive long hero, static process cards, generic product teaser, limited class-by-class exploration, and no admissions route. V3 prioritises actual teaching quality and clear parent action.

## Delivered
- **Original concept quiz:** The homepage Math/Science/English example now distinguishes incorrect answers, correct responses and unselected states. Learners reveal one teaching step at a time, then can try another subject. No score is saved or presented as student progress.
- **Shorter first fold:** Reduced hero min height/padding at wide screens, plus mobile optimisations. The explanation may naturally extend below the fold after interaction. Never hide content inside a clipped widget.
- **Class 1–10 explorer:** Click an exact class, use the existing CBSE/Karnataka State board toggle, see illustrative learning focus, and choose to explore public resources or enquire. This is not a realtime batch/fee timetable.
- **Original interactive learning lab:** Observe → Explain → Apply uses an illustrated low-Sun/high-Sun shadow comparison, with teacher-friendly takeaways. It replaces four repetitive static process cards. No stock student photos or unlicensed media.
- **Distinct guardian admissions page:** `/admissions`, optionally `?class=7`. Collects only guardian name, phone, optional email, grade/board and message. Explicit contact-processing consent, honeypot field, structured backend validation, per-IP in-memory rate control, and server-confirmed success.
- **Private admissions inbox:** Admin Console → Admissions Enquiries, with status `new / contacted / closed` and permanent deletion. The endpoints for reading, updating and deleting enquiries require a signed-in admin. Parent, student and guests are prohibited.
- **SQLite migration 010:** Adds `admission_enquiries` without modifying existing students/batches/attendance/lesson records.
- **Automated API tests:** `server/tests/admissions_enquiries.test.js` validates consent, phone/board, RBAC, persistence, state changes and deletion.

## Navigation
- `/` marketing homepage
- `/admissions` guardian-only admission enquiry
- `/login` separate student/parent login
- `/explore` public learning resources
- `/app` authenticated application

## Privacy and rollout
- Never enter children's names or sensitive information into the new admissions form.
- Do not use real guardian enquiries until the site's data-protection notice, retention policy, access control and backup procedures are approved. The form currently gives a short description of data use and offers admin-side deletion; it is not a full legal privacy-policy implementation.
- The rate limiter is basic per-process protection. A production reverse proxy, durable abuse control, monitoring, spam protection, and proper IP/trust configuration are still required.
- Do not claim callbacks were completed or guaranteed; the form merely records requests. There is no Gmail/WhatsApp/SMS integration and no automatic notice to administrators.
- Full application security review remains important, especially a pre-existing student identity fallback in `server/middleware/auth.js`. Do not deploy real student data until fixed.
- No fake successes, admission availability, published AI video, testimonial figures, or Abacus content should appear.

## QA checklist (C1–C5)
1. Before any merge: `git status`, inspect uncommitted files, `git fetch origin`, compare with the feature branch and integrate selectively.
2. Back up existing database. Run SQLite migration 010 against a fresh isolated TEST DB. Do not upload/commit `server/db/vayentra.sqlite`.
3. Run `npm ci`, `npm test` and `npm run build`; capture actual output.
4. Browse widths **360, 390, 768, 1024, 1440**, desktop Chrome and mobile Safari/Chrome.
5. Test Maths incorrect answer then 3 explanation steps; correct answer, Science, English, switching topic resets state. Verify proper keyboard and screen-reader live feedback.
6. Test class selectors 1 and 10, board toggles, and admissions CTA passing chosen class to `/admissions?class=N`.
7. Test `/admissions` with valid guardian info (201), invalid phone (400), consent missing (400), spam attempts (429), backend offline; no false confirmation.
8. Test guest/parent/student cannot GET/PATCH/DELETE admissions data; admin can list, mark contacted, delete.
9. Verify admin UI does not expose PII to other roles. Test site history navigation/refresh.
10. Verify `/login`, attendance, homework, Learning Compass, NCERT video and Class 10 pilot are unchanged.
11. Verify sticky navigation, scroll anchors, no horizontal scroll and no content hidden below overlays.
12. Assess colour contrast, focus order, reduced-motion, loading and error handling.
13. Never merge/deploy/commit local changes without the user's explicit approval.

## Files
New:
- `src/views/AdmissionsPage.tsx`
- `src/components/AdmissionsInbox.tsx`
- `src/components/TeachingMethodShowcase.tsx`
- `src/components/ClassDiscoveryPanel.tsx`
- `src/styles/admissions.css`
- `src/styles/teaching-method.css`
- `src/styles/class-discovery.css`
- `server/routes/admissions.js`
- `server/tests/admissions_enquiries.test.js`

Modified:
- `src/views/LandingPage.tsx`
- `src/styles/premium-home.css`
- `src/App.tsx`
- `src/views/AdminView.tsx`
- `server/index.js`
- `server/db/migrations.js`

**Verification:** JS source syntax parsed through a lightweight review; real Node test execution, TypeScript build, migrations and browser QA were not performed by this GitHub-only editing session.
