import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  X, 
  Download, 
  Printer, 
  Share2, 
  CheckCircle2, 
  Award, 
  ShieldCheck, 
  QrCode 
} from 'lucide-react';

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({ isOpen, onClose }) => {
  const { activeChild, parent, language } = useApp();
  const [whatsappSent, setWhatsappSent] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleSendWhatsApp = () => {
    setWhatsappSent(true);
    setTimeout(() => setWhatsappSent(false), 5000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="b" style={{
        background: '#ffffff',
        color: '#1e293b',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '16px',
        padding: '36px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Top Control Bar */}
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-teal" onClick={handlePrint} style={{ minHeight: '36px', fontSize: '13px' }}>
              <Printer size={16} /> Print Official A4 Report Card
            </button>
            <button type="button" className="ghost" onClick={handleSendWhatsApp} style={{ minHeight: '36px', fontSize: '13px' }}>
              <Share2 size={16} /> {whatsappSent ? 'Dispatched to WhatsApp!' : 'Send to Registered WhatsApp'}
            </button>
          </div>
          <button type="button" className="ghost" onClick={onClose} style={{ padding: '4px 10px' }}>
            <X size={20} />
          </button>
        </div>

        {whatsappSent && (
          <div className="no-print" style={{
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: 'var(--color-success)',
            fontSize: '13px'
          }}>
            ✓ Term 1 Comprehensive Report Card sent to Guardian WhatsApp (+91 98450 12345) with cryptographic verification QR code.
          </div>
        )}

        {/* PRINTABLE A4 GURUKULA REPORT CARD CONTENT */}
        <div id="printable-report-card" style={{
          border: '2px solid var(--color-gold-border)',
          borderRadius: '12px',
          padding: '28px',
          background: '#faf9f5'
        }}>
          
          {/* Institution Header */}
          <div style={{ textAlign: 'center', borderBottom: '2px solid var(--color-border)', paddingBottom: '16px' }}>
            <Logo variant="compact" height={52} />
            <div className="h1" style={{ fontSize: '24px', color: 'var(--color-navy-primary)', marginTop: '6px' }}>
              VAYENTRA CENTRAL GURUKULA
            </div>
            <div className="t-tiny" style={{ letterSpacing: '0.08em', fontWeight: 700, color: 'var(--color-gold-primary)' }}>
              ACADEMIC EXCELLENCE & CHARACTER DEVELOPMENT • AFFILIATION: CBSE & KARNATAKA STATE BOARD
            </div>
            <div className="t-tiny" style={{ marginTop: '2px' }}>
              Campus: Gurukula Knowledge Sanctuary, Sarjapur Main Road, Bengaluru 560035 • www.vayentra.org
            </div>
            <div className="chip chip-gold" style={{ marginTop: '8px', fontWeight: 700 }}>
              TERM 1 COMPREHENSIVE PROGRESS EVALUATION (2026–2027)
            </div>
          </div>

          {/* Student Profile Strip */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            padding: '16px 0',
            borderBottom: '1px solid var(--color-border-subtle)',
            fontSize: '13px'
          }}>
            <div>
              <span className="t-muted">Student Name:</span> <strong>{activeChild.name}</strong>
            </div>
            <div>
              <span className="t-muted">Roll Number:</span> <strong>VG-2026-7A14</strong>
            </div>
            <div>
              <span className="t-muted">Grade & Section:</span> <strong>Class {activeChild.grade}-A</strong>
            </div>
            <div>
              <span className="t-muted">Curriculum Board:</span> <strong>{activeChild.board}</strong>
            </div>
            <div>
              <span className="t-muted">Medium of Study:</span> <strong>{activeChild.medium}</strong>
            </div>
            <div>
              <span className="t-muted">Guardian Name:</span> <strong>{parent.name}</strong>
            </div>
          </div>

          {/* Academic Performance Table */}
          <div style={{ marginTop: '18px' }}>
            <div className="h2" style={{ fontSize: '16px', marginBottom: '8px' }}>1. Scholastic Concept Mastery</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Subject</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Concept Mastery</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Checkpoint Avg</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Term Grade</th>
                  <th style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>Lead Educator Remarks</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}><strong>Mathematics</strong></td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: 'var(--color-teal-primary)', fontWeight: 700 }}>92%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>95%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>A1</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    Outstanding spatial intuition in integer operations. Highly inquisitive during live labs. — <em>Acharya Vidyasagar Bhat</em>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}><strong>Science</strong></td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: 'var(--color-teal-primary)', fontWeight: 700 }}>96%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>100%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>A1</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    Excellent cellular understanding of photosynthesis and stomatal biology. — <em>Acharya Chinmayee Hegde</em>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}><strong>Kannada (ದ್ವಿತೀಯ ಭಾಷೆ)</strong></td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: 'var(--color-teal-primary)', fontWeight: 700 }}>88%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>90%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>A2</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    ಉತ್ತಮ ಸಾಹಿತ್ಯ ಆಸಕ್ತಿ ಮತ್ತು ಶುದ್ಧ ಉಚ್ಚಾರಣೆ. ಕವನ ವಾಚನದಲ್ಲಿ ಪ್ರಶಂಸನೀಯ ಪ್ರಗತಿ. — <em>Vidushi Ananya Kulkarni</em>
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}><strong>English Literature</strong></td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', color: 'var(--color-teal-primary)', fontWeight: 700 }}>90%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1' }}>92%</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontWeight: 700 }}>A1</td>
                  <td style={{ padding: '8px 10px', border: '1px solid #cbd5e1', fontSize: '12px' }}>
                    Articulate written expression with structured grammar and rich vocabulary.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Co-Scholastic & Gurukula Virtues */}
          <div style={{ marginTop: '18px' }}>
            <div className="h2" style={{ fontSize: '16px', marginBottom: '8px' }}>2. Gurukula Character Virtues (Co-Scholastic)</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div className="b" style={{ padding: '10px', background: '#ffffff' }}>
                <div className="t-tiny" style={{ fontWeight: 700 }}>Shraddha (Dedication)</div>
                <div style={{ fontWeight: 700, color: 'var(--color-teal-primary)' }}>Grade: Exemplary (A)</div>
                <div className="t-tiny">Consistently logs daily 45m study goal without reminders.</div>
              </div>
              <div className="b" style={{ padding: '10px', background: '#ffffff' }}>
                <div className="t-tiny" style={{ fontWeight: 700 }}>Jigyaasa (Curiosity)</div>
                <div style={{ fontWeight: 700, color: 'var(--color-teal-primary)' }}>Grade: Exemplary (A)</div>
                <div className="t-tiny">Asks insightful conceptual questions to AI tutor and teachers.</div>
              </div>
              <div className="b" style={{ padding: '10px', background: '#ffffff' }}>
                <div className="t-tiny" style={{ fontWeight: 700 }}>Attendance & Punctuality</div>
                <div style={{ fontWeight: 700, color: 'var(--color-teal-primary)' }}>94% Attendance</div>
                <div className="t-tiny">47 of 50 academic live classes attended on time.</div>
              </div>
            </div>
          </div>

          {/* Cryptographic Trust & Verification Stamp */}
          <div style={{
            marginTop: '24px',
            borderTop: '2px solid var(--color-border)',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <QrCode size={48} color="var(--color-navy-primary)" />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-subtle)' }}>
                <div><strong>Cryptographic Verification Hash:</strong></div>
                <div style={{ fontFamily: 'monospace' }}>SHA256: 8b4c9e7a...2026-VG-TERM1</div>
                <div>Scan QR to verify authenticity on official Gurukula registry.</div>
              </div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '12px' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-navy-primary)' }}>Dr. Sharada Rao</div>
              <div className="t-tiny">Head of Academic Board & Dean of Examinations</div>
              <div className="t-tiny" style={{ color: 'var(--color-teal-primary)', fontWeight: 600 }}>
                Verified & Sealed: 15 Oct 2026
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
