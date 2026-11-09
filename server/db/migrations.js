import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { db } from './database.js';
import { CBSE_SUBJECTS_BY_GRADE } from '../data/cbseCatalog.js';
import { CLASS10_PILOT_LESSONS } from '../data/class10PilotLessons.js';
import { CLASS10_NEXT_LESSON_BATCH } from '../data/class10NextLessonBatch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'vayentra.sqlite');

export function runMigrations() {
  console.log('[Vayentra DB] Running database migrations...');

  db.exec('BEGIN TRANSACTION;');
  try {
    // 1. Ensure migrations tracking table exists
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        applied_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);

    // 2. Migration 001: Staff & Verified Accounts with bcrypt passwords
    const applied001 = db.prepare('SELECT id FROM migrations WHERE name = ?').get('001_auth_staff_accounts');
    if (!applied001) {
      console.log('[Vayentra DB] Applying migration 001_auth_staff_accounts...');

      // Ensure password_hash column exists on users
      const tableInfo = db.prepare('PRAGMA table_info(users)').all();
      const hasPasswordHash = tableInfo.some(col => col.name === 'password_hash');
      if (!hasPasswordHash) {
        db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT;');
      }

      const defaultPassword = 'Gurukula@2026';
      const passwordHash = bcrypt.hashSync(defaultPassword, 10);

      // Seed / Update Staff and Family Accounts
      const accounts = [
        {
          id: 'usr-admin-01',
          email: 'admin@vayentra.org',
          name: 'Principal S. Ramaswamy',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
        },
        {
          id: 'usr-teacher-01',
          email: 'teacher@vayentra.org',
          name: 'Ananya Sharma, M.Sc.',
          role: 'teacher',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
        },
        {
          id: 'usr-safeguarding-01',
          email: 'safeguarding@vayentra.org',
          name: 'Dr. Kavitha Rao',
          role: 'safeguarding',
          avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
        },
        {
          id: 'usr-reviewer-01',
          email: 'reviewer@vayentra.org',
          name: 'Prof. K. Narayana',
          role: 'reviewer',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
        },
        {
          id: 'usr-guardian-01',
          email: 'guardian@vayentra.org',
          name: 'Venkatesh Prasad',
          role: 'parent',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
        },
        {
          id: 'usr-student-01',
          email: 'student@vayentra.org',
          name: 'Aarav Varma',
          role: 'student',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        }
      ];

      const upsertUser = db.prepare(`
        INSERT INTO users (id, email, name, role, avatar, password_hash)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(email) DO UPDATE SET
          name = excluded.name,
          role = excluded.role,
          avatar = excluded.avatar,
          password_hash = excluded.password_hash
      `);

      for (const acc of accounts) {
        upsertUser.run(acc.id, acc.email, acc.name, acc.role, acc.avatar, passwordHash);
      }

      // Ensure Guardian record exists for guardian@vayentra.org
      const guardianUser = db.prepare('SELECT id FROM users WHERE email = ?').get('guardian@vayentra.org');
      if (guardianUser) {
        const guardianExists = db.prepare('SELECT id FROM guardians WHERE user_id = ?').get(guardianUser.id);
        if (!guardianExists) {
          db.prepare(`
            INSERT INTO guardians (id, user_id, parent_pin, subscription_status, plan_name, renewal_date, outstanding_fee, emergency_phone)
            VALUES (?, ?, '1234', 'Active', 'Annual Gurukula Pro + AI Tutor', '2027-04-10', 0.0, '+91 98450 99999')
          `).run('par-001', guardianUser.id);
        }
      }

      // Ensure Student record exists for student
      const guardian = db.prepare('SELECT id FROM guardians WHERE user_id = ?').get(guardianUser?.id || 'usr-guardian-01');
      if (guardian) {
        const studentExists = db.prepare('SELECT id FROM students WHERE id = ?').get('stu-001');
        if (!studentExists) {
          db.prepare(`
            INSERT INTO students (
              id, guardian_id, name, avatar, grade, board, medium, school_name,
              child_pin, daily_time_limit_mins, minutes_used_today, bedtime_lock,
              has_consent, consent_timestamp, streak_days, stars_earned, points
            ) VALUES (?, ?, 'Aarav Varma', '🦊', 7, 'CBSE', 'English', 'Vayentra Gurukula Academy', '0000', 45, 22, '21:30', 1, datetime('now'), 5, 42, 1250)
          `).run('stu-001', guardian.id);
        }
      }

      db.prepare('INSERT INTO migrations (name) VALUES (?)').run('001_auth_staff_accounts');
      console.log('[Vayentra DB] Migration 001_auth_staff_accounts completed successfully.');
    }

    // 3. Migration 002: Student Enrollment & Batch Management (Phase 2)
    const applied002 = db.prepare('SELECT id FROM migrations WHERE name = ?').get('002_student_enrollment_batch_management');
    if (!applied002) {
      console.log('[Vayentra DB] Applying migration 002_student_enrollment_batch_management...');

      // Backup-safe: Create a copy of the database before running DDL
      if (fs.existsSync(DB_PATH)) {
        try {
          const backupFile = path.join(__dirname, `vayentra.sqlite.backup-mig002-${Date.now()}`);
          fs.copyFileSync(DB_PATH, backupFile);
          console.log(`[Vayentra DB] Pre-migration backup safely created at: ${backupFile}`);
        } catch (backupErr) {
          console.warn('[Vayentra DB] Note: Pre-migration backup warning:', backupErr.message);
        }
      }

      // 3.1 Extend students table with status, enrollment_number, dob, notes
      const studentCols = db.prepare('PRAGMA table_info(students)').all().map(c => c.name);
      if (!studentCols.includes('status')) {
        db.exec("ALTER TABLE students ADD COLUMN status TEXT NOT NULL DEFAULT 'active';");
      }
      if (!studentCols.includes('enrollment_number')) {
        db.exec("ALTER TABLE students ADD COLUMN enrollment_number TEXT;");
      }
      if (!studentCols.includes('dob')) {
        db.exec("ALTER TABLE students ADD COLUMN dob TEXT;");
      }
      if (!studentCols.includes('notes')) {
        db.exec("ALTER TABLE students ADD COLUMN notes TEXT;");
      }

      // Assign unique institutional enrollment numbers to existing students without one
      const existingStudents = db.prepare("SELECT id FROM students WHERE enrollment_number IS NULL OR enrollment_number = ''").all();
      const updateEnr = db.prepare("UPDATE students SET enrollment_number = ? WHERE id = ?");
      existingStudents.forEach((st, idx) => {
        const enrNum = `VG-2026-${String(idx + 1).padStart(4, '0')}`;
        updateEnr.run(enrNum, st.id);
      });

      // Create index on enrollment_number
      db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_students_enrollment_number ON students(enrollment_number);");

      // 3.2 Create teachers table
      db.exec(`
        CREATE TABLE IF NOT EXISTS teachers (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL UNIQUE,
          qualification TEXT NOT NULL,
          specialization TEXT NOT NULL,
          phone TEXT,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `);

      // Seed teacher profile for teacher@vayentra.org
      const teacherUser = db.prepare("SELECT id FROM users WHERE email = 'teacher@vayentra.org'").get();
      if (teacherUser) {
        const existingTeacher = db.prepare("SELECT id FROM teachers WHERE user_id = ?").get(teacherUser.id);
        if (!existingTeacher) {
          db.prepare(`
            INSERT INTO teachers (id, user_id, qualification, specialization, phone, status)
            VALUES (?, ?, 'M.Sc. Mathematics, B.Ed.', 'Mathematics & Mental Maths', '+91 98450 77777', 'active')
          `).run('tch-001', teacherUser.id);
        }
      }

      // 3.3 Create batches table with constraints
      db.exec(`
        CREATE TABLE IF NOT EXISTS batches (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          grade INTEGER NOT NULL CHECK (grade >= 1 AND grade <= 10),
          board TEXT NOT NULL CHECK (board IN ('CBSE', 'STATE_KARNATAKA', 'ICSE')),
          subject TEXT NOT NULL,
          teacher_id TEXT,
          max_capacity INTEGER NOT NULL DEFAULT 30,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          days_of_week_json TEXT NOT NULL DEFAULT '["MON","WED","FRI"]',
          room TEXT DEFAULT 'Room Gurukula-1',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
        );
      `);

      // 3.4 Create batch_enrollments table with composite unique constraint
      db.exec(`
        CREATE TABLE IF NOT EXISTS batch_enrollments (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          batch_id TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'dropped', 'completed')),
          enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
          transferred_to_batch_id TEXT,
          notes TEXT,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
          FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
          FOREIGN KEY (transferred_to_batch_id) REFERENCES batches(id) ON DELETE SET NULL,
          UNIQUE(student_id, batch_id)
        );
      `);

      // Seed initial batches
      const initialBatches = [
        {
          id: 'batch-7a-cbse-math',
          name: 'Class 7-A · CBSE Mathematics',
          grade: 7,
          board: 'CBSE',
          subject: 'Mathematics',
          teacher_id: 'tch-001',
          max_capacity: 30,
          start_time: '17:30',
          end_time: '18:30',
          days_of_week_json: '["MON","WED","FRI"]',
          room: 'Gurukula Ramanujan Hall'
        },
        {
          id: 'batch-7b-cbse-sci',
          name: 'Class 7-B · CBSE Science & Physics',
          grade: 7,
          board: 'CBSE',
          subject: 'Science',
          teacher_id: 'tch-001',
          max_capacity: 25,
          start_time: '18:45',
          end_time: '19:45',
          days_of_week_json: '["MON","WED","FRI"]',
          room: 'Gurukula C.V. Raman Lab'
        },
        {
          id: 'batch-10-cbse-math',
          name: 'Class 10-A · CBSE Board Exam Preparation',
          grade: 10,
          board: 'CBSE',
          subject: 'Mathematics',
          teacher_id: 'tch-001',
          max_capacity: 30,
          start_time: '16:30',
          end_time: '17:30',
          days_of_week_json: '["TUE","THU","SAT"]',
          room: 'Gurukula Aryabhata Room'
        },
        {
          id: 'batch-8-kstate-math',
          name: 'Class 8 · Karnataka State Board Maths & Science',
          grade: 8,
          board: 'STATE_KARNATAKA',
          subject: 'Mathematics',
          teacher_id: 'tch-001',
          max_capacity: 30,
          start_time: '18:00',
          end_time: '19:00',
          days_of_week_json: '["TUE","THU","SAT"]',
          room: 'Gurukula Visvesvaraya Hall'
        }
      ];

      const insertBatch = db.prepare(`
        INSERT OR IGNORE INTO batches (id, name, grade, board, subject, teacher_id, max_capacity, start_time, end_time, days_of_week_json, room)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const b of initialBatches) {
        insertBatch.run(b.id, b.name, b.grade, b.board, b.subject, b.teacher_id, b.max_capacity, b.start_time, b.end_time, b.days_of_week_json, b.room);
      }

      // Seed student enrollment for stu-001 in batch-7a-cbse-math and batch-7b-cbse-sci (multi-batch enrollment without duplicate student)
      const stu001 = db.prepare("SELECT id FROM students WHERE id = 'stu-001'").get();
      if (stu001) {
        const insertEnr = db.prepare(`
          INSERT OR IGNORE INTO batch_enrollments (id, student_id, batch_id, status, notes)
          VALUES (?, ?, ?, 'active', ?)
        `);
        insertEnr.run('enr-stu001-batch7a', 'stu-001', 'batch-7a-cbse-math', 'Core Mathematics Tuition');
        insertEnr.run('enr-stu001-batch7b', 'stu-001', 'batch-7b-cbse-sci', 'Science & Lab Fundamentals');
      }

      db.prepare('INSERT INTO migrations (name) VALUES (?)').run('002_student_enrollment_batch_management');
      console.log('[Vayentra DB] Migration 002_student_enrollment_batch_management completed successfully.');
    }

    // 4. Migration 003: Persistent Student Attendance System (Phase 3)
    const applied003 = db.prepare('SELECT id FROM migrations WHERE name = ?').get('003_persistent_student_attendance');
    if (!applied003) {
      console.log('[Vayentra DB] Applying migration 003_persistent_student_attendance...');

      // Backup-safe: Create a copy of the database before running Phase 3 DDL
      if (fs.existsSync(DB_PATH)) {
        try {
          const backupFile = path.join(__dirname, `vayentra.sqlite.backup-mig003-${Date.now()}`);
          fs.copyFileSync(DB_PATH, backupFile);
          console.log(`[Vayentra DB] Pre-migration backup safely created at: ${backupFile}`);
        } catch (backupErr) {
          console.warn('[Vayentra DB] Note: Pre-migration backup warning:', backupErr.message);
        }
      }

      // 4.1 Create batch_sessions table
      db.exec(`
        CREATE TABLE IF NOT EXISTS batch_sessions (
          id TEXT PRIMARY KEY,
          batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
          session_date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          topic TEXT,
          status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
          teacher_id TEXT REFERENCES teachers(id) ON DELETE SET NULL,
          notes TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(batch_id, session_date, start_time)
        );
        CREATE INDEX IF NOT EXISTS idx_batch_sessions_batch_date ON batch_sessions(batch_id, session_date);
        CREATE INDEX IF NOT EXISTS idx_batch_sessions_date ON batch_sessions(session_date);
      `);

      // 4.2 Create attendance_records table with composite unique constraint (duplicate protection)
      db.exec(`
        CREATE TABLE IF NOT EXISTS attendance_records (
          id TEXT PRIMARY KEY,
          session_id TEXT NOT NULL REFERENCES batch_sessions(id) ON DELETE CASCADE,
          batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
          student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
          marked_by_user_id TEXT NOT NULL REFERENCES users(id),
          remarks TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(session_id, student_id)
        );
        CREATE INDEX IF NOT EXISTS idx_attendance_records_student ON attendance_records(student_id);
        CREATE INDEX IF NOT EXISTS idx_attendance_records_batch ON attendance_records(batch_id);
        CREATE INDEX IF NOT EXISTS idx_attendance_records_session ON attendance_records(session_id);
      `);

      // 4.3 Create attendance_audit_logs table
      db.exec(`
        CREATE TABLE IF NOT EXISTS attendance_audit_logs (
          id TEXT PRIMARY KEY,
          attendance_record_id TEXT NOT NULL,
          session_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          previous_status TEXT,
          new_status TEXT NOT NULL,
          changed_by_user_id TEXT NOT NULL REFERENCES users(id),
          change_reason TEXT,
          timestamp TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_attendance_audit_logs_session ON attendance_audit_logs(session_id);
        CREATE INDEX IF NOT EXISTS idx_attendance_audit_logs_student ON attendance_audit_logs(student_id);
      `);

      // 4.4 Ensure full class cohort for Class 7-A (matching prototype students)
      const guardian = db.prepare("SELECT id FROM guardians LIMIT 1").get();
      const guardianId = guardian ? guardian.id : 'par-001';

      const sampleClassmates = [
        { id: 'stu-diya', name: 'Diya Patel', grade: 7, board: 'CBSE', enrollment_number: 'VG-2026-0101' },
        { id: 'stu-kavya', name: 'Kavya Rao', grade: 7, board: 'CBSE', enrollment_number: 'VG-2026-0102' },
        { id: 'stu-rohan', name: 'Rohan Sharma', grade: 7, board: 'CBSE', enrollment_number: 'VG-2026-0103' },
        { id: 'stu-zoya', name: 'Zoya Khan', grade: 7, board: 'CBSE', enrollment_number: 'VG-2026-0104' }
      ];

      const insertClassmate = db.prepare(`
        INSERT OR IGNORE INTO students (
          id, guardian_id, name, avatar, grade, board, medium, school_name,
          child_pin, daily_time_limit_mins, minutes_used_today, bedtime_lock,
          has_consent, consent_timestamp, streak_days, stars_earned, points,
          status, enrollment_number
        ) VALUES (?, ?, ?, '🦉', ?, ?, 'English', 'National Public School, Bengaluru', '1234', 45, 15, '21:30', 1, datetime('now'), 3, 25, 800, 'active', ?)
      `);

      const enrollClassmate = db.prepare(`
        INSERT OR IGNORE INTO batch_enrollments (id, student_id, batch_id, status, notes)
        VALUES (?, ?, 'batch-7a-cbse-math', 'active', 'Academic Batch 7-A Roster')
      `);

      sampleClassmates.forEach((cm, idx) => {
        insertClassmate.run(cm.id, guardianId, cm.name, cm.grade, cm.board, cm.enrollment_number);
        enrollClassmate.run(`enr-7a-${cm.id}`, cm.id);
      });

      // 4.5 Seed historical completed sessions for Class 7-A
      const teacher = db.prepare("SELECT id FROM teachers WHERE id = 'tch-001'").get();
      const teacherId = teacher ? teacher.id : null;
      const teacherUser = db.prepare("SELECT id FROM users WHERE email = 'teacher@vayentra.org'").get();
      const teacherUserId = teacherUser ? teacherUser.id : 'usr-teacher-01';

      const pastSessions = [
        { id: 'ses-7a-1014', date: '2026-10-14', topic: 'Integers & Number Line Basics', status: 'completed' },
        { id: 'ses-7a-1016', date: '2026-10-16', topic: 'Integer Multiplication & Distribution', status: 'completed' },
        { id: 'ses-7a-1021', date: '2026-10-21', topic: 'Division Rules & Word Problems', status: 'completed' },
        { id: 'ses-7a-1023', date: '2026-10-23', topic: 'Fractions: Addition & Mixed Numbers', status: 'completed' },
        { id: 'ses-7a-1028', date: '2026-10-28', topic: 'Rational Numbers & Practical Applications', status: 'completed' },
        { id: 'ses-7a-cancelled', date: '2026-10-19', topic: 'State Holiday (Karnataka Rajyotsava Prep)', status: 'cancelled' },
        { id: 'ses-7a-future', date: '2026-11-04', topic: 'Linear Equations in One Variable', status: 'scheduled' }
      ];

      const insertSession = db.prepare(`
        INSERT OR IGNORE INTO batch_sessions (id, batch_id, session_date, start_time, end_time, topic, status, teacher_id)
        VALUES (?, 'batch-7a-cbse-math', ?, '17:30', '18:30', ?, ?, ?)
      `);

      for (const ses of pastSessions) {
        insertSession.run(ses.id, ses.date, ses.topic, ses.status, teacherId);
      }

      // 4.6 Seed attendance records for the completed sessions
      // Completed sessions: ses-7a-1014, ses-7a-1016, ses-7a-1021, ses-7a-1023, ses-7a-1028
      // Cancelled and future sessions must NOT have completed attendance or be factored into eligible calculations.
      const attendanceMatrix = [
        // Aarav Varma (stu-001): 4 present, 1 late => 5 attended, 0 absent => 100%
        { sessionId: 'ses-7a-1014', studentId: 'stu-001', status: 'present', remarks: 'On time, active participant' },
        { sessionId: 'ses-7a-1016', studentId: 'stu-001', status: 'present', remarks: 'Good grasp of integer signs' },
        { sessionId: 'ses-7a-1021', studentId: 'stu-001', status: 'late', remarks: 'Joined 8 mins late with note' },
        { sessionId: 'ses-7a-1023', studentId: 'stu-001', status: 'present', remarks: 'Solved board problem correctly' },
        { sessionId: 'ses-7a-1028', studentId: 'stu-001', status: 'present', remarks: 'Mastered concept checkpoint' },

        // Diya Patel: 4 present, 1 absent => 80%
        { sessionId: 'ses-7a-1014', studentId: 'stu-diya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1016', studentId: 'stu-diya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1021', studentId: 'stu-diya', status: 'absent', remarks: 'Unexcused absence' },
        { sessionId: 'ses-7a-1023', studentId: 'stu-diya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1028', studentId: 'stu-diya', status: 'present', remarks: '' },

        // Kavya Rao: 5 present => 100%
        { sessionId: 'ses-7a-1014', studentId: 'stu-kavya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1016', studentId: 'stu-kavya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1021', studentId: 'stu-kavya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1023', studentId: 'stu-kavya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1028', studentId: 'stu-kavya', status: 'present', remarks: '' },

        // Rohan Sharma: 3 present, 1 absent, 1 excused => 3 / (3+1) = 75%
        { sessionId: 'ses-7a-1014', studentId: 'stu-rohan', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1016', studentId: 'stu-rohan', status: 'excused', remarks: 'Medical leave approved by guardian' },
        { sessionId: 'ses-7a-1021', studentId: 'stu-rohan', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1023', studentId: 'stu-rohan', status: 'absent', remarks: 'Unreported absence' },
        { sessionId: 'ses-7a-1028', studentId: 'stu-rohan', status: 'present', remarks: '' },

        // Zoya Khan: 4 present, 1 late => 100%
        { sessionId: 'ses-7a-1014', studentId: 'stu-zoya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1016', studentId: 'stu-zoya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1021', studentId: 'stu-zoya', status: 'present', remarks: '' },
        { sessionId: 'ses-7a-1023', studentId: 'stu-zoya', status: 'late', remarks: 'Traffic delay' },
        { sessionId: 'ses-7a-1028', studentId: 'stu-zoya', status: 'present', remarks: '' }
      ];

      const insertAttRecord = db.prepare(`
        INSERT OR IGNORE INTO attendance_records (id, session_id, batch_id, student_id, status, marked_by_user_id, remarks)
        VALUES (?, ?, 'batch-7a-cbse-math', ?, ?, ?, ?)
      `);

      const insertAuditLog = db.prepare(`
        INSERT OR IGNORE INTO attendance_audit_logs (id, attendance_record_id, session_id, student_id, previous_status, new_status, changed_by_user_id, change_reason)
        VALUES (?, ?, ?, ?, NULL, ?, ?, 'Initial faculty roster submission')
      `);

      attendanceMatrix.forEach((item, index) => {
        const recordId = `rec-att-${item.sessionId}-${item.studentId}`;
        insertAttRecord.run(recordId, item.sessionId, item.studentId, item.status, teacherUserId, item.remarks);
        insertAuditLog.run(`aud-${Date.now()}-${index}`, recordId, item.sessionId, item.studentId, item.status, teacherUserId);
      });

      db.prepare('INSERT INTO migrations (name) VALUES (?)').run('003_persistent_student_attendance');
      console.log('[Vayentra DB] Migration 003_persistent_student_attendance completed successfully.');
    }

    // 5. Migration 004: Homework & Weekly Concept Assessments (Phase 4)
    const applied004 = db.prepare('SELECT id FROM migrations WHERE name = ?').get('004_homework_weekly_assessments');
    if (!applied004) {
      console.log('[Vayentra DB] Applying migration 004_homework_weekly_assessments...');

      if (fs.existsSync(DB_PATH)) {
        try {
          const backupFile = path.join(__dirname, `vayentra.sqlite.backup-mig004-${Date.now()}`);
          fs.copyFileSync(DB_PATH, backupFile);
          console.log(`[Vayentra DB] Pre-migration backup safely created at: ${backupFile}`);
        } catch (backupErr) {
          console.warn('[Vayentra DB] Note: Pre-migration backup warning:', backupErr.message);
        }
      }

      // 5.1 Create homework_assignments table
      db.exec(`
        CREATE TABLE IF NOT EXISTS homework_assignments (
          id TEXT PRIMARY KEY,
          teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
          batch_id TEXT REFERENCES batches(id) ON DELETE CASCADE,
          target_student_id TEXT REFERENCES students(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          description TEXT NOT NULL,
          due_date TEXT NOT NULL,
          chapter_id TEXT REFERENCES chapters(id) ON DELETE SET NULL,
          learning_resources_json TEXT NOT NULL DEFAULT '[]',
          status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'closed')),
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_homework_batch ON homework_assignments(batch_id);
        CREATE INDEX IF NOT EXISTS idx_homework_target_student ON homework_assignments(target_student_id);
        CREATE INDEX IF NOT EXISTS idx_homework_due_date ON homework_assignments(due_date);
      `);

      // 5.2 Create homework_submissions table
      db.exec(`
        CREATE TABLE IF NOT EXISTS homework_submissions (
          id TEXT PRIMARY KEY,
          homework_id TEXT NOT NULL REFERENCES homework_assignments(id) ON DELETE CASCADE,
          student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          submission_text TEXT NOT NULL,
          attachment_url TEXT,
          status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'resubmission_requested')),
          score REAL,
          max_score REAL DEFAULT 100,
          teacher_feedback TEXT,
          reviewed_by_user_id TEXT REFERENCES users(id),
          submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
          reviewed_at TEXT,
          UNIQUE(homework_id, student_id)
        );
        CREATE INDEX IF NOT EXISTS idx_homework_subs_student ON homework_submissions(student_id);
        CREATE INDEX IF NOT EXISTS idx_homework_subs_hw ON homework_submissions(homework_id);
      `);

      // 5.3 Create weekly_assessments table
      db.exec(`
        CREATE TABLE IF NOT EXISTS weekly_assessments (
          id TEXT PRIMARY KEY,
          batch_id TEXT NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
          teacher_id TEXT NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          subject TEXT NOT NULL,
          assessment_date TEXT NOT NULL,
          max_score REAL NOT NULL DEFAULT 50,
          passing_score REAL NOT NULL DEFAULT 35,
          topics_covered_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_weekly_assessments_batch ON weekly_assessments(batch_id);
      `);

      // 5.4 Create assessment_scores table
      db.exec(`
        CREATE TABLE IF NOT EXISTS assessment_scores (
          id TEXT PRIMARY KEY,
          assessment_id TEXT NOT NULL REFERENCES weekly_assessments(id) ON DELETE CASCADE,
          student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
          score REAL NOT NULL,
          percentage REAL NOT NULL,
          teacher_feedback TEXT NOT NULL,
          areas_needing_revision_json TEXT NOT NULL DEFAULT '[]',
          next_learning_recommendation TEXT NOT NULL,
          recorded_by_user_id TEXT NOT NULL REFERENCES users(id),
          recorded_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(assessment_id, student_id)
        );
        CREATE INDEX IF NOT EXISTS idx_assessment_scores_student ON assessment_scores(student_id);
        CREATE INDEX IF NOT EXISTS idx_assessment_scores_assessment ON assessment_scores(assessment_id);
      `);

      // 5.5 Seed sample homework & assessment records
      const teacher = db.prepare("SELECT id FROM teachers WHERE id = 'tch-001'").get();
      const teacherId = teacher ? teacher.id : 'tch-001';
      const teacherUser = db.prepare("SELECT id FROM users WHERE email = 'teacher@vayentra.org'").get();
      const teacherUserId = teacherUser ? teacherUser.id : 'usr-teacher-01';

      // HW 1: Active batch homework due in future
      const hw1 = {
        id: 'hw-7a-int-drill',
        teacher_id: teacherId,
        batch_id: 'batch-7a-cbse-math',
        target_student_id: null,
        title: 'Integer Multiplication & Division Drill',
        subject: 'Mathematics',
        description: 'Complete word problems 1 through 10 from the problem set. Write detailed steps showing sign rules and distributive law application.',
        due_date: '2026-11-05',
        chapter_id: 'chap-math-01',
        learning_resources_json: JSON.stringify([
          { title: 'Chapter 1: Integers & Real-World Operations', url: '/school/chapters', type: 'concept_notes' },
          { title: 'Flashcards: Integer Sign Rules', url: '/school/practice/flashcards', type: 'flashcards' }
        ])
      };

      // HW 2: Individual homework for stu-001
      const hw2 = {
        id: 'hw-stu001-challenge',
        teacher_id: teacherId,
        batch_id: null,
        target_student_id: 'stu-001',
        title: 'Advanced Prime Factorization & GCD Exploration',
        subject: 'Mathematics',
        description: 'Solve the 3 bonus challenge questions exploring Euclid algorithm for GCD using prime trees.',
        due_date: '2026-11-08',
        chapter_id: 'chap-math-01',
        learning_resources_json: JSON.stringify([
          { title: 'Olympiad Mathematics Foundation', url: '/school/catalogue', type: 'resource' }
        ])
      };

      // HW 3: Overdue homework for Batch 7-A
      const hw3 = {
        id: 'hw-7a-bodmas-intro',
        teacher_id: teacherId,
        batch_id: 'batch-7a-cbse-math',
        target_student_id: null,
        title: 'Diagnostic Worksheet: BODMAS Order of Operations',
        subject: 'Mathematics',
        description: 'Practice evaluating expressions with nested parentheses, brackets, and negative exponents.',
        due_date: '2026-10-20',
        chapter_id: 'chap-math-01',
        learning_resources_json: JSON.stringify([])
      };

      const insertHw = db.prepare(`
        INSERT OR IGNORE INTO homework_assignments (
          id, teacher_id, batch_id, target_student_id, title, subject, description, due_date, chapter_id, learning_resources_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertHw.run(hw1.id, hw1.teacher_id, hw1.batch_id, hw1.target_student_id, hw1.title, hw1.subject, hw1.description, hw1.due_date, hw1.chapter_id, hw1.learning_resources_json);
      insertHw.run(hw2.id, hw2.teacher_id, hw2.batch_id, hw2.target_student_id, hw2.title, hw2.subject, hw2.description, hw2.due_date, hw2.chapter_id, hw2.learning_resources_json);
      insertHw.run(hw3.id, hw3.teacher_id, hw3.batch_id, hw3.target_student_id, hw3.title, hw3.subject, hw3.description, hw3.due_date, hw3.chapter_id, hw3.learning_resources_json);

      // Seed submissions:
      // stu-001 submitted hw1 (reviewed) and hw3 (reviewed)
      const insertSub = db.prepare(`
        INSERT OR IGNORE INTO homework_submissions (
          id, homework_id, student_id, submission_text, status, score, max_score, teacher_feedback, reviewed_by_user_id, submitted_at, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'), datetime('now', '-1 day'))
      `);

      insertSub.run(
        'sub-hw1-stu001',
        hw1.id,
        'stu-001',
        'Submitted 10 word problems with complete steps: 1) (-15) * 4 = -60. 2) (-12) / (-3) = 4. All distributive property proofs written.',
        'reviewed',
        95,
        100,
        'Flawless working steps Aarav! Clear understanding of integer sign rules.',
        teacherUserId
      );

      insertSub.run(
        'sub-hw3-stu001',
        hw3.id,
        'stu-001',
        'Solved all diagnostic brackets: (15 - (-3)) * 2 = 36.',
        'reviewed',
        90,
        100,
        'Good grasp of bracket precedence.',
        teacherUserId
      );

      // Seed Weekly Concept Assessments:
      const insertWkAssessment = db.prepare(`
        INSERT OR IGNORE INTO weekly_assessments (
          id, batch_id, teacher_id, title, subject, assessment_date, max_score, passing_score, topics_covered_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertScore = db.prepare(`
        INSERT OR IGNORE INTO assessment_scores (
          id, assessment_id, student_id, score, percentage, teacher_feedback, areas_needing_revision_json, next_learning_recommendation, recorded_by_user_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      // Assessment 1
      insertWkAssessment.run(
        'wka-7a-wk1',
        'batch-7a-cbse-math',
        teacherId,
        'Week 2 Concept Mastery Check: Negative Integers on Number Line',
        'Mathematics',
        '2026-10-17',
        50,
        35,
        JSON.stringify(['Absolute Value', 'Number Line Representation', 'Additive Inverse'])
      );

      insertScore.run(
        'sc-wka1-stu001',
        'wka-7a-wk1',
        'stu-001',
        44,
        88,
        'Demonstrates solid conceptual grasp of integers. Quick mental calculations.',
        JSON.stringify(['Subtraction of double negative numbers']),
        'Solve 5 multi-step word problems involving temperature drops and elevation changes.',
        teacherUserId
      );

      // Assessment 2
      insertWkAssessment.run(
        'wka-7a-wk2',
        'batch-7a-cbse-math',
        teacherId,
        'Week 3 Concept Mastery Check: Multiplication & Division Properties',
        'Mathematics',
        '2026-10-24',
        50,
        35,
        JSON.stringify(['Distributive Property', 'Commutative Law', 'Word Problems'])
      );

      insertScore.run(
        'sc-wka2-stu001',
        'wka-7a-wk2',
        'stu-001',
        47,
        94,
        'Exemplary performance! Mastered distributive property across positive and negative operands.',
        JSON.stringify(['Nested curly bracket evaluation']),
        'Advance to Chapter 2 Rational Numbers & Decimals with confidence.',
        teacherUserId
      );

      db.prepare('INSERT INTO migrations (name) VALUES (?)').run('004_homework_weekly_assessments');
      console.log('[Vayentra DB] Migration 004_homework_weekly_assessments completed successfully.');
    }

    // 6. Migration 005: Parent Communication, Notifications & Reporting
    const applied005 = db.prepare('SELECT id FROM migrations WHERE name = ?').get('005_parent_communication_reporting');
    if (!applied005) {
      console.log('[Vayentra DB] Applying migration 005_parent_communication_reporting...');

      try {
        const backupFile = path.join(__dirname, `vayentra.sqlite.backup-mig005-${Date.now()}`);
        fs.copyFileSync(DB_PATH, backupFile);
        console.log(`[Vayentra DB] Pre-migration backup safely created at: ${backupFile}`);
      } catch (backupErr) {
        console.warn('[Vayentra DB] Note: Pre-migration backup warning:', backupErr.message);
      }

      // 6.1 Guardian Communication Preferences
      db.exec(`
        CREATE TABLE IF NOT EXISTS guardian_preferences (
          guardian_id TEXT PRIMARY KEY,
          notify_whatsapp INTEGER NOT NULL DEFAULT 1,
          notify_sms INTEGER NOT NULL DEFAULT 1,
          notify_email INTEGER NOT NULL DEFAULT 1,
          preferred_language TEXT NOT NULL DEFAULT 'English',
          alert_on_absence INTEGER NOT NULL DEFAULT 1,
          alert_on_homework INTEGER NOT NULL DEFAULT 1,
          alert_on_reports INTEGER NOT NULL DEFAULT 1,
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE
        );
      `);

      // 6.2 Notifications Log (with truthful delivery statuses)
      db.exec(`
        CREATE TABLE IF NOT EXISTS notifications (
          id TEXT PRIMARY KEY,
          guardian_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          channel TEXT NOT NULL,
          template_name TEXT NOT NULL,
          recipient_contact TEXT NOT NULL,
          message_content TEXT NOT NULL,
          status TEXT NOT NULL,
          status_reason TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          sent_at TEXT,
          FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );
        CREATE INDEX IF NOT EXISTS idx_notifications_guardian ON notifications(guardian_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_student ON notifications(student_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);
      `);

      // 6.3 Institute Notices (Academic, Schedule, Holiday, Administrative)
      db.exec(`
        CREATE TABLE IF NOT EXISTS institute_notices (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          content TEXT NOT NULL,
          target_grade INTEGER,
          target_board TEXT,
          is_published INTEGER NOT NULL DEFAULT 1,
          published_at TEXT NOT NULL DEFAULT (datetime('now')),
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_notices_published ON institute_notices(is_published, published_at);
      `);

      // Seed guardian preferences for existing guardians
      db.exec(`
        INSERT OR IGNORE INTO guardian_preferences (guardian_id, notify_whatsapp, notify_sms, notify_email, preferred_language, alert_on_absence, alert_on_homework, alert_on_reports)
        SELECT id, 1, 1, 1, 'English', 1, 1, 1 FROM guardians;
      `);

      // Seed Institute Notices
      const insertNotice = db.prepare(`
        INSERT OR IGNORE INTO institute_notices (id, title, category, content, target_grade, target_board, is_published, published_at)
        VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
      `);

      insertNotice.run(
        'notice-01',
        'Science Fair & Hands-On Concept Exhibition 2026',
        'Academic',
        'Gurukula students of Classes 6–10 will present their hands-on science and mathematics working models on Saturday, 14th November 2026. Parents are cordially invited from 10:00 AM to 1:00 PM.',
        null,
        null
      );

      insertNotice.run(
        'notice-02',
        'Term 1 Mathematics Revision Clinics (CBSE)',
        'Academic',
        'Special interactive revision clinics for Integers, Algebraic Expressions, and Geometry will be held on weekday evenings starting next Monday. Open to Class 7 CBSE students.',
        7,
        'CBSE'
      );

      insertNotice.run(
        'notice-03',
        'Kannada Rajyotsava Celebration & Holiday Schedule',
        'Holiday',
        'The tuition academy will remain closed on 1st November on account of Kannada Rajyotsava. Extra learning practice packs are available on the student portal.',
        null,
        null
      );

      insertNotice.run(
        'notice-04',
        'Parent-Faculty Consultation Meet: Term 1 Concept Progress',
        'Administrative',
        'One-on-one pedagogical consultations with subject mentors will take place virtually and in-center on Saturday, 7th November. Please confirm time slots via the portal.',
        null,
        null
      );

      // Seed initial sample notification with truthful 'not_sent' state
      const insertNotif = db.prepare(`
        INSERT OR IGNORE INTO notifications (id, guardian_id, student_id, channel, template_name, recipient_contact, message_content, status, status_reason, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      insertNotif.run(
        'notif-init-001',
        'par-001',
        'stu-001',
        'whatsapp',
        'weekly_mastery_report',
        '+91 98450 99999',
        "Namaskara Parent, Aarav Varma's weekly concept mastery report is published. Score: 94%. Teacher prescription: Advance to Chapter 2 Rational Numbers & Decimals with confidence.",
        'not_sent',
        'Messaging gateway unconfigured in this environment. Simulated delivery prohibited.',
        '2026-10-24 18:30:00'
      );

      db.prepare('INSERT INTO migrations (name) VALUES (?)').run('005_parent_communication_reporting');
      console.log('[Vayentra DB] Migration 005_parent_communication_reporting completed successfully.');
    }


    // 7. Migration 006: Vayentra Learning Compass - teacher-guided diagnostic pilot.
    // The question set is a DRAFT until a qualified teacher reviews and publishes it.
    // No real student answers are seeded or backfilled.
    const applied006 = db.prepare('SELECT id FROM migrations WHERE name = ?').get('006_learning_compass_pilot');
    if (!applied006) {
      console.log('[Vayentra DB] Applying migration 006_learning_compass_pilot...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS student_user_links (
          user_id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL UNIQUE,
          linked_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS diagnostic_forms (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 10),
          board TEXT NOT NULL,
          subject TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          published_at TEXT
        );
        CREATE TABLE IF NOT EXISTS diagnostic_items (
          id TEXT PRIMARY KEY,
          form_id TEXT NOT NULL,
          concept_id TEXT NOT NULL,
          stem TEXT NOT NULL,
          options_json TEXT NOT NULL,
          correct_index INTEGER NOT NULL CHECK(correct_index BETWEEN 0 AND 3),
          misconception_codes_json TEXT NOT NULL,
          explanation TEXT NOT NULL,
          position INTEGER NOT NULL,
          FOREIGN KEY (form_id) REFERENCES diagnostic_forms(id) ON DELETE CASCADE,
          UNIQUE(form_id, position)
        );
        CREATE TABLE IF NOT EXISTS diagnostic_attempts (
          id TEXT PRIMARY KEY,
          form_id TEXT NOT NULL,
          student_id TEXT NOT NULL,
          correct_count INTEGER NOT NULL,
          question_count INTEGER NOT NULL,
          submitted_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(form_id, student_id),
          FOREIGN KEY (form_id) REFERENCES diagnostic_forms(id),
          FOREIGN KEY (student_id) REFERENCES students(id)
        );
        CREATE TABLE IF NOT EXISTS diagnostic_responses (
          attempt_id TEXT NOT NULL,
          item_id TEXT NOT NULL,
          selected_index INTEGER NOT NULL,
          is_correct INTEGER NOT NULL,
          misconception_code TEXT,
          PRIMARY KEY (attempt_id, item_id),
          FOREIGN KEY (attempt_id) REFERENCES diagnostic_attempts(id) ON DELETE CASCADE,
          FOREIGN KEY (item_id) REFERENCES diagnostic_items(id)
        );
        CREATE TABLE IF NOT EXISTS diagnostic_learning_plans (
          attempt_id TEXT PRIMARY KEY,
          teacher_user_id TEXT NOT NULL,
          focus_concepts_json TEXT NOT NULL,
          teacher_notes TEXT NOT NULL,
          approved_at TEXT NOT NULL DEFAULT (datetime('now')),
          FOREIGN KEY (attempt_id) REFERENCES diagnostic_attempts(id) ON DELETE CASCADE,
          FOREIGN KEY (teacher_user_id) REFERENCES users(id)
        );
        CREATE INDEX IF NOT EXISTS idx_diag_items_form ON diagnostic_items(form_id, position);
        CREATE INDEX IF NOT EXISTS idx_diag_attempts_student ON diagnostic_attempts(student_id, submitted_at);
        CREATE INDEX IF NOT EXISTS idx_diag_attempts_form ON diagnostic_attempts(form_id);
      `);

      // Explicitly link the known existing synthetic student account.
      // Real enrollments require an administrator-controlled verified linking workflow.
      db.prepare(`
        INSERT OR IGNORE INTO student_user_links(user_id, student_id)
        SELECT u.id, s.id FROM users u CROSS JOIN students s
        WHERE u.email='student@vayentra.org' AND u.role='student' AND s.id='stu-001'
      `).run();

      db.prepare(`
        INSERT INTO diagnostic_forms (id, title, grade, board, subject, status)
        VALUES ('vg-lc-7-cbse-math-v1', 'Class 7 Mathematics: Learning Compass Baseline', 7, 'CBSE', 'Mathematics', 'draft')
      `).run();

      const items = [
        ['lc-q1','integer-signs','Which number is smaller: -7 or -2?',
          ['-2','-7','They are equal','Both are positive'],1,
          ['ORDER_NEGATIVE','', 'COMPARE_EQUAL','SIGN_VALUE'],
          'On a number line, -7 lies to the left of -2.'],
        ['lc-q2','integer-signs','Evaluate: 12 - (-5).',
          ['7','-17','17','-7'],2,
          ['DOUBLE_NEGATIVE','SIGN_SUBTRACTION','','SIGN_SUBTRACTION'],
          'Subtracting a negative is the same as adding: 12 + 5 = 17.'],
        ['lc-q3','multiplication-signs','Evaluate: (-4) × (-3).',
          ['-12','12','-7','7'],1,
          ['PRODUCT_SIGNS','','ADD_INSTEAD','SIGN_CONFUSION'],
          'Multiplying two negatives produces a positive: 12.'],
        ['lc-q4','multiplication-signs','Evaluate: (-24) ÷ (-6).',
          ['-4','-18','4','18'],2,
          ['QUOTIENT_SIGNS','ADD_INSTEAD','','SIGN_CONFUSION'],
          'Dividing two negatives produces a positive: 4.'],
        ['lc-q5','order-of-operations','Evaluate: 5 + 2 × 3.',
          ['21','11','13','30'],1,
          ['LEFT_TO_RIGHT','','ADDITION_FIRST','MULTIPLY_ALL'],
          'Multiplication comes before addition: 5 + 6 = 11.'],
        ['lc-q6','order-of-operations','Evaluate: (18 - 6) ÷ 3.',
          ['16','4','6','12'],1,
          ['DIVIDE_FIRST','','BRACKET_ERROR','SKIP_DIVISION'],
          'Calculate the bracket first: 12 ÷ 3 = 4.'],
        ['lc-q7','equation-formation','Solve: 3x + 5 = 20. Find x.',
          ['15','5','25','7'],1,
          ['NO_DIVISION','','ADD_INSTEAD','EQUATION_BALANCE'],
          'Subtract 5 and divide by 3: x = (20 - 5)/3 = 5.'],
        ['lc-q8','equation-formation','A number is tripled, then 5 is added, giving 20. Which equation expresses this?',
          ['3(x + 5) = 20','x + 3 + 5 = 20','3x + 5 = 20','5x + 3 = 20'],2,
          ['BRACKET_TRANSLATION','WORD_TO_SYMBOL','','COEFFICIENT_SWAP'],
          'Tripled means 3x. Then adding five gives 3x + 5 = 20.']
      ];

      const insertItem = db.prepare(`
        INSERT INTO diagnostic_items (id, form_id, concept_id, stem, options_json, correct_index, misconception_codes_json, explanation, position)
        VALUES (?, 'vg-lc-7-cbse-math-v1', ?, ?, ?, ?, ?, ?, ?)
      `);
      items.forEach(([id, concept, stem, options, correct, tags, explanation], index) =>
        insertItem.run(id, concept, stem, JSON.stringify(options), correct, JSON.stringify(tags), explanation, index + 1)
      );
      db.prepare('INSERT INTO migrations (name) VALUES (?)').run('006_learning_compass_pilot');
      console.log('[Vayentra DB] Migration 006_learning_compass_pilot completed (DRAFT item bank; no student data).');
    }


    // 007 — Verified-reference CBSE learning and original video production catalogue.
    // No NCERT material is copied, hosted, deep-linked or represented as permission-cleared.
    const applied007=db.prepare("SELECT id FROM migrations WHERE name='007_cbse_ncert_video_library'").get();
    if(!applied007){
      db.exec(`
        CREATE TABLE IF NOT EXISTS cbse_subject_sources(
          id TEXT PRIMARY KEY,
          grade INTEGER NOT NULL CHECK (grade BETWEEN 1 AND 10),
          board TEXT NOT NULL DEFAULT 'CBSE' CHECK(board='CBSE'),
          subject TEXT NOT NULL,
          publisher TEXT NOT NULL DEFAULT 'NCERT',
          source_portal TEXT NOT NULL DEFAULT 'NCERT official textbook catalogue',
          source_url TEXT NOT NULL DEFAULT 'https://ncert.nic.in/textbook.php',
          source_status TEXT NOT NULL DEFAULT 'reference_only_permission_pending'
            CHECK(source_status IN ('reference_only_permission_pending','approved_for_linking')),
          curriculum_status TEXT NOT NULL DEFAULT 'needs_academic_review'
            CHECK(curriculum_status IN ('needs_academic_review','verified')),
          academic_year TEXT NOT NULL DEFAULT '2026-27',
          verified_by_user_id TEXT REFERENCES users(id),
          verified_at TEXT,
          UNIQUE(grade,subject,academic_year)
        );
        CREATE TABLE IF NOT EXISTS cbse_topics(
          id TEXT PRIMARY KEY,
          source_id TEXT NOT NULL REFERENCES cbse_subject_sources(id),
          chapter_title TEXT NOT NULL,
          topic_title TEXT NOT NULL,
          concept_description TEXT,
          lesson_order INTEGER NOT NULL DEFAULT 1,
          status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
          reviewed_by_user_id TEXT REFERENCES users(id),
          reviewed_at TEXT,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(source_id,chapter_title,topic_title)
        );
        CREATE TABLE IF NOT EXISTS cbse_lesson_videos(
          id TEXT PRIMARY KEY,
          topic_id TEXT NOT NULL UNIQUE REFERENCES cbse_topics(id),
          origin TEXT NOT NULL DEFAULT 'vayentra_original',
          production_status TEXT NOT NULL DEFAULT 'not_started'
            CHECK(production_status IN ('not_started','script_draft','teacher_review','ready','archived')),
          script_outline TEXT,
          media_url TEXT,
          media_type TEXT CHECK(media_type IS NULL OR media_type IN ('mp4','webm')),
          duration_seconds INTEGER CHECK(duration_seconds IS NULL OR duration_seconds BETWEEN 10 AND 3600),
          reviewed_by_user_id TEXT REFERENCES users(id),
          reviewed_at TEXT,
          published_at TEXT,
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_cbse_topics_source ON cbse_topics(source_id,status);
        CREATE INDEX IF NOT EXISTS idx_cbse_video_status ON cbse_lesson_videos(production_status);
      `);
      const insertSource=db.prepare(`
        INSERT OR IGNORE INTO cbse_subject_sources(id,grade,subject)
        VALUES(?,?,?)
      `);
      Object.entries(CBSE_SUBJECTS_BY_GRADE).forEach(([grade,subjects])=>{
        subjects.forEach(subject=>{
          const slug=subject.toLowerCase().replace(/[^a-z0-9]+/g,'-');
          insertSource.run('cbse-'+grade+'-'+slug,Number(grade),subject);
        });
      });
      // Pilot topics are drafts and must be checked against the current textbooks.
      const insertTopic=db.prepare(`
        INSERT OR IGNORE INTO cbse_topics(id,source_id,chapter_title,topic_title,concept_description,lesson_order)
        VALUES(?,?,?,?,?,?)
      `);
      const pilot=[
        ['signed-numbers','Integers and Rational Numbers','Ordering negative numbers','Use an original number-line animation to explain position and value.'],
        ['subtract-negative','Integers and Rational Numbers','Subtracting a negative number','Use examples involving height and temperature without reproducing textbook diagrams.'],
        ['order-operations','Expressions and Equations','Order of operations','Illustrate brackets and operation precedence with original visual examples.'],
        ['form-equations','Expressions and Equations','Forming equations from word problems','Translate a practical word problem into a linear equation.']
      ];
      pilot.forEach(([id,chapter,topic,description],i)=>{
        const topicId='cbse7math-'+id;
        insertTopic.run(topicId,'cbse-7-mathematics',chapter,topic,description,i+1);
        db.prepare(`
          INSERT OR IGNORE INTO cbse_lesson_videos(id,topic_id,production_status)
          VALUES(?,?,'not_started')
        `).run('vid-'+topicId,topicId);
      });
      db.prepare("INSERT INTO migrations(name) VALUES('007_cbse_ncert_video_library')").run();
      console.log('[Vayentra DB] CBSE NCERT source references and unpublished AI video pilot created.');
    }


    // 008 — Two ORIGINAL Class 10 CBSE video lessons and misconception checks.
    // Seed drafts only: video URL stays NULL until human review and hosting.
    const applied008=db.prepare("SELECT id FROM migrations WHERE name='008_class10_original_video_pilots'").get();
    if(!applied008){
      db.exec(`
        CREATE TABLE IF NOT EXISTS cbse_topic_practice_items(
          id TEXT PRIMARY KEY,
          topic_id TEXT NOT NULL REFERENCES cbse_topics(id),
          question TEXT NOT NULL,
          options_json TEXT NOT NULL,
          correct_index INTEGER NOT NULL CHECK(correct_index BETWEEN 0 AND 3),
          explanation TEXT NOT NULL,
          misconception_code TEXT NOT NULL,
          position INTEGER NOT NULL,
          status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','published','archived')),
          UNIQUE(topic_id,position)
        );
        CREATE INDEX IF NOT EXISTS idx_cbse_topic_practice ON cbse_topic_practice_items(topic_id,status);
      `);
      const insertTopic=db.prepare(`
        INSERT OR IGNORE INTO cbse_topics
          (id,source_id,chapter_title,topic_title,concept_description,lesson_order,status)
        VALUES(?,?,?,?,?,?,'draft')
      `);
      const insertVideo=db.prepare(`
        INSERT OR IGNORE INTO cbse_lesson_videos
          (id,topic_id,origin,production_status,script_outline)
        VALUES (?,?,'vayentra_original','teacher_review',?)
      `);
      const insertPractice=db.prepare(`
        INSERT OR IGNORE INTO cbse_topic_practice_items
          (id,topic_id,question,options_json,correct_index,explanation,misconception_code,position,status)
        VALUES(?,?,?,?,?,?,?,?,'draft')
      `);
      CLASS10_PILOT_LESSONS.forEach((lesson,idx)=>{
        insertTopic.run(lesson.topicId,lesson.sourceId,lesson.chapterTitle,lesson.topicTitle,lesson.learningObjective,idx+1);
        const script=lesson.scenes.map((scene,i)=>
          'Scene '+(i+1)+': '+scene.title+'\\nScreen: '+scene.visual+'\\nCaption: '+scene.caption+'\\nVoiceover: '+scene.narration
        ).join('\\n\\n');
        insertVideo.run('video-'+lesson.topicId,lesson.topicId,script);
        lesson.quiz.forEach((question,i)=>{
          insertPractice.run(question.id,lesson.topicId,question.question,JSON.stringify(question.options),
            question.correctIndex,question.explanation,question.misconceptionCode,i+1);
        });
      });
      db.prepare("INSERT INTO migrations(name) VALUES('008_class10_original_video_pilots')").run();
      console.log('[Vayentra DB] Class 10 original Maths & Science video + quiz DRAFTS created.');
    }


    // 009 — Four additional ORIGINAL Class 10 Maths/Science lesson and question drafts.
    // Migration is idempotent; no student data is read, overwritten or seeded.
    if(!db.prepare("SELECT id FROM migrations WHERE name='009_class10_four_original_lessons'").get()){
      const insertTopic=db.prepare(`
        INSERT OR IGNORE INTO cbse_topics
        (id,source_id,chapter_title,topic_title,concept_description,lesson_order,status)
        VALUES(?,?,?,?,?,?,'draft')
      `);
      const insertVideo=db.prepare(`
        INSERT OR IGNORE INTO cbse_lesson_videos
        (id,topic_id,origin,production_status,script_outline)
        VALUES(?,?,'vayentra_original','teacher_review',?)
      `);
      const insertQuiz=db.prepare(`
        INSERT OR IGNORE INTO cbse_topic_practice_items
        (id,topic_id,question,options_json,correct_index,explanation,misconception_code,position,status)
        VALUES(?,?,?,?,?,?,?,?,'draft')
      `);
      CLASS10_NEXT_LESSON_BATCH.forEach((lesson,index)=>{
        insertTopic.run(lesson.id,lesson.sourceId,lesson.chapter,lesson.topic,lesson.objective,index+10);
        const script='Original Vayentra teacher-review storyboard.\\n'
          +lesson.storyboard.map((scene,i)=>'Scene '+(i+1)+': '+scene).join('\\n')
          +'\\nUse the separate narrated MP4 and transcript teacher-review pack to verify exact words and timing.';
        insertVideo.run('video-'+lesson.id,lesson.id,script);
        lesson.questions.forEach((q,i)=>{
          insertQuiz.run(q.id,lesson.id,q.question,JSON.stringify(q.options),q.correctIndex,
            q.explanation,q.misconceptionCode,i+1);
        });
      });
      db.prepare("INSERT INTO migrations(name) VALUES('009_class10_four_original_lessons')").run();
      console.log('[Vayentra DB] Added 4 additional Class 10 original lesson drafts and 12 draft questions.');
    }


    // 010 — Guardian-only admissions enquiries. No child names or student records.
    if(!db.prepare("SELECT id FROM migrations WHERE name='010_guardian_admission_enquiries'").get()){
      db.exec(`
        CREATE TABLE IF NOT EXISTS admission_enquiries(
          id TEXT PRIMARY KEY,
          guardian_name TEXT NOT NULL,
          contact_phone TEXT NOT NULL,
          contact_email TEXT,
          grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 10),
          board TEXT NOT NULL CHECK(board IN ('CBSE','STATE')),
          message TEXT,
          consent_at TEXT NOT NULL DEFAULT (datetime('now')),
          status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','contacted','closed')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS idx_admission_enquiries_status_created
          ON admission_enquiries(status,created_at DESC);
      `);
      db.prepare("INSERT INTO migrations(name) VALUES('010_guardian_admission_enquiries')").run();
      console.log('[Vayentra DB] Guardian-only admissions enquiry inbox prepared.');
    }


    // 011: Vayentra ONE longitudinal learner spine.
    // No changes to current student grade, existing marks, attendance, guardians or fee plans.
    const exists011=db.prepare("SELECT id FROM migrations WHERE name='011_vayentra_one_longitudinal_spine'").get();
    if(!exists011){
      db.exec(`
        CREATE TABLE IF NOT EXISTS one_memberships (
          student_id TEXT PRIMARY KEY REFERENCES students(id) ON DELETE CASCADE,
          guardian_id TEXT NOT NULL REFERENCES guardians(id),
          initial_grade INTEGER NOT NULL CHECK(initial_grade BETWEEN 1 AND 10),
          initial_year TEXT NOT NULL CHECK(length(initial_year)=7),
          target_grade INTEGER NOT NULL DEFAULT 10 CHECK(target_grade=10),
          membership_status TEXT NOT NULL DEFAULT 'pending_consent'
            CHECK(membership_status IN ('pending_consent','active','paused','graduated','withdrawn')),
          entitlement_status TEXT NOT NULL DEFAULT 'not_configured'
            CHECK(entitlement_status IN ('not_configured','pending','enabled','expired')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
        CREATE INDEX IF NOT EXISTS one_memberships_guardian ON one_memberships(guardian_id);

        CREATE TABLE IF NOT EXISTS one_consent_reviews (
          student_id TEXT PRIMARY KEY REFERENCES one_memberships(student_id) ON DELETE CASCADE,
          guardian_id TEXT NOT NULL REFERENCES guardians(id),
          notice_version TEXT NOT NULL,
          verification_method TEXT NOT NULL CHECK(verification_method IN
            ('verified_in_person','verified_parent_records','verified_digilocker')),
          evidence_reference TEXT NOT NULL,
          verified_by TEXT NOT NULL REFERENCES users(id),
          verified_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS one_academic_years (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL REFERENCES one_memberships(student_id) ON DELETE CASCADE,
          academic_year TEXT NOT NULL CHECK(length(academic_year)=7),
          grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 10),
          board TEXT NOT NULL CHECK(board IN ('CBSE','STATE')),
          status TEXT NOT NULL DEFAULT 'pending'
            CHECK(status IN ('pending','active','completed','withdrawn')),
          started_at TEXT,
          completed_at TEXT,
          UNIQUE(student_id,academic_year)
        );
        CREATE UNIQUE INDEX IF NOT EXISTS one_year_active_unique
          ON one_academic_years(student_id) WHERE status='active';

        CREATE TABLE IF NOT EXISTS one_mark_entries (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL REFERENCES one_memberships(student_id) ON DELETE CASCADE,
          academic_year_id TEXT NOT NULL REFERENCES one_academic_years(id) ON DELETE CASCADE,
          subject TEXT NOT NULL CHECK(length(subject) BETWEEN 2 AND 80),
          exam_label TEXT NOT NULL CHECK(length(exam_label) BETWEEN 2 AND 80),
          marks_obtained REAL NOT NULL CHECK(marks_obtained>=0),
          marks_maximum REAL NOT NULL CHECK(marks_maximum>0 AND marks_maximum<=1000),
          evidence_status TEXT NOT NULL DEFAULT 'self_reported'
            CHECK(evidence_status IN ('self_reported','school_verified')),
          verified_by TEXT REFERENCES users(id),
          verified_at TEXT,
          created_by TEXT NOT NULL REFERENCES users(id),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          CHECK(marks_obtained<=marks_maximum)
        );
        CREATE INDEX IF NOT EXISTS one_marks_year ON one_mark_entries(academic_year_id);
        CREATE INDEX IF NOT EXISTS one_marks_student ON one_mark_entries(student_id);

        -- Metadata-only vault: binary upload requires approved encrypted object storage.
        CREATE TABLE IF NOT EXISTS one_document_metadata (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL REFERENCES one_memberships(student_id) ON DELETE CASCADE,
          academic_year_id TEXT REFERENCES one_academic_years(id),
          document_kind TEXT NOT NULL CHECK(document_kind IN
            ('mark_card','school_report','identity_support','other')),
          original_name TEXT NOT NULL,
          storage_key TEXT UNIQUE NOT NULL,
          file_sha256 TEXT NOT NULL,
          file_size_bytes INTEGER NOT NULL CHECK(file_size_bytes>0),
          review_status TEXT NOT NULL DEFAULT 'quarantined'
            CHECK(review_status IN ('quarantined','available','rejected')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          reviewed_at TEXT
        );

        CREATE TABLE IF NOT EXISTS one_curriculum_tracks (
          id TEXT PRIMARY KEY,
          board TEXT NOT NULL CHECK(board IN ('CBSE','STATE')),
          grade INTEGER NOT NULL CHECK(grade BETWEEN 1 AND 10),
          edition_year TEXT NOT NULL,
          medium TEXT NOT NULL DEFAULT 'English',
          publisher_reference TEXT NOT NULL,
          catalogue_status TEXT NOT NULL DEFAULT 'needs_teacher_mapping'
            CHECK(catalogue_status IN ('needs_teacher_mapping','in_review','verified')),
          verified_at TEXT,
          UNIQUE(board,grade,edition_year,medium)
        );
        CREATE TABLE IF NOT EXISTS one_subjects (
          id TEXT PRIMARY KEY,
          track_id TEXT NOT NULL REFERENCES one_curriculum_tracks(id) ON DELETE CASCADE,
          subject_title TEXT NOT NULL,
          review_status TEXT NOT NULL DEFAULT 'draft'
            CHECK(review_status IN ('draft','reviewed')),
          UNIQUE(track_id,subject_title)
        );
        CREATE TABLE IF NOT EXISTS one_chapters (
          id TEXT PRIMARY KEY,
          subject_id TEXT NOT NULL REFERENCES one_subjects(id) ON DELETE CASCADE,
          chapter_number INTEGER NOT NULL CHECK(chapter_number>=1),
          chapter_title TEXT NOT NULL,
          textbook_edition TEXT NOT NULL,
          review_status TEXT NOT NULL DEFAULT 'draft'
            CHECK(review_status IN ('draft','reviewed')),
          UNIQUE(subject_id,chapter_number,textbook_edition)
        );
        CREATE TABLE IF NOT EXISTS one_concepts (
          id TEXT PRIMARY KEY,
          chapter_id TEXT NOT NULL REFERENCES one_chapters(id) ON DELETE CASCADE,
          position INTEGER NOT NULL CHECK(position>=1),
          title TEXT NOT NULL,
          explanation_original TEXT,
          prerequisite_concept_id TEXT REFERENCES one_concepts(id),
          misconception_tip TEXT,
          content_status TEXT NOT NULL DEFAULT 'draft'
            CHECK(content_status IN ('draft','teacher_review','published')),
          reviewer_id TEXT REFERENCES users(id),
          reviewed_at TEXT,
          UNIQUE(chapter_id,position)
        );
        CREATE TABLE IF NOT EXISTS one_concept_assets (
          id TEXT PRIMARY KEY,
          concept_id TEXT NOT NULL REFERENCES one_concepts(id) ON DELETE CASCADE,
          asset_type TEXT NOT NULL CHECK(asset_type IN
            ('original_video','diagram','worksheet','practice','teacher_note')),
          asset_location TEXT,
          status TEXT NOT NULL DEFAULT 'draft'
            CHECK(status IN ('draft','teacher_review','published')),
          verified_by TEXT REFERENCES users(id),
          verified_at TEXT
        );
        CREATE TABLE IF NOT EXISTS one_concept_mastery (
          student_id TEXT NOT NULL REFERENCES one_memberships(student_id) ON DELETE CASCADE,
          concept_id TEXT NOT NULL REFERENCES one_concepts(id) ON DELETE CASCADE,
          mastery TEXT NOT NULL DEFAULT 'not_started'
            CHECK(mastery IN ('not_started','practising','needs_help','teacher_confirmed')),
          teacher_id TEXT REFERENCES users(id),
          updated_at TEXT NOT NULL DEFAULT (datetime('now')),
          PRIMARY KEY(student_id,concept_id)
        );
        CREATE TABLE IF NOT EXISTS one_journey_audit (
          id TEXT PRIMARY KEY,
          actor_user_id TEXT NOT NULL REFERENCES users(id),
          student_id TEXT NOT NULL REFERENCES students(id),
          action TEXT NOT NULL,
          detail_code TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);

      // Every class/board pair exists as a DRAFT catalogue shell, not as fabricated course material.
      const seedTrack=db.prepare(`
        INSERT OR IGNORE INTO one_curriculum_tracks
         (id,board,grade,edition_year,medium,publisher_reference)
        VALUES(?,?,?,'2026-27','English',?)
      `);
      for(const board of ['CBSE','STATE']){
        for(let grade=1;grade<=10;grade++){
          seedTrack.run('one-2026-'+board.toLowerCase()+'-'+grade,board,grade,
            board==='CBSE'?'NCERT / CBSE official academic reference':'Karnataka Textbook Society official academic reference');
        }
      }
      db.prepare("INSERT INTO migrations(name) VALUES('011_vayentra_one_longitudinal_spine')").run();
      console.log('[Vayentra ONE] Longitudinal student identity and 20 draft board/class catalogue shells created.');
    }

    db.exec('COMMIT;');
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Vayentra DB] Migration failed:', err);
    throw err;
  }
}
