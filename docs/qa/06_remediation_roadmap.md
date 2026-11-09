# Vayentra Gurukula — Prioritized Engineering Remediation Roadmap

**Date:** November 2, 2026  
**Auditor:** Principal Software QA Architect & Senior Full-Stack Test Engineer  
**Strategy:** Phased remediation structured into P0 (Release Blockers), P1 (Core Operations), P2 (Workflows & Quality), and P3 (Cosmetic & Maintenance).

---

## 1. P0 Priority: Security, Privacy & Critical Data Integrity

*Note: Zero P0 defects were identified during this audit. The system enforces strict bcrypt password hashing, JWT signature verification, SQLite foreign key constraints, and multi-tenant child ownership authorization.*

### Proactive P0 Security Hardening Action
- **Action P0-1: Strict Production JWT Secret Enforcement**
  - **Affected Files:** `server/middleware/auth.js` line 4–8
  - **Objective:** Ensure the backend refuses to start in `NODE_ENV=production` if `JWT_SECRET` is unset or defaults to the development string.
  - **Dependencies:** Environment deployment configs.
  - **Acceptance Criteria:** `node server/index.js` throws a fatal error and terminates with exit code 1 if `NODE_ENV === 'production'` and `process.env.JWT_SECRET` is missing.
  - **Verification Test:** `npm test` security suite step 5.

---

## 2. P1 Priority: Core Tuition Operations & Academic Integrity

### Action P1-1: Decouple Sample Student Cohorts from Shared Guardian Record (`DEF-002`)
- **Affected Files:** `server/db/migrations.js` (Migration `003_persistent_student_attendance`)
- **Problem Statement:** Classmates `stu-diya`, `stu-kavya`, `stu-rohan`, and `stu-zoya` were seeded under `par-001`, making automated BOLA tests reliant on ad-hoc test-generated alien accounts.
- **Remediation Steps:**
  1. Add migration `006_decouple_sample_guardians.sql` to assign distinct guardian profiles (`par-diya`, `par-kavya`, `par-rohan`, `par-zoya`) with dedicated parent logins.
  2. Update database seed scripts to reflect multi-family enrollment.
- **Dependencies:** None.
- **Acceptance Criteria:** Querying `SELECT DISTINCT guardian_id FROM students WHERE grade = 7` returns 5 unique guardians.
- **Verification Test:** `npm test` (Phase 3 attendance and security suites).

---

## 3. P2 Priority: Workflow Resilience, Performance & Testing Automation

### Action P2-1: Refactor Centralized Error Handler to Respect Client Error Statuses (`DEF-001`)
- **Affected Files:** `server/index.js` lines 78–84
- **Problem Statement:** When `express.json()` fails to parse a malformed request body, it passes an error with `err.status = 400`, but the global handler returns HTTP 500.
- **Remediation Steps:**
  ```javascript
  app.use((err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500;
    if (statusCode >= 500) {
      console.error('[Vayentra API Internal Error]:', err);
    }
    res.status(statusCode).json({
      code: statusCode === 400 ? 'BAD_REQUEST' : 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.'
    });
  });
  ```
- **Dependencies:** Express body-parser.
- **Acceptance Criteria:** Sending malformed JSON returns HTTP 400 Bad Request.
- **Verification Test:** `scratch/run_c1_c5_test_suite.js` test `VG-FLT-001`.

### Action P2-2: Transition Mobile OTP Storage to Persistent SQLite Table (`DEF-004`)
- **Affected Files:** `server/routes/auth.js` lines 9–11, `server/db/database.js`
- **Problem Statement:** Mobile OTP challenges stored in an in-memory `Map()` are lost across restarts or horizontal scaling.
- **Remediation Steps:**
  1. Create `CREATE TABLE IF NOT EXISTS otp_challenges (mobile TEXT PRIMARY KEY, code_hash TEXT, expires_at TEXT, attempts INTEGER);`.
  2. Implement atomic insert and verify operations with SQLite timestamps.
- **Dependencies:** SQLite.
- **Acceptance Criteria:** OTP generated in one process instance can be verified in another before expiry.
- **Verification Test:** Automated OTP test suite.

### Action P2-3: Implement React Component Unit Testing Harness (`DEF-003`)
- **Affected Files:** `package.json`, `vite.config.ts`, `src/tests/`
- **Problem Statement:** No headless React DOM testing framework exists for unit testing isolated components.
- **Remediation Steps:**
  1. Install `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event`.
  2. Configure `vitest.config.ts` with `environment: 'jsdom'`.
  3. Add script `"test:components": "vitest run"`.
- **Dependencies:** Vitest, JSDOM.
- **Acceptance Criteria:** `npm run test:components` executes unit tests for `AttendanceRegister`, `ReportCardModal`, and `Navbar` within < 2 seconds.
- **Verification Test:** New component test runner.

---

## 4. P3 Priority: Cosmetic Polishing & CI/CD Tooling

### Action P3-1: Commit Continuous Integration Workflow (`DEF-005`)
- **Affected Files:** `.github/workflows/ci.yml`
- **Remediation Steps:**
  Create GitHub Actions workflow running:
  - Checkout repository
  - Setup Node.js 22.x
  - Install dependencies (`pnpm install --frozen-lockfile`)
  - Run `npm test`
  - Run `npm run build`
- **Dependencies:** GitHub repository settings.
- **Acceptance Criteria:** Green CI checkmark on all pull requests.
- **Verification Test:** Push to branch and observe GitHub Action run.

---

## 5. Timeline & Milestone Schedule

```
Sprint 1 (Days 1–2): P2-1 (Error Handler Fix) + P1-1 (Guardian Seed Decoupling)
Sprint 2 (Days 3–4): P2-2 (Persistent OTP Table) + P3-1 (GitHub Actions CI)
Sprint 3 (Days 5–7): P2-3 (Vitest Component Unit Testing) + Production Staging Deployment
```
