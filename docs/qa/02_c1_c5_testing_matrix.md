# Vayentra Gurukula — Complete C1–C5 Testing Matrix

**Audit Date:** November 2, 2026  
**Standards Conformance:** C1–C5 Testing Lifecycle Specification, IEEE 829 Standard for Test Documentation, OWASP Top 10 Security Verification Standard.

---

## 1. Master Testing Matrix

| Phase | Category | Requirement | Test ID | Existing Coverage | Execution Status | Result | Evidence | Gap | Priority |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **C1** | C1.1 Black-Box | Valid admission for Class 1 | `VG-ADM-001` | Automated test suite | EXECUTED | **PASS** | `enrollment_batch.test.js` line 42 | None | P1 |
| **C1** | C1.1 Black-Box | Valid admission for Class 10 | `VG-ADM-002` | Automated test suite | EXECUTED | **PASS** | `enrollment_batch.test.js` line 58 | None | P1 |
| **C1** | C1.1 Black-Box | Rejection of Grade < 1 | `VG-ADM-003` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 168 | None | P1 |
| **C1** | C1.1 Black-Box | Rejection of Grade > 10 | `VG-ADM-004` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 184 | None | P1 |
| **C1** | C1.1 Black-Box | Rejection of invalid board type | `VG-ADM-005` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 200 | None | P1 |
| **C1** | C1.1 Black-Box | Unique institutional enrollment number generation | `VG-ADM-006` | Automated test suite | EXECUTED | **PASS** | `enrollment_batch.test.js` line 74 | None | P1 |
| **C1** | C1.1 Black-Box | Attendance Present status marking | `VG-ATT-001` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 52 | None | P0 |
| **C1** | C1.1 Black-Box | Attendance Absent status marking | `VG-ATT-002` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 68 | None | P0 |
| **C1** | C1.1 Black-Box | Attendance Late status marking | `VG-ATT-003` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 84 | None | P1 |
| **C1** | C1.1 Black-Box | Attendance Excused status marking without percentage penalty | `VG-ATT-004` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 142 | None | P1 |
| **C1** | C1.1 Black-Box | Duplicate attendance protection & in-place update | `VG-ATT-005` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 92 | None | P0 |
| **C1** | C1.1 Black-Box | Rejection of attendance on cancelled session | `VG-ATT-006` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 118 | None | P1 |
| **C1** | C1.1 Black-Box | Exclusion of future sessions from attendance summary | `VG-ATT-007` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 134 | None | P0 |
| **C1** | C1.2 White-Box | Schedule conflict detection unit algorithm | `VG-WHT-001` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 18 | None | P1 |
| **C1** | C1.2 White-Box | Database transaction rollback on attendance save failure | `VG-WHT-002` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 210 | None | P0 |
| **C1** | C1.2 White-Box | Bearer token validation and user hydration | `VG-WHT-003` | Automated test suite | EXECUTED | **PASS** | `security.test.js` line 48 | None | P0 |
| **C1** | C1.3 Fault Injection | Malformed JSON client payload handling | `VG-FLT-001` | Extended QA suite | EXECUTED | **FAIL** | `run_c1_c5_test_suite.js` line 244 (Returns 500 instead of 400) | Centralized error handler ignores err.status | P2 |
| **C1** | C1.3 Fault Injection | SQL Injection payload parameterization | `VG-FLT-002` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 152 | None | P0 |
| **C1** | C1.3 Fault Injection | Forged JWT token signature rejection | `VG-FLT-003` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 144 | None | P0 |
| **C1** | C1.3 Fault Injection | Non-existent student / batch 404 handling | `VG-FLT-004` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 268 | None | P1 |
| **C1** | C1.4 Workflow | Journey A: Student Admission to Batch Roster | `VG-WKF-001` | Browser headless Chrome | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` line 125 | None | P1 |
| **C1** | C1.4 Workflow | Journey B: Daily Attendance Save to Parent View | `VG-WKF-002` | Browser headless Chrome | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` line 144 | None | P0 |
| **C1** | C1.4 Workflow | Journey C: Homework Creation, Submission & Review | `VG-WKF-003` | Browser headless Chrome | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` line 161 | None | P1 |
| **C1** | C1.4 Workflow | Journey D: Assessment Scoring & Progress Report | `VG-WKF-004` | Browser headless Chrome | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` line 178 | None | P1 |
| **C1** | C1.4 Workflow | Journey E: Security Access Denial & Boundary Protection | `VG-WKF-005` | Browser headless Chrome | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` line 198 | None | P0 |
| **C2** | C2.1 Unit | `checkScheduleConflict` overlap logic | `VG-UNT-001` | Extended QA suite | EXECUTED | **PASS** | `admin.js` checkScheduleConflict | None | P1 |
| **C2** | C2.1 Unit | Zero-session attendance summary calculation (returns null, not NaN) | `VG-UNT-002` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 180 | None | P1 |
| **C2** | C2.1 Unit | React component unit tests (isolated DOM) | `VG-UNT-003` | Missing in package.json | NOT RUN | **NOT RUN** | No Vitest/Jest config found | Frontend unit test harness missing | P2 |
| **C2** | C2.2 Integration | Express APIs <-> SQLite database WAL operations | `VG-INT-001` | Automated test suite | EXECUTED | **PASS** | 132 automated tests passed | None | P0 |
| **C2** | C2.2 Integration | Teacher Attendance <-> Parent Notification dispatch | `VG-INT-002` | Automated test suite | EXECUTED | **PASS** | `parent_communication.test.js` line 84 | None | P1 |
| **C2** | C2.2 Integration | Telecom Gateway Truthful "Not Sent" Logging | `VG-INT-003` | Automated test suite | EXECUTED | **PASS** | `parent_communication.test.js` line 124 | None | P1 |
| **C2** | C2.3 System E2E | Chrome headless full-stack interaction across 5 portals | `VG-E2E-001` | Browser headless Chrome | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` | None | P1 |
| **C2** | C2.4 Regression | Full 44-suite regression test suite execution | `VG-REG-001` | Automated test suite | EXECUTED | **PASS** | `npm test` (duration: 2702ms) | None | P0 |
| **C2** | C2.5 Acceptance | Admin, Teacher, Parent, Student synthetic persona walkthroughs | `VG-UAT-001` | Manual & scripted browser | EXECUTED | **PASS** | Chrome headless visual review | None | P1 |
| **C3** | C3.1 Robustness | Concurrent attendance duplicate submissions | `VG-ROB-001` | Automated test suite | EXECUTED | **PASS** | `attendance.test.js` line 92 | None | P0 |
| **C3** | C3.1 Robustness | Database busy timeout handling (5000ms PRAGMA) | `VG-ROB-002` | Database inspection | EXECUTED | **PASS** | `database.js` line 20 | None | P1 |
| **C3** | C3.2 Load | 10 concurrent clients (50 requests) | `VG-LOD-001` | Benchmark script | EXECUTED | **PASS** | Median: 0.82ms, 0 errors | None | P2 |
| **C3** | C3.2 Load | 25 concurrent clients (100 requests) | `VG-LOD-002` | Benchmark script | EXECUTED | **PASS** | Median: 2.25ms, 0 errors | None | P2 |
| **C3** | C3.2 Load | 50 concurrent clients (100 requests) | `VG-LOD-003` | Benchmark script | EXECUTED | **PASS** | Median: 2.30ms, 0 errors | None | P2 |
| **C3** | C3.2 Load | 100 concurrent clients (200 requests) | `VG-LOD-004` | Benchmark script | EXECUTED | **PASS** | Median: 5.06ms, 0 errors | None | P2 |
| **C3** | C3.3 Stress | SQLite database lock endurance under high concurrency | `VG-STR-001` | Benchmark script | EXECUTED | **PASS** | WAL mode handled 10,000 req/s | None | P2 |
| **C3** | C3.4 Security | BOLA / IDOR Child Ownership verification | `VG-SEC-001` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 113 | None | P0 |
| **C3** | C3.4 Security | Role Escalation (Student calling Admin API) | `VG-SEC-002` | Extended QA suite | EXECUTED | **PASS** | `run_c1_c5_test_suite.js` line 129 | None | P0 |
| **C3** | C3.4 Security | Password storage using Bcrypt salt hashing | `VG-SEC-003` | Automated test suite | EXECUTED | **PASS** | `security.test.js` line 24 | None | P0 |
| **C3** | C3.5 Usability | Accessible focus rings (`outline: 3px solid var(--color-gold-primary)`) | `VG-ACC-001` | CSS audit | EXECUTED | **PASS** | `src/styles/components.css` line 38 | None | P2 |
| **C3** | C3.5 Usability | Prefers-reduced-motion CSS overrides | `VG-ACC-002` | CSS audit | EXECUTED | **PASS** | `src/styles/components.css` line 56 | None | P2 |
| **C3** | C3.6 Responsive | Zero horizontal overflow at 360, 390, 768, 1024, 1280, 1440px | `VG-RSP-001` | Chrome headless DOM audit | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` line 210 | None | P1 |
| **C3** | C3.6 Language | Zero Kannada script characters in rendered UI | `VG-LNG-001` | Chrome headless DOM audit | EXECUTED | **PASS** | `scratch/run_browser_e2e.js` line 224 | None | P1 |
| **C3** | C3.6 Language | Karnataka State Board curriculum retention | `VG-LNG-002` | Code & UI audit | EXECUTED | **PASS** | 17 verified references in `src/` | None | P1 |
| **C4** | C4.1 Frontend | React components & TypeScript build | `VG-ART-001` | Production build | EXECUTED | **PASS** | `npm run build` (718ms) | None | P1 |
| **C4** | C4.2 Backend | Express routes & security middleware | `VG-ART-002` | Source code audit | EXECUTED | **PASS** | All routes mapped in `server/routes/` | None | P0 |
| **C4** | C4.3 APIs | REST endpoints schema & status verification | `VG-ART-003` | Automated test suite | EXECUTED | **PASS** | 44 suites verified | None | P1 |
| **C4** | C4.4 Database | SQLite WAL integrity, foreign keys, migrations | `VG-ART-004` | SQLite PRAGMA audit | EXECUTED | **PASS** | Foreign keys ON, WAL enabled | None | P0 |
| **C4** | C4.5 Env & Secret | JWT Secret isolation & .env protection | `VG-ART-005` | Source code audit | EXECUTED | **PASS** | `server/middleware/auth.js` line 4 | None | P0 |
| **C5** | C5.1 Process | Test case standardization (VG-XXX-NNN) | `VG-PRC-001` | QA documentation | EXECUTED | **PASS** | Documented in `test_case_catalog.md` | None | P2 |
| **C5** | C5.3 CI/CD | GitHub Actions automated testing workflow | `VG-PRC-002` | Repository audit | NOT RUN | **FAIL** | `.github/workflows/` missing | CI pipeline not yet committed | P2 |
| **C5** | C5.5 Defect | Defect registration and tracking | `VG-PRC-003` | QA documentation | EXECUTED | **PASS** | Documented in `defect_register.md` | None | P1 |
| **C5** | C5.6 Closure | Release readiness scorecard evaluation | `VG-PRC-004` | QA documentation | EXECUTED | **PASS** | Documented in `release_readiness_scorecard.md` | None | P1 |
