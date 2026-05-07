const prisma = require('../config/database');
const { success, error } = require('../utils/response');

// PROMOTE Students (Admin)
const promoteStudents = async (req, res) => {
  try {
    const { fromStreamId, toStreamId } = req.body;

    const students = await prisma.student.findMany({
      where: { streamId: fromStreamId, status: 'ACTIVE' }
    });

    const promoted = await prisma.$transaction(students.map(student => {
      return prisma.student.update({
        where: { id: student.id },
        data: { streamId: toStreamId }
      });
    }));

    return success(res, promoted, `${promoted.length} students promoted to the new stream.`);
  } catch (err) {
    return error(res, err.message);
  }
};

// GENERATE Financial Summary (Admin)
const getFinancialSummary = async (req, res) => {
  try {
    const { termId } = req.query;

    const [totalExpected, totalCollected] = await Promise.all([
      prisma.invoice.aggregate({
        where: { termId },
        _sum: { totalAmount: true }
      }),
      prisma.payment.aggregate({
        where: { invoice: { termId } },
        _sum: { amount: true }
      })
    ]);

    const arrears = (totalExpected._sum.totalAmount || 0) - (totalCollected._sum.amount || 0);

    return success(res, {
      expected: totalExpected._sum.totalAmount || 0,
      collected: totalCollected._sum.amount || 0,
      arrears,
      collectionRate: totalExpected._sum.totalAmount ? ((totalCollected._sum.amount / totalExpected._sum.amount) * 100).toFixed(2) : 0
    });
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { promoteStudents, getFinancialSummary };
