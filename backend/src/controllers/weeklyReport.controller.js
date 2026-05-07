const prisma = require('../config/database');
const { success, error } = require('../utils/response');
const { format, startOfWeek, endOfWeek } = require('date-fns');

// GENERATE weekly reports for a class/stream (Admin/Teacher)
const generateWeeklyReports = async (req, res) => {
  try {
    const { streamId, termId, weekNumber } = req.body;

    const students = await prisma.student.findMany({
      where: { streamId, status: 'ACTIVE' },
      include: {
        assessments: {
          where: {
            termId,
            assessedDate: {
              gte: startOfWeek(new Date(), { weekStartsOn: 1 }),
              lte: endOfWeek(new Date(), { weekStartsOn: 1 })
            }
          },
          include: { learningOutcome: true }
        }
      }
    });

    const reports = await Promise.all(students.map(async (student) => {
      const summary = student.assessments.length > 0
        ? `Student has been assessed in ${student.assessments.length} learning outcomes this week. Most common rating: ${calculateMode(student.assessments.map(a => a.rating))}`
        : 'No formal assessments recorded this week.';

      return prisma.weeklyReport.upsert({
        where: {
          studentId_termId_weekNumber: {
            studentId: student.id,
            termId,
            weekNumber
          }
        },
        update: {
          summary,
          generatedAt: new Date(),
        },
        create: {
          studentId: student.id,
          termId,
          weekNumber,
          weekStartDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
          weekEndDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
          summary
        }
      });
    }));

    return success(res, reports, `${reports.length} weekly reports generated/updated.`);
  } catch (err) {
    return error(res, err.message);
  }
};

// GET weekly reports for a student
const getStudentWeeklyReports = async (req, res) => {
  try {
    const { studentId, termId } = req.query;
    const reports = await prisma.weeklyReport.findMany({
      where: { studentId, termId },
      orderBy: { weekNumber: 'desc' }
    });
    return success(res, reports);
  } catch (err) {
    return error(res, err.message);
  }
};

// Helper to calculate mode of ratings
const calculateMode = (arr) => {
  if (arr.length === 0) return 'N/A';
  const mapping = {};
  let maxFreq = 0;
  let mode = arr[0];
  for (const item of arr) {
    mapping[item] = (mapping[item] || 0) + 1;
    if (mapping[item] > maxFreq) {
      maxFreq = mapping[item];
      mode = item;
    }
  }
  return mode;
};

module.exports = { generateWeeklyReports, getStudentWeeklyReports };
