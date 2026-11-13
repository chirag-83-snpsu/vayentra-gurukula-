import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { ANNUAL_PRICE_INR } from '../services/subscriptionService.js';

export const admissionsRouter = Router();
const recentRequests = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_REQUESTS = 10;

admissionsRouter.use((_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  next();
});

function throttle(ip) {
  const now = Date.now();
  for (const [key, value] of recentRequests) {
    if (value.reset <= now) recentRequests.delete(key);
  }
  let rec = recentRequests.get(ip) || { count: 0, reset: now + WINDOW_MS };
  if (rec.count >= MAX_REQUESTS) return false;
  rec.count += 1;
  recentRequests.set(ip, rec);
  return true;
}

function normalisePhone(v) {
  const digits = String(v || '').replace(/[\s()+-]/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  return /^[6-9][0-9]{9}$/.test(local) ? local : null;
}

function validateEnquiry(body) {
  if (!body || typeof body !== 'object') return { error: 'INVALID_REQUEST' };
  if (typeof body.honeypot === 'string' && body.honeypot.trim()) return { bot: true };
  const name = typeof body.guardianName === 'string' ? body.guardianName.trim().replace(/\s+/g, ' ') : '';
  const phone = normalisePhone(body.contactPhone);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const grade = Number(body.grade);
  const board = body.board;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (name.length < 2 || name.length > 80 || /[<>]/.test(name)) return { error: 'INVALID_GUARDIAN_NAME' };
  if (!phone) return { error: 'INVALID_PHONE' };
  if (email.length > 120 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) return { error: 'INVALID_EMAIL' };
  if (!Number.isInteger(grade) || grade < 1 || grade > 10) return { error: 'INVALID_CLASS' };
  if (!['CBSE', 'STATE'].includes(board)) return { error: 'INVALID_BOARD' };
  if (message.length > 400) return { error: 'MESSAGE_TOO_LONG' };
  if (body.consent !== true) return { error: 'CONSENT_REQUIRED' };
  return { name, phone, email, grade, board, message };
}

/**
 * 1. Submit Basic Enquiry
 */
admissionsRouter.post('/enquiries', (req, res) => {
  const data = validateEnquiry(req.body);
  if (data.bot) return res.status(202).json({ received: true, message: 'Enquiry received.' });
  if (data.error) return res.status(400).json({ code: data.error, message: 'Please check the enquiry form and provide valid parent/guardian contact information.' });
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  if (!throttle(ip)) return res.status(429).json({ code: 'RATE_LIMITED', message: 'Too many enquiries from this connection. Please try again later.' });
  try {
    const id = 'enq-' + randomUUID();
    db.prepare(`
      INSERT INTO admission_enquiries
       (id, guardian_name, contact_phone, contact_email, grade, board, message)
      VALUES(?, ?, ?, ?, ?, ?, ?)
    `).run(id, data.name, data.phone, data.email || null, data.grade, data.board, data.message || null);
    res.status(201).json({ received: true, reference: id, message: 'Your enquiry was recorded. Our admissions team can review it.' });
  } catch (err) {
    console.error('[Admission enquiries] Could not save new enquiry', err);
    res.status(500).json({ code: 'SAVE_FAILED', message: 'We could not save your enquiry. Please try again later.' });
  }
});

/**
 * 2. Formal Student Admission Application (Captures essential SRS details)
 * Generates unique ADM-2026-XXXXX, creates provisional student & membership
 */
admissionsRouter.post('/apply', (req, res) => {
  const body = req.body;
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ code: 'INVALID_PAYLOAD', message: 'Invalid admission request.' });
  }
  if (typeof body.honeypot === 'string' && body.honeypot.trim()) {
    return res.status(202).json({ received: true, message: 'Application received.' });
  }

  const guardianName = typeof body.guardianName === 'string' ? body.guardianName.trim() : '';
  const phone = normalisePhone(body.guardianPhone || body.contactPhone);
  const email = typeof body.guardianEmail === 'string' ? body.guardianEmail.trim().toLowerCase() : (body.email ? String(body.email).trim().toLowerCase() : '');
  const studentName = typeof body.studentName === 'string' ? body.studentName.trim() : '';
  const grade = Number(body.grade);
  const board = body.board === 'STATE_KARNATAKA' ? 'STATE' : body.board;
  const medium = body.medium || 'English';
  const schoolName = typeof body.schoolName === 'string' ? body.schoolName.trim() : 'Vayentra Partner School';
  const consent = body.consent === true || body.parentConsent === true;

  if (guardianName.length < 2 || guardianName.length > 80 || /[<>]/.test(guardianName)) {
    return res.status(400).json({ code: 'INVALID_GUARDIAN_NAME', message: 'Please provide a valid parent/guardian name.' });
  }
  if (!phone) {
    return res.status(400).json({ code: 'INVALID_PHONE', message: 'A valid 10-digit Indian mobile number is required.' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Please provide a valid email address.' });
  }
  if (studentName.length < 2 || studentName.length > 80 || /[<>]/.test(studentName)) {
    return res.status(400).json({ code: 'INVALID_STUDENT_NAME', message: 'Please provide a valid student name.' });
  }
  if (!Number.isInteger(grade) || grade < 1 || grade > 10) {
    return res.status(400).json({ code: 'INVALID_GRADE', message: 'Please select an eligible grade between Class 1 and 10.' });
  }
  if (!['CBSE', 'STATE'].includes(board)) {
    return res.status(400).json({ code: 'INVALID_BOARD', message: 'Select either CBSE or Karnataka State Board.' });
  }
  if (!consent) {
    return res.status(400).json({ code: 'CONSENT_REQUIRED', message: 'Parental consent under the DPDP Act 2023 is mandatory for student admission.' });
  }

  const ip = req.ip || req.socket.remoteAddress || 'unknown';

  db.exec('BEGIN IMMEDIATE');
  try {
    // 1. Generate unique Admission ID (e.g. ADM-2026-8K2Q9Z)
    const randomChars = Math.random().toString(36).substring(2, 8).toUpperCase();
    const admissionId = `ADM-2026-${randomChars}`;

    // 2. Find or Provision Guardian User and Profile
    let user = db.prepare('SELECT id, role FROM users WHERE mobile = ? OR (email = ? AND email IS NOT NULL)').get(phone, email || null);
    let guardian;

    if (!user) {
      const userId = `usr-par-${Date.now().toString(36)}`;
      const defaultPassword = 'Gurukula@2026';
      const passwordHash = bcrypt.hashSync(defaultPassword, 10);
      db.prepare(`
        INSERT INTO users (id, name, mobile, email, role, password_hash)
        VALUES (?, ?, ?, ?, 'parent', ?)
      `).run(userId, guardianName, phone, email || null, passwordHash);

      const guardianId = `par-${Date.now().toString(36)}`;
      db.prepare(`
        INSERT INTO guardians (id, user_id, parent_pin, subscription_status, plan_name, outstanding_fee, emergency_phone)
        VALUES (?, ?, '1234', 'Active', 'Annual Gurukula Foundation Pass', 0.0, ?)
      `).run(guardianId, userId, phone);

      guardian = { id: guardianId, user_id: userId };
    } else {
      guardian = db.prepare('SELECT id, user_id FROM guardians WHERE user_id = ?').get(user.id);
      if (!guardian) {
        const guardianId = `par-${Date.now().toString(36)}`;
        db.prepare(`
          INSERT INTO guardians (id, user_id, parent_pin, subscription_status, plan_name, outstanding_fee, emergency_phone)
          VALUES (?, ?, '1234', 'Active', 'Annual Gurukula Foundation Pass', 0.0, ?)
        `).run(guardianId, user.id, phone);
        guardian = { id: guardianId, user_id: user.id };
      }
    }

    // 3. Provision Student Record
    const shortStudentId = Math.random().toString(36).substring(2, 7);
    const studentId = `stu-adm-${shortStudentId}`;
    const enrollmentNumber = `VG-ONE-2026-${shortStudentId.toUpperCase()}`;

    db.prepare(`
      INSERT INTO students (
        id, guardian_id, name, avatar, grade, board, medium, school_name,
        child_pin, status, enrollment_number, has_consent, consent_timestamp
      ) VALUES (?, ?, ?, '🎒', ?, ?, ?, ?, '0000', 'active', ?, 1, datetime('now'))
    `).run(studentId, guardian.id, studentName, grade, board, medium, schoolName, enrollmentNumber);

    // 4. Provision ONE Membership (entitlement_status = 'pending' until ₹599 is paid)
    db.prepare(`
      INSERT INTO one_memberships (student_id, guardian_id, initial_grade, initial_year, target_grade, membership_status, entitlement_status)
      VALUES (?, ?, ?, '2026-27', 10, 'active', 'pending')
      ON CONFLICT(student_id) DO UPDATE SET
        entitlement_status = 'pending'
    `).run(studentId, guardian.id, grade);

    // 5. Provision Academic Year
    const yearId = `year-${studentId}-2026`;
    db.prepare(`
      INSERT INTO one_academic_years (id, student_id, academic_year, grade, board, status, started_at)
      VALUES (?, ?, '2026-27', ?, ?, 'active', datetime('now'))
      ON CONFLICT(id) DO UPDATE SET status = 'active'
    `).run(yearId, studentId, grade, board);

    // 6. Record Consent
    db.prepare(`
      INSERT INTO one_consent_reviews (student_id, guardian_id, notice_version, verification_method, evidence_reference, verified_by, verified_at)
      VALUES (?, ?, 'v2026.1', 'verified_parent_records', 'PARENT_DIGITAL_ADMISSION_CONSENT', 'usr-admin-01', datetime('now'))
      ON CONFLICT(student_id) DO UPDATE SET notice_version = 'v2026.1'
    `).run(studentId, guardian.id);

    // 7. Create Student Login Account
    const studentEmail = `student_${shortStudentId}@vayentra.org`;
    const studentPassword = 'Gurukula@2026';
    const studentPassHash = bcrypt.hashSync(studentPassword, 10);
    const studentUserId = `usr-stu-${shortStudentId}`;
    db.prepare(`
      INSERT OR IGNORE INTO users (id, email, name, role, password_hash)
      VALUES (?, ?, ?, 'student', ?)
    `).run(studentUserId, studentEmail, studentName, studentPassHash);

    db.prepare(`
      INSERT INTO one_student_account_links (user_id, student_id)
      VALUES (?, ?)
      ON CONFLICT(user_id) DO UPDATE SET student_id = ?
    `).run(studentUserId, studentId, studentId);

    // 8. Record in admissions table
    db.prepare(`
      INSERT INTO admissions (
        id, guardian_id, guardian_name, guardian_phone, guardian_email,
        student_id, student_name, grade, board, medium, school_name,
        academic_year, consent_given, consent_ip, verification_status, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, '2026-27', 1, ?, 'verified', 'payment_pending')
    `).run(
      admissionId, guardian.id, guardianName, phone, email || null,
      studentId, studentName, grade, board, medium, schoolName, ip
    );

    db.exec('COMMIT');

    res.status(201).json({
      success: true,
      admissionId,
      studentId,
      studentName,
      guardianId: guardian.id,
      guardianName,
      guardianPhone: phone,
      grade,
      board,
      academicYear: '2026-27',
      annualFeeInr: ANNUAL_PRICE_INR,
      status: 'payment_pending',
      checkoutUrl: `/checkout?admissionId=${admissionId}`,
      credentials: {
        guardianLogin: phone,
        studentEmail,
        defaultPassword: 'Gurukula@2026'
      },
      message: 'Admission successfully verified. Proceed to complete annual platform fee checkout.'
    });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Admissions Apply Error]:', err);
    res.status(500).json({ code: 'ADMISSION_FAILED', message: 'Unable to process admission application. Please try again.' });
  }
});

/**
 * 3. Lookup Admission by ID
 */
admissionsRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  try {
    const record = db.prepare(`
      SELECT a.*, s.enrollment_number, m.entitlement_status,
             sub.status as subscription_status, sub.expires_at as subscription_expiry
      FROM admissions a
      LEFT JOIN students s ON s.id = a.student_id
      LEFT JOIN one_memberships m ON m.student_id = a.student_id
      LEFT JOIN student_subscriptions sub ON sub.student_id = a.student_id
      WHERE a.id = ?
    `).get(id);

    if (!record) {
      return res.status(404).json({ code: 'ADMISSION_NOT_FOUND', message: 'Admission reference not found.' });
    }

    res.json({
      admission: {
        id: record.id,
        guardianName: record.guardian_name,
        guardianPhone: record.guardian_phone,
        guardianEmail: record.guardian_email,
        studentId: record.student_id,
        studentName: record.student_name,
        enrollmentNumber: record.enrollment_number,
        grade: record.grade,
        board: record.board,
        medium: record.medium,
        schoolName: record.school_name,
        academicYear: record.academic_year,
        status: record.status,
        verificationStatus: record.verification_status,
        entitlementStatus: record.entitlement_status,
        subscriptionStatus: record.subscription_status,
        subscriptionExpiry: record.subscription_expiry,
        annualFeeInr: ANNUAL_PRICE_INR,
        createdAt: record.created_at
      }
    });
  } catch (err) {
    console.error('[Admission Lookup Error]:', err);
    res.status(500).json({ code: 'LOOKUP_FAILED' });
  }
});

/**
 * ============================================================================
 * ADMIN ADMISSION ENDPOINTS (Secured with authenticateToken & requireRole('admin'))
 * ============================================================================
 */
admissionsRouter.use('/admin', authenticateToken, requireRole('admin'));

admissionsRouter.get('/admin/list', (req, res) => {
  const statusFilter = req.query.status || 'all';
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  try {
    const query = statusFilter === 'all'
      ? 'SELECT * FROM admissions ORDER BY created_at DESC LIMIT ?'
      : 'SELECT * FROM admissions WHERE status = ? ORDER BY created_at DESC LIMIT ?';

    const list = statusFilter === 'all'
      ? db.prepare(query).all(limit)
      : db.prepare(query).all(statusFilter, limit);

    res.json({
      admissions: list.map(a => ({
        id: a.id,
        guardianName: a.guardian_name,
        guardianPhone: a.guardian_phone,
        guardianEmail: a.guardian_email,
        studentId: a.student_id,
        studentName: a.student_name,
        grade: a.grade,
        board: a.board,
        status: a.status,
        verificationStatus: a.verification_status,
        createdAt: a.created_at
      }))
    });
  } catch (err) {
    console.error('[Admin Admissions List Error]:', err);
    res.status(500).json({ code: 'LOAD_FAILED' });
  }
});

admissionsRouter.patch('/admin/:id/status', (req, res) => {
  const { status, verificationStatus } = req.body;
  const { id } = req.params;

  try {
    const existing = db.prepare('SELECT * FROM admissions WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ code: 'ADMISSION_NOT_FOUND' });

    if (status) {
      db.prepare("UPDATE admissions SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, id);
    }
    if (verificationStatus) {
      db.prepare("UPDATE admissions SET verification_status = ?, updated_at = datetime('now') WHERE id = ?").run(verificationStatus, id);
    }

    res.json({ updated: true, id, status: status || existing.status });
  } catch (err) {
    console.error('[Admin Update Admission Status Error]:', err);
    res.status(500).json({ code: 'UPDATE_FAILED' });
  }
});

// Existing Admin Enquiry Routes (Preserved for backwards compatibility)
admissionsRouter.get('/admin/enquiries', (req, res) => {
  const status = String(req.query.status || 'all');
  if (!['all', 'new', 'contacted', 'closed'].includes(status)) return res.status(400).json({ code: 'INVALID_STATUS_FILTER' });
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  try {
    const list = status === 'all'
      ? db.prepare('SELECT * FROM admission_enquiries ORDER BY created_at DESC LIMIT ?').all(limit)
      : db.prepare('SELECT * FROM admission_enquiries WHERE status=? ORDER BY created_at DESC LIMIT ?').all(status, limit);
    return res.json({
      enquiries: list.map(x => ({
        id: x.id,
        guardianName: x.guardian_name,
        contactPhone: x.contact_phone,
        email: x.contact_email,
        grade: x.grade,
        board: x.board,
        message: x.message,
        status: x.status,
        createdAt: x.created_at,
        updatedAt: x.updated_at
      }))
    });
  } catch (err) {
    console.error('[Admission enquiries] Could not read list', err);
    return res.status(500).json({ code: 'LOAD_FAILED' });
  }
});

admissionsRouter.patch('/admin/enquiries/:id', (req, res) => {
  const status = req.body?.status;
  if (!['new', 'contacted', 'closed'].includes(status)) return res.status(400).json({ code: 'INVALID_STATUS' });
  try {
    const r = db.prepare("UPDATE admission_enquiries SET status=?,updated_at=datetime('now') WHERE id=?").run(status, req.params.id);
    if (r.changes === 0) return res.status(404).json({ code: 'NOT_FOUND' });
    return res.json({ updated: true, status });
  } catch (err) {
    console.error('[Admission enquiries] Update failed', err);
    return res.status(500).json({ code: 'UPDATE_FAILED' });
  }
});

admissionsRouter.delete('/admin/enquiries/:id', (req, res) => {
  try {
    const r = db.prepare('DELETE FROM admission_enquiries WHERE id=?').run(req.params.id);
    if (r.changes === 0) return res.status(404).json({ code: 'NOT_FOUND' });
    return res.json({ deleted: true });
  } catch (err) {
    console.error('[Admission enquiries] Delete failed', err);
    return res.status(500).json({ code: 'DELETE_FAILED' });
  }
});
