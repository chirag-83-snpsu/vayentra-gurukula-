import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, BookOpen, CheckCircle2, GraduationCap,
  LockKeyhole, ShieldCheck, Sparkles, AlertCircle, CreditCard
} from 'lucide-react';
import '../styles/admissions.css';

type Props = {
  onBack: () => void;
  onLogin: () => void;
  onPricing?: () => void;
  onCheckout?: (admissionId: string) => void;
};

type Board = 'CBSE' | 'STATE';
type Tab = 'instant_admission' | 'enquiry';

export const AdmissionsPage: React.FC<Props> = ({ onBack, onLogin, onPricing, onCheckout }) => {
  const initialGrade = Number(new URLSearchParams(window.location.search).get('class'));
  const [activeTab, setActiveTab] = useState<Tab>('instant_admission');

  // Common and Admission Form State
  const [grade, setGrade] = useState(
    Number.isInteger(initialGrade) && initialGrade >= 1 && initialGrade <= 10 ? String(initialGrade) : '1'
  );
  const [board, setBoard] = useState<Board>('CBSE');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState('');

  // Enquiry Specific State
  const [enquiryMessage, setEnquiryMessage] = useState('');

  // Submission State
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [enquiryReference, setEnquiryReference] = useState('');

  // 1. Submit Instant Admission (₹599 Subscription)
  async function submitAdmission(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/v1/admissions/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianName,
          guardianPhone,
          guardianEmail,
          studentName,
          grade: Number(grade),
          board,
          schoolName: schoolName || 'Vayentra Partner School',
          consent: true,
          honeypot
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'Unable to process admission. Please check details.');
      }

      if (result.admissionId) {
        if (onCheckout) {
          onCheckout(result.admissionId);
        } else {
          window.location.href = `/checkout?admissionId=${result.admissionId}`;
        }
      } else {
        throw new Error('Admission registered but checkout ID was not returned.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Admission application failed.');
      setBusy(false);
    }
  }

  // 2. Submit General Enquiry
  async function submitEnquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      const response = await fetch('/api/v1/admissions/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guardianName,
          contactPhone: guardianPhone,
          email: guardianEmail,
          grade: Number(grade),
          board,
          message: enquiryMessage,
          consent,
          honeypot
        })
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || 'We could not submit the enquiry. Please try again later.');
      }
      if (!result.received) {
        throw new Error('The server did not confirm that your enquiry was received.');
      }
      setEnquiryReference(result.reference || 'Submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enquiry submission failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="vgpa">
      <header className="vgpa-header">
        <button type="button" onClick={onBack}><ArrowLeft size={18} /> Back to Vayentra</button>
        <span className="vgpa-brand"><span>✦</span> VAYENTRA <b>GURUKULA</b></span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {onPricing && (
            <button type="button" className="ghost" onClick={onPricing} style={{ fontSize: '14px', color: '#0d9488', fontWeight: 600 }}>
              Pricing (₹599/yr)
            </button>
          )}
          <button type="button" onClick={onLogin}>Student login <LockKeyhole size={16} /></button>
        </div>
      </header>

      <div className="vgpa-wrap">
        <section className="vgpa-intro">
          <span className="vgpa-kicker">ADMISSIONS & ENROLLMENT · 2026–27</span>
          <h1>A better learning journey starts with true understanding.</h1>
          <p>
            Join over 10,000 students experiencing concept-first coaching across Classes 1–10.
            Enroll directly with the ₹599 Annual Foundation Pass or request a consultation.
          </p>
          <div className="vgpa-highlights">
            <span><GraduationCap size={19} /> Classes 1–10 (CBSE & State)</span>
            <span><BookOpen size={19} /> Complete Concept Library</span>
            <span><ShieldCheck size={19} /> DPDP Act 2023 Compliant</span>
          </div>

          <div className="vgpa-note" style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', marginTop: '24px' }}>
            <strong>₹599 Annual Digital Learning Pass</strong>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px' }}>
              Includes 365 days of full curriculum access, interactive visual activities, mastery tracking, and official GST tax invoice. Physical classroom tuition fees are separate.
            </p>
          </div>
        </section>

        <section className="vgpa-form-card" aria-labelledby="vgpa-title">
          {/* Tab Switcher */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            background: 'var(--color-paper-subtle, #f1f5f9)',
            padding: '4px',
            borderRadius: '10px',
            marginBottom: '24px'
          }}>
            <button
              type="button"
              onClick={() => { setActiveTab('instant_admission'); setError(''); }}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: activeTab === 'instant_admission' ? '#ffffff' : 'transparent',
                color: activeTab === 'instant_admission' ? 'var(--color-navy-primary, #0f172a)' : '#64748b',
                boxShadow: activeTab === 'instant_admission' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <CreditCard size={15} /> Instant Admission (₹599)
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('enquiry'); setError(''); }}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: activeTab === 'enquiry' ? '#ffffff' : 'transparent',
                color: activeTab === 'enquiry' ? 'var(--color-navy-primary, #0f172a)' : '#64748b',
                boxShadow: activeTab === 'enquiry' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <BookOpen size={15} /> General Enquiry
            </button>
          </div>

          {activeTab === 'instant_admission' ? (
            <>
              <div className="vgpa-form-heading">
                <span style={{ color: '#0d9488', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  PARENT-LED ONLINE ADMISSION
                </span>
                <h2 id="vgpa-title">Student Admission & ₹599 Subscription</h2>
                <p>Register student details and proceed directly to secure test-mode Razorpay checkout.</p>
              </div>

              <form onSubmit={submitAdmission} className="vgpa-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="vgpa-parent-name">Parent / Guardian Full Name *</label>
                    <input
                      id="vgpa-parent-name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={80}
                      value={guardianName}
                      onChange={e => setGuardianName(e.target.value)}
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div>
                    <label htmlFor="vgpa-phone">Parent Mobile Number *</label>
                    <input
                      id="vgpa-phone"
                      autoComplete="tel"
                      type="tel"
                      required
                      value={guardianPhone}
                      onChange={e => setGuardianPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="vgpa-student-name">Student Full Name *</label>
                    <input
                      id="vgpa-student-name"
                      required
                      minLength={2}
                      maxLength={80}
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="e.g. Aarav Kumar"
                    />
                  </div>
                  <div>
                    <label htmlFor="vgpa-parent-email">Parent Email (for GST Tax Invoice)</label>
                    <input
                      id="vgpa-parent-email"
                      type="email"
                      autoComplete="email"
                      value={guardianEmail}
                      onChange={e => setGuardianEmail(e.target.value)}
                      placeholder="parent@example.com"
                    />
                  </div>
                </div>

                <div className="vgpa-form-cols">
                  <div>
                    <label htmlFor="vgpa-class">Grade / Class *</label>
                    <select
                      id="vgpa-class"
                      required
                      value={grade}
                      onChange={e => setGrade(e.target.value)}
                    >
                      {Array.from({ length: 10 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="vgpa-board">School Board *</label>
                    <select
                      id="vgpa-board"
                      value={board}
                      onChange={e => setBoard(e.target.value as Board)}
                    >
                      <option value="CBSE">CBSE</option>
                      <option value="STATE">Karnataka State Board</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="vgpa-school">Current School Name (Optional)</label>
                  <input
                    id="vgpa-school"
                    maxLength={100}
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    placeholder="e.g. Kendriya Vidyalaya / Delhi Public School"
                  />
                </div>

                {/* Honeypot anti-spam */}
                <div className="vgpa-honeypot" aria-hidden="true" style={{ display: 'none' }}>
                  <input
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={e => setHoneypot(e.target.value)}
                  />
                </div>

                <label className="vgpa-consent">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={e => setConsent(e.target.checked)}
                  />
                  <span>
                    I confirm that I am the legal parent or guardian of this student. I consent to Vayentra Gurukula processing educational progress and subscription records in compliance with India's Digital Personal Data Protection (DPDP) Act 2023.
                  </span>
                </label>

                {error && <p className="vgpa-error" role="alert">{error}</p>}

                <button
                  type="submit"
                  className="vgpa-submit"
                  disabled={busy || !consent || !guardianName || !guardianPhone || !studentName}
                >
                  {busy ? 'Creating Admission Record…' : 'Proceed to Checkout (₹599 / Year)'} <ArrowRight size={18} />
                </button>

                <p className="vgpa-privacy">
                  <ShieldCheck size={15} /> Razorpay Test Gateway integration. 100% money-back guarantee within 14 days.
                </p>
              </form>
            </>
          ) : (
            // General Enquiry Form
            enquiryReference ? (
              <div className="vgpa-confirmation" role="status">
                <CheckCircle2 size={46} color="#16a34a" />
                <h2 id="vgpa-title">Your enquiry was received.</h2>
                <p>Thank you. Our academic team can now review your request and contact you at {guardianPhone}.</p>
                <p className="vgpa-reference">Reference: <strong>{enquiryReference}</strong></p>
                <button type="button" className="vgpa-submit" onClick={onBack}>
                  Return to homepage <ArrowRight size={18} />
                </button>
              </div>
            ) : (
              <>
                <div className="vgpa-form-heading">
                  <span>REQUEST INFORMATION</span>
                  <h2 id="vgpa-title">Let's discuss your child's learning needs.</h2>
                  <p>For parents and guardians seeking classroom or tuition consultation.</p>
                </div>
                <form onSubmit={submitEnquiry} className="vgpa-form">
                  <label htmlFor="enq-name">Parent / guardian name *</label>
                  <input
                    id="enq-name"
                    autoComplete="name"
                    required
                    minLength={2}
                    maxLength={80}
                    value={guardianName}
                    onChange={e => setGuardianName(e.target.value)}
                    placeholder="Your full name"
                  />

                  <label htmlFor="enq-phone">Contact number *</label>
                  <input
                    id="enq-phone"
                    autoComplete="tel"
                    type="tel"
                    required
                    value={guardianPhone}
                    onChange={e => setGuardianPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />

                  <label htmlFor="enq-email">Email address (optional)</label>
                  <input
                    id="enq-email"
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    value={guardianEmail}
                    onChange={e => setGuardianEmail(e.target.value)}
                    placeholder="parent@example.com"
                  />

                  <div className="vgpa-form-cols">
                    <div>
                      <label htmlFor="enq-class">Interested class *</label>
                      <select
                        id="enq-class"
                        required
                        value={grade}
                        onChange={e => setGrade(e.target.value)}
                      >
                        <option value="">Choose class</option>
                        {Array.from({ length: 10 }, (_, i) => (
                          <option key={i + 1} value={i + 1}>Class {i + 1}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="enq-board">School board *</label>
                      <select
                        id="enq-board"
                        value={board}
                        onChange={e => setBoard(e.target.value as Board)}
                      >
                        <option value="CBSE">CBSE</option>
                        <option value="STATE">Karnataka State Board</option>
                      </select>
                    </div>
                  </div>

                  <label htmlFor="enq-msg">What would you like to know? (optional)</label>
                  <textarea
                    id="enq-msg"
                    maxLength={400}
                    rows={3}
                    value={enquiryMessage}
                    onChange={e => setEnquiryMessage(e.target.value)}
                    placeholder="Subjects, batch timing or teaching approach"
                  />

                  <label className="vgpa-consent">
                    <input
                      type="checkbox"
                      required
                      checked={consent}
                      onChange={e => setConsent(e.target.checked)}
                    />
                    <span>
                      I am a parent or guardian, and I consent to Vayentra Gurukula storing my contact details to respond to this admissions enquiry.
                    </span>
                  </label>

                  {error && <p className="vgpa-error" role="alert">{error}</p>}

                  <button
                    type="submit"
                    className="vgpa-submit"
                    disabled={busy || !consent || !grade}
                  >
                    {busy ? 'Submitting…' : 'Send admissions enquiry'} <ArrowRight size={18} />
                  </button>
                </form>
              </>
            )
          )}
        </section>
      </div>
    </main>
  );
};
