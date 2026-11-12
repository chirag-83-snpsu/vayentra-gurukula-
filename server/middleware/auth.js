import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('FATAL: JWT_SECRET must be explicitly set in production environment.'); })()
    : 'vayentra_gurukula_jwt_secret_dev_2026'
);

/**
 * Authentication Middleware: Verifies Bearer JWT and hydrates req.user
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Missing or malformed Bearer token.'
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Bearer token string is empty.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, email, name, role, avatar FROM users WHERE id = ?').get(decoded.userId);

    if (!user) {
      return res.status(401).json({
        code: 'USER_NOT_FOUND',
        message: 'The authenticated user session belongs to an account that no longer exists.'
      });
    }

    // Attach contextual profile records
    let guardian = null;
    let student = null;
    let teacher = null;

    if (user.role === 'parent') {
      guardian = db.prepare('SELECT * FROM guardians WHERE user_id = ?').get(user.id);
    } else if (user.role === 'student') {
      // Never infer child identity from a guessed ID, token claim, or matching name.
      student = db.prepare(
        'SELECT s.* FROM students s JOIN one_student_account_links l ON l.student_id=s.id WHERE l.user_id=?'
      ).get(user.id);
      if (!student) return res.status(403).json({code:'STUDENT_LINK_REQUIRED',message:'Student account is not linked to a verified learner profile.'});
    } else if (user.role === 'teacher') {
      teacher = db.prepare('SELECT * FROM teachers WHERE user_id = ?').get(user.id);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      guardianId: guardian?.id,
      studentId: student?.id,
      teacherId: teacher?.id
    };

    next();
  } catch (err) {
    return res.status(401).json({
      code: 'INVALID_TOKEN',
      message: 'Session has expired or token verification failed. Please sign in again.'
    });
  }
}

/**
 * Role-Based Access Control (RBAC) Middleware: Restricts route to specified roles
 * @param {string | string[]} allowedRoles
 */
export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Authentication required before checking permissions.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: `Access denied. Role '${req.user.role}' lacks permission for this resource.`
      });
    }

    next();
  };
}

/**
 * Child Ownership Middleware: Verifies that parents only manage their own linked children
 */
export function requireChildOwnership(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Authentication required.' });
  }

  // Administrative / academic staff have authorized school-wide oversight
  if (['admin', 'teacher', 'safeguarding', 'reviewer'].includes(req.user.role)) {
    return next();
  }

  const requestedStudentId = req.params?.studentId || req.body?.studentId || req.query?.studentId;
  if (!requestedStudentId) {
    return next();
  }

  if (req.user.role === 'parent') {
    if (!req.user.guardianId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'No guardian profile linked with this parent account.'
      });
    }

    const child = db.prepare('SELECT id FROM students WHERE id = ? AND guardian_id = ?').get(
      requestedStudentId,
      req.user.guardianId
    );

    if (!child) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'You do not have authorization to view or modify records for this student.'
      });
    }

    return next();
  }

  if (req.user.role === 'student') {
    if (!req.user.studentId || req.user.studentId !== requestedStudentId) {
      return res.status(403).json({
        code: 'FORBIDDEN',
        message: 'Students may only access their own enrolled coursework and notebooks.'
      });
    }
    return next();
  }

  return res.status(403).json({ code: 'FORBIDDEN', message: 'Unauthorized student access.' });
}
