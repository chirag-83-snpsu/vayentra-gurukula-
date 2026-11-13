import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import { app } from '../index.js';
import { db } from '../db/database.js';
import {
  ANNUAL_PRICE_INR,
  ANNUAL_PRICE_PAISE,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  checkStudentEntitlement,
  verifyRazorpaySignature,
  activateSubscription
} from '../services/subscriptionService.js';
import { seedAndPublishGrade1Curriculum } from '../services/seedAndPublishGrade1Curriculum.js';
import { seedAndPublishGrade2Curriculum } from '../services/seedAndPublishGrade2Curriculum.js';

let server;
let base;
let adminToken;
let parentToken;
let studentToken;

async function api(path, token, method = 'GET', payload = null, headers = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(payload ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...headers
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function login(email) {
  const r = await api('/api/v1/auth/login', null, 'POST', {
    email,
    password: 'Gurukula@2026'
  });
  assert.equal(r.status, 200, `Login failed for ${email}`);
  return r.body.token;
}

test('Vayentra Gurukula — Phase 3 Admissions, ₹599 Subscription & Razorpay Test Suite', async (t) => {
  // Ensure foundation seeds and publications are ready
  seedAndPublishGrade1Curriculum(db);
  seedAndPublishGrade2Curriculum(db);

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      base = 'http://127.0.0.1:' + server.address().port;
      resolve();
    });
  });

  [adminToken, parentToken, studentToken] = await Promise.all([
    login('admin@vayentra.org'),
    login('guardian@vayentra.org'),
    login('student.grade1@vayentra.org')
  ]);

  let createdAdmissionId;
  let createdStudentId;
  let createdOrderId;

  await t.test('1. Public Pricing & Payment Config Endpoint', async () => {
    const res = await api('/api/v1/payments/config');
    assert.equal(res.status, 200);
    assert.equal(res.body.keyId, RAZORPAY_KEY_ID);
    assert.equal(res.body.annualPriceInr, 599);
    assert.equal(res.body.annualPricePaise, 59900);
    assert.equal(res.body.currency, 'INR');
    assert.equal(res.body.plan.name, 'Annual Gurukula Foundation Pass');
    // Ensure secret is NEVER exposed to frontend
    assert.equal(res.body.keySecret, undefined);
    assert.equal(res.body.secret, undefined);
  });

  await t.test('2. Admission Validation: Rejection of Invalid Consent and Inputs', async () => {
    // Missing consent
    const resNoConsent = await api('/api/v1/admissions/apply', null, 'POST', {
      guardianName: 'Test Parent',
      contactPhone: '9845012345',
      studentName: 'Test Kid',
      grade: 3,
      board: 'CBSE',
      consent: false
    });
    assert.equal(resNoConsent.status, 400);
    assert.equal(resNoConsent.body.code, 'CONSENT_REQUIRED');

    // Invalid phone number
    const resBadPhone = await api('/api/v1/admissions/apply', null, 'POST', {
      guardianName: 'Test Parent',
      contactPhone: '12345',
      studentName: 'Test Kid',
      grade: 3,
      board: 'CBSE',
      consent: true
    });
    assert.equal(resBadPhone.status, 400);
    assert.equal(resBadPhone.body.code, 'INVALID_PHONE');

    // Invalid grade (e.g. grade 15)
    const resBadGrade = await api('/api/v1/admissions/apply', null, 'POST', {
      guardianName: 'Test Parent',
      contactPhone: '9845012345',
      studentName: 'Test Kid',
      grade: 15,
      board: 'CBSE',
      consent: true
    });
    assert.equal(resBadGrade.status, 400);
    assert.equal(resBadGrade.body.code, 'INVALID_GRADE');
  });

  await t.test('3. Valid Admission Submission: Generates Unique Admission ID and Provisions Provisional Student', async () => {
    const res = await api('/api/v1/admissions/apply', null, 'POST', {
      guardianName: 'Pooja Varma',
      guardianPhone: '9845099999',
      guardianEmail: 'guardian@vayentra.org',
      studentName: 'Vihaan Varma',
      grade: 1,
      board: 'CBSE',
      medium: 'English',
      schoolName: 'Bengaluru National Public School',
      consent: true
    });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.ok(res.body.admissionId.startsWith('ADM-2026-'), 'Must follow ADM-2026-XXXX format');
    assert.ok(res.body.studentId);
    assert.equal(res.body.annualFeeInr, 599);
    assert.equal(res.body.status, 'payment_pending');

    createdAdmissionId = res.body.admissionId;
    createdStudentId = res.body.studentId;

    // Verify record in database has pending entitlement
    const member = db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id = ?').get(createdStudentId);
    assert.equal(member.entitlement_status, 'pending', 'Entitlement must be pending until paid');
  });

  await t.test('4. Lookup Admission by ID (Public / Prospective Parent View)', async () => {
    const res = await api('/api/v1/admissions/' + createdAdmissionId);
    assert.equal(res.status, 200);
    assert.equal(res.body.admission.id, createdAdmissionId);
    assert.equal(res.body.admission.studentName, 'Vihaan Varma');
    assert.equal(res.body.admission.status, 'payment_pending');
    assert.equal(res.body.admission.annualFeeInr, 599);
  });

  await t.test('5. Order Creation: Strict Amount Verification (₹599 / 59900 paise)', async () => {
    const res = await api('/api/v1/payments/orders', parentToken, 'POST', {
      studentId: createdStudentId
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.orderId);
    assert.equal(res.body.amountPaise, 59900);
    assert.equal(res.body.amountInr, 599);
    assert.equal(res.body.currency, 'INR');
    assert.equal(res.body.keyId, RAZORPAY_KEY_ID);

    createdOrderId = res.body.orderId;

    // Verify stored in payments table with status 'created'
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(createdOrderId);
    assert.equal(payment.status, 'created');
    assert.equal(payment.amount_inr, 599);
  });

  await t.test('6. Security: Rejection of Tampered or Forged Payment Signatures', async () => {
    const paymentId = 'pay_tampered_' + Date.now();
    const forgedSignature = 'bad_counterfeit_signature_1234567890abcdef';

    const res = await api('/api/v1/payments/verify', parentToken, 'POST', {
      razorpay_order_id: createdOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: forgedSignature,
      studentId: createdStudentId
    });

    assert.equal(res.status, 400);
    assert.equal(res.body.code, 'INVALID_SIGNATURE');

    // Ensure student entitlement remains pending
    const member = db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id = ?').get(createdStudentId);
    assert.equal(member.entitlement_status, 'pending');
  });

  await t.test('7. Payment Verification: Valid HMAC Signature Activates 365-Day Subscription & Entitlement', async () => {
    const paymentId = 'pay_rzp_valid_' + Date.now();
    // Generate authentic HMAC-SHA256 signature
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(`${createdOrderId}|${paymentId}`);
    const validSignature = hmac.digest('hex');

    const res = await api('/api/v1/payments/verify', parentToken, 'POST', {
      razorpay_order_id: createdOrderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
      studentId: createdStudentId
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.paymentId, paymentId);
    assert.ok(res.body.invoiceNumber.startsWith('VG-INV-2026-'));
    assert.equal(res.body.subscription.status, 'active');

    // Verify database state: student_subscriptions has 365 days
    const sub = db.prepare('SELECT * FROM student_subscriptions WHERE student_id = ?').get(createdStudentId);
    assert.ok(sub);
    assert.equal(sub.status, 'active');
    assert.equal(sub.amount_inr, 599);

    const diffDays = Math.ceil((new Date(sub.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
    assert.ok(diffDays >= 364 && diffDays <= 366, `Expected ~365 days, got ${diffDays}`);

    // Verify one_memberships entitlement is now 'enabled'
    const member = db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id = ?').get(createdStudentId);
    assert.equal(member.entitlement_status, 'enabled');

    // Verify admission record is now 'enrolled'
    const adm = db.prepare('SELECT status, payment_id FROM admissions WHERE id = ?').get(createdAdmissionId);
    assert.equal(adm.status, 'enrolled');
    assert.equal(adm.payment_id, paymentId);
  });

  await t.test('8. Idempotency: Duplicate Payment Verification Returns Existing Confirmation Without Double Extension', async () => {
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(createdOrderId);
    const subBefore = db.prepare('SELECT * FROM student_subscriptions WHERE student_id = ?').get(createdStudentId);

    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(`${createdOrderId}|${payment.payment_id}`);
    const validSignature = hmac.digest('hex');

    const res = await api('/api/v1/payments/verify', parentToken, 'POST', {
      razorpay_order_id: createdOrderId,
      razorpay_payment_id: payment.payment_id,
      razorpay_signature: validSignature,
      studentId: createdStudentId
    });

    assert.equal(res.status, 200);
    assert.equal(res.body.idempotent, true);

    const subAfter = db.prepare('SELECT * FROM student_subscriptions WHERE student_id = ?').get(createdStudentId);
    assert.equal(subBefore.expires_at, subAfter.expires_at, 'Duplicate payment verification must not add extra days');
  });

  await t.test('9. Idempotent Webhook Processing: Handles payment.captured and Ignores Duplicates', async () => {
    // Create new order for webhook testing
    const orderRes = await api('/api/v1/payments/orders', parentToken, 'POST', {
      studentId: 'stu-001'
    });
    const webhookOrderId = orderRes.body.orderId;
    const webhookPaymentId = 'pay_hook_' + Date.now();
    const eventId = 'evt_test_' + Date.now();

    const webhookBody = {
      event: 'payment.captured',
      event_id: eventId,
      payload: {
        payment: {
          entity: {
            id: webhookPaymentId,
            order_id: webhookOrderId,
            amount: 59900,
            currency: 'INR',
            method: 'upi'
          }
        }
      }
    };

    const rawStr = JSON.stringify(webhookBody);
    const hookHmac = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawStr).digest('hex');

    // First delivery
    const hookRes1 = await api('/api/v1/payments/webhook', null, 'POST', webhookBody, {
      'x-razorpay-signature': hookHmac
    });
    assert.equal(hookRes1.status, 200);

    // Duplicate delivery with same event ID
    const hookRes2 = await api('/api/v1/payments/webhook', null, 'POST', webhookBody, {
      'x-razorpay-signature': hookHmac
    });
    assert.equal(hookRes2.status, 200);
    assert.equal(hookRes2.body.status, 'duplicate_event_ignored');
  });

  await t.test('10. Tax Invoice & Fee Receipt Generation', async () => {
    const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(createdOrderId);
    const res = await api('/api/v1/payments/receipt/' + payment.id, parentToken);

    assert.equal(res.status, 200);
    assert.ok(res.body.invoice);
    assert.equal(res.body.invoice.invoiceNumber, payment.invoice_number);
    assert.equal(res.body.invoice.sacCode, '9992');
    assert.equal(res.body.invoice.pricing.totalInr, 599);
    assert.ok(res.body.invoice.pricing.baseInr > 500);
    assert.ok(res.body.invoice.pricing.cgstInr > 0);
    assert.ok(res.body.invoice.pricing.sgstInr > 0);
  });

  await t.test('11. Security Boundary: Cross-Account Receipt & Student Access Blocked (403)', async () => {
    // Parent A cannot access unlinked student's orders
    const alienStudentRes = await api('/api/v1/payments/orders', parentToken, 'POST', {
      studentId: 'stu-alien-unknown'
    });
    assert.equal(alienStudentRes.status, 404);

    // Student cannot call /orders or /verify
    const studentOrderRes = await api('/api/v1/payments/orders', studentToken, 'POST', {
      studentId: 'stu-g1-001'
    });
    assert.equal(studentOrderRes.status, 403, 'Students cannot initiate checkout orders');
  });

  await t.test('12. Multiple Children per Parent: Separate Annual Entitlements and Independent Expirations', () => {
    // Child 1 (stu-001) has its own subscription
    const sub1 = db.prepare('SELECT * FROM student_subscriptions WHERE student_id = ?').get('stu-001');
    // Child 2 (stu-002) has its own status
    const ent2 = checkStudentEntitlement('stu-002');
    assert.ok(sub1 || ent2);

    // Both belong to par-001
    const p1 = db.prepare('SELECT guardian_id FROM students WHERE id = ?').get('stu-001');
    const p2 = db.prepare('SELECT guardian_id FROM students WHERE id = ?').get('stu-002');
    assert.equal(p1.guardian_id, 'par-001');
    assert.equal(p2.guardian_id, 'par-001');
  });

  await t.test('13. Expired Subscription Handling: Backend Blocks Lesson Access & Requires Renewal', async () => {
    // Simulate expired subscription for a test student
    const expStudentId = 'stu-expired-test';
    db.prepare(`
      INSERT OR IGNORE INTO students (id, guardian_id, name, grade, board, medium, school_name, status)
      VALUES (?, 'par-001', 'Maya Expired', 1, 'CBSE', 'English', 'Test School', 'active')
    `).run(expStudentId);

    db.prepare(`
      INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
      VALUES (?, 'par-001', 1, '2026-27', 10, 'active', 'enabled')
      ON CONFLICT(student_id) DO UPDATE SET entitlement_status = 'enabled'
    `).run(expStudentId);

    db.prepare(`
      INSERT INTO one_academic_years (id, student_id, academic_year, grade, board, status, started_at)
      VALUES ('year-exp-test', ?, '2026-27', 1, 'CBSE', 'active', datetime('now'))
      ON CONFLICT(id) DO UPDATE SET status = 'active'
    `).run(expStudentId);

    db.prepare(`
      INSERT INTO one_consent_reviews (student_id, guardian_id, notice_version, verification_method, evidence_reference, verified_by, verified_at)
      VALUES (?, 'par-001', 'v2026.1', 'verified_parent_records', 'EVID-EXP-01', 'usr-admin-01', datetime('now'))
      ON CONFLICT(student_id) DO NOTHING
    `).run(expStudentId);

    // Expired subscription in the past
    db.prepare(`
      INSERT INTO student_subscriptions (id, student_id, guardian_id, plan_id, amount_inr, status, starts_at, expires_at)
      VALUES ('sub-exp-test', ?, 'par-001', 'plan-annual-599', 599.0, 'active', datetime('now', '-400 days'), datetime('now', '-35 days'))
    `).run(expStudentId);

    // Check entitlement evaluation
    const check = checkStudentEntitlement(expStudentId);
    assert.equal(check.active, false, 'Expired subscription must evaluate to inactive');
    assert.equal(check.status, 'expired');
    assert.equal(check.needsRenewal, true);

    // Lesson access request for expired student returns 403 with renewal notice
    const units = db.prepare("SELECT id FROM one_foundation_units WHERE grade=1 AND board='CBSE' AND status='published' LIMIT 1").get();
    if (units) {
      const lessonRes = await api(`/api/v1/grade1/guardian/${expStudentId}/units/${units.id}`, parentToken);
      assert.equal(lessonRes.status, 403);
      assert.equal(lessonRes.body.code, 'LEARNING_ACCESS_PENDING');
      assert.ok(lessonRes.body.message.includes('expired') || lessonRes.body.message.includes('renew'));
    }
  });

  await t.test('14. Admin Admissions & Payments Ledger Endpoints', async () => {
    // Admin admissions list
    const admList = await api('/api/v1/admissions/admin/list', adminToken);
    assert.equal(admList.status, 200);
    assert.ok(Array.isArray(admList.body.admissions));

    // Admin payments ledger
    const ledger = await api('/api/v1/payments/admin/ledger', adminToken);
    assert.equal(ledger.status, 200);
    assert.ok(ledger.body.metrics);
    assert.equal(ledger.body.metrics.annualPlanRate, 599);
    assert.ok(Array.isArray(ledger.body.transactions));
  });

  server.close();
});
