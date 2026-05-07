const jwt = require('jsonwebtoken');
const prisma = require('../config/database');

// ─── Verify JWT Token ────────────────────────
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
        isDemoAccount: true,
        staffProfile: { select: { id: true, firstName: true, lastName: true, photo: true } },
        parentProfile: { select: { id: true, firstName: true, lastName: true } },
        studentProfile: { select: { studentId: true } },
      },
    });

    if (!user) return res.status(401).json({ success: false, message: 'User not found.' });
    if (!user.isActive) return res.status(403).json({ success: false, message: 'Account is deactivated.' });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// ─── Role-Based Access Control ───────────────
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

// ─── Shorthand Role Groups ───────────────────
const ROLES = {
  ALL_STAFF: ['SUPER_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'BURSAR', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'RECEPTIONIST'],
  ADMIN: ['SUPER_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL'],
  SUPER_ADMIN: ['SUPER_ADMIN'],
  TEACHERS: ['SUPER_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'],
  FINANCE: ['SUPER_ADMIN', 'PRINCIPAL', 'BURSAR'],
  PARENT_STUDENT: ['PARENT', 'STUDENT'],
  ALL: ['SUPER_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'BURSAR', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'RECEPTIONIST', 'PARENT', 'STUDENT'],
};

module.exports = { authenticate, authorize, ROLES };
