import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FlashcardItem } from '../types';
import { INITIAL_FLASHCARDS } from '../data/mockData';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  ArrowRight, 
  Layers, 
  Award,
  BookOpen
} from 'lucide-react';

export const PracticeArena: React.FC = () => {
  const { activeChild } = useApp();
  const [flashcards, setFlashcards] = useState<FlashcardItem[]>(INITIAL_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');

  // Load flashcards from backend
  useEffect(() => {
    fetch(`/api/v1/school/practice/flashcards?studentId=${activeChild.id}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setFlashcards(data);
        }
      })
      .catch(() => {
        // Fallback to initial
      });
  }, [activeChild.id]);

  const filteredCards = selectedSubject === 'All' 
    ? flashcards 
    : flashcards.filter(c => c.subject === selectedSubject);

  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  const handleReview = async (isCorrect: boolean) => {
    if (!currentCard) return;

    try {
      const res = await fetch(`/api/v1/school/practice/flashcards/${currentCard.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCorrect })
      });
      const data = await res.json();

      // Update local state
      setFlashcards(prev => prev.map(c => {
        if (c.id === currentCard.id) {
          return {
            ...c,
            boxLevel: data.newBoxLevel || (isCorrect ? Math.min(5, c.boxLevel + 1) : 1)
          };
        }
        return c;
      }));

      if (isCorrect && (currentCard.boxLevel + 1 >= 5)) {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (e) {
      // Local fallback
      setFlashcards(prev => prev.map(c => {
        if (c.id === currentCard.id) {
          return {
            ...c,
            boxLevel: isCorrect ? Math.min(5, c.boxLevel + 1) : 1
          };
        }
        return c;
      }));
    }

    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const boxColors = [
    '',
    '#ef4444', // Box 1: Red (Daily)
    '#f97316', // Box 2: Orange (2 days)
    '#eab308', // Box 3: Yellow (Weekly)
    '#3b82f6', // Box 4: Blue (Bi-weekly)
    '#10b981'  // Box 5: Green (Mastered)
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Leitner Box System Header Banner */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, var(--color-paper-card) 0%, var(--color-paper-subtle) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={22} color="var(--color-teal-primary)" />
            Spaced Repetition Practice Arena (Leitner 5-Box System)
          </div>
          <div className="t-muted">
            Concepts move through 5 spaced memory boxes. Correct answers advance to long-term memory; mistakes return to Box 1 for daily practice.
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'Mathematics', 'Science'].map(subj => (
            <button
              key={subj}
              type="button"
              className={selectedSubject === subj ? 'btn btn-teal' : 'ghost'}
              onClick={() => { setSelectedSubject(subj); setCurrentIndex(0); setIsFlipped(false); }}
              style={{ minHeight: '34px', fontSize: '13px', padding: '4px 12px' }}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Leitner Box Tracker Indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[1, 2, 3, 4, 5].map(boxNum => {
          const count = flashcards.filter(c => c.boxLevel === boxNum).length;
          const labels = ['Daily Review', 'Every 2 Days', 'Weekly', 'Bi-Weekly', 'Mastered Memory'];
          return (
            <div key={boxNum} className="b" style={{
              borderLeft: `4px solid ${boxColors[boxNum]}`,
              padding: '12px',
              textAlign: 'center'
            }}>
              <div className="t-tiny" style={{ fontWeight: 700, color: boxColors[boxNum] }}>
                BOX {boxNum}
              </div>
              <div className="h1" style={{ fontSize: '24px', margin: '2px 0' }}>{count}</div>
              <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>{labels[boxNum - 1]}</div>
            </div>
          );
        })}
      </div>

      {/* Active Flashcard Canvas */}
      {currentCard ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="b card-interactive"
            style={{
              width: '100%',
              maxWidth: '640px',
              minHeight: '280px',
              borderRadius: '16px',
              padding: '32px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'center',
              cursor: 'pointer',
              background: isFlipped ? 'var(--color-paper-card)' : 'linear-gradient(135deg, #ffffff 0%, var(--color-paper-subtle) 100%)',
              borderColor: isFlipped ? 'var(--color-teal-primary)' : 'var(--color-border)',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Top Card Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="chip chip-navy">{currentCard.subject} • {currentCard.conceptName}</span>
              <span className="chip" style={{ borderColor: boxColors[currentCard.boxLevel], color: boxColors[currentCard.boxLevel] }}>
                Leitner Box {currentCard.boxLevel}
              </span>
            </div>

            {/* Central Content */}
            <div style={{ margin: '24px 0' }}>
              {!isFlipped ? (
                <div>
                  <div className="t-tiny" style={{ color: 'var(--color-text-subtle)', marginBottom: '8px' }}>QUESTION PROMPT</div>
                  <div className="h1" style={{ fontSize: '24px', color: 'var(--color-navy-primary)' }}>
                    {currentCard.frontPrompt}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="t-tiny" style={{ color: 'var(--color-success)', marginBottom: '8px', fontWeight: 700 }}>ANSWER & INTUITION</div>
                  <div className="h1" style={{ fontSize: '26px', color: 'var(--color-success)' }}>
                    {currentCard.backAnswer}
                  </div>
                  <div className="t-muted" style={{ marginTop: '12px', fontSize: '14px', maxWidth: '480px', margin: '12px auto 0 auto' }}>
                    {currentCard.explanation}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Flip Hint */}
            <div className="t-tiny" style={{ color: 'var(--color-text-subtle)', fontStyle: 'italic' }}>
              {isFlipped ? 'Click card to flip back' : 'Click anywhere on card to reveal answer'}
            </div>
          </div>

          {/* Flashcard Action Buttons (Only visible when flipped) */}
          {isFlipped ? (
            <div style={{ display: 'flex', gap: '14px', width: '100%', maxWidth: '640px' }}>
              <button
                type="button"
                className="ghost"
                onClick={() => handleReview(false)}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  minHeight: '46px',
                  color: 'var(--color-error)',
                  borderColor: 'var(--color-error)'
                }}
              >
                <RotateCcw size={16} /> Need to Review (Reset to Box 1)
              </button>
              <button
                type="button"
                className="btn btn-teal"
                onClick={() => handleReview(true)}
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  minHeight: '46px'
                }}
              >
                <CheckCircle2 size={16} /> I Mastered This! (Promote Card)
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-navy"
              onClick={() => setIsFlipped(true)}
              style={{ minHeight: '44px', padding: '0 28px' }}
            >
              Reveal Answer
            </button>
          )}

          {/* Progress Indicator */}
          <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>
            Card {currentIndex + 1} of {filteredCards.length}
          </div>

        </div>
      ) : (
        <div className="b" style={{ textAlign: 'center', padding: '40px' }}>
          <Sparkles size={36} color="var(--color-gold-primary)" style={{ margin: '0 auto 12px auto' }} />
          <div className="h2">No flashcards due for review today!</div>
          <div className="t-muted">All concept cards are in higher Leitner boxes. Check back tomorrow.</div>
        </div>
      )}

    </div>
  );
};
