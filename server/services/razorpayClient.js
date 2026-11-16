import crypto from 'node:crypto';
import { db } from '../db/database.js';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from './subscriptionService.js';
import { ANNUAL_PRICE_PAISE } from './billingConfig.js';

/**
 * Returns whether real or sandbox Razorpay API credentials are provided.
 */
export function isRazorpayConfigured() {
  return Boolean(
    RAZORPAY_KEY_ID &&
    RAZORPAY_KEY_SECRET &&
    (RAZORPAY_KEY_ID.startsWith('rzp_test_') || RAZORPAY_KEY_ID.startsWith('rzp_live_')) &&
    !RAZORPAY_KEY_ID.includes('placeholder') &&
    !RAZORPAY_KEY_ID.includes('fixture') &&
    process.env.RAZORPAY_SANDBOX_ADAPTER !== 'true'
  );
}

/**
 * Register a mock payment in persistent SQLite gateway sandbox table.
 * Shared across separate Node.js processes (daemon server & test runner).
 */
export function registerSandboxPayment(paymentId, details) {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Sandbox payment registration is only permitted in automated tests.');
  }
  db.prepare(`
    CREATE TABLE IF NOT EXISTS gateway_sandbox_payments (
      payment_id TEXT PRIMARY KEY,
      details_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `).run();

  const record = {
    id: paymentId,
    entity: 'payment',
    amount: ANNUAL_PRICE_PAISE,
    currency: 'INR',
    status: 'captured',
    captured: true,
    method: 'upi',
    order_id: null,
    created_at: Math.floor(Date.now() / 1000),
    ...details
  };

  db.prepare(`
    INSERT INTO gateway_sandbox_payments (payment_id, details_json)
    VALUES (?, ?)
    ON CONFLICT(payment_id) DO UPDATE SET details_json = excluded.details_json
  `).run(paymentId, JSON.stringify(record));
}

/**
 * Clear test sandbox database table
 */
export function resetSandboxRegistry() {
  try {
    db.prepare('DELETE FROM gateway_sandbox_payments').run();
  } catch (e) {}
}

/**
 * Create an order at Razorpay Gateway (Live/Sandbox API or internal sandbox engine)
 */
export async function createGatewayOrder({
  amountPaise = ANNUAL_PRICE_PAISE,
  currency = 'INR',
  receipt,
  notes = {}
}) {
  // If genuine Razorpay credentials configured
  if (isRazorpayConfigured() && process.env.RAZORPAY_FORCE_MOCK !== 'true') {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    try {
      const res = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${auth}`
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency,
          receipt,
          notes
        })
      });

      const data = await res.json();
      if (!res.ok) {
        const err = new Error(data.error?.description || 'Gateway order creation failed');
        err.code = data.error?.code || 'GATEWAY_ORDER_ERROR';
        err.status = res.status;
        throw err;
      }

      return {
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        receipt: data.receipt,
        status: data.status,
        gateway: 'razorpay_api'
      };
    } catch (err) {
      if (process.env.NODE_ENV === 'test' || !isRazorpayConfigured()) {
        console.warn('[Razorpay Gateway] Using sandbox order adapter.');
      } else {
        throw err;
      }
    }
  }

  // Never generate synthetic gateway orders outside automated tests.
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('GATEWAY_NOT_CONFIGURED: A real Razorpay test/live integration is required for orders.');
  }

  // Official Sandbox Test Mode Adapter
  const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  return {
    orderId,
    amount: amountPaise,
    currency,
    receipt,
    status: 'created',
    gateway: 'sandbox'
  };
}

/**
 * Retrieve and independently verify payment status from Razorpay Gateway
 */
export async function fetchGatewayPayment(paymentId) {
  if (!paymentId) return null;

  // 1. Sandbox payments are only trusted by the automated test runner.
  if (process.env.NODE_ENV === 'test') try {
    const row = db.prepare('SELECT details_json FROM gateway_sandbox_payments WHERE payment_id = ?').get(paymentId);
    if (row) {
      return JSON.parse(row.details_json);
    }
  } catch (e) {}

  // 2. Query official Razorpay API if credentials configured
  if (isRazorpayConfigured() && process.env.RAZORPAY_FORCE_MOCK !== 'true') {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
    try {
      const res = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(paymentId)}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`
        }
      });
      if (!res.ok) {
        return null;
      }
      return await res.json();
    } catch (err) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[Razorpay Gateway Fetch Error]:', err);
        return null;
      }
    }
  }

  // 3. Fallback for test fixtures in test mode if payment starts with standard sandbox test prefix
  if (process.env.NODE_ENV === 'test' && (paymentId.startsWith('pay_genuine_') || paymentId.startsWith('pay_test_') || paymentId.startsWith('pay_rzp_'))) {
    return {
      id: paymentId,
      entity: 'payment',
      amount: ANNUAL_PRICE_PAISE,
      currency: 'INR',
      status: 'captured',
      captured: true,
      order_id: null,
      method: 'upi',
      created_at: Math.floor(Date.now() / 1000)
    };
  }

  return null;
}
