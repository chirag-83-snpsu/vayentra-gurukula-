import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { JWT_SECRET, authenticateToken, requireRole } from '../middleware/auth.js';

export const authRouter = Router();

// Never serialize child/guardian secrets to the browser, even to the owning account.
const publicGuardian = guardian => {
  if (!guardian) return null;
  const { parent_pin, ...safe } = guardian;
  return safe;
};
const publicStudent = student => {
  if (!student) return null;
  const { child_pin, ...safe } = student;
  return safe;
};


// In-memory challenge store for mobile OTP with TTL
const otpChallenges = new Map();

// ========================================================
// 1. Password-based Login (Admin, Teacher, Safeguarding, Reviewer, Parent, Student)
// ========================================================
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      code: 'VALIDATION_ERROR',
      message: 'Both email and password are required.'
    });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)').get(email.trim());

    if (!user || !user.password_hash) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    // Check if account is flagged for mandatory security credential reset
    if (user.must_reset_password === 1) {
      if (process.env.NODE_ENV === 'production' || req.headers['x-test-enforce-reset']) {
        return res.status(403).json({
          code: 'PASSWORD_RESET_REQUIRED',
          message: 'This account was flagged during security audit for a mandatory password reset. Please use your activation or password reset link to establish a secure password.',
          userId: user.id
        });
      }
    }

    // Hydrate role profiles
    const guardian = user.role === 'parent'
      ? db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(user.id)
      : null;
    const children = guardian
      ? db.prepare('SELECT * FROM students WHERE guardian_id = ?').all(guardian.id)
      : [];
    const student = user.role === 'student'
      ? db.prepare("SELECT s.* FROM students s JOIN one_student_account_links l ON l.student_id=s.id WHERE l.user_id=?").get(user.id)
      : null;

    if (user.role === 'student' && !student) {
      return res.status(403).json({code:'STUDENT_LINK_REQUIRED', message:'This account needs an explicit school administrator link to its learner profile.'});
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        guardianId: guardian?.id,
        studentId: student?.id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    try {
      db.prepare(`
        INSERT INTO audit_logs (id, actor, action, entity, ip, details_json)
        VALUES (?, ?, 'AUTH_LOGIN_SUCCESS', 'User', ?, ?)
      `).run(`aud-${Date.now()}`, user.email, req.ip || '127.0.0.1', JSON.stringify({ role: user.role, method: 'password' }));
    } catch (e) {}

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
      },
      guardian: publicGuardian(guardian),
      children: children.map(publicStudent),
      activeChild: publicStudent(children[0] || student)
    });
  } catch (err) {
    console.error('[Auth Login Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Authentication processing failed.' });
  }
});

// ========================================================
// 2. Logout Endpoint
// ========================================================
authRouter.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      db.prepare(`
        INSERT INTO audit_logs (id, actor, action, entity, ip, details_json)
        VALUES (?, ?, 'USER_LOGOUT', 'User', ?, ?)
      `).run(`aud-${Date.now()}`, decoded.email || decoded.userId, req.ip || '127.0.0.1', JSON.stringify({ role: decoded.role }));
    } catch (e) {}
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// ========================================================
// 3. Google OAuth 2.0 Endpoint
// ========================================================
authRouter.post('/google', (_req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      code: 'SANDBOX_PROHIBITED',
      message: 'Sandbox authentication is strictly disabled in production.'
    });
  }
  return res.status(503).json({
    code: 'GOOGLE_PROVIDER_NOT_READY',
    message: 'Google Sign-In is unavailable until cryptographic verification is configured.'
  });
});

// ========================================================
// 4. Mobile OTP — not enabled until SMS dispatch and verification are integrated
// ========================================================
// The former implementation returned a successful SMS-dispatched message without
// actually delivering a message and supported a static challenge code.
// Never create accounts or minors' profiles on an unverified OTP channel.
const smsNotReady=(_req,res)=>res.status(503).json({
  code:'SMS_PROVIDER_NOT_READY',
  message:'Mobile OTP sign-in is unavailable. Use registered email and password.'
});
authRouter.post('/otp/send',smsNotReady);
authRouter.post('/otp/verify',smsNotReady);

// ========================================================
// 5. Current User Session Hydration (Strictly Authenticated)
// ========================================================
authRouter.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare('SELECT id, email, name, avatar, role, mobile, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) {
      return res.status(404).json({ code: 'NOT_FOUND', message: 'User account not found.' });
    }

    const guardian = user.role === 'parent'
      ? db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(user.id)
      : null;
    const children = guardian
      ? db.prepare('SELECT * FROM students WHERE guardian_id = ?').all(guardian.id)
      : [];
    const student = user.role === 'student'
      ? db.prepare('SELECT * FROM students WHERE id = ?').get(req.user.studentId)
      : null;

    res.json({
      success: true,
      user,
      guardian: publicGuardian(guardian),
      children: children.map(publicStudent),
      activeChild: publicStudent(children[0] || student)
    });
  } catch (err) {
    console.error('[Auth /me Error]:', err);
    res.status(500).json({ code: 'SERVER_ERROR', message: 'Failed to fetch session.' });
  }
});

// ========================================================
// 6. Verify Parent PIN (Verified for Authenticated Parent Session)
// ========================================================
authRouter.post('/pin/verify', authenticateToken, (req, res) => {
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, authorized: false, message: 'Parent PIN is required.' });
  }

  if (req.user.role !== 'parent' && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, authorized: false, message: 'PIN verification is restricted to guardians.' });
  }

  const guardian = db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(req.user.id);
  if (!guardian) {
    return res.status(404).json({ success: false, authorized: false, message: 'Guardian profile not found.' });
  }

  if (typeof pin === 'string' && /^\d{4}$/.test(pin) && guardian.parent_pin?.startsWith('$2') && bcrypt.compareSync(pin, guardian.parent_pin)) {
    return res.json({ success: true, authorized: true });
  }

  res.status(401).json({ success: false, authorized: false, message: 'Incorrect Parent Security PIN.' });
});

// ========================================================
// 7. Legacy direct child creation retired in favour of the reviewed ONE pathway.
// ========================================================
authRouter.post('/child/add',authenticateToken,requireRole(['parent','admin']),(_req,res)=>{
  return res.status(410).json({
    code:'USE_REVIEWED_ONE_ADMISSION',
    message:'Direct child registration has been retired. Submit a Vayentra ONE guardian application and complete administrator review.'
  });
});

// ========================================================
// 8. Secure Single-Use Account Activation (Fix 4: No predictable default passwords)
// ========================================================
function validatePasswordStrength(password) {
  if (typeof password !== 'string' || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character.';
  }
  return null;
}

authRouter.post('/activate-account', (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    return res.status(400).json({
      code: 'MISSING_PARAMETERS',
      message: 'Activation token and new password are required.'
    });
  }

  const tokenRecord = db.prepare(`
    SELECT * FROM account_activation_tokens 
    WHERE token = ?
  `).get(token);

  if (!tokenRecord) {
    return res.status(404).json({
      code: 'INVALID_ACTIVATION_TOKEN',
      message: 'The activation link or token is invalid.'
    });
  }

  if (tokenRecord.is_used === 1) {
    return res.status(400).json({
      code: 'TOKEN_ALREADY_USED',
      message: 'This activation token has already been used. Please log in or request a new reset link.'
    });
  }

  const now = new Date();
  const expiresAt = new Date(tokenRecord.expires_at);
  if (now > expiresAt) {
    return res.status(400).json({
      code: 'TOKEN_EXPIRED',
      message: 'This activation link has expired (valid for 48 hours). Please contact your parent or support for a new activation link.'
    });
  }

  const pwdErr = validatePasswordStrength(password);
  if (pwdErr) {
    return res.status(400).json({
      code: 'WEAK_PASSWORD',
      message: pwdErr
    });
  }

  const newHash = bcrypt.hashSync(password, 10);

  db.exec('BEGIN IMMEDIATE');
  try {
    db.prepare(`
      UPDATE users 
      SET password_hash = ?
      WHERE id = ?
    `).run(newHash, tokenRecord.user_id);

    db.prepare(`
      UPDATE account_activation_tokens
      SET is_used = 1, used_at = datetime('now')
      WHERE token = ?
    `).run(token);

    db.exec('COMMIT');

    try {
      db.prepare(`
        INSERT INTO audit_logs (id, actor, action, entity, ip, details_json)
        VALUES (?, ?, 'ACCOUNT_ACTIVATED', 'User', ?, ?)
      `).run(`aud-${Date.now()}`, tokenRecord.user_id, req.ip || '127.0.0.1', JSON.stringify({ studentId: tokenRecord.student_id }));
    } catch (e) {}

    res.json({
      success: true,
      message: 'Account successfully activated! You may now sign in using your email and password.'
    });
  } catch (err) {
    db.exec('ROLLBACK');
    console.error('[Account Activation Error]:', err);
    res.status(500).json({ code: 'ACTIVATION_FAILED', message: 'Unable to activate account.' });
  }
});

// ========================================================
// 9. Parent-Managed Student Credential Reset (Fix 4: Parent controls linked student access)
// ========================================================
authRouter.post('/parent/set-student-credentials', authenticateToken, requireRole(['parent', 'admin']), (req, res) => {
  const { studentId, password, childPin } = req.body;

  if (!studentId) {
    return res.status(400).json({ code: 'MISSING_STUDENT_ID', message: 'studentId is required.' });
  }

  const student = db.prepare('SELECT id, guardian_id, name FROM students WHERE id = ?').get(studentId);
  if (!student) {
    return res.status(404).json({ code: 'STUDENT_NOT_FOUND', message: 'Student profile not found.' });
  }

  // Security check: parent can only manage their linked child
  if (req.user.role === 'parent' && req.user.guardianId && student.guardian_id !== req.user.guardianId) {
    return res.status(403).json({
      code: 'STUDENT_ACCESS_DENIED',
      message: 'You can only manage credentials for your linked children.'
    });
  }

  const updates = [];

  if (password) {
    const pwdErr = validatePasswordStrength(password);
    if (pwdErr) {
      return res.status(400).json({ code: 'WEAK_PASSWORD', message: pwdErr });
    }
    const link = db.prepare('SELECT user_id FROM one_student_account_links WHERE student_id = ?').get(studentId);
    if (!link) {
      return res.status(404).json({ code: 'STUDENT_USER_NOT_LINKED', message: 'Student has no linked user account.' });
    }
    const newHash = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, link.user_id);
    updates.push('password');
  }

  if (childPin) {
    if (!/^\d{4}$/.test(String(childPin))) {
      return res.status(400).json({ code: 'INVALID_PIN', message: 'Child PIN must be a 4-digit numeric code.' });
    }
    db.prepare('UPDATE students SET child_pin = ? WHERE id = ?').run(bcrypt.hashSync(String(childPin), 10), studentId);
    updates.push('child_pin');
  }

  if (updates.length === 0) {
    return res.status(400).json({ code: 'NO_UPDATES_PROVIDED', message: 'Provide either a new password or childPin to update.' });
  }

  try {
    db.prepare(`
      INSERT INTO audit_logs (id, actor, action, entity, ip, details_json)
      VALUES (?, ?, 'STUDENT_CREDENTIALS_UPDATED_BY_PARENT', 'Student', ?, ?)
    `).run(`aud-${Date.now()}`, req.user.email, req.ip || '127.0.0.1', JSON.stringify({ studentId, updates }));
  } catch (e) {}

  res.json({
    success: true,
    message: `Student credentials successfully updated (${updates.join(', ')}).`,
    updatedFields: updates
  });
});

