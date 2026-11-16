# Vayentra Gurukula — Phase 3 Implementation Gap Report
**Module:** Public Admissions, Per-Student Annual Subscriptions (₹599/yr), and Razorpay Integration  
**Date:** November 13, 2026  
**Auditor:** Senior Full-Stack Engineer, Security & Payment Architect  

---

## 1. Existing System Audit

### 1.1 Identity & Database Architecture
- **Users & Authentication:** Bcrypt password authentication with signed JWTs. Roles: `student`, `parent`, `teacher`, `reviewer`, `admin`, `safeguarding`.
- **Learners & Memberships:** Multi-table longitudinal spine (`students`, `guardians`, `one_memberships`, `one_academic_years`, `one_student_account_links`, `one_consent_reviews`).
- **Curriculum & Access Control:** Strict server-side checks verify `m.membership_status === 'active'` and `m.entitlement_status === 'enabled'`. If entitlement is not enabled or pilot granted, access to curriculum units returns HTTP 403 `LEARNING_ACCESS_PENDING`.
- **Existing Admissions:** Only a basic enquiry contact form (`admission_enquiries` table) in `server/routes/admissions.js`. No true student admission workflow or parent identity verification.
- **Existing Payments:** A mock checkout endpoint in `server/routes/api.js` (`/checkout` and `/webhook/payment`) that stores records in `payments` with hardcoded ₹4999 plan. No Razorpay signature verification, no webhook HMAC validation, and no per-student entitlement activation.
- **Existing Frontend Routes:** Public pages (`/`, `/explore`, `/admissions`, `/app`, `/login`) rendered conditionally via URL state and popstate.

---

## 2. Implementation Gaps Identified

| Area | Current State | Required State (Phase 3) |
|---|---|---|
| **Pricing & Plan** | Hardcoded ₹4999 & ₹1899 demo plans | **Configurable ₹599 annual plan** per student (`VAYENTRA_ANNUAL_PRICE_INR` env var, default 599). |
| **Per-Student Subscriptions** | Subscription is loosely tracked on `guardians` table without expiration timestamps. | **`student_subscriptions` table** supporting multiple children per parent, tracking `valid_from`, `valid_until` (365 days), and independent subscription lifecycles. |
| **Admission Workflow** | Only generic `admission_enquiries` table | **`admissions` table** generating unique `ADM-2026-XXXXX` reference IDs, capturing student & parent details, recording verified consent (DPDP 2023 compliant), and provisioning linked accounts. |
| **Payment Gateway** | Simulated mock handler returning mock order | **Razorpay Standard Checkout** with server-side order generation, strict ₹599 amount verification, payment signature validation (`crypto.createHmac('sha256', secret)`), and webhook signature verification. |
| **Idempotency** | No duplicate payment or webhook protection | **Idempotent transaction processing** keyed on `payment_id` and `order_id`. Duplicate callbacks return existing receipts without double-charging or granting duplicate time. |
| **Entitlement Expiry** | Hardcoded entitlement status in database | **Dynamic backend evaluation**: Backend checks subscription expiry against current timestamp (`expires_at > datetime('now')`). Expired students are routed to renewal flow while retaining account login. |
| **Receipts** | No printable tax invoices / receipts | **Printable and downloadable GST tax receipts** with SAC 9992 breakdown, student ID, and transaction references. |
| **Public & Marketing Pages** | Only landing page and contact form | Complete public suite: Homepage, Pricing page, Admission form, Parent verification, Checkout, Payment result pages (Success / Pending / Failed), and Legal pages (Terms, Privacy, Cancellation & Refund). Authenticated students have no marketing clutter. |
| **Dashboards** | Family and Admin views use hardcoded finance stubs | Live Parent Fees & Subscriptions tab with per-child status and renewal triggers; Live Admin Admissions and Payments reconciliation desk. |

---

## 3. Implementation Plan & Migration Strategy

1. **Migration 017:**
   - Create `admissions` table for structured student enrolment applications.
   - Create `student_subscriptions` table for per-student 365-day validity tracking.
   - Extend `payments` table with `student_id`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `failure_reason`, and `webhook_event_id`.
   - Insert `plan-annual-599` into `plans` table with ₹599 price point.
2. **Backend Services & Routes:**
   - Dedicated `server/routes/payments.js` for order creation, signature verification, webhook processing, receipt generation, and renewal.
   - Enhanced `server/routes/admissions.js` supporting application submission, parent verification, and admin workflow.
3. **Frontend Pages & Components:**
   - `src/views/PricingPage.tsx`
   - `src/views/CheckoutPage.tsx`
   - `src/views/PaymentResultPage.tsx`
   - `src/views/LegalPages.tsx` (Terms, Privacy, Refund)
   - Enhanced `AdmissionsPage.tsx`, `ParentView.tsx`, `StudentView.tsx`, and `AdminView.tsx`.
4. **Testing Suite:**
   - Add comprehensive tests in `server/tests/phase3_payments_admissions.test.js`.
   - Ensure all 226 existing tests pass with 0 regressions.
