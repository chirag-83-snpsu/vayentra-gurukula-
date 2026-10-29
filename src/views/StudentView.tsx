import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Episode, CheckpointQuestion } from '../types';
import { UniversalStateWrapper } from '../components/UniversalStateWrapper';
import confetti from 'canvas-confetti';
import { 
  Play, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  FileText, 
  RotateCcw, 
  Volume2, 
  Send, 
  Flame, 
  Star, 
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Search,
  Check,
  ArrowRight
} from 'lucide-react';

export const StudentView: React.FC = () => {
  const {
    activeChild,
    chapters,
    completeEpisodeCheckpoint,
    mistakes,
    resolveMistake,
    addMistake,
    doubts,
    askDoubt,
    isOfflineMode,
    language
  } = useApp();

  const isPrimary = activeChild.grade <= 4;
  const isKannada = language === 'Kannada' || activeChild.medium === 'Kannada';

  // Navigation tab within student hub
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'mistakes' | 'doubts' | 'map'>('learn');

  // Currently selected chapter & episode
  const currentChapter = chapters[0];
  const [selectedEpisode, setSelectedEpisode] = useState<Episode>(() => {
    return currentChapter.episodes.find(e => !e.isCompleted && !e.isLocked) || currentChapter.episodes[0];
  });

  // Checkpoint Quiz State
  const [inQuizMode, setInQuizMode] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [qId: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Doubt input state
  const [doubtText, setDoubtText] = useState('');

  // Handle checkpoint quiz option select
  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  // Submit Checkpoint Quiz
  const handleSubmitQuiz = () => {
    if (!selectedEpisode) return;
    
    let correctCount = 0;
    const questions = selectedEpisode.checkpointQuestions;

    questions.forEach(q => {
      const studentChoice = selectedAnswers[q.id];
      if (studentChoice === q.correctIndex) {
        correctCount++;
      } else {
        // Automatically log wrong answer into Mistake Notebook (Diagram 26)
        addMistake({
          studentId: activeChild.id,
          questionPrompt: q.prompt,
          studentAnswer: studentChoice !== undefined ? q.options[studentChoice] : 'Unanswered',
          correctAnswer: q.options[q.correctIndex],
          errorTag: 'concept_gap',
          conceptName: q.conceptId,
          subject: currentChapter.subject
        });
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);
    setQuizScore(scorePercent);
    setQuizSubmitted(true);

    // Call store update
    completeEpisodeCheckpoint(currentChapter.id, selectedEpisode.id, scorePercent);

    // Trigger confetti celebration on passing score (>= 60%)!
    if (scorePercent >= 60) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleNextEpisode = () => {
    const currentIndex = currentChapter.episodes.findIndex(e => e.id === selectedEpisode.id);
    if (currentIndex + 1 < currentChapter.episodes.length) {
      const nextEp = currentChapter.episodes[currentIndex + 1];
      if (!nextEp.isLocked) {
        setSelectedEpisode(nextEp);
        setInQuizMode(false);
        setQuizSubmitted(false);
        setSelectedAnswers({});
      }
    }
  };

  const handleSendDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    askDoubt(doubtText.trim(), 'text');
    setDoubtText('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Student Welcome Header Card */}
      <div className="b" style={{
        background: isPrimary 
          ? 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)' 
          : 'linear-gradient(135deg, var(--color-paper-subtle) 0%, var(--color-paper-card) 100%)',
        borderColor: isPrimary ? 'var(--color-saffron)' : 'var(--color-border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ fontSize: isPrimary ? '42px' : '32px' }}>{activeChild.avatar}</div>
          <div>
            <div className="h1" style={{ fontSize: isPrimary ? '26px' : '22px' }}>
              {isKannada ? `ನಮಸ್ಕಾರ, ${activeChild.name}!` : `Hi, ${activeChild.name}!`}
            </div>
            <div className="t-muted">
              Class {activeChild.grade} • {activeChild.board} • {activeChild.medium} Medium
            </div>
          </div>
        </div>

        {/* Gamification Chips (Private to child & parent - Diagram 31) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span className="chip chip-gold" style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 700 }}>
            <Flame size={16} color="var(--color-gold-primary)" /> Streak: {activeChild.streakDays} Days
          </span>
          <span className="chip chip-navy" style={{ padding: '6px 14px', fontSize: '13px', fontWeight: 700 }}>
            <Star size={16} color="var(--color-gold-bright)" fill="var(--color-gold-bright)" /> {activeChild.starsEarned} Stars
          </span>
          <span className="chip" style={{ padding: '6px 14px', fontSize: '13px' }}>
            ⏱ Daily Goal: {activeChild.minutesUsedToday}/{activeChild.dailyTimeLimitMins}m
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          type="button"
          className={activeTab === 'learn' ? 'btn btn-teal' : 'ghost'}
          onClick={() => { setActiveTab('learn'); setInQuizMode(false); }}
        >
          <BookOpen size={16} /> {isKannada ? 'ಪಾಠ ಕಲಿಯಿರಿ' : 'Continue Learning'}
        </button>
        <button
          type="button"
          className={activeTab === 'mistakes' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('mistakes')}
        >
          <RotateCcw size={16} /> {isKannada ? 'ತಪ್ಪುಗಳ ನೋಟ್‌ಬುಕ್' : 'Mistake Notebook'} ({mistakes.filter(m => !m.isResolved).length})
        </button>
        <button
          type="button"
          className={activeTab === 'doubts' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('doubts')}
        >
          <HelpCircle size={16} /> {isKannada ? 'ಸಂಶಯ ಪರಿಹಾರ' : 'Ask AI Tutor'}
        </button>
        <button
          type="button"
          className={activeTab === 'map' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('map')}
        >
          <Sparkles size={16} /> {isKannada ? 'ಪರಿಕಲ್ಪನೆ ನಕ್ಷೆ' : 'Concept Map'}
        </button>
      </div>

      {/* TAB 1: LEARN (Episode Player / Story Mode) */}
      {activeTab === 'learn' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Active Chapter Breadcrumb & Progress */}
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="t-tiny" style={{ fontWeight: 600, color: 'var(--color-teal-primary)' }}>
                {isKannada ? currentChapter.subjectKn : currentChapter.subject} • Chapter 1
              </div>
              <div className="h2" style={{ marginTop: '2px' }}>
                {isKannada ? currentChapter.titleKn : currentChapter.title}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="chip chip-teal">Progress: {currentChapter.progressPercent}%</span>
              {currentChapter.isMastered && <span className="chip chip-success">Mastered ★</span>}
            </div>
          </div>

          {/* Episode Selection Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {currentChapter.episodes.map(ep => {
              const isSelected = ep.id === selectedEpisode.id;
              return (
                <div
                  key={ep.id}
                  onClick={() => {
                    if (!ep.isLocked) {
                      setSelectedEpisode(ep);
                      setInQuizMode(false);
                      setQuizSubmitted(false);
                      setSelectedAnswers({});
                    }
                  }}
                  className={`b card-interactive ${isSelected ? 'card-selected' : ''}`}
                  style={{
                    borderWidth: isSelected ? '2px' : '1.5px',
                    borderColor: isSelected ? 'var(--color-teal-primary)' : ep.isLocked ? 'var(--color-border-subtle)' : 'var(--color-border)',
                    opacity: ep.isLocked ? 0.6 : 1,
                    cursor: ep.isLocked ? 'not-allowed' : 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="chip">Episode {ep.episodeNumber} of {ep.totalEpisodes}</span>
                    {ep.isCompleted ? (
                      <span className="chip chip-success"><CheckCircle2 size={12} /> {ep.scorePercent}%</span>
                    ) : ep.isLocked ? (
                      <span className="chip"><Lock size={12} /> Locked</span>
                    ) : (
                      <span className="chip chip-teal">Up Next</span>
                    )}
                  </div>
                  <div className="h3" style={{ fontSize: '15px' }}>
                    {isKannada ? (ep.titleKn || ep.title) : ep.title}
                  </div>
                  <div className="t-tiny" style={{ marginTop: '4px' }}>
                    ⏱ {ep.durationMinutes} mins • Interactive Checkpoint
                  </div>
                </div>
              );
            })}
          </div>

          {/* THE EPISODE PLAYER (Matching Wireframe 04 / Diagram 48) */}
          <UniversalStateWrapper state={isOfflineMode ? 'offline' : 'loaded'}>
            {!inQuizMode ? (
              <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Trust Label Banner (Mandatory AT-08 Trust Stamp) */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'var(--color-paper-subtle)',
                  border: '1px solid var(--color-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <ShieldCheck size={18} color="var(--color-teal-primary)" />
                  <div>
                    <strong>Trust Label:</strong> Reviewed by {selectedEpisode.trustLabel.reviewerName} • {selectedEpisode.trustLabel.board} • Verified {selectedEpisode.trustLabel.verifiedDate} {selectedEpisode.trustLabel.isAiAssisted && '• AI-Assisted'}
                  </div>
                </div>

                {/* Simulated Video / Interactive Canvas Box */}
                <div style={{
                  height: '240px',
                  background: 'radial-gradient(circle, #2d3748 0%, #1a202c 100%)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '20px',
                  textAlign: 'center',
                  boxShadow: 'var(--shadow-md)'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: 'var(--color-teal-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(15, 110, 86, 0.6)'
                  }}>
                    <Play size={28} color="#ffffff" style={{ marginLeft: '4px' }} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '16px' }}>
                    {selectedEpisode.title}
                  </div>
                  <div style={{ fontSize: '12px', color: '#cbd5e0' }}>
                    Includes 3-Minute Hook, Intuitive Step Breakdown & Try-It Simulation
                  </div>
                </div>

                {/* Episode Breakdown Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '14px' }}>
                  {/* Hook */}
                  <div className="b" style={{ background: 'var(--color-paper-card)' }}>
                    <div className="h3" style={{ color: 'var(--color-saffron)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} /> 1. Curiosity Hook
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '15px' }}>{selectedEpisode.hook}</div>
                  </div>

                  {/* Core Explanation */}
                  <div className="b" style={{ background: 'var(--color-paper-card)' }}>
                    <div className="h3" style={{ color: 'var(--color-teal-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <BookOpen size={16} /> 2. Core Explanation
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '15px' }}>{selectedEpisode.explanation}</div>
                  </div>

                  {/* Real-World Context */}
                  <div className="b" style={{ background: 'var(--color-paper-card)' }}>
                    <div className="h3" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      🌍 3. Real-World India Context
                    </div>
                    <div style={{ marginTop: '6px', fontSize: '15px' }}>{selectedEpisode.realWorldExample}</div>
                  </div>

                  {/* Quick Recap */}
                  <div className="b" style={{ background: 'var(--color-paper-card)' }}>
                    <div className="h3">📝 4. Quick Recap</div>
                    <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {selectedEpisode.recapBullets.map((bullet, idx) => (
                        <li key={idx} style={{ fontSize: '14px' }}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Checkpoint Trigger Button */}
                <button
                  type="button"
                  className="btn btn-gold btn-large"
                  onClick={() => { setInQuizMode(true); setQuizSubmitted(false); }}
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Take Compulsory Checkpoint (Unlock Next Episode) <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              /* THE CHECKPOINT ASSESSMENT (Matching Wireframe 08 & 09 / Diagram 9 & 10) */
              <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="h2">Episode {selectedEpisode.episodeNumber} Checkpoint</div>
                    <div className="t-muted">3 Questions • Score 60% or higher to unlock next episode</div>
                  </div>
                  <button type="button" className="ghost" onClick={() => setInQuizMode(false)}>
                    Back to Lesson
                  </button>
                </div>

                {/* Questions List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {selectedEpisode.checkpointQuestions.map((q, idx) => {
                    const studentPick = selectedAnswers[q.id];
                    return (
                      <div key={q.id} className="b" style={{ background: 'var(--color-paper-card)', padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div className="h3" style={{ fontSize: '16px' }}>
                            Q{idx + 1}. {q.prompt}
                          </div>
                          <span className="chip">{q.difficulty}</span>
                        </div>

                        {/* Options */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                          {q.options.map((opt, optIdx) => {
                            const isChosen = studentPick === optIdx;
                            let optBg = 'transparent';
                            let optBorder = 'var(--color-border-subtle)';

                            if (quizSubmitted) {
                              if (optIdx === q.correctIndex) {
                                optBg = 'var(--color-success-bg)';
                                optBorder = 'var(--color-success)';
                              } else if (isChosen && optIdx !== q.correctIndex) {
                                optBg = 'var(--color-error-bg)';
                                optBorder = 'var(--color-error)';
                              }
                            } else if (isChosen) {
                              optBg = 'var(--color-teal-light)';
                              optBorder = 'var(--color-teal-primary)';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectOption(q.id, optIdx)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  padding: '12px 16px',
                                  borderRadius: '8px',
                                  border: `1.5px solid ${optBorder}`,
                                  background: optBg,
                                  color: 'var(--color-ink)',
                                  textAlign: 'left',
                                  cursor: quizSubmitted ? 'default' : 'pointer',
                                  fontSize: '15px'
                                }}
                              >
                                <span style={{
                                  width: '24px',
                                  height: '24px',
                                  borderRadius: '50%',
                                  border: '1.5px solid currentColor',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: '12px',
                                  fontWeight: 700
                                }}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation on submission */}
                        {quizSubmitted && (
                          <div style={{
                            marginTop: '12px',
                            padding: '10px 12px',
                            borderRadius: '6px',
                            background: 'var(--color-paper-subtle)',
                            fontSize: '13px'
                          }}>
                            <strong>Rationale:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Score & Next Step Actions */}
                {!quizSubmitted ? (
                  <button
                    type="button"
                    className="btn btn-teal btn-large"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(selectedAnswers).length < selectedEpisode.checkpointQuestions.length}
                    style={{ width: '100%' }}
                  >
                    Submit Checkpoint & Verify Score
                  </button>
                ) : (
                  <div className="b" style={{
                    textAlign: 'center',
                    padding: '24px',
                    borderColor: quizScore >= 60 ? 'var(--color-success)' : 'var(--color-saffron)',
                    background: quizScore >= 60 ? 'var(--color-success-bg)' : 'var(--color-saffron-light)'
                  }}>
                    <div className="h1" style={{ fontSize: '32px' }}>
                      {quizScore}% Score
                    </div>
                    <div style={{ fontSize: '16px', marginTop: '4px' }}>
                      {quizScore >= 60 
                        ? '🎉 Mastery Goal Reached! Next episode has been unlocked.'
                        : '⚠️ Keep trying! Check step hints below or review earlier recap.'}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '16px' }}>
                      <button
                        type="button"
                        className="ghost"
                        onClick={() => { setQuizSubmitted(false); setSelectedAnswers({}); }}
                      >
                        <RotateCcw size={16} /> Retry Checkpoint
                      </button>
                      {quizScore >= 60 && (
                        <button
                          type="button"
                          className="btn btn-teal"
                          onClick={handleNextEpisode}
                        >
                          Next Episode <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </UniversalStateWrapper>
        </div>
      )}

      {/* TAB 2: MISTAKE NOTEBOOK (Matching Wireframe 37 / Diagram 26) */}
      {activeTab === 'mistakes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="b" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="h2">{isKannada ? 'ನನ್ನ ತಪ್ಪುಗಳ ನೋಟ್‌ಬುಕ್' : 'My Mistake Notebook'}</div>
              <div className="t-muted">
                {isKannada ? 'ತಪ್ಪುಗಳನ್ನು ಸರಿಪಡಿಸಿ ಪೂರ್ಣಾಂಕಗಳ ಮಾಸ್ಟರ್ ಆಗಿ' : 'Review and correct misconceptions. Questions marked here reappear in spaced repetition.'}
              </div>
            </div>
            <span className="chip chip-saffron">
              {mistakes.filter(m => !m.isResolved).length} Pending Review
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {mistakes.map(item => (
              <div key={item.id} className="b" style={{
                background: item.isResolved ? 'var(--color-paper-subtle)' : 'var(--color-paper-card)',
                borderColor: item.isResolved ? 'var(--color-success)' : 'var(--color-border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="chip chip-saffron">Tag: {item.errorTag.toUpperCase()}</span>
                  <div className="t-tiny">{item.date} • {item.subject}</div>
                </div>

                <div className="h3" style={{ fontSize: '15px' }}>{item.questionPrompt}</div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                  <div style={{ padding: '8px', background: 'var(--color-error-bg)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--color-error)', fontWeight: 600 }}>Your Answer:</span> {item.studentAnswer}
                  </div>
                  <div style={{ padding: '8px', background: 'var(--color-success-bg)', borderRadius: '6px' }}>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>Correct Answer:</span> {item.correctAnswer}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <div className="t-tiny" style={{ color: 'var(--color-teal-primary)' }}>
                    Concept: {item.conceptName}
                  </div>
                  {!item.isResolved ? (
                    <button
                      type="button"
                      className="btn btn-teal"
                      style={{ minHeight: '36px', fontSize: '12px' }}
                      onClick={() => resolveMistake(item.id)}
                    >
                      <Check size={14} /> Mark Understood & Fixed
                    </button>
                  ) : (
                    <span className="chip chip-success">Fixed & Spaced Review Scheduled</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DOUBTS & CHILD-SAFE AI TUTOR (Matching Wireframe 22 & 41 / Diagram 15 & 45) */}
      {activeTab === 'doubts' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="b">
            <div className="h2">{isKannada ? 'ಗುರುಕುಲ AI ಸಂಶಯ ಪರಿಹಾರಕ' : 'AI Doubt Tutor'}</div>
            <div className="t-muted">
              {isKannada ? 'ಪಠ್ಯಕ್ರಮ ಆಧಾರಿತ ಸಂಶಯಗಳನ್ನು ಯಾವುದೇ ಸಮಯದಲ್ಲಿ ಕೇಳಿ' : 'Ask questions about your chapter. Answers are grounded in certified syllabus notes only.'}
            </div>
          </div>

          {/* Doubt Input Box */}
          <form onSubmit={handleSendDoubt} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea
              rows={3}
              placeholder={isKannada ? "ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ..." : "Ask your doubt (e.g., Why does -5 × -2 equal +10?)..."}
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              style={{ resize: 'none' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="t-tiny">
                🔒 Safe Guardrails: No active exam answers • PII Redacted
              </span>
              <button type="submit" className="btn btn-teal" disabled={!doubtText.trim()}>
                <Send size={16} /> Ask Tutor
              </button>
            </div>
          </form>

          {/* Previous Doubts Stream */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {doubts.map(d => (
              <div key={d.id} className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="chip chip-teal">{d.subject}</span>
                  <div className="t-tiny">{d.timestamp}</div>
                </div>

                <div className="h3" style={{ fontSize: '15px' }}>
                  🙋 "{d.questionText}"
                </div>

                {d.aiAnswer && (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--color-paper-subtle)',
                    borderLeft: '4px solid var(--color-teal-primary)',
                    fontSize: '14px',
                    lineHeight: 1.5
                  }}>
                    <strong>Tutor Explanation:</strong> {d.aiAnswer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CONCEPT MAP (Matching Wireframe 38 / Diagram 25) */}
      {activeTab === 'map' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="b">
            <div className="h2">{isKannada ? 'ಪರಿಕಲ್ಪನೆ ನಕ್ಷೆ' : 'Concept Prerequisite Map'}</div>
            <div className="t-muted">
              Visualizes prerequisite dependencies and your mastery journey from Class 6 foundations to Class 8 advanced topics.
            </div>
          </div>

          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="chip chip-success">Mastered (Class 6)</div>
              <ArrowRight size={16} />
              <div className="chip chip-teal">Current: Integers Multiplication (Class 7)</div>
              <ArrowRight size={16} />
              <div className="chip">Upcoming: Rational Numbers (Class 7)</div>
            </div>

            <div style={{ height: '140px', background: 'var(--color-paper-subtle)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div className="t-muted">DAG Graph Visualizer: 14 Concepts Tracked across Term 1 Syllabus</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
