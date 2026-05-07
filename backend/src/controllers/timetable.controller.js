const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// SAVE Timetable (Admin/Deputy)
const saveTimetable = async (req, res) => {
  try {
    const { streamId, termId, slots } = req.body;
    // slots: [{ dayOfWeek, startTime, endTime, subjectId, staffId, periodName }]

    const timetable = await prisma.$transaction(async (tx) => {
      // Find or create timetable for this stream/term
      let tt = await tx.timetable.findUnique({
        where: { streamId_termId: { streamId, termId } }
      });

      if (!tt) {
        tt = await tx.timetable.create({ data: { streamId, termId } });
      }

      // Clear existing slots and recreate
      await tx.timetableSlot.deleteMany({ where: { timetableId: tt.id } });

      const newSlots = await tx.timetableSlot.createMany({
        data: slots.map(slot => ({
          timetableId: tt.id,
          ...slot
        }))
      });

      return { tt, slotsCount: newSlots.count };
    });

    return success(res, timetable, 'Timetable saved successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET Timetable for a stream
const getStreamTimetable = async (req, res) => {
  try {
    const { streamId, termId } = req.query;
    const timetable = await prisma.timetable.findUnique({
      where: { streamId_termId: { streamId, termId } },
      include: {
        slots: {
          include: { subject: true }
        }
      }
    });
    return success(res, timetable);
  } catch (err) {
    return error(res, err.message);
  }
};

// GET Timetable for a teacher
const getTeacherTimetable = async (req, res) => {
  try {
    const { staffId, termId } = req.query;
    const slots = await prisma.timetableSlot.findMany({
      where: {
        staffId,
        timetable: { termId }
      },
      include: {
        subject: true,
        timetable: { include: { stream: { include: { grade: true } } } }
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }]
    });
    return success(res, slots);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { saveTimetable, getStreamTimetable, getTeacherTimetable };
