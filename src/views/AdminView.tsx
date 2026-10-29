import React, { useState } from 'react';
import { DEMO_ATTENDANCE_BATCHES, getStudentAttendanceSummary, readDemoAttendance } from '../data/attendanceDemo';
import { SlidersHorizontal, Upload, FileSpreadsheet, DollarSign, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'import' | 'finance' | 'ai_gov' | 'attendance'>('import');
  const [importProcessed, setImportProcessed] = useState(false);

  const handleSimulateImport = () => {
    setImportProcessed(true);
    setTimeout(() => setImportProcessed(false), 6000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Admin Header */}
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
            <SlidersHorizontal size={26} />
          </div>
          <div>
            <div className="h1" style={{ fontSize: '22px' }}>Super Admin & Operations Console</div>
            <div className="t-muted">Institution: Vayentra Central Gurukula • Academic Session 2026-2027</div>
          </div>
        </div>

        <span className="chip chip-teal">System Status: All Services Healthy</span>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--color-border-subtle)', paddingBottom: '8px', overflowX: 'auto' }}>
        <button
          type="button"
          className={activeTab === 'import' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('import')}
        >
          Bulk Roster Import (Diagram 21)
        </button>
        <button
          type="button"
          className={activeTab === 'finance' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('finance')}
        >
          Collections & Financial Ledger (Diagram 68)
        </button>
        <button
          type="button"
          className={activeTab === 'ai_gov' ? 'btn btn-teal' : 'ghost'}
          onClick={() => setActiveTab('ai_gov')}
        >
          AI Cost & Governance (Diagram 72)
        </button>
        <button type="button" className={activeTab === 'attendance' ? 'btn btn-teal' : 'ghost'} onClick={() => setActiveTab('attendance')}>Attendance Overview</button>
      </div>


      {activeTab === 'attendance' && (
        <div className="b">
          <div className="h2">Student Attendance Overview <span className="chip chip-teal">DEMO · This browser</span></div>
          <p className="t-muted">Illustrative batch rosters. Real attendance needs server storage and role-based access before launch.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead><tr><th style={{ padding: 12 }}>Batch</th><th style={{ padding: 12 }}>Student</th><th style={{ padding: 12 }}>Sessions recorded</th><th style={{ padding: 12 }}>Attendance</th></tr></thead>
              <tbody>{DEMO_ATTENDANCE_BATCHES.flatMap(batch => batch.students.map(student => {
                const summary = getStudentAttendanceSummary(readDemoAttendance(), student.id);
                return <tr key={batch.id + student.id} style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
                  <td style={{ padding: 12 }}>{batch.name}</td><td style={{ padding: 12 }}>{student.name}</td>
                  <td style={{ padding: 12 }}>{summary.recorded}</td><td style={{ padding: 12 }}>{summary.percent === null ? 'No records' : summary.percent + '%'}</td>
                </tr>;
              }))}</tbody>
            </table>
          </div>
        </div>
      )}

      {/* BULK IMPORT TAB (Wireframe 65 / Diagram 21) */}
      {activeTab === 'import' && (
        <div className="b" style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '720px' }}>
          <div className="h2">Atomic Bulk Student & Teacher Onboarding</div>
          <div className="t-muted">
            Upload CSV/Excel spreadsheets. Automated 2-pass validation checks mobile formats, board configurations, and relational duplicates before commit.
          </div>

          <div style={{
            border: '2px dashed var(--color-border)',
            borderRadius: '10px',
            padding: '36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            background: 'var(--color-paper-subtle)'
          }}>
            <FileSpreadsheet size={40} color="var(--color-teal-primary)" />
            <div style={{ fontWeight: 600 }}>student_roster_class7_2026.xlsx</div>
            <div className="t-tiny">File Size: 142 KB • 48 Student Records Detected</div>
            <button type="button" className="btn btn-teal" onClick={handleSimulateImport}>
              <Upload size={16} /> Validate & Import Transactionally
            </button>
          </div>

          {importProcessed && (
            <div className="b" style={{ background: 'var(--color-success-bg)', borderColor: 'var(--color-success)' }}>
              <strong>Import Successful!</strong> 48 student profiles and guardian links inserted in one atomic database transaction. Welcome SMS and WhatsApp invites queued.
            </div>
          )}
        </div>
      )}

      {/* FINANCE TAB */}
      {activeTab === 'finance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="h2">Collections & Fee Settlement Reconciliation</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="b">
              <div className="t-muted">Total Collections Today</div>
              <div className="h1" style={{ color: 'var(--color-teal-primary)' }}>₹4,82,500</div>
              <div className="t-tiny">32 Settlements via Razorpay</div>
            </div>
            <div className="b">
              <div className="t-muted">Pending Ageing Dues</div>
              <div className="h1" style={{ color: 'var(--color-saffron)' }}>₹36,000</div>
              <div className="t-tiny">3 Accounts in Grace Period</div>
            </div>
            <div className="b">
              <div className="t-muted">GST Remittance (18%)</div>
              <div className="h1">₹73,600</div>
              <div className="t-tiny">SAC 9992 Educational Tech</div>
            </div>
          </div>
        </div>
      )}

      {/* AI GOVERNANCE TAB */}
      {activeTab === 'ai_gov' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="h2">AI Prompt & Token Expenditure Controls (FR-AIG)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
            <div className="b">
              <div className="t-muted">Daily Token Quota</div>
              <div className="h1">1.2M / 5.0M</div>
              <div className="t-tiny">Current spend: ₹480 / ₹2,000 budget</div>
            </div>
            <div className="b">
              <div className="t-muted">Ungrounded Queries Blocked</div>
              <div className="h1" style={{ color: 'var(--color-teal-primary)' }}>14</div>
              <div className="t-tiny">Redirected to Teacher Queue</div>
            </div>
            <div className="b">
              <div className="t-muted">Active Model Version</div>
              <div className="h3" style={{ marginTop: '4px' }}>Claude 3.7 / Gemini 2.0</div>
              <div className="t-tiny">Golden evaluation set score: 98.4%</div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
