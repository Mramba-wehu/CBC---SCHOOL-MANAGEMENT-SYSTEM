const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/database');
const { success, error } = require('../utils/response');

// ─── Generate Tokens ─────────────────────────
const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
  return { accessToken, refreshToken };
};

// ─── Login ───────────────────────────────────
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email and password are required.', 400);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        staffProfile: { select: { id: true, firstName: true, lastName: true, photo: true } },
        parentProfile: { select: { id: true, firstName: true, lastName: true } },
        studentProfile: {
          include: {
            student: {
              select: { id: true, firstName: true, lastName: true, studentId: true, photo: true, stream: { include: { grade: true } } }
            }
          }
        },
      },
    });

    if (!user) return error(res, 'Invalid email or password.', 401);
    if (!user.isActive) return error(res, 'Account is deactivated. Contact admin.', 403);

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return error(res, 'Invalid email or password.', 401);

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    const profile = user.staffProfile || user.parentProfile || user.studentProfile?.student || null;

    return success(res, {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isDemoAccount: user.isDemoAccount,
        profile,
      },
    }, 'Login successful');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Login failed. Please try again.', 500);
  }
};

// ─── Refresh Token ───────────────────────────
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return error(res, 'Refresh token required.', 400);

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      return error(res, 'Invalid or expired refresh token.', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) return error(res, 'User not found or inactive.', 401);

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token } });
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    return success(res, { accessToken, refreshToken: newRefreshToken }, 'Token refreshed');
  } catch (err) {
    return error(res, 'Token refresh failed.', 401);
  }
};

// ─── Logout ──────────────────────────────────
const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await prisma.refreshToken.deleteMany({ where: { token } });
    }
    return success(res, null, 'Logged out successfully');
  } catch (err) {
    return error(res, 'Logout failed.', 500);
  }
};

// ─── Get My Profile ──────────────────────────
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        staffProfile: true,
        parentProfile: {
          include: {
            children: {
              include: {
                student: {
                  include: { stream: { include: { grade: true } } }
                }
              }
            }
          }
        },
        studentProfile: {
          include: {
            student: {
              include: { stream: { include: { grade: true } } }
            }
          }
        },
      },
    });

    const { passwordHash, ...safeUser } = user;
    return success(res, safeUser, 'Profile fetched');
  } catch (err) {
    return error(res, 'Failed to fetch profile.', 500);
  }
};

// ─── Change Password ─────────────────────────
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return error(res, 'Both passwords required.', 400);
    if (newPassword.length < 6) return error(res, 'Password must be at least 6 characters.', 400);

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) return error(res, 'Current password is incorrect.', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });

    return success(res, null, 'Password changed successfully');
  } catch (err) {
    return error(res, 'Password change failed.', 500);
  }
};

// ─── Update FCM Token (Push Notifications) ───
const updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    await prisma.user.update({ where: { id: req.user.id }, data: { fcmToken } });
    return success(res, null, 'FCM token updated');
  } catch (err) {
    return error(res, 'Failed to update FCM token.', 500);
  }
};

module.exports = { login, refreshToken, logout, getMe, changePassword, updateFcmToken };
