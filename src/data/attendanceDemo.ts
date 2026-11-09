// DEMONSTRATION ONLY. Replace these samples and browser storage with an authorized
// server-side student roster and attendance API before using real student data.
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceStudent {
  id: string;
  name: string;
}

export interface AttendanceBatch {
  id: string;
  name: string;
  slot: string;
  students: AttendanceStudent[];
}

export interface AttendanceRecord {
  studentId: string;
  batchId: string;
  date: string; // YYYY-MM-DD, tuition centre local date
  status: AttendanceStatus;
  updatedAt: string;
}

export interface StudentAttendanceSummary {
  attended: number;
  absent: number;
  excused: number;
  recorded: number;
  percent: number | null;
}

const STORAGE_KEY = 'vayentra_attendance_demo_v1';

export const DEMO_ATTENDANCE_BATCHES: AttendanceBatch[] = [
  {
    id: 'class-7-a',
    name: 'Class 7-A · CBSE',
    slot: '5:30–6:30 PM',
    students: [
      { id: 'stu-001', name: 'Aarav Varma' },
      { id: 'demo-diya', name: 'Diya Patel' },
      { id: 'demo-kavya', name: 'Kavya Rao' },
      { id: 'demo-rohan', name: 'Rohan Sharma' },
      { id: 'demo-zoya', name: 'Zoya Khan' }
    ]
  },
  {
    id: 'class-10-b',
    name: 'Class 10-B · CBSE',
    slot: '6:30–7:30 PM',
    students: [
      { id: 'demo-10-01', name: 'Demo Student 10-01' },
      { id: 'demo-10-02', name: 'Demo Student 10-02' }
    ]
  }
];

const validStatuses: AttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

export const localDateKey = (date: Date = new Date()): string => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-');
};

export function readDemoAttendance(): AttendanceRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((record): record is AttendanceRecord => {
      if (!record || typeof record !== 'object') return false;
      const row = record as Record<string, unknown>;
      return typeof row.studentId === 'string'
        && typeof row.batchId === 'string'
        && typeof row.date === 'string'
        && typeof row.updatedAt === 'string'
        && validStatuses.includes(row.status as AttendanceStatus);
    });
  } catch {
    return [];
  }
}

export function saveDemoAttendance(
  batch: AttendanceBatch,
  date: string,
  statuses: Record<string, AttendanceStatus>
): AttendanceRecord[] {
  const studentIds = new Set(batch.students.map(student => student.id));
  if (batch.students.some(student => !validStatuses.includes(statuses[student.id]))) {
    throw new Error('Please mark every student before saving.');
  }
  const existing = readDemoAttendance().filter(record =>
    !(record.batchId === batch.id && record.date === date && studentIds.has(record.studentId))
  );
  const now = new Date().toISOString();
  const updated = [
    ...existing,
    ...batch.students.map(student => ({
      studentId: student.id,
      batchId: batch.id,
      date,
      status: statuses[student.id],
      updatedAt: now
    }))
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function getStudentAttendanceSummary(
  records: AttendanceRecord[],
  studentId: string
): StudentAttendanceSummary {
  const studentRecords = records.filter(record => record.studentId === studentId);
  const attended = studentRecords.filter(record => record.status === 'present' || record.status === 'late').length;
  const absent = studentRecords.filter(record => record.status === 'absent').length;
  const excused = studentRecords.filter(record => record.status === 'excused').length;
  // Excused leave is shown separately and excluded from this demo percentage.
  // The production leave policy must be decided by the institute.
  const eligible = attended + absent;
  return {
    attended,
    absent,
    excused,
    recorded: studentRecords.length,
    percent: eligible === 0 ? null : Math.round((attended / eligible) * 100)
  };
}
