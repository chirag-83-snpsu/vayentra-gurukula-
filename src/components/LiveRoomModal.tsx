import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  X, 
  Video, 
  Mic, 
  MicOff, 
  Hand, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  BarChart2,
  Sparkles
} from 'lucide-react';

interface LiveRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveRoomModal: React.FC<LiveRoomModalProps> = ({ isOpen, onClose }) => {
  const { activeChild } = useApp();
  const [handRaised, setHandRaised] = useState(false);
  const [handCount, setHandCount] = useState(3);
  const [pollAnswered, setPollAnswered] = useState<number | null>(null);
  const [pollSubmitted, setPollSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleToggleHand = () => {
    if (handRaised) {
      setHandRaised(false);
      setHandCount(prev => Math.max(0, prev - 1));
    } else {
      setHandRaised(true);
      setHandCount(prev => prev + 1);
    }
  };

  const handleVotePoll = (idx: number) => {
    if (pollSubmitted) return;
    setPollAnswered(idx);
    setPollSubmitted(true);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.92)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="b" style={{
        background: '#0f172a',
        color: '#f8fafc',
        width: '100%',
        maxWidth: '940px',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '16px',
        padding: '24px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        border: '1.5px solid #334155'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="chip chip-error" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} className="pulse" /> LIVE NOW
            </span>
            <div className="h2" style={{ fontSize: '18px', color: '#ffffff' }}>
              Class 7 Mathematics: Integer Word Problems & Real-World Velocity
            </div>
          </div>
          <button
            type="button"
            className="ghost"
            onClick={onClose}
            style={{ color: '#94a3b8', borderColor: '#334155', padding: '4px 8px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Stage Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          
          {/* Main Video Stream Container */}
          <div style={{
            background: '#1e293b',
            borderRadius: '12px',
            aspectRatio: '16/9',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px',
            border: '1px solid #334155'
          }}>
            {/* Educator Avatar & Label */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{
                background: 'rgba(0,0,0,0.6)',
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                Acharya Vidyasagar Bhat (Educator)
              </span>
              <span style={{ fontSize: '12px', color: '#cbd5e1' }}>HD 1080p • 60 FPS</span>
            </div>

            {/* Blackboard Canvas Graphic */}
            <div style={{
              margin: 'auto 0',
              textAlign: 'center',
              fontFamily: 'serif',
              fontSize: '20px',
              color: '#fef08a',
              textShadow: '0 0 10px rgba(254, 240, 138, 0.4)'
            }}>
              <div>[ Gurukula Blackboard ]</div>
              <div style={{ fontSize: '26px', marginTop: '6px' }}>
                Distance = Rate × Time &nbsp;⇒&nbsp; (-4 m/min) × 6 min = -24 m
              </div>
            </div>

            {/* Student Safety Invariant Badge */}
            <div style={{
              background: 'rgba(0,0,0,0.6)',
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '12px'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#93c5fd' }}>
                <ShieldCheck size={14} /> Child-Safe Room: Minor mic & webcam auto-muted
              </span>
              <span>18 Enrolled Peers Attending</span>
            </div>
          </div>

          {/* Right Rail: Live In-Class Poll & Hand Raise */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Live Poll Widget */}
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '12px', fontWeight: 700 }}>
                <BarChart2 size={16} /> LIVE TEACHER CHECKPOINT POLL
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px' }}>
                What is the elevation after descending 5 meters 4 times from sea level?
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {['+20 meters', '-20 meters', '-9 meters', '+1 meter'].map((opt, idx) => {
                  const isSelected = pollAnswered === idx;
                  const isCorrect = idx === 1;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleVotePoll(idx)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        cursor: pollSubmitted ? 'default' : 'pointer',
                        fontSize: '13px',
                        border: '1px solid #475569',
                        background: isSelected ? (isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)') : '#0f172a',
                        borderColor: isSelected ? (isCorrect ? '#22c55e' : '#ef4444') : '#475569',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{opt}</span>
                      {pollSubmitted && isSelected && (
                        <span>{isCorrect ? '✓ Correct' : '✕ Try Again'}</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {pollSubmitted && (
                <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '8px' }}>
                  ✓ Your response has been logged anonymously to Acharya's dashboard!
                </div>
              )}
            </div>

            {/* Hand Raising & Teacher Interaction Box */}
            <div style={{
              background: '#1e293b',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #334155',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Need clarification from Acharya?</span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>{handCount} hands raised</span>
              </div>

              <button
                type="button"
                onClick={handleToggleHand}
                style={{
                  minHeight: '42px',
                  borderRadius: '8px',
                  border: handRaised ? '2px solid #f59e0b' : '1px solid #475569',
                  background: handRaised ? 'rgba(245, 158, 11, 0.2)' : '#0f172a',
                  color: handRaised ? '#fbbf24' : '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                <Hand size={18} fill={handRaised ? '#fbbf24' : 'none'} />
                {handRaised ? 'Hand Raised (Acharya will address you)' : 'Raise Hand to Ask Question'}
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
