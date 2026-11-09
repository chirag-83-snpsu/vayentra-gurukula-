import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldAlert, AlertTriangle, Clock, CheckCircle2, FileText, PhoneCall } from 'lucide-react';

export const SafeguardingView: React.FC = () => {
  const { safeguardingCases } = useApp();
  const [actionFeedback, setActionFeedback] = useState<{ id: string; text: string } | null>(null);

  const highestSeverity = safeguardingCases.length > 0
    ? (safeguardingCases.some(c => c.severity === 'Critical') ? 'Critical (Urgent)' : safeguardingCases.some(c => c.severity === 'High') ? 'High (Distress)' : 'Standard / Routine')
    : 'None Pending';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Safeguarding Header */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, #2a1215 0%, #171716 100%)',
        color: '#ff8a80',
        borderColor: '#5c2b2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(255, 138, 128, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldAlert size={28} color="#ff8a80" />
          </div>
          <div>
            <div className="h1" style={{ fontSize: '22px', color: '#ff8a80' }}>
              Safeguarding Officer Vault (Restricted Access)
            </div>
            <div style={{ color: '#ffcdd2', fontSize: '13px' }}>
              Legal Escrow & Child Protection Dossier • Mandatory 24h Triage SLA
            </div>
          </div>
        </div>

        <span className="chip chip-error">DPDP Child Protection & Escrow Dossier</span>
      </div>

      {/* SLA Status Bar */}
      <div className="b" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
        <div>
          <div className="t-muted">Active Cases</div>
          <div className="h1" style={{ color: 'var(--color-error)' }}>{safeguardingCases.length}</div>
        </div>
        <div>
          <div className="t-muted">Highest Severity</div>
          <div className="h1" style={{ color: highestSeverity.includes('Critical') ? '#b8231b' : '#ff5722' }}>{highestSeverity}</div>
        </div>
        <div>
          <div className="t-muted">Mandatory Response SLA</div>
          <div className="h1" style={{ color: 'var(--color-teal-primary)' }}>&lt; 24 Hours</div>
        </div>
        <div>
          <div className="t-muted">Helpline Escalation Partner</div>
          <div className="h3" style={{ marginTop: '6px' }}>Vandrevala Foundation</div>
        </div>
      </div>

      {/* Case Dossiers List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="h2">Incident Investigation Dossiers</div>
        {safeguardingCases.map(c => (
          <div key={c.id} className="b" style={{
            borderLeft: '6px solid var(--color-error)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="chip chip-error">Severity: {c.severity}</span>
                <span className="h3">{c.category}</span>
              </div>
              <div className="t-tiny">Dossier ID: {c.id} • {c.reportedAt}</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--color-paper-subtle)', borderRadius: '6px', fontSize: '14px' }}>
              <strong>Incident Description:</strong> {c.details}
            </div>

            {actionFeedback && actionFeedback.id === c.id && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '6px',
                background: 'var(--color-teal-light)',
                color: 'var(--color-teal-primary)',
                fontSize: '13px',
                fontWeight: 600
              }}>
                ✓ {actionFeedback.text}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div className="t-tiny">
                Reporter: <strong>{c.reporterRole}</strong> • Involved: <strong>{c.studentName}</strong>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="ghost" 
                  style={{ minHeight: '36px', fontSize: '12px' }} 
                  onClick={() => setActionFeedback({
                    id: c.id,
                    text: `Guardian notification dispatched to parent of ${c.studentName}. Communication channel: Phone / WhatsApp.`
                  })}
                >
                  <PhoneCall size={14} /> Contact Parent
                </button>
                <button 
                  type="button" 
                  className="btn btn-teal" 
                  style={{ minHeight: '36px', fontSize: '12px' }} 
                  onClick={() => setActionFeedback({
                    id: c.id,
                    text: `Case ${c.id} marked investigated and archived with legal counsel notes.`
                  })}
                >
                  <CheckCircle2 size={14} /> Close Case with Notes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
