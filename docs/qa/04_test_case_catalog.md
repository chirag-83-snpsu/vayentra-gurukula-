# Vayentra Gurukula — Comprehensive Test Case Catalog

**Standard Format:** IEEE 829 Standard Test Identifier Pattern  
**ID Schema:** `VG-[CATEGORY]-[SEQUENCE_NUMBER]` (e.g. `VG-AUT-001`, `VG-ATT-001`)

---

## 1. Authentication & Security Test Cases (`VG-SEC-XXX`, `VG-AUT-XXX`)

### `VG-AUT-001`: Verified Password Login — Admin Account
- **Requirement Reference:** REQ-17 (Authentication & RBAC)
- **Objective:** Verify successful authentication of system administrator with bcrypt hashed password.
- **Preconditions:** User `admin@vayentra.org` exists in `users` table with bcrypt hash for `Gurukula@2026`.
- **Test Data:** `{ "email": "admin@vayentra.org", "password": "Gurukula@2026" }`
- **Execution Steps:** Send POST request to `/api/v1/auth/login` with test data.
- **Expected Result:** HTTP 200 OK, returns signed Bearer JWT token, user object with `role: "admin"`.
- **Actual Result:** HTTP 200 OK, JWT returned with 24-hour expiration.
- **Pass/Fail Status:** PASS

### `VG-AUT-002`: Rejection of Incorrect Password
- **Requirement Reference:** REQ-17 (Authentication & RBAC)
- **Objective:** Ensure invalid password attempts are rejected with HTTP 401 without timing leaks.
- **Test Data:** `{ "email": "admin@vayentra.org", "password": "WrongPassword!2026" }`
- **Expected Result:** HTTP 401 Unauthorized, `{ "code": "INVALID_CREDENTIALS" }`.
- **Actual Result:** HTTP 401 Unauthorized.
- **Pass/Fail Status:** PASS

### `VG-SEC-001`: Broken Object-Level Authorization (BOLA/IDOR) on Student Records
- **Requirement Reference:** REQ-09, REQ-17 (Child Privacy & Authorization)
- **Objective:** Ensure authenticated guardian cannot query progress, attendance, or dashboard of an unlinked student.
- **Preconditions:** Guardian `par-001` logged in; student `stu-alien-mvz57c6r` belongs to unlinked guardian `par-alien-mvz57c6r`.
- **Execution Steps:** Send GET `/api/v1/attendance/students/stu-alien-mvz57c6r/summary` with `par-001` Bearer token.
- **Expected Result:** HTTP 403 Forbidden, `{ "code": "FORBIDDEN" }`.
- **Actual Result:** HTTP 403 Forbidden.
- **Pass/Fail Status:** PASS

### `VG-SEC-002`: Privilege Escalation Prevention — Student Role
- **Requirement Reference:** REQ-17 (RBAC)
- **Objective:** Ensure student account cannot access administrator batch management endpoints.
- **Preconditions:** Student `student@vayentra.org` authenticated with valid Bearer token.
- **Execution Steps:** Send GET `/api/v1/admin/batches` with student token.
- **Expected Result:** HTTP 403 Forbidden.
- **Actual Result:** HTTP 403 Forbidden.
- **Pass/Fail Status:** PASS

### `VG-SEC-003`: Forged JWT Signature Rejection
- **Requirement Reference:** REQ-17 (Session Security)
- **Objective:** Ensure counterfeit JWT signed with invalid secret key is rejected.
- **Test Data:** JWT payload `{ userId: "usr-admin-01", role: "admin" }` signed with secret `"fake_key_999"`.
- **Expected Result:** HTTP 401 Unauthorized, `{ "code": "INVALID_TOKEN" }`.
- **Actual Result:** HTTP 401 Unauthorized.
- **Pass/Fail Status:** PASS

---

## 2. Student Enrollment & Batch Allocation Test Cases (`VG-ENR-XXX`, `VG-BAT-XXX`)

### `VG-ENR-001`: Valid Admission for Primary Student (Class 1)
- **Requirement Reference:** REQ-02 (Admissions)
- **Test Data:** `{ "name": "Aditi Rao", "grade": 1, "board": "CBSE", "guardianMode": "existing", "guardianId": "par-001" }`
- **Execution Steps:** Send POST `/api/v1/admin/students` with Admin token.
- **Expected Result:** HTTP 201 Created, assigned institutional enrollment number format `VG-2026-XXXX`.
- **Actual Result:** HTTP 201 Created.
- **Pass/Fail Status:** PASS

### `VG-ENR-002`: Boundary Value Rejection — Grade 0
- **Requirement Reference:** REQ-02 (Input Validation)
- **Test Data:** `{ "name": "Test Child", "grade": 0, "board": "CBSE", "guardianMode": "existing", "guardianId": "par-001" }`
- **Expected Result:** HTTP 400 Bad Request, message indicating grade must be between 1 and 10.
- **Actual Result:** HTTP 400 Bad Request.
- **Pass/Fail Status:** PASS

### `VG-ENR-003`: Boundary Value Rejection — Grade 11
- **Requirement Reference:** REQ-02 (Input Validation)
- **Test Data:** `{ "name": "Senior Child", "grade": 11, "board": "CBSE", "guardianMode": "existing", "guardianId": "par-001" }`
- **Expected Result:** HTTP 400 Bad Request.
- **Actual Result:** HTTP 400 Bad Request.
- **Pass/Fail Status:** PASS

### `VG-BAT-001`: Timetable Schedule Conflict Detection — Overlapping Time on Common Day
- **Requirement Reference:** REQ-07 (Scheduling Conflict Prevention)
- **Objective:** Verify conflict detector flags overlapping batches for the same room or faculty.
- **Test Data:** Batch A: Mon/Wed 17:30–18:30; Batch B: Wed/Fri 18:00–19:00.
- **Expected Result:** `checkScheduleConflict(BatchA, BatchB) === true`.
- **Actual Result:** Returns `true`.
- **Pass/Fail Status:** PASS

### `VG-BAT-002`: Touching Boundary Schedule Check (Non-Conflicting)
- **Requirement Reference:** REQ-07 (Scheduling Conflict Prevention)
- **Objective:** Ensure back-to-back batches (e.g. 17:00–18:00 and 18:00–19:00) do NOT trigger a false conflict.
- **Expected Result:** `checkScheduleConflict(BatchA, BatchB) === false`.
- **Actual Result:** Returns `false`.
- **Pass/Fail Status:** PASS

### `VG-BAT-003`: Duplicate Batch Enrollment Protection
- **Requirement Reference:** REQ-06 (Batch Allocation)
- **Objective:** Ensure student already enrolled in batch cannot be double-enrolled.
- **Execution Steps:** POST `/api/v1/admin/batches/batch-7a-cbse-math/enroll` with `{ "studentId": "stu-001" }`.
- **Expected Result:** HTTP 409 Conflict, `{ "code": "ALREADY_ENROLLED" }`.
- **Actual Result:** HTTP 409 Conflict.
- **Pass/Fail Status:** PASS

---

## 3. Persistent Attendance Test Cases (`VG-ATT-XXX`)

### `VG-ATT-001`: Faculty Attendance Submission — Batch Roster
- **Requirement Reference:** REQ-08 (Attendance Marking)
- **Objective:** Teacher submits attendance statuses (`present`, `absent`, `late`, `excused`) for scheduled session.
- **Execution Steps:** POST `/api/v1/attendance/sessions/ses-7a-1014/mark` with attendance array.
- **Expected Result:** HTTP 200 OK, records saved in `attendance_records`, audit logs created in `attendance_audit_logs`.
- **Actual Result:** HTTP 200 OK.
- **Pass/Fail Status:** PASS

### `VG-ATT-002`: Attendance In-Place Update (Duplicate Protection)
- **Requirement Reference:** REQ-08 (Duplicate Protection)
- **Objective:** Resubmitting attendance updates existing records in place without duplicating database rows.
- **Execution Steps:** Submit identical student attendance with updated remarks twice.
- **Expected Result:** Number of records in `attendance_records` remains unchanged; `updatedCount` increments.
- **Actual Result:** HTTP 200 OK, 0 duplicate rows created.
- **Pass/Fail Status:** PASS

### `VG-ATT-003`: Cancelled Session Protection
- **Requirement Reference:** REQ-08 (Integrity)
- **Objective:** Rejection of attendance submission for sessions marked `cancelled`.
- **Execution Steps:** POST `/api/v1/attendance/sessions/ses-7a-cancelled/mark`.
- **Expected Result:** HTTP 400 Bad Request, session is cancelled.
- **Actual Result:** HTTP 400 Bad Request.
- **Pass/Fail Status:** PASS

### `VG-ATT-004`: Attendance Calculation Formula Integrity
- **Requirement Reference:** REQ-09 (Parent Visibility)
- **Objective:** Verify attendance percentage = `(present + late) / (total_completed_sessions - excused) * 100`.
- **Preconditions:** Rohan Sharma has 3 present, 1 absent, 1 excused out of 5 completed sessions.
- **Expected Result:** Attended = 3, eligible = 4, percentage = 75.0%.
- **Actual Result:** Returns `percentage: 75`.
- **Pass/Fail Status:** PASS

---

## 4. Homework & Weekly Concept Assessments (`VG-HWK-XXX`, `VG-ASM-XXX`)

### `VG-HWK-001`: Teacher Assignment Authoring with Learning Resources
- **Requirement Reference:** REQ-10 (Homework)
- **Objective:** Faculty creates batch assignment with due date and concept flashcard link.
- **Expected Result:** HTTP 201 Created, stored in `homework_assignments`.
- **Actual Result:** HTTP 201 Created.
- **Pass/Fail Status:** PASS

### `VG-HWK-002`: Student Submission & Evaluation Cycle
- **Requirement Reference:** REQ-10 (Submissions)
- **Objective:** Student submits homework response; teacher assigns score (95/100) and structured feedback.
- **Expected Result:** Stored in `homework_submissions`, status updated to `'reviewed'`.
- **Actual Result:** Verified in `homework_assessment.test.js`.
- **Pass/Fail Status:** PASS

### `VG-ASM-001`: Weekly Assessment Score & Remedial Recommendation
- **Requirement Reference:** REQ-11 (Assessments)
- **Objective:** Teacher records 44/50 score, revision tags (`['Subtraction of double negative numbers']`), and next learning recommendation.
- **Expected Result:** Stored in `assessment_scores`, reflected in parent dashboard.
- **Actual Result:** Verified in `homework_assessment.test.js`.
- **Pass/Fail Status:** PASS

---

## 5. Parent Communication & Notifications (`VG-COM-XXX`, `VG-RPT-XXX`)

### `VG-COM-001`: Teacher Attendance Trigger — Absence Alerts
- **Requirement Reference:** REQ-14 (Notifications)
- **Objective:** Absence alerts queued ONLY after teacher explicitly commits attendance.
- **Expected Result:** Notification record inserted with status `'not_sent'` (unconfigured credentials) or `'queued'`.
- **Actual Result:** Verified in `parent_communication.test.js`.
- **Pass/Fail Status:** PASS

### `VG-COM-002`: Truthful Notification Status (No False Success)
- **Requirement Reference:** REQ-14 (Truthful Systems)
- **Objective:** System logs truthful status reason when telecom gateway credentials are unconfigured.
- **Expected Result:** Status `'not_sent'`, statusReason explaining missing API keys.
- **Actual Result:** Verified in `parent_communication.test.js`.
- **Pass/Fail Status:** PASS

### `VG-RPT-001`: Printable Report Card Generation
- **Requirement Reference:** REQ-15 (Report Cards)
- **Objective:** Generates comprehensive term report card with genuine calculated attendance and exam marks.
- **Expected Result:** Dynamic report card renders in modal, print CSS formats for clean A4 printing.
- **Actual Result:** Verified in browser Chrome headless review.
- **Pass/Fail Status:** PASS

---

## 6. Mobile Responsiveness & Accessibility (`VG-RSP-XXX`, `VG-ACC-XXX`)

### `VG-RSP-001`: Viewport Audit — 360px Compact Mobile
- **Requirement Reference:** REQ-20 (Mobile-First UX)
- **Objective:** Ensure no horizontal scrolling or clipped controls on 360px viewports (Samsung Galaxy S8/S9 tier).
- **Execution Steps:** Render `ParentView` and `TeacherView` at 360x740 via Chrome headless CDP.
- **Expected Result:** `document.documentElement.scrollWidth <= window.innerWidth`.
- **Actual Result:** `scrollWidth === 360px`, zero horizontal overflow detected.
- **Pass/Fail Status:** PASS

### `VG-LNG-001`: English-Only Interface Script Purity
- **Requirement Reference:** REQ-20 (Interface Language)
- **Objective:** Ensure zero Kannada Unicode code points (`U+0C80`–`U+0CFF`) appear in rendered DOM.
- **Execution Steps:** Query DOM innerText regex match across all 7 portals.
- **Expected Result:** Regex match returns `null`.
- **Actual Result:** ZERO Kannada characters detected.
- **Pass/Fail Status:** PASS

### `VG-LNG-002`: Karnataka State Board Functionality Retention
- **Requirement Reference:** REQ-01, REQ-02, REQ-15 (Curriculum Integrity)
- **Objective:** Verify Karnataka State Board (`STATE_KARNATAKA`) can be selected in admissions, batches, and report cards.
- **Expected Result:** State Board options active and fully selectable across all admin and public dropdowns.
- **Actual Result:** 17 active code references verified and operational.
- **Pass/Fail Status:** PASS
