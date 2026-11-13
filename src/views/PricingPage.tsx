import React, { useState } from 'react';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, HelpCircle,
  ShieldCheck, Sparkles, X, ChevronDown, LockKeyhole,
  Award, Brain, Calculator, HeartHandshake, BookOpen
} from 'lucide-react';
import { Logo } from '../components/Logo';

interface PricingProps {
  onBack: () => void;
  onAdmissions: (grade?: number) => void;
  onLogin: () => void;
  onNavigateLegal: (type: 'terms' | 'privacy' | 'refund') => void;
}

export const PricingPage: React.FC<PricingProps> = ({
  onBack,
  onAdmissions,
  onLogin,
  onNavigateLegal
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Is ₹599 for the entire academic year?',
      a: 'Yes, absolutely. ₹599 covers 365 full calendar days of complete syllabus access, interactive picture scenes, AI thinking courses, and practice assessments for one student. There are zero recurring monthly debits and zero hidden upsells.'
    },
    {
      q: 'Can I enroll multiple children in my family?',
      a: 'Yes! A parent can link multiple students under one guardian account. Each student receives an individual permanent Learner ID and their own dedicated ₹599 annual entitlement.'
    },
    {
      q: 'Which school boards and classes are supported?',
      a: 'We support Classes 1 to 10 for both CBSE and Karnataka State Board. Every chapter aligns with official NCERT and KTBS textbooks.'
    },
    {
      q: 'How does payment work? Is it secure?',
      a: 'Payments are processed securely via Razorpay Standard Checkout supporting UPI (Google Pay, PhonePe, Paytm), RuPay/Visa/MasterCard Debit & Credit cards, and Net Banking. All transactions are encrypted with 256-bit SSL, and GST tax invoices are provided immediately upon verification.'
    },
    {
      q: 'What is your refund policy?',
      a: 'We offer a 100% money-back guarantee within 14 calendar days of enrolment. If you or your child are not delighted with the learning progress, you receive a full refund with no questions asked.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg-base)', color: 'var(--color-text-main)' }}>
      {/* Header */}
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
            className="ghost"
            onClick={onLogin}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <LockKeyhole size={14} /> Student Login
          </button>
          <button
            type="button"
            className="btn btn-teal"
            onClick={() => onAdmissions()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
          >
            Enrol Now (₹599) <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        padding: '60px 20px 40px',
        textAlign: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, var(--color-bg-base) 100%)'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 14px', borderRadius: '20px', background: 'var(--color-teal-light)', color: 'var(--color-teal-primary)', fontSize: '13px', fontWeight: 700, marginBottom: '16px' }}>
          <Sparkles size={14} /> DEMOCRATIZING QUALITY EDUCATION ACROSS KARNATAKA & INDIA
        </div>
        <h1 style={{ fontSize: '42px', fontWeight: 800, color: 'var(--color-navy-primary)', maxWidth: '780px', margin: '0 auto 16px', lineHeight: 1.2 }}>
          World-Class Concept Learning for Every Child at Just ₹599 / Year.
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--color-text-subtle)', maxWidth: '640px', margin: '0 auto 32px' }}>
          No ₹50,000 tuition fees. No high-pressure sales calls. Just crystal-clear concepts, verified board textbooks, and child-safe technology.
        </p>

        {/* Pricing Card */}
        <div style={{
          maxWidth: '480px',
          margin: '0 auto',
          background: '#ffffff',
          borderRadius: '16px',
          border: '2px solid var(--color-teal-primary)',
          boxShadow: '0 12px 36px rgba(13, 148, 136, 0.12)',
          padding: '32px 28px',
          textAlign: 'left'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <div>
              <span className="chip chip-navy" style={{ fontWeight: 700, fontSize: '11px' }}>ANNUAL FOUNDATION PASS</span>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginTop: '6px', color: 'var(--color-navy-primary)' }}>Classes 1 to 10</h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-subtle)' }}>CBSE & Karnataka State Board</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '38px', fontWeight: 800, color: 'var(--color-navy-primary)', lineHeight: 1 }}>
                ₹599
              </div>
              <small style={{ color: 'var(--color-text-subtle)', fontSize: '12px' }}>per student / year</small>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' }}>
            <CheckCircle2 size={14} /> Inclusive of 18% GST (SAC 9992) · No auto-renewals
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border-subtle)', margin: '16px 0' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
            {[
              'Full Textbook Curriculum (Maths, Science, English, Hindi, Kannada, EVS)',
              'Vayentra Original AI & Digital Thinking Enrichment Course',
              'Vayentra Original Financial Literacy & Money Management',
              'Deterministic, child-safe interactive visual scenes (Zero open chatbots)',
              'Device read-aloud audio narration (English, Hindi, Kannada)',
              'Parent Family Hub with screen-time limits & progress analytics',
              'Instant downloadable GST tax invoices & bilingual term report cards',
              '14-day 100% money-back guarantee'
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px' }}>
                <Check size={18} color="var(--color-teal-primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-teal"
            onClick={() => onAdmissions()}
            style={{ width: '100%', padding: '14px', fontSize: '16px', fontWeight: 700, justifyContent: 'center' }}
          >
            Start Student Admission (₹599) <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ maxWidth: '960px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', color: 'var(--color-navy-primary)', marginBottom: '8px' }}>
          Why Indian Families Trust Vayentra Gurukula
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--color-text-subtle)', marginBottom: '32px', fontSize: '15px' }}>
          Comparing honest education against commercial coaching tuition centers
        </p>

        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid var(--color-border-subtle)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid var(--color-border-subtle)' }}>
                <th style={{ padding: '16px 20px', fontWeight: 700 }}>Feature</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: 'var(--color-teal-primary)', background: 'var(--color-teal-light)' }}>
                  Vayentra Gurukula
                </th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>Offline Private Tuitions</th>
                <th style={{ padding: '16px 20px', fontWeight: 700, color: '#64748b' }}>Typical EdTech Apps</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'Annual Cost', vg: '₹599 / year', offline: '₹35,000 – ₹60,000 / year', edtech: '₹25,000 – ₹45,000 / year' },
                { feature: 'Pedagogy', vg: 'Concept-First & Reason Why', offline: 'Rote memorization & drills', edtech: 'Passive video lectures' },
                { feature: 'AI & Financial Literacy', vg: 'Included in core curriculum', offline: 'Not offered', edtech: 'Expensive add-ons' },
                { feature: 'Child Safety & Ad-Free', vg: '100% ad-free, zero tracking', offline: 'Unregulated', edtech: 'Ads, upsells & sales pressure' },
                { feature: 'Language Inclusivity', vg: 'English, Hindi, Kannada audio', offline: 'English or Hindi only', edtech: 'English only' },
                { feature: 'Refund Policy', vg: '14-Day 100% Money-Back', offline: 'Strictly No Refunds', edtech: 'Restrictive cancellation lock-in' }
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 600 }}>{row.feature}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 700, color: 'var(--color-teal-primary)', background: '#f0fdfa' }}>{row.vg}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{row.offline}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{row.edtech}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section style={{ maxWidth: '780px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 800, textAlign: 'center', color: 'var(--color-navy-primary)', marginBottom: '32px' }}>
          Frequently Asked Questions
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid var(--color-border-subtle)',
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  style={{
                    width: '100%',
                    padding: '18px 20px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: 700,
                    color: 'var(--color-navy-primary)'
                  }}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      flexShrink: 0
                    }}
                  />
                </button>
                {isOpen && (
                  <div style={{ padding: '0 20px 18px', color: 'var(--color-text-subtle)', fontSize: '14px', lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: '80px',
        padding: '40px 20px',
        background: '#ffffff',
        borderTop: '1px solid var(--color-border-subtle)',
        textAlign: 'center',
        fontSize: '13px',
        color: 'var(--color-text-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '14px' }}>
          <button type="button" className="ghost" onClick={() => onNavigateLegal('terms')} style={{ fontSize: '13px' }}>Terms of Service</button>
          <button type="button" className="ghost" onClick={() => onNavigateLegal('privacy')} style={{ fontSize: '13px' }}>Child Privacy Notice</button>
          <button type="button" className="ghost" onClick={() => onNavigateLegal('refund')} style={{ fontSize: '13px' }}>Cancellation & Refund</button>
        </div>
        <p>© 2026 Vayentra Gurukula Private Limited. GSTIN: 29AAACV2026F1Z5 · SAC 9992 · DPDP Act 2023 Compliant.</p>
      </footer>
    </div>
  );
};
