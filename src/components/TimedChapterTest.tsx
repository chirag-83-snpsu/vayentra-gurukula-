import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { TimedTest, TestAttemptResult } from '../types';
import confetti from 'canvas-confetti';
import { 
  Clock, 
  Flag, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  Award,
  BookOpen
} from 'lucide-react';

interface TimedChapterTestProps {
  test: TimedTest;
  onClose: () => void;
  onFinish?: () => void;
}

export const TimedChapterTest: React.FC<TimedChapterTestProps> = ({ test, onClose, onFinish }) => {
  const { activeChild, addMistake } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<{ [qId: string]: boolean }>({});
  const [secondsRemaining, setSecondsRemaining] = useState(test.timeLimitMins * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState<TestAttemptResult | null>(null);

  // Timer Countdown
  useEffect(() => {
    if (testResult) return;

    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testResult]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQ = test.questions[currentIndex];

  const handleSelectOption = (idx: number) => {
    if (testResult) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQ.id]: idx }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/school/tests/${test.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: activeChild.id,
          answers: selectedAnswers,
          durationSecs: (test.timeLimitMins * 60) - secondsRemaining
        })
      });

      const data = await res.json();
      setTestResult(data);

      if (data.passed) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } else {
        // Automatically add failed questions to Mistake Notebook
        if (Array.isArray(data.reviewBreakdown)) {
          data.reviewBreakdown.filter((item: any) => !item.isCorrect).forEach((wrong: any) => {
            addMistake({
              studentId: activeChild.id,
              subject: test.subject,
              conceptName: 'Exam Checkpoint Mistake',
              questionPrompt: wrong.prompt,
              studentAnswer: wrong.studentAnswer,
              correctAnswer: wrong.correctAnswer,
              errorTag: 'Exam Concept Gap'
            });
          });
        }
      }
    } catch (err) {
      console.error('[Submit Test Error]:', err);
    } finally {
      setIsSubmitting(false);
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
        maxWidth: '780px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        
        {/* Test Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid var(--color-border-subtle)',
          paddingBottom: '14px'
        }}>
          <div>
            <div className="t-tiny" style={{ color: 'var(--color-teal-primary)', fontWeight: 600 }}>
              {test.board} • Class {test.grade} • {test.subject}
            </div>
            <div className="h2" style={{ fontSize: '20px', marginTop: '2px' }}>{test.title}</div>
          </div>

          {!testResult && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 14px',
              borderRadius: '10px',
              background: secondsRemaining < 300 ? 'var(--color-error-bg)' : 'var(--color-paper-subtle)',
              border: `1.5px solid ${secondsRemaining < 300 ? 'var(--color-error)' : 'var(--color-border)'}`,
              color: secondsRemaining < 300 ? 'var(--color-error)' : 'inherit',
              fontWeight: 700
            }}>
              <Clock size={18} />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          )}
        </div>

        {/* RESULTS VIEW */}
        {testResult ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              textAlign: 'center',
              padding: '24px',
              borderRadius: '14px',
              background: testResult.passed ? 'var(--color-success-bg)' : 'var(--color-saffron-light)',
              border: `1.5px solid ${testResult.passed ? 'var(--color-success)' : 'var(--color-saffron)'}`
            }}>
              <Award size={48} color={testResult.passed ? 'var(--color-success)' : 'var(--color-saffron)'} style={{ margin: '0 auto 8px auto' }} />
              <div className="h1" style={{ fontSize: '28px' }}>
                Score: {testResult.scorePercent}% ({testResult.correctCount} / {testResult.totalQuestions})
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '6px' }}>
                {testResult.passed ? 'Mastery Milestone Achieved!' : 'Needs Conceptual Review'}
              </div>
              <div className="t-muted" style={{ marginTop: '4px' }}>{testResult.message}</div>
            </div>

            {/* Answer Key Breakdown */}
            <div className="h2" style={{ fontSize: '18px' }}>Question-by-Question Review:</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {testResult.reviewBreakdown.map((item, idx) => (
                <div key={item.id} className="b" style={{
                  borderColor: item.isCorrect ? 'var(--color-success)' : 'var(--color-error)',
                  background: item.isCorrect ? 'var(--color-paper-card)' : 'var(--color-paper-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
                    {item.isCorrect ? (
                      <span className="chip chip-success">Correct</span>
                    ) : (
                      <span className="chip chip-error">Needs Review</span>
                    )}
                    <span>Question {idx + 1}: {item.prompt}</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '13px' }}>
                    <div>Your Answer: <strong>{item.studentAnswer}</strong></div>
                    {!item.isCorrect && (
                      <div style={{ color: 'var(--color-success)' }}>Correct Answer: <strong>{item.correctAnswer}</strong></div>
                    )}
                    <div className="t-muted" style={{ marginTop: '4px', fontStyle: 'italic' }}>
                      Explanation: {item.explanation}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              className="btn btn-teal"
              onClick={onClose}
              style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}
            >
              Return to Learn Hub
            </button>
          </div>
        ) : (
          /* ACTIVE EXAM QUESTION VIEW */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Question Selector Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {test.questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isFlagged = flaggedQuestions[q.id];
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      border: isCurrent ? '2px solid var(--color-teal-primary)' : '1px solid var(--color-border)',
                      background: isFlagged
                        ? '#fed7aa'
                        : isAnswered
                        ? 'var(--color-success-bg)'
                        : 'var(--color-paper-subtle)',
                      color: isFlagged ? '#9a3412' : isAnswered ? 'var(--color-success)' : 'inherit'
                    }}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Current Question Box */}
            <div className="b" style={{ padding: '20px', background: 'var(--color-paper-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="chip chip-navy">Question {currentIndex + 1} of {test.questions.length}</span>
                <button
                  type="button"
                  className="ghost"
                  onClick={() => toggleFlag(currentQ.id)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    color: flaggedQuestions[currentQ.id] ? '#ea580c' : 'inherit'
                  }}
                >
                  <Flag size={14} fill={flaggedQuestions[currentQ.id] ? '#ea580c' : 'none'} />
                  {flaggedQuestions[currentQ.id] ? 'Flagged for Later' : 'Flag for Later'}
                </button>
              </div>

              <div className="h2" style={{ fontSize: '18px', marginTop: '14px' }}>
                {currentQ.prompt}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {currentQ.options.map((opt, optIdx) => {
                  const isSelected = selectedAnswers[currentQ.id] === optIdx;
                  return (
                    <div
                      key={optIdx}
                      onClick={() => handleSelectOption(optIdx)}
                      className="b card-interactive"
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        borderWidth: isSelected ? '2px' : '1px',
                        borderColor: isSelected ? 'var(--color-teal-primary)' : 'var(--color-border)',
                        background: isSelected ? 'var(--color-teal-light)' : 'var(--color-paper-card)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        border: '2px solid var(--color-border)',
                        background: isSelected ? 'var(--color-teal-primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {isSelected && '✓'}
                      </div>
                      <span style={{ fontSize: '15px' }}>{opt}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                className="ghost"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => prev - 1)}
              >
                <ArrowLeft size={16} /> Previous
              </button>

              {currentIndex < test.questions.length - 1 ? (
                <button
                  type="button"
                  className="btn btn-teal"
                  onClick={() => setCurrentIndex(prev => prev + 1)}
                >
                  Next Question <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-navy"
                  disabled={isSubmitting}
                  onClick={handleSubmitTest}
                  style={{ background: 'var(--color-success)', color: '#ffffff' }}
                >
                  {isSubmitting ? 'Evaluating Marks...' : 'Submit Chapter Exam'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
