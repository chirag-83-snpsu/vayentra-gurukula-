# Vayentra Gurukula — Automated Testing & CI/CD Architecture Recommendation

**Date:** November 2, 2026  
**Author:** Senior Full-Stack Test Engineer & DevOps Quality Specialist

---

## 1. Proposed Test Architecture & Directory Structure

To support all five levels of the testing lifecycle (Unit, Integration, System E2E, Regression, and Acceptance), the recommended directory reorganization is:

```
vayentra-gurukula/
├── .github/
│   └── workflows/
│       ├── ci.yml                 # Automated PR & Push test/build pipeline
│       └── nightly_regression.yml # Nightly full E2E & security audit
├── server/
│   └── tests/
│       ├── unit/                  # Isolated pure logic & helper tests
│       │   ├── schedule_conflict.test.js
│       │   └── attendance_math.test.js
│       ├── integration/           # Express API + SQLite integration tests
│       │   ├── auth_security.test.js
│       │   ├── attendance_roster.test.js
│       │   ├── homework_assessments.test.js
│       │   └── parent_reporting.test.js
│       └── fixtures/              # Isolated test databases & synthetic seeds
│           └── test_seed.sql
├── src/
│   └── tests/
│       ├── setup.ts               # Jest-DOM matchers & mock setup
│       ├── components/            # React component unit tests (Vitest)
│       │   ├── AttendanceRegister.test.tsx
│       │   ├── ReportCardModal.test.tsx
│       │   └── Navbar.test.tsx
│       └── views/                 # View-level integration unit tests
│           └── ParentView.test.tsx
└── e2e/                           # Browser-based automation tests (Playwright)
    ├── playwright.config.ts
    ├── journeys/
    │   ├── journey_a_admissions.spec.ts
    │   ├── journey_b_attendance.spec.ts
    │   ├── journey_c_homework.spec.ts
    │   └── journey_d_parent_reports.spec.ts
    └── visual/
        └── responsive_viewports.spec.ts
```

---

## 2. Tooling Recommendations

| Testing Level | Recommended Framework | Execution Rationale |
| :--- | :--- | :--- |
| **Backend Integration & APIs** | Node.js Test Runner (`node:test`, `node:assert`) | Built into Node.js runtime, zero overhead, fast execution (132 tests run in 2.7s), zero external dependency vulnerabilities. |
| **Frontend Component Unit** | Vitest + `@testing-library/react` | Natively integrates with existing Vite configuration (`vite.config.ts`), provides fast in-memory JSDOM rendering, tests accessible queries (`getByRole`, `getByLabelText`). |
| **End-to-End Browser Testing** | Playwright | Multi-browser automation (Chromium, WebKit, Firefox), native mobile viewport emulation (360px, 390px), automatic network interception, headless trace recordings. |
| **Performance & Load** | k6 or Node.js concurrent load harness | Scriptable concurrent HTTP requests measuring median, p95, RPS, and SQLite busy lock timeouts. |

---

## 3. GitHub Actions CI/CD Pipeline Specification

Create file `.github/workflows/ci.yml`:

```yaml
name: Vayentra Gurukula CI Pipeline

on:
  push:
    branches: [ main, feature/* ]
  pull_request:
    branches: [ main ]

jobs:
  validate-and-test:
    name: Build, Typecheck & Automated Test Suite
    runs-on: ubuntu-latest
    timeout-minutes: 15

    env:
      NODE_ENV: test
      PORT: 5001
      JWT_SECRET: ci_test_secret_vayentra_gurukula_2026

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 22.x
        uses: actions/setup-node@v4
        with:
          node-version: 22.x

      - name: Install pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 11.25.0

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Production TypeScript & Vite Build
        run: pnpm run build

      - name: Run Backend Integration & Security Test Suite
        run: pnpm run test

      - name: Run Extended C1-C5 Quality & Robustness Suite
        run: node --test server/tests/*.test.js
```

---

## 4. Database Isolation Strategy for Tests

To prevent test execution from altering development data in `server/db/vayentra.sqlite`:

1. **In-Memory or Ephemeral SQLite for Tests:**
   In `server/db/database.js`:
   ```javascript
   const isTest = process.env.NODE_ENV === 'test';
   const DB_PATH = isTest 
     ? path.join(__dirname, 'vayentra.test.sqlite')
     : path.join(__dirname, 'vayentra.sqlite');
   ```
2. **Transaction Rollbacks in Test Suites:**
   Wrap isolated test assertions in temporary SQLite transactions that rollback after execution:
   ```javascript
   beforeEach(() => db.exec('BEGIN TRANSACTION;'));
   afterEach(() => db.exec('ROLLBACK;'));
   ```
3. **Pre-Migration Backups:**
   Retain automated timestamped backups before applying any DDL migrations (`vayentra.sqlite.backup-mig00X-<timestamp>`).

---

## 5. Regression Automation Schedule

| Execution Tier | Trigger | Test Suites Run | Target Duration | Blocking Status |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: PR Gate** | Every Pull Request | Backend integration tests + Vite build + TypeScript check | < 1 minute | Hard blocker to merge |
| **Tier 2: Nightly Build** | Every 24 hours | Full E2E Playwright journeys + Load benchmarks + OWASP security checks | < 5 minutes | Alert to engineering Slack/Email |
| **Tier 3: Release Gate** | Git Tag / Production Tag | 100% full regression suite + headless multi-viewport screenshot verification | < 10 minutes | Mandatory sign-off for deployment |
