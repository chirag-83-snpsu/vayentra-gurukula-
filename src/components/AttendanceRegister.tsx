import React, { useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, CheckCheck, Save } from 'lucide-react';
import {
  AttendanceStatus,
  DEMO_ATTENDANCE_BATCHES,
  localDateKey,
  readDemoAttendance,
  saveDemoAttendance
} from '../data/attendanceDemo';

const choices: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'excused', label: 'Excused leave' }
];

export const AttendanceRegister: React.FC = () => {
  const [batchId, setBatchId] = useState(DEMO_ATTENDANCE_BATCHES[0].id);
  const [date, setDate] = useState(localDateKey());
  const [draft, setDraft] = useState<Record<string, AttendanceStatus | ''>>({});
  const [notice, setNotice] = useState('');
  const batch = DEMO_ATTENDANCE_BATCHES.find(item => item.id === batchId) || DEMO_ATTENDANCE_BATCHES[0];

  useEffect(() => {
    const existing = readDemoAttendance().filter(
      record => record.batchId === batchId && record.date === date
    );
    const initial: Record<string, AttendanceStatus | ''> = {};
    batch.students.forEach(student => {
      initial[student.id] = existing.find(record => record.studentId === student.id)?.status || '';
    });
    setDraft(initial);
    setNotice('');
  }, [batchId, date, batch]);

  const totals = useMemo(() => {
    const values = Object.values(draft);
    return {
      present: values.filter(value => value === 'present').length,
      absent: values.filter(value => value === 'absent').length,
      late: values.filter(value => value === 'late').length,
      excused: values.filter(value => value === 'excused').length,
      pending: batch.students.filter(student => !draft[student.id]).length
    };
  }, [draft, batch]);

  const markAllPresent = () => {
    setDraft(Object.fromEntries(batch.students.map(student => [student.id, 'present'])) as Record<string, AttendanceStatus>);
    setNotice('All marked present in the draft. Review and click Save Attendance.');
  };

  const save = () => {
    if (totals.pending) {
      setNotice('Please mark all students before saving attendance.');
      return;
    }
    try {
      saveDemoAttendance(batch, date, draft as Record<string, AttendanceStatus>);
      setNotice('Attendance saved on this device (demo mode). No parent messages were sent.');
    } catch (err) {
      setNotice(err instanceof Error ? err.message : 'Attendance could not be saved.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="b" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div className="h2"><CalendarCheck2 size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} />Daily Student Attendance</div>
          <div className="t-muted">Mark attendance per tuition session. Parents can view the recorded demo percentage.</div>
        </div>
        <span className="chip chip-teal">DEMO · Browser-only storage</span>
      </div>

      <div className="b" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <label style={{ flex: '1 1 220px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong>Tuition batch</strong>
          <select className="in" value={batchId} onChange={event => setBatchId(event.target.value)}>
            {DEMO_ATTENDANCE_BATCHES.map(item => <option key={item.id} value={item.id}>{item.name} · {item.slot}</option>)}
          </select>
        </label>
        <label style={{ flex: '1 1 180px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <strong>Session date</strong>
          <input className="in" type="date" value={date} max={localDateKey()} onChange={event => setDate(event.target.value)} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))', gap: '10px' }}>
        {([
          ['Present', totals.present],
          ['Absent', totals.absent],
          ['Late', totals.late],
          ['Excused', totals.excused],
          ['Unmarked', totals.pending]
        ] as [string, number][]).map(([label, value]) => (
          <div key={label} className="b" style={{ textAlign: 'center' }}>
            <div className="t-muted">{label}</div>
            <div className="h2" style={{ marginTop: '4px' }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="b" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--color-paper-subtle)' }}>
              <th style={{ padding: '12px 16px' }}>Student</th>
              <th style={{ padding: '12px 16px' }}>Attendance status</th>
            </tr>
          </thead>
          <tbody>
            {batch.students.map(student => (
              <tr key={student.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 600 }}>{student.name}</td>
                <td style={{ padding: '10px 16px', minWidth: '180px' }}>
                  <select
                    className="in"
                    aria-label={'Attendance for ' + student.name}
                    value={draft[student.id] || ''}
                    onChange={event => {
                      setDraft(previous => ({ ...previous, [student.id]: event.target.value as AttendanceStatus | '' }));
                      setNotice('');
                    }}
                  >
                    <option value="">Not marked</option>
                    {choices.map(choice => <option key={choice.value} value={choice.value}>{choice.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
        <button type="button" className="ghost" onClick={markAllPresent}><CheckCheck size={16} /> Mark all present</button>
        <button type="button" className="btn btn-teal" onClick={save} disabled={totals.pending > 0 || !date}><Save size={16} /> Save Attendance</button>
        <span className="t-muted">{batch.students.length - totals.pending} of {batch.students.length} marked</span>
      </div>
      {notice && <div className="b" role="status" style={{ padding: '12px', background: 'var(--color-paper-subtle)' }}>{notice}</div>}
      <div className="t-tiny">
        Prototype only: sample names and records are stored in this browser, not the institute database. They are not shared across devices.
        Real attendance requires authenticated faculty permissions, backend persistence, actual enrolled batch rosters, and an edit audit trail.
        Present and Late count as attended; Excused leave is excluded from the demonstration percentage.
      </div>
    </div>
  );
};
