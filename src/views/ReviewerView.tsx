import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2, XCircle, Clock, Eye, ShieldCheck, Diff } from 'lucide-react';

export const ReviewerView: React.FC = () => {
  const [approvedStatus, setApprovedStatus] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Reviewer Header */}
      <div className="b" style={{
        background: 'linear-gradient(135deg, var(--color-paper-card) 0%, var(--color-paper-subtle) 100%)',
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
            background: 'var(--color-teal-light)',
            color: 'var(--color-teal-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ClipboardCheck size={26} />
          </div>
          <div>
            <div className="h1" style={{ fontSize: '22px' }}>Editorial & Content Review Desk</div>
            <div className="t-muted">Human-in-the-Loop Content Gate (Mandatory AT-08: AI Drafts Cannot Go Live Without Review)</div>
          </div>
        </div>

        <span className="chip chip-saffron">SLA: 2 Items Pending Review (&lt;48h remaining)</span>
      </div>

      {approvedStatus && (
        <div className="b" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)' }}>
          <strong>Decision Logged!</strong> {approvedStatus}
        </div>
      )}

      {/* Side-by-Side Review Workspace (Wireframe 29 & 42 / Diagram 58) */}
      <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="h2">Review Item: Class 7 Mathematics - Chapter 1, Episode 2</div>
            <div className="t-muted">Multiplication of Integers & Sign Flip Rules • Author: Mrs. Sunita K. (Teacher Edited)</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="ghost"
              style={{ color: 'var(--color-error)', borderColor: 'var(--color-error)' }}
              onClick={() => setApprovedStatus('Rejected with comments returned to Teacher Studio.')}
            >
              <XCircle size={16} /> Request Revisions
            </button>
            <button
              type="button"
              className="btn btn-teal"
              onClick={() => setApprovedStatus('Approved! Lesson published to production with verified trust stamp.')}
            >
              <CheckCircle2 size={16} /> Approve & Publish Live
            </button>
          </div>
        </div>

        {/* Diff Columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div className="b" style={{ background: 'var(--color-paper-subtle)' }}>
            <div className="h3" style={{ marginBottom: '8px', color: 'var(--color-text-muted)' }}>
              1. NCERT Official Syllabus Source Text
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-ink)' }}>
              "We observed that the product of a positive and a negative integer is a negative integer: a × (-b) = -(a × b). Furthermore, the product of two negative integers is a positive integer: (-a) × (-b) = a × b."
            </div>
          </div>

          <div className="b" style={{ background: 'var(--color-paper-card)' }}>
            <div className="h3" style={{ marginBottom: '8px', color: 'var(--color-teal-primary)' }}>
              2. Teacher Submitted Episode Script
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--color-ink)' }}>
              "Imagine walking backwards on a number line while filming a video in reverse! When two negative directions combine, the result points forward (+). Canceling a penalty of ₹500 restores your wallet balance by +₹500."
            </div>
          </div>
        </div>

        {/* Reviewer Checklist */}
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="h3">Editorial Verification Checklist</div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input type="checkbox" defaultChecked /> Pedagogical alignment with Board Syllabus verified.
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input type="checkbox" defaultChecked /> 3 Checkpoint questions include complete explanations (no raw answer keys).
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
            <input type="checkbox" defaultChecked /> Media licensing and English copy verified.
          </label>
        </div>
      </div>

    </div>
  );
};
