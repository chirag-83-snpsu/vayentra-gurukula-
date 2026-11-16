# VAYENTRA ONE — Founder to Engineering Build Playbook
## One enrolment. Classes 1–10. A continuous, concept-first learning journey.
**Initial market:** Bengaluru/Karnataka. **Growth direction:** All India, subject to curriculum/licensing/language coverage.
**Product:** Vayentra Gurukula, Vayentra Ventures Pvt. Ltd.
**Status:** Approved delivery SEQUENCE; individual features still require actual code, testing and sign-off.
**Immediate branch:** feature/one-phase0-secure-foundation
**Operating principle:** Academic accuracy, child safety, measured learning and long-term trust outrank feature count.

### Experience North Star
The product is an academic companion, not a streaming catalogue. The learner should open the app and instantly know: (1) what I am learning, (2) why it matters, (3) what I need first, (4) how to practise, (5) how I have improved. The parent should know what is working, where the student struggles and whether they need a teacher's attention. One permanent institutional identity follows the learner year after year.

### Design system specification
- Brand: midnight navy #09182F, deep blue #163772, restrained warm gold #E8B66B, natural white #F8FAFC. Use semantic tokens for success/warning/error rather than making gold a universal status.
- Fonts: robust system/legally deployable font stack with consistent 400/600/800 weights; legible Kannada glyph fallback for textbook LANGUAGE content when needed. Keep navigation/UI English.
- Visual principle: one great interactive explanation is worth six marketing cards. White space must signal hierarchy rather than leave blank gaps.
- Child experiences MUST vary: Class 1–2 large cards, audio and parent-assisted interactions; Class 3–5 interactive diagrams; Class 6–8 problem exploration and prerequisite bridges; Class 9–10 worked examples, competency questions and revision.
- Responsive: mobile-first, 360/390/768/1024/1440 widths, 44px touch controls, fast loading on low-end Android and low-data connections. Every lesson has accessible transcript and text fallback.
- Product language: thoughtful, modern, confident, never claims a guaranteed percentage, all-subject completion, verified results or school partnership without evidence.
- Accessibility: keyboard navigation, ARIA labels, 200% zoom, meaningful heading hierarchy, no animation-only information, reduced-motion.
- Performance budgets to validate against real devices: aim for LCP <=2.5s and CLS <=0.1 on pilot landing experience; measure rather than claim. Avoid large autoplay hero films and unoptimised media.

### Permanent product navigation
PUBLIC
/ — premium introduction and interactive concept demo
/how-we-teach — pedagogy, evidence, genuinely consented classes
/programmes — classes, boards, verified subject coverage
/admissions — guardian enquiry / complete verified application as separate flows
/login — email/password initially; Google/SMS after independently verified provider integration
/privacy, /terms, /support — reviewed parent-facing documents and support

AUTHENTICATED LEARNER
/learn — "Continue learning" for current verified grade
/learn/subjects — available current board/grade/edition subjects
/learn/chapters/:id — official mapped chapter sequence and learning objectives
/learn/concepts/:id — lesson, interactive explanation, worked example, practice
/practice — short diagnostic and custom misconception revision
/my-passport — multi-year achievements, academic-year ledger, revisitable mastered concepts
/homework, /assessments — assignments and teacher review

FAMILY
/family — choose linked learner, genuine progress and attendance
/family/admission — application and enrolment status
/family/passport — authorised multi-year reports
/family/markcards — private school record and guardian-controlled permissions
/family/membership — authenticated terms and payment history
/family/help — support and consent requests

TEACHER / ACADEMIC REVIEWER
/teacher — assigned students, priority interventions, homework
/studio — curriculum-to-concept original authoring
/review — subject and rights review, revision approval, subtitles
/admin — admissions, enrolments, memberships, audit, promotion, incident response

### Delivery stages (do not skip safety gates)

PHASE 0: ARCHITECTURE & IDENTITY SECURITY (current)
- Single canonical Vayentra ONE database; reject conflicting 011 migration.
- Explicit account-to-student mappings; reject child ownership inferred by name, user-supplied ID or JWT.
- Provider Google/SMS sign-in disabled until signature/audience/issuer and real SMS gateway verified.
- Production blocked while seeded demo accounts and unreviewed consent remain.
- Source control excludes child databases, generated video media and credentials; backups tested.
- Email/password remains an isolated DEVELOPMENT capability. Role controls tested.
- Complete cross-student IDOR audit, dependency/secrets review, staff MFA plan, access logging.
- GATE: actual npm tests/build pass, isolated migration works, zero known unauthorised child-record reads.

PHASE 1: ADMISSION → LEARNER
- Parent sign-up, real contact verification, age-aware role rules, consent evidence, clear purpose/retention.
- Admin-reviewed enrollment approval, secure student account linking, nonguessable public learner number.
- Class/board/year from approved enrolment, not a student-selected UI value.
- Distinguish enquiry, application, registered student, academic-year record and paid entitlement.
- GATE: one family can register one fictional Class 4 CBSE learner and access ONLY their records; retries do not create duplicates.

PHASE 2: FIRST-CLASS LEARNER EXPERIENCE
- Child dashboard with one clear next action: Continue Concept.
- Teacher-approved subject/chapter/concept graph with prerequisites, original content versions.
- Use real current textbook edition metadata and human-reviewed mapping.
- Build ONE complete Class 4 CBSE Mathematics chapter (chapter chosen after curriculum verification). Do not advertise 20 complete class catalogues when those are draft shells.
- Every concept has objectives, baseline check, illustrated story, working example, explanation video/transcript, answer/check, misconception feedback and remedial concept.
- GATE: teacher & 5 test learners complete real chapter journey; answers and explanations independently validated.

PHASE 3: LEARNING COMPASS & MEASUREMENT
- Baseline assessment, item tagging, pre/post parallel questions, teacher intervention, spaced revision without compulsive gamification.
- Student sees evidence (not fake "AI mastery"). Parents see teacher-review status and weekly factual report.
- Admin sees lesson quality, editorial throughput, students needing support, not invasive child ranking.
- GATE: repeated test items do not inflate mastery, private answers never leak, measured pilot accuracy and uptime.

PHASE 4: LONGITUDINAL ACADEMIC JOURNEY
- Admin year transition, repeat/transfer, board-change, promotion proof, idempotent grade advancement.
- Safely retain previous grades' homework, source edition, marks, teacher feedback and assessment.
- Private mark-card upload with short-lived URLs, malware scanning, encryption, guardian permissions, review status and deletion/export process.
- Class 10 completion portfolio distinguished from school certificate; no promised exam percentage.
- GATE: Class 4 to Class 5 with original learner identity; old academic data read-only, audit verified.

PHASE 5: MONETISATION (private to verified guardian)
- Founder must define what ₹599 buys: one-time / monthly / annual / academic year; whether online only or offline included.
- Private server-controlled plan config, taxes, terms snapshot, cancellation, refunds, secure checkout with signed webhook and idempotent ledger.
- Do not put price on homepage or checkout before guardian consents. Disclose complete actual price and billing term before charging.
- Payment events cannot set learner identity/grade or overwrite academic data.
- GATE: sandbox successful/failed/duplicate/refund cases reconciled with invoices and entitlements.

PHASE 6: PILOT & OPERATIONS
- Invite first 25 controlled families, expand to 100 after pass; secure consent; content support staffing.
- Measure learning gain on parallel tests, weekly use, helpdesk load, renewals, paid conversion, video buffering, response time and actual costs.
- Privacy counsel reviews parent-child processing; academic teachers sign off board coverage; security review signs off infrastructure.
- GATE: zero unresolved critical bugs, backup restore, real device accessibility tests, acceptable measured uptime and support SLA.

PHASE 7: SCALE RESPONSIBLY
- Add verified grades/subjects/boards through a measurable editorial factory, not AI-generated thumbnails.
- Move from single SQLite node to transactional managed PostgreSQL when justified; maintain stable learner IDs and a tested migration pathway.
- Multi-city customer support, video CDN/transcoding, private object storage, queues and observability.
- Multi-guardian household relationships, localisation, school access via specific permission and licensing.
- Scale only after cohort economics are positive; plan audited governance, strong disclosures and real financial reporting for long-term listing ambitions.

### Concept Studio content contract
Every PUBLISHED unit must include: exact board + grade + academic year + source book edition, chapter code, concept objective, prerequisites, original narrative, short explanation video or equivalent accessible visual, subtitles/transcript, 1 worked example, 3+ teacher-reviewed practice items, scored misconception classification, a remedial path, author/reviewer, version, content rights status, publishedAt and recheck date.
State machine: mapped -> draft -> teacher_review -> approved -> published -> revision_needed -> retired.
Public discovery may show a draft only as 'planned', NEVER playable or purchased as completed content.

### Platform security contracts
Backend rejects all requests for a student not explicitly accessible to authenticated account. Staff only sees assigned batches unless an approved role permits broader access. Every data-changing endpoint validates role, ownership, input schema and idempotency. Every staff write is audited. No child uploads are publicly served or put into model requests without a verified lawful processing basis and approved vendor safeguards.
No role or grade changes based on browser storage, query parameters, or dev-only shortcuts.
Production is fail-closed until a dedicated launch gate review removes the explicit block.

### Technical quality bar
- CI on every PR: lint/typecheck, unit, integration, route auth negatives, DB migration + rollback/restore rehearsal, accessibility and responsive E2E.
- NodeJS API: structured errors, request tracing, rate limits, restricted CORS, secrets not in repo, signed staff sessions.
- Every chapter: academic author sign-off, original-content rights, correctness audit, content publication rollback.
- Analytics: privacy-minimal aggregates. No public individual student performance rankings.
- No module marked complete until code and browser behavior are independently tested.

### First engineering handoff (EXACT)
1. Preserve local modifications; fetch origin/feature/one-phase0-secure-foundation.
2. Compare your active local work with this branch; do not blindly merge the competing passport migration.
3. Copy a test DB into a private ignored location, inspect migration ledger and demonstrate restoring a backup.
4. Verify explicit student mapping, disabled unverified third-party auth, no fake child consent, and production fails closed.
5. Run npm ci, npm run build, npm test; save logs.
6. Run a manual 4-role auth matrix: guest, student, guardian, admin and negative ID-changing tests.
7. Check /, /login, /admissions, /app, homepage, Lesson Studio, Legacy attendance/homework and new admin journey.
8. Present changes, bugs, risk, screenshots and acceptance results BEFORE advancing to Phase 1.

### Founder acceptance rule
No "done" based on code generation alone. Any feature is complete only when real workflow, data ownership, teacher accuracy, browser behavior, security and successful test evidence are shown.
