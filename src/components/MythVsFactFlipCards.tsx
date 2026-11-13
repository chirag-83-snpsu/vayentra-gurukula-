import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, RotateCw, Lightbulb, Sparkles, BookOpen } from 'lucide-react';
import { recordConceptUnderstood, getDailyProgress } from '../utils/streakManager';

interface FlipCardItem {
  id: string;
  subject: string;
  myth: string;
  mythDetail: string;
  fact: string;
  explanation: string;
  takeaway: string;
}

const MYTH_FACTS: FlipCardItem[] = [
  {
    id: 'myth-heavy-fall',
    subject: 'Science · Physics (Class 9)',
    myth: 'Heavier objects always fall faster than lighter objects.',
    mythDetail: 'Many students believe a cricket ball drops faster than a sheet of paper because it is heavier.',
    fact: 'In a vacuum, all objects fall at the exact same acceleration (g = 9.8 m/s²)!',
    explanation: 'On Earth, a flat paper falls slowly only because of air resistance (drag). In 1971 on the airless Moon, Apollo 15 astronaut David Scott dropped a 1.32 kg geological hammer and a 0.03 kg falcon feather simultaneously—both hit the lunar dust at the exact same millisecond.',
    takeaway: 'Gravitational acceleration does not depend on the mass of the falling object.'
  },
  {
    id: 'myth-negative-times-negative',
    subject: 'Mathematics · Integers (Classes 6–7)',
    myth: 'Negative × Negative = Positive is just a random rule you must memorise.',
    mythDetail: 'Students often wonder why two negatives do not simply make a bigger negative.',
    fact: 'Multiplying by -1 is a 180° rotation on the number line!',
    explanation: 'Think of walking on a number line. Positive means facing East. Multiplying by -1 means turning around 180° to face West. If you multiply by -1 a second time, you make another 180° turn—which points you back East (positive)! Two reversals restore original direction.',
    takeaway: '(-1) × (-1) = +1 is geometric direction reversal, not arbitrary memorization.'
  },
  {
    id: 'myth-start-with-because',
    subject: 'English · Grammar & Syntax (Classes 7–10)',
    myth: 'You must NEVER start an English sentence with "Because" or "And".',
    mythDetail: 'Many learners get marked down unnecessarily by informal rules.',
    fact: 'Starting with "Because" is 100% grammatically correct when followed by a main clause!',
    explanation: '“Because it was raining heavily in Bengaluru, the cricket practice was moved indoors.” Here, “Because it was raining...” is a dependent adverbial clause, followed by an independent main clause. Both CBSE marking schemes and Oxford Style Guides approve this.',
    takeaway: 'Just ensure the sentence isn’t an incomplete fragment missing its main clause.'
  },
  {
    id: 'myth-lightning-never-twice',
    subject: 'Science · Atmospheric Electricity (Class 8)',
    myth: 'Lightning never strikes the same place twice.',
    mythDetail: 'People assume lightning spreads randomly and avoids previous hit locations.',
    fact: 'Lightning routinely strikes the exact same structure dozens of times every year!',
    explanation: 'Lightning is an electrostatic discharge that always follows the path of least electrical resistance to ground. Tall skyscrapers in Bengaluru, cell phone towers, and lightning arresters get struck repeatedly during monsoon storm systems.',
    takeaway: 'Lightning seeks the tallest conducting path to discharge clouds safely to Earth.'
  },
  {
    id: 'myth-point-nine-repeating',
    subject: 'Mathematics · Real Numbers (Class 9)',
    myth: '0.999... repeating forever is just slightly less than 1.',
    mythDetail: 'Intuition tells students that there must be an infinitesimal gap between 0.999... and 1.',
    fact: '0.999... is strictly and mathematically equal to 1. Exactly.',
    explanation: 'Let x = 0.999999...\nThen multiply both sides by 10:\n10x = 9.999999...\nNow subtract the first equation from the second:\n10x - x = 9.999... - 0.999...\n9x = 9 ⟹ x = 1!\nSince x was 0.999..., 0.999... = 1 with zero gap.',
    takeaway: 'Two different decimal notations can represent the exact same real number.'
  },
  {
    id: 'myth-plants-only-oxygen',
    subject: 'Science · Biology & Respiration (Classes 7 & 10)',
    myth: 'Plants only produce oxygen and do not breathe in oxygen.',
    mythDetail: 'Learners confuse photosynthesis with cellular respiration.',
    fact: 'Plants breathe in oxygen and release CO₂ continuously 24 hours a day!',
    explanation: 'All living plant cells require oxygen to break down glucose for cellular energy (respiration). In daytime, photosynthesis produces more oxygen than respiration consumes, resulting in a net release. But at night without sunlight, plants only consume oxygen.',
    takeaway: 'Photosynthesis makes food; respiration releases energy using oxygen 24/7.'
  }
];

export const MythVsFactFlipCards: React.FC = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [completedIds, setCompletedIds] = useState<string[]>(() => getDailyProgress().completedIds);

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUnderstand = (e: React.MouseEvent, item: FlipCardItem) => {
    e.stopPropagation();
    const res = recordConceptUnderstood(item.id);
    if (!completedIds.includes(item.id)) {
      setCompletedIds(prev => [...prev, item.id]);
    }
  };

  return (
    <section className="vg-myth-section" id="myth-busters" aria-label="Myth vs Fact Learning Flip Cards">
      <div className="vgp-container">
        <div className="vg-myth-header">
          <div className="vg-myth-kicker">
            <Sparkles size={16} /> DID YOU KNOW? · MYTH VS. FACT
          </div>
          <h2 className="vg-myth-title">
            Tricky misconceptions that trip students in exams.
          </h2>
          <p className="vg-myth-subtitle">
            Click any card to flip and discover the real scientific, mathematical, and grammatical reasoning behind common school myths.
          </p>
        </div>

        <div className="vg-myth-grid">
          {MYTH_FACTS.map(item => {
            const isFlipped = !!flippedCards[item.id];
            const isUnderstood = completedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`vg-flip-container ${isFlipped ? 'flipped' : ''}`}
                onClick={() => toggleFlip(item.id)}
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFlip(item.id);
                  }
                }}
              >
                <div className="vg-flip-inner">
                  {/* FRONT SIDE (MYTH) */}
                  <div className="vg-flip-front">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="vg-flip-badge-myth">
                          <HelpCircle size={12} /> COMMON MYTH
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          {item.subject}
                        </span>
                      </div>
                      <h3>"{item.myth}"</h3>
                      <p>{item.mythDetail}</p>
                    </div>

                    <div className="vg-flip-front-footer">
                      <span>
                        <RotateCw size={14} /> Click to flip & reveal truth
                      </span>
                      {isUnderstood && (
                        <span style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 size={14} /> Mastered
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BACK SIDE (VERIFIED FACT & REASONING) */}
                  <div className="vg-flip-back">
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span className="vg-flip-badge-fact">
                          <CheckCircle2 size={12} /> VERIFIED FACT
                        </span>
                        <span style={{ fontSize: '11px', color: '#93c5fd', fontWeight: 600 }}>
                          {item.subject.split('·')[0]}
                        </span>
                      </div>
                      <h3>{item.fact}</h3>
                      <p style={{ whiteSpace: 'pre-line' }}>{item.explanation}</p>
                      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', color: '#fef08a', marginBottom: '14px', borderLeft: '3px solid #facc15' }}>
                        <strong>Takeaway:</strong> {item.takeaway}
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        className="vg-flip-understand-btn"
                        onClick={(e) => handleUnderstand(e, item)}
                      >
                        {isUnderstood ? (
                          <>
                            <CheckCircle2 size={15} /> Understood (+1 Concept Today)
                          </>
                        ) : (
                          <>
                            <Lightbulb size={15} /> I Understand This Principle
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
