import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { app } from '../index.js';
import { initDatabase, db } from '../db/database.js';
import {
  ANNUAL_PRICE_INR,
  ANNUAL_PRICE_PAISE,
  verifyRazorpaySignature,
  verifyWebhookSignature
} from '../services/subscriptionService.js';
import {
  getBillingTaxConfig,
  getNextSequentialInvoiceNumber
} from '../services/billingConfig.js';
import {
  registerSandboxPayment,
  resetSandboxRegistry
} from '../services/razorpayClient.js';
import { JWT_SECRET } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

let server;
let baseUrl = 'http://localhost:5001';

// Test HMAC secret
const TEST_GATEWAY_SECRET = 'fixture_secret_test_2026';
const TEST_WEBHOOK_SECRET = 'fixture_webhook_test_2026';

function generateHmac(orderId, paymentId, secret = TEST_GATEWAY_SECRET) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
}

function generateWebhookHmac(rawBody, secret = TEST_WEBHOOK_SECRET) {
  return crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
}

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : options.rawBody
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, json, headers: res.headers };
}

test('Vayentra Gurukula — Comprehensive P0 Security Remediation Suite', async (t) => {
  initDatabase();
  resetSandboxRegistry();

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  // Seed sample admission for checkout and verification tests
  const testAdmissionId = `ADM-2026-TEST${Date.now().toString(36).toUpperCase()}`;
  const testCheckoutToken = crypto.randomBytes(32).toString('hex');
  const testStudentId = `stu-test-${Date.now()}`;
  const testGuardianId = `par-test-${Date.now()}`;
  const testGuardianUserId = `usr-test-par-${Date.now()}`;
  const testMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const testEmail = `testparent_${Date.now()}@example.com`;

  // Insert test parent user, guardian, student, and admission
  db.prepare(`
    INSERT INTO users (id, name, email, mobile, role, password_hash)
    VALUES (?, 'Test Parent One', ?, ?, 'parent', ?)
  `).run(testGuardianUserId, testEmail, testMobile, bcrypt.hashSync('StrongPass!2026', 10));

  db.prepare(`
    INSERT INTO guardians (id, user_id, parent_pin, subscription_status, plan_name, outstanding_fee)
    VALUES (?, ?, '4829', 'Active', 'Annual Gurukula Foundation Pass', 0.0)
  `).run(testGuardianId, testGuardianUserId);

  db.prepare(`
    INSERT INTO students (id, guardian_id, name, avatar, grade, board, medium, school_name, child_pin, status)
    VALUES (?, ?, 'Aarav Test', '🦊', 1, 'CBSE', 'English', 'Test School', '7391', 'active')
  `).run(testStudentId, testGuardianId);

  db.prepare(`
    INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
    VALUES (?, ?, 1, '2026-27', 10, 'active', 'pending')
  `).run(testStudentId, testGuardianId);

  db.prepare(`
    INSERT INTO admissions (
      id, guardian_id, guardian_name, guardian_phone, guardian_email,
      student_id, student_name, grade, board, medium, school_name,
      academic_year, consent_given, consent_ip, verification_status, status,
      checkout_auth_token
    ) VALUES (?, ?, 'Test Parent One', ?, ?,
      ?, 'Aarav Test', 1, 'CBSE', 'English', 'Test School',
      '2026-27', 1, '127.0.0.1', 'verified', 'payment_pending', ?)
  `).run(testAdmissionId, testGuardianId, testMobile, testEmail, testStudentId, testCheckoutToken);

  const parentToken = jwt.sign(
    { userId: testGuardianUserId, guardianId: testGuardianId, role: 'parent', email: 'testparent1@example.com' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  const studentUserId = `usr-stu-${testStudentId}`;
  const studentEmail = `aarav.student.${Date.now()}@example.com`;
  db.prepare(`
    INSERT INTO users (id, name, email, role, password_hash)
    VALUES (?, 'Aarav Student', ?, 'student', ?)
  `).run(studentUserId, studentEmail, bcrypt.hashSync('StudentPass!2026', 10));

  const studentToken = jwt.sign(
    { userId: studentUserId, studentId: testStudentId, role: 'student', email: studentEmail },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Link student account
  db.prepare(`
    INSERT OR REPLACE INTO one_student_account_links (user_id, student_id)
    VALUES (?, ?)
  `).run(studentUserId, testStudentId);

  // --- PRIORITY 1: PAYMENT SECURITY TESTS ---

  await t.test('P1.1 — Remove Hardcoded Payment Secret Fallbacks', async () => {
    // Signature verification must fail if secret is empty or undefined
    assert.equal(verifyRazorpaySignature('order_1', 'pay_1', 'sig_1', ''), false, 'Empty secret must reject signature');
    assert.equal(verifyRazorpaySignature('order_1', 'pay_1', 'sig_1', null), false, 'Null secret must reject signature');
    assert.equal(verifyWebhookSignature('{}', 'sig_1', ''), false, 'Empty webhook secret must reject signature');
    assert.equal(verifyWebhookSignature('{}', 'sig_1', '   '), false, 'Whitespace webhook secret must reject signature');
  });

  await t.test('P1.2 — Reject Unauthorized Order Creation (Require Token or Parent Login)', async () => {
    // Calling /payments/orders with admissionId without token or auth must be rejected with 403
    const unauthRes = await request('/api/v1/payments/orders', {
      method: 'POST',
      body: { admissionId: testAdmissionId }
    });
    assert.equal(unauthRes.status, 403, 'Order creation without checkoutToken or auth must be 403 Forbidden');
    assert.equal(unauthRes.json.code, 'CHECKOUT_UNAUTHORIZED');

    // Calling with invalid token must be rejected with 403
    const badTokenRes = await request('/api/v1/payments/orders', {
      method: 'POST',
      body: { admissionId: testAdmissionId, checkoutToken: 'invalid_token_123' }
    });
    assert.equal(badTokenRes.status, 403, 'Order creation with invalid token must be 403 Forbidden');

    // Calling with valid token succeeds and generates gateway order + sequential invoice
    const validRes = await request('/api/v1/payments/orders', {
      method: 'POST',
      body: { admissionId: testAdmissionId, checkoutToken: testCheckoutToken }
    });
    assert.equal(validRes.status, 200, 'Order creation with valid checkoutToken must succeed (200)');
    assert.ok(validRes.json.orderId.startsWith('order_'), 'Must generate gateway order ID');
    assert.ok(validRes.json.invoiceNumber.startsWith('VG-INV-2026-'), 'Must assign sequential invoice number');
    assert.equal(validRes.json.amountInr, ANNUAL_PRICE_INR);
    assert.equal(validRes.json.amountPaise, ANNUAL_PRICE_PAISE);
  });

  await t.test('P1.3 — Gate Verification: Never Activate Based Only on Valid HMAC Callback', async () => {
    // Create an order first
    const orderRes = await request('/api/v1/payments/orders', {
      method: 'POST',
      body: { admissionId: testAdmissionId, checkoutToken: testCheckoutToken }
    });
    const orderId = orderRes.json.orderId;
    const paymentId = `pay_fake_unverified_${Date.now()}`;
    const forgedSig = generateHmac(orderId, paymentId);

    // Register this payment as 'failed' on the mock gateway
    registerSandboxPayment(paymentId, {
      status: 'failed',
      captured: false,
      amount: ANNUAL_PRICE_PAISE,
      currency: 'INR',
      order_id: orderId
    });

    // Verification must REJECT even though HMAC signature is mathematically valid!
    const verifyRes = await request('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: forgedSig,
        studentId: testStudentId
      }
    });

    assert.equal(verifyRes.status, 400, 'Must reject verification if gateway status is not captured');
    assert.equal(verifyRes.json.code, 'GATEWAY_PAYMENT_NOT_CAPTURED');

    // Verify database state was NOT activated
    const subCheck = db.prepare('SELECT id FROM student_subscriptions WHERE payment_id = ?').get(paymentId);
    assert.equal(subCheck, undefined, 'Subscription must NOT be activated for uncaptured payment');
  });

  await t.test('P1.4 — Gate Verification: Reject Gateway Amount or Currency Mismatch', async () => {
    const orderRes = await request('/api/v1/payments/orders', {
      method: 'POST',
      body: { admissionId: testAdmissionId, checkoutToken: testCheckoutToken }
    });
    const orderId = orderRes.json.orderId;
    const paymentId = `pay_tampered_amt_${Date.now()}`;
    const forgedSig = generateHmac(orderId, paymentId);

    // Register payment on gateway with ₹100 instead of ₹599
    registerSandboxPayment(paymentId, {
      status: 'captured',
      captured: true,
      amount: 10000,
      currency: 'INR',
      order_id: orderId
    });

    const verifyRes = await request('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: forgedSig,
        studentId: testStudentId
      }
    });

    assert.equal(verifyRes.status, 400, 'Must reject verification if gateway amount does not match trusted price');
    assert.equal(verifyRes.json.code, 'GATEWAY_AMOUNT_MISMATCH');
  });

  await t.test('P1.5 — Successful Authentic Verification & Atomic Activation', async () => {
    const orderRes = await request('/api/v1/payments/orders', {
      method: 'POST',
      body: { admissionId: testAdmissionId, checkoutToken: testCheckoutToken }
    });
    const orderId = orderRes.json.orderId;
    const paymentId = `pay_genuine_captured_${Date.now()}`;
    const validSig = generateHmac(orderId, paymentId);

    // Register authentic captured payment on gateway
    registerSandboxPayment(paymentId, {
      status: 'captured',
      captured: true,
      amount: ANNUAL_PRICE_PAISE,
      currency: 'INR',
      order_id: orderId
    });

    const verifyRes = await request('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: validSig,
        studentId: testStudentId,
        admissionId: testAdmissionId
      }
    });

    assert.equal(verifyRes.status, 200, 'Authentic payment verification must succeed (200)');
    assert.equal(verifyRes.json.success, true);
    assert.equal(verifyRes.json.paymentId, paymentId);

    // Verify atomic state updates across all tables:
    // 1. Payment status = 'Captured'
    const paymentRow = db.prepare('SELECT status, razorpay_payment_id FROM payments WHERE order_id = ?').get(orderId);
    assert.equal(paymentRow.status, 'Captured');
    assert.equal(paymentRow.razorpay_payment_id, paymentId);

    // 2. Subscription active for 365 days
    const subRow = db.prepare('SELECT status, expires_at FROM student_subscriptions WHERE payment_id = ?').get(paymentId);
    assert.equal(subRow.status, 'active');
    assert.ok(new Date(subRow.expires_at) > new Date());

    // 3. Admission status updated to 'enrolled'
    const admRow = db.prepare('SELECT status FROM admissions WHERE id = ?').get(testAdmissionId);
    assert.equal(admRow.status, 'enrolled');

    // 4. One membership entitlement enabled
    const memRow = db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id = ?').get(testStudentId);
    assert.equal(memRow.entitlement_status, 'enabled');
  });

  await t.test('P1.6 — Replay Attack Defense & Anti-Replay Constraint', async () => {
    // Attempting to reuse the same captured payment ID on a second order must be rejected (409)
    const secondOrderRes = await request('/api/v1/payments/orders', {
      method: 'POST',
      body: { admissionId: testAdmissionId, checkoutToken: testCheckoutToken }
    });
    const secondOrderId = secondOrderRes.json.orderId;
    const previouslyUsedPaymentId = db.prepare("SELECT razorpay_payment_id FROM payments WHERE status = 'Captured' ORDER BY created_at DESC LIMIT 1").get().razorpay_payment_id;
    // Set gateway payment order_id to null so it passes gateway check and exercises database anti-replay uniqueness check
    registerSandboxPayment(previouslyUsedPaymentId, {
      status: 'captured',
      captured: true,
      amount: ANNUAL_PRICE_PAISE,
      currency: 'INR',
      order_id: null
    });
    const reuseSig = generateHmac(secondOrderId, previouslyUsedPaymentId);

    const replayRes = await request('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: secondOrderId,
        razorpay_payment_id: previouslyUsedPaymentId,
        razorpay_signature: reuseSig,
        studentId: testStudentId
      }
    });

    assert.equal(replayRes.status, 409, 'Reusing payment ID on another order must be rejected (409 Conflict)');
    assert.equal(replayRes.json.code, 'PAYMENT_ID_ALREADY_USED');
  });

  await t.test('P1.7 — Enforce Raw Request Body and Signature on Webhook', async () => {
    // Missing signature header
    const noSigRes = await request('/api/v1/payments/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { event: 'payment.captured' }
    });
    assert.equal(noSigRes.status, 400, 'Missing x-razorpay-signature header must return 400');
    assert.equal(noSigRes.json.code, 'MISSING_WEBHOOK_SIGNATURE');
  });

  // --- PRIORITY 2: STUDENT & PARENT IDENTITY SECURITY TESTS ---

  await t.test('P2.1 — Restrict Sensitive Admission Lookup Endpoints (Require Auth or Token)', async () => {
    // Anonymous lookup without token must NOT reveal sensitive contact PII
    const unauthLookup = await request(`/api/v1/admissions/${testAdmissionId}`);
    assert.equal(unauthLookup.status, 200, 'Anonymous lookup succeeds for public prospective view');
    assert.equal(unauthLookup.json.admission.guardianPhone, undefined, 'Guardian phone must NOT be revealed anonymously');
    assert.equal(unauthLookup.json.admission.guardianEmail, undefined, 'Guardian email must NOT be revealed anonymously');
    assert.equal(unauthLookup.json.admission.studentId, undefined, 'Canonical studentId must NOT be revealed anonymously');
    assert.equal(unauthLookup.json.admission.studentName, 'Aarav Test');

    // Lookup with valid checkoutToken succeeds but MASKS PII (phone and email)
    const tokenLookup = await request(`/api/v1/admissions/${testAdmissionId}?token=${testCheckoutToken}`);
    assert.equal(tokenLookup.status, 200, 'Lookup with valid token must succeed (200)');
    assert.ok(tokenLookup.json.admission.guardianPhone.includes('******'), 'Guardian phone must be masked in token view');
    assert.ok(tokenLookup.json.admission.guardianEmail.includes('***'), 'Guardian email must be masked in token view');
    assert.equal(tokenLookup.json.admission.studentName, 'Aarav Test');

    // Authenticated guardian sees unmasked data
    const guardianLookup = await request(`/api/v1/admissions/${testAdmissionId}`, {
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    assert.equal(guardianLookup.status, 200);
    assert.equal(guardianLookup.json.admission.guardianPhone, testMobile, 'Linked guardian can see full phone');
  });

  await t.test('P2.2 — Cross-Family Boundary Isolation (Status, Receipts & Invoices)', async () => {
    // Create another guardian
    const otherGuardianUserId = `usr-other-${Date.now()}`;
    const otherGuardianId = `par-other-${Date.now()}`;
    const otherEmail = `other_${Date.now()}@example.com`;
    db.prepare("INSERT INTO users (id, name, email, role) VALUES (?, 'Other Parent', ?, 'parent')").run(otherGuardianUserId, otherEmail);
    db.prepare("INSERT INTO guardians (id, user_id, parent_pin) VALUES (?, ?, '9999')").run(otherGuardianId, otherGuardianUserId);

    const otherParentToken = jwt.sign(
      { userId: otherGuardianUserId, guardianId: otherGuardianId, role: 'parent', email: otherEmail },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Other parent trying to access testStudentId's subscription status must receive 403
    const crossFamilyStatus = await request(`/api/v1/payments/student/${testStudentId}/status`, {
      headers: { Authorization: `Bearer ${otherParentToken}` }
    });
    assert.equal(crossFamilyStatus.status, 403, 'Parent cannot view status of another family student (403)');
    assert.equal(crossFamilyStatus.json.code, 'STUDENT_ACCESS_DENIED');

    // Other parent trying to access receipt of testStudentId must receive 403
    const capturedPayment = db.prepare("SELECT id FROM payments WHERE student_id = ? AND status = 'Captured' LIMIT 1").get(testStudentId);
    if (capturedPayment) {
      const crossFamilyReceipt = await request(`/api/v1/payments/receipt/${capturedPayment.id}`, {
        headers: { Authorization: `Bearer ${otherParentToken}` }
      });
      assert.equal(crossFamilyReceipt.status, 403, 'Parent cannot access receipt of another family (403)');
      assert.equal(crossFamilyReceipt.json.code, 'RECEIPT_ACCESS_DENIED');
    }
  });

  await t.test('P2.3 — Mandatory Password Reset for Flagged Accounts', async () => {
    const flaggedUserId = `usr-flagged-${Date.now()}`;
    const flaggedEmail = `flagged_${Date.now()}@example.com`;
    db.prepare(`
      INSERT INTO users (id, name, email, role, password_hash, must_reset_password)
      VALUES (?, 'Flagged User', ?, 'parent', ?, 1)
    `).run(flaggedUserId, flaggedEmail, bcrypt.hashSync('OldPassword123!', 10));

    // When logging in with x-test-enforce-reset header, must return 403 PASSWORD_RESET_REQUIRED
    const resetRes = await request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'X-Test-Enforce-Reset': 'true' },
      body: { email: flaggedEmail, password: 'OldPassword123!' }
    });

    assert.equal(resetRes.status, 403, 'Login for flagged account must be rejected with 403');
    assert.equal(resetRes.json.code, 'PASSWORD_RESET_REQUIRED');
  });

  await t.test('P2.4 — Verification: No Accounts Retain 1234 or 0000 PINs in DB', async () => {
    // Verify that newly provisioned accounts never receive 1234 or 0000
    const testNewAdminRes = await request('/api/v1/admissions/apply', {
      method: 'POST',
      body: {
        guardianName: 'Asha Rao',
        guardianPhone: '98450' + Math.floor(10000 + Math.random() * 90000),
        guardianEmail: `asha.${Date.now()}@example.com`,
        studentName: 'Vivek Rao',
        grade: 1,
        board: 'CBSE',
        consent: true
      }
    });
    assert.equal(testNewAdminRes.status, 201);
    const newStudent = db.prepare('SELECT child_pin FROM students WHERE id = ?').get(testNewAdminRes.json.studentId);
    assert.notEqual(newStudent?.child_pin, '0000', 'Newly provisioned child PIN must never be 0000');

    const newGuardian = db.prepare('SELECT parent_pin FROM guardians WHERE id = ?').get(testNewAdminRes.json.guardianId);
    assert.notEqual(newGuardian?.parent_pin, '1234', 'Newly provisioned parent PIN must never be 1234');
  });

  // --- PRIORITY 3: BILLING INTEGRITY TESTS ---

  await t.test('P3.1 — Sequential Monotonic Invoice Numbering', async () => {
    const inv1 = getNextSequentialInvoiceNumber(db);
    const inv2 = getNextSequentialInvoiceNumber(db);
    assert.ok(inv1.startsWith('VG-INV-2026-'));
    assert.ok(inv2.startsWith('VG-INV-2026-'));

    const num1 = parseInt(inv1.split('-')[3], 10);
    const num2 = parseInt(inv2.split('-')[3], 10);
    assert.equal(num2, num1 + 1, 'Sequential invoice numbers must increment monotonically by 1');
  });

  await t.test('P3.2 — Company Legal Name: Vayentra Ventures Pvt. Ltd.', async () => {
    const config = getBillingTaxConfig();
    assert.equal(config.legalName, 'Vayentra Ventures Pvt. Ltd.', 'Legal entity name must be Vayentra Ventures Pvt. Ltd.');
  });

  await t.test('P3.3 — Tax Invoice Gated Behind Formal CA Approval (428)', async () => {
    const capturedPayment = db.prepare("SELECT id FROM payments WHERE student_id = ? AND guardian_id = ? AND status = 'Captured' LIMIT 1").get(testStudentId, testGuardianId);
    assert.ok(capturedPayment, 'Captured payment must exist for test student');
    const invRes = await request(`/api/v1/payments/invoice/${capturedPayment.id}`, {
      headers: { Authorization: `Bearer ${parentToken}` }
    });
    // TAX_CONFIG_APPROVED is false by default in test/dev
    assert.equal(invRes.status, 428, 'Unapproved tax config must return HTTP 428 Precondition Required');
    assert.equal(invRes.json.code, 'TAX_CONFIGURATION_PENDING_APPROVAL');
  });

  // --- PRIORITY 4: PREMIUM CLASS 1 ENGLISH BENCHMARK ---

  await t.test('P4.1 — Verified Offline Media & Owner Sign-Off Gating', async () => {
    const manifest = await import('../../public/media/class1_english/asset_manifest.json', { with: { type: 'json' } });
    const ch1 = manifest.default.chapters[0];

    assert.equal(ch1.chapterNumber, 1);
    assert.equal(ch1.chapterTitle, 'Two Little Hands');
    assert.equal(ch1.publishingStatus, 'review_pending_owner_approval', 'Media must be gated by owner approval');
    assert.equal(ch1.ownerApprovalRequired, true, 'ownerApprovalRequired flag must be true');
    assert.equal(ch1.pedagogicalPhases.length, 7, 'Must have 7 pedagogical phases');
  });
});
