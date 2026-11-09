# Vayentra Gurukula — Confirmed Defect Register & Vulnerability Catalog

**Date:** November 2, 2026  
**Auditor:** Senior Full-Stack Test Engineer & Security Testing Specialist  
**Classification Standard:**  
- **P0 — Critical:** Security bypass, unauthorized student data exposure, data corruption, or severe safety failure.  
- **P1 — High:** Core tuition workflow failure, attendance calculation error, broken admission, or incorrect academic standing.  
- **P2 — Medium:** Secondary workflow defect, misleading error response, performance latency, or missing test harness.  
- **P3 — Low:** Cosmetic layout flaw, non-blocking copy inconsistency, or minor development ergonomics issue.

---

## 1. Confirmed Defects

### `DEF-001`: Centralized Error Handler Hardcodes HTTP 500 on Malformed JSON Request Bodies
- **Severity:** P2 (Medium)
- **Affected Module:** `server/index.js` (Express Gateway Middleware)
- **Steps to Reproduce:**
  1. Send a POST request to `/api/v1/auth/login` or any API endpoint with an invalid JSON body:  
     `curl -X POST http://localhost:5001/api/v1/auth/login -H "Content-Type: application/json" -d '{ "email": "test", broken_json: '`
  2. Inspect the HTTP status code and response payload.
- **Expected Behavior:** Express body-parser syntax error should return `HTTP 400 Bad Request` with `{ "code": "INVALID_JSON_BODY", "message": "Malformed JSON payload in request body." }`.
- **Actual Behavior:** Returns `HTTP 500 Internal Server Error` with `{ "code": "INTERNAL_SERVER_ERROR", "message": "An unexpected server error occurred." }`.
- **Evidence:** Automated test `VG-FLT-001` in `scratch/run_c1_c5_test_suite.js` line 244 failed with:  
  `AssertionError: 500 !== 400`.
- **Likely Cause:** In `server/index.js` line 78:
  ```javascript
  app.use((err, req, res, next) => {
    console.error('[Vayentra API Error]:', err);
    res.status(500).json({ code: 'INTERNAL_SERVER_ERROR', ... });
  });
  ```
  The handler does not inspect `err.status` or `err.statusCode`.
- **Proposed Remediation:**
  Update error handler to check status:
  ```javascript
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    code: statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred.'
  });
  ```

---

### `DEF-002`: Multi-Class Seed Coupling / Test Data Assumption
- **Severity:** P1 (High)
- **Affected Module:** `server/db/migrations.js` (Migration `003_persistent_student_attendance`)
- **Steps to Reproduce:**
  1. Inspect the seeded students in SQLite table `students`:
     ```sql
     SELECT id, name, guardian_id FROM students WHERE id IN ('stu-001', 'stu-diya', 'stu-kavya', 'stu-rohan', 'stu-zoya');
     ```
  2. Notice all classmates share `guardian_id = 'par-001'`.
  3. Attempting to test BOLA by having `guardian@vayentra.org` query `stu-diya` unexpectedly succeeds because Diya is assigned to `par-001`.
- **Expected Behavior:** Each sample student from a distinct family should be associated with an independent guardian record (e.g. `par-diya`, `par-kavya`).
- **Actual Behavior:** All initial sample students are children of Venkatesh Prasad (`par-001`), preventing authorization boundary testing without manually injecting alien records.
- **Evidence:** SQLite query output showed `('stu-diya', 'Diya Patel', 'par-001')`.
- **Likely Cause:** Migration 003 used `const guardianId = guardian ? guardian.id : 'par-001'` when looping through sample classmates.
- **Proposed Remediation:**
  Create dedicated guardian records for each sample student in a seed migration:
  `INSERT INTO guardians (id, user_id, ...) VALUES ('par-diya', 'usr-guardian-diya', ...)`.

---

### `DEF-003`: Absence of React Component Unit Test Harness
- **Severity:** P2 (Medium)
- **Affected Module:** `package.json`, `src/components/`, `src/views/`
- **Steps to Reproduce:**
  1. Inspect `package.json` scripts:
     `"test": "NODE_ENV=test node --test --test-concurrency=1 server/tests/*.test.js"`
  2. Attempt to run component unit tests on `AttendanceRegister.tsx` or `ParentView.tsx` without launching the entire server and Chrome browser.
- **Expected Behavior:** Fast, isolated unit test execution for React components, checking prop updates, accessible rendering, and state hooks.
- **Actual Behavior:** No component unit testing framework (Vitest, Jest, or React Testing Library) is installed or configured.
- **Evidence:** `package.json` devDependencies lack `@testing-library/react` and `vitest`.
- **Likely Cause:** Development focused on Node.js backend test runner and end-to-end integration.
- **Proposed Remediation:**
  Install `vitest`, `jsdom`, `@testing-library/react`, and configure `vite.config.ts` for headless component testing.

---

### `DEF-004`: In-Memory Mobile OTP Storage Lacks Persistence & Scalability
- **Severity:** P2 (Medium)
- **Affected Module:** `server/routes/auth.js` line 10
- **Steps to Reproduce:**
  1. Send an OTP request via `POST /api/v1/auth/otp/send` for a mobile number.
  2. Restart the Node.js server process.
  3. Attempt to verify the OTP via `POST /api/v1/auth/otp/verify`.
- **Expected Behavior:** The valid OTP should remain verifiable within its 5-minute TTL regardless of server process restarts or load balancing.
- **Actual Behavior:** Verification fails because `otpChallenges = new Map()` was wiped from process RAM.
- **Evidence:** Source code analysis of `server/routes/auth.js`:
  ```javascript
  // In-memory challenge store for mobile OTP with TTL
  const otpChallenges = new Map();
  ```
- **Likely Cause:** Quick prototype implementation for mobile OTP authentication.
- **Proposed Remediation:**
  Create a persistent SQLite table `otp_challenges` (`mobile`, `code_hash`, `expires_at`, `attempts`) with automatic expiry checks.

---

### `DEF-005`: Missing Continuous Integration (CI) Workflow Automation
- **Severity:** P3 (Low)
- **Affected Module:** `.github/workflows/`
- **Steps to Reproduce:**
  1. Inspect `.github/workflows/` directory in the repository.
  2. Confirm no GitHub Actions configuration file exists.
- **Expected Behavior:** Every push and pull request automatically triggers `npm test` and `npm run build` on GitHub runners.
- **Actual Behavior:** Tests and builds must be initiated manually on developer machines.
- **Evidence:** `ls .github/workflows` returns directory not found.
- **Proposed Remediation:**
  Commit `.github/workflows/ci.yml` defining an automated test and build pipeline on Ubuntu runners with Node.js 22+.

---

## 2. Suspected Gaps & Architectural Technical Debt

| Item ID | Description | Severity | Likelihood | Recommended Action |
| :--- | :--- | :-: | :-: | :--- |
| **SUSP-001** | **Local File Attachment Storage**: Homework submission attachments currently store URLs without a cloud object storage backend (e.g. AWS S3 or Cloudflare R2). | P2 | High | Add cloud object storage provider interface with presigned URLs for large student PDF/image uploads. |
| **SUSP-002** | **Simulated Payment Gateway**: The `/api/v1/checkout` and webhook endpoints simulate Razorpay capture rather than validating genuine cryptographic webhook HMAC signatures. | P2 | Medium | Implement Razorpay SDK with SHA256 HMAC webhook verification when live billing is enabled. |
| **SUSP-003** | **AI Doubt Tutoring Live Model Integration**: Student doubt submissions return canned explanations rather than querying the Google Gemini Live API. | P2 | High | Connect `@google/genai` or Gemini REST API with syllabus guardrails. |
