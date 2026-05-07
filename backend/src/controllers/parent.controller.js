const prisma = require('../config/database');
const { success, paginated, error } = require('../utils/response');

// GET all parents
const getParents = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const [parents, total] = await Promise.all([
      prisma.parentProfile.findMany({
        where, skip, take: parseInt(limit),
        include: { user: { select: { email: true, isActive: true } }, children: { include: { student: true } } },
        orderBy: { firstName: 'asc' },
      }),
      prisma.parentProfile.count({ where }),
    ]);

    return paginated(res, parents, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    return error(res, err.message);
  }
};

// GET single parent
const getParent = async (req, res) => {
  try {
    const parent = await prisma.parentProfile.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { email: true, isActive: true } }, children: { include: { student: { include: { stream: { include: { grade: true } } } } } } },
    });
    if (!parent) return error(res, 'Parent not found.', 404);
    return success(res, parent);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getParents, getParent };
