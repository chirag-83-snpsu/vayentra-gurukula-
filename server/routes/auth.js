import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { JWT_SECRET, authenticateToken, requireRole } from '../middleware/auth.js';

export const authRouter = Router();

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
      guardian,
      children,
      activeChild: children[0] || student || null
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
// Google sign-in is deliberately unavailable until a verified identity library checks
// Google's signature, issuer, client audience, expiry and email verification.
// Decoding a JWT payload without verifying its signature is NOT authentication.
authRouter.post('/google', (_req,res) => res.status(503).json({
  code:'GOOGLE_PROVIDER_NOT_READY',
  message:'Google sign-in is temporarily unavailable. Please use your registered email and password.'
}));

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
      guardian,
      children,
      activeChild: children[0] || student || null
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

  if (pin === guardian.parent_pin) {
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
