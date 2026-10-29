import React from 'react';
import { AlertCircle, WifiOff, Lock, CheckCircle2, RefreshCw } from 'lucide-react';

interface UniversalStateWrapperProps {
  state: 'loading' | 'loaded' | 'empty' | 'error' | 'offline' | 'locked' | 'success';
  loadingRows?: number;
  emptyTitle?: string;
  emptyMessage?: string;
  emptyActionText?: string;
  onEmptyAction?: () => void;
  errorMessage?: string;
  onRetry?: () => void;
  lockedTitle?: string;
  lockedMessage?: string;
  onUnlock?: () => void;
  successTitle?: string;
  successMessage?: string;
  onSuccessContinue?: () => void;
  children: React.ReactNode;
}

export const UniversalStateWrapper: React.FC<UniversalStateWrapperProps> = ({
  state,
  loadingRows = 4,
  emptyTitle = 'Nothing here yet',
  emptyMessage = 'No assignments or items due right now.',
  emptyActionText,
  onEmptyAction,
  errorMessage = 'We could not save that. Your answer is kept locally.',
  onRetry,
  lockedTitle = 'Access Locked',
  lockedMessage = 'Daily study limit reached or parent PIN required.',
  onUnlock,
  successTitle = 'Successfully Completed!',
  successMessage = 'Great work! You have unlocked the next stage.',
  onSuccessContinue,
  children
}) => {
  if (state === 'loaded') {
    return <>{children}</>;
  }

  if (state === 'loading') {
    return (
      <div className="b shimmer" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="ln" style={{ width: '40%', height: '14px' }}></div>
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div key={i} className="ln" style={{ width: `${95 - i * 15}%`, height: '10px' }}></div>
        ))}
        <div className="t-tiny" style={{ marginTop: '8px' }}>Loading layout skeleton...</div>
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="state-container">
        <div className="state-empty-icon">
          <CheckCircle2 size={32} />
        </div>
        <div className="h3">{emptyTitle}</div>
        <div className="t-muted" style={{ maxWidth: '320px' }}>{emptyMessage}</div>
        {emptyActionText && onEmptyAction && (
          <button type="button" className="btn btn-teal" onClick={onEmptyAction} style={{ marginTop: '8px' }}>
            {emptyActionText}
          </button>
        )}
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="state-container" style={{ borderColor: 'var(--color-error)' }}>
        <div className="state-error-icon">
          <AlertCircle size={32} />
        </div>
        <div className="h3" style={{ color: 'var(--color-error)' }}>Something went wrong</div>
        <div className="t-muted" style={{ maxWidth: '360px' }}>{errorMessage}</div>
        {onRetry && (
          <button type="button" className="ghost" onClick={onRetry} style={{ marginTop: '8px' }}>
            <RefreshCw size={16} /> Try again
          </button>
        )}
        <div className="t-tiny">Request ID: VAY-{Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
      </div>
    );
  }

  if (state === 'offline') {
    return (
      <div className="state-container" style={{ borderColor: '#64748b' }}>
        <div className="state-offline-icon">
          <WifiOff size={32} />
        </div>
        <div className="h3">You are currently offline</div>
        <span className="chip chip-saffron">Cached Mode Active</span>
        <div className="t-muted" style={{ maxWidth: '340px' }}>
          Downloaded lessons and notes still work seamlessly. Answers will sync once connection returns.
        </div>
        <div style={{ marginTop: '12px' }}>{children}</div>
      </div>
    );
  }

  if (state === 'locked') {
    return (
      <div className="state-container" style={{ borderColor: 'var(--color-saffron)' }}>
        <div className="state-locked-icon">
          <Lock size={32} />
        </div>
        <div className="h3">{lockedTitle}</div>
        <div className="t-muted" style={{ maxWidth: '340px' }}>{lockedMessage}</div>
        {onUnlock && (
          <button type="button" className="btn" onClick={onUnlock} style={{ marginTop: '8px' }}>
            Enter Parent PIN to Unlock
          </button>
        )}
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div className="state-container" style={{ borderColor: 'var(--color-success)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--color-success-bg)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckCircle2 size={36} />
        </div>
        <div className="h3" style={{ color: 'var(--color-success)' }}>{successTitle}</div>
        <div className="t-muted" style={{ maxWidth: '340px' }}>{successMessage}</div>
        {onSuccessContinue && (
          <button type="button" className="btn btn-teal" onClick={onSuccessContinue} style={{ marginTop: '8px' }}>
            Continue Learning
          </button>
        )}
      </div>
    );
  }

  return <>{children}</>;
};
