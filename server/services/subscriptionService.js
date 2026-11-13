import crypto from 'node:crypto';
import { db } from '../db/database.js';

export const ANNUAL_PRICE_INR = Number(process.env.VAYENTRA_ANNUAL_PRICE_INR || 599);
export const ANNUAL_PRICE_PAISE = Math.round(ANNUAL_PRICE_INR * 100);
export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_vayentra_gurukula';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'vayentra_razorpay_secret_test_2026';
export const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || 'vayentra_webhook_secret_test_2026';

/**
 * Check whether a student has an active paid subscription or pilot grant.
 * Server decides strictly from database timestamps.
 */
export function checkStudentEntitlement(studentId) {
  if (!studentId) return { active: false, status: 'not_configured', subscription: null };

  // 1. Check for active paid student subscription (expires_at > datetime('now'))
  const activeSub = db.prepare(`
    SELECT * FROM student_subscriptions
    WHERE student_id = ? AND status = 'active' AND expires_at > datetime('now')
    ORDER BY expires_at DESC LIMIT 1
  `).get(studentId);

  if (activeSub) {
    // Keep one_memberships aligned
    db.prepare(`
      UPDATE one_memberships
      SET entitlement_status = 'enabled', updated_at = datetime('now')
      WHERE student_id = ? AND entitlement_status != 'enabled'
    `).run(studentId);

    const diffDays = Math.ceil((new Date(activeSub.expires_at) - new Date()) / (1000 * 60 * 60 * 24));
    return {
      active: true,
      status: 'enabled',
      subscription: activeSub,
      daysRemaining: Math.max(0, diffDays),
      expiresAt: activeSub.expires_at
    };
  }

  // 2. Check if there was an expired subscription
  const pastSub = db.prepare(`
    SELECT * FROM student_subscriptions
    WHERE student_id = ?
    ORDER BY expires_at DESC LIMIT 1
  `).get(studentId);

  if (pastSub) {
    db.prepare(`
      UPDATE student_subscriptions
      SET status = 'expired', updated_at = datetime('now')
      WHERE id = ? AND status != 'expired'
    `).run(pastSub.id);

    db.prepare(`
      UPDATE one_memberships
      SET entitlement_status = 'expired', updated_at = datetime('now')
      WHERE student_id = ? AND entitlement_status = 'enabled'
    `).run(studentId);

    return {
      active: false,
      status: 'expired',
      subscription: pastSub,
      expiredAt: pastSub.expires_at,
      needsRenewal: true
    };
  }

  // 3. Check for active temporary pilot grant
  const pilot = db.prepare(`
    SELECT * FROM one_foundation_pilot_grants
    WHERE student_id = ? AND expires_at > datetime('now')
  `).get(studentId);

  if (pilot) {
    return {
      active: true,
      status: 'pilot',
      pilot: true,
      expiresAt: pilot.expires_at
    };
  }

  const membership = db.prepare('SELECT entitlement_status FROM one_memberships WHERE student_id = ?').get(studentId);
  return {
    active: membership?.entitlement_status === 'enabled',
    status: membership?.entitlement_status || 'not_configured',
    subscription: null
  };
}

/**
 * Validate Razorpay payment signature via HMAC SHA-256
 */
export function verifyRazorpaySignature(orderId, paymentId, signature, secret = RAZORPAY_KEY_SECRET) {
  if (!orderId || !paymentId || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(`${orderId}|${paymentId}`);
  const digest = hmac.digest('hex');
  const bufA = Buffer.from(digest);
  const bufB = Buffer.from(signature);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Validate Razorpay webhook signature
 */
export function verifyWebhookSignature(rawBody, signature, secret = RAZORPAY_WEBHOOK_SECRET) {
  if (!rawBody || !signature) return false;
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const digest = hmac.digest('hex');
  const bufA = Buffer.from(digest);
  const bufB = Buffer.from(signature);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Idempotently activate a 365-day subscription for a student upon verified payment.
 */
export function activateSubscription({ studentId, guardianId, orderId, paymentId, amountInr = ANNUAL_PRICE_INR, method = 'razorpay' }) {
  const existingSub = db.prepare(`
    SELECT * FROM student_subscriptions
    WHERE payment_id = ? OR (order_id = ? AND status = 'active')
  `).get(paymentId, orderId);

  if (existingSub) {
    // Already activated idempotently
    return { activated: true, idempotentDuplicate: true, subscription: existingSub };
  }

  // Check if student currently has active subscription to extend from expiry, else from now
  const currentSub = db.prepare(`
    SELECT * FROM student_subscriptions
    WHERE student_id = ? AND status = 'active' AND expires_at > datetime('now')
    ORDER BY expires_at DESC LIMIT 1
  `).get(studentId);

  let startsAt, expiresAt;
  if (currentSub && new Date(currentSub.expires_at) > new Date()) {
    // Renewal: extend by 365 days from current expiry
    startsAt = currentSub.expires_at;
    const expDate = new Date(currentSub.expires_at);
    expDate.setDate(expDate.getDate() + 365);
    expiresAt = expDate.toISOString().replace('T', ' ').slice(0, 19);
  } else {
    // New subscription: 365 days from now
    startsAt = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 365);
    expiresAt = expDate.toISOString().replace('T', ' ').slice(0, 19);
  }

  const subId = `sub-${studentId}-${Date.now()}`;
  db.prepare(`
    INSERT INTO student_subscriptions (id, student_id, guardian_id, plan_id, amount_inr, status, starts_at, expires_at, order_id, payment_id)
    VALUES (?, ?, ?, 'plan-annual-599', ?, 'active', ?, ?, ?, ?)
  `).run(subId, studentId, guardianId, amountInr, startsAt, expiresAt, orderId, paymentId);

  // Update one_memberships
  db.prepare(`
    UPDATE one_memberships
    SET entitlement_status = 'enabled', membership_status = 'active', updated_at = datetime('now')
    WHERE student_id = ?
  `).run(studentId);

  // Update guardian status
  db.prepare(`
    UPDATE guardians
    SET subscription_status = 'Active', outstanding_fee = 0.0, renewal_date = ?
    WHERE id = ?
  `).run(expiresAt.slice(0, 10), guardianId);

  // Update admission status if pending
  db.prepare(`
    UPDATE admissions
    SET status = 'enrolled', payment_id = ?, updated_at = datetime('now')
    WHERE student_id = ? AND status IN ('submitted', 'payment_pending')
  `).run(paymentId, studentId);

  const newSub = db.prepare('SELECT * FROM student_subscriptions WHERE id = ?').get(subId);
  return { activated: true, idempotentDuplicate: false, subscription: newSub };
}
