import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { getTelecomGatewayStatus, sendWhatsAppViaMetaCloudApi, sendSmsViaTelecomGateway } from '../services/messaging.js';

export const adminRouter = Router();

// Protect ALL admin routes with authenticateToken and requireRole('admin')
adminRouter.use(authenticateToken);
adminRouter.use(requireRole(['admin']));

/**
 * Schedule Conflict Detector: Determines whether two batches have overlapping day and time slots
 */
export function checkScheduleConflict(batchA, batchB) {
  const parseDays = (val) => {
    if (Array.isArray(val)) return val;
    try {
      return JSON.parse(val || '[]');
    } catch {
      return [];
    }
  };

  const daysA = parseDays(batchA.days_of_week_json || batchA.daysOfWeek);
  const daysB = parseDays(batchB.days_of_week_json || batchB.daysOfWeek);

  const commonDays = daysA.filter(d => daysB.includes(d));
  if (commonDays.length === 0) return false;

  const startA = batchA.start_time || batchA.startTime;
  const endA = batchA.end_time || batchA.endTime;
  const startB = batchB.start_time || batchB.startTime;
  const endB = batchB.end_time || batchB.endTime;

  return startA < endB && startB < endA;
}

// ========================================================
// 1. STUDENTS MANAGEMENT
// ========================================================

/**
 * GET /api/v1/admin/students - Search and list students with guardian & batch counts
 */
adminRouter.get('/students', (req, res) => {
  const { search = '', grade, board, status } = req.query;

  try {
    let query = `
      SELECT 
        s.*,
        g.parent_pin,
        g.subscription_status,
        g.plan_name,
        g.emergency_phone,
        u.name AS guardian_name,
        u.email AS guardian_email,
        u.mobile AS guardian_mobile,
        (SELECT COUNT(*) FROM batch_enrollments e WHERE e.student_id = s.id AND e.status = 'active') AS active_batches_count
      FROM students s
      JOIN guardians g ON s.guardian_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search.trim()) {
      query += ` AND (LOWER(s.name) LIKE ? OR LOWER(s.enrollment_number) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term, term);
    }

    if (grade) {
      query += ` AND s.grade = ?`;
      params.push(Number(grade));
    }

    if (board) {
      query += ` AND s.board = ?`;
      params.push(board);
    }

    if (status) {
      query += ` AND s.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY s.grade ASC, s.name ASC`;

    const students = db.prepare(query).all(...params);

    res.json({
      success: true,
      total: students.length,
      students: students.map(s => ({
        id: s.id,
        enrollmentNumber: s.enrollment_number,
        name: s.name,
        avatar: s.avatar,
        grade: s.grade,
        board: s.board,
        medium: s.medium,
        schoolName: s.school_name,
        status: s.status,
        dob: s.dob,
        notes: s.notes,
        streakDays: s.streak_days,
        starsEarned: s.stars_earned,
        points: s.points,
        activeBatchesCount: s.active_batches_count,
        guardian: {
          id: s.guardian_id,
          name: s.guardian_name,
          email: s.guardian_email,
          mobile: s.guardian_mobile,
          emergencyPhone: s.emergency_phone,
          subscriptionStatus: s.subscription_status,
          planName: s.plan_name
        }
      }))
    });
  } catch (err) {
    console.error('[Admin Students Fetch Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch student roster.' });
  }
});

/**
 * POST /api/v1/admin/students - Register new student & link to guardian atomically
 */
adminRouter.post('/students', (req, res) => {
  const {
    name,
    grade,
    board = 'CBSE',
    medium = 'English',
    schoolName = 'Vayentra Gurukula Academy',
    guardianId,
    guardianName,
    guardianEmail,
    guardianPhone,
    dob,
    notes,
    initialBatchIds = []
  } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Student name is required.' });
  }

  const numGrade = Number(grade);
  if (!numGrade || numGrade < 1 || numGrade > 10) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Grade must be an integer between 1 and 10.' });
  }

  const allowedBoards = ['CBSE', 'STATE_KARNATAKA', 'ICSE'];
  if (!allowedBoards.includes(board)) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: `Board must be one of: ${allowedBoards.join(', ')}.` });
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    let resolvedGuardianId = guardianId;

    // If no existing guardianId provided, link or create by email/phone
    if (!resolvedGuardianId) {
      if (!guardianEmail && !guardianPhone) {
        db.exec('ROLLBACK;');
        return res.status(400).json({
          code: 'VALIDATION_ERROR',
          message: 'Either an existing guardianId or guardian contact details (email / phone) are required.'
        });
      }

      // Check if user already exists
      let user = db.prepare('SELECT * FROM users WHERE (email = ? AND email IS NOT NULL) OR (mobile = ? AND mobile IS NOT NULL)').get(guardianEmail || null, guardianPhone || null);

      if (!user) {
        const newUserId = `usr-par-${Date.now()}`;
        const defaultPwdHash = bcrypt.hashSync('Gurukula@2026', 10);
        db.prepare(`
          INSERT INTO users (id, email, mobile, name, role, password_hash)
          VALUES (?, ?, ?, ?, 'parent', ?)
        `).run(newUserId, guardianEmail || null, guardianPhone || null, guardianName || 'Guardian', defaultPwdHash);

        user = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId);
      }

      // Check if guardian record exists for this user
      let guardian = db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(user.id);
      if (!guardian) {
        resolvedGuardianId = `par-${Date.now()}`;
        db.prepare(`
          INSERT INTO guardians (id, user_id, parent_pin, subscription_status, plan_name, emergency_phone)
          VALUES (?, ?, '1234', 'Active', 'Annual Gurukula Pro + AI Tutor', ?)
        `).run(resolvedGuardianId, user.id, guardianPhone || '+91 98450 12345');
      } else {
        resolvedGuardianId = guardian.id;
      }
    } else {
      // Validate that provided guardianId exists
      const existingG = db.prepare('SELECT id FROM guardians WHERE id = ?').get(resolvedGuardianId);
      if (!existingG) {
        db.exec('ROLLBACK;');
        return res.status(400).json({ code: 'INVALID_GUARDIAN', message: 'Specified guardianId does not exist.' });
      }
    }

    // Generate unique student ID and enrollment number
    const studentId = `stu-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const countRow = db.prepare('SELECT COUNT(*) as count FROM students').get();
    const enrollmentNumber = `VG-2026-${String(countRow.count + 1).padStart(4, '0')}`;

    db.prepare(`
      INSERT INTO students (
        id, enrollment_number, guardian_id, name, avatar, grade, board, medium,
        school_name, status, dob, notes, child_pin, daily_time_limit_mins, bedtime_lock, has_consent
      ) VALUES (?, ?, ?, ?, '🦊', ?, ?, ?, ?, 'active', ?, ?, '0000', 45, '21:30', 1)
    `).run(
      studentId,
      enrollmentNumber,
      resolvedGuardianId,
      name.trim(),
      numGrade,
      board,
      medium,
      schoolName,
      dob || null,
      notes || null
    );

    // Enroll in initial batches if requested (with conflict detection)
    const enrolledBatches = [];
    if (Array.isArray(initialBatchIds) && initialBatchIds.length > 0) {
      for (const batchId of initialBatchIds) {
        const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);
        if (!batch) {
          db.exec('ROLLBACK;');
          return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: `Batch '${batchId}' not found.` });
        }

        if (batch.status !== 'active') {
          db.exec('ROLLBACK;');
          return res.status(400).json({ code: 'BATCH_INACTIVE', message: `Batch '${batch.name}' is archived or inactive.` });
        }

        // Check capacity
        const enrolledCount = db.prepare("SELECT COUNT(*) as count FROM batch_enrollments WHERE batch_id = ? AND status = 'active'").get(batchId).count;
        if (enrolledCount >= batch.max_capacity) {
          db.exec('ROLLBACK;');
          return res.status(409).json({ code: 'BATCH_FULL', message: `Batch '${batch.name}' has reached capacity (${batch.max_capacity}).` });
        }

        // Check conflict with already processed initial batches
        for (const prevBatch of enrolledBatches) {
          if (checkScheduleConflict(prevBatch, batch)) {
            db.exec('ROLLBACK;');
            return res.status(409).json({
              code: 'STUDENT_SCHEDULE_CONFLICT',
              message: `Schedule conflict: '${batch.name}' clashes with '${prevBatch.name}'.`
            });
          }
        }

        const enrId = `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        db.prepare(`
          INSERT INTO batch_enrollments (id, student_id, batch_id, status, notes)
          VALUES (?, ?, ?, 'active', 'Initial batch enrollment')
        `).run(enrId, studentId, batchId);

        enrolledBatches.push(batch);
      }
    }

    db.exec('COMMIT;');

    const createdStudent = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);

    res.status(201).json({
      success: true,
      message: `Student ${name} successfully registered with Enrollment Number ${enrollmentNumber}.`,
      student: createdStudent,
      guardianId: resolvedGuardianId,
      enrolledBatches: enrolledBatches.map(b => ({ id: b.id, name: b.name }))
    });
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Admin Student Register Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to register student.' });
  }
});

/**
 * GET /api/v1/admin/students/:id - Fetch student details with active batches
 */
adminRouter.get('/students/:id', (req, res) => {
  const { id } = req.params;
  try {
    const student = db.prepare(`
      SELECT 
        s.*,
        u.name AS guardian_name,
        u.email AS guardian_email,
        u.mobile AS guardian_mobile,
        g.emergency_phone
      FROM students s
      JOIN guardians g ON s.guardian_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE s.id = ?
    `).get(id);

    if (!student) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student record not found.' });
    }

    const enrollments = db.prepare(`
      SELECT 
        e.id AS enrollment_id,
        e.status AS enrollment_status,
        e.enrolled_at,
        b.id AS batch_id,
        b.name AS batch_name,
        b.grade,
        b.board,
        b.subject,
        b.start_time,
        b.end_time,
        b.days_of_week_json,
        b.room,
        u.name AS teacher_name
      FROM batch_enrollments e
      JOIN batches b ON e.batch_id = b.id
      LEFT JOIN teachers t ON b.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE e.student_id = ?
      ORDER BY e.enrolled_at DESC
    `).all(id);

    res.json({
      success: true,
      student,
      enrollments: enrollments.map(e => ({
        enrollmentId: e.enrollment_id,
        status: e.enrollment_status,
        enrolledAt: e.enrolled_at,
        batch: {
          id: e.batch_id,
          name: e.batch_name,
          grade: e.grade,
          board: e.board,
          subject: e.subject,
          startTime: e.start_time,
          endTime: e.end_time,
          daysOfWeek: JSON.parse(e.days_of_week_json || '[]'),
          room: e.room,
          teacherName: e.teacher_name || 'Unassigned'
        }
      }))
    });
  } catch (err) {
    console.error('[Admin Student Fetch Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch student details.' });
  }
});

/**
 * PATCH /api/v1/admin/students/:id/status - Toggle student active/inactive
 */
adminRouter.patch('/students/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'transferred', 'graduated'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const student = db.prepare('SELECT id, name FROM students WHERE id = ?').get(id);
    if (!student) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Student not found.' });
    }

    db.prepare('UPDATE students SET status = ? WHERE id = ?').run(status, id);

    res.json({
      success: true,
      message: `Student ${student.name} status updated to ${status}.`,
      status
    });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to update student status.' });
  }
});

// ========================================================
// 2. TEACHERS MANAGEMENT
// ========================================================

/**
 * GET /api/v1/admin/teachers - List all teachers with user details and assigned batches
 */
adminRouter.get('/teachers', (req, res) => {
  const { search = '', status } = req.query;

  try {
    let query = `
      SELECT 
        t.*,
        u.name,
        u.email,
        u.avatar,
        (SELECT COUNT(*) FROM batches b WHERE b.teacher_id = t.id AND b.status = 'active') AS active_batch_count
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search.trim()) {
      query += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(t.specialization) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (status) {
      query += ` AND t.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY u.name ASC`;

    const teachers = db.prepare(query).all(...params);

    res.json({
      success: true,
      total: teachers.length,
      teachers: teachers.map(t => ({
        id: t.id,
        userId: t.user_id,
        name: t.name,
        email: t.email,
        avatar: t.avatar,
        qualification: t.qualification,
        specialization: t.specialization,
        phone: t.phone,
        status: t.status,
        activeBatchCount: t.active_batch_count,
        createdAt: t.created_at
      }))
    });
  } catch (err) {
    console.error('[Admin Teachers Fetch Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch teachers.' });
  }
});

/**
 * POST /api/v1/admin/teachers - Create a new faculty member account
 */
adminRouter.post('/teachers', (req, res) => {
  const {
    name,
    email,
    qualification = 'B.Ed, Subject Certified',
    specialization = 'Concept Mastery',
    phone,
    password = 'Gurukula@2026'
  } = req.body;

  if (!name || !name.trim() || !email || !email.trim()) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Faculty name and institutional email are required.' });
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR (mobile = ? AND mobile IS NOT NULL)').get(email.trim(), phone || null);
    if (existing) {
      db.exec('ROLLBACK;');
      return res.status(409).json({ code: 'USER_EXISTS', message: 'An account with this email or mobile already exists.' });
    }

    const userId = `usr-tch-${Date.now()}`;
    const teacherId = `tch-${Date.now()}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    db.prepare(`
      INSERT INTO users (id, email, name, role, mobile, password_hash)
      VALUES (?, ?, ?, 'teacher', ?, ?)
    `).run(userId, email.trim().toLowerCase(), name.trim(), phone || null, passwordHash);

    db.prepare(`
      INSERT INTO teachers (id, user_id, qualification, specialization, phone, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(teacherId, userId, qualification, specialization, phone || null);

    db.exec('COMMIT;');

    res.status(201).json({
      success: true,
      message: `Teacher account for ${name} created successfully.`,
      teacher: {
        id: teacherId,
        userId,
        name,
        email: email.trim().toLowerCase(),
        qualification,
        specialization,
        status: 'active'
      }
    });
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Admin Teacher Create Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to create teacher account.' });
  }
});

/**
 * GET /api/v1/admin/guardians - Search existing guardians for easy student linking
 */
adminRouter.get('/guardians', (req, res) => {
  const { search = '' } = req.query;
  try {
    let query = `
      SELECT g.id, g.parent_pin, u.name, u.email, u.mobile,
        (SELECT COUNT(*) FROM students s WHERE s.guardian_id = g.id) AS child_count
      FROM guardians g
      JOIN users u ON g.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (search.trim()) {
      query += ` AND (LOWER(u.name) LIKE ? OR LOWER(u.email) LIKE ? OR LOWER(u.mobile) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }
    query += ` ORDER BY u.name ASC LIMIT 50`;

    const guardians = db.prepare(query).all(...params);
    res.json({ success: true, guardians });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch guardians.' });
  }
});

// ========================================================
// 3. BATCHES MANAGEMENT
// ========================================================

/**
 * GET /api/v1/admin/batches - Search and list all batches with teacher & capacity metrics
 */
adminRouter.get('/batches', (req, res) => {
  const { search = '', grade, board, teacherId, status } = req.query;

  try {
    let query = `
      SELECT 
        b.*,
        u.name AS teacher_name,
        u.email AS teacher_email,
        (SELECT COUNT(*) FROM batch_enrollments e WHERE e.batch_id = b.id AND e.status = 'active') AS enrolled_count
      FROM batches b
      LEFT JOIN teachers t ON b.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (search.trim()) {
      query += ` AND (LOWER(b.name) LIKE ? OR LOWER(b.subject) LIKE ? OR LOWER(u.name) LIKE ?)`;
      const term = `%${search.trim().toLowerCase()}%`;
      params.push(term, term, term);
    }

    if (grade) {
      query += ` AND b.grade = ?`;
      params.push(Number(grade));
    }

    if (board) {
      query += ` AND b.board = ?`;
      params.push(board);
    }

    if (teacherId) {
      query += ` AND b.teacher_id = ?`;
      params.push(teacherId);
    }

    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.grade ASC, b.name ASC`;

    const batches = db.prepare(query).all(...params);

    res.json({
      success: true,
      total: batches.length,
      batches: batches.map(b => ({
        id: b.id,
        name: b.name,
        grade: b.grade,
        board: b.board,
        subject: b.subject,
        teacherId: b.teacher_id,
        teacherName: b.teacher_name || 'Unassigned',
        teacherEmail: b.teacher_email || null,
        maxCapacity: b.max_capacity,
        enrolledCount: b.enrolled_count,
        availableSeats: Math.max(0, b.max_capacity - b.enrolled_count),
        isFull: b.enrolled_count >= b.max_capacity,
        status: b.status,
        startTime: b.start_time,
        endTime: b.end_time,
        daysOfWeek: JSON.parse(b.days_of_week_json || '[]'),
        room: b.room,
        createdAt: b.created_at
      }))
    });
  } catch (err) {
    console.error('[Admin Batches Fetch Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch batches.' });
  }
});

/**
 * POST /api/v1/admin/batches - Create a new batch with schedule and teacher validation
 */
adminRouter.post('/batches', (req, res) => {
  const {
    name,
    grade,
    board = 'CBSE',
    subject,
    teacherId,
    maxCapacity = 30,
    startTime,
    endTime,
    daysOfWeek = ['MON', 'WED', 'FRI'],
    room = 'Gurukula Room 1'
  } = req.body;

  if (!name || !name.trim() || !subject || !subject.trim()) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Batch name and subject are required.' });
  }

  const numGrade = Number(grade);
  if (!numGrade || numGrade < 1 || numGrade > 10) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Grade must be between 1 and 10.' });
  }

  const allowedBoards = ['CBSE', 'STATE_KARNATAKA', 'ICSE'];
  if (!allowedBoards.includes(board)) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: `Board must be one of: ${allowedBoards.join(', ')}.` });
  }

  if (!startTime || !endTime) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Both start time and end time (24h format HH:MM) are required.' });
  }

  if (startTime >= endTime) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Start time must be strictly before end time.' });
  }

  if (!Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'At least one day of the week must be selected.' });
  }

  // Validate teacher authorization and schedule conflicts
  if (teacherId) {
    const teacher = db.prepare('SELECT id, status FROM teachers WHERE id = ?').get(teacherId);
    if (!teacher) {
      return res.status(400).json({ code: 'UNAUTHORIZED_TEACHER', message: 'The selected teacher profile does not exist.' });
    }
    if (teacher.status !== 'active') {
      return res.status(400).json({ code: 'UNAUTHORIZED_TEACHER', message: 'The selected teacher is currently inactive or on leave.' });
    }

    // Check teacher conflict across active batches
    const teacherBatches = db.prepare(`
      SELECT * FROM batches WHERE teacher_id = ? AND status = 'active'
    `).all(teacherId);

    const proposedBatch = {
      days_of_week_json: daysOfWeek,
      start_time: startTime,
      end_time: endTime
    };

    for (const tb of teacherBatches) {
      if (checkScheduleConflict(tb, proposedBatch)) {
        return res.status(409).json({
          code: 'TEACHER_SCHEDULE_CONFLICT',
          message: `Teacher conflict: Teacher is already assigned to '${tb.name}' (${tb.start_time}-${tb.end_time}), which overlaps on common days.`,
          conflictingBatch: { id: tb.id, name: tb.name, startTime: tb.start_time, endTime: tb.end_time }
        });
      }
    }
  }

  try {
    const batchId = `batch-${numGrade}-${board.toLowerCase()}-${Date.now().toString(36)}`;
    const daysJson = JSON.stringify(daysOfWeek);

    db.prepare(`
      INSERT INTO batches (
        id, name, grade, board, subject, teacher_id, max_capacity, status,
        start_time, end_time, days_of_week_json, room
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `).run(
      batchId,
      name.trim(),
      numGrade,
      board,
      subject.trim(),
      teacherId || null,
      Number(maxCapacity),
      startTime,
      endTime,
      daysJson,
      room
    );

    const createdBatch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);

    res.status(201).json({
      success: true,
      message: `Batch '${name}' created successfully.`,
      batch: createdBatch
    });
  } catch (err) {
    console.error('[Admin Batch Create Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to create batch.' });
  }
});

/**
 * GET /api/v1/admin/batches/:id - Fetch batch details and enrolled student roster
 */
adminRouter.get('/batches/:id', (req, res) => {
  const { id } = req.params;

  try {
    const batch = db.prepare(`
      SELECT 
        b.*,
        u.name AS teacher_name,
        u.email AS teacher_email,
        t.specialization AS teacher_specialization
      FROM batches b
      LEFT JOIN teachers t ON b.teacher_id = t.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE b.id = ?
    `).get(id);

    if (!batch) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Batch not found.' });
    }

    const students = db.prepare(`
      SELECT 
        s.id,
        s.enrollment_number,
        s.name,
        s.grade,
        s.board,
        s.status AS student_status,
        e.id AS enrollment_id,
        e.status AS enrollment_status,
        e.enrolled_at,
        u.name AS guardian_name,
        u.mobile AS guardian_mobile
      FROM batch_enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN guardians g ON s.guardian_id = g.id
      JOIN users u ON g.user_id = u.id
      WHERE e.batch_id = ? AND e.status = 'active'
      ORDER BY s.name ASC
    `).all(id);

    res.json({
      success: true,
      batch: {
        id: batch.id,
        name: batch.name,
        grade: batch.grade,
        board: batch.board,
        subject: batch.subject,
        teacherId: batch.teacher_id,
        teacherName: batch.teacher_name || 'Unassigned',
        teacherSpecialization: batch.teacher_specialization || null,
        maxCapacity: batch.max_capacity,
        enrolledCount: students.length,
        availableSeats: Math.max(0, batch.max_capacity - students.length),
        status: batch.status,
        startTime: batch.start_time,
        endTime: batch.end_time,
        daysOfWeek: JSON.parse(batch.days_of_week_json || '[]'),
        room: batch.room
      },
      enrolledStudents: students
    });
  } catch (err) {
    console.error('[Admin Batch Details Fetch Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch batch details.' });
  }
});

// ========================================================
// 4. ENROLLMENTS & TRANSFERS
// ========================================================

/**
 * POST /api/v1/admin/batches/:batchId/enroll - Enroll a student in a batch (multi-batch supported)
 */
adminRouter.post('/batches/:batchId/enroll', (req, res) => {
  const { batchId } = req.params;
  const { studentId, notes } = req.body;

  if (!studentId) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'studentId is required.' });
  }

  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    if (!student) {
      return res.status(404).json({ code: 'STUDENT_NOT_FOUND', message: 'Student profile not found.' });
    }

    if (student.status !== 'active') {
      return res.status(400).json({
        code: 'INACTIVE_STUDENT',
        message: `Student '${student.name}' is marked '${student.status}'. Inactive students cannot be enrolled in batches.`
      });
    }

    const batch = db.prepare('SELECT * FROM batches WHERE id = ?').get(batchId);
    if (!batch) {
      return res.status(404).json({ code: 'BATCH_NOT_FOUND', message: 'Batch not found.' });
    }

    if (batch.status !== 'active') {
      return res.status(400).json({ code: 'BATCH_INACTIVE', message: `Batch '${batch.name}' is not currently active.` });
    }

    // Check capacity
    const currentCount = db.prepare("SELECT COUNT(*) as count FROM batch_enrollments WHERE batch_id = ? AND status = 'active'").get(batchId).count;
    if (currentCount >= batch.max_capacity) {
      return res.status(409).json({
        code: 'BATCH_FULL',
        message: `Batch '${batch.name}' is at full capacity (${batch.max_capacity}/${batch.max_capacity}).`
      });
    }

    // Check if student is already enrolled in this exact batch
    const existingEnrollment = db.prepare('SELECT * FROM batch_enrollments WHERE student_id = ? AND batch_id = ?').get(studentId, batchId);
    if (existingEnrollment && existingEnrollment.status === 'active') {
      return res.status(409).json({
        code: 'ALREADY_ENROLLED',
        message: `Student '${student.name}' is already actively enrolled in '${batch.name}'.`
      });
    }

    // Check schedule conflict with student's other active batches
    const studentActiveBatches = db.prepare(`
      SELECT b.* FROM batches b
      JOIN batch_enrollments e ON b.id = e.batch_id
      WHERE e.student_id = ? AND e.status = 'active' AND b.status = 'active' AND b.id != ?
    `).all(studentId, batchId);

    for (const sb of studentActiveBatches) {
      if (checkScheduleConflict(sb, batch)) {
        return res.status(409).json({
          code: 'STUDENT_SCHEDULE_CONFLICT',
          message: `Schedule conflict: Student is already enrolled in '${sb.name}' (${sb.start_time}-${sb.end_time}), which overlaps with '${batch.name}'.`,
          conflictingBatch: { id: sb.id, name: sb.name, startTime: sb.start_time, endTime: sb.end_time }
        });
      }
    }

    // Upsert or insert enrollment
    const enrId = existingEnrollment ? existingEnrollment.id : `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (existingEnrollment) {
      db.prepare(`
        UPDATE batch_enrollments
        SET status = 'active', enrolled_at = datetime('now'), notes = ?
        WHERE id = ?
      `).run(notes || 'Re-enrolled by admin', enrId);
    } else {
      db.prepare(`
        INSERT INTO batch_enrollments (id, student_id, batch_id, status, notes)
        VALUES (?, ?, ?, 'active', ?)
      `).run(enrId, studentId, batchId, notes || 'Enrolled by admin');
    }

    res.status(201).json({
      success: true,
      message: `Student '${student.name}' successfully enrolled in batch '${batch.name}'.`,
      enrollment: {
        id: enrId,
        studentId,
        batchId,
        batchName: batch.name,
        status: 'active'
      }
    });
  } catch (err) {
    console.error('[Admin Batch Enroll Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to enroll student in batch.' });
  }
});

/**
 * POST /api/v1/admin/batches/:batchId/transfer - Transfer a student from one batch to another
 */
adminRouter.post('/batches/:batchId/transfer', (req, res) => {
  const { batchId } = req.params;
  const { studentId, targetBatchId, reason = 'Academic batch transfer' } = req.body;

  if (!studentId || !targetBatchId) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Both studentId and targetBatchId are required.' });
  }

  if (batchId === targetBatchId) {
    return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Current batch and target batch must be different.' });
  }

  db.exec('BEGIN TRANSACTION;');
  try {
    const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
    if (!student) {
      db.exec('ROLLBACK;');
      return res.status(404).json({ code: 'STUDENT_NOT_FOUND', message: 'Student not found.' });
    }

    if (student.status !== 'active') {
      db.exec('ROLLBACK;');
      return res.status(400).json({ code: 'INACTIVE_STUDENT', message: 'Inactive students cannot be transferred.' });
    }

    // Check active enrollment in source batch
    const sourceEnrollment = db.prepare("SELECT * FROM batch_enrollments WHERE student_id = ? AND batch_id = ? AND status = 'active'").get(studentId, batchId);
    if (!sourceEnrollment) {
      db.exec('ROLLBACK;');
      return res.status(404).json({ code: 'NOT_ENROLLED', message: 'Student is not actively enrolled in the source batch.' });
    }

    // Check target batch existence & capacity
    const targetBatch = db.prepare('SELECT * FROM batches WHERE id = ?').get(targetBatchId);
    if (!targetBatch || targetBatch.status !== 'active') {
      db.exec('ROLLBACK;');
      return res.status(404).json({ code: 'TARGET_BATCH_INVALID', message: 'Target batch does not exist or is inactive.' });
    }

    const currentCount = db.prepare("SELECT COUNT(*) as count FROM batch_enrollments WHERE batch_id = ? AND status = 'active'").get(targetBatchId).count;
    if (currentCount >= targetBatch.max_capacity) {
      db.exec('ROLLBACK;');
      return res.status(409).json({ code: 'BATCH_FULL', message: `Target batch '${targetBatch.name}' is full.` });
    }

    // Check schedule conflict with student's other active batches (excluding current source batch!)
    const remainingActiveBatches = db.prepare(`
      SELECT b.* FROM batches b
      JOIN batch_enrollments e ON b.id = e.batch_id
      WHERE e.student_id = ? AND e.status = 'active' AND b.id != ?
    `).all(studentId, batchId);

    for (const rb of remainingActiveBatches) {
      if (checkScheduleConflict(rb, targetBatch)) {
        db.exec('ROLLBACK;');
        return res.status(409).json({
          code: 'STUDENT_SCHEDULE_CONFLICT',
          message: `Transfer conflict: Target batch '${targetBatch.name}' overlaps with existing active batch '${rb.name}'.`
        });
      }
    }

    // 1. Mark source enrollment as transferred
    db.prepare(`
      UPDATE batch_enrollments
      SET status = 'transferred', transferred_to_batch_id = ?, notes = ?
      WHERE id = ?
    `).run(targetBatchId, `Transferred: ${reason}`, sourceEnrollment.id);

    // 2. Create or activate enrollment in target batch
    const existingTargetEnr = db.prepare('SELECT id FROM batch_enrollments WHERE student_id = ? AND batch_id = ?').get(studentId, targetBatchId);
    if (existingTargetEnr) {
      db.prepare(`
        UPDATE batch_enrollments
        SET status = 'active', enrolled_at = datetime('now'), notes = ?
        WHERE id = ?
      `).run(`Transfer from ${batchId}: ${reason}`, existingTargetEnr.id);
    } else {
      const newEnrId = `enr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      db.prepare(`
        INSERT INTO batch_enrollments (id, student_id, batch_id, status, notes)
        VALUES (?, ?, ?, 'active', ?)
      `).run(newEnrId, studentId, targetBatchId, `Transfer from ${batchId}: ${reason}`);
    }

    db.exec('COMMIT;');

    res.json({
      success: true,
      message: `Student '${student.name}' transferred from batch '${batchId}' to '${targetBatch.name}'.`,
      transferredStudent: student.name,
      fromBatchId: batchId,
      toBatch: { id: targetBatch.id, name: targetBatch.name }
    });
  } catch (err) {
    db.exec('ROLLBACK;');
    console.error('[Admin Transfer Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to complete batch transfer.' });
  }
});

/**
 * DELETE /api/v1/admin/batches/:batchId/students/:studentId - Drop student from batch
 */
adminRouter.delete('/batches/:batchId/students/:studentId', (req, res) => {
  const { batchId, studentId } = req.params;

  try {
    const enrollment = db.prepare("SELECT * FROM batch_enrollments WHERE student_id = ? AND batch_id = ? AND status = 'active'").get(studentId, batchId);
    if (!enrollment) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'Active enrollment not found.' });
    }

    db.prepare("UPDATE batch_enrollments SET status = 'dropped', notes = 'Dropped by admin' WHERE id = ?").run(enrollment.id);

    res.json({
      success: true,
      message: 'Student dropped from batch successfully.'
    });
  } catch (err) {
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to drop student from batch.' });
  }
});

// ========================================================
// 4. UPSTREAM TELECOM MESSAGING GATEWAY DIAGNOSTICS
// ========================================================

/**
 * GET /api/v1/admin/messaging/gateway-status - Diagnostic status of upstream SMS & WhatsApp gateways
 */
adminRouter.get('/messaging/gateway-status', (req, res) => {
  try {
    const status = getTelecomGatewayStatus();
    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      gateways: status
    });
  } catch (err) {
    console.error('[Admin Gateway Status Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to query gateway status.' });
  }
});

/**
 * POST /api/v1/admin/messaging/test-dispatch - Diagnostic test ping to upstream telecom gateway
 */
adminRouter.post('/messaging/test-dispatch', async (req, res) => {
  const { channel = 'whatsapp', recipientPhone } = req.body;

  if (!recipientPhone) {
    return res.status(400).json({ code: 'BAD_REQUEST', message: 'recipientPhone is required for diagnostic dispatch.' });
  }

  const testMessage = `Vayentra Gurukula Telecom Diagnostic Ping: Gateway link verified at ${new Date().toLocaleTimeString('en-IN')}.`;

  try {
    if (channel === 'whatsapp') {
      const result = await sendWhatsAppViaMetaCloudApi({ recipientPhone, messageText: testMessage });
      return res.json({
        success: true,
        channel: 'whatsapp',
        message: 'WhatsApp upstream diagnostic ping dispatched successfully.',
        providerMessageId: result.providerMessageId,
        provider: result.provider
      });
    } else if (channel === 'sms') {
      const result = await sendSmsViaTelecomGateway({ recipientPhone, messageText: testMessage });
      return res.json({
        success: true,
        channel: 'sms',
        message: 'SMS upstream diagnostic ping dispatched successfully.',
        providerMessageId: result.providerMessageId,
        provider: result.provider
      });
    } else {
      return res.status(400).json({ code: 'INVALID_CHANNEL', message: 'Channel must be whatsapp or sms.' });
    }
  } catch (err) {
    return res.status(502).json({
      success: false,
      code: 'GATEWAY_DISPATCH_ERROR',
      message: err.message
    });
  }
});
