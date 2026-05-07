const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// MARK attendance (Teacher)
const markAttendance = async (req, res) => {
  try {
    const { studentId, subjectId, termId, date, status, notes } = req.body;

    const attendance = await prisma.attendance.upsert({
      where: {
        studentId_subjectId_date: {
          studentId,
          subjectId,
          date: new Date(date),
        }
      },
      update: { status, notes },
      create: {
        studentId,
        subjectId,
        termId,
        date: new Date(date),
        status,
        notes
      }
    });

    return success(res, attendance, 'Attendance marked successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET attendance for a student (Parent/Student/Teacher)
const getStudentAttendance = async (req, res) => {
  try {
    const { studentId, termId, subjectId } = req.query;
    const attendance = await prisma.attendance.findMany({
      where: {
        studentId,
        termId,
        ...(subjectId && { subjectId })
      },
      include: { subject: true },
      orderBy: { date: 'desc' }
    });

    const stats = {
      present: attendance.filter(a => a.status === 'PRESENT').length,
      absent: attendance.filter(a => a.status === 'ABSENT').length,
      late: attendance.filter(a => a.status === 'LATE').length,
      total: attendance.length
    };

    return success(res, { records: attendance, stats });
  } catch (err) {
    return error(res, err.message);
  }
};

// BULK mark attendance for a class (Teacher)
const bulkMarkAttendance = async (req, res) => {
  try {
    const { streamId, subjectId, termId, date, attendanceData } = req.body;
    // attendanceData: [{ studentId, status, notes }]

    const records = await Promise.all(attendanceData.map(data => {
      return prisma.attendance.upsert({
        where: {
          studentId_subjectId_date: {
            studentId: data.studentId,
            subjectId,
            date: new Date(date)
          }
        },
        update: { status: data.status, notes: data.notes },
        create: {
          studentId: data.studentId,
          subjectId,
          termId,
          date: new Date(date),
          status: data.status,
          notes: data.notes
        }
      });
    }));

    return success(res, records, `Attendance for ${records.length} students marked.`);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { markAttendance, getStudentAttendance, bulkMarkAttendance };
