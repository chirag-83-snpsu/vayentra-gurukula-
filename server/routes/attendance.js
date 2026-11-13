import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, requireRole, requireChildOwnership } from '../middleware/auth.js';
import { triggerAbsenceAlerts } from '../services/messaging.js';

export const attendanceRouter = Router();

const VALID_STATUSES = ['present', 'absent', 'late', 'excused'];

/**
 * Helper: Resolve teacher ID for current user
 */
function getTeacherId(user) {
  if (user.teacherId) return user.teacherId;
  const teacher = db.prepare('SELECT id FROM teachers WHERE user_id = ?').get(user.id);
  return teacher?.id || null;
}

/**
 * Helper: Check if user is authorized to manage a batch
 */
function canManageBatch(user, batchId) {
  if (user.role === 'admin') return true;
  if (user.role === 'teacher') {
    const teacherId = getTeacherId(user);
    const batch = db.prepare('SELECT teacher_id FROM batches WHERE id = ?').get(batchId);
    return batch && batch.teacher_id === teacherId;
  }
  return false;
}

// ==========================================
// 1. Batches Accessible for Attendance
// ==========================================
attendanceRouter.get('/batches', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  try {
    let batches;
    if (req.user.role === 'admin') {
      batches = db.prepare(`
        SELECT b.*, t.specialization, u.name as teacher_name
        FROM batches b
        LEFT JOIN teachers t ON t.id = b.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        WHERE b.status = 'active'
        ORDER BY b.grade ASC, b.name ASC
      `).all();
    } else {
      const teacherId = getTeacherId(req.user);
      batches = db.prepare(`
        SELECT b.*, t.specialization, u.name as teacher_name
        FROM batches b
        LEFT JOIN teachers t ON t.id = b.teacher_id
        LEFT JOIN users u ON u.id = t.user_id
        WHERE b.status = 'active' AND b.teacher_id = ?
        ORDER BY b.grade ASC, b.name ASC
      `).all(teacherId);
    }

    const countEnrolled = db.prepare(`
      SELECT COUNT(*) as count FROM batch_enrollments
      WHERE batch_id = ? AND status = 'active'
    `);

    const result = batches.map(b => ({
      id: b.id,
      name: b.name,
      grade: b.grade,
      board: b.board,
      subject: b.subject,
      teacherId: b.teacher_id,
      teacherName: b.teacher_name || 'Assigned Faculty',
      maxCapacity: b.max_capacity,
      startTime: b.start_time,
      endTime: b.end_time,
      daysOfWeek: JSON.parse(b.days_of_week_json || '[]'),
      room: b.room,
      enrolledCount: countEnrolled.get(b.id).count
    }));

    res.json({ batches: result });
  } catch (err) {
    console.error('[API Error /attendance/batches]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch attendance batches.' });
  }
});

// ==========================================
// 2. Scheduled & Historical Sessions for a Batch
// ==========================================
attendanceRouter.get('/batches/:batchId/sessions', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { batchId } = req.params;
  try {
    if (!canManageBatch(req.user, batchId)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You are not assigned to instruct or manage this batch.'
      });
    }

    const sessions = db.prepare(`
      SELECT bs.*, 
        (SELECT COUNT(*) FROM attendance_records ar WHERE ar.session_id = bs.id) as marked_count,
        (SELECT COUNT(*) FROM batch_enrollments be WHERE be.batch_id = bs.batch_id AND be.status = 'active') as total_enrolled
      FROM batch_sessions bs
      WHERE bs.batch_id = ?
      ORDER BY bs.session_date DESC, bs.start_time DESC
    `).all(batchId);

    res.json({ sessions });
  } catch (err) {
    console.error('[API Error /attendance/batches/:batchId/sessions]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch batch sessions.' });
  }
});

// ==========================================
// 3. Find or Create Session for Batch on Date
// ==========================================
attendanceRouter.post('/sessions/get-or-create', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { batchId, date, startTime, endTime, topic } = req.body;

  if (!batchId || !date) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'batchId and date are required.' });
  }

  try {
    if (!canManageBatch(req.user, batchId)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You are not authorized to create sessions for this batch.'
      });
    }

    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);
    if (!batch) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Batch not found.' });
    }

    const sTime = startTime || batch.start_time || '17:30';
    const eTime = endTime || batch.end_time || '18:30';

    // Check if session already exists for this batch and date
    let session = db.prepare(`
      SELECT * FROM batch_sessions
      WHERE batch_id = ? AND session_date = ?
      ORDER BY start_time ASC
      LIMIT 1
    `).get(batchId, date);

    if (!session) {
      const sessionId = `ses-${batchId.replace(/[^a-zA-Z0-9]/g, '')}-${date.replace(/-/g, '')}-${Date.now().toString(36)}`;
      const teacherId = getTeacherId(req.user) || batch.teacher_id;
      const sessionTopic = topic || `${batch.subject} Academic Session`;

      db.prepare(`
        INSERT INTO batch_sessions (id, batch_id, session_date, start_time, end_time, topic, status, teacher_id)
        VALUES (?, ?, ?, ?, ?, ?, 'completed', ?)
      `).run(sessionId, batchId, date, sTime, eTime, sessionTopic, teacherId);

      session = db.prepare('SELECT * FROM batch_sessions WHERE id = ?').get(sessionId);
    } else if (topic && session.topic !== topic) {
      db.prepare('UPDATE batch_sessions SET topic = ? WHERE id = ?').run(topic, session.id);
      session.topic = topic;
    }

    res.json({ session });
  } catch (err) {
    console.error('[API Error /sessions/get-or-create]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to find or create session.' });
  }
});

// ==========================================
// 4. Session Roster with Existing Attendance
// ==========================================
attendanceRouter.get('/sessions/:sessionId/roster', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = db.prepare(`
      SELECT bs.*, b.name as batch_name, b.grade, b.board, b.subject
      FROM batch_sessions bs
      JOIN batches b ON b.id = bs.batch_id
      WHERE bs.id = ?
    `).get(sessionId);

    if (!session) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Session not found.' });
    }

    if (!canManageBatch(req.user, session.batch_id)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You are not authorized to view the roster for this session.'
      });
    }

    // Load active students enrolled in this batch
    const students = db.prepare(`
      SELECT 
        s.id as student_id,
        s.name,
        s.enrollment_number,
        s.grade,
        s.board,
        s.avatar,
        be.enrolled_at,
        ar.status,
        ar.remarks,
        ar.updated_at,
        u.name as marked_by_name
      FROM batch_enrollments be
      JOIN students s ON s.id = be.student_id
      LEFT JOIN attendance_records ar ON ar.session_id = ? AND ar.student_id = s.id
      LEFT JOIN users u ON u.id = ar.marked_by_user_id
      WHERE be.batch_id = ? AND be.status = 'active' AND s.status = 'active'
      ORDER BY s.name ASC
    `).all(sessionId, session.batch_id);

    const roster = students.map(s => ({
      studentId: s.student_id,
      name: s.name,
      enrollmentNumber: s.enrollment_number,
      grade: s.grade,
      board: s.board,
      avatar: s.avatar,
      status: s.status || null,
      remarks: s.remarks || '',
      updatedAt: s.updated_at || null,
      markedByName: s.marked_by_name || null
    }));

    const summary = {
      totalEnrolled: roster.length,
      marked: roster.filter(r => r.status !== null).length,
      present: roster.filter(r => r.status === 'present').length,
      absent: roster.filter(r => r.status === 'absent').length,
      late: roster.filter(r => r.status === 'late').length,
      excused: roster.filter(r => r.status === 'excused').length,
      pending: roster.filter(r => r.status === null).length
    };

    res.json({ session, roster, summary });
  } catch (err) {
    console.error('[API Error /sessions/:sessionId/roster]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch session roster.' });
  }
});

// ==========================================
// 5. Mark or Correct Session Attendance (Atomic with Audit Log)
// ==========================================
attendanceRouter.post('/sessions/:sessionId/mark', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { sessionId } = req.params;
  const { records, reason } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'records array is required and must not be empty.' });
  }

  try {
    const session = db.prepare('SELECT * FROM batch_sessions WHERE id = ?').get(sessionId);
    if (!session) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Session not found.' });
    }

    if (session.status === 'cancelled') {
      return res.status(400).json({
        code: 'SESSION_CANCELLED',
        message: 'Cannot record or alter attendance for a cancelled session.'
      });
    }

    if (!canManageBatch(req.user, session.batch_id)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You are not authorized to mark attendance for this batch session.'
      });
    }

    // Validate statuses
    for (const rec of records) {
      if (!rec.studentId || !VALID_STATUSES.includes(rec.status)) {
        return res.status(400).json({
          code: 'INVALID_STATUS',
          message: `Student '${rec.studentId}' has invalid status '${rec.status}'. Allowed: ${VALID_STATUSES.join(', ')}`
        });
      }
    }

    // Verify all students belong to batch
    const enrolledStudents = db.prepare(`
      SELECT student_id FROM batch_enrollments
      WHERE batch_id = ? AND status = 'active'
    `).all(session.batch_id).map(r => r.student_id);

    const enrolledSet = new Set(enrolledStudents);
    for (const rec of records) {
      if (!enrolledSet.has(rec.studentId)) {
        return res.status(400).json({
          code: 'STUDENT_NOT_ENROLLED',
          message: `Student '${rec.studentId}' is not actively enrolled in batch '${session.batch_id}'.`
        });
      }
    }

    // Transactional save with duplicate protection and audit log
    db.exec('BEGIN TRANSACTION;');
    try {
      const getExisting = db.prepare('SELECT id, status FROM attendance_records WHERE session_id = ? AND student_id = ?');
      const insertRecord = db.prepare(`
        INSERT INTO attendance_records (id, session_id, batch_id, student_id, status, marked_by_user_id, remarks, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `);
      const updateRecord = db.prepare(`
        UPDATE attendance_records
        SET status = ?, remarks = ?, marked_by_user_id = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      const insertAudit = db.prepare(`
        INSERT INTO attendance_audit_logs (id, attendance_record_id, session_id, student_id, previous_status, new_status, changed_by_user_id, change_reason, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);

      let updatedCount = 0;
      let createdCount = 0;

      for (const rec of records) {
        const existing = getExisting.get(sessionId, rec.studentId);
        const remarks = rec.remarks || '';

        if (existing) {
          if (existing.status !== rec.status) {
            // Status was modified: record audit log
            insertAudit.run(
              `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              existing.id,
              sessionId,
              rec.studentId,
              existing.status,
              rec.status,
              req.user.id,
              reason || 'Faculty correction'
            );
          }
          updateRecord.run(rec.status, remarks, req.user.id, existing.id);
          updatedCount++;
        } else {
          // New attendance record
          const recordId = `rec-att-${sessionId}-${rec.studentId}`;
          insertRecord.run(
            recordId,
            sessionId,
            session.batch_id,
            rec.studentId,
            rec.status,
            req.user.id,
            remarks
          );
          insertAudit.run(
            `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            recordId,
            sessionId,
            rec.studentId,
            null,
            rec.status,
            req.user.id,
            reason || 'Initial roster submission'
          );
          createdCount++;
        }
      }

      // Mark session as completed if it was scheduled
      if (session.status === 'scheduled') {
        db.prepare("UPDATE batch_sessions SET status = 'completed' WHERE id = ?").run(sessionId);
      }

      db.exec('COMMIT;');

      // Phase 5: Trigger Absence Alerts strictly AFTER teacher confirms & commits record
      let alertsQueued = 0;
      const absentStudentIds = records.filter(r => r.status === 'absent').map(r => r.studentId);
      if (absentStudentIds.length > 0) {
        try {
          const batch = db.prepare('SELECT name, subject FROM batches WHERE id = ?').get(session.batch_id);
          const alerts = triggerAbsenceAlerts({
            sessionId,
            date: session.session_date,
            batchName: batch?.name || 'Tuition Batch',
            topic: session.topic || `${batch?.subject || 'Tuition'} Session`,
            absentStudentIds
          });
          alertsQueued = alerts.length;
        } catch (notifErr) {
          console.warn('[Vayentra Attendance] Absence alert dispatch warning:', notifErr.message);
        }
      }

      res.json({
        success: true,
        message: 'Attendance saved and audited successfully.',
        createdCount,
        updatedCount,
        totalProcessed: records.length,
        alertsQueued
      });
    } catch (txErr) {
      db.exec('ROLLBACK;');
      throw txErr;
    }
  } catch (err) {
    console.error('[API Error /sessions/:sessionId/mark]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to record attendance.' });
  }
});

// ==========================================
// 6. Real Student Attendance Summary (Parent / Student Portal)
// ==========================================
attendanceRouter.get('/students/:studentId/summary', authenticateToken, requireChildOwnership, (req, res) => {
  const { studentId } = req.params;

  try {
    const student = db.prepare('SELECT id, name, enrollment_number, grade, board FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student not found.' });
    }

    // Load attendance records ONLY for completed sessions that have actually occurred.
    // Explicitly EXCLUDE cancelled sessions and future/scheduled sessions!
    const records = db.prepare(`
      SELECT 
        ar.id,
        ar.session_id,
        ar.batch_id,
        ar.status,
        ar.remarks,
        ar.updated_at,
        bs.session_date,
        bs.start_time,
        bs.end_time,
        bs.topic,
        b.name as batch_name
      FROM attendance_records ar
      JOIN batch_sessions bs ON bs.id = ar.session_id
      JOIN batches b ON b.id = ar.batch_id
      WHERE ar.student_id = ?
        AND bs.status = 'completed'
        AND bs.session_date <= date('now', 'localtime')
      ORDER BY bs.session_date DESC, bs.start_time DESC
    `).all(studentId);

    const attended = records.filter(r => r.status === 'present' || r.status === 'late').length;
    const present = records.filter(r => r.status === 'present').length;
    const late = records.filter(r => r.status === 'late').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const excused = records.filter(r => r.status === 'excused').length;
    const eligible = attended + absent;
    const percentage = eligible === 0 ? null : Math.round((attended / eligible) * 100);

    res.json({
      student: {
        id: student.id,
        name: student.name,
        enrollmentNumber: student.enrollment_number,
        grade: student.grade,
        board: student.board
      },
      summary: {
        totalCompletedSessions: records.length,
        attended,
        present,
        late,
        absent,
        excused,
        eligible,
        percentage
      },
      recentRecords: records.slice(0, 10)
    });
  } catch (err) {
    console.error('[API Error /students/:studentId/summary]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to calculate student attendance summary.' });
  }
});

// ==========================================
// 7. Monthly Attendance Reporting
// ==========================================
attendanceRouter.get('/reports/monthly', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { batchId } = req.query;

  try {
    let batchFilterClause = '';
    const params = [];

    if (batchId) {
      if (!canManageBatch(req.user, batchId)) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Access denied for this batch.' });
      }
      batchFilterClause = 'AND bs.batch_id = ?';
      params.push(batchId);
    } else if (req.user.role === 'teacher') {
      const teacherId = getTeacherId(req.user);
      batchFilterClause = 'AND b.teacher_id = ?';
      params.push(teacherId);
    }

    // Query attendance aggregated by month
    const rows = db.prepare(`
      SELECT 
        strftime('%Y-%m', bs.session_date) as month,
        COUNT(DISTINCT bs.id) as sessions_held,
        COUNT(ar.id) as total_marks,
        SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN ar.status = 'excused' THEN 1 ELSE 0 END) as excused_count
      FROM batch_sessions bs
      JOIN batches b ON b.id = bs.batch_id
      LEFT JOIN attendance_records ar ON ar.session_id = bs.id
      WHERE bs.status = 'completed'
        AND bs.session_date <= date('now', 'localtime')
        ${batchFilterClause}
      GROUP BY strftime('%Y-%m', bs.session_date)
      ORDER BY month DESC
    `).all(...params);

    const report = rows.map(r => {
      const attended = (r.present_count || 0) + (r.late_count || 0);
      const absent = r.absent_count || 0;
      const eligible = attended + absent;
      const percentage = eligible === 0 ? null : Math.round((attended / eligible) * 100);

      return {
        month: r.month,
        sessionsHeld: r.sessions_held,
        totalMarks: r.total_marks,
        present: r.present_count || 0,
        late: r.late_count || 0,
        absent,
        excused: r.excused_count || 0,
        attended,
        attendancePercent: percentage
      };
    });

    res.json({ report });
  } catch (err) {
    console.error('[API Error /reports/monthly]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to generate monthly attendance report.' });
  }
});

// ==========================================
// 8. Batch-Wise Attendance Reporting
// ==========================================
attendanceRouter.get('/reports/batches', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  try {
    let batches;
    if (req.user.role === 'admin') {
      batches = db.prepare("SELECT * FROM batches WHERE status = 'active' ORDER BY grade ASC, name ASC").all();
    } else {
      const teacherId = getTeacherId(req.user);
      batches = db.prepare("SELECT * FROM batches WHERE status = 'active' AND teacher_id = ? ORDER BY grade ASC, name ASC").all(teacherId);
    }

    const report = batches.map(b => {
      // Completed sessions
      const sessions = db.prepare(`
        SELECT id FROM batch_sessions
        WHERE batch_id = ? AND status = 'completed' AND session_date <= date('now', 'localtime')
      `).all(b.id);

      // Enrolled students
      const enrolled = db.prepare(`
        SELECT s.id, s.name, s.enrollment_number
        FROM batch_enrollments be
        JOIN students s ON s.id = be.student_id
        WHERE be.batch_id = ? AND be.status = 'active' AND s.status = 'active'
        ORDER BY s.name ASC
      `).all(b.id);

      // Student level breakdown
      const studentMetrics = enrolled.map(st => {
        const marks = db.prepare(`
          SELECT ar.status
          FROM attendance_records ar
          JOIN batch_sessions bs ON bs.id = ar.session_id
          WHERE ar.batch_id = ? AND ar.student_id = ? AND bs.status = 'completed' AND bs.session_date <= date('now', 'localtime')
        `).all(b.id, st.id);

        const attended = marks.filter(m => m.status === 'present' || m.status === 'late').length;
        const absent = marks.filter(m => m.status === 'absent').length;
        const excused = marks.filter(m => m.status === 'excused').length;
        const eligible = attended + absent;
        const percentage = eligible === 0 ? null : Math.round((attended / eligible) * 100);

        return {
          studentId: st.id,
          name: st.name,
          enrollmentNumber: st.enrollment_number,
          recordedSessions: marks.length,
          attended,
          absent,
          excused,
          percentage
        };
      });

      // Overall batch aggregate
      const totalAttended = studentMetrics.reduce((sum, s) => sum + s.attended, 0);
      const totalAbsent = studentMetrics.reduce((sum, s) => sum + s.absent, 0);
      const totalEligible = totalAttended + totalAbsent;
      const batchPercent = totalEligible === 0 ? null : Math.round((totalAttended / totalEligible) * 100);

      return {
        batchId: b.id,
        name: b.name,
        grade: b.grade,
        board: b.board,
        subject: b.subject,
        completedSessionsCount: sessions.length,
        enrolledCount: enrolled.length,
        batchAttendancePercent: batchPercent,
        students: studentMetrics
      };
    });

    res.json({ report });
  } catch (err) {
    console.error('[API Error /reports/batches]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to generate batch attendance report.' });
  }
});

// ==========================================
// 9. Attendance Audit Trail
// ==========================================
attendanceRouter.get('/audit-logs', authenticateToken, requireRole(['teacher', 'admin']), (req, res) => {
  const { sessionId, studentId, limit = 50 } = req.query;

  try {
    let whereClauses = [];
    const params = [];

    if (sessionId) {
      whereClauses.push('al.session_id = ?');
      params.push(sessionId);
    }
    if (studentId) {
      whereClauses.push('al.student_id = ?');
      params.push(studentId);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const logs = db.prepare(`
      SELECT 
        al.*,
        u.name as changed_by_name,
        s.name as student_name,
        bs.session_date,
        bs.topic
      FROM attendance_audit_logs al
      JOIN users u ON u.id = al.changed_by_user_id
      JOIN students s ON s.id = al.student_id
      JOIN batch_sessions bs ON bs.id = al.session_id
      ${whereStr}
      ORDER BY al.timestamp DESC
      LIMIT ?
    `).all(...params, Math.min(Number(limit) || 50, 100));

    res.json({ logs });
  } catch (err) {
    console.error('[API Error /attendance/audit-logs]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch attendance audit trail.' });
  }
});
