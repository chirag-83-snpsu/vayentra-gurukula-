/**
 * Vayentra Gurukula — Centralized Billing & Tax Configuration Service
 *
 * Implements strict billing and GST controls:
 * 1. Default customer price is configurable (default ₹599.00 / 59900 paise).
 * 2. Does NOT invent or hardcode fictitious GSTINs.
 * 3. Requires explicit approval via process.env.TAX_CONFIG_APPROVED === 'true'.
 * 4. When TAX_CONFIG_APPROVED is false:
 *    - Official GST Tax Invoices are BLOCKED with 428 TAX_CONFIGURATION_PENDING_APPROVAL.
 *    - A clearly labeled "Provisional Fee Receipt" is issued, stating that GST configuration
 *      is pending chartered accountant review and approval.
 * 5. Digital subscriptions and physical tuition fees are accounted for strictly separately.
 */

export const ANNUAL_PRICE_INR = Number(process.env.VAYENTRA_ANNUAL_PRICE_INR || 599.0);
export const ANNUAL_PRICE_PAISE = Math.round(ANNUAL_PRICE_INR * 100);

export function isTaxConfigApproved() {
  return process.env.TAX_CONFIG_APPROVED === 'true';
}

export function getBillingTaxConfig() {
  const approved = isTaxConfigApproved();

  if (!approved) {
    return {
      approved: false,
      status: 'PENDING_APPROVAL',
      annualPriceInr: ANNUAL_PRICE_INR,
      annualPricePaise: ANNUAL_PRICE_PAISE,
      currency: 'INR',
      legalName: process.env.BUSINESS_LEGAL_NAME || 'Vayentra Ventures Pvt. Ltd.',
      gstin: null,
      sacCode: '9992',
      gstRatePercent: null,
      notes: 'Official tax configuration pending chartered accountant & management approval.'
    };
  }

  // Approved configuration
  const gstin = process.env.BUSINESS_GSTIN;
  const sacCode = process.env.BUSINESS_SAC_CODE || '9992';
  const gstRate = Number(process.env.GST_RATE_PERCENT || 18);
  const legalName = process.env.BUSINESS_LEGAL_NAME || 'Vayentra Ventures Pvt. Ltd.';
  const billingAddress = process.env.BUSINESS_BILLING_ADDRESS || 'Bengaluru, Karnataka, India';
  const stateCode = process.env.BUSINESS_STATE_CODE || '29 (Karnataka)';

  const baseInr = Math.round((ANNUAL_PRICE_INR / (1 + gstRate / 100)) * 100) / 100;
  const gstInr = Math.round((ANNUAL_PRICE_INR - baseInr) * 100) / 100;
  const cgstInr = Math.round((gstInr / 2) * 100) / 100;
  const sgstInr = Math.round((gstInr - cgstInr) * 100) / 100;

  return {
    approved: true,
    status: 'APPROVED',
    annualPriceInr: ANNUAL_PRICE_INR,
    annualPricePaise: ANNUAL_PRICE_PAISE,
    currency: 'INR',
    legalName,
    billingAddress,
    stateCode,
    gstin,
    sacCode,
    gstRatePercent: gstRate,
    baseInr,
    gstInr,
    cgstInr,
    sgstInr
  };
}

/**
 * Generate either an Official Tax Invoice (if tax config is approved)
 * or a Provisional Fee Receipt (if tax config is pending approval).
 */
export function buildReceiptOrInvoice({ payment, guardian, student, forceOfficialInvoice = false }) {
  const taxConfig = getBillingTaxConfig();

  if (forceOfficialInvoice && !taxConfig.approved) {
    const error = new Error('Official GST Tax Invoice cannot be generated because tax configuration is pending approval.');
    error.code = 'TAX_CONFIGURATION_PENDING_APPROVAL';
    error.statusCode = 428;
    throw error;
  }

  const totalInr = payment.amount_inr || ANNUAL_PRICE_INR;
  const baseInr = Math.round((totalInr / 1.18) * 100) / 100;
  const totalGstInr = Math.round((totalInr - baseInr) * 100) / 100;
  const cgstInr = Math.round((totalGstInr / 2) * 100) / 100;
  const sgstInr = Math.round((totalGstInr - cgstInr) * 100) / 100;

  if (taxConfig.approved) {
    return {
      documentType: 'TAX_INVOICE',
      isOfficialTaxInvoice: true,
      invoiceNumber: payment.invoice_number,
      receiptNumber: payment.invoice_number,
      date: payment.created_at,
      status: payment.status,
      academicYear: '2026-27',
      feeCategory: 'DIGITAL_LEARNING_ANNUAL_SUBSCRIPTION',
      tuitionFeeIncluded: false,
      serviceDescription: 'Vayentra Gurukula Annual Foundation Learning Pass (Classes 1-10 Digital Access)',
      sacCode: taxConfig.sacCode,
      supplier: {
        name: taxConfig.legalName || 'Vayentra Ventures Pvt. Ltd.',
        legalName: taxConfig.legalName || 'Vayentra Ventures Pvt. Ltd.',
        address: taxConfig.billingAddress,
        gstin: taxConfig.gstin,
        stateCode: taxConfig.stateCode
      },
      recipient: {
        guardianName: guardian?.name || 'Parent / Guardian',
        guardianPhone: guardian?.mobile || guardian?.phone || 'N/A',
        guardianEmail: guardian?.email || 'N/A',
        studentName: student?.name || 'Enrolled Student',
        enrollmentNumber: student?.enrollment_number || 'VG-ONE-2026',
        grade: student?.grade ? `Class ${student.grade}` : 'Foundation',
        board: student?.board || 'CBSE'
      },
      pricing: {
        currency: 'INR',
        baseInr: taxConfig.baseInr || baseInr,
        gstRatePercent: taxConfig.gstRatePercent || 18,
        cgstInr: taxConfig.cgstInr || cgstInr,
        sgstInr: taxConfig.sgstInr || sgstInr,
        totalGstInr: taxConfig.gstInr || totalGstInr,
        totalInr
      },
      paymentDetails: {
        gateway: 'Razorpay Standard Checkout',
        orderId: payment.order_id,
        paymentId: payment.payment_id,
        settlementStatus: payment.status
      }
    };
  }

  // Provisional Fee Receipt (Tax details pending approval)
  return {
    documentType: 'PROVISIONAL_FEE_RECEIPT',
    isOfficialTaxInvoice: false,
    invoiceNumber: payment.invoice_number,
    receiptNumber: payment.invoice_number ? payment.invoice_number.replace('VG-INV-', 'VG-REC-') : `VG-REC-${payment.id}`,
    date: payment.created_at,
    status: payment.status,
    academicYear: '2026-27',
    feeCategory: 'DIGITAL_LEARNING_ANNUAL_SUBSCRIPTION',
    tuitionFeeIncluded: false,
    sacCode: '9992', // Educational Support Services SAC classification
    disclaimer: 'PROVISIONAL FEE RECEIPT — GSTIN and tax breakdown are currently under formal verification with company chartered accountants. Official GST Tax Invoice will be issued upon tax configuration sign-off.',
    serviceDescription: 'Vayentra Gurukula Annual Foundation Learning Pass (Classes 1-10 Digital Access)',
    supplier: {
      name: taxConfig.legalName || 'Vayentra Ventures Pvt. Ltd.',
      legalName: taxConfig.legalName || 'Vayentra Ventures Pvt. Ltd.',
      status: 'Tax details pending formal accountant sign-off'
    },
    recipient: {
      guardianName: guardian?.name || 'Parent / Guardian',
      guardianPhone: guardian?.mobile || guardian?.phone || 'N/A',
      guardianEmail: guardian?.email || 'N/A',
      studentName: student?.name || 'Enrolled Student',
      enrollmentNumber: student?.enrollment_number || 'VG-ONE-2026',
      grade: student?.grade ? `Class ${student.grade}` : 'Foundation',
      board: student?.board || 'CBSE'
    },
    pricing: {
      currency: 'INR',
      amountPaidInr: totalInr,
      totalInr,
      baseInr,
      cgstInr,
      sgstInr,
      totalGstInr,
      taxNote: 'Inclusive of applicable taxes (Breakdown pending final CA review)'
    },
    paymentDetails: {
      gateway: 'Razorpay Standard Checkout',
      orderId: payment.order_id,
      paymentId: payment.payment_id,
      settlementStatus: payment.status
    }
  };
}

/**
 * Generate unique, gapless, sequential invoice numbering across fiscal years
 * E.g., VG-INV-2026-00001, VG-INV-2026-00002
 */
export function getNextSequentialInvoiceNumber(dbInstance, fiscalYear = '2026-27') {
  dbInstance.prepare(`
    CREATE TABLE IF NOT EXISTS invoice_counters (
      fiscal_year TEXT PRIMARY KEY,
      last_sequence INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `).run();

  const yearPrefix = fiscalYear.split('-')[0] || '2026';
  const row = dbInstance.prepare(`
    INSERT INTO invoice_counters (fiscal_year, last_sequence, updated_at)
    VALUES (?, 1, datetime('now'))
    ON CONFLICT(fiscal_year) DO UPDATE SET
      last_sequence = last_sequence + 1,
      updated_at = datetime('now')
    RETURNING fiscal_year, last_sequence
  `).get(fiscalYear);

  const seq = String(row.last_sequence).padStart(5, '0');
  return `VG-INV-${yearPrefix}-${seq}`;
}

