import { Router } from 'express';
import crypto from 'node:crypto';
import { db } from '../db/database.js';
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
  res.json({
    keyId: RAZORPAY_KEY_ID,
    annualPriceInr: ANNUAL_PRICE_INR,
    annualPricePaise: ANNUAL_PRICE_PAISE,
    currency: 'INR',
    plan: {
      id: 'plan-annual-599',
      name: 'Annual Gurukula Foundation Pass',
      priceInr: ANNUAL_PRICE_INR,
      billingPeriod: 'Annual (365 Days)',
      features: [
        'Full CBSE & Karnataka State Board curriculum (Classes 1-10)',
        'AI & Digital Thinking Enrichment Course',
        'Financial Literacy & Practical Money Skills',
        'On-device read-aloud audio narration (English, Hindi, Kannada)',
        'Zero advertising, zero tracking, 100% child safe (DPDP 2023)'
      ]
    }
  });
});

/**
 * 2. Create Razorpay Order
 * Accessible by Parents, Admins, or prospective parents during admission
 */
paymentsRouter.post('/orders', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const { studentId, admissionId } = req.body;
  const guardianId = req.user.guardianId || req.body.guardianId || 'par-001';

  let student;
  if (studentId) {
    student = db.prepare('SELECT id, guardian_id, name, grade, board FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ code: 'STUDENT_NOT_FOUND', message: 'Student record not found.' });
    }
    // Verify guardian ownership if caller is parent
    if (req.user.role === 'parent' && student.guardian_id !== guardianId) {
      return res.status(403).json({ code: 'STUDENT_ACCESS_DENIED', message: 'You can only purchase subscriptions for your linked children.' });
    }
  } else if (admissionId) {
    const admission = db.prepare('SELECT * FROM admissions WHERE id = ?').get(admissionId);
    if (!admission) {
      return res.status(404).json({ code: 'ADMISSION_NOT_FOUND', message: 'Admission record not found.' });
    }
    student = {
      id: admission.student_id,
      guardian_id: admission.guardian_id,
      name: admission.student_name,
      grade: admission.grade,
      board: admission.board
    };
  } else {
    return res.status(400).json({ code: 'MISSING_STUDENT_ID', message: 'studentId or admissionId is required.' });
  }

  try {
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const invoiceNumber = `VG-INV-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    const baseInr = Math.round((ANNUAL_PRICE_INR / 1.18) * 100) / 100;
    const gstInr = Math.round((ANNUAL_PRICE_INR - baseInr) * 100) / 100;

    const paymentRecordId = `payrec-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
    db.prepare(`
      INSERT INTO payments (
        id, guardian_id, student_id, plan_id, amount_inr, gst_inr,
        status, order_id, razorpay_order_id, payment_id, invoice_number, currency
      ) VALUES (?, ?, ?, 'plan-annual-599', ?, ?, 'created', ?, ?, 'pending', ?, 'INR')
    `).run(paymentRecordId, guardianId, student.id, ANNUAL_PRICE_INR, gstInr, orderId, orderId, invoiceNumber);

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
});

/**
 * 3. Verify Razorpay Payment Signature & Activate Subscription
 */
paymentsRouter.post('/verify', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, studentId } = req.body;
  const guardianId = req.user.guardianId || req.body.guardianId || 'par-001';

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !studentId) {
    return res.status(400).json({
      code: 'MISSING_VERIFICATION_PARAMS',
      message: 'razorpay_order_id, razorpay_payment_id, razorpay_signature, and studentId are required.'
    });
  }

  // 1. Cryptographic HMAC-SHA256 signature verification
  const isValid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    // Record failed attempt
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

  // 2. Fetch payment record
  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(razorpay_order_id);
  if (!payment) {
    return res.status(404).json({ code: 'PAYMENT_RECORD_NOT_FOUND', message: 'Matching order record not found.' });
  }

  // 3. Strict backend amount check (Must be ₹599)
  if (payment.amount_inr !== ANNUAL_PRICE_INR) {
    return res.status(400).json({
      code: 'WRONG_PAYMENT_AMOUNT',
      message: `Invalid order amount. Expected ₹${ANNUAL_PRICE_INR}, found ₹${payment.amount_inr}.`
    });
  }

  // 4. Idempotency Check: if already captured, return existing receipt
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

  // 5. Update payment record to Captured
  db.prepare(`
    UPDATE payments
    SET status = 'Captured',
        payment_id = ?,
        razorpay_payment_id = ?,
        razorpay_signature = ?,
        method = 'razorpay'
    WHERE id = ?
  `).run(razorpay_payment_id, razorpay_payment_id, razorpay_signature, payment.id);

  // 6. Activate 365-day subscription
  const activation = activateSubscription({
    studentId,
    guardianId,
    orderId: razorpay_order_id,
    paymentId: razorpay_payment_id,
    amountInr: payment.amount_inr,
    method: 'razorpay'
  });

  res.json({
    success: true,
    paymentId: razorpay_payment_id,
    orderId: razorpay_order_id,
    invoiceNumber: payment.invoice_number,
    amountInr: payment.amount_inr,
    gstInr: payment.gst_inr,
    subscription: activation.subscription,
    receiptUrl: `/api/v1/payments/receipt/${payment.id}`,
    message: 'Subscription successfully activated for 365 days.'
  });
});

/**
 * 4. Razorpay Webhook Handler (Idempotent background processor)
 */
paymentsRouter.post('/webhook', (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const event = req.body?.event;
  const payload = req.body?.payload?.payment?.entity;

  if (!signature || !event || !payload) {
    return res.status(400).json({ code: 'INVALID_WEBHOOK_PAYLOAD', message: 'Incomplete webhook notification.' });
  }

  // Verify webhook signature if raw body is available
  if (req.rawBody) {
    const isValid = verifyWebhookSignature(req.rawBody, signature);
    if (!isValid) {
      console.warn('[Razorpay Webhook] Invalid webhook signature detected.');
      return res.status(400).json({ code: 'INVALID_WEBHOOK_SIGNATURE' });
    }
  }

  const orderId = payload.order_id;
  const paymentId = payload.id;
  const eventId = req.body?.event_id || `evt_${Date.now()}`;

  // Check if order exists in payments table
  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').get(orderId);
  if (!payment) {
    return res.status(200).json({ status: 'ignored_untracked_order' });
  }

  // Check webhook idempotency
  if (payment.webhook_event_id === eventId) {
    return res.status(200).json({ status: 'duplicate_event_ignored' });
  }

  if (event === 'payment.captured') {
    // Validate amount
    if (payload.amount !== ANNUAL_PRICE_PAISE) {
      db.prepare(`
        UPDATE payments
        SET status = 'failed', failure_reason = 'Webhook amount mismatch'
        WHERE id = ?
      `).run(payment.id);
      return res.status(200).json({ status: 'amount_mismatch_rejected' });
    }

    db.prepare(`
      UPDATE payments
      SET status = 'Captured',
          payment_id = ?,
          razorpay_payment_id = ?,
          method = ?,
          webhook_event_id = ?
      WHERE id = ?
    `).run(paymentId, paymentId, payload.method || 'razorpay', eventId, payment.id);

    // Activate subscription
    if (payment.student_id) {
      activateSubscription({
        studentId: payment.student_id,
        guardianId: payment.guardian_id,
        orderId,
        paymentId,
        amountInr: payment.amount_inr,
        method: payload.method || 'razorpay'
      });
    }

    return res.status(200).json({ status: 'subscription_activated' });
  }

  if (event === 'payment.failed') {
    db.prepare(`
      UPDATE payments
      SET status = 'failed',
          failure_reason = ?,
          webhook_event_id = ?
      WHERE id = ?
    `).run(payload.error_description || 'Payment failed at gateway', eventId, payment.id);

    return res.status(200).json({ status: 'failure_recorded' });
  }

  res.status(200).json({ status: 'event_processed' });
});

/**
 * 5. Get Student Subscription Status
 */
paymentsRouter.get('/student/:studentId/status', authenticateToken, (req, res) => {
  const { studentId } = req.params;
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
 * 7. Tax Invoice & Fee Receipt Generation
 */
paymentsRouter.get('/receipt/:paymentId', authenticateToken, (req, res) => {
  const { paymentId } = req.params;
  try {
    const payment = db.prepare(`
      SELECT p.*, g.user_id, u.name as guardian_name, u.email as guardian_email, u.mobile as guardian_phone,
             s.name as student_name, s.grade, s.board, s.enrollment_number
      FROM payments p
      JOIN guardians g ON g.id = p.guardian_id
      JOIN users u ON u.id = g.user_id
      LEFT JOIN students s ON s.id = p.student_id
      WHERE p.id = ? OR p.payment_id = ? OR p.order_id = ?
    `).get(paymentId, paymentId, paymentId);

    if (!payment) {
      return res.status(404).json({ code: 'RECEIPT_NOT_FOUND', message: 'Invoice or payment receipt not found.' });
    }

    // Security check: caller must be admin or the owner guardian
    if (req.user.role === 'parent' && req.user.guardianId && req.user.guardianId !== payment.guardian_id) {
      return res.status(403).json({ code: 'RECEIPT_ACCESS_DENIED' });
    }

    const baseInr = Math.round((payment.amount_inr / 1.18) * 100) / 100;
    const cgstInr = Math.round(((payment.amount_inr - baseInr) / 2) * 100) / 100;
    const sgstInr = Math.round((payment.amount_inr - baseInr - cgstInr) * 100) / 100;

    res.json({
      invoice: {
        invoiceNumber: payment.invoice_number,
        date: payment.created_at,
        status: payment.status,
        academicYear: '2026-27',
        sacCode: '9992', // Educational Technology Support Services
        serviceDescription: 'Vayentra Gurukula Annual Foundation Learning Pass (Classes 1-10)',
        supplier: {
          name: 'Vayentra Gurukula Private Limited',
          address: '42 Gurukula Way, Indiranagar, Bengaluru, Karnataka 560038, India',
          gstin: '29AAACV2026F1Z5',
          stateCode: '29 (Karnataka)'
        },
        recipient: {
          guardianName: payment.guardian_name,
          guardianPhone: payment.guardian_phone || 'N/A',
          guardianEmail: payment.guardian_email || 'N/A',
          studentName: payment.student_name || 'Enrolled Student',
          enrollmentNumber: payment.enrollment_number || 'VG-ONE-2026-STUDENT',
          grade: payment.grade ? `Class ${payment.grade}` : 'Foundation',
          board: payment.board || 'CBSE'
        },
        pricing: {
          currency: 'INR',
          baseInr,
          cgstInr,
          sgstInr,
          totalInr: payment.amount_inr
        },
        paymentDetails: {
          gateway: 'Razorpay Standard Checkout',
          orderId: payment.order_id,
          paymentId: payment.payment_id,
          settlementStatus: payment.status
        }
      }
    });
  } catch (err) {
    console.error('[Payment Receipt Error]:', err);
    res.status(500).json({ code: 'RECEIPT_GENERATION_FAILED' });
  }
});

/**
 * 8. Admin Financial Ledger & Reconciliation
 */
paymentsRouter.get('/admin/ledger', authenticateToken, requireRole('admin'), (req, res) => {
  const statusFilter = req.query.status || 'all';
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));

  try {
    const paymentsQuery = statusFilter === 'all'
      ? 'SELECT p.*, s.name as student_name, g.user_id FROM payments p LEFT JOIN students s ON s.id = p.student_id JOIN guardians g ON g.id = p.guardian_id ORDER BY p.created_at DESC LIMIT ?'
      : 'SELECT p.*, s.name as student_name, g.user_id FROM payments p LEFT JOIN students s ON s.id = p.student_id JOIN guardians g ON g.id = p.guardian_id WHERE p.status = ? ORDER BY p.created_at DESC LIMIT ?';

    const transactions = statusFilter === 'all'
      ? db.prepare(paymentsQuery).all(limit)
      : db.prepare(paymentsQuery).all(statusFilter, limit);

    // Summary metrics
    const totalCollected = db.prepare("SELECT SUM(amount_inr) as total FROM payments WHERE status = 'Captured'").get()?.total || 0;
    const activeSubCount = db.prepare("SELECT COUNT(*) as c FROM student_subscriptions WHERE status = 'active' AND expires_at > datetime('now')").get()?.c || 0;
    const expiredSubCount = db.prepare("SELECT COUNT(*) as c FROM student_subscriptions WHERE expires_at <= datetime('now')").get()?.c || 0;
    const failedTxCount = db.prepare("SELECT COUNT(*) as c FROM payments WHERE status = 'failed'").get()?.c || 0;

    res.json({
      metrics: {
        totalCollectedInr: totalCollected,
        activeSubscriptions: activeSubCount,
        expiredSubscriptions: expiredSubCount,
        failedTransactions: failedTxCount,
        annualPlanRate: ANNUAL_PRICE_INR
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
