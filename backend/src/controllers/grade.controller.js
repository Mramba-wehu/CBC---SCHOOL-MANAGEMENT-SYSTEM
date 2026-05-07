const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// GET all grades
const getGrades = async (req, res) => {
  try {
    const grades = await prisma.grade.findMany({
      include: { streams: true },
      orderBy: { level: 'asc' },
    });
    return success(res, grades);
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE grade
const createGrade = async (req, res) => {
  try {
    const { name, level } = req.body;
    const grade = await prisma.grade.create({
      data: { name, level: parseInt(level) },
    });
    return created(res, grade, 'Grade created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE stream
const createStream = async (req, res) => {
  try {
    const { name, gradeId } = req.body;
    const stream = await prisma.stream.create({
      data: { name, gradeId },
    });
    return created(res, stream, 'Stream created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET streams by grade
const getStreamsByGrade = async (req, res) => {
  try {
    const { gradeId } = req.params;
    const streams = await prisma.stream.findMany({
      where: { gradeId },
      include: { grade: true },
    });
    return success(res, streams);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { getGrades, createGrade, createStream, getStreamsByGrade };
