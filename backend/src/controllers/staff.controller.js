const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { success, created, paginated, error } = require('../utils/response');

// GET all staff members
const getStaff = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(role && { user: { role } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [staff, total] = await Promise.all([
      prisma.staffProfile.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: { user: { select: { email: true, role: true, isActive: true } } },
        orderBy: { firstName: 'asc' },
      }),
      prisma.staffProfile.count({ where }),
    ]);

    return paginated(res, staff, {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (err) {
    return error(res, err.message);
  }
};

// GET single staff member
const getStaffMember = async (req, res) => {
  try {
    const staff = await prisma.staffProfile.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { email: true, role: true, isActive: true } },
        classAssignments: {
          include: {
            subject: true,
            stream: { include: { grade: true } },
          },
        },
      },
    });
    if (!staff) return error(res, 'Staff member not found.', 404);
    return success(res, staff);
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE staff member
const createStaffMember = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      phone,
      nationalId,
      tscNumber,
      qualification,
      dateOfEmployment,
    } = req.body;

    const photo = req.file ? `uploads/photos/${req.file.filename}` : null;

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existingUser) return error(res, 'Email already registered.', 409);

    const passwordHash = await bcrypt.hash(password || 'Staff@123', 12);

    const staff = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: email.toLowerCase().trim(),
          passwordHash,
          role,
        },
      });

      return await tx.staffProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          photo,
          nationalId,
          tscNumber,
          qualification,
          dateOfEmployment: dateOfEmployment ? new Date(dateOfEmployment) : null,
        },
        include: { user: { select: { email: true, role: true } } },
      });
    });

    return created(res, staff, 'Staff member created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE staff member
const updateStaffMember = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = req.file ? `uploads/photos/${req.file.filename}` : undefined;

    const data = {
      ...req.body,
      ...(photo && { photo }),
      ...(req.body.dateOfEmployment && { dateOfEmployment: new Date(req.body.dateOfEmployment) }),
    };

    // Prevent updating user-related fields directly through this endpoint if needed
    delete data.email;
    delete data.role;

    const staff = await prisma.staffProfile.update({
      where: { id },
      data,
      include: { user: { select: { email: true, role: true } } },
    });
    return success(res, staff, 'Staff profile updated');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getStaff, getStaffMember, createStaffMember, updateStaffMember };
