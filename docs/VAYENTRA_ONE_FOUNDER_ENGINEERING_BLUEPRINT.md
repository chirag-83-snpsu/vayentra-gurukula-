# VAYENTRA ONE — Founder–Engineering Product Blueprint
**North star:** One student identity, one continuous Class 1–10 learning journey, one educational record.
**Product:** Vayentra Gurukula, under Vayentra Ventures Pvt. Ltd.
**Audience:** Indian families with children studying Classes 1–10, initially Bengaluru, eventually nationwide.
**Status:** Product/engineering strategy and pilot foundation. NOT a completed national service.

## 1. Product definition and positioning
**Vayentra ONE** is a lifelong-*within-school* (Class 1–10) academic identity. A family registers a child one time; annual progression adds a new curriculum and record while preserving earlier achievements. The contract is continuity of identity and access according to published membership terms, **not a guarantee of marks**.

### Public positioning
"Don't just learn it. Understand it."
"One learner. One identity. Every year of growth."
The homepage should demonstrate understanding, not list unrealistic content counts or outcomes.

### Private membership offer
The founder's current intended price is the founder's private price, **not to appear anywhere in public site copy, public APIs, public testimonials or marketing**. A public GitHub repository should not contain the private price/fee settings either. Use a secure server-side pricing configuration at launch, accessible only to admins and then displayed to an authenticated verified guardian on a documented offer and checkout screen.
**Commercial policy still undecided:** Is the founder's private price one-time, monthly, annually, term-based, or another plan? "Enrol once" is a student-account lifecycle statement, not billing frequency. Do not accept money, send renewal reminders or grant subscription entitlement before the policy, taxes and refund terms are approved.
A one-time the founder's private price for 6–10 years of unlimited AI video/teacher support would need a separate sustainability assessment; server, storage, video delivery, content creation and support are recurring costs.
Use three independent concepts: (a) institutional identity, (b) academic enrolment, (c) paid entitlement.

## 2. Class-by-class learning UX

| Stage | Primary learning experience | Teacher role | Family experience |
|---|---|---|---|
| 1–2 | Large icons, phonics, counting, short audio-visual exercises; minimal independent data entry | Guided foundation and reading support | Parent chooses units and views feedback |
| 3–5 | Concept stories, observation, simple assessments, explain-back activities | Identify gaps in foundational maths/language/science | Weekly progress, child-friendly recommendations |
| 6–8 | Prerequisite maps, real-world maths/science experiments, topic-level diagnosis | Remedy misconceptions rather than merely grouping by marks | Monthly learning reviews and milestone portfolio |
| 9–10 | Chapter pathways, board-oriented practice, structured revision and written answers | Marking rubrics, teacher-vetted AI explanations, exam strategy | Attendance, readiness reports, verified score records |

Accessibility: English **interface** throughout; Indian language *subjects* can still be educational content when required by a student's board. Provide captions, transcript, keyboard navigation, reduced motion, dyslexia-friendly presentation, low-data and offline worksheet options. Do not promise offline attendance submission without real synchronisation.

## 3. Student journey: example Class 4 entrant
1. Guardian discovers the public site and submits only an enquiry (not the child's details).
2. Identity and parent/guardian consent are verified through an approved, documented procedure.
3. Admission team creates/links the student's institutional ID, with correct board, grade and academic year. One ID persists.
4. Student enters the current Class 4 curriculum **after entitlement activation**.
5. Subject → actual textbook edition → chapter → concept. Each concept: explanation from first principles, worked example, original teacher-reviewed video or illustrated model, misconception check, small practice set, teacher remedy.
6. Family records optional school marks. Every entry begins as self-reported; only proof-backed verification can mark it as school-verified.
7. Guardian manages verified school report cards through a private vault once encrypted upload/scanning is delivered.
8. At the end of an academic year, an authorised administrator **confirms school promotion** and activates the next yearly record. Never overwrite the prior year.
9. If the student shifts board or school, preserve old edition/board and explicitly map the new curriculum. Do not blindly convert CBSE to Karnataka equivalents.
10. After Class 10, verify the official final results before issuing a completion summary; no promised percentage. Allow authorised archival/export and transparent retention/deletion rights.

## 4. Content factory — every concept, not every thumbnail
The correct graph is:
**BOARD → ACADEMIC YEAR → CLASS → SUBJECT → VERIFIED TEXTBOOK EDITION → CHAPTER → ORDERED CONCEPT → ORIGINAL EXPLANATION → PRACTICE → EVIDENCE OF UNDERSTANDING**.

Chapter count and concept count come from verified editions; do not hardcode an assumption that all textbooks have 10 or 12 chapters or concepts.

For every concept, the editorial minimum is:
1. One measurable learning objective, prerequisite pointers and reading-level target.
2. One plain-English explanation built from first principles; no copied textbook paragraphs.
3. One original visual / diagram / experiment with proper accessibility notes.
4. One 2–6 minute original narrated video or teacher-approved interactive sequence when feasible.
5. Two worked examples: an easy one and a transfer/application example.
6. Three to five diagnosis items with correct answer, rationale, misconception tag and reviewer.
7. One *do-it-yourself* practice activity or worksheet.
8. One teacher intervention path for students who need help, with child-suitable explanations.
9. An optional mastery confirmation as teacher feedback, never a high-stakes automated label.
10. A source map to an officially verified board/edition **without copying NCERT textbooks or publisher assets**.

### Editorial state machine
- Curriculum track: needs_teacher_mapping → in_review → verified.
- Subject/chapter: draft → reviewed.
- Concept: draft → teacher_review → published.
- Media: draft → teacher_review → published; no video streaming URL until real playable, approved media exists.
- Annual syllabus changes create a NEW edition, not silent edits of historic chapter identities.
- Every approval should have reviewer, timestamp, source evidence and rights attestation.

### Copyright and source integrity
NCERT ePathshala explicitly restricts redistribution and inclusion of textbook files in software. **Do not bulk host NCERT chapter PDFs or textbook illustrations.** NCERT advises that links may be provided with written permission; secure permissions before product deep links. Use source citations and original teaching content, seek legal guidance on licensing, and apply equivalent review to Karnataka Textbook Society materials.
Reference sources: https://cbseacademic.nic.in/curriculum_2027.html and https://epathshala.nic.in/wp-content/doc/book/btextbook/textbook.htm . Karnataka official textbook publisher domains require re-verification for edition year before source mapping.

## 5. Data model / parent and student identity
Reuse existing canonical \`students.id\`, \`students.enrollment_number\`, \`guardians.id\`, students' linked guardian, and existing attendance/homework. **Do not generate a second student row each year.**

New schema (migration 011):
- \`one_memberships\`: one per existing student; initial grade/year, target Class 10, guardian link, consent-activation state, *separate* entitlement state.
- \`one_consent_reviews\`: admin-logged actual guardian verification evidence references, without raw ID numbers. A stored declaration does not alone establish legal compliance.
- \`one_academic_years\`: one record per student per academic year; grade, board, status. Unique active year per student.
- \`one_mark_entries\`: numeric school mark journal; provenance \`self_reported\` vs \`school_verified\`.
- \`one_document_metadata\`: metadata-only placeholder for encrypted object storage. No binary uploads or public URLs.
- \`one_curriculum_tracks\`: initial 20 draft boards×class shells for the pilot edition, no invented published courses.
- \`one_subjects\`, \`one_chapters\`, \`one_concepts\`, \`one_concept_assets\`: edition/board-specific, original teaching content and editorial state.
- \`one_content_review_logs\`: publisher mapping and rights-review evidence.
- \`one_concept_mastery\`: curriculum-linked teacher feedback, not advertising trackers.
- \`one_student_account_links\`: explicit user→student mapping; no guessing based on a student's name or a hardcoded student ID.
- \`one_journey_audit\`: internal enrolment/annual advancement audit.

### Domain invariants
- One active academic year per student.
- Grade change occurs only through an authorised, sequential annual progression transaction.
- Parent cannot change a verified grade by picking a dropdown.
- A copied or self-reported mark is never represented as a verified school result.
- Data access requires guardian–student relationship; staff access follows least privilege.
- Completed years stay unchanged unless audited corrections are implemented.
- No fee or entitlement is inferred from a successful login.
- No publishing without source edition and original-content review.

## 6. User-facing product areas
### Public
Premium homepage, student sample concept, Classes 1–10 explorer, teaching philosophy, admission enquiry, separate login. No private price or exaggerated statistics.

### Parent portal
My Vayentra Journey, family children selector, academic-year timeline, marks journal, homework, attendance, assessments, parental communication, digital-consent controls, secure document vault (later), access and receipts (after pricing approval).

### Student portal
My Class, chapter/lesson index, original video, "explain to me again" activity, misconception remedy, practice, teacher feedback, learning support. **Student login must not assume the child identity from a default ID.**

### Teacher Studio
Curriculum edition mapping, lesson authoring, original video scripting, tests and misconceptions, diagnostic review, interventions, grade-specific teaching workflows, approvals. No AI answer automatically published without educator review.

### Admin / Quality / Compliance
Admissions inbox, one-time identity creation, actual guardian consent review, annual academic promotion, content-review queue, staff access, finance configuration, retention/export/deletion governance, release QA, incident and safety processes.

## 7. Secure production architecture
**Pilot:** existing React + Vite TypeScript; existing Express API and SQLite, with new isolated modules. Treat as proof of core business workflow, not internet-scale architecture.

**Production evolution:** React/TypeScript responsive/PWA client; Express modular monolith with versioned API contracts; PostgreSQL (transactional academic history); encrypted private object storage for school records; CDN for ORIGINAL video delivery; background jobs for media processing, assessments and authorised notifications; short-lived signed media links; object malware scanning/quarantine; central audit/observability; hardened cloud and secrets management; automated backups and tested restores.

Use role-based plus relationship-based authorisation: a parent must be linked to the student. A teacher should see only assigned cohorts, an admin sees necessary operational records, a student only their own, and a media worker never receives student marks.

**Security releases blocked until:**
- Existing unverified Google JWT parsing/demo bypass is removed and a genuine OIDC verification provider is integrated.
- Existing hardcoded/default student PINs, guardian PINs, demo password fixtures and consent defaults are eliminated from production.
- \`server/routes/auth.js\` password login/session refresh resolves child identity via explicit \`one_student_account_links\` mapping (currently has older guess/fallback logic in the base app).
- Account lockout, credential reset, MFA for admins, session rotation, proper CORS allowed origins, CSRF/cookie policy, upload malware scanning, RBAC/ABAC penetration tests, secrets and database backup policy are audited.
- No sensitive \`.sqlite\`, \`.env\`, uploaded school documents or student exports are committed to GitHub.
- Verification of minors' data processing and lawful exemptions occurs with specialist legal counsel, and privacy notices and retention/deletion workflows are in force.

## 8. Children's data & safeguarding
India's DPDP Act and 2025 Rules include special safeguards and a phased commencement. Design for verifiable guardian consent, purpose limitation, data minimisation, retention/deletion, strong security, and **no targeted ads or behavioural marketing to children**. Educational assessments should be purpose-limited and reviewed for applicable rules/exemptions. Never publish student scores, photos or video without the proper permission and purpose. Keep teacher and guardian notifications factual.

Review primary government materials and obtain legal advice on launch obligations, including current commencement and any educational exceptions, rather than making blanket exemption claims.

## 9. Quality assurance: C1 to C5 release gates

| Phase | Core test |
|---|---|
| C1 sources | Requirement traceability, contract/API assertions, DB migration invariants, error guessing, child and parent abuse stories, board transition cases |
| C2 lifecycle | Unit validation, integration of member/year/marks/auth, E2E one child Class 4→5→6 with history preserved, regression of attendance, homework, login and original video catalogue, parent UAT |
| C3 quality | RBAC and IDOR attacks, consent revocation, document-access tests, 3G/low-data, 360/390/768/1024/1440 responsive, load, rate limits and failure recovery |
| C4 artifacts | Marketing, login, parent/student/admin UI, APIs, schema, content studio, videos, object storage configuration, backups, monitoring and audit |
| C5 workflow | Risk plan → cases → automation → run → triage → corrective commits → independent verification → release evidence, rollback plan and sign-off |

### Critical acceptance scenarios
- Family joins in Class 4: permanent ID is unchanged when moving to Class 5; old year still readable.
- Student cannot view any other child's score by editing URL or token.
- Parent of A cannot see B, even if both are in the same grade.
- Guardian identity/consent not verified: ONE membership stays pending.
- Self-reported score ≠ verified school score, including on summary/exam percentage.
- Mistaken academic-year transition is rejected; no partial DB change.
- Academic content missing editorial source verification remains unpublished.
- No Class 10 graduation certificate without validated official results.
- Disabled subscription remains separate from still-preserved parent/student identity.
- Failed file scan or permission change blocks document retrieval.
- Full backups restore ten years of marks, original edition and permissions without loss.

## 10. Phased implementation roadmap and true delivery status

**Phase 0 — Security and policy (must pass before real public student data):** Identity mapping, Google OIDC, adult verification, consent, privacy, terms, membership frequency, permitted prices, deletion/export procedures.

**Phase 1 — Vayentra ONE identity spine (current feature branch):** Membership and yearly schema, protected parent timeline, self-reported school marks, admin enrolment/activation/advancement and draft catalogue (20 board/class shells). No paid access or document upload yet.

**Phase 2 — Secure vault + subscription:** Private encrypted object storage, signed upload, type sniffing, malware scan, access log, verified school document review; secure private the founder's private price offer configuration; checkout only after commercial policy approved, receipts/refunds, entitlement logic and renewal policy.

**Phase 3 — Content factory:** Verified textbook editions, chapter/concept breakdown across BOTH boards and all 10 classes, authored explanations, videos, diagnosis, rubrics, copyright/editorial review queue, publication controls.

**Phase 4 — Teacher-guided personalised learning:** Original lesson animation, concept prerequisites, remediation, weekly assessment, human-reviewed mastery, parent reports, no opaque high-stakes AI judgment.

**Phase 5 — India-wide scale:** PostgreSQL migration, cloud deployment, object/media/CDN scaling, background queues, security and compliance evidence, localised curriculum editions, accessibility and 3G performance testing.

**Phase 6 — Class 10 exit:** Verified final result, rights-managed academic portfolio export, completion acknowledgment, long-term retention/deletion controls; never guarantee "good marks."

### Prioritisation
Do NOT attempt to generate all actual textbook chapters automatically, create fabricated AI videos, collect school marks without consent, or publish a one-price-for-ten-years claim until the content, parent verification and economics are proven.

## 11. Next founder decisions (not blockers to architecture)
- Is the founder's private price paid once, monthly, per academic year, or per term? Is there a fair-use teacher support limit?
- Is Vayentra ONE online only, offline tuition plus online, or separate tiers?
- What subjects and mediums are included in each board at each grade? Who verifies each annual textbook edition?
- Which parent identity verification route and data privacy counsel will approve child-data collection?
- How do you verify school-issued report cards and Class 10 board result?
- What service-level expectations are affordable at the chosen price?

**The founder's objective is achievable as a phased platform, not as an instant "100% complete" code generation.** A credible education institution should launch verified modules before scaling the marketing promise.
