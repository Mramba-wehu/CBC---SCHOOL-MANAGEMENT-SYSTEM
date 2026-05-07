const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// CREATE assignment (Teacher)
const createAssignment = async (req, res) => {
  try {
    const { title, description, subjectId, termId, streamId, dueDate, maxScore } = req.body;
    const attachments = req.files ? req.files.map(f => `uploads/assignments/${f.filename}`) : [];

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subjectId,
        termId,
        streamId,
        dueDate: new Date(dueDate),
        maxScore: parseFloat(maxScore),
        attachments,
        createdById: req.user.id,
        status: 'PUBLISHED'
      }
    });

    return created(res, assignment, 'Assignment published successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// SUBMIT assignment (Student)
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, content } = req.body;
    const studentProfile = await prisma.studentProfile.findUnique({ where: { userId: req.user.id } });
    if (!studentProfile) return error(res, 'Student profile not found.', 404);

    const attachments = req.files ? req.files.map(f => `uploads/assignments/${f.filename}`) : [];

    const submission = await prisma.submission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId: studentProfile.studentId
        }
      },
      update: {
        content,
        attachments: { push: attachments },
        submittedAt: new Date(),
        status: 'SUBMITTED'
      },
      create: {
        assignmentId,
        studentId: studentProfile.studentId,
        content,
        attachments,
        status: 'SUBMITTED'
      }
    });

    return success(res, submission, 'Assignment submitted successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GRADE submission (Teacher)
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: parseFloat(score),
        feedback,
        status: 'GRADED',
        gradedAt: new Date(),
        gradedById: req.user.id
      }
    });

    return success(res, submission, 'Submission graded');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET assignments for a class
const getAssignments = async (req, res) => {
  try {
    const { streamId, subjectId, termId } = req.query;
    const assignments = await prisma.assignment.findMany({
      where: {
        ...(streamId && { streamId }),
        ...(subjectId && { subjectId }),
        ...(termId && { termId })
      },
      include: { subject: true, _count: { select: { submissions: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return success(res, assignments);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { createAssignment, submitAssignment, gradeSubmission, getAssignments };
