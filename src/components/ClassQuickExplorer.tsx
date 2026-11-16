import React, { useState } from 'react';
import { Sparkles, MapPin, CheckCircle2, ArrowRight, Lightbulb, Compass, BookOpen, Layers } from 'lucide-react';
import { recordConceptUnderstood, getDailyProgress } from '../utils/streakManager';

type GradeBand = '1-3' | '4-6' | '7-8' | '9-10';

interface MicroLesson {
  id: string;
  subject: string;
  title: string;
  location: string;
  storyHook: string;
  coreConcept: string;
  whyItMatters: string;
  quickCheck: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

const MICRO_LESSONS: Record<GradeBand, MicroLesson[]> = {
  '1-3': [
    {
      id: 'c13-metro-tokens',
      subject: 'Mathematics · Place Value',
      title: 'Namma Metro Token Stacks',
      location: 'Majestic Metro Station, Bengaluru',
      storyHook: 'Aarav buys 24 tokens at the counter. The station master hands him two neat stacks of 10 red tokens, plus 4 loose ones.',
      coreConcept: 'Numbers are built from tens and ones. 24 is not just digits—it is literally 2 Tens and 4 Ones (20 + 4).',
      whyItMatters: 'Grouping in tens makes adding large numbers as simple as counting small stacks.',
      quickCheck: {
        question: 'If Aarav needed 36 tokens, how many stacks of 10 would he get?',
        options: ['3 stacks of 10 and 6 loose tokens', '6 stacks of 10 and 3 loose tokens', '2 stacks of 10 and 16 loose tokens'],
        correctIndex: 0,
        explanation: '36 has 3 in the tens place (30) and 6 in the ones place (6).'
      }
    },
    {
      id: 'c13-cubbon-shadows',
      subject: 'Science · Light & Shadows',
      title: 'The Shrinking Cubbon Park Shadow',
      location: 'Cubbon Park Bamboo Groves',
      storyHook: 'At 9:00 AM, Diya’s shadow stretches long across the grass. At 12:00 noon, her shadow seems to disappear under her shoes!',
      coreConcept: 'Light travels in straight lines. When the morning sun is low at an angle, shadows are long. When overhead at noon, the shadow shrinks beneath you.',
      whyItMatters: 'Before watches existed, ancient Indian sundials told the exact minute using this exact shadow principle.',
      quickCheck: {
        question: 'When is a tree’s shadow usually the shortest in Bengaluru?',
        options: ['Early morning (7 AM)', 'Exactly around midday (12 Noon)', 'Late afternoon (5 PM)'],
        correctIndex: 1,
        explanation: 'The Sun is highest directly overhead at noon, casting light straight down.'
      }
    },
    {
      id: 'c13-masala-dosa-fractions',
      subject: 'Mathematics · Real-World Fractions',
      title: 'The Crispy Dosa Halves & Quarters',
      location: 'Vidyarthi Bhavan, Gandhi Bazaar',
      storyHook: 'Four cousins order 1 giant Masala Dosa. The waiter folds it in half (1/2), then slices it across into 4 equal quarters (1/4).',
      coreConcept: 'A fraction means equal shares of one whole item. 1 whole dosa = 2 halves = 4 quarters.',
      whyItMatters: 'Equal division is the secret to fair sharing and foundational geometry.',
      quickCheck: {
        question: 'If two cousins eat their quarters, what fraction of the dosa is left?',
        options: ['1/4 (One quarter)', '2/4 or 1/2 (One half)', '3/4 (Three quarters)'],
        correctIndex: 1,
        explanation: '4/4 - 2/4 = 2/4, which simplifies to 1/2 (half the dosa).'
      }
    }
  ],
  '4-6': [
    {
      id: 'c46-lalbagh-symmetry',
      subject: 'Mathematics · Geometry & Symmetry',
      title: 'Lalbagh Flower Mirror Lines',
      location: 'Lalbagh Glass House, Bengaluru',
      storyHook: 'Look right down the center of an exotic Lalbagh orchid. If you draw an imaginary vertical line down the middle, the left and right halves match identically.',
      coreConcept: 'Bilateral symmetry means one half is a mirror reflection of the other across a line of symmetry.',
      whyItMatters: 'Nature uses symmetry for aerodynamic balance in bird wings and petal efficiency in flowers.',
      quickCheck: {
        question: 'How many lines of symmetry does a perfect square have?',
        options: ['2 lines', '4 lines (2 straight, 2 diagonal)', 'Infinitely many'],
        correctIndex: 1,
        explanation: 'A square can be folded equally vertically, horizontally, and along both diagonals.'
      }
    },
    {
      id: 'c46-sankey-tank-filtration',
      subject: 'Science · Separation of Substances',
      title: 'How Sankey Tank Water Clears Up',
      location: 'Sankey Tank, Malleshwaram',
      storyHook: 'After a heavy Bengaluru downpour, the lake looks like brown chocolate milk. 24 hours later, the surface water is calm and clear.',
      coreConcept: 'Sedimentation & Decantation: Dense mud particles slowly sink to the bottom under gravity, leaving cleaner water on top.',
      whyItMatters: 'This natural physical process is the first step in Bengaluru’s municipal drinking water treatment plants.',
      quickCheck: {
        question: 'What is the settling of heavy mud particles to the bottom called?',
        options: ['Evaporation', 'Sedimentation', 'Condensation'],
        correctIndex: 1,
        explanation: 'Sedimentation is when heavier insoluble solids settle to the bottom of a liquid.'
      }
    },
    {
      id: 'c46-auto-meter-equation',
      subject: 'Mathematics · Applied Algebra',
      title: 'Cracking the Bengaluru Auto Meter',
      location: 'MG Road Auto Stand, Bengaluru',
      storyHook: 'The meter starts at a minimum base fare of Rs. 30 for the first 1.5 km, and adds Rs. 15 for each additional kilometre.',
      coreConcept: 'This is an algebraic linear function: Total Fare = 30 + 15 × (Distance - 1.5). Real algebra runs every meter in the city!',
      whyItMatters: 'Algebra isn’t abstract x and y—it is the math of real-life rates, electricity bills, and auto rides.',
      quickCheck: {
        question: 'What is the fare for a 3.5 km trip? (1.5 km base Rs. 30 + 2 extra km at Rs. 15/km)',
        options: ['Rs. 45', 'Rs. 60', 'Rs. 75'],
        correctIndex: 1,
        explanation: 'Rs. 30 (base) + 2 × Rs. 15 (Rs. 30) = Rs. 60 total.'
      }
    }
  ],
  '7-8': [
    {
      id: 'c78-flyover-expansion',
      subject: 'Science · Thermal Physics',
      title: 'Why Electronic City Flyover Has Metal Teeth',
      location: 'Hosur Road Elevated Expressway',
      storyHook: 'Driving along the 9 km elevated expressway, you hear rhythmic "thump-thump" sounds as your car passes metal interlocking comb teeth with small gaps.',
      coreConcept: 'Thermal Expansion of Solids: In peak April heat (36°C), concrete beams expand. Without expansion joints, the flyover would crack and buckle under internal stress!',
      whyItMatters: 'Civil engineers must calculate coefficient of thermal expansion before building any bridge or railway track.',
      quickCheck: {
        question: 'What happens to the gap between the metal teeth on a very hot summer afternoon?',
        options: ['The gap widens', 'The gap narrows as concrete expands', 'The gap never changes size'],
        correctIndex: 1,
        explanation: 'Heat causes solids to expand into the gap, closing it slightly to relieve pressure.'
      }
    },
    {
      id: 'c78-negative-integers-elevation',
      subject: 'Mathematics · Number System',
      title: 'Bellandur Sump to Rooftop Solar Deck',
      location: 'Eco-Apartment, Bellandur',
      storyHook: 'Ground level is 0 m. The rooftop solar deck is +15 m high. The rainwater percolation cellar is -4 m underground. What is the vertical span?',
      coreConcept: 'Subtracting a negative number: Distance = 15 - (-4) = 15 + 4 = 19 m. Subtracting a negative creates a positive distance!',
      whyItMatters: 'Negative numbers describe depths, bank deficits, and electric charges with exact geometric meaning.',
      quickCheck: {
        question: 'What is 12 - (-5)?',
        options: ['7', '17', '-17'],
        correctIndex: 1,
        explanation: 'Subtracting negative 5 is equivalent to adding positive 5: 12 + 5 = 17.'
      }
    },
    {
      id: 'c78-filter-coffee-chemistry',
      subject: 'Science · Solutions & Particle Size',
      title: 'The Chemistry of Traditional Filter Coffee',
      location: 'Brahmin’s Coffee Bar, Shankarapura',
      storyHook: 'Boiling water is poured over roasted chicory-coffee powder in a stainless steel brass percolator with micro-holes.',
      coreConcept: 'Solubility & Extraction: Hot water dissolves aromatic polyphenols and caffeine (solutes), while the filter prevents insoluble grounds from passing through.',
      whyItMatters: 'This is the exact same liquid-solid extraction chemistry used to manufacture life-saving pharmaceuticals.',
      quickCheck: {
        question: 'Why does boiling hot water brew stronger coffee than cold water?',
        options: ['Hot water dissolves more aromatic solute molecules faster', 'Hot water turns coffee powder into gas', 'Cold water neutralizes the caffeine'],
        correctIndex: 0,
        explanation: 'Solubility and diffusion rates increase with temperature as kinetic energy increases.'
      }
    }
  ],
  '9-10': [
    {
      id: 'c910-bmtc-inertia',
      subject: 'Science · Newton’s Laws of Motion',
      title: 'Silk Board Junction: BMTC Bus Inertia',
      location: 'Central Silk Board, Bengaluru',
      storyHook: 'You are standing on a BMTC Volvo bus cruising at 40 km/h. Suddenly, an auto swerves and the driver slams the brakes. You lurch violently forward!',
      coreConcept: 'Newton’s First Law (Inertia of Motion): Your feet stop because of friction with the bus floor, but your upper body continues moving forward at 40 km/h.',
      whyItMatters: 'This law is why seatbelts in cars and aircraft are mandatory for passenger survival.',
      quickCheck: {
        question: 'Which property of an object determines the magnitude of its inertia?',
        options: ['Its volume', 'Its mass', 'Its speed'],
        correctIndex: 1,
        explanation: 'Mass is the direct quantitative measure of an object’s inertia.'
      }
    },
    {
      id: 'c910-chinnaswamy-parabola',
      subject: 'Mathematics · Quadratic Functions',
      title: 'The Parabolic Sixer at Chinnaswamy',
      location: 'M. Chinnaswamy Stadium, MG Road',
      storyHook: 'A batsman launches a monster six toward the pavilion roof. The ball climbs smoothly, peaks at 30 m height, and curves downward symmetrically.',
      coreConcept: 'Projectile Motion is a Parabola: Vertical height follows a quadratic equation h(t) = ut - (1/2)gt². Its graph is a symmetrical curve pointing downward.',
      whyItMatters: 'Every missile trajectory, satellite launch, and fountain spray follows quadratic parabolic math.',
      quickCheck: {
        question: 'At the exact highest peak of the ball’s flight, what is its vertical velocity?',
        options: ['Maximum speed', '0 m/s for a split instant', '9.8 m/s'],
        correctIndex: 1,
        explanation: 'Before reversing direction from climbing to falling, the vertical component of velocity reaches zero.'
      }
    },
    {
      id: 'c910-copper-vessel-patina',
      subject: 'Science · Chemical Reactions & Acids',
      title: 'Why Bengaluru Grandma Cleans Copper with Tamarind',
      location: 'Malleswaram Heritage Home',
      storyHook: 'During the humid monsoon, shiny copper and brass pooja vessels turn dull and greenish. Grandma rubs them with tamarind pulp, and they instantly gleam like gold.',
      coreConcept: 'Copper oxidizes into basic copper carbonate [CuCO₃·Cu(OH)₂] (green patina). The tartaric acid in tamarind neutralizes the basic patina into a water-soluble salt!',
      whyItMatters: 'Acid-base neutralization isn’t just test equations—it cleans kitchen vessels and treats acid indigestion.',
      quickCheck: {
        question: 'What type of chemical reaction occurs between tamarind (tartaric acid) and basic copper patina?',
        options: ['Thermal decomposition', 'Acid-base neutralization', 'Precipitation synthesis'],
        correctIndex: 1,
        explanation: 'An acid reacts with a base to form salt and water, neutralizing the alkaline green coat.'
      }
    }
  ]
};

export const ClassQuickExplorer: React.FC = () => {
  const [activeBand, setActiveBand] = useState<GradeBand>('4-6');
  const [expandedLessonId, setExpandedLessonId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [completedIds, setCompletedIds] = useState<string[]>(() => getDailyProgress().completedIds);

  const lessons = MICRO_LESSONS[activeBand];

  const handleSelectAnswer = (lesson: MicroLesson, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [lesson.id]: optionIndex }));
    if (optionIndex === lesson.quickCheck.correctIndex) {
      const res = recordConceptUnderstood(lesson.id);
      if (!completedIds.includes(lesson.id)) {
        setCompletedIds(prev => [...prev, lesson.id]);
      }
    }
  };

  return (
    <div className="vg-quick-explorer" id="quick-explorer" aria-label="Class-Wise Quick Concept Explorer">
      <div className="vg-explorer-top">
        <div>
          <div className="vg-explorer-kicker">
            <Compass size={16} /> CLASS-WISE QUICK EXPLORER
          </div>
          <h3 className="vg-explorer-title">
            See how concepts come alive in everyday life.
          </h3>
          <p className="vg-explorer-subtitle">
            Select your class stage to preview story-driven micro-lessons rooted in real Bengaluru and everyday observations. No walls of text—just clear thinking.
          </p>
        </div>
      </div>

      {/* Grade Stage Filter Bar */}
      <div className="vg-explorer-tabs" role="tablist" aria-label="Select class stage">
        <button
          type="button"
          role="tab"
          aria-selected={activeBand === '1-3'}
          className={`vg-explorer-tab ${activeBand === '1-3' ? 'active' : ''}`}
          onClick={() => { setActiveBand('1-3'); setExpandedLessonId(null); }}
        >
          <span>Classes 1–3</span>
          <small>Early Foundations</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeBand === '4-6'}
          className={`vg-explorer-tab ${activeBand === '4-6' ? 'active' : ''}`}
          onClick={() => { setActiveBand('4-6'); setExpandedLessonId(null); }}
        >
          <span>Classes 4–6</span>
          <small>Middle Explorers</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeBand === '7-8'}
          className={`vg-explorer-tab ${activeBand === '7-8' ? 'active' : ''}`}
          onClick={() => { setActiveBand('7-8'); setExpandedLessonId(null); }}
        >
          <span>Classes 7–8</span>
          <small>Higher Reasoning</small>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeBand === '9-10'}
          className={`vg-explorer-tab ${activeBand === '9-10' ? 'active' : ''}`}
          onClick={() => { setActiveBand('9-10'); setExpandedLessonId(null); }}
        >
          <span>Classes 9–10</span>
          <small>Board Excellence</small>
        </button>
      </div>

      {/* 3 Visual Micro-Lesson Cards */}
      <div className="vg-explorer-grid">
        {lessons.map(lesson => {
          const isExpanded = expandedLessonId === lesson.id;
          const isCompleted = completedIds.includes(lesson.id);
          const chosenAnswer = selectedAnswers[lesson.id];
          const hasAnswered = chosenAnswer !== undefined;
          const isCorrect = chosenAnswer === lesson.quickCheck.correctIndex;

          return (
            <article key={lesson.id} className="vg-micro-card">
              <div>
                <div className="vg-micro-badge">
                  <BookOpen size={12} /> {lesson.subject}
                </div>
                <h4>{lesson.title}</h4>
                <div className="vg-micro-hook">
                  <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>{lesson.location}:</strong> {lesson.storyHook}
                  </div>
                </div>
                <p className="vg-micro-story">
                  <strong>The Core Concept:</strong> {lesson.coreConcept}
                </p>
              </div>

              <div>
                {isExpanded && (
                  <div style={{ marginTop: '12px', padding: '14px', background: '#ffffff', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '14px' }}>
                    <div style={{ fontSize: '13px', color: '#1e3a8a', marginBottom: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Lightbulb size={16} color="#f59e0b" /> Why it matters:
                    </div>
                    <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.6, margin: '0 0 12px 0' }}>
                      {lesson.whyItMatters}
                    </p>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                      <strong style={{ fontSize: '12.5px', color: '#0f172a' }}>
                        Quick Check: {lesson.quickCheck.question}
                      </strong>
                      <div style={{ display: 'grid', gap: '6px', marginTop: '8px' }}>
                        {lesson.quickCheck.options.map((opt, optIdx) => {
                          const isThisOption = chosenAnswer === optIdx;
                          const isThisCorrect = optIdx === lesson.quickCheck.correctIndex;
                          let btnStyle = {
                            padding: '8px 10px',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '12px',
                            textAlign: 'left' as const,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            color: '#334155'
                          };

                          if (hasAnswered) {
                            if (isThisCorrect) {
                              btnStyle.background = '#dcfce7';
                              btnStyle.border = '1px solid #86efac';
                              btnStyle.color = '#14532d';
                            } else if (isThisOption) {
                              btnStyle.background = '#fef3c7';
                              btnStyle.border = '1px solid #fcd34d';
                              btnStyle.color = '#92400e';
                            }
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              style={btnStyle}
                              onClick={() => handleSelectAnswer(lesson, optIdx)}
                            >
                              <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                              {hasAnswered && isThisCorrect && <CheckCircle2 size={14} color="#16a34a" />}
                            </button>
                          );
                        })}
                      </div>

                      {hasAnswered && (
                        <div style={{ marginTop: '10px', padding: '8px 10px', borderRadius: '8px', background: isCorrect ? '#ecfdf5' : '#fffbeb', fontSize: '11.5px', color: isCorrect ? '#065f46' : '#92400e', lineHeight: 1.5 }}>
                          {isCorrect ? '✓ ' : 'Hint: '}{lesson.quickCheck.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  className={`vg-micro-btn ${isCompleted ? 'completed' : ''}`}
                  onClick={() => setExpandedLessonId(isExpanded ? null : lesson.id)}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 size={15} /> Understood ({lesson.subject.split('·')[0].trim()})
                    </>
                  ) : isExpanded ? (
                    'Close Quick Check'
                  ) : (
                    <>
                      Explore & Test Understanding <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};
