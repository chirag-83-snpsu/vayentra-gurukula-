import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import confetti from 'canvas-confetti';
import { 
  X, 
  Sparkles, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  GraduationCap 
} from 'lucide-react';

interface ScholarshipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVoucher?: (code: string) => void;
}

export const ScholarshipModal: React.FC<ScholarshipModalProps> = ({ isOpen, onClose, onApplyVoucher }) => {
  const [step, setStep] = useState<'register' | 'test' | 'result'>('register');
  const [candidateName, setCandidateName] = useState('');
  const [candidateGrade, setCandidateGrade] = useState<number>(7);
  const [candidateMobile, setCandidateMobile] = useState('');

  // 5 Aptitude Questions
  const questions = [
    {
      q: 'If 3 cats catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?',
      options: ['100 cats', '3 cats', '30 cats', '1 cat'],
      correct: 1
    },
    {
      q: 'Which number continues the sequence: 2, 6, 12, 20, 30, ?',
      options: ['40', '42', '44', '36'],
      correct: 1
    },
    {
      q: 'Evaluate: (-15) + (-20) - (-35)',
      options: ['-70', '0', '+40', '-35'],
      correct: 1
    },
    {
      q: 'What is the prime factorization of 72?',
      options: ['2³ × 3²', '2² × 3³', '8 × 9', '2 × 36'],
      correct: 0
    },
    {
      q: 'Which gas is released by green plants during the light-dependent reaction of photosynthesis?',
      options: ['Carbon Dioxide', 'Oxygen', 'Nitrogen', 'Methane'],
      correct: 1
    }
  ];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [idx: number]: number }>({});
  const [scorePercent, setScorePercent] = useState(0);
  const [voucherCode, setVoucherCode] = useState('');

  if (!isOpen) return null;

  const handleStartTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !candidateMobile.trim()) return;
    setStep('test');
  };

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: optIdx }));
  };

  const handleSubmitTest = () => {
    let correct = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) correct++;
    });

    const percent = Math.round((correct / questions.length) * 100);
    setScorePercent(percent);

    const generatedCode = `GURUKULA-MEDHA-${percent >= 80 ? '50' : '30'}`;
    setVoucherCode(generatedCode);
    setStep('result');

    if (percent >= 60) {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
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
        background: 'var(--color-paper-card)',
        width: '100%',
        maxWidth: '580px',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <button
          type="button"
          className="ghost"
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px 8px' }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <Logo variant="compact" height={44} />
          <div className="h2" style={{ fontSize: '20px' }}>
            Vayentra Gurukula Medha Scholarship 2026
          </div>
          <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>
            Merit-Based Fee Concession Assessment for Classes 1 to 10
          </div>
        </div>

        {/* STEP 1: REGISTRATION */}
        {step === 'register' && (
          <form onSubmit={handleStartTest} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="t-muted" style={{ fontSize: '14px', textAlign: 'center' }}>
              Take a short 5-minute aptitude assessment to unlock up to <strong>50% tuition scholarship</strong> for the upcoming academic year.
            </div>

            <div>
              <label className="t-tiny" style={{ fontWeight: 600 }}>Student Full Name</label>
              <input
                type="text"
                placeholder="e.g. Diya Sharma"
                value={candidateName}
                onChange={e => setCandidateName(e.target.value)}
                required
                style={{ width: '100%', marginTop: '4px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label className="t-tiny" style={{ fontWeight: 600 }}>Current Grade</label>
                <select
                  value={candidateGrade}
                  onChange={e => setCandidateGrade(Number(e.target.value))}
                  style={{ width: '100%', marginTop: '4px' }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(g => (
                    <option key={g} value={g}>Class {g}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="t-tiny" style={{ fontWeight: 600 }}>Parent Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91 98450..."
                  value={candidateMobile}
                  onChange={e => setCandidateMobile(e.target.value)}
                  required
                  style={{ width: '100%', marginTop: '4px' }}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-teal" style={{ minHeight: '44px', justifyContent: 'center', marginTop: '6px' }}>
              Begin 5-Minute Scholarship Assessment <ArrowRight size={16} />
            </button>
          </form>
        )}

        {/* STEP 2: TEST */}
        {step === 'test' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="chip chip-navy">Question {currentQIndex + 1} of {questions.length}</span>
              <span className="chip chip-gold"><Clock size={12} /> Untimed Practice</span>
            </div>

            <div className="h2" style={{ fontSize: '17px' }}>
              {questions[currentQIndex].q}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {questions[currentQIndex].options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQIndex] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className="b card-interactive"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      borderWidth: isSelected ? '2px' : '1px',
                      borderColor: isSelected ? 'var(--color-teal-primary)' : 'var(--color-border)',
                      background: isSelected ? 'var(--color-teal-light)' : 'var(--color-paper-card)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: '2px solid var(--color-border)',
                      background: isSelected ? 'var(--color-teal-primary)' : 'transparent',
                      color: '#fff',
                      fontSize: '11px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}>
                      {isSelected && '✓'}
                    </div>
                    <span>{opt}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <button
                type="button"
                className="ghost"
                disabled={currentQIndex === 0}
                onClick={() => setCurrentQIndex(prev => prev - 1)}
              >
                Previous
              </button>

              {currentQIndex < questions.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-teal"
                  onClick={() => setCurrentQIndex(prev => prev + 1)}
                >
                  Next Question
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-navy"
                  onClick={handleSubmitTest}
                  style={{ background: 'var(--color-success)', color: '#fff' }}
                >
                  Complete & Calculate Scholarship
                </button>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: RESULT */}
        {step === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'center' }}>
            <div style={{
              background: 'var(--color-success-bg)',
              border: '1.5px solid var(--color-success)',
              borderRadius: '14px',
              padding: '24px'
            }}>
              <Award size={48} color="var(--color-success)" style={{ margin: '0 auto 8px auto' }} />
              <div className="h1" style={{ fontSize: '26px', color: 'var(--color-success)' }}>
                Scholarship Qualified!
              </div>
              <div className="t-muted" style={{ marginTop: '4px' }}>
                Candidate: <strong>{candidateName}</strong> • Score: <strong>{scorePercent}%</strong>
              </div>
            </div>

            <div className="b" style={{ padding: '16px', background: 'var(--color-gold-light)', borderColor: 'var(--color-gold-border)' }}>
              <div className="t-tiny" style={{ fontWeight: 700, color: 'var(--color-gold-primary)' }}>
                EXCLUSIVE MERIT DISCOUNT CODE
              </div>
              <div className="h1" style={{ fontSize: '24px', letterSpacing: '2px', color: 'var(--color-navy-primary)', margin: '6px 0' }}>
                {voucherCode}
              </div>
              <div className="t-tiny">Valid for 30% to 50% tuition fee reduction on any Gurukula subscription plan.</div>
            </div>

            <button
              type="button"
              className="btn btn-teal"
              onClick={() => {
                if (onApplyVoucher) onApplyVoucher(voucherCode);
                onClose();
              }}
              style={{ minHeight: '44px', justifyContent: 'center' }}
            >
              Apply Voucher & Enroll Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
