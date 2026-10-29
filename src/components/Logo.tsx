import React from 'react';

interface LogoProps {
  variant?: 'header' | 'full' | 'hero' | 'compact' | 'badge';
  height?: number;
  className?: string;
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'header',
  height,
  className = '',
  showTagline = true
}) => {
  // Height presets
  const computedHeight = height || (
    variant === 'header' ? 44 :
    variant === 'compact' ? 36 :
    variant === 'hero' ? 120 :
    variant === 'badge' ? 68 : 80
  );

  if (variant === 'compact') {
    return (
      <div 
        className={`vayentra-logo-compact ${className}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
      >
        <img
          src="/vayentra_logo.png"
          alt="Vayentra Gurukula"
          style={{
            height: `${computedHeight}px`,
            width: 'auto',
            objectFit: 'contain',
            borderRadius: '4px'
          }}
        />
      </div>
    );
  }

  if (variant === 'header') {
    return (
      <div 
        className={`vayentra-logo-header ${className}`}
        style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '12px',
          cursor: 'pointer' 
        }}
      >
        <div style={{
          background: '#ffffff',
          padding: '2px 6px',
          borderRadius: '8px',
          border: '1px solid rgba(18, 43, 112, 0.15)',
          boxShadow: '0 1px 4px rgba(18, 43, 112, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <img
            src="/vayentra_logo.png"
            alt="Vayentra Gurukula Logo"
            style={{
              height: `${computedHeight}px`,
              width: 'auto',
              maxHeight: `${computedHeight}px`,
              objectFit: 'contain'
            }}
          />
        </div>
        {showTagline && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              fontFamily: 'var(--font-family-display)',
              fontWeight: 800,
              fontSize: '17px',
              color: 'var(--color-navy-primary)',
              letterSpacing: '0.04em',
              lineHeight: 1.1
            }}>
              VAYENTRA
            </div>
            <div style={{
              fontFamily: 'var(--font-family-display)',
              fontWeight: 700,
              fontSize: '11px',
              color: 'var(--color-gold-primary)',
              letterSpacing: '0.12em',
              lineHeight: 1.2
            }}>
              ✦ GURUKULA ✦
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full / Hero / Badge view
  return (
    <div 
      className={`vayentra-logo-full ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        padding: variant === 'hero' ? '16px 24px' : '10px 16px',
        borderRadius: '12px',
        border: '1.5px solid var(--color-gold-border)',
        boxShadow: '0 4px 16px rgba(18, 43, 112, 0.1)',
        maxWidth: variant === 'hero' ? '460px' : '320px',
        margin: '0 auto'
      }}
    >
      <img
        src="/vayentra_logo.png"
        alt="Vayentra Gurukula - Concept-Based Academic Coaching"
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: `${computedHeight * 1.5}px`,
          objectFit: 'contain',
          display: 'block'
        }}
      />
    </div>
  );
};
export default Logo;
