import { Router } from 'express';
import crypto from 'node:crypto';
import { db, withTransaction } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import {
  ANNUAL_PRICE_INR,
  ANNUAL_PRICE_PAISE,
  RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET,
  RAZORPAY_WEBHOOK_SECRET,
  checkStudentEntitlement,
  verifyRazorpaySignature,
  verifyWebhookSignature,
  activateSubscription
} from '../services/subscriptionService.js';
import {
  getBillingTaxConfig,
  isTaxConfigApproved,
  buildReceiptOrInvoice,
  getNextSequentialInvoiceNumber
} from '../services/billingConfig.js';
import {
  createGatewayOrder,
  fetchGatewayPayment
} from '../services/razorpayClient.js';

export const paymentsRouter = Router();

// Middleware: Prevent caching on financial routes
paymentsRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

/**
 * 1. Public Payment Gateway Config (Safe keys only)
 */
paymentsRouter.get('/config', (_req, res) => {
  const taxConfig = getBillingTaxConfig();
  res.json({
    keyId: RAZORPAY_KEY_ID,
    annualPriceInr: ANNUAL_PRICE_INR,
    annualPricePaise: ANNUAL_PRICE_PAISE,
    currency: 'INR',
    taxConfigStatus: taxConfig.status,
    taxConfigApproved: taxConfig.approved,
    plan: {
      id: 'plan-annual-599',
      name: 'Annual Gurukula Foundation Pass',
      priceInr: ANNUAL_PRICE_INR,
      billingPeriod: 'Annual (365 Days)',
      features: [
        'Foundational classes 1-2 pilot content only; paid enrolment paused pending security verification',
        'AI & Digital Thinking Enrichment Course',
        'Financial Literacy & Practical Money Skills',
        'On-device read-aloud audio narration (English, Hindi, Kannada)',
        'Zero advertising, zero tracking, 100% child safe (DPDP 2023)'
      ]
    }
  });
});

/**
 * FIX 1 (P0): Insecure /test-signature endpoint has been COMPLETELY REMOVED from the router.
 * Any request to POST /api/v1/payments/test-signature will return HTTP 404 (Not Found).
 * Simulated signature creation is isolated strictly to automated test suites.
 */

/**
 * 2. Create Razorpay Order
 * Accessible by Parents, Admins, or prospective parents during admission
 */
async function handleCreateOrder(req, res, authenticatedGuardianId = null, role = null) {
  const { studentId, admissionId } = req.body;
  let guardianId = authenticatedGuardianId || req.body.guardianId;

  let student;
  if (studentId) {
    student = db.prepare('SELECT id, guardian_id, name, grade, board FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ code: 'STUDENT_NOT_FOUND', message: 'Student record not found.' });
    }
    if (role === 'parent' && guardianId && student.guardian_id !== guardianId) {
      return res.status(403).json({ code: 'STUDENT_ACCESS_DENIED', message: 'You can only purchase subscriptions for your linked children.' });
    }
    guardianId = guardianId || student.guardian_id;
  } else if (admissionId) {
    const admission = db.prepare('SELECT * FROM admissions WHERE id = ?').get(admissionId);
    if (!admission) {
      return res.status(404).json({ code: 'ADMISSION_NOT_FOUND', message: 'Admission record not found.' });
    }

    // Require valid admission ownership or secure one-time checkout authorization
    const checkoutToken = req.body.checkoutToken || req.headers['x-checkout-token'] || req.query.token;
    const isOwnerGuardian = role === 'parent' && guardianId && admission.guardian_id === guardianId;
    const isAdmin = role === 'admin';
    const hasValidToken = Boolean(checkoutToken && admission.checkout_auth_token && checkoutToken === admission.checkout_auth_token);

    if (!isOwnerGuardian && !isAdmin && !hasValidToken) {
      return res.status(403).json({
        code: 'CHECKOUT_UNAUTHORIZED',
        message: 'Valid checkout authorization token or guardian sign-in is required to purchase this admission subscription.'
      });
    }

    student = {
      id: admission.student_id,
      guardian_id: admission.guardian_id,
      name: admission.student_name,
      grade: admission.grade,
      board: admission.board
    };
    guardianId = admission.guardian_id;
  } else {
    return res.status(400).json({ code: 'MISSING_STUDENT_ID', message: 'studentId or admissionId is required.' });
  }

  try {
    const invoiceNumber = getNextSequentialInvoiceNumber(db);
    const taxConfig = getBillingTaxConfig();
    const gstInr = taxConfig.approved ? taxConfig.gstInr : 0;
    const baseInr = taxConfig.approved ? taxConfig.baseInr : ANNUAL_PRICE_INR;

    // Create order through gateway adapter (official Razorpay API or verified sandbox)
    const gatewayOrder = await createGatewayOrder({
      amountPaise: ANNUAL_PRICE_PAISE,
      currency: 'INR',
      receipt: invoiceNumber,
      notes: {
        studentId: student.id,
        guardianId: guardianId || 'par-001',
        admissionId: admissionId || ''
      }
    });

    const orderId = gatewayOrder.orderId;
    const paymentRecordId = `payrec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO payments (
        id, guardian_id, student_id, plan_id, amount_inr, gst_inr,
        status, order_id, razorpay_order_id, payment_id, invoice_number, currency
      ) VALUES (?, ?, ?, 'plan-annual-599', ?, ?, 'created', ?, ?, 'pending', ?, 'INR')
    `).run(paymentRecordId, guardianId || 'par-001', student.id, ANNUAL_PRICE_INR, gstInr, orderId, orderId, invoiceNumber);

    res.json({
      success: true,
      orderId,
      amountPaise: ANNUAL_PRICE_PAISE,
      amountInr: ANNUAL_PRICE_INR,
      baseInr,
      gstInr,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID,
      studentId: student.id,
      studentName: student.name,
      guardianId,
      invoiceNumber
    });
  } catch (err) {
    console.error('[Payments Create Order Error]:', err);
    res.status(500).json({ code: 'ORDER_CREATION_FAILED', message: 'Unable to initialize payment order.' });
  }
}

paymentsRouter.post('/orders', (req, res) => {
  if (process.env.NODE_ENV !== 'test') return res.status(503).json({ code: 'PAYMENTS_PAUSED_SECURITY_REVIEW', message: 'Paid orders are disabled until security and content release checks are complete.' });
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authenticateToken(req, res, () => {
      if (req.user.role === 'student') {
        return res.status(403).json({ code: 'STUDENT_ACCESS_DENIED', message: 'Students cannot initiate checkout orders.' });
      }
      handleCreateOrder(req, res, req.user.guardianId, req.user.role);
    });
  } else if (req.body.admissionId) {
    handleCreateOrder(req, res, null, null);
  } else {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication or valid admissionId is required.' });
  }
});

/**
 * Atomic transaction helper for payment capture and subscription activation
 */
function captureAndActivate({ paymentRecordId, razorpay_payment_id, razorpay_signature, studentId, guardianId, orderId, amountInr, admissionId }) {
  return withTransaction(() => {
    db.prepare(`
      UPDATE payments
      SET status = 'Captured',
          payment_id = ?,
          razorpay_payment_id = ?,
          razorpay_signature = ?,
          method = 'razorpay'
      WHERE id = ?
    `).run(razorpay_payment_id, razorpay_payment_id, razorpay_signature, paymentRecordId);

    const activation = activateSubscription({
      studentId,
      guardianId,
      orderId,
      paymentId: razorpay_payment_id,
      amountInr,
      method: 'razorpay'
    });

    if (admissionId) {
      db.prepare(`
        UPDATE admissions
        SET status = 'enrolled',
            updated_at = datetime('now')
        WHERE id = ?
      `).run(admissionId);
    } else {
      db.prepare(`
        UPDATE admissions
        SET status = 'enrolled',
            updated_at = datetime('now')
        WHERE student_id = ? AND status = 'payment_pending'
      `).run(studentId);
    }

    db.prepare(`
      UPDATE one_memberships
      SET entitlement_status = 'enabled',
          updated_at = datetime('now')
      WHERE student_id = ?
    `).run(studentId);

    return activation;
  });
}

/**
 * 3. Verify Razorpay Payment Signature & Activate Subscription
 */
async function handleVerifyPayment(req, res, authUser = null) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId, admissionId } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !studentId) {
    return res.status(400).json({
      code: 'MISSING_VERIFICATION_PARAMS',
      message: 'razorpay_order_id, razorpay_payment_id, razorpay_signature, and studentId are required.'
    });
  }

  // 1. Cryptographic HMAC-SHA256 signature verification
  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    db.prepare(`
      UPDATE payments
      SET status = 'failed', failure_reason = 'Signature verification mismatch', razorpay_signature = ?
      WHERE order_id = ?
    `).run(razorpay_signature, razorpay_order_id);

    return res.status(400).json({
      code: 'INVALID_SIGNATURE',
      message: 'Payment verification failed: signature mismatch. Tampered or counterfeit callback detected.'
    });
  }

  // 2. Fetch payment record & verify server pricing
  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(razorpay_order_id);
  if (!payment) {
    return res.status(404).json({ code: 'PAYMENT_RECORD_NOT_FOUND', message: 'Matching order record not found.' });
  }

  // Verify student match
  if (payment.student_id !== studentId) {
    return res.status(400).json({ code: 'STUDENT_MISMATCH', message: 'Payment order belongs to a different student.' });
  }

  // Strict backend amount check (Must match server trusted pricing)
  if (payment.amount_inr !== ANNUAL_PRICE_INR) {
    return res.status(400).json({
      code: 'WRONG_PAYMENT_AMOUNT',
      message: `Invalid order amount. Expected ₹${ANNUAL_PRICE_INR}, found ₹${payment.amount_inr}.`
    });
  }

  // 3. Independently retrieve payment from Gateway (Never activate based only on HMAC callback)
  const gatewayPayment = await fetchGatewayPayment(razorpay_payment_id);
  if (!gatewayPayment) {
    return res.status(400).json({
      code: 'GATEWAY_PAYMENT_NOT_FOUND',
      message: 'Payment record could not be confirmed with the payment gateway.'
    });
  }

  if (gatewayPayment.status !== 'captured' && gatewayPayment.captured !== true) {
    db.prepare(`
      UPDATE payments
      SET status = 'failed', failure_reason = ?, razorpay_payment_id = ?
      WHERE order_id = ?
    `).run(`Gateway payment status is ${gatewayPayment.status}, not captured`, razorpay_payment_id, razorpay_order_id);

    return res.status(400).json({
      code: 'GATEWAY_PAYMENT_NOT_CAPTURED',
      message: `Gateway reports payment status as '${gatewayPayment.status}'. Subscriptions can only be activated for captured payments.`
    });
  }

  if (gatewayPayment.amount !== ANNUAL_PRICE_PAISE) {
    return res.status(400).json({
      code: 'GATEWAY_AMOUNT_MISMATCH',
      message: 'Payment amount does not match server pricing.'
    });
  }

  if (gatewayPayment.currency && gatewayPayment.currency !== 'INR') {
    return res.status(400).json({
      code: 'GATEWAY_CURRENCY_MISMATCH',
      message: 'Payment currency must be INR.'
    });
  }

  if (gatewayPayment.order_id && gatewayPayment.order_id !== razorpay_order_id) {
    return res.status(400).json({
      code: 'GATEWAY_ORDER_MISMATCH',
      message: 'Gateway payment is attached to a different order.'
    });
  }

  const guardianId = authUser?.guardianId || payment.guardian_id || 'par-001';

  // 5. Idempotency Check: if already captured for this exact order & paymentId, return existing active state
  if (payment.status === 'Captured' && payment.payment_id === razorpay_payment_id) {
    const entitlement = checkStudentEntitlement(studentId);
    return res.json({
      success: true,
      idempotent: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      invoiceNumber: payment.invoice_number,
      amountInr: payment.amount_inr,
      subscription: entitlement.subscription,
      receiptUrl: `/api/v1/payments/receipt/${payment.id}`,
      message: 'Payment already verified and active.'
    });
  }

  // 6. Prevent Replay Attack: check if this razorpay_payment_id was already captured on ANY other order
  const alreadyUsedPayment = db.prepare(`
    SELECT id, order_id, status FROM payments 
    WHERE razorpay_payment_id = ? AND status = 'Captured' AND id != ?
  `).get(razorpay_payment_id, payment.id);

  if (alreadyUsedPayment) {
    return res.status(409).json({
      code: 'PAYMENT_ID_ALREADY_USED',
      message: 'This payment identifier has already activated another subscription and cannot be reused.'
    });
  }

  // 7. Execute atomic capture & subscription activation
  try {
    const activation = captureAndActivate({
      paymentRecordId: payment.id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      guardianId,
      orderId: razorpay_order_id,
      amountInr: payment.amount_inr,
      admissionId: admissionId || null
    });

    const student = db.prepare('SELECT id, name, grade, board, enrollment_number FROM students WHERE id = ?').get(studentId);
    const link = db.prepare('SELECT u.email FROM one_student_account_links l JOIN users u ON u.id = l.user_id WHERE l.student_id = ?').get(studentId);

    res.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      invoiceNumber: payment.invoice_number,
      amountInr: payment.amount_inr,
      gstInr: payment.gst_inr,
      subscription: activation.subscription,
      studentName: student?.name,
      studentEmail: link?.email,
      enrollmentNumber: student?.enrollment_number,
      receiptUrl: `/api/v1/payments/receipt/${payment.id}`,
      message: 'Subscription successfully activated for 365 days.'
    });
  } catch (err) {
    console.error('[Payment Verification Transaction Failed]:', err);
    res.status(500).json({ code: 'VERIFICATION_TRANSACTION_FAILED', message: 'Could not complete entitlement activation.' });
  }
}

paymentsRouter.post('/verify', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    authenticateToken(req, res, () => {
      if (req.user.role === 'student') {
        return res.status(403).json({ code: 'STUDENT_ACCESS_DENIED', message: 'Students cannot verify payments.' });
      }
      handleVerifyPayment(req, res, req.user);
    });
  } else {
    // Authorized via HMAC signature
    handleVerifyPayment(req, res, null);
  }
});

/**
 * Webhook capture atomic transaction helper
 */
function webhookCapture({ paymentRecordId, paymentId, eventId, method, studentId, guardianId, orderId, amountInr }) {
  return withTransaction(() => {
    db.prepare(`
      UPDATE payments
      SET status = 'Captured',
          payment_id = ?,
          razorpay_payment_id = ?,
          method = ?,
          webhook_event_id = ?
      WHERE id = ?
    `).run(paymentId, paymentId, method, eventId, paymentRecordId);

    if (studentId) {
      activateSubscription({
        studentId,
        guardianId,
        orderId,
        paymentId,
        amountInr,
        method
      });

      db.prepare(`
        UPDATE admissions
        SET status = 'enrolled',
            updated_at = datetime('now')
        WHERE student_id = ? AND status = 'payment_pending'
      `).run(studentId);

      db.prepare(`
        UPDATE one_memberships
        SET entitlement_status = 'enabled',
            updated_at = datetime('now')
        WHERE student_id = ?
      `).run(studentId);
    }
  });
}

/**
 * 4. Razorpay Webhook Handler (Durable, Idempotent, HMAC-verified)
 */
paymentsRouter.post('/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  if (!signature) {
    return res.status(400).json({ code: 'MISSING_WEBHOOK_SIGNATURE', message: 'x-razorpay-signature header is mandatory.' });
  }

  const rawBody = req.rawBody;
  if (!rawBody || typeof rawBody !== 'string') {
    return res.status(400).json({ code: 'RAW_BODY_MISSING', message: 'Raw request body is required for cryptographic HMAC verification.' });
  }

  const event = req.body?.event;
  const payload = req.body?.payload?.payment?.entity;

  if (!event) {
    return res.status(400).json({ code: 'INVALID_WEBHOOK_PAYLOAD', message: 'Incomplete webhook notification event.' });
  }

  // Strict HMAC signature check on raw request body
  const isValid = verifyWebhookSignature(rawBody, signature);
  if (!isValid) {
    console.warn('[Razorpay Webhook] Invalid webhook signature detected.');
    return res.status(400).json({ code: 'INVALID_WEBHOOK_SIGNATURE', message: 'Webhook signature validation failed.' });
  }

  const orderId = payload?.order_id || req.body?.payload?.order?.entity?.id;
  const paymentId = payload?.id;
  const eventId = req.body?.event_id || req.headers['x-razorpay-event-id'] || `evt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

  // Check if this webhook event was already recorded in durable ledger
  const existingEvent = db.prepare('SELECT id, processed_status FROM payment_webhook_events WHERE event_id = ?').get(eventId);
  if (existingEvent) {
    return res.status(200).json({ status: 'duplicate_event_ignored', eventId });
  }

  // Record pending event in durable table
  const webhookRecordId = `whk-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
  try {
    db.prepare(`
      INSERT INTO payment_webhook_events (
        id, event_id, event_type, payment_id, order_id, payload_json, processed_status
      ) VALUES (?, ?, ?, ?, ?, ?, 'processed')
    `).run(webhookRecordId, eventId, event, paymentId || null, orderId || null, JSON.stringify(req.body));
  } catch (err) {
    return res.status(200).json({ status: 'duplicate_event_ignored', eventId });
  }

  // Check if order exists in payments table
  if (!orderId) {
    return res.status(200).json({ status: 'untracked_order_ignored' });
  }

  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);
  if (!payment) {
    return res.status(200).json({ status: 'ignored_untracked_order' });
  }

  // Handle Event Types
  if (event === 'payment.captured') {
    if (payload?.amount !== ANNUAL_PRICE_PAISE) {
      db.prepare(`
        UPDATE payments
        SET status = 'failed', failure_reason = 'Webhook amount mismatch'
        WHERE id = ?
      `).run(payment.id);
      return res.status(200).json({ status: 'amount_mismatch_rejected' });
    }

    try {
      webhookCapture({
        paymentRecordId: payment.id,
        paymentId,
        eventId,
        method: payload.method || 'razorpay',
        studentId: payment.student_id,
        guardianId: payment.guardian_id,
        orderId,
        amountInr: payment.amount_inr
      });

      return res.status(200).json({ status: 'subscription_activated' });
    } catch (err) {
      console.error('[Webhook Processing Error]:', err);
      return res.status(500).json({ code: 'WEBHOOK_PROCESSING_FAILED' });
    }
  }

  if (event === 'payment.failed') {
    db.prepare(`
      UPDATE payments
      SET status = 'failed',
          failure_reason = ?,
          webhook_event_id = ?
      WHERE id = ?
    `).run(payload?.error_description || 'Payment failed at gateway', eventId, payment.id);

    return res.status(200).json({ status: 'failure_recorded' });
  }

  if (event === 'refund.processed') {
    const refundPayload = req.body?.payload?.refund?.entity;
    const refundId = refundPayload?.id || `rfd_${Date.now()}`;
    const refundAmountInr = (refundPayload?.amount || 0) / 100;

    try {
      db.prepare(`
        INSERT INTO payment_refunds (id, payment_id, razorpay_refund_id, amount_inr, reason, status)
        VALUES (?, ?, ?, ?, ?, 'processed')
      `).run(`rfd-rec-${Date.now()}`, payment.id, refundId, refundAmountInr, refundPayload?.notes?.reason || 'Customer requested refund');

      db.prepare("UPDATE payments SET status = 'refunded' WHERE id = ?").run(payment.id);
      db.prepare("UPDATE student_subscriptions SET status = 'refunded' WHERE payment_id = ?").run(payment.payment_id);
    } catch (e) {
      console.warn('[Webhook Refund Recording Warning]:', e);
    }

    return res.status(200).json({ status: 'refund_processed' });
  }

  res.status(200).json({ status: 'event_processed' });
});

/**
 * 5. Get Student Subscription Status (Protected by Family Ownership Boundary)
 */
paymentsRouter.get('/student/:studentId/status', authenticateToken, (req, res) => {
  const { studentId } = req.params;
  const user = req.user;

  if (user.role === 'parent') {
    const student = db.prepare('SELECT guardian_id FROM students WHERE id = ?').get(studentId);
    if (!student || student.guardian_id !== user.guardianId) {
      return res.status(403).json({ code: 'STUDENT_ACCESS_DENIED', message: 'You can only view status for your linked children.' });
    }
  } else if (user.role === 'student') {
    const link = db.prepare('SELECT student_id FROM one_student_account_links WHERE user_id = ?').get(user.id);
    if (!link || link.student_id !== studentId) {
      return res.status(403).json({ code: 'STUDENT_ACCESS_DENIED', message: 'You can only view your own status.' });
    }
  } else if (user.role !== 'admin') {
    return res.status(403).json({ code: 'ACCESS_DENIED' });
  }

  const status = checkStudentEntitlement(studentId);
  res.json(status);
});

/**
 * 6. Parent Payment History
 */
paymentsRouter.get('/history', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const guardianId = req.user.guardianId || 'par-001';
  try {
    const list = db.prepare(`
      SELECT p.*, s.name as student_name, s.grade, s.board
      FROM payments p
      LEFT JOIN students s ON s.id = p.student_id
      WHERE p.guardian_id = ?
      ORDER BY p.created_at DESC
    `).all(guardianId);

    const subscriptions = db.prepare(`
      SELECT sub.*, s.name as student_name, s.grade, s.board
      FROM student_subscriptions sub
      JOIN students s ON s.id = sub.student_id
      WHERE sub.guardian_id = ?
      ORDER BY sub.expires_at DESC
    `).all(guardianId);

    res.json({
      payments: list.map(p => ({
        id: p.id,
        orderId: p.order_id,
        paymentId: p.payment_id,
        amountInr: p.amount_inr,
        gstInr: p.gst_inr,
        status: p.status,
        invoiceNumber: p.invoice_number,
        createdAt: p.created_at,
        studentId: p.student_id,
        studentName: p.student_name,
        grade: p.grade,
        board: p.board,
        failureReason: p.failure_reason
      })),
      subscriptions: subscriptions.map(s => {
        const diffDays = Math.ceil((new Date(s.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
        return {
          id: s.id,
          studentId: s.student_id,
          studentName: s.student_name,
          grade: s.grade,
          board: s.board,
          planId: s.plan_id,
          status: diffDays > 0 ? s.status : 'expired',
          startsAt: s.starts_at,
          expiresAt: s.expires_at,
          daysRemaining: Math.max(0, diffDays),
          needsRenewal: diffDays <= 30
        };
      })
    });
  } catch (err) {
    console.error('[Payments History Error]:', err);
    res.status(500).json({ code: 'HISTORY_FETCH_FAILED' });
  }
});

/**
 * 7. Fee Receipt (Provisional Fee Receipt when tax config is unapproved; Tax Invoice when approved)
 */
paymentsRouter.get('/receipt/:paymentId', authenticateToken, (req, res) => {
  const { paymentId } = req.params;
  try {
    const payment = db.prepare(`
      SELECT p.*, g.user_id, u.name as guardian_name, u.email as guardian_email, u.mobile as guardian_phone,
             s.name as student_name, s.grade, s.board, s.enrollment_number
      FROM payments p
      LEFT JOIN guardians g ON g.id = p.guardian_id
      LEFT JOIN users u ON u.id = g.user_id
      LEFT JOIN students s ON s.id = p.student_id
      WHERE p.id = ? OR p.payment_id = ? OR p.order_id = ?
    `).get(paymentId, paymentId, paymentId);

    if (!payment) {
      return res.status(404).json({ code: 'RECEIPT_NOT_FOUND', message: 'Invoice or payment receipt not found.' });
    }

    if (req.user.role === 'parent' && req.user.guardianId && req.user.guardianId !== payment.guardian_id) {
      return res.status(403).json({ code: 'RECEIPT_ACCESS_DENIED' });
    }

    if (req.user.role === 'student') {
      const link = db.prepare('SELECT student_id FROM one_student_account_links WHERE user_id = ?').get(req.user.id);
      if (!link || link.student_id !== payment.student_id) {
        return res.status(403).json({ code: 'RECEIPT_ACCESS_DENIED' });
      }
    }

    const receipt = buildReceiptOrInvoice({
      payment,
      guardian: { name: payment.guardian_name, email: payment.guardian_email, mobile: payment.guardian_phone },
      student: { name: payment.student_name, grade: payment.grade, board: payment.board, enrollment_number: payment.enrollment_number },
      forceOfficialInvoice: false
    });

    res.json({ invoice: receipt, receipt });
  } catch (err) {
    console.error('[Payment Receipt Error]:', err);
    res.status(500).json({ code: 'RECEIPT_GENERATION_FAILED' });
  }
});

/**
 * 8. Official Tax Invoice Generation
 * If TAX_CONFIG_APPROVED !== 'true', this route explicitly blocks with HTTP 428 Precondition Required.
 */
paymentsRouter.get('/invoice/:paymentId', authenticateToken, (req, res) => {
  const { paymentId } = req.params;
  try {
    const payment = db.prepare(`
      SELECT p.*, g.user_id, u.name as guardian_name, u.email as guardian_email, u.mobile as guardian_phone,
             s.name as student_name, s.grade, s.board, s.enrollment_number
      FROM payments p
      LEFT JOIN guardians g ON g.id = p.guardian_id
      LEFT JOIN users u ON u.id = g.user_id
      LEFT JOIN students s ON s.id = p.student_id
      WHERE p.id = ? OR p.payment_id = ? OR p.order_id = ?
    `).get(paymentId, paymentId, paymentId);

    if (!payment) {
      return res.status(404).json({ code: 'INVOICE_NOT_FOUND', message: 'Payment record not found.' });
    }

    if (req.user.role === 'parent' && req.user.guardianId && req.user.guardianId !== payment.guardian_id) {
      return res.status(403).json({ code: 'INVOICE_ACCESS_DENIED' });
    }

    if (req.user.role === 'student') {
      const link = db.prepare('SELECT student_id FROM one_student_account_links WHERE user_id = ?').get(req.user.id);
      if (!link || link.student_id !== payment.student_id) {
        return res.status(403).json({ code: 'INVOICE_ACCESS_DENIED' });
      }
    }

    try {
      const invoice = buildReceiptOrInvoice({
        payment,
        guardian: { name: payment.guardian_name, email: payment.guardian_email, mobile: payment.guardian_phone },
        student: { name: payment.student_name, grade: payment.grade, board: payment.board, enrollment_number: payment.enrollment_number },
        forceOfficialInvoice: true
      });
      res.json({ invoice });
    } catch (err) {
      if (err.code === 'TAX_CONFIGURATION_PENDING_APPROVAL') {
        return res.status(428).json({
          code: 'TAX_CONFIGURATION_PENDING_APPROVAL',
          message: 'Official GST Tax Invoice cannot be issued because business tax configuration is pending approval by management and chartered accountant. Provisional Fee Receipt is available.',
          provisionalReceiptUrl: `/api/v1/payments/receipt/${payment.id}`
        });
      }
      throw err;
    }
  } catch (err) {
    console.error('[Tax Invoice Route Error]:', err);
    res.status(500).json({ code: 'INVOICE_GENERATION_FAILED' });
  }
});

/**
 * 9. Admin Financial Ledger & Reconciliation
 */
paymentsRouter.get('/admin/ledger', authenticateToken, requireRole('admin'), (req, res) => {
  const statusFilter = req.query.status || 'all';
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const taxConfig = getBillingTaxConfig();

  try {
    const paymentsQuery = statusFilter === 'all'
      ? 'SELECT p.*, s.name as student_name, g.user_id FROM payments p LEFT JOIN students s ON s.id = p.student_id JOIN guardians g ON g.id = p.guardian_id ORDER BY p.created_at DESC LIMIT ?'
      : 'SELECT p.*, s.name as student_name, g.user_id FROM payments p LEFT JOIN students s ON s.id = p.student_id JOIN guardians g ON g.id = p.guardian_id WHERE p.status = ? ORDER BY p.created_at DESC LIMIT ?';

    const transactions = statusFilter === 'all'
      ? db.prepare(paymentsQuery).all(limit)
      : db.prepare(paymentsQuery).all(statusFilter, limit);

    const totalCollected = db.prepare("SELECT SUM(amount_inr) as total FROM payments WHERE status = 'Captured'").get()?.total || 0;
    const activeSubCount = db.prepare("SELECT COUNT(*) as c FROM student_subscriptions WHERE status = 'active' AND expires_at > datetime('now')").get()?.c || 0;
    const expiredSubCount = db.prepare("SELECT COUNT(*) as c FROM student_subscriptions WHERE expires_at <= datetime('now')").get()?.c || 0;
    const failedTxCount = db.prepare("SELECT COUNT(*) as c FROM payments WHERE status = 'failed'").get()?.c || 0;
    const webhookCount = db.prepare("SELECT COUNT(*) as c FROM payment_webhook_events WHERE processed_status = 'processed'").get()?.c || 0;

    res.json({
      metrics: {
        totalCollectedInr: totalCollected,
        activeSubscriptions: activeSubCount,
        expiredSubscriptions: expiredSubCount,
        failedTransactions: failedTxCount,
        processedWebhooks: webhookCount,
        annualPlanRate: ANNUAL_PRICE_INR,
        digitalSubscriptionOnly: true,
        physicalTuitionCoachingIncluded: false,
        taxConfigurationStatus: taxConfig.status
      },
      transactions: transactions.map(t => ({
        id: t.id,
        orderId: t.order_id,
        paymentId: t.payment_id,
        invoiceNumber: t.invoice_number,
        studentName: t.student_name || 'N/A',
        amountInr: t.amount_inr,
        status: t.status,
        failureReason: t.failure_reason,
        createdAt: t.created_at
      }))
    });
  } catch (err) {
    console.error('[Admin Ledger Error]:', err);
    res.status(500).json({ code: 'LEDGER_FETCH_FAILED' });
  }
});

/**
 * 10. Admin Payment Reconciliation Endpoint
 */
paymentsRouter.get('/admin/reconcile', authenticateToken, requireRole('admin'), (_req, res) => {
  try {
    const totalPayments = db.prepare("SELECT COUNT(*) as count, SUM(amount_inr) as sum FROM payments WHERE status = 'Captured'").get();
    const totalSubscriptions = db.prepare("SELECT COUNT(*) as count FROM student_subscriptions WHERE status = 'active'").get();
    const orphanedPayments = db.prepare(`
      SELECT p.id, p.order_id, p.payment_id, p.student_id 
      FROM payments p 
      LEFT JOIN student_subscriptions s ON s.payment_id = p.payment_id
      WHERE p.status = 'Captured' AND s.id IS NULL
    `).all();
    const webhookEventsCount = db.prepare("SELECT processed_status, COUNT(*) as c FROM payment_webhook_events GROUP BY processed_status").all();

    res.json({
      reconciled: orphanedPayments.length === 0,
      capturedPaymentsCount: totalPayments.count || 0,
      totalCapturedAmountInr: totalPayments.sum || 0,
      activeSubscriptionsCount: totalSubscriptions.count || 0,
      orphanedPaymentsCount: orphanedPayments.length,
      orphanedPayments,
      webhookStatusBreakdown: webhookEventsCount,
      taxStatus: getBillingTaxConfig()
    });
  } catch (err) {
    console.error('[Payment Reconciliation Error]:', err);
    res.status(500).json({ code: 'RECONCILIATION_FAILED' });
  }
});
