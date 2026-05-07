const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { success, created, paginated, error } = require('../utils/response');

// GET all users (admin only)
const getUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      ...(role && { role }),
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { staffProfile: { OR: [{ firstName: { contains: search, mode: 'insensitive' } }, { lastName: { contains: search, mode: 'insensitive' } }] } },
        ],
      }),
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        select: { id: true, email: true, role: true, isActive: true, lastLogin: true, createdAt: true,
          staffProfile: { select: { firstName: true, lastName: true, photo: true } },
          parentProfile: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return paginated(res, users, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE user (admin/receptionist)
const createUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) return error(res, 'Email, password and role are required.', 400);

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) return error(res, 'Email already registered.', 409);

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email: email.toLowerCase().trim(), passwordHash, role },
      select: { id: true, email: true, role: true, isActive: true, createdAt: true },
    });

    return created(res, user, 'User created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE user status (activate/deactivate)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return error(res, 'User not found.', 404);

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, email: true, role: true, isActive: true },
    });
    return success(res, updated, `User ${updated.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) {
    return error(res, err.message);
  }
};

// RESET user password (admin)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) return error(res, 'Password must be at least 6 characters.', 400);

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id }, data: { passwordHash } });
    return success(res, null, 'Password reset successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getUsers, createUser, toggleUserStatus, resetUserPassword };
