import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck,
  LockKeyhole, AlertCircle, CreditCard, Sparkles, RefreshCw
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface CheckoutProps {
  admissionId?: string;
  studentId?: string;
  onBack: () => void;
  onSuccess: (paymentResult: any) => void;
  onFailed: (errorMsg: string) => void;
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
  const [testSimOpen, setTestSimOpen] = useState(false);

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
          const res = await fetch(`/api/v1/payments/student/${encodeURIComponent(studentId)}/status`);
          const data = await res.json();
          setDetails({
            studentId,
            studentName: data.subscription?.student_name || 'Enrolled Student',
            grade: data.subscription?.grade || 1,
            board: data.subscription?.board || 'CBSE'
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load order summary.');
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

      // Check if Razorpay script is available
      const rzpWindow = (window as any).Razorpay;
      if (typeof rzpWindow === 'function') {
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
              studentId: details.studentId
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
          onFailed(resp.error?.description || 'Payment rejected by bank.');
        });
        rzp.open();
      } else {
        // Test simulator fallback when Razorpay CDN is unreached in testing
        setTestSimOpen(true);
      }
    } catch (err) {
      setProcessing(false);
      setError(err instanceof Error ? err.message : 'Payment process failed.');
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
      onSuccess(result);
    } catch (err) {
      setProcessing(false);
      onFailed(err instanceof Error ? err.message : 'Verification failed.');
    }
  }

  // Simulated payment test helper
  async function simulateTestPayment(success: boolean) {
    setTestSimOpen(false);
    if (!orderData || !details) return;

    if (!success) {
      setProcessing(false);
      onFailed('Payment cancelled or declined in simulated gateway.');
      return;
    }

    const testPaymentId = `pay_sim_${Date.now()}`;
    // Compute HMAC signature on backend or send simulated test signature
    const simRes = await fetch('/api/v1/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (localStorage.getItem('vayentra_token') || '')
      },
      body: JSON.stringify({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: 'test_mode_simulated',
        studentId: details.studentId
      })
    });
    const result = await simRes.json();
    if (simRes.ok) {
      onSuccess(result);
    } else {
      setProcessing(false);
      onFailed(result.message || 'Simulation verification rejected.');
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
          <button type="button" className="ghost" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back
          </button>
          <Logo variant="header" height={36} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '13px', fontWeight: 700 }}>
          <ShieldCheck size={16} /> 256-bit SSL Encrypted Checkout
        </div>
      </header>

      {/* Main Order Card */}
      <main style={{ maxWidth: '640px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-sm)',
          padding: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-teal-primary)', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
            <CreditCard size={18} /> STEP 2 OF 2: FEE PAYMENT
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-navy-primary)', marginBottom: '8px' }}>
            Complete Student Admission
          </h1>
          <p style={{ color: 'var(--color-text-subtle)', fontSize: '14px', marginBottom: '24px' }}>
            Activate 365 days of full curriculum access for your child.
          </p>

          {error && (
            <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', borderRadius: '8px', fontSize: '14px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Student & Course Summary */}
          {details && (
            <div style={{ padding: '20px', background: 'var(--color-paper-subtle)', borderRadius: '12px', marginBottom: '24px' }}>
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
              <span>₹507.63</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--color-text-subtle)', marginBottom: '10px' }}>
              <span>GST @ 18% (SAC 9992 Educational Tech)</span>
              <span>₹91.37</span>
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
              <CheckCircle2 size={14} color="#16a34a" /> Official GST Tax Invoice generated for reimbursement
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={14} color="#16a34a" /> 14-day 100% money-back guarantee under our transparent refund policy
            </div>
          </div>

          {/* Payment CTA Button */}
          <button
            type="button"
            className="btn btn-teal"
            disabled={processing}
            onClick={handlePay}
            style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, justifyContent: 'center' }}
          >
            {processing ? 'Connecting Gateway…' : 'Proceed to Pay ₹599 with Razorpay'} <ArrowRight size={18} />
          </button>
        </div>
      </main>

      {/* Test Mode Simulator Modal (Fallback) */}
      {testSimOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: '#f0fdfa', color: 'var(--color-teal-primary)', marginBottom: '14px' }}>
              <CreditCard size={28} />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>Razorpay Test Sandbox</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-subtle)', marginBottom: '20px' }}>
              Testing checkout for <strong>{details?.studentName}</strong> (₹599). Select payment outcome:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn btn-teal"
                onClick={() => simulateTestPayment(true)}
                style={{ padding: '12px', justifyContent: 'center', fontWeight: 700 }}
              >
                Simulate Successful Payment (Authorize ₹599)
              </button>
              <button
                type="button"
                className="ghost"
                onClick={() => simulateTestPayment(false)}
                style={{ padding: '12px', justifyContent: 'center', color: '#b91c1c' }}
              >
                Simulate Bank Decline / User Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
