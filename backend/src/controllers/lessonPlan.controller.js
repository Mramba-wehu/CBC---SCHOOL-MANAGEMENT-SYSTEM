const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// CREATE Lesson Plan
const createLessonPlan = async (req, res) => {
  try {
    const { subjectId, termId, weekNumber, date, topic, objectives, activities, resources, assessment, notes } = req.body;
    
    const lessonPlan = await prisma.lessonPlan.create({
      data: {
        staffId: req.user.staffProfile.id,
        subjectId,
        termId,
        weekNumber: parseInt(weekNumber),
        date: new Date(date),
        topic,
        objectives,
        activities,
        resources,
        assessment,
        notes
      }
    });

    return created(res, lessonPlan, 'Lesson plan created successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET Lesson Plans for a teacher
const getMyLessonPlans = async (req, res) => {
  try {
    const { termId, subjectId } = req.query;
    const plans = await prisma.lessonPlan.findMany({
      where: {
        staffId: req.user.staffProfile.id,
        ...(termId && { termId }),
        ...(subjectId && { subjectId })
      },
      include: { subject: true, term: true },
      orderBy: { date: 'desc' }
    });
    return success(res, plans);
  } catch (err) {
    return error(res, err.message);
  }
};

// CREATE Scheme of Work
const createSchemeOfWork = async (req, res) => {
  try {
    const { subjectId, termId, weekNumber, strand, subStrand, learningOutcomes, activities, resources, assessment } = req.body;
    
    const scheme = await prisma.schemeOfWork.create({
      data: {
        staffId: req.user.staffProfile.id,
        subjectId,
        termId,
        weekNumber: parseInt(weekNumber),
        strand,
        subStrand,
        learningOutcomes,
        activities,
        resources,
        assessment
      }
    });

    return created(res, scheme, 'Scheme of work entry created');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET Scheme of Work for a subject/term
const getSchemeOfWork = async (req, res) => {
  try {
    const { subjectId, termId } = req.query;
    const schemes = await prisma.schemeOfWork.findMany({
      where: { subjectId, termId },
      include: { staff: true, subject: true },
      orderBy: { weekNumber: 'asc' }
    });
    return success(res, schemes);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { createLessonPlan, getMyLessonPlans, createSchemeOfWork, getSchemeOfWork };
