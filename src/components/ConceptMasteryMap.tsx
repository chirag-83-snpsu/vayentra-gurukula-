import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  BookOpen, 
  Flame, 
  Star, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

interface ConceptNode {
  id: string;
  name: string;
  nameKn: string;
  tier: 'foundation' | 'core' | 'advanced';
  status: 'mastered' | 'in_progress' | 'locked';
  masteryPercent: number;
  episodesCount: number;
  prerequisites: string[];
  summary: string;
}

export const ConceptMasteryMap: React.FC = () => {
  const { activeChild, language } = useApp();
  const isKannada = language === 'Kannada' || activeChild.medium === 'Kannada';

  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(null);

  const concepts: ConceptNode[] = [
    {
      id: 'c-wholenum',
      name: 'Whole Numbers & Number Line',
      nameKn: 'ಪೂರ್ಣ ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಸಂಖ್ಯಾ ರೇಖೆ',
      tier: 'foundation',
      status: 'mastered',
      masteryPercent: 100,
      episodesCount: 2,
      prerequisites: [],
      summary: 'Foundational positioning of non-negative values starting from 0 to infinity on a horizontal ray.'
    },
    {
      id: 'c-int-intro',
      name: 'Integers: Negative Numbers & Direction',
      nameKn: 'ಪೂರ್ಣಾಂಕಗಳು: ಋಣ ಸಂಖ್ಯೆಗಳು ಮತ್ತು ದಿಕ್ಕು',
      tier: 'foundation',
      status: 'mastered',
      masteryPercent: 100,
      episodesCount: 1,
      prerequisites: ['c-wholenum'],
      summary: 'Symmetric reflection of natural numbers across the zero fulcrum for temperature, elevation, and debt.'
    },
    {
      id: 'c-int-ops',
      name: 'Sign Arithmetic (Multiplication & Division)',
      nameKn: 'ಚಿಹ್ನೆಗಳ ಲೆಕ್ಕಾಚಾರ (ಗುಣಾಕಾರ ಮತ್ತು ಭಾಗಾಕಾರ)',
      tier: 'core',
      status: 'in_progress',
      masteryPercent: 65,
      episodesCount: 1,
      prerequisites: ['c-int-intro'],
      summary: 'Rules for multiplying like signs (+ * + = +, - * - = +) and unlike signs (+ * - = -).'
    },
    {
      id: 'c-bodmas',
      name: 'BODMAS & Bracket Precedence',
      nameKn: 'ಬೋಡ್ಮಾಸ್ ಮತ್ತು ಆವರಣ ಚಿಹ್ನೆಗಳ ಆದ್ಯತೆ',
      tier: 'core',
      status: 'locked',
      masteryPercent: 0,
      episodesCount: 1,
      prerequisites: ['c-int-ops'],
      summary: 'Order of algebraic evaluations avoiding sign collisions through bracket hierarchy.'
    },
    {
      id: 'c-rational',
      name: 'Rational Numbers & Fractions',
      nameKn: 'ಭಾಗಲಬ್ಧ ಸಂಖ್ಯೆಗಳು ಮತ್ತು ಭಿನ್ನರಾಶಿಗಳು',
      tier: 'advanced',
      status: 'locked',
      masteryPercent: 0,
      episodesCount: 3,
      prerequisites: ['c-int-ops', 'c-bodmas'],
      summary: 'Numbers expressible as p/q where q is non-zero, operating across decimal representations.'
    }
  ];

  const getStatusColor = (status: ConceptNode['status']) => {
    switch (status) {
      case 'mastered':
        return 'var(--color-success)';
      case 'in_progress':
        return 'var(--color-saffron)';
      case 'locked':
        return 'var(--color-border)';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Concept Map Banner */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, var(--color-paper-card) 0%, var(--color-paper-subtle) 100%)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={22} color="var(--color-gold-primary)" />
            {isKannada ? 'ಪರಿಕಲ್ಪನೆಗಳ ನಕ್ಷೆ (ಕೋರ್ಸ್ ಗ್ರಾಫ್)' : 'Curriculum Concept Mastery Map & Prerequisite Graph'}
          </div>
          <div className="t-muted">
            {isKannada 
              ? 'ಪ್ರತಿಯೊಂದು ಪಾಠವು ಹಿಂದಿನ ಪರಿಕಲ್ಪನೆಗಳ ಅಡಿಪಾಯದ ಮೇಲೆ ನಿಂತಿದೆ. ಕ್ಲಿಕ್ ಮಾಡಿ ವಿವರಗಳನ್ನು ನೋಡಿ.'
              : 'Every mathematical topic builds on earlier prerequisites. Visualizing the learning path ensures zero concept gaps.'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="chip chip-success">● Mastered (2)</span>
          <span className="chip chip-gold">● In Progress (1)</span>
          <span className="chip">○ Locked (2)</span>
        </div>
      </div>

      {/* Visual Concept Flow Matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {concepts.map((concept, idx) => {
          const isSelected = selectedConcept?.id === concept.id;
          const statusColor = getStatusColor(concept.status);

          return (
            <div
              key={concept.id}
              onClick={() => setSelectedConcept(concept)}
              className="b card-interactive"
              style={{
                borderRadius: '14px',
                padding: '20px',
                cursor: 'pointer',
                borderLeft: `5px solid ${statusColor}`,
                borderWidth: isSelected ? '2px' : '1px',
                borderColor: isSelected ? 'var(--color-teal-primary)' : undefined,
                background: isSelected ? 'var(--color-teal-light)' : 'var(--color-paper-card)',
                boxShadow: isSelected ? 'var(--shadow-md)' : undefined,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '14px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="chip chip-navy" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    Tier: {concept.tier}
                  </span>
                  {concept.status === 'mastered' ? (
                    <span className="chip chip-success"><CheckCircle2 size={12} /> Mastered</span>
                  ) : concept.status === 'in_progress' ? (
                    <span className="chip chip-gold">{concept.masteryPercent}% Mastery</span>
                  ) : (
                    <span className="chip"><Lock size={12} /> Prerequisite Required</span>
                  )}
                </div>

                <div className="h2" style={{ fontSize: '17px', marginTop: '10px' }}>
                  {isKannada ? concept.nameKn : concept.name}
                </div>

                <div className="t-tiny" style={{ marginTop: '6px', color: 'var(--color-text-subtle)', lineHeight: 1.4 }}>
                  {concept.summary}
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '4px' }}>
                  <span>Mastery Level</span>
                  <span>{concept.masteryPercent}%</span>
                </div>
                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  background: 'var(--color-border-subtle)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${concept.masteryPercent}%`,
                    height: '100%',
                    background: statusColor,
                    borderRadius: '3px',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Concept Deep-Dive Drawer */}
      {selectedConcept && (
        <div className="b" style={{
          background: 'var(--color-paper-card)',
          borderRadius: '14px',
          padding: '24px',
          borderColor: 'var(--color-teal-primary)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="chip chip-teal">{selectedConcept.tier.toUpperCase()} CONCEPT NODE</span>
              <div className="h1" style={{ fontSize: '22px', marginTop: '6px' }}>
                {isKannada ? selectedConcept.nameKn : selectedConcept.name}
              </div>
              <div className="t-muted" style={{ marginTop: '4px' }}>{selectedConcept.summary}</div>
            </div>
            <button
              type="button"
              className="ghost"
              onClick={() => setSelectedConcept(null)}
              style={{ padding: '4px 10px' }}
            >
              Close Details
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            borderTop: '1px solid var(--color-border-subtle)',
            paddingTop: '14px'
          }}>
            <div>
              <div className="t-tiny" style={{ fontWeight: 600 }}>Mastery Status</div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: getStatusColor(selectedConcept.status) }}>
                {selectedConcept.status === 'mastered' ? 'Certified Mastered (100%)' : selectedConcept.status === 'in_progress' ? 'Practicing (65%)' : 'Locked'}
              </div>
            </div>
            <div>
              <div className="t-tiny" style={{ fontWeight: 600 }}>Curriculum Episodes</div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>{selectedConcept.episodesCount} Verified Micro-Lessons</div>
            </div>
            <div>
              <div className="t-tiny" style={{ fontWeight: 600 }}>Prerequisites</div>
              <div style={{ fontSize: '15px' }}>
                {selectedConcept.prerequisites.length > 0 ? selectedConcept.prerequisites.join(', ') : 'None (Base Concept)'}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
