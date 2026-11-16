import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { app } from '../index.js';
import { db } from '../db/database.js';
import {
  ANNUAL_PRICE_INR,
  ANNUAL_PRICE_PAISE,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET
} from '../services/subscriptionService.js';
import {
  isTaxConfigApproved,
  getBillingTaxConfig
} from '../services/billingConfig.js';
import { seedAndPublishGrade1Curriculum } from '../services/seedAndPublishGrade1Curriculum.js';
import { seedAndPublishGrade2Curriculum } from '../services/seedAndPublishGrade2Curriculum.js';

let server;
let base;
let adminToken;
let parentToken;
let otherParentToken;
let studentToken;

async function api(path, { method = 'GET', token = null, body = null, headers = {} } = {}) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, json: data, headers: res.headers };
}

async function login(email, password = 'Gurukula@2026') {
  const res = await api('/api/v1/auth/login', {
    method: 'POST',
    body: { email, password }
  });
  assert.equal(res.status, 200, `Login failed for ${email}: ${JSON.stringify(res.json)}`);
  return res.json.token;
}

test('Vayentra Gurukula — Critical Security, Tax & Entitlement Remediation Suite', async (t) => {
  seedAndPublishGrade1Curriculum(db);
  seedAndPublishGrade2Curriculum(db);

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      base = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });

  t.after(() => {
    if (server) server.close();
  });

  adminToken = await login('admin@vayentra.org');
  parentToken = await login('guardian@vayentra.org');
  studentToken = await login('student.grade1@vayentra.org');

  // Register another parent for isolation checks
  const randomSuffix = Math.random().toString(36).substring(2, 7);
  const otherAdmission = await api('/api/v1/admissions/apply', {
    method: 'POST',
    body: {
      guardianName: `Isolated Parent ${randomSuffix}`,
      guardianPhone: `99887${Math.floor(10000 + Math.random() * 90000)}`,
      studentName: `Child ${randomSuffix}`,
      grade: 2,
      board: 'CBSE',
      consent: true
    }
  });
  assert.equal(otherAdmission.status, 201);
  const otherGuardianId = otherAdmission.json.guardianId;
  const otherStudentId = otherAdmission.json.studentId;

  // ============================================================================
  // FIX 1: REMOVE PAYMENT SIMULATION SECURITY RISKS (P0)
  // ============================================================================
  await t.test('Fix 1 — Payment Simulation Route Completely Removed (404)', async () => {
    // Attempt calling test-signature endpoint
    const res = await api('/api/v1/payments/test-signature', {
      method: 'POST',
      body: {
        orderId: 'order_fake_123',
        paymentId: 'pay_fake_456'
      }
    });

    assert.equal(res.status, 404, 'POST /api/v1/payments/test-signature MUST return 404 Not Found');
  });

  // ============================================================================
  // FIX 2: RAZORPAY PAYMENT VERIFICATION & WEBHOOK IDEMPOTENCY (P0)
  // ============================================================================
  let testAdmissionId;
  let testStudentId;
  let testOrderId;
  let testPaymentId;
  let authenticSignature;

  await t.test('Fix 2 — Admission Application & Trusted Server Order Creation', async () => {
    const admRes = await api('/api/v1/admissions/apply', {
      method: 'POST',
      body: {
        guardianName: 'Dr. Suresh Babu',
        guardianPhone: '9845112233',
        studentName: 'Ananya Suresh',
        grade: 1,
        board: 'CBSE',
        consent: true
      }
    });

    assert.equal(admRes.status, 201);
    testAdmissionId = admRes.json.admissionId;
    testStudentId = admRes.json.studentId;

    // Verify order initialization uses server-side ₹599 (59900 paise)
    const orderRes = await api('/api/v1/payments/orders', {
      method: 'POST',
      body: {
        admissionId: testAdmissionId,
        studentId: testStudentId
      }
    });

    assert.equal(orderRes.status, 200);
    assert.equal(orderRes.json.amountInr, 599);
    assert.equal(orderRes.json.amountPaise, 59900);
    assert.equal(orderRes.json.currency, 'INR');
    assert.ok(orderRes.json.orderId);

    testOrderId = orderRes.json.orderId;
    testPaymentId = `pay_rzp_${Date.now()}`;

    // Compute authentic HMAC in isolated test utility
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(`${testOrderId}|${testPaymentId}`);
    authenticSignature = hmac.digest('hex');
  });

  await t.test('Fix 2 — Negative Test: Forged Payment Signature Rejected (400)', async () => {
    const res = await api('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'forged_counterfeit_signature_1234567890abcdef',
        studentId: testStudentId,
        admissionId: testAdmissionId
      }
    });

    assert.equal(res.status, 400);
    assert.equal(res.json.code, 'INVALID_SIGNATURE');

    // Confirm payment status was recorded as failed
    const payment = db.prepare('SELECT status FROM payments WHERE order_id = ?').get(testOrderId);
    assert.equal(payment.status, 'failed');
  });

  await t.test('Fix 2 — Negative Test: Tampered Order Amount Rejected (400)', async () => {
    // Create a tampered order in DB with amount != 599
    const badOrderId = `order_tampered_${Date.now()}`;
    db.prepare(`
      INSERT INTO payments (id, guardian_id, student_id, plan_id, amount_inr, gst_inr, status, order_id, razorpay_order_id, payment_id, invoice_number, currency)
      VALUES (?, 'par-001', ?, 'plan-annual-599', 100.0, 0, 'created', ?, ?, 'pending', 'VG-INV-TAMPERED', 'INR')
    `).run(`payrec-${Date.now()}`, testStudentId, badOrderId, badOrderId);

    const badPaymentId = `pay_tampered_${Date.now()}`;
    const badHmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${badOrderId}|${badPaymentId}`).digest('hex');

    const res = await api('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: badOrderId,
        razorpay_payment_id: badPaymentId,
        razorpay_signature: badHmac,
        studentId: testStudentId
      }
    });

    assert.equal(res.status, 400);
    assert.equal(res.json.code, 'WRONG_PAYMENT_AMOUNT');
  });

  await t.test('Fix 2 — Authentic Payment Verification & Atomic Activation', async () => {
    // Reset order status to created
    db.prepare("UPDATE payments SET status = 'created' WHERE order_id = ?").run(testOrderId);

    const res = await api('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: authenticSignature,
        studentId: testStudentId,
        admissionId: testAdmissionId
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.json.success, true);
    assert.equal(res.json.paymentId, testPaymentId);
    assert.ok(res.json.subscription);
    assert.equal(res.json.subscription.status, 'active');

    // Confirm student entitlement is active
    const entRes = await api(`/api/v1/payments/student/${testStudentId}/status`, {
      token: adminToken
    });
    assert.equal(entRes.json.active, true);
    assert.equal(entRes.json.status, 'enabled');
  });

  await t.test('Fix 2 — Replay Defense: Reusing Payment ID on Different Order Rejected (409)', async () => {
    // Another order attempting to claim the same testPaymentId
    const replayOrderId = `order_replay_${Date.now()}`;
    db.prepare(`
      INSERT INTO payments (id, guardian_id, student_id, plan_id, amount_inr, gst_inr, status, order_id, razorpay_order_id, payment_id, invoice_number, currency)
      VALUES (?, 'par-001', ?, 'plan-annual-599', 599.0, 0, 'created', ?, ?, 'pending', 'VG-INV-REPLAY', 'INR')
    `).run(`payrec-replay-${Date.now()}`, otherStudentId, replayOrderId, replayOrderId);

    const replayHmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(`${replayOrderId}|${testPaymentId}`).digest('hex');

    const res = await api('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: replayOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: replayHmac,
        studentId: otherStudentId
      }
    });

    assert.equal(res.status, 409);
    assert.equal(res.json.code, 'PAYMENT_ID_ALREADY_USED');
  });

  await t.test('Fix 2 — Idempotent Callback: Same Order and Payment ID returns Active state without duplicate subscription', async () => {
    const subCountBefore = db.prepare('SELECT COUNT(*) as c FROM student_subscriptions WHERE student_id = ?').get(testStudentId).c;

    const res = await api('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: authenticSignature,
        studentId: testStudentId
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.json.idempotent, true);

    const subCountAfter = db.prepare('SELECT COUNT(*) as c FROM student_subscriptions WHERE student_id = ?').get(testStudentId).c;
    assert.equal(subCountAfter, subCountBefore, 'Subscription count must remain exactly 1');
  });

  await t.test('Fix 2 — Webhook Idempotency & Durable Ledger (payment_webhook_events)', async () => {
    const eventId = `evt_durable_${Date.now()}`;
    const rawPayload = JSON.stringify({
      event: 'payment.captured',
      event_id: eventId,
      payload: {
        payment: {
          entity: {
            id: testPaymentId,
            order_id: testOrderId,
            amount: 59900,
            method: 'netbanking'
          }
        }
      }
    });

    const webhookSig = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawPayload).digest('hex');

    // First delivery
    const res1 = await fetch(`${base}/api/v1/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': webhookSig
      },
      body: rawPayload
    });
    assert.equal(res1.status, 200);

    // Verify durable record was created
    const record = db.prepare('SELECT * FROM payment_webhook_events WHERE event_id = ?').get(eventId);
    assert.ok(record, 'Webhook event must be recorded in payment_webhook_events table');
    assert.equal(record.event_type, 'payment.captured');
    assert.equal(record.processed_status, 'processed');

    // Duplicate delivery
    const res2 = await fetch(`${base}/api/v1/payments/webhook`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': webhookSig
      },
      body: rawPayload
    });
    const json2 = await res2.json();
    assert.equal(res2.status, 200);
    assert.equal(json2.status, 'duplicate_event_ignored');
  });

  await t.test('Fix 2 — Admin Reconciliation Endpoint (GET /api/v1/payments/admin/reconcile)', async () => {
    const res = await api('/api/v1/payments/admin/reconcile', {
      token: adminToken
    });

    assert.equal(res.status, 200);
    assert.ok(typeof res.json.capturedPaymentsCount === 'number');
    assert.ok(typeof res.json.activeSubscriptionsCount === 'number');
    assert.ok(Array.isArray(res.json.webhookStatusBreakdown));
  });

  // ============================================================================
  // FIX 3: GST, TAX INVOICES & PROVISIONAL RECEIPT CONTROLS (P0)
  // ============================================================================
  await t.test('Fix 3 — Unapproved Tax Config Blocks Official Tax Invoice (428)', async () => {
    // In our test environment, TAX_CONFIG_APPROVED is false
    assert.equal(isTaxConfigApproved(), false, 'Test environment should have TAX_CONFIG_APPROVED=false');

    const invRes = await api(`/api/v1/payments/invoice/${testPaymentId}`, {
      token: adminToken
    });

    assert.equal(invRes.status, 428);
    assert.equal(invRes.json.code, 'TAX_CONFIGURATION_PENDING_APPROVAL');
    assert.ok(invRes.json.provisionalReceiptUrl);
  });

  await t.test('Fix 3 — Provisional Fee Receipt Issued Without Fake GSTIN', async () => {
    const recRes = await api(`/api/v1/payments/receipt/${testPaymentId}`, {
      token: adminToken
    });

    assert.equal(recRes.status, 200);
    const receipt = recRes.json.receipt || recRes.json.invoice;
    assert.ok(receipt);
    assert.equal(receipt.documentType, 'PROVISIONAL_FEE_RECEIPT');
    assert.equal(receipt.isOfficialTaxInvoice, false);
    assert.equal(receipt.feeCategory, 'DIGITAL_LEARNING_ANNUAL_SUBSCRIPTION');
    assert.equal(receipt.tuitionFeeIncluded, false);

    // Verify NO placeholder GSTIN is present
    const stringified = JSON.stringify(receipt);
    assert.ok(!stringified.includes('29AABCV1234F1Z5'), 'Placeholder GSTIN 29AABCV1234F1Z5 must not appear');
    assert.ok(!stringified.includes('29AAACV2026F1Z5'), 'Placeholder GSTIN 29AAACV2026F1Z5 must not appear');
  });

  // ============================================================================
  // FIX 4: SECURE STUDENT ACCOUNT ACTIVATION & CREDENTIALS (P0)
  // ============================================================================
  let activationToken;
  let newStudentEmail;

  await t.test('Fix 4 — Admission Does NOT Disclose Predictable Passwords', async () => {
    const res = await api('/api/v1/admissions/apply', {
      method: 'POST',
      body: {
        guardianName: 'Priya Sharma',
        guardianPhone: '9876001122',
        studentName: 'Rohan Sharma',
        grade: 1,
        board: 'CBSE',
        consent: true
      }
    });

    assert.equal(res.status, 201);
    assert.ok(res.json.activation);
    assert.ok(res.json.activation.token);
    assert.ok(res.json.activation.expiresAt);
    assert.ok(!res.json.credentials?.defaultPassword, 'Must NOT contain defaultPassword');
    assert.ok(!JSON.stringify(res.json).includes('Gurukula@2026'), 'Response must not contain Gurukula@2026');

    activationToken = res.json.activation.token;
    newStudentEmail = res.json.studentEmail;

    // Verify that the initial student password CANNOT be logged into with Gurukula@2026
    const badLogin = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: newStudentEmail,
        password: 'Gurukula@2026'
      }
    });
    assert.equal(badLogin.status, 401, 'Student account must not be accessible via default Gurukula@2026');
  });

  await t.test('Fix 4 — Negative Test: Activation with Invalid or Weak Password Rejected', async () => {
    // 1. Invalid token
    const badToken = await api('/api/v1/auth/activate-account', {
      method: 'POST',
      body: {
        token: 'non_existent_token_12345',
        password: 'ValidPassword@123'
      }
    });
    assert.equal(badToken.status, 404);
    assert.equal(badToken.json.code, 'INVALID_ACTIVATION_TOKEN');

    // 2. Weak password (< 8 chars)
    const weak1 = await api('/api/v1/auth/activate-account', {
      method: 'POST',
      body: {
        token: activationToken,
        password: 'short'
      }
    });
    assert.equal(weak1.status, 400);
    assert.equal(weak1.json.code, 'WEAK_PASSWORD');

    // 3. Weak password (no number / special char)
    const weak2 = await api('/api/v1/auth/activate-account', {
      method: 'POST',
      body: {
        token: activationToken,
        password: 'AllLettersPassword'
      }
    });
    assert.equal(weak2.status, 400);
    assert.equal(weak2.json.code, 'WEAK_PASSWORD');
  });

  await t.test('Fix 4 — Successful Account Activation with Strong Password', async () => {
    const res = await api('/api/v1/auth/activate-account', {
      method: 'POST',
      body: {
        token: activationToken,
        password: 'RohanSecure#2026'
      }
    });

    assert.equal(res.status, 200);
    assert.equal(res.json.success, true);

    // Verify token is now marked as used
    const tokenRecord = db.prepare('SELECT is_used FROM account_activation_tokens WHERE token = ?').get(activationToken);
    assert.equal(tokenRecord.is_used, 1);

    // Verify student can now log in with the new password
    const studentLogin = await api('/api/v1/auth/login', {
      method: 'POST',
      body: {
        email: newStudentEmail,
        password: 'RohanSecure#2026'
      }
    });
    assert.equal(studentLogin.status, 200);
    assert.ok(studentLogin.json.token);
  });

  await t.test('Fix 4 — Negative Test: Reusing Activation Token Rejected (400)', async () => {
    const res = await api('/api/v1/auth/activate-account', {
      method: 'POST',
      body: {
        token: activationToken,
        password: 'AnotherPassword#999'
      }
    });

    assert.equal(res.status, 400);
    assert.equal(res.json.code, 'TOKEN_ALREADY_USED');
  });

  await t.test('Fix 4 — Negative Test: Expired Activation Token Rejected (400)', async () => {
    const expiredToken = `exp_tok_${Date.now()}`;
    const validUser = db.prepare('SELECT id FROM users LIMIT 1').get();
    const validStudent = db.prepare('SELECT id FROM students LIMIT 1').get();
    const validGuardian = db.prepare('SELECT id FROM guardians LIMIT 1').get();

    db.prepare(`
      INSERT INTO account_activation_tokens (token, user_id, student_id, guardian_id, token_type, expires_at, is_used)
      VALUES (?, ?, ?, ?, 'student_activation', datetime('now', '-1 hour'), 0)
    `).run(expiredToken, validUser.id, validStudent.id, validGuardian.id);

    const res = await api('/api/v1/auth/activate-account', {
      method: 'POST',
      body: {
        token: expiredToken,
        password: 'ValidPassword#2026'
      }
    });

    assert.equal(res.status, 400);
    assert.equal(res.json.code, 'TOKEN_EXPIRED');
  });

  await t.test('Fix 4 — Parent-Managed Student Credential Reset & Boundary Isolation', async () => {
    // 1. Parent attempts to update unlinked child credentials -> 403
    const badParent = await api('/api/v1/auth/parent/set-student-credentials', {
      method: 'POST',
      token: parentToken,
      body: {
        studentId: otherStudentId, // Belongs to different parent
        password: 'NewValidPassword#123'
      }
    });
    assert.equal(badParent.status, 403);
    assert.equal(badParent.json.code, 'STUDENT_ACCESS_DENIED');

    // 2. Parent successfully updates linked child password and PIN -> 200
    const goodParent = await api('/api/v1/auth/parent/set-student-credentials', {
      method: 'POST',
      token: parentToken,
      body: {
        studentId: 'stu-001',
        password: 'ChildNewSecure#2026',
        childPin: '5678'
      }
    });
    assert.equal(goodParent.status, 200);
    assert.equal(goodParent.json.success, true);

    // Verify PIN was updated in students table
    const child = db.prepare('SELECT child_pin FROM students WHERE id = ?').get('stu-001');
    assert.equal(child.child_pin, '5678');
  });

  // ============================================================================
  // FIX 5: PREMIUM EDUCATIONAL MEDIA ASSET AUDIT & INVENTORY (P1)
  // ============================================================================
  await t.test('Fix 5 — Class 1 English Chapter 1 ("Two Little Hands") Offline Media Verification', async () => {
    const audioPath = path.resolve('public/media/class1_english/audio/ch1_full.m4a');
    const vttPath = path.resolve('public/media/class1_english/captions/ch1_two_little_hands.vtt');
    const posterPath = path.resolve('public/media/class1_english/posters/ch1_poster.svg');

    // 1. Check offline audio file exists and is authentic
    assert.ok(fs.existsSync(audioPath), 'Audio file ch1_full.m4a must exist');
    const audioStat = fs.statSync(audioPath);
    assert.ok(audioStat.size > 100000, `Audio file should be > 100KB (actual: ${audioStat.size} bytes)`);

    // 2. Check subtitles exist and contain teacher cues
    assert.ok(fs.existsSync(vttPath), 'Caption file ch1_two_little_hands.vtt must exist');
    const vttContent = fs.readFileSync(vttPath, 'utf8');
    assert.ok(vttContent.includes('WEBVTT'), 'Must be valid WebVTT format');
    assert.ok(vttContent.includes('Teacher Tara'), 'Must contain Teacher Tara narration cues');

    // 3. Check visual poster exists
    assert.ok(fs.existsSync(posterPath), 'Poster SVG ch1_poster.svg must exist');

    // 4. Check chapter 1 curriculum metadata
    const { GRADE1_ENGLISH_MRIDANG } = await import('../data/grade1EnglishMridang.js');
    const ch1 = GRADE1_ENGLISH_MRIDANG.lessons.find((l) => l.chapterNumber === 1);
    assert.ok(ch1, 'Chapter 1 must exist in Mridang curriculum data');
    assert.equal(ch1.chapterTitle, 'Two Little Hands');
    assert.equal(ch1.aiVideo.scenes.length, 4, 'Must contain 4 pedagogical phases');
    assert.equal(ch1.questions.length, 4, 'Must contain 4 formative comprehension questions');

    for (const q of ch1.questions) {
      assert.ok(q.prompt, 'Question must have a prompt');
      assert.ok(Array.isArray(q.options) && q.options.length >= 3, 'Must have at least 3 options');
      assert.ok(typeof q.answerIndex === 'number', 'Must specify answerIndex');
      assert.ok(q.explanation, 'Must provide answer explanation');
    }
  });
});
