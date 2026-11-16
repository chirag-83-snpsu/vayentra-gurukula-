import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck,
  LockKeyhole, AlertCircle, CreditCard, Sparkles, Download,
  Check, RefreshCw, Key, UserCheck, ExternalLink
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface CheckoutProps {
  admissionId?: string;
  studentId?: string;
  onBack: () => void;
  onSuccess?: (paymentResult: any) => void;
  onFailed?: (errorMsg: string) => void;
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof (window as any).Razorpay === 'function') {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export const CheckoutPage: React.FC<CheckoutProps> = ({
  admissionId,
  studentId,
  onBack,
  onSuccess,
  onFailed
}) => {
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);
  const [details, setDetails] = useState<any>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  useEffect(() => {
    async function loadDetails() {
      setLoading(true);
      setError('');
      try {
        if (admissionId) {
          const res = await fetch(`/api/v1/admissions/${encodeURIComponent(admissionId)}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Admission record not found.');
          setDetails({
            studentId: data.admission.studentId,
            studentName: data.admission.studentName,
            grade: data.admission.grade,
            board: data.admission.board,
            guardianName: data.admission.guardianName,
            guardianPhone: data.admission.guardianPhone,
            admissionId: data.admission.id
          });
        } else if (studentId) {
          const token = localStorage.getItem('vayentra_token') || localStorage.getItem('vayentra_auth_token');
          const res = await fetch(`/api/v1/payments/student/${encodeURIComponent(studentId)}/status`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          const data = await res.json();
          setDetails({
            studentId,
            studentName: data.subscription?.student_name || 'Enrolled Student',
            grade: data.subscription?.grade || 1,
            board: data.subscription?.board || 'CBSE'
          });
        } else {
          // Check query parameters as fallback
          const urlParams = new URLSearchParams(window.location.search);
          const qAdm = urlParams.get('admissionId');
          const qStu = urlParams.get('studentId');
          if (qAdm) {
            const res = await fetch(`/api/v1/admissions/${encodeURIComponent(qAdm)}`);
            const data = await res.json();
            if (res.ok && data.admission) {
              setDetails({
                studentId: data.admission.studentId,
                studentName: data.admission.studentName,
                grade: data.admission.grade,
                board: data.admission.board,
                guardianName: data.admission.guardianName,
                guardianPhone: data.admission.guardianPhone,
                admissionId: data.admission.id
              });
            }
          } else if (qStu) {
            setDetails({
              studentId: qStu,
              studentName: 'Enrolled Student',
              grade: 1,
              board: 'CBSE'
            });
          } else {
            setError('No admission ID or student account specified for checkout.');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load checkout summary.');
      } finally {
        setLoading(false);
      }
    }
    loadDetails();
  }, [admissionId, studentId]);

  async function handlePay() {
    if (processing || !details) return;
    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('vayentra_token') || localStorage.getItem('vayentra_auth_token');
      const orderRes = await fetch('/api/v1/payments/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        },
        body: JSON.stringify({
          studentId: details.studentId,
          admissionId: details.admissionId
        })
      });

      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.message || 'Failed to initialize payment order.');
      setOrderData(order);

      // Ensure Razorpay SDK is loaded dynamically
      const scriptReady = await loadRazorpayScript();
      const rzpWindow = (window as any).Razorpay;
      if (!scriptReady || typeof rzpWindow !== 'function') {
        throw new Error('Razorpay Checkout gateway is currently loading or blocked. Please ensure you are connected to the internet and disable any browser content blockers.');
      }

      const options = {
        key: order.keyId,
        amount: order.amountPaise,
        currency: order.currency,
        name: 'Vayentra Gurukula Academy',
        description: `Annual Foundation Pass: Class ${details.grade} (${details.board})`,
        order_id: order.orderId,
        handler: async function (response: any) {
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id || order.orderId,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            studentId: details.studentId,
            admissionId: details.admissionId
          });
        },
        prefill: {
          name: details.guardianName || 'Parent',
          contact: details.guardianPhone || ''
        },
        theme: {
          color: '#0d9488'
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const rzp = new rzpWindow(options);
      rzp.on('payment.failed', function (resp: any) {
        setProcessing(false);
        const msg = resp.error?.description || 'Payment rejected by bank.';
        setError(msg);
        if (onFailed) onFailed(msg);
      });
      rzp.open();
    } catch (err) {
      setProcessing(false);
      const msg = err instanceof Error ? err.message : 'Payment process failed.';
      setError(msg);
      if (onFailed) onFailed(msg);
    }
  }

  async function verifyPayment(verifyPayload: any) {
    try {
      const token = localStorage.getItem('vayentra_token') || localStorage.getItem('vayentra_auth_token');
      const verifyRes = await fetch('/api/v1/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {})
        },
        body: JSON.stringify(verifyPayload)
      });

      const result = await verifyRes.json();
      if (!verifyRes.ok) throw new Error(result.message || 'Cryptographic verification failed.');
      setProcessing(false);
      setPaymentSuccess(result);
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setProcessing(false);
      const msg = err instanceof Error ? err.message : 'Verification failed.';
      setError(msg);
      if (onFailed) onFailed(msg);
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-base)' }}>
        <p style={{ fontSize: '16px', color: 'var(--color-text-subtle)' }}>Preparing secure checkout…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', color: 'var(--color-text-main)' }}>
      {/* Header */}
      <header style={{
        padding: '16px 24px',
        background: '#ffffff',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            className="ghost"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600, border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <Logo variant="header" height={36} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '13px', fontWeight: 700 }}>
          <ShieldCheck size={16} /> 256-bit SSL Encrypted Checkout
        </div>
      </header>

      {/* Main Order Container */}
      <main style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
        {paymentSuccess ? (
          // POST-PAYMENT ACTIVATION SCREEN
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #bbf7d0',
            boxShadow: 'var(--shadow-sm)',
            padding: '36px',
            textAlign: 'center'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <span style={{ display: 'block', color: '#16a34a', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              PAYMENT VERIFIED & ENTITLEMENT ACTIVATED
            </span>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-navy-primary)', margin: '8px 0 12px 0' }}>
              Welcome to Vayentra Gurukula!
            </h1>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '14px', maxWidth: '480px', margin: '0 auto 28px auto' }}>
              Your payment of <strong>₹599.00</strong> was confirmed. 365 days of full curriculum access have been activated for <strong>{paymentSuccess.studentName || details?.studentName}</strong>.
            </p>

            {/* Credentials & Access Summary Card - No Predictable Password */}
            <div style={{
              background: 'var(--color-paper-subtle, #f8fafc)',
              borderRadius: '12px',
              border: '1px solid var(--color-border-subtle)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-navy-primary)', fontWeight: 700, fontSize: '14px', marginBottom: '14px' }}>
                <Key size={16} /> Authorized Learner Entitlement
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Learner Identifier</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{paymentSuccess.enrollmentNumber || details?.studentId}</div>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Student Account Email</small>
                  <div style={{ fontWeight: 700, color: '#0f172a' }}>{paymentSuccess.studentEmail || `student_${details?.studentId?.substring(0, 8)}@vayentra.org`}</div>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Access Expiry</small>
                  <div style={{ fontWeight: 700, color: '#16a34a' }}>365 Days Active</div>
                </div>
                <div>
                  <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase' }}>Password Management</small>
                  <div style={{ fontWeight: 600, color: '#0284c7' }}>Parent-Controlled via Family Hub</div>
                </div>
              </div>
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', fontSize: '12px', color: '#475569' }}>
                A secure single-use activation link has been generated. The verified guardian can manage credentials anytime from the Parent Dashboard.
              </div>
            </div>

            {/* Invoicing Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={paymentSuccess.receiptUrl || `/api/v1/payments/receipt/${paymentSuccess.paymentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-navy"
                style={{
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none'
                }}
              >
                <Download size={16} /> Download Payment & Fee Receipt
              </a>

              <button
                type="button"
                className="btn btn-teal"
                onClick={() => { window.location.href = '/login'; }}
                style={{
                  padding: '14px',
                  fontSize: '14px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                Enter Student Portal <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ) : (
          // STANDARD CHECKOUT CARD
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid var(--color-border-subtle)',
            boxShadow: 'var(--shadow-sm)',
            padding: '32px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal-primary, #0d9488)', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
              <CreditCard size={18} /> ANNUAL DIGITAL LEARNING CHECKOUT
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy-primary)', marginBottom: '8px' }}>
              Complete Student Admission
            </h1>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '14px', marginBottom: '24px' }}>
              Activate 365 days of full digital curriculum access for your child.
            </p>

            {error && (
              <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {/* Student & Course Summary */}
            {details && (
              <div style={{ padding: '20px', background: 'var(--color-paper-subtle, #f8fafc)', borderRadius: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <small style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>STUDENT NAME</small>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-navy-primary)' }}>{details.studentName}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <small style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-subtle)', textTransform: 'uppercase' }}>CLASS & BOARD</small>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Class {details.grade} ({details.board})</div>
                  </div>
                </div>

                {details.admissionId && (
                  <div style={{ fontSize: '12px', color: 'var(--color-text-subtle)', borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px', marginTop: '10px' }}>
                    Admission ID: <strong>{details.admissionId}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Ledger Breakdown */}
            <div style={{ border: '1px solid var(--color-border-subtle)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                <span>Annual Foundation Pass (365 Days)</span>
                <span>₹599.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-subtle)', marginBottom: '10px' }}>
                <span>Applicable Taxes</span>
                <span>Inclusive</span>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800, color: 'var(--color-navy-primary)' }}>
                <span>Total Amount Payable</span>
                <span>₹599.00</span>
              </div>
            </div>

            {/* Trust Guarantees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--color-text-subtle)', marginBottom: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#16a34a" /> Instant access activated immediately upon payment verification
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#16a34a" /> Official Fee Receipt generated and sent to registered parent
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#16a34a" /> 14-day 100% money-back guarantee under our transparent refund policy
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} color="#16a34a" /> Physical tuition coaching is separate and optional
              </div>
            </div>

            {/* Payment CTA Button */}
            <button
              type="button"
              className="btn btn-teal"
              disabled={processing || !details}
              onClick={handlePay}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: processing ? 'wait' : 'pointer'
              }}
            >
              {processing ? 'Connecting Gateway…' : 'Proceed to Pay ₹599 with Razorpay'} <ArrowRight size={18} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
