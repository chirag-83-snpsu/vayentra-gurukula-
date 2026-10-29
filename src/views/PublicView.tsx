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
  Users
} from 'lucide-react';

import { Logo } from '../components/Logo';

export const PublicView: React.FC = () => {
  const { setRole } = useApp();
  const [selectedBoard, setSelectedBoard] = useState<'CBSE' | 'ICSE' | 'STATE'>('CBSE');
  const [selectedClass, setSelectedClass] = useState<number>(7);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Hero Section */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, var(--color-navy-light) 0%, #ffffff 50%, var(--color-gold-light) 100%)',
        padding: '48px 32px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-md)',
        border: '1.5px solid var(--color-gold-border)'
      }}>
        {/* Official Vayentra Gurukula Logo Hero Banner */}
        <Logo variant="hero" height={100} />

        <div className="ribbon-banner">
          CONCEPT-BASED ACADEMIC COACHING
        </div>

        <span className="chip chip-gold" style={{ padding: '6px 14px', fontSize: '13px' }}>
          ✦ Classes 1 to 10 • CBSE, ICSE & Karnataka State Board
        </span>
        <div className="h1" style={{ fontSize: '34px', maxWidth: '780px', lineHeight: 1.25, color: 'var(--color-navy-primary)' }}>
          Experience Gurukula-Style Concept Mastery with Child-Safe AI Tutoring
        </div>
        <div className="t-muted" style={{ maxWidth: '640px', fontSize: '16px' }}>
          Every lesson is an 8-minute curiosity episode crafted by certified educators. Zero public shaming leaderboards, 100% DPDP guardian consent compliance.
        </div>

        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '8px' }}>
          <button type="button" className="btn btn-teal btn-large" onClick={() => setRole('student')}>
            Try Free Lesson Demo (No Sign-In Required) <ArrowRight size={20} />
          </button>
          <button type="button" className="ghost btn-large" onClick={() => setRole('parent')}>
            <Users size={20} /> Parent Family Portal
          </button>
        </div>
      </div>

      {/* Board & Grade Live Coverage Matrix (Wireframe 19 & 89 / Diagram 30) */}
      <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="h2">Select Board & Grade to Explore Curriculum</div>
          <div className="t-muted">Check live verified chapter coverage and try interactive sample episodes</div>
        </div>

        {/* Board Selector */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
          {(['CBSE', 'ICSE', 'STATE'] as const).map(b => (
            <button
              key={b}
              type="button"
              className={selectedBoard === b ? 'btn btn-teal' : 'ghost'}
              onClick={() => setSelectedBoard(b)}
            >
              {b === 'STATE' ? 'Karnataka State Board' : b}
            </button>
          ))}
        </div>

        {/* Grade Chips (Classes 1 to 10) */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map(g => (
            <button
              key={g}
              type="button"
              className={selectedClass === g ? 'btn' : 'ghost'}
              onClick={() => setSelectedClass(g)}
              style={{ minHeight: '36px', padding: '6px 14px' }}
            >
              Class {g}
            </button>
          ))}
        </div>

        {/* Selected Grade Syllabus Overview */}
        <div style={{
          padding: '24px',
          borderRadius: '10px',
          background: 'var(--color-paper-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <div className="b">
            <div className="h3">📐 Mathematics</div>
            <div className="t-muted" style={{ marginTop: '4px' }}>14 Chapters • Verified by CBSE State Council</div>
            <button type="button" className="btn btn-teal" style={{ minHeight: '34px', fontSize: '12px', marginTop: '10px' }} onClick={() => setRole('student')}>
              Launch Class {selectedClass} Lesson Demo
            </button>
          </div>
          <div className="b">
            <div className="h3">🔬 Science</div>
            <div className="t-muted" style={{ marginTop: '4px' }}>16 Chapters • Biology, Chemistry & Physics</div>
            <button type="button" className="ghost" style={{ minHeight: '34px', fontSize: '12px', marginTop: '10px' }}>
              View Syllabus Map
            </button>
          </div>
          <div className="b">
            <div className="h3">📚 Kannada / English</div>
            <div className="t-muted" style={{ marginTop: '4px' }}>Bilingual Karnataka Context Stories</div>
            <button type="button" className="ghost" style={{ minHeight: '34px', fontSize: '12px', marginTop: '10px' }}>
              Listen to Audio Preview
            </button>
          </div>
        </div>
      </div>

      {/* Trust & Safety Highlights (Diagram 4, 15, 27) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        <div className="b">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-teal-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <ShieldCheck size={22} color="var(--color-teal-primary)" />
          </div>
          <div className="h3">DPDP Guardian Consent</div>
          <div className="t-muted" style={{ marginTop: '6px' }}>
            Zero minor tracking without explicit parent consent. Zero third-party ads, zero tracking cookies.
          </div>
        </div>

        <div className="b">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-saffron-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Sparkles size={22} color="var(--color-saffron)" />
          </div>
          <div className="h3">Safe AI Doubt Tutor</div>
          <div className="t-muted" style={{ marginTop: '6px' }}>
            Grounded strictly in approved chapter notes. Refuses test cheating and escalates distress to human educators.
          </div>
        </div>

        <div className="b">
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--color-success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
            <Award size={22} color="var(--color-success)" />
          </div>
          <div className="h3">Effort-Based Rewards</div>
          <div className="t-muted" style={{ marginTop: '6px' }}>
            Private mastery tracking. Children earn stars and badges without anxiety-inducing public ranking boards.
          </div>
        </div>
      </div>

    </div>
  );
};
