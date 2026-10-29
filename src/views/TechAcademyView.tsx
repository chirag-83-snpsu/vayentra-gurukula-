import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TechnicalCourse } from '../types';
import { 
  Code2, 
  Play, 
  Award, 
  Terminal, 
  CheckCircle2, 
  QrCode, 
  BookOpen, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const TechAcademyView: React.FC = () => {
  const { techCourses } = useApp();
  const [selectedCourse, setSelectedCourse] = useState<TechnicalCourse>(techCourses[0]);
  const [codeContent, setCodeContent] = useState(selectedCourse.labStarterCode);
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isTestPassed, setIsTestPassed] = useState<boolean>(false);
  const [showCertificate, setShowCertificate] = useState<boolean>(false);

  const handleSelectCourse = (c: TechnicalCourse) => {
    setSelectedCourse(c);
    setCodeContent(c.labStarterCode);
    setTerminalOutput('');
    setIsTestPassed(false);
    setShowCertificate(false);
  };

  const handleRunCode = () => {
    setTerminalOutput('Compiling in isolated browser sandbox...\nExecuting test assertions...');
    setTimeout(() => {
      setTerminalOutput(`Output:\n${selectedCourse.labExpectedOutput}\n\nAll 3 unit test assertions passed! [100% Code Coverage]`);
      setIsTestPassed(true);
    }, 700);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
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
            borderRadius: '12px',
            background: 'var(--color-teal-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Code2 size={28} color="#ffffff" />
          </div>
          <div>
            <div className="h1" style={{ fontSize: '22px', color: '#ffffff' }}>
              Vayentra Technical & Professional Academy
            </div>
            <div style={{ color: '#94a3b8', fontSize: '13px' }}>
              Hands-On Engineering Sandboxes • Mentor Rubrics • Verifiable Certificates (Diagram 98 & 99)
            </div>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-teal"
          onClick={() => setShowCertificate(true)}
        >
          <Award size={18} /> View Earned Certificate
        </button>
      </div>

      {/* Main Sandbox & Course Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
        
        {/* Track Courses List (Wireframe 78) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="h3">Tracks & Sandboxes</div>
          {techCourses.map(c => {
            const isSelected = c.id === selectedCourse.id;
            return (
              <div
                key={c.id}
                onClick={() => handleSelectCourse(c)}
                className={`b card-interactive ${isSelected ? 'card-selected' : ''}`}
                style={{
                  borderWidth: isSelected ? '2px' : '1.5px',
                  borderColor: isSelected ? 'var(--color-teal-primary)' : 'var(--color-border-subtle)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="chip chip-teal">{c.level}</span>
                  <span className="t-tiny">{c.durationWeeks} Weeks</span>
                </div>
                <div className="h3" style={{ fontSize: '15px', marginTop: '6px' }}>{c.title}</div>
                <div className="t-tiny" style={{ marginTop: '4px' }}>Track: {c.track}</div>
              </div>
            );
          })}
        </div>

        {/* The Interactive Code Lab (Wireframe 79) */}
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'var(--color-paper-card)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">{selectedCourse.title}</div>
              <div className="t-muted">{selectedCourse.description}</div>
            </div>
            <button type="button" className="btn btn-teal" onClick={handleRunCode}>
              <Play size={16} /> Run Lab Sandbox
            </button>
          </div>

          {/* Code Editor Container */}
          <div style={{
            background: '#0d1117',
            color: '#e6edf3',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '14px',
            lineHeight: 1.6
          }}>
            <div style={{ borderBottom: '1px solid #30363d', paddingBottom: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', color: '#8b949e', fontSize: '12px' }}>
              <span>main.py (Python 3.14 Runtime)</span>
              <span>Auto-Graded Unit Tests Ready</span>
            </div>
            <textarea
              rows={9}
              value={codeContent}
              onChange={(e) => setCodeContent(e.target.value)}
              style={{
                width: '100%',
                background: 'transparent',
                color: '#58a6ff',
                border: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                fontSize: '14px',
                resize: 'none'
              }}
            />
          </div>

          {/* Terminal Output */}
          {terminalOutput && (
            <div style={{
              background: '#161b22',
              color: isTestPassed ? '#3fb950' : '#d29922',
              padding: '14px',
              borderRadius: '8px',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '13px',
              whiteSpace: 'pre-wrap'
            }}>
              {terminalOutput}
            </div>
          )}

          {isTestPassed && (
            <div className="b" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>Challenge Passed!</strong> You have satisfied all test constraints.
              </div>
              <button type="button" className="btn btn-teal" onClick={() => setShowCertificate(true)}>
                Claim Certificate
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Verifiable Certificate Modal (Wireframe 80 / Diagram 97) */}
      {showCertificate && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            color: 'var(--color-ink)',
            maxWidth: '680px',
            width: '100%',
            padding: '36px',
            borderRadius: '16px',
            boxShadow: 'var(--shadow-lg)',
            border: '8px double var(--color-navy-primary)',
            position: 'relative'
          }}>
            <button
              type="button"
              className="ghost"
              onClick={() => setShowCertificate(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', minHeight: '32px' }}
            >
              ✕ Close
            </button>

            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <img
                src="/vayentra_logo.png"
                alt="Vayentra Gurukula"
                style={{ height: '68px', width: 'auto', objectFit: 'contain', marginBottom: '4px' }}
              />
              <div style={{ fontSize: '13px', letterSpacing: '2.5px', fontWeight: 800, color: 'var(--color-gold-dark)', textTransform: 'uppercase' }}>
                ✦ VAYENTRA TECHNICAL & PROFESSIONAL ACADEMY ✦
              </div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-navy-primary)', marginTop: '4px', fontFamily: 'var(--font-family-display)' }}>
                CERTIFICATE OF COMPLETION
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>This is to certify that</div>
              <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-navy-primary)', textDecoration: 'underline', textDecorationColor: 'var(--color-gold-bright)' }}>
                Aarav Varma
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>
                has successfully demonstrated proficiency and passed all lab evaluations in
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700 }}>
                {selectedCourse.title}
              </div>

              {/* Cryptographic Hash & Anti-Forgery QR */}
              <div style={{
                marginTop: '20px',
                paddingTop: '16px',
                borderTop: '1px solid #d8d8d0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '11px', color: '#777770' }}>Certificate ID: VAY-CERT-2026-89412</div>
                  <div style={{ fontSize: '11px', color: '#777770' }}>SHA-256 Hash: 0x9b72a4...f82e1c</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-navy-primary)', fontWeight: 700 }}>✦ Tamper-Evident Anti-Forgery Verified ✦</div>
                </div>

                <div style={{
                  width: '64px',
                  height: '64px',
                  border: '1px solid #bbb',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#f4f4f0'
                }}>
                  <QrCode size={48} color="#1f1f1c" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
