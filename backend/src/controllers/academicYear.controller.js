const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// GET all academic years
const getAcademicYears = async (req, res) => {
  try {
    const years = await prisma.academicYear.findMany({
      include: { terms: true },
      orderBy: { year: 'desc' },
    });
    return success(res, years);
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE academic year and terms
const createAcademicYear = async (req, res) => {
  try {
    const { year, startDate, endDate, schoolId, terms } = req.body;
    
    const academicYear = await prisma.$transaction(async (tx) => {
      // Deactivate other current years if this is marked current
      if (req.body.isCurrent) {
        await tx.academicYear.updateMany({
          where: { isCurrent: true },
          data: { isCurrent: false },
        });
      }

      const newYear = await tx.academicYear.create({
        data: {
          year: parseInt(year),
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isCurrent: req.body.isCurrent || false,
          schoolId,
        },
      });

      if (terms && terms.length > 0) {
        await tx.term.createMany({
          data: terms.map(term => ({
            termNumber: term.termNumber,
            name: term.name,
            startDate: new Date(term.startDate),
            endDate: new Date(term.endDate),
            isCurrent: term.isCurrent || false,
            academicYearId: newYear.id,
          })),
        });
      }

      return newYear;
    });

    return created(res, academicYear, 'Academic year and terms created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET current term
const getCurrentTerm = async (req, res) => {
  try {
    const term = await prisma.term.findFirst({
      where: { isCurrent: true },
      include: { academicYear: true },
    });
    if (!term) return error(res, 'No current term set.', 404);
    return success(res, term);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getAcademicYears, createAcademicYear, getCurrentTerm };
