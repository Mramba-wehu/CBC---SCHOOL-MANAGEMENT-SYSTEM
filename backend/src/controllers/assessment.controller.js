const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// RECORD assessment (Teacher)
const recordAssessment = async (req, res) => {
  try {
    const { studentId, learningOutcomeId, termId, rating, teacherNotes } = req.body;

    if (!studentId || !learningOutcomeId || !termId || !rating) {
      return error(res, 'All fields (studentId, outcomeId, termId, rating) are required.', 400);
    }

    const assessment = await prisma.assessment.upsert({
      where: {
        studentId_learningOutcomeId_termId: {
          studentId,
          learningOutcomeId,
          termId,
        }
      },
      update: {
        rating,
        teacherNotes,
        assessedDate: new Date(),
      },
      create: {
        studentId,
        learningOutcomeId,
        termId,
        rating,
        teacherNotes,
      }
    });

    // Post-recording logic: Update Subject Analysis (Strengths/Weaknesses)
    await updateSubjectAnalysis(studentId, learningOutcomeId, termId);

    return success(res, assessment, 'Assessment recorded successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET assessments for a student per subject
const getStudentAssessments = async (req, res) => {
  try {
    const { studentId, subjectId, termId } = req.query;

    const assessments = await prisma.assessment.findMany({
      where: {
        studentId,
        termId,
        learningOutcome: {
          subStrand: {
            strand: {
              subjectId
            }
          }
        }
      },
      include: {
        learningOutcome: {
          include: {
            subStrand: {
              include: {
                strand: true
              }
            }
          }
        }
      },
      orderBy: { learningOutcome: { orderIndex: 'asc' } }
    });

    return success(res, assessments);
  } catch (err) {
    return error(res, err.message);
  }
};

// HELPER: Update Subject Analysis based on assessments
const updateSubjectAnalysis = async (studentId, learningOutcomeId, termId) => {
  // Get subjectId from learningOutcome
  const outcome = await prisma.learningOutcome.findUnique({
    where: { id: learningOutcomeId },
    include: { subStrand: { include: { strand: true } } }
  });
  const subjectId = outcome.subStrand.strand.subjectId;

  // Get all assessments for this student in this subject/term
  const allAssessments = await prisma.assessment.findMany({
    where: {
      studentId,
      termId,
      learningOutcome: {
        subStrand: {
          strand: {
            subjectId
          }
        }
      }
    },
    include: { learningOutcome: true }
  });

  const strengths = allAssessments
    .filter(a => a.rating === 'EE' || a.rating === 'ME')
    .map(a => `Excels in: ${a.learningOutcome.description}`);

  const weaknesses = allAssessments
    .filter(a => a.rating === 'BE' || a.rating === 'AE')
    .map(a => `Needs support in: ${a.learningOutcome.description}`);

  // Calculate overall rating (simplified: mode or average)
  const ratings = allAssessments.map(a => a.rating);
  const ratingPriority = { 'EE': 4, 'ME': 3, 'AE': 2, 'BE': 1 };
  const avg = ratings.reduce((acc, r) => acc + ratingPriority[r], 0) / ratings.length;
  
  let overallRating = 'ME';
  if (avg > 3.5) overallRating = 'EE';
  else if (avg > 2.5) overallRating = 'ME';
  else if (avg > 1.5) overallRating = 'AE';
  else overallRating = 'BE';

  await prisma.studentSubjectAnalysis.upsert({
    where: {
      studentId_subjectId_termId: {
        studentId,
        subjectId,
        termId
      }
    },
    update: {
      strengths,
      weaknesses,
      overallRating,
      generatedAt: new Date()
    },
    create: {
      studentId,
      subjectId,
      termId,
      strengths,
      weaknesses,
      overallRating
    }
  });
};

module.exports = { recordAssessment, getStudentAssessments };
