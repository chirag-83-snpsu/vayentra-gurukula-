import test from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { RAZORPAY_WEBHOOK_SECRET } from '../services/subscriptionService.js';

const BASE_URL = 'http://localhost:5001';

async function api(path, { method = 'GET', body = null, token = null, headers = {} } = {}) {
  const reqHeaders = { ...headers };
  if (body) {
    reqHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    reqHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(BASE_URL + path, {
    method,
    headers: reqHeaders,
    body: body ? JSON.stringify(body) : undefined
  });

  let json = null;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch (_) {}

  return {
    status: res.status,
    ok: res.ok,
    headers: res.headers,
    text,
    json
  };
}

test('PRODUCTION INTEGRATION VERIFICATION SUITE', async (t) => {
  let adminToken = '';
  let parentToken = '';
  let studentToken = '';
  let testAdmissionId = '';
  let testStudentId = '';
  let testOrderId = '';
  let testPaymentId = '';
  let receiptUrl = '';

  // Setup: Authenticate Admin, Parent, and Student
  await t.test('Authentication & Token Provisioning', async () => {
    // 1. Admin login
    const adminRes = await api('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'admin@vayentra.org', password: 'Gurukula@2026' }
    });
    assert.equal(adminRes.status, 200, `Admin login failed: ${adminRes.text}`);
    assert.ok(adminRes.json.token);
    adminToken = adminRes.json.token;

    // 2. Parent login
    const parentRes = await api('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'guardian@vayentra.org', password: 'Gurukula@2026' }
    });
    assert.equal(parentRes.status, 200, `Parent login failed: ${parentRes.text}`);
    assert.ok(parentRes.json.token);
    parentToken = parentRes.json.token;

    // 3. Student login (Aarav - Class 1)
    const studentRes = await api('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'student.grade1@vayentra.org', password: 'Gurukula@2026' }
    });
    assert.equal(studentRes.status, 200, `Student login failed: ${studentRes.text}`);
    assert.ok(studentRes.json.token);
    studentToken = studentRes.json.token;
  });

  // WORKFLOW A & B: Parent-led Admission Application
  await t.test('Workflow A & B: Parent-led Online Admission (POST /api/v1/admissions/apply)', async () => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const payload = {
      guardianName: `Test Parent ${randomSuffix}`,
      guardianPhone: `98765${Math.floor(10000 + Math.random() * 90000)}`,
      guardianEmail: `testparent_${randomSuffix}@vayentra.org`,
      studentName: `Aakash ${randomSuffix}`,
      grade: 4,
      board: 'CBSE',
      schoolName: 'Kendriya Vidyalaya Bangalore',
      consent: true
    };

    const res = await api('/api/v1/admissions/apply', {
      method: 'POST',
      body: payload
    });

    assert.equal(res.status, 201, `Expected 201 Created, got ${res.status}: ${JSON.stringify(res.json)}`);
    assert.ok(res.json.admissionId, 'Expected unique admission ID');
    assert.ok(res.json.studentId, 'Expected provisioned student ID');
    assert.equal(res.json.status, 'payment_pending');
    assert.equal(res.json.annualFeeInr, 599);

    testAdmissionId = res.json.admissionId;
    testStudentId = res.json.studentId;
  });

  // WORKFLOW C: Payment Order Initialization (₹599 / 59900 paise)
  await t.test('Workflow C: Create ₹599 Order (POST /api/v1/payments/orders)', async () => {
    const res = await api('/api/v1/payments/orders', {
      method: 'POST',
      body: {
        admissionId: testAdmissionId,
        studentId: testStudentId
      }
    });

    assert.equal(res.status, 200);
    assert.ok(res.json.orderId);
    assert.equal(res.json.amountPaise, 59900);
    assert.equal(res.json.currency, 'INR');

    testOrderId = res.json.orderId;
  });

  // WORKFLOW D: Cryptographic HMAC Signature Simulation & Verification
  await t.test('Workflow D: HMAC Signature Simulation & Verification (POST /api/v1/payments/verify)', async () => {
    testPaymentId = `pay_test_${Date.now()}`;

    // 1. Obtain test signature computed by server with authentic HMAC-SHA256
    const sigRes = await api('/api/v1/payments/test-signature', {
      method: 'POST',
      body: {
        orderId: testOrderId,
        paymentId: testPaymentId
      }
    });
    assert.equal(sigRes.status, 200);
    assert.ok(sigRes.json.signature);

    // 2. Submit payment verification payload
    const verifyRes = await api('/api/v1/payments/verify', {
      method: 'POST',
      body: {
        razorpay_order_id: testOrderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: sigRes.json.signature,
        studentId: testStudentId,
        admissionId: testAdmissionId
      }
    });

    assert.equal(verifyRes.status, 200);
    assert.equal(verifyRes.json.success, true);
    assert.ok(verifyRes.json.invoiceNumber);
    assert.equal(verifyRes.json.amountInr, 599);
    assert.equal(verifyRes.json.gstInr, 91.37);
    assert.ok(verifyRes.json.receiptUrl);
    assert.ok(verifyRes.json.subscription);
    assert.equal(verifyRes.json.subscription.status, 'active');

    receiptUrl = verifyRes.json.receiptUrl;
  });

  // WORKFLOW E: Idempotent Webhook Processing
  await t.test('Workflow E: Webhook Idempotency (POST /api/v1/payments/webhook)', async () => {
    const rawBody = JSON.stringify({
      event: 'payment.captured',
      event_id: `evt_test_${Date.now()}`,
      payload: {
        payment: {
          entity: {
            id: testPaymentId,
            order_id: testOrderId,
            amount: 59900,
            method: 'upi'
          }
        }
      }
    });

    const signature = crypto.createHmac('sha256', RAZORPAY_WEBHOOK_SECRET).update(rawBody).digest('hex');

    // First delivery
    const res1 = await fetch(BASE_URL + '/api/v1/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body: rawBody
    });
    const json1 = await res1.json();
    assert.equal(res1.status, 200);

    // Duplicate delivery with same event_id
    const res2 = await fetch(BASE_URL + '/api/v1/payments/webhook', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-razorpay-signature': signature
      },
      body: rawBody
    });
    const json2 = await res2.json();
    assert.equal(res2.status, 200);
    assert.equal(json2.status, 'duplicate_event_ignored');
  });

  // WORKFLOW F: Strict Role Navigation & Permission Boundaries
  await t.test('Workflow F: Role Security (Student blocked from Admin, Parent & Payment routes)', async () => {
    // 1. Student attempting to access Admin endpoint
    const adminBlocked = await api('/api/v1/admin/students', {
      token: studentToken
    });
    assert.equal(adminBlocked.status, 403);

    // 2. Student attempting to access Parent dashboard
    const parentBlocked = await api('/api/v1/parent/dashboard/stu-001', {
      token: studentToken
    });
    assert.equal(parentBlocked.status, 403);

    // 3. Student attempting to initialize payment order
    const paymentBlocked = await api('/api/v1/payments/orders', {
      method: 'POST',
      token: studentToken,
      body: { studentId: testStudentId }
    });
    assert.equal(paymentBlocked.status, 403);
    assert.equal(paymentBlocked.json.code, 'STUDENT_ACCESS_DENIED');
  });

  // WORKFLOW G: Unified Persistent Learning Progress (Classes 1–10)
  await t.test('Workflow G: Unified Learning Progress Persistence (POST & GET /api/v1/one-content/progress)', async () => {
    // 1. Save progress for student with active entitlement
    const saveRes = await api('/api/v1/one-content/progress', {
      method: 'POST',
      token: studentToken,
      body: {
        lessonId: 'c4-math-factors-multiples',
        score: 100,
        totalQuestions: 3,
        answers: { 'q1': 0, 'q2': 1, 'q3': 2 }
      }
    });

    assert.equal(saveRes.status, 200, `Progress save failed: ${saveRes.text}`);
    assert.equal(saveRes.json.success, true);
    assert.ok(saveRes.json.attemptId);

    // 2. Retrieve progress across devices
    const getRes = await api('/api/v1/one-content/progress', {
      token: studentToken
    });

    assert.equal(getRes.status, 200, `Progress get failed: ${getRes.text}`);
    assert.equal(getRes.json.success, true);
    assert.ok(Array.isArray(getRes.json.completedLessonIds));
    assert.ok(getRes.json.completedLessonIds.includes('c4-math-factors-multiples'));
  });

  // WORKFLOW H: GST Tax Invoice Retrieval (SAC 9992)
  await t.test('Workflow H: GST Tax Invoice Receipt Retrieval (GET /api/v1/payments/receipt/:id)', async () => {
    assert.ok(receiptUrl, 'Receipt URL must have been generated in Workflow D');

    const receiptRes = await api(receiptUrl, {
      token: adminToken
    });
    assert.equal(receiptRes.status, 200, `Receipt fetch failed: ${receiptRes.text}`);
    assert.ok(receiptRes.json.invoice);
    assert.equal(receiptRes.json.invoice.sacCode, '9992');
    assert.equal(receiptRes.json.invoice.pricing.totalInr, 599);
    assert.equal(receiptRes.json.invoice.supplier.name, 'Vayentra Gurukula Private Limited');
  });
});
