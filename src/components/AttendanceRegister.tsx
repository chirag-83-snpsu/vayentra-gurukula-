import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, CheckCheck, Save, Clock, History, AlertCircle, CheckCircle2, ChevronRight, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

interface BatchOption {
  id: string;
  name: string;
  grade: number;
  board: string;
  subject: string;
  startTime: string;
  endTime: string;
  enrolledCount: number;
  room?: string;
}

interface RosterStudent {
  studentId: string;
  name: string;
  enrollmentNumber: string;
  grade: number;
  board: string;
  avatar?: string;
  status: AttendanceStatus | null;
  remarks: string;
  updatedAt: string | null;
  markedByName: string | null;
}

interface SessionData {
  id: string;
  batch_id: string;
  session_date: string;
  start_time: string;
  end_time: string;
  topic: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  teacher_id?: string;
}

interface AuditLogEntry {
  id: string;
  student_name: string;
  previous_status: string | null;
  new_status: string;
  changed_by_name: string;
  change_reason: string;
  timestamp: string;
}

const choices: { value: AttendanceStatus; label: string; color: string }[] = [
  { value: 'present', label: 'Present', color: 'var(--color-teal-primary)' },
  { value: 'absent', label: 'Absent', color: '#e11d48' },
  { value: 'late', label: 'Late', color: 'var(--color-saffron)' },
  { value: 'excused', label: 'Excused leave', color: '#3b82f6' }
];

export const localDateKey = (date: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
};

export const AttendanceRegister: React.FC = () => {
  const { authToken } = useApp();
  const token = authToken || localStorage.getItem('vayentra_token');

  const [batches, setBatches] = useState<BatchOption[]>([]);
  const [batchId, setBatchId] = useState<string>('');
  const [date, setDate] = useState<string>(localDateKey());
  const [session, setSession] = useState<SessionData | null>(null);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [draft, setDraft] = useState<Record<string, AttendanceStatus | ''>>({});
  const [remarksDraft, setRemarksDraft] = useState<Record<string, string>>({});
  const [correctionReason, setCorrectionReason] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState<boolean>(false);

  // 1. Fetch authorized batches for the logged-in teacher / admin
  useEffect(() => {
    let isMounted = true;
    async function loadBatches() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/v1/attendance/batches', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        if (!res.ok) {
          if (res.status === 401 || res.status === 403) {
            throw new Error('Please sign in with your faculty account to access batch attendance rosters.');
          }
          throw new Error('Failed to load instructor batches');
        }
        const data = await res.json();
        if (isMounted && data.batches && data.batches.length > 0) {
          setBatches(data.batches);
          setBatchId(data.batches[0].id);
        }
      } catch (err) {
        if (isMounted) {
          setNotice({
            type: 'error',
            message: err instanceof Error ? err.message : 'Unable to connect to attendance service.'
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadBatches();
    return () => { isMounted = false; };
  }, [token]);

  // 2. Load session and enrolled roster whenever batch or date changes
  useEffect(() => {
    if (!batchId || !date) return;
    let isMounted = true;

    async function loadSessionAndRoster() {
      try {
        setIsLoading(true);
        setNotice(null);

        // Find or create session for selected batch & date
        const sessRes = await fetch('/api/v1/attendance/sessions/get-or-create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ batchId, date })
        });

        if (!sessRes.ok) {
          const errData = await sessRes.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to initialize session');
        }

        const sessData = await sessRes.json();
        const currentSession = sessData.session;
        if (!isMounted) return;
        setSession(currentSession);

        // Load active enrolled roster with existing attendance
        const rosterRes = await fetch(`/api/v1/attendance/sessions/${currentSession.id}/roster`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });

        if (!rosterRes.ok) {
          const errData = await rosterRes.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to fetch batch roster');
        }

        const rosterData = await rosterRes.json();
        if (!isMounted) return;

        const students: RosterStudent[] = rosterData.roster || [];
        setRoster(students);

        // Hydrate draft with server records
        const initialDraft: Record<string, AttendanceStatus | ''> = {};
        const initialRemarks: Record<string, string> = {};
        students.forEach(st => {
          initialDraft[st.studentId] = st.status || '';
          initialRemarks[st.studentId] = st.remarks || '';
        });
        setDraft(initialDraft);
        setRemarksDraft(initialRemarks);
      } catch (err) {
        if (isMounted) {
          setNotice({
            type: 'error',
            message: err instanceof Error ? err.message : 'Error loading session roster.'
          });
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSessionAndRoster();
    return () => { isMounted = false; };
  }, [batchId, date, token]);

  // Calculate live summary totals
  const totals = useMemo(() => {
    const values = Object.values(draft);
    const present = values.filter(v => v === 'present').length;
    const absent = values.filter(v => v === 'absent').length;
    const late = values.filter(v => v === 'late').length;
    const excused = values.filter(v => v === 'excused').length;
    const pending = roster.filter(st => !draft[st.studentId]).length;
    return { present, absent, late, excused, pending, total: roster.length };
  }, [draft, roster]);

  // Has any previously saved record changed?
  const hasModifications = useMemo(() => {
    return roster.some(st => {
      const serverStatus = st.status || '';
      const localStatus = draft[st.studentId] || '';
      return serverStatus !== '' && serverStatus !== localStatus;
    });
  }, [roster, draft]);

  // Action: Mark all enrolled students as present
  const markAllPresent = () => {
    const updatedDraft: Record<string, AttendanceStatus> = {};
    roster.forEach(st => {
      updatedDraft[st.studentId] = 'present';
    });
    setDraft(updatedDraft);
    setNotice({
      type: 'info',
      message: 'All enrolled students marked Present in draft. Review and click "Save Attendance" to commit.'
    });
  };

  // Action: Save attendance to backend
  const handleSaveAttendance = async () => {
    if (totals.pending > 0) {
      setNotice({
        type: 'error',
        message: `Please record attendance status for all ${roster.length} students (${totals.pending} unmarked).`
      });
      return;
    }

    if (!session) {
      setNotice({ type: 'error', message: 'No active session loaded.' });
      return;
    }

    try {
      setIsSaving(true);
      setNotice(null);

      const recordsPayload = roster.map(st => ({
        studentId: st.studentId,
        status: draft[st.studentId] as AttendanceStatus,
        remarks: remarksDraft[st.studentId] || ''
      }));

      const res = await fetch(`/api/v1/attendance/sessions/${session.id}/mark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          records: recordsPayload,
          reason: correctionReason || (hasModifications ? 'Individual faculty correction' : 'Regular daily attendance marking')
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save attendance records.');
      }

      setNotice({
        type: 'success',
        message: `Attendance successfully committed for ${recordsPayload.length} students to SQLite database.`
      });
      setCorrectionReason('');

      // Refresh roster from server to sync timestamps & audit pointers
      const rosterRes = await fetch(`/api/v1/attendance/sessions/${session.id}/roster`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (rosterRes.ok) {
        const freshRoster = await rosterRes.json();
        setRoster(freshRoster.roster || []);
      }
    } catch (err) {
      setNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to commit attendance.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Action: Load immutable audit trail for current session
  const fetchAuditLogs = async () => {
    if (!session) return;
    try {
      setIsLoadingLogs(true);
      const res = await fetch(`/api/v1/attendance/audit-logs?sessionId=${session.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
        setShowAuditLogs(true);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Header Banner */}
      <div className="b" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: '1 1 240px' }}>
          <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'clamp(17px, 3.8vw, 20px)', flexWrap: 'wrap' }}>
            <CalendarCheck2 size={22} style={{ color: 'var(--color-teal-primary)', flexShrink: 0 }} />
            <span>Daily Student Attendance Register</span>
          </div>
          <div className="t-muted" style={{ fontSize: '13px' }}>
            Authenticated faculty register. Enrolled roster is loaded from batch database and synchronized with parent portal.
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="chip chip-teal">
            <UserCheck size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
            Persistent SQLite DB • WAL Mode
          </span>
          {session && (
            <button
              type="button"
              className="ghost"
              onClick={fetchAuditLogs}
              style={{ fontSize: '12px', padding: '6px 12px' }}
              title="View immutable audit trail for this session"
            >
              <History size={14} style={{ marginRight: '4px' }} />
              Audit Trail
            </button>
          )}
        </div>
      </div>

      {/* Filter / Selector Controls */}
      <div className="b" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ flex: '2 1 260px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong>Assigned Batch</strong>
          <select
            className="in"
            value={batchId}
            onChange={e => setBatchId(e.target.value)}
            disabled={isLoading || batches.length === 0}
          >
            {batches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name} · {b.startTime}–{b.endTime} ({b.enrolledCount} learners)
              </option>
            ))}
          </select>
        </label>

        <label style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong>Session Date</strong>
          <input
            className="in"
            type="date"
            value={date}
            max={localDateKey()}
            onChange={e => setDate(e.target.value)}
            disabled={isLoading}
          />
        </label>

        {session && (
          <div style={{ flex: '2 1 240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <strong>Curriculum Session Topic</strong>
            <div style={{
              padding: '8px 12px',
              background: 'var(--color-paper-subtle)',
              borderRadius: '6px',
              border: '1px solid var(--color-border-subtle)',
              fontSize: '13px',
              fontWeight: 500
            }}>
              {session.topic || 'Core Concept Lecture & Practice'}
              <span className={`chip ${session.status === 'completed' ? 'chip-teal' : 'chip-gold'}`} style={{ marginLeft: '8px', fontSize: '11px' }}>
                {session.status.toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Notification Banner */}
      {notice && (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: notice.type === 'success' ? 'var(--color-success-bg)' : notice.type === 'error' ? 'var(--color-danger-bg, #fee2e2)' : 'var(--color-paper-subtle)',
            border: `1px solid ${notice.type === 'success' ? 'var(--color-success)' : notice.type === 'error' ? '#ef4444' : 'var(--color-border)'}`,
            color: notice.type === 'error' ? '#b91c1c' : 'inherit'
          }}
        >
          {notice.type === 'success' ? <CheckCircle2 size={18} color="var(--color-success)" /> : <AlertCircle size={18} />}
          <div style={{ flex: 1, fontSize: '14px' }}>{notice.message}</div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'inherit' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Aggregate Counts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
        {[
          { label: 'Present', count: totals.present, color: 'var(--color-teal-primary)' },
          { label: 'Absent', count: totals.absent, color: '#e11d48' },
          { label: 'Late', count: totals.late, color: 'var(--color-saffron)' },
          { label: 'Excused', count: totals.excused, color: '#3b82f6' },
          { label: 'Unmarked', count: totals.pending, color: 'var(--color-text-muted)' }
        ].map(item => (
          <div key={item.label} className="b" style={{ textAlign: 'center', padding: '12px' }}>
            <div className="t-muted" style={{ fontSize: '12px' }}>{item.label}</div>
            <div className="h2" style={{ marginTop: '4px', color: item.color }}>{item.count}</div>
          </div>
        ))}
      </div>

      {/* Student Roster View: Desktop Table + Mobile Cards */}
      <div className="b attendance-desktop-table table-responsive" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-paper-subtle)', borderBottom: '1px solid var(--color-border-subtle)' }}>
              <th style={{ padding: '12px 16px', width: '35%' }}>Student</th>
              <th style={{ padding: '12px 16px', width: '30%' }}>Attendance Status</th>
              <th style={{ padding: '12px 16px', width: '35%' }}>Faculty Remarks & Audit Log</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} style={{ padding: '32px', textAlign: 'center' }} className="t-muted">
                  Loading verified batch roster and session records...
                </td>
              </tr>
            ) : roster.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ padding: '32px', textAlign: 'center' }} className="t-muted">
                  No active students currently enrolled in this batch.
                </td>
              </tr>
            ) : (
              roster.map(st => {
                const isModified = st.status && draft[st.studentId] !== st.status;
                return (
                  <tr
                    key={st.studentId}
                    style={{
                      borderBottom: '1px solid var(--color-border-subtle)',
                      background: isModified ? 'var(--color-paper-subtle)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--color-teal-light)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}>
                          {st.avatar || '🎓'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{st.name}</div>
                          <div className="t-tiny">
                            {st.enrollmentNumber || st.studentId} · Class {st.grade} {st.board}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <select
                        className="in"
                        aria-label={`Attendance status for ${st.name}`}
                        value={draft[st.studentId] || ''}
                        onChange={e => {
                          const val = e.target.value as AttendanceStatus | '';
                          setDraft(prev => ({ ...prev, [st.studentId]: val }));
                          setNotice(null);
                        }}
                        style={{
                          minWidth: '150px',
                          fontWeight: draft[st.studentId] ? 600 : 400,
                          color: choices.find(c => c.value === draft[st.studentId])?.color || 'inherit'
                        }}
                      >
                        <option value="">-- Select Status --</option>
                        {choices.map(c => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      {isModified && (
                        <div className="t-tiny" style={{ color: 'var(--color-saffron)', marginTop: '4px' }}>
                          Correction: was {st.status}
                        </div>
                      )}
                    </td>

                    <td style={{ padding: '10px 16px' }}>
                      <input
                        className="in"
                        type="text"
                        placeholder="Optional note / absence reason"
                        value={remarksDraft[st.studentId] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setRemarksDraft(prev => ({ ...prev, [st.studentId]: val }));
                        }}
                        style={{ width: '100%', fontSize: '13px' }}
                      />
                      {st.updatedAt && (
                        <div className="t-tiny" style={{ marginTop: '2px' }}>
                          Last saved: {new Date(st.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {st.markedByName && ` by ${st.markedByName}`}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile-Optimized Student Roster Cards (< 640px) */}
      <div className="attendance-mobile-cards">
        {isLoading ? (
          <div className="b" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="t-muted">Loading verified batch roster...</div>
          </div>
        ) : roster.length === 0 ? (
          <div className="b" style={{ padding: '24px', textAlign: 'center' }}>
            <div className="t-muted">No active students currently enrolled in this batch.</div>
          </div>
        ) : (
          roster.map(st => {
            const isModified = st.status && draft[st.studentId] !== st.status;
            const currentStatus = draft[st.studentId];
            return (
              <div key={st.studentId} className={`mobile-roster-card ${isModified ? 'modified' : ''}`}>
                <div className="mobile-roster-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: 'var(--color-navy-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px'
                    }}>
                      {st.avatar || '🎓'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '15px' }}>{st.name}</div>
                      <div className="t-tiny">
                        {st.enrollmentNumber || st.studentId} · Class {st.grade} {st.board}
                      </div>
                    </div>
                  </div>
                  {currentStatus && (
                    <span className={`chip ${
                      currentStatus === 'present' ? 'chip-success' :
                      currentStatus === 'absent' ? 'chip-error' :
                      currentStatus === 'late' ? 'chip-gold' : 'chip-navy'
                    }`}>
                      {currentStatus.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Segmented Touch Buttons (>= 48px) */}
                <div className="attendance-segmented-grid">
                  <button
                    type="button"
                    className={`segmented-status-btn ${currentStatus === 'present' ? 'selected-present' : ''}`}
                    onClick={() => {
                      setDraft(prev => ({ ...prev, [st.studentId]: 'present' }));
                      setNotice(null);
                    }}
                    aria-label={`Mark ${st.name} Present`}
                  >
                    <span style={{ fontSize: '14px' }}>✓</span>
                    <span>Present</span>
                  </button>

                  <button
                    type="button"
                    className={`segmented-status-btn ${currentStatus === 'absent' ? 'selected-absent' : ''}`}
                    onClick={() => {
                      setDraft(prev => ({ ...prev, [st.studentId]: 'absent' }));
                      setNotice(null);
                    }}
                    aria-label={`Mark ${st.name} Absent`}
                  >
                    <span style={{ fontSize: '14px' }}>✕</span>
                    <span>Absent</span>
                  </button>

                  <button
                    type="button"
                    className={`segmented-status-btn ${currentStatus === 'late' ? 'selected-late' : ''}`}
                    onClick={() => {
                      setDraft(prev => ({ ...prev, [st.studentId]: 'late' }));
                      setNotice(null);
                    }}
                    aria-label={`Mark ${st.name} Late`}
                  >
                    <span style={{ fontSize: '14px' }}>⏱</span>
                    <span>Late</span>
                  </button>

                  <button
                    type="button"
                    className={`segmented-status-btn ${currentStatus === 'excused' ? 'selected-excused' : ''}`}
                    onClick={() => {
                      setDraft(prev => ({ ...prev, [st.studentId]: 'excused' }));
                      setNotice(null);
                    }}
                    aria-label={`Mark ${st.name} Excused Leave`}
                  >
                    <span style={{ fontSize: '14px' }}>✉</span>
                    <span>Excused</span>
                  </button>
                </div>

                {/* Optional Note / Remarks */}
                <div>
                  <input
                    className="in"
                    type="text"
                    placeholder="Faculty remark / absence note (optional)"
                    value={remarksDraft[st.studentId] || ''}
                    onChange={e => {
                      const val = e.target.value;
                      setRemarksDraft(prev => ({ ...prev, [st.studentId]: val }));
                    }}
                    style={{ fontSize: '13px', minHeight: '40px' }}
                  />
                  {isModified && (
                    <div className="t-tiny" style={{ color: 'var(--color-gold-dark)', marginTop: '4px' }}>
                      Correction: previous status was {st.status}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Individual Correction Notice Banner */}
      {hasModifications && (
        <div className="b" style={{ background: 'var(--color-gold-light)', borderColor: 'var(--color-gold-border)', padding: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <strong style={{ color: 'var(--color-navy-primary)' }}>
              Individual Correction Mode Active
            </strong>
            <div className="t-muted" style={{ fontSize: '13px' }}>
              You are altering previously committed attendance for one or more students. An immutable audit record will be logged with your faculty credentials.
            </div>
            <input
              className="in"
              type="text"
              placeholder="Reason for correction (e.g. Medical leave slip verified by guardian)"
              value={correctionReason}
              onChange={e => setCorrectionReason(e.target.value)}
              style={{ marginTop: '4px' }}
            />
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="ghost"
            onClick={markAllPresent}
            disabled={isLoading || roster.length === 0}
          >
            <CheckCheck size={16} /> Mark All Present
          </button>

          <button
            type="button"
            className="btn btn-teal"
            onClick={handleSaveAttendance}
            disabled={isSaving || totals.pending > 0 || roster.length === 0}
          >
            <Save size={16} /> {isSaving ? 'Persisting to Database...' : 'Save Attendance'}
          </button>
        </div>

        <div className="t-muted" style={{ fontSize: '13px' }}>
          {roster.length - totals.pending} of {roster.length} students marked
          {totals.pending > 0 && <span style={{ color: '#e11d48', marginLeft: '6px' }}>({totals.pending} remaining)</span>}
        </div>
      </div>

      {/* Mobile Sticky Action Bar (< 640px) */}
      <aside aria-label="Mobile attendance quick save" className="mobile-attendance-bar">
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--color-ink)' }}>
            {roster.length - totals.pending} / {roster.length} Marked
          </div>
          <div className="t-tiny" style={{ color: totals.pending > 0 ? '#b8231b' : 'var(--color-success)' }}>
            {totals.pending === 0 ? 'All recorded • Ready' : `${totals.pending} pending`}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {totals.pending > 0 && (
            <button
              type="button"
              className="ghost"
              onClick={markAllPresent}
              disabled={isLoading || roster.length === 0}
              style={{ minHeight: '44px', padding: '6px 10px', fontSize: '12px' }}
              title="Mark all present"
            >
              <CheckCheck size={14} /> All
            </button>
          )}
          <button
            type="button"
            className="btn btn-navy"
            onClick={handleSaveAttendance}
            disabled={isSaving || totals.pending > 0 || roster.length === 0}
            style={{ minHeight: '44px', padding: '8px 14px', fontSize: '13px' }}
          >
            <Save size={14} /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </aside>

      {/* Audit Logs Modal */}
      {showAuditLogs && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div className="b" style={{
            background: 'var(--color-paper-card)',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="h2" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={20} color="var(--color-teal-primary)" />
                Session Audit Trail & Modification History
              </div>
              <button
                type="button"
                className="ghost"
                onClick={() => setShowAuditLogs(false)}
                style={{ padding: '4px 8px' }}
              >
                ✕
              </button>
            </div>

            <div className="t-muted" style={{ fontSize: '13px' }}>
              Immutable record of every attendance status entry and individual correction for this session.
            </div>

            {isLoadingLogs ? (
              <div className="t-muted" style={{ padding: '24px', textAlign: 'center' }}>Loading audit entries...</div>
            ) : auditLogs.length === 0 ? (
              <div className="t-muted" style={{ padding: '24px', textAlign: 'center' }}>No modifications or log entries recorded for this session.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {auditLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      padding: '10px 14px',
                      background: 'var(--color-paper-subtle)',
                      borderRadius: '6px',
                      border: '1px solid var(--color-border-subtle)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <strong>{log.student_name}</strong>
                      <span className="t-tiny">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {log.previous_status ? (
                        <>
                          <span className="chip" style={{ fontSize: '11px' }}>{log.previous_status}</span>
                          <ChevronRight size={14} />
                          <span className="chip chip-teal" style={{ fontSize: '11px' }}>{log.new_status}</span>
                        </>
                      ) : (
                        <span className="chip chip-teal" style={{ fontSize: '11px' }}>Initial: {log.new_status}</span>
                      )}
                      <span className="t-muted" style={{ marginLeft: 'auto', fontSize: '12px' }}>
                        by {log.changed_by_name}
                      </span>
                    </div>
                    {log.change_reason && (
                      <div className="t-tiny" style={{ fontStyle: 'italic', marginTop: '2px' }}>
                        Reason: {log.change_reason}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <button type="button" className="btn btn-teal" onClick={() => setShowAuditLogs(false)}>
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footnote */}
      <div className="t-tiny" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '10px' }}>
        Attendance Calculation Policy: Attendance percentage is dynamically computed from verified completed sessions. Cancelled sessions and future dates are strictly excluded. Excused leaves do not penalize student percentages. All updates are logged with author attribution.
      </div>
    </div>
  );
};
