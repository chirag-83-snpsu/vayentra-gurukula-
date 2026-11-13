import React from 'react';
import { ArrowLeft, ShieldCheck, FileText, RefreshCw, LockKeyhole } from 'lucide-react';
import { Logo } from '../components/Logo';

interface LegalProps {
  type: 'terms' | 'privacy' | 'refund';
  onBack: () => void;
  onNavigate: (route: string) => void;
}

export const LegalPages: React.FC<LegalProps> = ({ type, onBack, onNavigate }) => {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', color: 'var(--color-text-main)' }}>
      {/* Top Navigation */}
      <header style={{
        padding: '16px 24px',
        background: '#ffffff',
        borderBottom: '1px solid var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            className="ghost"
            onClick={onBack}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 600 }}
          >
            <ArrowLeft size={16} /> Back
          </button>
          <Logo variant="header" height={36} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            className={`ghost ${type === 'terms' ? 'btn-teal' : ''}`}
            onClick={() => onNavigate('terms')}
            style={{ fontSize: '13px' }}
          >
            Terms
          </button>
          <button
            type="button"
            className={`ghost ${type === 'privacy' ? 'btn-teal' : ''}`}
            onClick={() => onNavigate('privacy')}
            style={{ fontSize: '13px' }}
          >
            Privacy
          </button>
          <button
            type="button"
            className={`ghost ${type === 'refund' ? 'btn-teal' : ''}`}
            onClick={() => onNavigate('refund')}
            style={{ fontSize: '13px' }}
          >
            Refund Policy
          </button>
          <button
            type="button"
            className="btn btn-teal"
            onClick={() => onNavigate('admissions')}
            style={{ fontSize: '13px', padding: '6px 14px' }}
          >
            Admission (₹599/yr)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '840px', margin: '40px auto', padding: '0 20px', lineHeight: 1.7 }}>
        {type === 'terms' && (
          <article>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--color-navy-primary)', marginBottom: '12px' }}>
              <FileText size={24} />
              <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>LEGAL AGREEMENT</span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-navy-primary)' }}>
              Terms of Service
            </h1>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '14px', marginBottom: '32px' }}>
              Last updated: November 13, 2026 · Effective for Academic Year 2026–2027
            </p>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>1. Educational Service Model</h3>
                <p>
                  Vayentra Gurukula Private Limited provides a concept-based academic platform for students in Classes 1 to 10 aligned with the CBSE and Karnataka State Board curricula. Access is granted on an annual subscription basis of ₹599 per student for a continuous period of 365 calendar days from the date of verified payment.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>2. Parental Representation & Consent</h3>
                <p>
                  In compliance with the Digital Personal Data Protection (DPDP) Act 2023, only a parent or lawful adult guardian may register an admission, provide verifiable consent, and handle financial transactions. Children are issued dedicated learner credentials and are strictly prohibited from processing real payments.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>3. Annual Subscription & Non-Recurring Fee</h3>
                <p>
                  The platform fee is ₹599 (inclusive of 18% GST under SAC 9992) per enrolled student for one full academic year (365 days). Vayentra Gurukula does not charge automatic recurring renewals or hidden payment deductions. Upon completion of 365 days, access to paid lesson activities expires unless renewed voluntarily by the parent.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>4. Child Safety & AI Guardrails</h3>
                <p>
                  Early learners (Classes 1–2) interact exclusively with deterministic, human-reviewed pedagogical storyboards and structured interactive picture scenes. No generative, open-ended chatbot or unmonitored communication tool is accessible to children.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>5. Account Integrity & Academic Rights</h3>
                <p>
                  Permanent Learner IDs and formative progress histories belong to the child's academic journey. Accounts may not be transferred or resold. Commercial distribution of proprietary Vayentra illustrations, stories, or assessment rationales without written academy authorization is prohibited.
                </p>
              </div>
            </section>
          </article>
        )}

        {type === 'privacy' && (
          <article>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#16a34a', marginBottom: '12px' }}>
              <ShieldCheck size={24} />
              <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>DPDP ACT 2023 COMPLIANT</span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-navy-primary)' }}>
              Child Privacy Notice & Data Protection Policy
            </h1>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '14px', marginBottom: '32px' }}>
              Highest standards of child data safety · Zero advertising · Zero profiling
            </p>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '16px 20px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '6px' }}>Our Core Child Safety Commitment</strong>
                <p style={{ fontSize: '14px', color: '#14532d', margin: 0 }}>
                  We never display third-party advertisements, we never sell student data to data brokers, and we never use biometric or behavioral surveillance on minors. All academic processing serves purely educational mastery.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>1. What Information We Collect</h3>
                <p>
                  We collect only essential details necessary for academic coaching:
                </p>
                <ul style={{ paddingLeft: '20px', marginTop: '6px' }}>
                  <li><strong>Parent/Guardian:</strong> Name, 10-digit mobile number, optional email address for receipts, and parent security PIN.</li>
                  <li><strong>Student:</strong> Name, class/grade (1–10), school board (CBSE or Karnataka State), and formative learning attempt answers.</li>
                  <li><strong>Payment:</strong> Transaction reference IDs, invoice numbers, and payment status via Razorpay. We never store credit card numbers or banking passwords.</li>
                </ul>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>2. Guardian Access & Control Rights</h3>
                <p>
                  Parents retain full statutory rights to inspect, download, correct, or request deletion of their child's academic records at any time through the Family Hub or by contacting safeguarding@vayentra.org.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>3. Data Storage & Encryption</h3>
                <p>
                  All data is encrypted in transit using TLS 1.3 and at rest using AES-256 in secure, Indian-domiciled cloud infrastructure adhering to CERT-In and Ministry of Electronics & IT guidelines.
                </p>
              </div>
            </section>
          </article>
        )}

        {type === 'refund' && (
          <article>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#2563eb', marginBottom: '12px' }}>
              <RefreshCw size={24} />
              <span style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em' }}>TRANSPARENT GUARANTEE</span>
            </div>
            <h1 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px', color: 'var(--color-navy-primary)' }}>
              Cancellation & 14-Day Refund Policy
            </h1>
            <p style={{ color: 'var(--color-text-subtle)', fontSize: '14px', marginBottom: '32px' }}>
              Fair, prompt, and hassle-free refund process for Indian families
            </p>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ padding: '16px 20px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px' }}>
                <strong style={{ color: '#1e40af', display: 'block', marginBottom: '6px' }}>14-Day 100% Money-Back Guarantee</strong>
                <p style={{ fontSize: '14px', color: '#1e3a8a', margin: 0 }}>
                  If your child does not experience enhanced conceptual clarity within 14 calendar days of enrolment, you may request a complete refund of the ₹599 platform fee. No questions asked.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>1. Refund Eligibility Window</h3>
                <p>
                  Refund requests initiated within 14 days from the date of payment verification are processed in full. Requests made after 14 days are not eligible for refund, but access remains active for the entire 365-day entitlement period.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>2. How to Request a Refund</h3>
                <p>
                  Parents can request a refund directly from the <strong>Family Hub → Fees Ledger</strong> by clicking "Request Refund", or by emailing <strong>admissions@vayentra.org</strong> with the Invoice Number and registered parent phone number.
                </p>
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>3. Processing & Settlement Timeline</h3>
                <p>
                  Approved refunds are processed through the original payment method (UPI, Debit Card, or Net Banking) via Razorpay. Settlements typically reflect in the parent's bank account within 5 to 7 business days according to standard Reserve Bank of India (RBI) clearing cycles.
                </p>
              </div>
            </section>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: '60px',
        padding: '30px 20px',
        background: '#ffffff',
        borderTop: '1px solid var(--color-border-subtle)',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--color-text-subtle)'
      }}>
        <p>© 2026 Vayentra Gurukula Private Limited. GSTIN: 29AAACV2026F1Z5 · SAC 9992 · DPDP Act 2023 Compliant.</p>
        <p style={{ marginTop: '6px' }}>42 Gurukula Way, Indiranagar, Bengaluru, Karnataka 560038, India · support@vayentra.org</p>
      </footer>
    </div>
  );
};
