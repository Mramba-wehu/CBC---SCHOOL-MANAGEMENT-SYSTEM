const prisma = require('../config/database');
const { success, error } = require('../utils/response');
const puppeteer = require('puppeteer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs');

// GENERATE Report Card Data (Aggregate all ratings)
const aggregateReportCardData = async (req, res) => {
  try {
    const { studentId, termId } = req.body;

    const [student, term, assessments, attendance, analysis] = await Promise.all([
      prisma.student.findUnique({ where: { id: studentId }, include: { stream: { include: { grade: true } } } }),
      prisma.term.findUnique({ where: { id: termId }, include: { academicYear: true } }),
      prisma.assessment.findMany({
        where: { studentId, termId },
        include: { learningOutcome: { include: { subStrand: { include: { strand: { include: { subject: true } } } } } } }
      }),
      prisma.attendance.findMany({ where: { studentId, termId } }),
      prisma.studentSubjectAnalysis.findMany({ where: { studentId, termId }, include: { subject: true } })
    ]);

    const attendanceStats = {
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      total: attendance.length
    };

    // Group assessments by subject and strand
    const reportData = {
      student,
      term,
      attendanceStats,
      subjects: analysis.map(sa => {
        const subjectAssessments = assessments.filter(a => a.learningOutcome.subStrand.strand.subjectId === sa.subjectId);
        return {
          subjectName: sa.subject.name,
          overallRating: sa.overallRating,
          strengths: sa.strengths,
          weaknesses: sa.weaknesses,
          strands: [...new Set(subjectAssessments.map(a => a.learningOutcome.subStrand.strand.name))].map(strandName => ({
            name: strandName,
            ratings: subjectAssessments.filter(a => a.learningOutcome.subStrand.strand.name === strandName).map(a => ({
              subStrand: a.learningOutcome.subStrand.name,
              outcome: a.learningOutcome.description,
              rating: a.rating,
              teacherNotes: a.teacherNotes
            }))
          }))
        };
      })
    };

    // Upsert the ReportCard record
    const reportCard = await prisma.reportCard.upsert({
      where: { studentId_termId: { studentId, termId } },
      update: { data: reportData },
      create: {
        studentId,
        termId,
        data: reportData,
        status: 'DRAFT'
      }
    });

    return success(res, reportCard, 'Report card data aggregated');
  } catch (err) {
    return error(res, err.message);
  }
};

// UPDATE Approval Status
const updateApprovalStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, teacherComments, principalComments } = req.body;

    const reportCard = await prisma.reportCard.update({
      where: { id },
      data: {
        status,
        ...(teacherComments && { teacherComments }),
        ...(principalComments && { principalComments }),
        ...(status === 'RELEASED' && { releasedAt: new Date() })
      }
    });

    return success(res, reportCard, `Status updated to ${status}`);
  } catch (err) {
    return error(res, err.message);
  }
};

// GENERATE PDF using Puppeteer
const generatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const reportCard = await prisma.reportCard.findUnique({
      where: { id },
      include: { student: { include: { stream: { include: { grade: true } } } }, term: { include: { academicYear: true } } }
    });

    if (!reportCard) return error(res, 'Report card not found', 404);

    const templatePath = path.join(__dirname, '../templates/report-card.ejs');
    const html = await ejs.renderFile(templatePath, { report: reportCard.data, comments: reportCard });

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    
    const pdfPath = `uploads/reports/report-${reportCard.student.studentId}-${reportCard.term.name}.pdf`;
    const fullPath = path.join(__dirname, '../../', pdfPath);
    
    // Ensure directory exists
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    await page.pdf({
      path: fullPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });

    await browser.close();

    // Update database with file URL
    await prisma.reportCard.update({
      where: { id },
      data: { fileUrl: pdfPath }
    });

    return success(res, { fileUrl: pdfPath }, 'PDF generated successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { aggregateReportCardData, updateApprovalStatus, generatePDF };
