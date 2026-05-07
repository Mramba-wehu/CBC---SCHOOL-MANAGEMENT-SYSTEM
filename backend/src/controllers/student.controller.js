const prisma = require('../config/database');
const bcrypt = require('bcryptjs');
const { success, created, paginated, error } = require('../utils/response');

// Generate student ID: WEHU-YYYY-###
const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const count = await prisma.student.count();
  const seq = String(count + 1).padStart(3, '0');
  return `WEHU-${year}-${seq}`;
};

// GET all students
const getStudents = async (req, res) => {
  try {
    const { gradeId, streamId, status, search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      ...(status && { status }),
      ...(streamId && { streamId }),
      ...(gradeId && { stream: { gradeId } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { studentId: { contains: search, mode: 'insensitive' } },
          { nemisNumber: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where, skip, take: parseInt(limit),
        include: { stream: { include: { grade: true } }, parents: { include: { parent: true } } },
        orderBy: [{ stream: { grade: { level: 'asc' } } }, { lastName: 'asc' }],
      }),
      prisma.student.count({ where }),
    ]);

    return paginated(res, students, { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    return error(res, err.message);
  }
};

// GET single student
const getStudent = async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: {
        stream: { include: { grade: true } },
        parents: { include: { parent: { include: { user: { select: { email: true } } } } } },
        assessments: { include: { learningOutcome: { include: { subStrand: { include: { strand: { include: { subject: true } } } } } } }, orderBy: { assessedDate: 'desc' }, take: 20 },
        feeInvoices: { include: { items: true, payments: true }, orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!student) return error(res, 'Student not found.', 404);
    return success(res, student);
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE student (enrollment)
const createStudent = async (req, res) => {
  try {
    const {
      firstName, lastName, otherNames, dateOfBirth, gender, religion, tribe,
      homeAddress, medicalInfo, bloodGroup, nemisNumber, birthCertNumber,
      streamId, previousSchool, admissionDate,
      // Parent details
      parentUserId,
      email, password, // if creating new parent user
      parentFirstName, parentLastName, parentPhone, parentNationalId, relationship,
    } = req.body;

    const studentId = await generateStudentId();
    const photo = req.file ? `uploads/photos/${req.file.filename}` : null;

    // Create student + student user account
    const studentPasswordHash = await bcrypt.hash(`student${studentId.replace(/-/g, '')}`, 12);
    const studentEmail = `${studentId.toLowerCase().replace(/-/g, '.')}@wehu.school`;

    const student = await prisma.$transaction(async (tx) => {
      // Create student record
      const newStudent = await tx.student.create({
        data: {
          studentId, firstName, lastName, otherNames, photo,
          dateOfBirth: new Date(dateOfBirth), gender, religion, tribe,
          homeAddress, medicalInfo, bloodGroup, nemisNumber, birthCertNumber,
          streamId, previousSchool,
          admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
        },
      });

      // Create student user account
      const studentUser = await tx.user.create({
        data: {
          email: studentEmail,
          passwordHash: studentPasswordHash,
          role: 'STUDENT',
        },
      });

      await tx.studentProfile.create({
        data: { studentId: newStudent.id, userId: studentUser.id },
      });

      // Link to parent
      if (parentUserId) {
        const parentProfile = await tx.parentProfile.findFirst({ where: { userId: parentUserId } });
        if (parentProfile) {
          await tx.parentStudent.create({ data: { parentId: parentProfile.id, studentId: newStudent.id, isPrimary: true } });
        }
      } else if (email && password && parentFirstName) {
        // Create new parent user
        const parentPasswordHash = await bcrypt.hash(password, 12);
        const parentUser = await tx.user.create({
          data: { email: email.toLowerCase().trim(), passwordHash: parentPasswordHash, role: 'PARENT' },
        });
        const parentProfile = await tx.parentProfile.create({
          data: {
            userId: parentUser.id,
            firstName: parentFirstName, lastName: parentLastName,
            phone: parentPhone, nationalId: parentNationalId,
            relationship: relationship || 'Guardian',
          },
        });
        await tx.parentStudent.create({ data: { parentId: parentProfile.id, studentId: newStudent.id, isPrimary: true } });
      }

      return newStudent;
    });

    const fullStudent = await prisma.student.findUnique({
      where: { id: student.id },
      include: { stream: { include: { grade: true } }, parents: { include: { parent: true } } },
    });

    return created(res, { student: fullStudent, loginEmail: studentEmail, loginPassword: `student${studentId.replace(/-/g, '')}` }, 'Student enrolled successfully');
  } catch (err) {
    console.error('Enrollment error:', err);
    return error(res, err.message);
  }
};

// UPDATE student
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = req.file ? `uploads/photos/${req.file.filename}` : undefined;
    const data = { ...req.body, ...(photo && { photo }), ...(req.body.dateOfBirth && { dateOfBirth: new Date(req.body.dateOfBirth) }) };
    delete data.studentId; delete data.nemisNumber; // protect immutable fields

    const student = await prisma.student.update({ where: { id }, data, include: { stream: { include: { grade: true } } } });
    return success(res, student, 'Student updated');
  } catch (err) {
    return error(res, err.message);
  }
};

// PROMOTE student
const promoteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { toStreamId, academicYearId, notes } = req.body;

    const student = await prisma.student.findUnique({ where: { id }, include: { stream: { include: { grade: true } } } });
    if (!student) return error(res, 'Student not found.', 404);

    const [promotion] = await prisma.$transaction([
      prisma.studentPromotion.create({
        data: { studentId: id, fromStreamId: student.streamId, toStreamId, academicYearId, promotedById: req.user.id, notes },
      }),
      prisma.student.update({ where: { id }, data: { streamId: toStreamId, status: 'PROMOTED' } }),
    ]);

    return success(res, promotion, 'Student promoted successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET students for current user (parent/student view)
const getMyStudents = async (req, res) => {
  try {
    if (req.user.role === 'PARENT') {
      const parent = await prisma.parentProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          children: {
            include: {
              student: {
                include: { stream: { include: { grade: true } } }
              }
            }
          }
        },
      });
      return success(res, parent?.children.map(c => c.student) || []);
    }

    if (req.user.role === 'STUDENT') {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
        include: { student: { include: { stream: { include: { grade: true } } } } },
      });
      return success(res, profile?.student ? [profile.student] : []);
    }

    return error(res, 'Unauthorized', 403);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, promoteStudent, getMyStudents };
