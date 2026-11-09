import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  BookOpen, 
  ArrowRight, 
  Flame, 
  Award, 
  Play, 
  Users,
  Compass,
  GraduationCap,
  Brain,
  MessageSquare,
  TrendingUp,
  HeartHandshake,
  Check,
  ChevronRight,
  Calculator,
  Eye,
  Lock,
  Layers,
  HelpCircle,
  FileCheck
} from 'lucide-react';

import { Logo } from '../components/Logo';
import { ScholarshipModal } from '../components/ScholarshipModal';
import { CoursePathways } from '../components/CoursePathways';

export const PublicView: React.FC = () => {
  const { setRole, setShowPublicPortal } = useApp();
  const [selectedBoard, setSelectedBoard] = useState<'CBSE' | 'STATE'>('CBSE');
  const [selectedClass, setSelectedClass] = useState<number>(7);
  const [isScholarshipOpen, setIsScholarshipOpen] = useState<boolean>(false);
  const [abacusBeads, setAbacusBeads] = useState<number[]>([3, 4, 2, 5, 1]); // Interactive visual abacus beads state

  // Sample chapter previews mapped to board & grade
  const curriculumPreviews: Record<string, Record<number, { math: string; science: string; language: string; highlights: string[] }>> = {
    CBSE: {
      1: { math: 'Numbers & Shapes in Daily Life', science: 'My Living Surroundings & Nature', language: 'Phonics, Rhymes & Picture Stories', highlights: ['Audio-first story learning', 'Physical counting aids', 'Star rewards'] },
      2: { math: 'Two-Digit Addition & Measurement', science: 'Plants, Animals & Water Cycles', language: 'Bilingual Sentence Formation', highlights: ['Tactile number lines', 'Observation journals', 'No numerical scoring'] },
      3: { math: 'Intro to Multiplication & Time', science: 'Soil, Birds & Food Habits', language: 'Reading Fluency & Vocabulary', highlights: ['Visual array multiplication', 'EVS experiments', 'Parent-assisted audio'] },
      4: { math: 'Long Division & Basic Fractions', science: 'Human Body Systems & Adaptations', language: 'Creative Expression & Comprehension', highlights: ['Fraction strip visualizer', 'Scientific curiosity hooks', 'Explain-it-back'] },
      5: { math: 'Factors, Multiples & Volume', science: 'Energy, Force & Simple Machines', language: 'Grammar Precision & Short Essays', highlights: ['Mental math shortcuts', 'Interactive force simulations', 'Concept mapping'] },
      6: { math: 'Integers, Algebra & Geometry', science: 'Food Components, Fiber & Motion', language: 'Formal Composition & Debate', highlights: ['Sign flip rules', 'Lab observation methods', 'Mistake notebook'] },
      7: { math: 'Integer Operations, Rational Numbers & Lines', science: 'Photosynthesis, Heat, Acids & Bases', language: 'Analytical Reading & Dialogue', highlights: ['Directional number lines', 'Real chemical color tests', 'Leitner flashcards'] },
      8: { math: 'Linear Equations & Quadrilaterals', science: 'Cell Structure, Microorganisms & Combustion', language: 'Critical Writing & Presentation', highlights: ['Balance scale equation solving', 'Microscopic cell diagrams', 'Diagnostic gap-fill'] },
      9: { math: 'Polynomials, Coordinate Geometry & Surface Areas', science: 'Laws of Motion, Atoms & Gravitation', language: 'Classic Literature & Rhetoric', highlights: ['Proof-first geometry', 'Physics free-body diagrams', 'Timed chapter tests'] },
      10: { math: 'Real Numbers, Quadratic Equations & Trigonometry', science: 'Chemical Reactions, Electricity & Heredity', language: 'Board Exam Precision Writing', highlights: ['Board-pattern mock papers', 'Step-by-step marking rubrics', 'Formula cheat-sheets'] }
    },
    STATE: {
      1: { math: 'Numbers & Shapes in Daily Life', science: 'Our Environment & Nature', language: 'Foundational Phonics & Reading', highlights: ['State textbook aligned', 'Hands-on counting aids', 'Picture story cards'] },
      2: { math: 'Addition & Subtraction Foundations', science: 'Plants, Animals & Habitats', language: 'Sentence Formation & Vocabulary', highlights: ['Karnataka State Board syllabus', 'Tactile number models', 'Star badges'] },
      3: { math: 'Multiplication & Units of Measurement', science: 'Water, Air & Living Things', language: 'Reading Comprehension & Stories', highlights: ['Mental arithmetic drills', 'Local Karnataka context', 'Guided learning'] },
      4: { math: 'Division & Geometric Patterns', science: 'Human Body Systems & Community', language: 'Grammar Foundations & Composition', highlights: ['Hands-on fraction discs', 'Karnataka flora & fauna', 'Voice questions'] },
      5: { math: 'Factors, Decimals & Shapes', science: 'Ecosystems, Energy & Natural Resources', language: 'Composition & Structured Essays', highlights: ['Practical measurement kits', 'Agricultural science links', 'Concept mapping'] },
      6: { math: 'Integers, Factors & Algebra Basics', science: 'Matter, Energy & Motion', language: 'Literature, Expression & Debate', highlights: ['Directional number lines', 'State board curriculum match', 'Concept mastery'] },
      7: { math: 'Integer Arithmetic & Rational Numbers', science: 'Photosynthesis, Heat & Reactions', language: 'Language Fluency & Analytical Reading', highlights: ['Karnataka context examples', 'Clear concept glossaries', 'Leitner flashcards'] },
      8: { math: 'Linear Equations & Mensuration', science: 'Cell Biology, Forces & Pressure', language: 'Public Speaking & Presentation', highlights: ['Step-by-step equation checking', 'Diagram labeling practice', 'Diagnostic test'] },
      9: { math: 'Polynomials & Coordinate Geometry', science: 'Laws of Motion & Gravitation', language: 'Literary Analysis & Writing', highlights: ['State board syllabus diff check', 'Formula cheat-sheets', 'Spaced revision'] },
      10: { math: 'SSLC Real Numbers & Trigonometry', science: 'SSLC Electricity, Reactions & Heredity', language: 'SSLC Board Exam Precision Writing', highlights: ['KSEAB SSLC exam blueprint', 'Step-wise marking rubrics', 'Weekly mock papers'] }
    }
  };

  const currentPreview = curriculumPreviews[selectedBoard]?.[selectedClass] || curriculumPreviews.CBSE[7];

  const browseCurriculum = () => document.getElementById('vg-curriculum-explorer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const handleAbacusTap = (colIdx: number) => {
    setAbacusBeads(prev => {
      const copy = [...prev];
      copy[colIdx] = (copy[colIdx] % 5) + 1;
      return copy;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
      
      {/* 1. TOP ANNOUNCEMENT TICKER */}
      <div style={{
        background: 'linear-gradient(90deg, var(--color-navy-dark) 0%, var(--color-navy-primary) 50%, var(--color-navy-dark) 100%)',
        color: '#ffffff',
        padding: '10px 20px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        border: '1px solid rgba(200, 138, 30, 0.4)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600 }}>
          <span className="chip" style={{ background: 'var(--color-gold-primary)', color: '#ffffff', border: 'none', padding: '3px 10px' }}>
            ✦ 2026–2027 ADMISSIONS
          </span>
          <span>Classes 1 to 10 • CBSE & Karnataka State Board • Abacus Mental Math Cohorts</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button" 
            className="ghost" 
            onClick={() => setIsScholarshipOpen(true)}
            style={{ 
              minHeight: '32px', 
              fontSize: '12px', 
              color: 'var(--color-gold-bright)', 
              borderColor: 'var(--color-gold-border)',
              padding: '4px 12px'
            }}
          >
            <Award size={14} /> Aptitude Scholarship Test
          </button>
        </div>
      </div>

      {/* 2. HERO SECTION */}
      <section className="b" style={{
        background: 'linear-gradient(145deg, #ffffff 0%, var(--color-navy-light) 40%, var(--color-gold-light) 100%)',
        padding: '48px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '22px',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-lg)',
        border: '2px solid var(--color-gold-border)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Watermark Badge */}
        <div style={{ position: 'absolute', top: '-40px', right: '-40px', opacity: 0.04, pointerEvents: 'none' }}>
          <GraduationCap size={260} />
        </div>

        {/* Brand Emblem */}
        <Logo variant="hero" height={96} />

        <div className="ribbon-banner">
          CONCEPT-BASED ACADEMIC COACHING
        </div>

        <h1 style={{ 
          fontSize: 'clamp(28px, 4.5vw, 42px)', 
          maxWidth: '880px', 
          lineHeight: 1.22, 
          color: 'var(--color-navy-primary)',
          letterSpacing: '-0.02em',
          fontWeight: 800
        }}>
          Where Concepts Become Clear, Mental Maths Becomes Natural, and Every Child Learns with Confidence.
        </h1>

        <div style={{ 
          maxWidth: '740px', 
          fontSize: '16px', 
          lineHeight: 1.6, 
          color: 'var(--color-ink)' 
        }}>
          <span>
            Moving beyond rote memorization for <strong>Classes 1 to 10</strong> across <strong>CBSE</strong> and <strong>Karnataka State Board</strong>. 
            We nurture foundational understanding, rapid mental math, articulate communication, and personalized academic progress with child-safe AI tutoring.
          </span>
        </div>

        {/* Hero CTAs */}
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
          <button 
            type="button" 
            className="btn btn-teal btn-large" 
            onClick={() => document.getElementById('vg-courses-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{ boxShadow: 'var(--shadow-md)' }}
          >
            <Play size={20} /> Explore Learning Pathways <ArrowRight size={20} />
          </button>
          
          <button 
            type="button" 
            className="btn btn-gold btn-large"
            onClick={() => setIsScholarshipOpen(true)}
          >
            <Award size={20} /> Take Scholarship Aptitude Test
          </button>

          <button 
            type="button" 
            className="ghost btn-large" 
            onClick={() => { setRole('parent'); setShowPublicPortal(false); }}
            style={{ background: '#ffffff' }}
          >
            <Users size={20} /> Parent Family Portal
          </button>
        </div>

        {/* Trust Badges */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '24px', 
          flexWrap: 'wrap', 
          marginTop: '16px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(18, 43, 112, 0.12)',
          width: '100%',
          maxWidth: '900px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-navy-primary)' }}>
            <ShieldCheck size={18} color="var(--color-success)" />
            <span>Private, Parent-Aware Learning</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-navy-primary)' }}>
            <Award size={18} color="var(--color-gold-primary)" />
            <span>Teacher-Guided Academic Support</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--color-navy-primary)' }}>
            <CheckCircle2 size={18} color="var(--color-navy-primary)" />
            <span>Private Progress (No Public Shaming Boards)</span>
          </div>
        </div>
      </section>

      <CoursePathways grade={selectedClass} board={selectedBoard} onGradeChange={setSelectedClass} onBoardChange={setSelectedBoard} onBrowse={browseCurriculum} />

      {/* 3. THE 5 CORE GURUKULA PILLARS (Bento Grid) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div className="ribbon-banner" style={{ background: 'var(--color-gold-primary)' }}>
            PEDAGOGICAL EXCELLENCE
          </div>
          <h2 style={{ fontSize: '28px', marginTop: '10px', color: 'var(--color-navy-primary)' }}>
            Our 5 Educational Pillars for Classes 1 to 10
          </h2>
          <p className="t-muted" style={{ fontSize: '15px', marginTop: '6px' }}>
            Designed around how children naturally discover, calculate, articulate, and build lasting academic mastery.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '20px' 
        }}>
          
          {/* Pillar 1: Practical Understanding */}
          <div className="b card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'var(--color-navy-light)', 
              color: 'var(--color-navy-primary)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Brain size={24} />
            </div>
            <div className="h3" style={{ fontSize: '18px', color: 'var(--color-navy-primary)' }}>
              1. Practical Understanding
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              We eliminate rote memorization. Every concept begins with a <strong>physical, observable phenomenon</strong>—like understanding negative numbers through debt and film rewind, or plant vascular bundles through celery capillary action.
            </p>
            <div className="t-tiny" style={{ marginTop: 'auto', fontWeight: 600, color: 'var(--color-navy-primary)' }}>
              ✓ Real-world thought experiments • Visual analogies • Interactive simulations
            </div>
          </div>

          {/* Pillar 2: Mental Maths Agility */}
          <div className="b card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '4px solid var(--color-gold-bright)' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'var(--color-gold-light)', 
              color: 'var(--color-gold-dark)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Calculator size={24} />
            </div>
            <div className="h3" style={{ fontSize: '18px', color: 'var(--color-gold-dark)' }}>
              2. Mental Maths & Number Sense
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Students develop acute number fluency and calculation speed. Through structured mental arithmetic techniques, decomposition strategies, and pattern recognition, math transforms from intimidating formulas into effortless logic.
            </p>
            <div className="t-tiny" style={{ marginTop: 'auto', fontWeight: 600, color: 'var(--color-gold-dark)' }}>
              ✓ Rapid calculation habits • Number line visualization • Math step checkers
            </div>
          </div>

          {/* Pillar 3: Articulate Communication */}
          <div className="b card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'var(--color-navy-light)', 
              color: 'var(--color-navy-primary)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <MessageSquare size={24} />
            </div>
            <div className="h3" style={{ fontSize: '18px', color: 'var(--color-navy-primary)' }}>
              3. Expressive Communication
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              True mastery means being able to articulate what you know. Our unique <strong>"Explain-It-Back"</strong> prompts encourage students to explain problems in their own words, building academic vocabulary and confident presentation.
            </p>
            <div className="t-tiny" style={{ marginTop: 'auto', fontWeight: 600, color: 'var(--color-navy-primary)' }}>
              ✓ Voice explanation reviews • Structured concept glossaries • Clear reasoning
            </div>
          </div>

          {/* Pillar 4: Confidence & Growth Mindset */}
          <div className="b card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'var(--color-success-bg)', 
              color: 'var(--color-success)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Flame size={24} />
            </div>
            <div className="h3" style={{ fontSize: '18px', color: 'var(--color-success)' }}>
              4. Unshakeable Confidence
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Children thrive when fear of failure is removed. In Vayentra Gurukula, mistakes are not penalized—they are celebrated as diagnostic stepping stones in the student's personal <strong>Mistake Notebook</strong>.
            </p>
            <div className="t-tiny" style={{ marginTop: 'auto', fontWeight: 600, color: 'var(--color-success)' }}>
              ✓ Zero public comparison • Private mastery stars • Safe failure recovery
            </div>
          </div>

          {/* Pillar 5: Individual Academic Progress */}
          <div className="b card-interactive" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '12px', 
              background: 'var(--color-navy-light)', 
              color: 'var(--color-navy-primary)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <TrendingUp size={24} />
            </div>
            <div className="h3" style={{ fontSize: '18px', color: 'var(--color-navy-primary)' }}>
              5. Individual Academic Progress
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Every learner progresses on their own trajectory. Diagnostic mapping flags prerequisite gaps from earlier grades before starting new chapters, while <strong>Leitner Spaced Repetition</strong> ensures permanent memory retention.
            </p>
            <div className="t-tiny" style={{ marginTop: 'auto', fontWeight: 600, color: 'var(--color-navy-primary)' }}>
              ✓ 5-Box Leitner flashcards • Prerequisite bridge episodes • Diagnostic path
            </div>
          </div>

        </div>
      </section>

      {/* 4. DEDICATED ABACUS OFFERING SHOWCASE */}
      <section className="b" style={{
        background: 'linear-gradient(135deg, var(--color-navy-dark) 0%, #152248 100%)',
        color: '#ffffff',
        padding: '36px 32px',
        borderRadius: '20px',
        border: '2px solid var(--color-gold-border)',
        boxShadow: 'var(--shadow-lg)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '32px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="chip" style={{ background: 'var(--color-gold-bright)', color: '#000000', fontWeight: 700, border: 'none' }}>
              SPECIALIZED ADDITIONAL OFFERING
            </span>
            <span style={{ fontSize: '12px', color: 'var(--color-gold-border)' }}>Classes 1 to 5 Foundation</span>
          </div>

          <h2 style={{ fontSize: '30px', color: '#ffffff', lineHeight: 1.25 }}>
            Whole-Brain Abacus & Mental Arithmetic Training
          </h2>

          <p style={{ fontSize: '15px', lineHeight: 1.6, color: '#d0daf0' }}>
            As an additional cognitive accelerator, Vayentra Gurukula offers structured <strong>Abacus Mental Arithmetic</strong>. 
            By physically manipulating beads and transitioning to internal mental bead visualization, children unlock remarkable concentration, photographic memory, and arithmetic speed.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-gold-bright)', fontSize: '14px' }}>Tactile Visualization</div>
              <div style={{ fontSize: '12px', color: '#c3d0ea', marginTop: '3px' }}>Translates numbers into spatial bead formations</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-gold-bright)', fontSize: '14px' }}>Dual-Brain Synergy</div>
              <div style={{ fontSize: '12px', color: '#c3d0ea', marginTop: '3px' }}>Simultaneously activates visual and logical brain hemispheres</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-gold-bright)', fontSize: '14px' }}>Laser Concentration</div>
              <div style={{ fontSize: '12px', color: '#c3d0ea', marginTop: '3px' }}>Sharpens listening stamina, reflexes and visual memory</div>
            </div>
            <div style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
              <div style={{ fontWeight: 700, color: 'var(--color-gold-bright)', fontSize: '14px' }}>Speed Without Stress</div>
              <div style={{ fontSize: '12px', color: '#c3d0ea', marginTop: '3px' }}>Calculations performed mentally faster than pencil-paper</div>
            </div>
          </div>
        </div>

        {/* Interactive Abacus Widget Preview */}
        <div style={{
          background: 'rgba(10, 20, 50, 0.7)',
          padding: '24px',
          borderRadius: '16px',
          border: '1.5px solid var(--color-gold-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-gold-bright)' }}>
              Interactive Soroban Abacus Frame
            </span>
            <span className="chip" style={{ background: 'rgba(200, 138, 30, 0.2)', color: 'var(--color-gold-bright)', border: '1px solid var(--color-gold-border)' }}>
              Tap Beads to Count
            </span>
          </div>

          {/* Abacus Frame Graphic */}
          <div style={{
            width: '100%',
            maxWidth: '380px',
            background: '#8b4513',
            padding: '12px',
            borderRadius: '10px',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
            border: '3px solid #5a2a0a'
          }}>
            {/* The Beam Divider */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-around',
              padding: '6px 0',
              background: '#2b1d0c',
              borderRadius: '4px',
              borderBottom: '2px solid #e5a910'
            }}>
              {abacusBeads.map((val, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                  {/* Upper Deck (Value 5 Bead) */}
                  <div 
                    onClick={() => handleAbacusTap(idx)}
                    style={{
                      width: '28px',
                      height: '18px',
                      borderRadius: '50%',
                      background: val >= 5 ? 'radial-gradient(circle, #fde047 0%, #ca8a04 100%)' : 'radial-gradient(circle, #d97706 0%, #78350f 100%)',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                      cursor: 'pointer',
                      transform: val >= 5 ? 'translateY(8px)' : 'translateY(0)',
                      transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                    title="Upper Bead (Value 5)"
                  />
                  <div style={{ width: '4px', height: '12px', background: '#cbd5e1' }} />
                </div>
              ))}
            </div>

            {/* Lower Deck (Earth Beads) */}
            <div style={{ display: 'flex', justifyContent: 'space-around', padding: '12px 0', minHeight: '80px', background: '#1c1308' }}>
              {abacusBeads.map((val, idx) => {
                const lowerCount = val >= 5 ? val - 5 : val;
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleAbacusTap(idx)}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', cursor: 'pointer' }}
                  >
                    {[1, 2, 3, 4].map(bIdx => (
                      <div
                        key={bIdx}
                        style={{
                          width: '28px',
                          height: '14px',
                          borderRadius: '50%',
                          background: bIdx <= lowerCount 
                            ? 'radial-gradient(circle, #facc15 0%, #b45309 100%)' 
                            : 'radial-gradient(circle, #92400e 0%, #451a03 100%)',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                          transform: bIdx <= lowerCount ? 'translateY(-6px)' : 'translateY(0)',
                          transition: 'all 0.15s ease'
                        }}
                      />
                    ))}
                    <span style={{ fontSize: '11px', color: 'var(--color-gold-bright)', marginTop: '6px', fontWeight: 700 }}>
                      Col {idx + 1}: {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#cbd5e1', textAlign: 'center' }}>
            Value Represented: <strong style={{ color: 'var(--color-gold-bright)', fontSize: '16px' }}>{abacusBeads.join('')}</strong> • Abacus enhances tactile visualization for primary kids
          </div>
        </div>
      </section>

      {/* 5. INTERACTIVE CURRICULUM EXPLORER (CBSE & Karnataka State Board) */}
      <section id="vg-curriculum-explorer" className="b" style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '32px', scrollMarginTop: '110px' }}>
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
          <div className="ribbon-banner">
            BOARD-ALIGNED SYLLABUS DISCOVERY
          </div>
          <h2 style={{ fontSize: '28px', marginTop: '10px', color: 'var(--color-navy-primary)' }}>
            Explore Curriculum Topics for Classes 1 to 10
          </h2>
          <p className="t-muted" style={{ fontSize: '15px', marginTop: '6px' }}>
            Check curriculum coverage, pedagogical breakdown, and try authentic lesson checkpoints for your child's board and grade.
          </p>
        </div>

        {/* Board Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={selectedBoard === 'CBSE' ? 'btn btn-teal' : 'ghost'}
            onClick={() => setSelectedBoard('CBSE')}
            style={{ minHeight: '44px', padding: '10px 24px', fontSize: '15px', fontWeight: 700 }}
          >
            Central Board (CBSE)
          </button>
          <button
            type="button"
            className={selectedBoard === 'STATE' ? 'btn btn-teal' : 'ghost'}
            onClick={() => setSelectedBoard('STATE')}
            style={{ minHeight: '44px', padding: '10px 24px', fontSize: '15px', fontWeight: 700 }}
          >
            Karnataka State Board (KSEAB / SSLC)
          </button>
        </div>

        {/* Grade Chips (Classes 1 to 10) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <div className="t-tiny" style={{ fontWeight: 700, letterSpacing: '0.05em' }}>SELECT GRADE:</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', maxWidth: '960px' }}>
            {Array.from({ length: 10 }, (_, i) => i + 1).map(g => {
              const isSelected = selectedClass === g;
              const isPrimary = g <= 4;
              return (
                <button
                  key={g}
                  type="button"
                  className={isSelected ? 'btn btn-gold' : 'ghost'}
                  onClick={() => setSelectedClass(g)}
                  style={{
                    minHeight: '42px',
                    minWidth: '78px',
                    padding: '8px 14px',
                    fontWeight: isSelected ? 700 : 500,
                    borderRadius: '10px'
                  }}
                >
                  Class {g} {isPrimary && '★'}
                </button>
              );
            })}
          </div>
          <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>
            ★ Classes 1–4 feature our Early Learner Audio Story Mode with picture-based questions and no test anxiety.
          </div>
        </div>

        {/* Curriculum Details Display Card */}
        <div style={{
          background: 'var(--color-paper-subtle)',
          borderRadius: '14px',
          padding: '24px',
          border: '1.5px solid var(--color-border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="h3" style={{ fontSize: '20px', color: 'var(--color-navy-primary)' }}>
                {selectedBoard === 'STATE' ? 'Karnataka State Board' : 'CBSE'} • Class {selectedClass} Curriculum Framework
              </div>
              <div className="t-muted">
                Sample topic previews. Confirm current textbook coverage with the academic team.
              </div>
            </div>

            <span className="chip chip-navy" style={{ padding: '6px 14px', fontSize: '13px' }}>
              Class & Board Topic Preview
            </span>
          </div>

          {/* Subject Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            {/* Mathematics */}
            <div className="b" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="h3" style={{ color: 'var(--color-navy-primary)' }}>📐 Mathematics</span>
                <span className="chip chip-gold">Core Concept</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{currentPreview.math}</div>
              <div className="t-muted" style={{ fontSize: '13px' }}>
                Practical inquiry, mental calculation shortcuts, step-by-step logic and mistake analysis.
              </div>
              <button 
                type="button" 
                className="btn btn-teal" 
                style={{ marginTop: 'auto', minHeight: '36px', fontSize: '13px' }}
                onClick={() => { setRole('student'); setShowPublicPortal(false); }}
              >
                Launch Class {selectedClass} Demo Lesson <ArrowRight size={14} />
              </button>
            </div>

            {/* Science / EVS */}
            <div className="b" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="h3" style={{ color: 'var(--color-navy-primary)' }}>🔬 Science & EVS</span>
                <span className="chip chip-teal">Observation</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{currentPreview.science}</div>
              <div className="t-muted" style={{ fontSize: '13px' }}>
                Physical experiments, biological diagrams, environmental awareness and curiosity-driven episodes.
              </div>
              <button 
                type="button" 
                className="ghost" 
                style={{ marginTop: 'auto', minHeight: '36px', fontSize: '13px' }}
                onClick={() => { setRole('student'); setShowPublicPortal(false); }}
              >
                View Syllabus Breakdown
              </button>
            </div>

            {/* Language & Communication */}
            <div className="b" style={{ background: '#ffffff', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="h3" style={{ color: 'var(--color-navy-primary)' }}>📚 Language & Expression</span>
                <span className="chip">Foundational</span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '15px' }}>{currentPreview.language}</div>
              <div className="t-muted" style={{ fontSize: '13px' }}>
                Vocabulary building, reading fluency, grammar rules and structured analytical expression.
              </div>
              <button 
                type="button" 
                className="ghost" 
                style={{ marginTop: 'auto', minHeight: '36px', fontSize: '13px' }}
                onClick={() => { setRole('student'); setShowPublicPortal(false); }}
              >
                Listen to Audio Story Preview
              </button>
            </div>

          </div>

          {/* Key Pedagogical Highlights */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
            <span className="t-tiny" style={{ fontWeight: 700 }}>Class {selectedClass} Highlights:</span>
            {currentPreview.highlights.map((h, i) => (
              <span key={i} className="chip chip-gold" style={{ fontSize: '11px' }}>
                ✦ {h}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 6. HOW GURUKULA LEARNING WORKS (The 4-Step Cycle) */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <div className="ribbon-banner">THE GURUKULA METHOD</div>
          <h2 style={{ fontSize: '28px', marginTop: '10px', color: 'var(--color-navy-primary)' }}>
            The 4-Step Curiosity Learning Cycle
          </h2>
          <p className="t-muted" style={{ fontSize: '15px', marginTop: '6px' }}>
            Every lesson follows a battle-tested pedagogical sequence designed for sustained focus and maximum retention.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
          
          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px', position: 'relative' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'var(--color-navy-primary)', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800
            }}>
              1
            </div>
            <div className="h3">2-Min Curiosity Hook</div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              We start with a relatable puzzle or everyday phenomenon rather than dry theory. Captures the child's natural curiosity immediately.
            </p>
          </div>

          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'var(--color-navy-primary)', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800
            }}>
              2
            </div>
            <div className="h3">4-Min Concept Discovery</div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Physical principle demonstrated with concrete examples and real-life Karnataka and Indian context applications.
            </p>
          </div>

          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '4px solid var(--color-gold-bright)' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'var(--color-gold-primary)', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800
            }}>
              3
            </div>
            <div className="h3">Compulsory Checkpoint</div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              3 to 5 conceptual questions. Students must achieve $\ge 60\%$ to unlock the next episode. Unlocks genuine mastery, not superficial completion.
            </p>
          </div>

          <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ 
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: 'var(--color-success)', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800
            }}>
              4
            </div>
            <div className="h3">Mistake Notebook & Review</div>
            <p style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-text-muted)' }}>
              Incorrect answers are automatically preserved with step hints. Reviewed via spaced repetition flashcards before exams.
            </p>
          </div>

        </div>
      </section>

      {/* 7. PARENT EMPOWERMENT & CHILD PRIVACY (DPDP Act Compliance) */}
      <section className="b" style={{
        background: 'linear-gradient(135deg, var(--color-paper-card) 0%, var(--color-paper-subtle) 100%)',
        padding: '36px 32px',
        borderRadius: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="ribbon-banner" style={{ alignSelf: 'flex-start' }}>
            PARENT PARTNERSHIP & ETHICS
          </div>
          <h2 style={{ fontSize: '26px', color: 'var(--color-navy-primary)' }}>
            A Digital Learning Environment Built on Respect for Childhood
          </h2>
          <p style={{ fontSize: '15px', lineHeight: 1.6, color: 'var(--color-ink)' }}>
            Vayentra Gurukula was architected from day one to protect children's mental well-being and privacy. We reject addictive doom-scrolling, comparative anxiety, and invasive surveillance.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              <span><strong>Explicit Guardian Consent:</strong> No child data recorded without parental verification.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              <span><strong>Shared-Device Mode:</strong> Child profile cannot exit to settings or billing without parent PIN.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              <span><strong>Screen Time & Bedtime Limits:</strong> Daily study quotas and night locks respect healthy sleep.</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
              <CheckCircle2 size={18} color="var(--color-success)" />
              <span><strong>WhatsApp Weekly Coach Cards:</strong> Parents receive constructive insight summaries, not numbers.</span>
            </div>
          </div>
        </div>

        {/* Parent Portal Preview Box */}
        <div style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '14px',
          border: '1.5px solid var(--color-border-subtle)',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="h3" style={{ color: 'var(--color-navy-primary)' }}>Parent Family Dashboard</div>
            <span className="chip chip-gold">Active Guardian View</span>
          </div>

          <div style={{ padding: '12px', background: 'var(--color-paper-subtle)', borderRadius: '8px', fontSize: '13px' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-ink)' }}>Aarav Varma (Class 7 CBSE)</div>
            <div className="t-muted">Weekly Progress: 4 Episodes Completed • 2 Mistake Notebook items resolved</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '10px', background: 'var(--color-navy-light)', borderRadius: '8px' }}>
              <div className="t-tiny" style={{ color: 'var(--color-navy-primary)', fontWeight: 700 }}>STUDY TIME TODAY</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-navy-primary)' }}>22 / 45 Mins</div>
            </div>
            <div style={{ padding: '10px', background: 'var(--color-success-bg)', borderRadius: '8px' }}>
              <div className="t-tiny" style={{ color: 'var(--color-success)', fontWeight: 700 }}>BEDTIME LOCK</div>
              <div style={{ fontWeight: 800, fontSize: '16px', color: 'var(--color-success)' }}>9:30 PM IST</div>
            </div>
          </div>

          <button 
            type="button" 
            className="btn btn-teal"
            onClick={() => { setRole('parent'); setShowPublicPortal(false); }}
            style={{ marginTop: '6px' }}
          >
            Access Parent Family Portal <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* 8. SCHOLARSHIP CTA BANNER */}
      <section style={{
        background: 'linear-gradient(135deg, var(--color-navy-primary) 0%, var(--color-navy-dark) 100%)',
        color: '#ffffff',
        padding: '36px',
        borderRadius: '16px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        border: '2px solid var(--color-gold-border)',
        boxShadow: 'var(--shadow-md)'
      }}>
        <span className="chip chip-gold" style={{ fontSize: '13px', fontWeight: 700 }}>
          ✦ MERIT SCHOLARSHIP ASSESSMENT 2026–2027
        </span>
        <h2 style={{ fontSize: '28px', maxWidth: '700px', color: '#ffffff' }}>
          Evaluate Your Child's Conceptual Aptitude in 5 Minutes
        </h2>
        <p style={{ maxWidth: '600px', fontSize: '15px', color: '#c5d5f5' }}>
          Take our quick, diagnostic scholarship assessment. Receive an immediate conceptual breakdown and qualify for up to 50% tuition scholarship vouchers.
        </p>
        <button 
          type="button" 
          className="btn btn-gold btn-large"
          onClick={() => setIsScholarshipOpen(true)}
        >
          <Award size={20} /> Begin Free Scholarship Assessment
        </button>
      </section>

      {/* 9. ACADEMIC FOOTER */}
      <footer style={{
        borderTop: '1.5px solid var(--color-border-subtle)',
        paddingTop: '32px',
        paddingBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Logo variant="header" height={40} />
            <p className="t-muted" style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Vayentra Gurukula is dedicated to concept-based academic coaching for Classes 1–10 across CBSE and Karnataka State Board, fostering practical understanding, mental math agility, and student confidence.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <strong style={{ color: 'var(--color-navy-primary)' }}>Academic Curricula</strong>
            <span style={{ color: 'var(--color-text-muted)' }}>• CBSE Classes 1 to 10</span>
            <span style={{ color: 'var(--color-text-muted)' }}>• Karnataka State Board (KSEAB)</span>
            <span style={{ color: 'var(--color-text-muted)' }}>• English Medium Instruction</span>
            <span style={{ color: 'var(--color-text-muted)' }}>• Foundational Abacus Training</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <strong style={{ color: 'var(--color-navy-primary)' }}>Gurukula Portals</strong>
            <span style={{ cursor: 'pointer', color: 'var(--color-navy-primary)' }} onClick={() => { setRole('student'); setShowPublicPortal(false); }}>
              → Student Learn Hub
            </span>
            <span style={{ cursor: 'pointer', color: 'var(--color-navy-primary)' }} onClick={() => { setRole('parent'); setShowPublicPortal(false); }}>
              → Parent Family Portal
            </span>
            <span style={{ cursor: 'pointer', color: 'var(--color-navy-primary)' }} onClick={() => { setRole('teacher'); setShowPublicPortal(false); }}>
              → Teacher Studio
            </span>
            <span style={{ cursor: 'pointer', color: 'var(--color-navy-primary)' }} onClick={() => { setRole('tech_learner'); setShowPublicPortal(false); }}>
              → Technical Academy
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <strong style={{ color: 'var(--color-navy-primary)' }}>Child Protection & Ethics</strong>
            <span style={{ color: 'var(--color-text-muted)' }}>• Child privacy and data-protection focus</span>
            <span style={{ color: 'var(--color-text-muted)' }}>• Teacher-guided academic review</span>
            <span style={{ color: 'var(--color-text-muted)' }}>• Tele-MANAS (14416) Safeguarding</span>
            <span style={{ color: 'var(--color-text-muted)' }}>• Zero Third-Party Advertising</span>
          </div>

        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          paddingTop: '20px',
          borderTop: '1px solid var(--color-border-subtle)',
          fontSize: '12px',
          color: 'var(--color-text-subtle)'
        }}>
          <div>
            © 2026 Vayentra Gurukula Unified Learning Platform. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy Notice</span>
            <span>Terms of Service</span>
            <span>Grievance Officer</span>
          </div>
        </div>
      </footer>

      {/* Scholarship Assessment Modal */}
      {isScholarshipOpen && (
        <ScholarshipModal 
          isOpen={isScholarshipOpen} 
          onClose={() => setIsScholarshipOpen(false)} 
        />
      )}

    </div>
  );
};

export default PublicView;
