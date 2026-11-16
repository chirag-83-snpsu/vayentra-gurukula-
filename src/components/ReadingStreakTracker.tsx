import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Trophy, X, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getDailyProgress, subscribeToDailyProgress, resetDailyProgressForTesting, DailyProgress } from '../utils/streakManager';

export const ReadingStreakTracker: React.FC = () => {
  const [progress, setProgress] = useState<DailyProgress>(getDailyProgress());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Initial sync
    setProgress(getDailyProgress());

    // Subscribe to real-time events
    const unsubscribe = subscribeToDailyProgress((updated) => {
      setProgress(updated);
      if (updated.count === 5) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.85, x: 0.85 }
          });
        } catch (e) {}
      }
    });

    return unsubscribe;
  }, []);

  const percentage = Math.round((progress.count / progress.max) * 100);

  return (
    <div className="vg-streak-bar" aria-label="Daily Reading Progress Tracker">
      {isExpanded && (
        <div className="vg-streak-card" role="dialog" aria-modal="false" aria-labelledby="streak-title">
          <div className="vg-streak-header">
            <div className="vg-streak-title" id="streak-title">
              <Trophy size={18} color="#f59e0b" /> Today's Learning Goal
            </div>
            <button
              type="button"
              className="vg-streak-close"
              onClick={() => setIsExpanded(false)}
              aria-label="Close progress card"
            >
              <X size={16} />
            </button>
          </div>

          <div className="vg-streak-desc">
            Understand 5 bite-sized concepts daily to build long-term retention across CBSE and Karnataka State Board subjects.
          </div>

          {progress.count >= 5 ? (
            <div className="vg-streak-milestone">
              <CheckCircle2 size={20} color="#10b981" />
              <div>
                <div>Daily Goal Complete! (5/5)</div>
                <small style={{ fontWeight: 500, opacity: 0.9 }}>
                  Brilliant work! You're sharpening your thinking every single day.
                </small>
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                <span>Concepts Understood</span>
                <span className="font-math">{progress.count} / {progress.max}</span>
              </div>
              <div className="vg-streak-meter" style={{ width: '100%', height: '10px' }}>
                <div className="vg-streak-fill" style={{ width: `${percentage}%` }} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={15} color="#f59e0b" /> {progress.streak} Day Streak
            </span>
            <button
              type="button"
              onClick={() => setProgress(resetDailyProgressForTesting())}
              style={{ background: 'transparent', border: 0, color: '#94a3b8', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              title="Reset progress to try again today"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>
        </div>
      )}

      {/* Persistent Floating Pill */}
      <button
        type="button"
        className="vg-streak-pill"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        title="View Today's Reading Progress & Streak"
      >
        <span className="vg-streak-flame">
          <Flame size={18} fill="#ff9800" /> {progress.streak}d
        </span>
        <span className="vg-streak-progress-wrap">
          <span>Concepts:</span>
          <span className="vg-streak-count">{progress.count}/{progress.max}</span>
          <span className="vg-streak-meter">
            <span className="vg-streak-fill" style={{ width: `${percentage}%` }} />
          </span>
        </span>
        {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>
    </div>
  );
};
