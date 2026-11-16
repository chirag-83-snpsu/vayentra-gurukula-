# Vayentra Gurukula — New Public Home + Separate Student Login

## Goal
The first thing every visitor sees is a premium, English-only introduction to Vayentra Gurukula, not the internal Admin, Teacher, Reviewer, or Safeguarding interfaces.

## Pages
- `/` — marketing homepage: philosophy, Classes 1–10, CBSE/State, concept-based approach, learning journey, FAQ and student login.
- `/login` — dedicated login page with existing email/password backend. After sign-in, students/parents select Class 1–10 and CBSE/State. Parent selection is checked against linked child profile. **Student class selection is not yet independently server-verified; it must not be treated as permission to access another learner's records.**
- `/explore` — existing public curriculum and learning references, without internal admin sidebar.
- `/app` — existing internal application shell, now gated on authenticated session.

## Safety and truthful marketing
- No made-up outcomes, testimonials, faculty numbers, ratings, fees, or success rates.
- No Abacus.
- No Kannada interface controls. Karnataka State Board remains supported.
- The landing page does not show student records, safeguarding incidents or admin tools.
- Role-based restrictions remain enforced by the backend; the UI guard is additional, not a replacement.
- Remove development role bypass in the navbar and app shell.
- Existing Google/OTP authentication pathways in AuthModal are not replaced or claimed secure by this page. The new page uses the existing email/password login.
- No new enrolment, fee or backend data is written by choosing a class.

## QA to perform in Antigravity
1. Preserve uncommitted local changes, backup SQLite and compare `origin/feature/public-home-and-separate-login` before integrating.
2. Run `npm ci`, `npm run build`, `npm test`.
3. Check direct navigation and refresh at `/`, `/login`, `/explore`, `/app` and browser back/forward.
4. Guest: home and explore accessible; `/app` shows login and no private portal data.
5. Parent: valid sign-in; child selection, class and board mismatch errors; proper authorised portal.
6. Student: valid sign-in and class selection. IMPORTANT: enrolment-to-class check is a future backend requirement.
7. Staff: can reach authorised staff portal without being mistaken for student.
8. Invalid credentials, missing password, network outage and expired session produce helpful errors.
9. Verify 360, 390, 768, 1024, 1440 px; mobile menu; keyboard-only nav; focus; contrast; reduced motion.
10. Check registration, attendance, homework, learning videos, teacher and admin role restrictions, and no Abacus.
11. Inspect local app for Vite SPA history fallback configuration on hosting.
12. Do not commit/merge/push/deploy without user approval.

## Outstanding before public launch
- Implement authenticated server endpoint to return verified class/board for student account, and enforce access server-side.
- Audit demo OTP/Google routes and development credentials; remove all bypasses before exposing real learner data.
- Add a genuine admissions enquiry form only after contact details and consent/privacy notices are approved.
- Replace illustrations with consented photos from Vayentra classes if desired.
- Browser and full build tests have not been run by this GitHub-only edit.
