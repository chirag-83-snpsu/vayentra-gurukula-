import React, { useState } from 'react';
import { getStudentAttendanceSummary, readDemoAttendance } from '../data/attendanceDemo';
import { useApp } from '../context/AppContext';
import { 
  Users, 
  Clock, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Moon, 
  AlertCircle, 
  CheckCircle2, 
  Sliders, 
  Download,
  Share2
} from 'lucide-react';

export const ParentView: React.FC = () => {
  const {
    parent,
    activeChild,
    setActiveChildId,
    grantParentConsent,
    payOutstandingFee,
    updateScreenTime,
    language
  } = useApp();

  const attendance = getStudentAttendanceSummary(readDemoAttendance(), activeChild.id);
  const attendanceText = attendance.percent === null ? 'Not yet recorded' : attendance.percent + '%';
  const [activeTab, setActiveTab] = useState<'overview' | 'controls' | 'fees' | 'consent' | 'report'>('overview');
  const [screenTimeInput, setScreenTimeInput] = useState(activeChild.dailyTimeLimitMins);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);

  const handleSaveScreenTime = () => {
    updateScreenTime(screenTimeInput);
    alert(`Updated daily screen time limit to ${screenTimeInput} minutes.`);
  };

  const handlePayFee = () => {
    payOutstandingFee();
    setPaymentSuccess(true);
    setTimeout(() => setPaymentSuccess(false), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Parent Header Banner */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, var(--color-paper-card) 0%, var(--color-paper-subtle) 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--color-teal-light)',
            color: 'var(--color-teal-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Users size={26} />
          </div>
          <div>
            <div className="h1" style={{ fontSize: '22px' }}>Parent Family Portal</div>
            <div className="t-muted">Guardian: {parent.name} • {parent.mobile}</div>
          </div>
        </div>

        {/* Child Selector Tabs */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--color-paper)', padding: '6px', borderRadius: '10px' }}>
          {parent.children.map(c => (
            <button
              key={c.id}
              type="button"
              className={c.id === activeChild.id ? 'btn btn-teal' : 'ghost'}
              onClick={() => { setActiveChildId(c.id); setScreenTimeInput(c.dailyTimeLimitMins); }}
              style={{ minHeight: '38px', padding: '6px 14px', fontSize: '13px' }}
            >
              {c.avatar} {c.name} (Class {c.grade})
            </button>
          ))}
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          type="button"
          className={activeTab === 'overview' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('overview')}
        >
          Overview & Progress
        </button>
        <button
          type="button"
          className={activeTab === 'controls' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('controls')}
        >
          Screen Time & PIN Controls
        </button>
        <button
          type="button"
          className={activeTab === 'fees' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('fees')}
        >
          Fees & Subscription
        </button>
        <button
          type="button"
          className={activeTab === 'consent' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('consent')}
        >
          DPDP Privacy & Consent
        </button>
        <button
          type="button"
          className={activeTab === 'report' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('report')}
        >
          Report Card & WhatsApp
        </button>
      </div>

      {/* OVERVIEW TAB (Matching Wireframe 02 & 82) */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Key Stat Tiles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="b">
              <div className="t-muted">Minutes This Week</div>
              <div className="h1" style={{ marginTop: '4px', color: 'var(--color-teal-primary)' }}>145m</div>
              <div className="t-tiny">Daily target: {activeChild.dailyTimeLimitMins}m</div>
            </div>
            <div className="b">
              <div className="t-muted">Chapters Mastered</div>
              <div className="h1" style={{ marginTop: '4px', color: 'var(--color-saffron)' }}>3 / 8</div>
              <div className="t-tiny">Term 1 syllabus track</div>
            </div>
            <div className="b">
              <div className="t-muted">Live Class Attendance</div>
              <div className="h1" style={{ marginTop: '4px' }}>{attendanceText}</div>
              <div className="t-tiny">{attendance.attended} attended · {attendance.absent} absent · {attendance.excused} excused (demo, this browser)</div>
            </div>
            <div className="b">
              <div className="t-muted">Active Subscription</div>
              <div className="h3" style={{ marginTop: '4px' }}>{parent.subscriptionStatus}</div>
              <div className="t-tiny">{parent.planName}</div>
            </div>
          </div>

          {/* Weak Topics & Teacher Remark Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="h3" style={{ color: 'var(--color-saffron)' }}>
                Target Revision Topics (FR-FAM-03)
              </div>
              <div className="t-muted">
                Topics where your child scored below 80% on recent checkpoints:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ padding: '8px 12px', background: 'var(--color-paper-subtle)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Integers: Sign Multiplication Rules</span>
                  <span className="chip chip-saffron">Checkpoint 66%</span>
                </div>
                <div style={{ padding: '8px 12px', background: 'var(--color-paper-subtle)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Photosynthesis: Stomata Transpiration</span>
                  <span className="chip chip-saffron">Checkpoint 70%</span>
                </div>
              </div>
            </div>

            <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="h3">Educator Remark</div>
              <div style={{ padding: '12px', background: 'var(--color-teal-light)', borderRadius: '8px', borderLeft: '4px solid var(--color-teal-primary)' }}>
                <div style={{ fontStyle: 'italic', fontSize: '14px' }}>
                  "{activeChild.name} demonstrated strong consistency with algebra problem sets this week. We recommend 10 minutes of daily flashcards for negative integer operations."
                </div>
                <div className="t-tiny" style={{ marginTop: '6px', fontWeight: 600 }}>
                  — Mrs. Sunita K., CBSE Mathematics Faculty • 12 Oct 2026
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCREEN TIME & PIN CONTROLS TAB (Matching Wireframe 44 / Diagram 28) */}
      {activeTab === 'controls' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px' }}>
          <div className="h2">Wellbeing & Screen Time Controls</div>
          <div className="t-muted">
            Enforce healthy digital habits. When study minutes or bedtime limits are reached, Child Mode locks automatically and requires the Parent PIN.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 600 }}>
              Daily Study Limit: {screenTimeInput} minutes
            </label>
            <input
              type="range"
              min={15}
              max={120}
              step={5}
              value={screenTimeInput}
              onChange={(e) => setScreenTimeInput(Number(e.target.value))}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }} className="t-tiny">
              <span>15 min</span>
              <span>45 min (Recommended)</span>
              <span>120 min</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600 }}>Bedtime Auto-Curfew Lock</label>
            <input
              type="time"
              defaultValue={activeChild.bedtimeLock}
              className="in"
              style={{ maxWidth: '180px' }}
            />
            <div className="t-tiny">App automatically locks after this hour until 6:00 AM.</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontWeight: 600 }}>Parent Master PIN</label>
            <input
              type="password"
              defaultValue={parent.parentPin}
              disabled
              className="in"
              style={{ maxWidth: '180px' }}
            />
            <div className="t-tiny">Default PIN: 1234 (Required to change settings or exit child mode).</div>
          </div>

          <button type="button" className="btn btn-teal" onClick={handleSaveScreenTime}>
            Save Parental Controls
          </button>
        </div>
      )}

      {/* FEES & SUBSCRIPTION TAB (Matching Wireframe 06 / Diagram 12 & 13) */}
      {activeTab === 'fees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">Fee Management & Invoicing</div>
              <div className="t-muted">Razorpay Webhook Verified • GST Compliant (SAC: 9992)</div>
            </div>
            <span className="chip chip-success">Status: {parent.subscriptionStatus}</span>
          </div>

          {paymentSuccess && (
            <div className="b" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)' }}>
              <CheckCircle2 color="var(--color-success)" size={20} />
              <strong>Payment Received!</strong> GST Invoice #VAY-2026-9812 has been generated and dispatched to your registered email & WhatsApp.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="b">
              <div className="h3">Current Plan: {parent.planName}</div>
              <div className="t-muted" style={{ marginTop: '6px' }}>
                Next billing date: {parent.renewalDate}
              </div>
              <div style={{ marginTop: '14px', fontSize: '24px', fontWeight: 800 }}>
                ₹0 Outstanding
              </div>
              <button type="button" className="ghost" style={{ marginTop: '12px' }}>
                Change or Pause Plan
              </button>
            </div>

            <div className="b">
              <div className="h3">Payment History & Tax Invoices</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <div style={{ padding: '8px', border: '1px solid var(--color-border-subtle)', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>₹14,999 (Annual Pro)</div>
                    <div className="t-tiny">Invoice #VAY-2026-8812 • Settled via UPI</div>
                  </div>
                  <button type="button" className="ghost" style={{ minHeight: '32px', fontSize: '11px' }}>
                    <Download size={12} /> PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DPDP CONSENT & PRIVACY TAB (Matching Wireframe 47 / Diagram 4 & 69) */}
      {activeTab === 'consent' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
          <div className="h2">DPDP Act 2023 Guardian Consent Registry</div>
          <div className="t-muted">
            Under India's Digital Personal Data Protection Act, no telemetry or minor learning analytics is processed without active guardian authorization.
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--color-paper-subtle)', border: '1px solid var(--color-border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Child: {activeChild.name}</strong>
              {activeChild.hasParentConsent ? (
                <span className="chip chip-success">Consent Active (v1.2)</span>
              ) : (
                <span className="chip chip-error">Consent Required</span>
              )}
            </div>
            <div className="t-tiny">
              Timestamp: {activeChild.consentTimestamp || 'Pending'} • Legal Hash: 0x8a92...f71c • IP: 106.51.24.110 (Bengaluru)
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="ghost" onClick={() => alert('DPDP Data Export: Your child\'s complete learning ledger and mistake log has been queued for download.')}>
              <Download size={16} /> Request Complete Data Export
            </button>
            <button type="button" className="ghost" style={{ color: 'var(--color-error)' }} onClick={() => alert('Right to be Forgotten: Account deletion request logged with 30-day grace period.')}>
              Delete Student Profile & Data
            </button>
          </div>
        </div>
      )}

      {/* REPORT CARD TAB (Matching Wireframe 83 / Diagram 54) */}
      {activeTab === 'report' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">Official Progress Report Card</div>
              <div className="t-muted">Available in English & Kannada • Formatted for A4 Print (FR-RPT-01)</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn btn-teal" onClick={() => { setReportDownloaded(true); alert('Report Card downloaded as PDF.'); }}>
                <Download size={16} /> Download PDF
              </button>
              <button type="button" className="ghost" onClick={() => alert('Report Card dispatched to registered WhatsApp number (+91 98450 12345).')}>
                <Share2 size={16} /> Send via WhatsApp
              </button>
            </div>
          </div>

          {/* Rendered A4 Report Card Container (794x1123 Aspect Ratio scaled) */}
          <div style={{
            background: '#ffffff',
            color: 'var(--color-ink)',
            border: '2px solid var(--color-navy-primary)',
            borderRadius: '12px',
            padding: '32px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--color-gold-border)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img 
                  src="/vayentra_logo.png" 
                  alt="Vayentra Gurukula" 
                  style={{ height: '64px', width: 'auto', objectFit: 'contain' }} 
                />
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-navy-primary)', fontFamily: 'var(--font-family-display)' }}>
                    VAYENTRA GURUKULA
                  </div>
                  <div className="chip chip-gold" style={{ fontSize: '11px', marginTop: '2px' }}>
                    CONCEPT-BASED ACADEMIC COACHING
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Quarterly Academic Mastery Report • 2026-2027
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-navy-primary)' }}>Student: {activeChild.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Class {activeChild.grade} • {activeChild.board} Aligned</div>
                <div className="chip chip-navy" style={{ marginTop: '4px' }}>ID: STU-2026-9041</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', textAlign: 'center', background: 'var(--color-navy-light)', padding: '14px', borderRadius: '8px', border: '1px solid var(--color-navy-subtle)' }}>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>Math Mastery</span><strong style={{ fontSize: '18px', color: 'var(--color-navy-primary)' }}>85%</strong></div>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>Science Mastery</span><strong style={{ fontSize: '18px', color: 'var(--color-navy-primary)' }}>78%</strong></div>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>Attendance</span><strong style={{ fontSize: '18px', color: 'var(--color-navy-primary)' }}>{attendanceText}</strong></div>
              <div><span style={{ color: 'var(--color-text-muted)', fontSize: '12px', display: 'block' }}>Effort Stars</span><strong style={{ fontSize: '18px', color: 'var(--color-gold-dark)' }}>{activeChild.starsEarned} ★</strong></div>
            </div>

            <div style={{ marginTop: '8px' }}>
              <strong>Pedagogy Notes & Focus Areas:</strong>
              <p style={{ marginTop: '4px', fontSize: '14px', lineHeight: 1.6 }}>
                Student consistently demonstrates proactive curiosity. Concept prerequisites for rational numbers are solidly established. Recommend continued practice with multi-step word problems.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
