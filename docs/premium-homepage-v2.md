# Vayentra Gurukula — Premium Homepage V2

## Design intent
Rebuild the public first impression into a visually distinct, student-friendly education experience while preserving the separate login page and all existing functionality.

### Previous experience (observed from November 9 screenshots)
- Oversized text blocks and repetitive section layouts.
- Mostly static cards without a meaningful student interaction.
- Little sense of what concept-based teaching feels like.
- The Learn Hub preview resembles a generic admin/product mock rather than a learning demonstration.

### New experience
1. Immersive dark-navy editorial hero with a differentiated, succinct message: **Don't just learn it. Understand it.**
2. Fully functional **Maths / Science / English concept preview**: choose a subject and answer, then reveal an original explanation. It is deliberately labelled an illustrative practice, not live assessment data.
3. Original learning-method visualization (no unlicensed student photographs or stock images).
4. Asymmetric "the Vayentra difference" editorial cards with visual explanation.
5. Clickable **Classes 1–5 / 6–8 / 9–10** academic pathway selector; CBSE/Karnataka State preview.
6. Four-step teaching process with human-first positioning.
7. Premium illustrative student portal, not fabricated progress values or verified lesson availability.
8. Useful FAQ accordion and distinct student-login conversion.
9. Responsive from 360px to wide desktop, keyboard focus, reduced-motion support.

### Files changed
- `src/views/LandingPage.tsx` — rebuilt the homepage; reuses existing `onLogin` and `onExplore` props.
- `src/styles/premium-home.css` — new isolated visual design; the old landing stylesheet stays intact for the separate login page.

### Existing flow left intact
- `/` renders homepage.
- `/login` remains the separate student/parent sign-in.
- `/explore` remains the original public resources section.
- `/app` remains the authenticated application.
- No Abacus.
- No added third-party dependencies, servers, APIs or database migrations.
- Existing homework, attendance, NCERT video library, Learning Compass and RBAC code untouched.

### Release checklist for Antigravity
1. Run `git status`, protect all uncommitted local changes, then `git fetch origin`.
2. Compare local state with `origin/feature/premium-homepage-v2`; port only the two homepage files if local development differs.
3. Run `npm ci`, `npm run build`, `npm test`.
4. Browser QA `/` at widths 360/390/768/1024/1440 px. Verify no horizontal scrolling and clear readable copy.
5. Test navigation anchors and mobile hamburger menu.
6. Switch the concept demo among Maths, Science and English. Select each answer, reveal explanation, switch subject, and check state resets.
7. Change class bands and school-board preview; check text updates.
8. Verify FAQ toggles and keyboard navigation.
9. Verify every student login CTA routes to `/login`, and learning resources route to `/explore`.
10. Test direct `/login` refresh, invalid login error and authenticated role restrictions; homepage must never expose private records.
11. Verify no hard-coded success metrics, fake reviews, false "live lesson" labels, Abacus or Kannada interface toggles.
12. Check accessible contrast, focus states, alt text, reduced-motion mode and animation performance.
13. Keep `/app` and backend untouched. Do not merge, deploy, or push local changes automatically.

### Optional future improvements requiring institute assets
- Genuine classroom/student activity imagery with parent consent.
- Verified faculty profiles, course schedules, contact details and fees.
- Admission enquiry workflow and legitimate admissions contact mechanism.
- Real student testimonials only with consent and honest attribution.

**Important:** Code was edited via GitHub connector. An actual build, browser visual verification and automated tests still need execution in the user's local Antigravity project.
