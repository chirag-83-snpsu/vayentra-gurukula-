import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Type, 
  Eye, 
  Wifi, 
  WifiOff, 
  Lock, 
  Unlock, 
  Globe, 
  Users, 
  BookOpen, 
  GraduationCap, 
  ClipboardCheck, 
  SlidersHorizontal,
  KeyRound
} from 'lucide-react';

import { Logo } from './Logo';
import { AuthModal } from './AuthModal';

export const Navbar: React.FC = () => {
  const {
    role,
    setRole,
    parent,
    activeChild,
    setActiveChildId,
    isChildModeLocked,
    unlockChildModeWithPin,
    lockIntoChildMode,
    language,
    setLanguage,
    theme,
    toggleTheme,
    isDyslexicFont,
    toggleDyslexicFont,
    isLargeText,
    toggleLargeText,
    isHighContrast,
    toggleHighContrast,
    isOfflineMode,
    toggleOfflineMode
  } = useApp();

  const [showPinModal, setShowPinModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const rolesList: { id: UserRole; label: string; icon: any }[] = [
    { id: 'student', label: 'Student Learn Hub', icon: BookOpen },
    { id: 'parent', label: 'Parent Family Portal', icon: Users },
    { id: 'teacher', label: 'Teacher Studio', icon: GraduationCap },
    { id: 'reviewer', label: 'Editorial Review Desk', icon: ClipboardCheck },
    { id: 'admin', label: 'Admin & Finance Console', icon: SlidersHorizontal },
    { id: 'safeguarding', label: 'Safeguarding Vault', icon: ShieldCheck },
    { id: 'tech_learner', label: 'Technical Academy', icon: Sparkles }
  ];

  const handleUnlockPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (unlockChildModeWithPin(pinInput)) {
      setShowPinModal(false);
      setPinInput('');
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  return (
    <header className="app-header" style={{
      padding: '10px 20px',
      background: 'var(--color-paper-card)',
      borderBottom: '1.5px solid var(--color-border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '12px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand & Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Logo variant="header" height={44} />

        {/* Portal Scope Pill */}
        <div className="chip chip-navy" style={{ fontWeight: 700 }}>
          {rolesList.find(r => r.id === role)?.label}
        </div>

        {/* Offline indicator */}
        {isOfflineMode && (
          <span className="chip chip-saffron">
            <WifiOff size={12} /> Offline Sync Queue (2)
          </span>
        )}
      </div>

      {/* Quick Nav Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
        
        {/* Child Switcher (Visible in Student/Parent modes) */}
        {!isChildModeLocked && (role === 'student' || role === 'parent') && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="t-tiny" style={{ fontWeight: 600 }}>Child:</span>
            <select
              value={activeChild.id}
              onChange={(e) => setActiveChildId(e.target.value)}
              style={{
                padding: '6px 12px',
                minHeight: '36px',
                fontSize: '13px',
                borderRadius: '8px',
                fontWeight: 600,
                background: 'var(--color-paper-subtle)'
              }}
            >
              {parent.children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.avatar} {child.name} (Class {child.grade} {child.board})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Role Portal Dropdown */}
        {!isChildModeLocked ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="t-tiny" style={{ fontWeight: 600 }}>Portal:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{
                padding: '6px 12px',
                minHeight: '36px',
                fontSize: '13px',
                borderRadius: '8px',
                fontWeight: 600,
                background: 'var(--color-paper)'
              }}
            >
              {rolesList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <span className="chip chip-saffron">
            <Lock size={12} /> Child Mode Locked (PIN Required to exit)
          </span>
        )}

        {/* Shared Device PIN Mode Toggle */}
        {!isChildModeLocked ? (
          <button
            type="button"
            className="ghost"
            onClick={lockIntoChildMode}
            title="Lock device into Child Mode (Disables settings & billing)"
            style={{ padding: '6px 10px', minHeight: '36px', fontSize: '12px' }}
          >
            <Lock size={14} /> Lock Child PIN
          </button>
        ) : (
          <button
            type="button"
            className="btn btn-teal"
            onClick={() => setShowPinModal(true)}
            style={{ padding: '6px 12px', minHeight: '36px', fontSize: '12px' }}
          >
            <Unlock size={14} /> Exit Child Mode
          </button>
        )}

        {/* Language Toggle (EN / ಕನ್ನಡ) */}
        <button
          type="button"
          className="ghost"
          onClick={() => setLanguage(language === 'English' ? 'Kannada' : 'English')}
          title="Toggle Language"
          style={{ padding: '6px 10px', minHeight: '36px', fontSize: '13px', fontWeight: 600 }}
        >
          <Globe size={14} /> {language === 'English' ? 'ಕನ್ನಡ' : 'English'}
        </button>

        {/* Theme Toggle */}
        <button
          type="button"
          className="ghost"
          onClick={toggleTheme}
          title="Toggle Dark/Light Mode"
          style={{ padding: '6px 10px', minHeight: '36px' }}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Dyslexia Mode Toggle */}
        <button
          type="button"
          className={`ghost ${isDyslexicFont ? 'btn-teal' : ''}`}
          onClick={toggleDyslexicFont}
          title="Toggle Dyslexia-Friendly Font (OpenDyslexic)"
          style={{ padding: '6px 10px', minHeight: '36px', fontSize: '12px' }}
        >
          <Type size={14} /> Dyslexia
        </button>

        {/* High Contrast Toggle */}
        <button
          type="button"
          className={`ghost ${isHighContrast ? 'btn-teal' : ''}`}
          onClick={toggleHighContrast}
          title="Toggle High-Contrast Mode"
          style={{ padding: '6px 10px', minHeight: '36px' }}
        >
          <Eye size={14} />
        </button>

        {/* Offline Simulation Toggle */}
        <button
          type="button"
          className={`ghost ${isOfflineMode ? 'chip-saffron' : ''}`}
          onClick={toggleOfflineMode}
          title="Simulate Low-Bandwidth / Offline Cache (Diagram 35)"
          style={{ padding: '6px 10px', minHeight: '36px', fontSize: '12px' }}
        >
          {isOfflineMode ? <WifiOff size={14} /> : <Wifi size={14} />} {isOfflineMode ? 'Offline' : 'Online'}
        </button>

        {/* Guardian Identity / Google Sign-In Trigger */}
        {!isChildModeLocked && (
          <button
            type="button"
            className="btn btn-navy"
            onClick={() => setShowAuthModal(true)}
            style={{
              padding: '6px 14px',
              minHeight: '36px',
              fontSize: '12px',
              background: 'linear-gradient(135deg, var(--color-navy-primary) 0%, var(--color-teal-primary) 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              borderRadius: '8px'
            }}
          >
            <KeyRound size={14} />
            <span>{parent.email ? `${parent.name.split(' ')[0]} (Guardian)` : 'Google Sign-In'}</span>
          </button>
        )}
      </div>

      {/* Google Auth & Mobile OTP Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Parent PIN Unlock Modal */}
      {showPinModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '16px'
        }}>
          <div className="b" style={{ width: '100%', maxWidth: '380px', padding: '24px', background: 'var(--color-paper-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Lock size={20} color="var(--color-teal-primary)" />
              <div className="h3">Parent Verification</div>
            </div>
            <div className="t-muted" style={{ marginBottom: '16px' }}>
              Enter your 4-digit Parent PIN to exit child mode or access billing and parental controls. (Default PIN: <strong>1234</strong>)
            </div>

            <form onSubmit={handleUnlockPin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                style={{
                  textAlign: 'center',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  fontWeight: 700
                }}
              />
              {pinError && (
                <div className="t-tiny" style={{ color: 'var(--color-error)' }}>
                  Incorrect PIN. Please try again.
                </div>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setShowPinModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal" style={{ flex: 1 }}>
                  Unlock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
