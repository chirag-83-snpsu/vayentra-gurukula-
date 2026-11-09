# VAYENTRA GURUKULA: LEARNING PASSPORT ARCHITECTURE v1.0

Status: FOUNDATIONAL PRODUCT DESIGN ONLY. This document is NOT a deployed platform.

## 1. The lifelong learner relationship

Vayentra Gurukula should enroll a learner ONCE, assign a permanent unique Learner ID, and create a separate academic-year record for each grade until completion of Class 10. The user never needs to re-register when promoted. The previous year is historically visible, and permitted records can be exported after Class 10.

Core distinction: ENROLLMENT is a permanent relationship; SUBSCRIPTION/PAID ACCESS is a separately defined financial agreement. Store ₹599 as a PRIVATE configurable provisional price; never expose it in public marketing or frontend source. Whether ₹599 is a one-time payment, monthly, yearly or per academic year is UNDECIDED and MUST be signed off before implementing checkout. No system should promise unrestricted 10-year paid access based solely on this amount without a sustainable, explicit contract.

A student starting at Class 4 may have 7 different yearly enrolments through Class 10 but only ONE canonical Learner ID.

## 2. Nine product domains

**Identity & Guardian Consent:** verified adult account, authenticated family relationship, separate minor profile, purpose-specific consent and revocation history, child-friendly sign-in. Never store Aadhaar scans by default.

**Learning Passport:** durable learner ID, academic-year timeline, grade history, board transfer or repeat, milestones, report card provenance, permission-controlled document export.

**Curriculum Universe:** academic-year + board + grade + medium + subject + textbook edition + chapter + concepts, all independently versioned and teacher-reviewed. Do NOT force the same 10- or 12-topic count on all chapters.

**Concept Studio:** micro-lesson format PREREQUISITE → WHY → EXPLAIN → SHOW → PRACTISE → COMMON ERROR → RECHECK. Original video, captions, transcript, accessible explanation and printable worksheet.

**Learning Compass:** baseline concept diagnostic → misconception code → teacher intervention → alternate explanation or example → parallel post-test. Mastery from evidence, not time watched. Cross-grade prerequisite bridges available without changing enrolled grade.

**Assessments:** homework, weekly tests, open-ended questions, rubrics, adaptive practice, misconception notebooks and teacher-reviewed results. Do not use generative AI as the sole grader for high-stakes marks.

**Family Dashboard:** attendance, assignments, teacher communications, reports, academic document permissions, payment records and learner-year timeline for linked children only.

**Teacher & Editorial Workspace:** curriculum mapping, original scripts, subject review, publication approval, classroom intervention queues and revision control.

**Admin & Membership:** admissions approval, lifecycle, roles, support, migrations, billing ledger, parent consent requests and audit events.

## 3. Class-specific experience

CLASSES 1–2: parent-supported use, large icons, short sessions, phonics, number sense, audio-assisted instruction, drawing and observation. Avoid unlimited screen time.

CLASSES 3–5: interactive reading, everyday science, number reasoning, diagram explanations, foundational language comprehension, printable and offline tasks.

CLASSES 6–8: concept maps, simulations, worked examples, vocabulary, project activities, self-explanation, prerequisite diagnosis and teacher intervention.

CLASSES 9–10: current board-specific syllabi, revision plans, multi-step reasoning, writing rubrics, competency questions, mock tests and honest analytics, NOT guaranteed percentages.

The surrounding UI remains English-first. A platform claiming ALL Karnataka subjects must account for language curricula, including Kannada when offered, even if the website interface has no Kannada toggle. Teacher and founder approval required on language scope.

## 4. Parent and learner journeys

A. FIRST ADMISSION: Public site → guardian verification → minimal child details → class/board/year → clear privacy notice and verified consent → approval → accepted PRIVATE pricing terms → hosted checkout if required → server-verified settlement → permissioned learner workspace. Enquiring is NOT enrolled.

B. DAILY LEARNING: Learner sees grade-specific subjects → chapters → 3–12+ real concepts as academically appropriate → brief original explanation → interactive diagram → 3-question check → concise misconception-specific feedback → teacher or revision support when needed. Completed topics remain revision-accessible.

C. PROMOTION: School-year transition proposed and approved by authorised adult/staff → old grade closed in immutable historical record → new grade activated transactionally. All records stay linked to Learner ID. Retake/repeat, grade correction, changing boards, language changes and academic-year revisions need deliberate controlled flows. Double-click/retries must not double-promote.

D. ACADEMIC RECORD: Parent uploads mark card privately → virus/type validation → document metadata with academic year → optional reviewed extraction → status distinguishes student-uploaded from school-verified → user-controlled export, retention and deletion. Do not fabricate marks or label unverified uploads as verified.

E. GRADUATION: After Class 10, generate a Vayentra achievement portfolio with completed grade timeline, academic evidence and permissions. It is NOT a CBSE or KSEAB school marks certificate. Allow data export, continued authorised access and lawful deletion.

## 5. Proposed platform structure

React/TypeScript/Vite app transitions to feature modules: Public Website, Guardian Onboarding, Learner Workspace, Passport, Curriculum, Concept Studio, Practice, Academic Vault, Family Dashboard, Teacher Studio, Academic Review and Admin.

Existing Express API remains an adapter while modular domain services are extracted: Auth, Guardian, Learner Identity, Enrolment, Academic Year, Curriculum, Lessons, Assessments, Mastery, Files, Membership, Payment, Notifications and Audit.

Existing SQLite may remain for local prototypes; for India-scale multi-user production plan transactional managed PostgreSQL, private encrypted object storage, video CDN/transcoding, robust background jobs, monitored queues, observability, backups, recovery drills, caching and scalable stateless app instances. Never commit real child data in a tracked SQLite file.

API structure (planned, not implemented):
- POST /api/v2/guardian/onboarding
- POST /api/v2/admissions
- POST /api/v2/admissions/{id}/approve [admin only]
- GET /api/v2/learner/me/passport [authenticated, server-resolved]
- GET /api/v2/learner/me/academic-years
- POST /api/v2/learners/{id}/promote [admin, idempotent]
- GET /api/v2/curricula?board=&grade=&year=
- GET /api/v2/chapters/{id}/concepts
- GET /api/v2/concepts/{id}/approved-lesson
- POST /api/v2/practice/attempts
- POST /api/v2/vault/upload-intents [authorised guardian, signed upload]
- POST /api/v2/memberships/checkout [server-priced]
- POST /api/v2/payments/provider-webhook [signature verified]
- GET /api/v2/guardian/{learnerId}/report [verified link]

## 6. Relational data model, implementation proposal only

users(id,role,account_status,created_at)
guardians(id,user_id,verification_state)
learners(id,permanent_learner_no,status,created_at)
guardian_learner_links(id,guardian_id,learner_id,relationship,verification_evidence_ref,revoked_at)
consent_records(id,guardian_id,learner_id,purpose,policy_version,evidence_ref,granted_at,revoked_at)
academic_years(id,name,start_date,end_date,jurisdiction)
learner_enrolments(id,learner_id,academic_year_id,grade,board,medium,status,school_ref)
grade_transition_events(id,learner_id,from_enrolment,to_enrolment,type,idempotency_key,staff_actor,timestamp)
curriculum_versions(id,board,grade,year,edition,status,reviewer)
subjects(id,curriculum_id,code,name,language)
textbooks(id,subject_id,edition,publisher,external_ref,rights_status)
chapters(id,textbook_id,sequence,title,review_status)
concepts(id,chapter_id,key,objective,reviewer,mastery_criteria)
concept_prerequisites(concept_id,required_concept_id) [DAG; block cycles]
lesson_versions(id,concept_id,version,body,asset_refs,approval_status,teacher_reviewer)
question_bank(id,concept_id,question_type,stem,answer_key_private,rubric,status)
learning_attempts(id,learner_id,concept_id,item_id,answer,scored_result,created_at)
mastery_evidence(id,learner_id,concept_id,source_attempt,level,reviewer)
homework_assignments, homework_submissions, attendance_sessions, attendance_records
academic_documents(id,learner_id,academic_year_id,object_key,sha256,kind,verification_state,retention_class)
mark_entries(id,document_id,exam_type,subject,scored,max_possible,verified_at)
memberships(id,learner_id,created_at,state)
private_price_plans(id,amount_paise,interval,tax_mode,terms_version,availability)
billing_agreements(id,guardian_id,learner_id,plan_id,terms_snapshot)
payment_events(id,provider_event_id UNIQUE,agreement_id,amount_paise,status,signature_verified)
entitlements(id,learner_id,feature,start_at,end_at,state)
invoices, refunds, service_tickets, notification_events, audit_events, export_jobs, deletion_requests

Constraints: unique learner/year membership policy; single active enrolment; atomic promotion; nonnegative valid marks; strict grade 1–10; typed board codes; teacher verification state; immutable payment ledger; no duplicate provider events; private URLs for documents; role permissions enforced by backend, not only UI.

## 7. Nonnegotiable security and privacy

- Fix CURRENT security defects before ANY real child onboarding: Google credential is only JWT-decoded instead of signature-and-claims verified; student session lookup can fall back to hardcoded stu-001; local default passwords and PINs; browser-only grade self-selection is not authorisation; local tracked SQLite may include private data. These are release blockers, not polish tasks.
- Verifiable parental permission processes, purpose limitation, minimal collection, transparent retention and deletion, restricted child profiling, incident response and no targeted behavioural advertising.
- Child data must never enter AI model prompts unnecessarily; any model provider requires approved data-processing controls. AI suggestions must be clearly labelled and subject to teacher oversight.
- Store mark cards in PRIVATE object storage with malware scanning, time-limited signed links, encryption and access logging; do not place documents under a public/ folder.
- Passwords/PINs hashed, secrets rotated and stored outside Git, short-lived sessions, strict RBAC/ABAC, per-student authorisation tests, deny-by-default API policies, minimal CORS, secure cookies or equivalent protections.
- Recurring payments only with approved terms, explicit guardian authorisation and RBI/payment-processor compliant mandates; payment webhooks must be verified and idempotent.
- Child safety: no open unmoderated peer chat, no public student ranking, no unlimited engagement incentives or unverified medical/psychological labels.

## 8. Content and copyright strategy

All curriculum nodes must reference version, grade, board, publisher and academic year. NCERT and Karnataka textbook editions can change, requiring versioning. Use original Vayentra explanations, diagrams and videos with human subject review. NCERT textbooks and electronic content cannot simply be rehosted or bundled as a paid content package. Verify licences/permissions for links and excerpts; get publication/rights advice before a commercial rollout. Original concept explanations are not copied textbook pages.

Each original concept content record must contain learning objective, prerequisites, narrative, visual steps, worked examples, 3–8 formative questions, misconception tags, remedial route, teacher signoff, source references, rights declaration, transcript/subtitles and accessibility check.

Content lifecycle: MAPPED → DRAFT → SUBJECT REVIEW → EDITORIAL REVIEW → APPROVED → PUBLISHED → REVISED / RETIRED. Never advertise unpublished lessons as available.

## 9. Release programme (each phase must pass QA)

P0: Security remediation and test DB isolation (critical).
P1: Permanent Learner ID, guardian linking, admin admission and grade verification.
P2: Versioned year-on-year passport, promotion/repeat/correction, mark card vault.
P3: Authoritative curriculum CMS for current CBSE and Karnataka State textbooks.
P4: Deep, original end-to-end concept lessons, assessments, diagnostic/remediation.
P5: Pricing/contract/mandate decision and private billing with reconciliation.
P6: Family dashboard, teachers, exports, operations, scalable architecture.
P7: Pilot Class 4–5 and Class 9–10 journeys, then grow topic-by-topic to Classes 1–10 and wider India.

Do not ship a fake “complete 1–10 library.” Ship one complete vertical slice as a gold standard, then expand in a tracked curriculum coverage matrix.

## 10. QA acceptance criteria for flagship workflows

1. New verified guardian creates EXACTLY one durable learner identity even if a request is retried.
2. Child profile cannot be accessed by any unrelated guardian or student, even after URL modification.
3. Grade 4→5 promotion closes historical enrolment and creates exactly one Class 5 enrolment in one transaction.
4. Board or textbook year change must not erase earlier mastered concept evidence.
5. Private mark-card files are never returned to guests or unrelated users; upload rejects malicious files.
6. Published lesson returns only academically approved, licensed media and reviewed question keys.
7. Concept attempt yields recorded evidence and reproducible teacher-readable misconception feedback.
8. Stale, failed and duplicated payment webhooks cannot extend entitlements incorrectly.
9. Paying status never comes from a frontend success flag. Membership ID and records remain after subscription expiry.
10. Class 10 portfolio uses actual authorised records, labels unverified marks honestly, and offers permitted export.
11. Keyboard, screen reader, 360/390/768/1024/1440px, Indian low-bandwidth and multiple browsers pass.
12. Production deployment requires backup-restore demonstration, access control penetration tests, load tests and academic UAT.

## 11. Founder decisions before live billing

- What does ₹599 cover: one-time through Class 10, monthly, yearly, academic year or fixed introductory plan?
- Is offline/in-person tuition INCLUDED or a separate service?
- Does one guardian pay for one child or an entire family?
- Which subjects/languages are included in the opening cohort?
- What privacy/retention policies, refunds and contact support will be legally reviewed?
- Who are the named academic reviewers responsible for published videos and question keys?

**End state:** A genuine long-term education relationship, with durable identity, real explanations from first principles, credible learning evidence, trusted guardians, original content and transparent commercial terms — NOT a generic sales brochure.
