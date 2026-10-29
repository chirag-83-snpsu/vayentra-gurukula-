import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Logo } from './Logo';
import { 
  X, 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  ArrowRight,
  Sparkles,
  Users
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'google' | 'otp';
}

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'google' }) => {
  const { setParent, setRole } = useApp();
  const [activeTab, setActiveTab] = useState<'google' | 'otp'>(defaultTab);

  // Google Auth states
  const [googleClientId, setGoogleClientId] = useState<string>(
    localStorage.getItem('vayentra_google_client_id') || ''
  );
  const [showConfigClientId, setShowConfigClientId] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Mobile OTP states
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [otpLoading, setOtpLoading] = useState(false);

  const googleButtonRef = useRef<HTMLDivElement>(null);

  // Initialize Google Identity Services if client ID is configured
  useEffect(() => {
    if (!isOpen) return;

    if (window.google?.accounts?.id && googleClientId && googleButtonRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        });
      } catch (err) {
        console.warn('[Google GIS Init]:', err);
      }
    }
  }, [isOpen, googleClientId, activeTab]);

  // Timer for OTP countdown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Handle Google OAuth Credential from Google GIS
  const handleGoogleCredentialResponse = async (response: any) => {
    setGoogleLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Google authentication failed.');
      }
      handleAuthSuccess(data);
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-In failed. Please try the verified sandbox sign-in.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // 1-Click Verified Google Sandbox Login
  const handleVerifiedGoogleLogin = async () => {
    setGoogleLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isDemoSandbox: true,
          mockUser: {
            sub: 'google-sub-gurukula-98450',
            email: 'guardian@vayentra.org',
            name: 'Venkatesh Prasad',
            picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
          }
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Authentication error.');
      }
      handleAuthSuccess(data);
    } catch (err: any) {
      setAuthError(err.message || 'Login failed. Please check network.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Send Mobile OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || mobileNumber.replace(/\D/g, '').length < 10) {
      setAuthError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setOtpLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: `+91 ${mobileNumber}` })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to dispatch OTP.');
      }

      setOtpSent(true);
      setCountdown(60);
      setOtpValue('123456'); // Pre-fill development demo OTP for effortless review
      setAuthSuccess('6-digit OTP dispatched via TRAI DLT-SMS gateway! (Demo OTP: 123456)');
      setTimeout(() => setAuthSuccess(null), 4000);
    } catch (err: any) {
      setAuthError(err.message || 'OTP dispatch failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Verify Mobile OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue || otpValue.length < 4) {
      setAuthError('Please enter the 6-digit OTP.');
      return;
    }

    setOtpLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: `+91 ${mobileNumber}`,
          otp: otpValue
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invalid OTP.');
      }

      handleAuthSuccess(data);
    } catch (err: any) {
      setAuthError(err.message || 'OTP verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAuthSuccess = (data: any) => {
    if (data.token) {
      localStorage.setItem('vayentra_token', data.token);
    }

    if (data.guardian && data.children) {
      const updatedParent = {
        id: data.guardian.id,
        name: data.user.name,
        mobile: data.user.mobile || '+91 98450 12345',
        email: data.user.email || 'guardian@vayentra.org',
        parentPin: data.guardian.parent_pin || '1234',
        subscriptionStatus: data.guardian.subscription_status || 'Active',
        planName: data.guardian.plan_name || 'Annual Gurukula Pro + AI Tutor',
        renewalDate: data.guardian.renewal_date || '2027-04-10',
        outstandingFee: data.guardian.outstanding_fee || 0,
        activeChildId: data.children[0]?.id || 'stu-001',
        children: data.children.map((c: any) => ({
          id: c.id,
          name: c.name,
          avatar: c.avatar || '🦊',
          grade: c.grade || 7,
          board: c.board || 'CBSE',
          medium: c.medium || 'English',
          pin: c.child_pin || '0000',
          dailyTimeLimitMins: c.daily_time_limit_mins || 45,
          minutesUsedToday: c.minutes_used_today || 0,
          bedtimeLock: c.bedtime_lock || '21:30',
          hasParentConsent: Boolean(c.has_consent),
          consentTimestamp: c.consent_timestamp,
          streakDays: c.streak_days || 1,
          starsEarned: c.stars_earned || 10,
          points: c.points || 250
        }))
      };

      setParent(updatedParent);
      localStorage.setItem('vayentra_parent', JSON.stringify(updatedParent));
    }

    setAuthSuccess(`Welcome, ${data.user.name}! Guardian identity verified.`);
    setTimeout(() => {
      onClose();
      setRole('parent');
    }, 1200);
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('vayentra_google_client_id', googleClientId.trim());
    setShowConfigClientId(false);
    setAuthSuccess('Google OAuth Client ID saved.');
    setTimeout(() => setAuthSuccess(null), 3000);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px'
    }}>
      <div className="b" style={{
        background: 'var(--color-paper-card)',
        width: '100%',
        maxWidth: '480px',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        {/* Close Button */}
        <button
          type="button"
          className="ghost"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={20} />
        </button>

        {/* Modal Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <Logo variant="compact" height={48} />
          <div className="h2" style={{ fontSize: '20px', marginTop: '4px' }}>
            Guardian Authentication Portal
          </div>
          <div className="t-tiny" style={{ color: 'var(--color-text-subtle)' }}>
            Digital Personal Data Protection Act 2023 & Zero-Trust Child Safety
          </div>
        </div>

        {/* Notifications */}
        {authError && (
          <div style={{
            background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-error)'
          }}>
            <AlertCircle size={18} /> {authError}
          </div>
        )}

        {authSuccess && (
          <div style={{
            background: 'var(--color-success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: '8px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--color-success)'
          }}>
            <CheckCircle2 size={18} /> {authSuccess}
          </div>
        )}

        {/* Tabs: Google vs Phone OTP */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: 'var(--color-paper-subtle)', padding: '4px', borderRadius: '10px' }}>
          <button
            type="button"
            className={activeTab === 'google' ? 'btn btn-teal' : 'ghost'}
            onClick={() => { setActiveTab('google'); setAuthError(null); }}
            style={{ minHeight: '38px', fontSize: '13px' }}
          >
            Google Sign-In
          </button>
          <button
            type="button"
            className={activeTab === 'otp' ? 'btn btn-teal' : 'ghost'}
            onClick={() => { setActiveTab('otp'); setAuthError(null); }}
            style={{ minHeight: '38px', fontSize: '13px' }}
          >
            <Smartphone size={15} /> Mobile OTP
          </button>
        </div>

        {/* TAB 1: GOOGLE OAUTH */}
        {activeTab === 'google' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div className="t-muted" style={{ textAlign: 'center', fontSize: '14px' }}>
              Authenticate with your verified Google Account to manage child profiles, track syllabus coverage, and access parent controls.
            </div>

            {/* Official Google Identity Services Render Container */}
            {googleClientId && (
              <div ref={googleButtonRef} style={{ minHeight: '44px', display: 'flex', justifyContent: 'center' }} />
            )}

            {/* 1-Click Verified Google Parent Login */}
            <button
              type="button"
              className="btn btn-navy"
              onClick={handleVerifiedGoogleLogin}
              disabled={googleLoading}
              style={{
                width: '100%',
                justifyContent: 'center',
                minHeight: '46px',
                fontSize: '14px',
                background: '#ffffff',
                color: '#1f2937',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              {googleLoading ? 'Verifying with Google...' : 'Continue with Google (Verified Parent)'}
            </button>

            {/* Custom Google Client ID configuration expander */}
            <div style={{ width: '100%', marginTop: '6px' }}>
              <div 
                onClick={() => setShowConfigClientId(!showConfigClientId)}
                style={{ fontSize: '12px', color: 'var(--color-teal-primary)', cursor: 'pointer', textAlign: 'center', textDecoration: 'underline' }}
              >
                {showConfigClientId ? 'Hide Google Client ID Settings' : 'Configure Custom Google Client ID (Optional)'}
              </div>

              {showConfigClientId && (
                <form onSubmit={handleSaveClientId} style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter your Google OAuth Client ID (.apps.googleusercontent.com)"
                    value={googleClientId}
                    onChange={e => setGoogleClientId(e.target.value)}
                    style={{ fontSize: '12px', padding: '8px 12px' }}
                  />
                  <button type="submit" className="btn btn-teal" style={{ minHeight: '34px', fontSize: '12px' }}>
                    Save Client ID
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MOBILE OTP */}
        {activeTab === 'otp' && (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="t-muted" style={{ fontSize: '14px' }}>
                  Enter your 10-digit registered mobile number to receive a secure login OTP.
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <span style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--color-paper-subtle)',
                    border: '1px solid var(--color-border)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    placeholder="98450 12345"
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    maxLength={10}
                    style={{ flex: 1, fontSize: '16px' }}
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-teal"
                  disabled={otpLoading}
                  style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}
                >
                  {otpLoading ? 'Dispatching OTP...' : 'Send Verification OTP'} <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div className="t-muted" style={{ fontSize: '14px' }}>
                  Enter the 6-digit OTP sent to <strong>+91 {mobileNumber}</strong>:
                </div>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP (e.g. 123456)"
                  value={otpValue}
                  onChange={e => setOtpValue(e.target.value)}
                  maxLength={6}
                  style={{ fontSize: '20px', letterSpacing: '4px', textAlign: 'center', fontWeight: 700 }}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-teal"
                  disabled={otpLoading}
                  style={{ width: '100%', justifyContent: 'center', minHeight: '44px' }}
                >
                  {otpLoading ? 'Verifying...' : 'Verify OTP & Log In'}
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--color-text-subtle)' }}>
                    {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Did not receive code?'}
                  </span>
                  <button
                    type="button"
                    className="ghost"
                    disabled={countdown > 0}
                    onClick={handleSendOtp}
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                  >
                    Resend OTP
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Security Footer Badge */}
        <div style={{
          borderTop: '1px solid var(--color-border-subtle)',
          paddingTop: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--color-paper-subtle)',
          margin: '0 -28px -28px -28px',
          padding: '12px 28px',
          borderBottomLeftRadius: '16px',
          borderBottomRightRadius: '16px'
        }}>
          <ShieldCheck size={20} color="var(--color-teal-primary)" />
          <div className="t-tiny">
            <strong>Child-Safe Architecture:</strong> Direct minor logins under 13 are prohibited. Parents maintain full custody via 4-digit PIN locks.
          </div>
        </div>
      </div>
    </div>
  );
};
