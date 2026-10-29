# Vayentra Learning Platform: Developer Design Diagrams

Classes 1 to 10, CBSE / ICSE / Karnataka State. Each diagram maps to a requirement group. Diagrams are proposals for implementation, not built software.

[1 Architecture](#d1)[2 Roles](#d2)[3 Auth](#d3)[4 Consent](#d4)[5 Curriculum DB](#d5)[6 Assessment DB](#d6)[7 Commerce DB](#d7)[8 Content workflow](#d8)[9 Student flow](#d9)[10 Mastery](#d10)[11 Assignments](#d11)[12 Fees](#d12)[13 Subscription](#d13)[14 Notifications](#d14)[15 AI tutor](#d15)[16 Teacher](#d16)[17 Parent](#d17)[18 Admin](#d18)[19 Deployment](#d19)[20 Attendance](#d20)[21 Bulk import](#d21)[22 Tickets](#d22)[23 Staff roles](#d23)[24 Year rollover](#d24)[25 Concept map](#d25)[26 Mistake notebook](#d26)[27 Safeguarding](#d27)[28 Teacher analytics](#d28)[29 Parent engagement](#d29)[30 Admissions funnel](#d30)[31 Gamification](#d31)[32 Learning tools](#d32)[33 Language + voice](#d33)[34 Trust + quality](#d34)[35 Offline](#d35)[36 Flags + release](#d36)[37 Finance + legal](#d37)[38 Class 1-4](#d38)[39 Partners + add-ons](#d39)

## 1. System architecture (common platform, technical NFRs)

Single modular backend, queue workers for AI and messaging, CDN for video.

```mermaid
flowchart LR
U["Student / Parent / Teacher / AdminReact or Next.js PWA"] --> CDN["CDN + WAF"]
CDN --> API["Modular APIFastAPI or Django"]
API --> AUTH["Auth: Google, OTP, JWT"]
API --> DB[("PostgreSQL")]
API --> RD[("Redis cache + queue")]
API --> OBJ["Object storageHLS video, PDFs"]
API --> PAY["Payment gateway"]
API --> MSG["WhatsApp / SMS / Email"]
RD --> W["Workers: AI scripts, audio,reports, notifications"]
W --> AI["AI providerPII redacted"]
W --> DB
API --> MON["Logs, Sentry, backups"]
```

## 2. Roles and permissions

Server-side RBAC. Scope is enforced by family, class or tenant ID, never client-supplied.

```mermaid
flowchart LR
S["Student"] --> S1["Learn, quiz, submit homework, ask doubts"]
P["Parent"] --> P1["Own children only: reports, fees, consent"]
T["Teacher"] --> T1["Assigned classes: content draft, grading, attendance"]
R["Reviewer"] --> R1["Approve or reject content"]
A["Admin"] --> A1["Users, fees, publish, reports, audit"]
I["School coordinator"] --> I1["Own org roster and reports"]
```

## 3. Authentication: Google, OTP, child profile

Parent signs in with Google or OTP. Children use a profile and PIN under the parent account.

```mermaid
sequenceDiagram
participant P as Parent
participant FE as App
participant API as API
participant G as Google
participant SMS as SMS Provider
P->>FE: Sign in with Google
FE->>G: OAuth consent
G-->>FE: ID token
FE->>API: Verify token
API-->>FE: Session JWT + refresh cookie
P->>FE: Or enter mobile number
FE->>API: Request OTP
API->>SMS: Send hashed-stored OTP, rate limited
P->>FE: Create child profile + PIN
FE->>API: POST child profile
API-->>FE: Profile scoped to guardian
Note over FE,API: Child switches profile with PIN. No Google login under 13. Log device and IP.
```

## 4. Guardian consent (DPDP, child safety)

No child data processing until consent is recorded.

```mermaid
flowchart TB
A["Parent registers"] --> B["Verify mobile or Google email"]
B --> C["Add child: minimum data only"]
C --> D["Show privacy notice + consent text"]
D --> E{"Parent consents?"}
E -- No --> F["Child profile stays locked"]
E -- Yes --> G["Store consent_record: version, time, IP"]
G --> H["Activate child profile"]
H --> I["Parent can withdraw, export or delete data"]
I --> J["Audit event + retention job"]
```

## 5. Data model: curriculum and users (Class 1 to 10, 3 boards)

```mermaid
erDiagram
BOARD ||--o{ CURRICULUM : defines
GRADE ||--o{ CURRICULUM : has
ACADEMIC_YEAR ||--o{ CURRICULUM : versions
MEDIUM ||--o{ CURRICULUM : in
SUBJECT ||--o{ CURRICULUM : covers
CURRICULUM ||--o{ CHAPTER : contains
CHAPTER ||--o{ EPISODE : split_into
EPISODE ||--o{ EPISODE_VERSION : frozen
EPISODE_VERSION ||--o{ MEDIA_ASSET : uses
EPISODE_VERSION ||--o{ CONTENT_REVIEW : reviewed_by
USER ||--o| GUARDIAN_PROFILE : is
USER ||--o| STUDENT_PROFILE : is
GUARDIAN_PROFILE ||--o{ GUARDIAN_LINK : owns
STUDENT_PROFILE ||--o{ GUARDIAN_LINK : linked
GUARDIAN_PROFILE ||--o{ CONSENT_RECORD : gives
STUDENT_PROFILE }o--|| CURRICULUM : enrolled_in
```

## 6. Data model: assessment, assignments, mastery

```mermaid
erDiagram
QUESTION ||--o{ QUESTION_VERSION : versions
TEST ||--o{ TEST_QUESTION : has
QUESTION_VERSION ||--o{ TEST_QUESTION : used_in
STUDENT_PROFILE ||--o{ TEST_ATTEMPT : makes
TEST ||--o{ TEST_ATTEMPT : taken
TEST_ATTEMPT ||--o{ ATTEMPT_ANSWER : records
STUDENT_PROFILE ||--o{ TOPIC_MASTERY : tracks
ASSIGNMENT ||--o{ SUBMISSION : receives
STUDENT_PROFILE ||--o{ SUBMISSION : submits
SUBMISSION ||--o| GRADE_RESULT : graded
CLASS_GROUP ||--o{ ASSIGNMENT : assigned_to
TEACHER ||--o{ ATTENDANCE : marks
```

## 7. Data model: fees, subscriptions, notifications

```mermaid
erDiagram
PLAN ||--o{ SUBSCRIPTION : bought
GUARDIAN_PROFILE ||--o{ SUBSCRIPTION : pays
SUBSCRIPTION ||--o{ ENTITLEMENT : grants
FEE_STRUCTURE ||--o{ FEE_INSTALLMENT : splits
FEE_INSTALLMENT ||--o{ PAYMENT_TRANSACTION : settled_by
PAYMENT_TRANSACTION ||--o| INVOICE : issues
PAYMENT_TRANSACTION ||--o{ REFUND : may_have
PROMO_CODE ||--o{ PAYMENT_TRANSACTION : applied
USER ||--o{ NOTIFICATION_PREF : sets
USER ||--o{ NOTIFICATION_LOG : receives
MESSAGE_TEMPLATE ||--o{ NOTIFICATION_LOG : uses
```

## 8. Content creation and publishing workflow

AI draft can never go public without reviewer approval (AT-08).

```mermaid
stateDiagram-v2
[*] --> Draft
Draft --> AIDrafted: AI job
Draft --> TeacherEdit
AIDrafted --> TeacherEdit
TeacherEdit --> InReview: submit
InReview --> ChangesRequested: reject
ChangesRequested --> TeacherEdit
InReview --> Approved: reviewer ok + rights ok
Approved --> Published: has checkpoint test
Published --> Deprecated: new version
Published --> RolledBack: error found
RolledBack --> TeacherEdit
```

## 9. Student learning journey (episode-first)

For Class 1 to 4: audio-first, short episodes, picture questions, parent-assisted mode.

```mermaid
flowchart TB
A["Login via profile + PIN"] --> B["Dashboard: continue learning"]
B --> C["Subject, chapter map"]
C --> D["Episode player: hook, explain, example"]
D --> E["Try it + recap"]
E --> F["Compulsory checkpoint 3 to 5 questions"]
F --> G{"Score at or above 60%?"}
G -- Yes --> H["Unlock next episode"]
G -- No --> I["Hints + remedial episode"]
I --> F
H --> J{"Last episode?"}
J -- No --> D
J -- Yes --> K["Chapter test"]
K --> L["Mastery status + parent summary"]
```

## 10. Assessment scoring and mastery engine

```mermaid
flowchart LR
A["Student submits answers"] --> B["API loads frozen question versions"]
B --> C["Server-side grading"]
C --> D["Objective: auto score"]
C --> E["Subjective: teacher rubric queue"]
D --> F["Save attempt, no overwrite"]
E --> F
F --> G["Update topic_mastery"]
G --> H{"Mastery at or above 80%?"}
H -- Yes --> I["Schedule spaced revision"]
H -- No --> J["Create remediation_event"]
F --> K["Return explanations, never answer key"]
```

## 11. Homework and assignment lifecycle

```mermaid
stateDiagram-v2
[*] --> Created: teacher
Created --> Assigned: class or batch
Assigned --> Notified: WhatsApp, in-app
Notified --> Submitted: student upload or text
Notified --> Overdue: deadline passed
Overdue --> LateSubmitted
Submitted --> UnderReview
LateSubmitted --> UnderReview
UnderReview --> Graded: marks + comments
UnderReview --> Resubmit: teacher request
Resubmit --> Submitted
Graded --> ParentVisible
ParentVisible --> [*]
```

## 12. Fee payment and reconciliation

Frontend return is not proof of payment. Only a signed, idempotent webhook activates access.

```mermaid
sequenceDiagram
participant P as Parent
participant FE as App
participant API as API
participant PG as Payment Gateway
participant DB as DB
P->>FE: Pay installment
FE->>API: Create order
API->>DB: Save pending transaction
API->>PG: Create gateway order
PG-->>FE: Checkout (UPI, card, netbanking)
P->>PG: Pay
PG->>API: Signed webhook
API->>API: Verify signature + idempotency key
API->>DB: Mark paid, grant entitlement, issue GST invoice
API-->>P: Receipt via email + WhatsApp
Note over API,PG: Nightly reconciliation job vs settlement report
```

## 13. Subscription and entitlement states

```mermaid
stateDiagram-v2
[*] --> Trial
Trial --> Active: payment
Trial --> Expired
Active --> GracePeriod: payment failed
GracePeriod --> Active: retry ok
GracePeriod --> Suspended: grace over
Active --> Cancelled: parent cancels
Active --> Refunded: refund approved
Suspended --> Active: pay dues
Cancelled --> [*]
Expired --> [*]
```

## 14. WhatsApp, SMS and email notifications

```mermaid
flowchart TB
E["Event: fee due, assignment, result, absence"] --> Q["Notification service"]
Q --> C{"Opt-in + preference + quiet hours?"}
C -- No --> X["Skip or schedule later"]
C -- Yes --> T["Pick approved template (EN or Kannada)"]
T --> CH{"Channel"}
CH --> WA["WhatsApp Business API"]
CH --> SM["SMS via DLT registered sender"]
CH --> EM["Email"]
CH --> IN["In-app + push"]
WA -- failed --> SM
WA --> L["Delivery webhook: sent, delivered, read, failed"]
SM --> L
EM --> L
L --> LOG["notification_log + cost tracking"]
```

## 15. AI doubt tutor with child-safety guardrails

```mermaid
flowchart TB
A["Student question"] --> B["Moderation filter"]
B -- Unsafe --> R["Safe redirect + report to educator"]
B -- OK --> C["Redact personal data"]
C --> D["Retrieve approved chapter notes only"]
D --> E{"Supported by approved material?"}
E -- No --> F["Say unsure, escalate to teacher queue"]
E -- Yes --> G["Generate age-appropriate answer"]
G --> H{"Asks for test answers?"}
H -- Yes --> I["Refuse"]
H -- No --> J["Show answer + log model and prompt version"]
```

## 16. Teacher / faculty module

```mermaid
flowchart LR
T["Teacher dashboard"] --> A["Classes + batches"]
T --> B["Content: draft, submit for review"]
T --> C["Question bank + bulk Excel upload"]
T --> D["Create tests"]
T --> E["Assignments: create, grade, return"]
T --> F["Attendance + live class link"]
T --> G["Doubt queue"]
T --> H["Analytics: weak topics, at-risk students"]
T --> I["Parent messages, logged"]
```

## 17. Parent module

```mermaid
flowchart LR
P["Parent dashboard"] --> A["Child switcher"]
A --> B["Progress, attendance, scores"]
A --> C["Assignments status"]
P --> D["Fees: dues, pay, receipts"]
P --> E["Message teacher, leave request"]
P --> F["Controls: screen time, PIN"]
P --> G["Consent + data requests"]
P --> H["Weekly report PDF + WhatsApp"]
P --> I["Plan: upgrade, cancel"]
```

## 18. Admin module map

```mermaid
flowchart TB
A["Admin console + audit log"] --> U["Users + bulk import + roles"]
A --> AC["Academic setup: board, class, year, subject"]
A --> CT["Content release + rollback + coverage map"]
A --> FN["Fees, plans, refunds, reconciliation"]
A --> CM["Communication center"]
A --> RP["Reports + Excel / PDF export"]
A --> CMS["Website CMS + policy pages"]
A --> SP["Support tickets + content error reports"]
A --> PV["Privacy requests + retention"]
A --> ST["System settings + health"]
```

## 19. Deployment, CI/CD and operations

```mermaid
flowchart LR
G["Git repo"] --> CI["CI: tests, lint, dependency scan"]
CI --> ST["Staging"]
ST --> QA["QA + acceptance tests AT-01 to AT-15"]
QA --> PR["Production, India region"]
PR --> DB[("PostgreSQL daily backup")]
PR --> MO["Monitoring + uptime alerts"]
DB --> RS["Monthly restore test"]
```

## 20. Attendance and live classes

```mermaid
flowchart TB
A["Teacher schedules class"] --> B["Generate Meet or Zoom link"]
B --> C["Notify students + parents"]
C --> D["Class runs: join events captured"]
D --> E["Teacher marks or auto-attendance"]
E --> F{"Absent?"}
F -- Yes --> G["Alert parent + offer recording"]
F -- No --> H["Log present"]
D --> I["Recording to storage, class-only access"]
G --> J["Attendance report"]
H --> J
```

## 21. Bulk import (students, parents, teachers, questions)

```mermaid
flowchart LR
A["Download template"] --> B["Upload CSV or Excel"]
B --> C["Validate: format, duplicates, class exists"]
C --> D{"Errors?"}
D -- Yes --> E["Row-level error report"]
E --> B
D -- No --> F["Preview"]
F --> G["Admin confirms"]
G --> H["Queue job inserts in one transaction"]
H --> I["Invite parents by SMS or WhatsApp + audit log"]
```

## 22. Support ticket lifecycle

```mermaid
stateDiagram-v2
[*] --> New
New --> Assigned: auto-route by category
Assigned --> InProgress
InProgress --> WaitingUser
WaitingUser --> InProgress
InProgress --> Escalated: SLA breach
Escalated --> InProgress
InProgress --> Resolved
Resolved --> Closed: CSAT rating
Resolved --> InProgress: reopened
Closed --> [*]
```

## 23. Extended staff roles

```mermaid
flowchart LR
SA["Super admin"] --> P0["Everything + role management"]
AC["Accountant"] --> P1["Fees, refunds, GST, exports"]
SU["Support agent"] --> P2["Tickets, view-as-user with reason"]
CO["Counsellor"] --> P3["Career guidance, student concerns"]
MK["Marketing"] --> P4["CMS, leads, coupons"]
CP["Content producer"] --> P5["Media upload, no publish"]
SG["Safeguarding officer"] --> P6["Concern cases only"]
```

## 24. Year-end rollover, board and medium change

```mermaid
flowchart TB
A["Academic year closing"] --> B["Snapshot results + archive"]
B --> C["Clone curriculum version"]
C --> D["Diff vs new official syllabus"]
D --> E["Editors review changed chapters"]
E --> F["Promote students to next grade"]
F --> G["Re-map enrolment to new curriculum version"]
G --> H["Parent confirms renewal"]
X["Board or medium change request"] --> Y["Map via concept IDs"]
Y --> Z["Reviewer approves credit"]
Z --> G
```

## 25. Diagnostic test, concept map and prerequisite gap-fill

```mermaid
flowchart TB
A["New student signup"] --> B["Diagnostic test per subject"]
B --> C["Score per concept ID"]
C --> D["Concept graph with prerequisites"]
D --> E{"Prerequisite weak?"}
E -- Yes --> F["Insert earlier-class refresher episodes"]
E -- No --> G["Start at grade chapter"]
F --> H["Personal learning path"]
G --> H
H --> I["Concept map: locked, learning, mastered"]
H --> J["2-minute prior-knowledge check before each chapter"]
```

## 26. Mistake notebook, find-your-error coach, explain-it-back

```mermaid
flowchart LR
A["Wrong answer saved"] --> B["Tag: slip, concept gap, misread"]
B --> C["Mistake notebook"]
C --> D["Find-your-error coach"]
D --> E["Retry similar question"]
E --> F{"Correct?"}
F -- Yes --> G["Mark fixed + spaced recheck"]
F -- No --> H["Suggest remedial episode"]
B --> I["Pattern report to parent"]
J["Explain it back: voice or text"] --> K["Teacher or AI feedback vs rubric"]
K --> C
```

## 27. Safeguarding concern workflow

Legal escalation duties must be confirmed with counsel.

```mermaid
flowchart TB
A["Report a concern button"] --> B["Case created, restricted access"]
B --> C["Safeguarding officer triage within 24h"]
C --> D{"Severity"}
D -- High --> E["Suspend access + escalate per law"]
D -- Medium --> F["Investigate + contact parent"]
D -- Low --> G["Counsel, warn, note"]
E --> H["Audit log + incident report"]
F --> H
G --> H
H --> I["Closure + policy review"]
```

## 28. Teacher analytics: heatmap, grouping, remedial pack

```mermaid
flowchart LR
A["Attempt data"] --> B["Class x concept mastery matrix"]
B --> C["Heatmap"]
C --> D["Auto-group by shared misconception"]
D --> E["One-click remedial pack: worksheet + recap + 5Q retest"]
E --> F["Assign + notify"]
B --> G["Question difficulty calibration + flag bad keys"]
B --> H["Parent meeting prep sheet"]
```

## 29. Parent engagement and wellbeing signals

```mermaid
flowchart TB
D["Weekly job"] --> A["Parent coach card, Kannada or English"]
D --> B["Smart schedule from school, tuition, sleep hours"]
D --> C["Rules: inactivity, late-night use, rapid wrong answers"]
C --> E["Gentle prompt only, no diagnosis"]
A --> H["Send via WhatsApp + app"]
F["Trusted adult invite"] --> G["Read-only access with expiry"]
I["Meeting booking + NPS survey"] --> H
```

## 30. Lead-to-admission funnel (CRM, demo, referral, chatbot)

```mermaid
flowchart LR
A["Landing page or ad"] --> B["Lead form + WhatsApp bot"]
B --> C["CRM lead"]
C --> D["Demo class booking, trial limit per phone"]
D --> E["Follow-up reminders"]
E --> F{"Converts?"}
F -- Yes --> G["Plan + payment + referral coupon"]
F -- No --> H["Nurture messages, opt-out honoured"]
G --> I["Conversion analytics"]
```

## 31. Safe gamification, streaks and exam countdown

```mermaid
flowchart TB
A["Effort events: episode, revision, fixed mistake"] --> B["Points + badges"]
A --> C["Streak with shield on quick revision"]
B --> D["Mastery map regions unlock"]
E["Exam date set"] --> F["Countdown pack: plan + mocks + weekly readiness note"]
G["Improvement vs own history"] --> H["Top improver scholarship"]
D --> I["Private to child and parent, no public leaderboard"]
```

## 32. Learning tools around the episode player

```mermaid
flowchart LR
P["Episode player"] --> L["3 levels: Simple, Standard, Challenge"]
P --> F["Formats: video, audio, illustrated text"]
P --> S["Interactive simulations"]
P --> M["Maths step checker"]
P --> G["Diagram label, drag-drop, map practice"]
P --> ST["Story mode, Classes 1 to 5"]
P --> K["Karnataka context examples, teacher verified"]
P --> W["Exam answer-writing trainer"]
P --> N["Notes, bookmarks, flashcards, mind maps"]
P --> HW["Handwritten maths photo, teacher review, OCR assist only"]
```

## 33. Language lab, voice and accessibility

```mermaid
flowchart TB
M["Student mic with parent consent"] --> A["Speech to text: Kannada, English, Hindi"]
A --> B["Pronunciation + fluency score"]
B --> C["Teacher samples and reviews"]
A --> D["Voice commands + voice doubts"]
M --> X["Audio auto-deleted after retention period"]
E["Accessibility settings"] --> F["Dyslexia font, read-aloud highlight, extra-time flag, data saver"]
```

## 34. Content trust, error reports and AI cost control

```mermaid
flowchart LR
A["Official syllabus source watcher"] --> B["Change detected"]
B --> C["Task for human editor"]
C --> D["Review + republish version"]
D --> E["Trust label: reviewer, board, year, date + AI disclosure"]
F["Student or parent reports error"] --> G["Triage"]
G --> D
G --> H["Thank-you badge"]
I["AI spend tracker"] --> J["Daily limits + cached approved answers"]
```

## 35. Low-bandwidth, prefetch and offline quiz queue

```mermaid
flowchart TB
A["App checks network"] --> B{"State"}
B -- Slow --> C["Lightweight mode: text + audio under 2 MB"]
B -- Offline --> D["Cached episodes + offline quiz queue"]
B -- Wi-Fi --> E["Prefetch next episode"]
D --> F["On reconnect: sync answers"]
F --> G["Server grades + resolves conflicts"]
```

## 36. Feature flags, view-as-user, releases and A/B tests

```mermaid
flowchart LR
A["Feature flag service"] --> B["By board, class, org, percentage"]
G["A/B tests"] --> A
C["Support agent: view as user"] --> D["Reason required + time limit + audit"]
E["Release pipeline"] --> F["Release notes + maintenance banner + rollback"]
```

## 37. Finance, terms versioning and copyright takedown

```mermaid
flowchart TB
C["Payment"] --> D["GST invoice, e-invoice if applicable"]
A["Refund approved"] --> B["Credit note"]
B --> E["Accounting export for Tally or Zoho"]
D --> E
F["Terms or policy update"] --> G["New version + forced re-accept"]
G --> H["terms_acceptance log"]
I["Copyright complaint"] --> J["Unpublish, log, notify, review"]
K["Content licence register"] --> J
```

## 38. Class 1 to 4 experience

```mermaid
flowchart TB
A["Primary profile"] --> B["Icon home + voice navigation"]
B --> C["Story-mode episode, 5 to 8 min, audio-first"]
C --> D["Picture or voice answer, drag and drop"]
D --> E["Stars, no scores shown to child"]
E --> F["Parent-assisted summary in Kannada or English"]
```

## 39. Partners, study buddy, mentors, add-ons, passport

```mermaid
flowchart LR
subgraph T["Partner tenancy"]
T1["org_id on every table"] --> T2["Partner portal"] --> T3["Revenue share report"]
end
subgraph B["Study buddy"]
B1["Teacher creates session"] --> B2["Two students join"] --> B3["Preset questions, reactions only, no free chat"]
end
subgraph M["Mentors"]
M1["Background check"] --> M2["Approved"] --> M3["Moderated session, parent visible"]
end
subgraph A["Add-ons and records"]
A1["Olympiad, holiday bridge, counselling"] --> A2["Entitlements"]
A3["Learning passport, shared on parent approval"]
end
```