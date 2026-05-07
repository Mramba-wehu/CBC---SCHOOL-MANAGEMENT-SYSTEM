const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// GET all subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: { grades: { include: { grade: true } } },
    });
    return success(res, subjects);
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE subject
const createSubject = async (req, res) => {
  try {
    const { name, code, description, gradeIds } = req.body;
    
    const subject = await prisma.$transaction(async (tx) => {
      const newSubject = await tx.subject.create({
        data: { name, code, description },
      });

      if (gradeIds && gradeIds.length > 0) {
        await tx.subjectGrade.createMany({
          data: gradeIds.map(gradeId => ({
            subjectId: newSubject.id,
            gradeId,
          })),
        });
      }

      return newSubject;
    });

    return created(res, subject, 'Subject created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET CBC strands by subject and grade
const getStrands = async (req, res) => {
  try {
    const { subjectId, gradeLevel } = req.query;
    const strands = await prisma.strand.findMany({
      where: {
        ...(subjectId && { subjectId }),
        ...(gradeLevel && { gradeLevel: parseInt(gradeLevel) }),
      },
      include: { subStrands: { include: { learningOutcomes: true } } },
      orderBy: { orderIndex: 'asc' },
    });
    return success(res, strands);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getSubjects, createSubject, getStrands };
