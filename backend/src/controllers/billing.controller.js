const prisma = require('../config/database');
const { success, created, error } = require('../utils/response');

// SET UP Fee Structure (Bursar/Admin)
const createFeeStructure = async (req, res) => {
  try {
    const { gradeId, termId, academicYearId, items } = req.body;
    // items: [{ name: 'Tuition', amount: 15000, isOptional: false }]

    const feeStructure = await prisma.feeStructure.create({
      data: {
        gradeId,
        termId,
        academicYearId,
        items: {
          create: items.map(item => ({
            name: item.name,
            amount: parseFloat(item.amount),
            isOptional: item.isOptional || false
          }))
        }
      },
      include: { items: true }
    });

    return created(res, feeStructure, 'Fee structure created');
  } catch (err) {
    return error(res, err.message);
  }
};

// GENERATE Invoices for a Grade/Stream
const generateInvoices = async (req, res) => {
  try {
    const { gradeId, termId } = req.body;

    const feeStructure = await prisma.feeStructure.findFirst({
      where: { gradeId, termId },
      include: { items: true }
    });

    if (!feeStructure) return error(res, 'No fee structure found for this grade/term.', 404);

    const students = await prisma.student.findMany({
      where: { stream: { gradeId }, status: 'ACTIVE' }
    });

    const totalAmount = feeStructure.items.reduce((sum, item) => sum + item.amount, 0);

    const invoices = await Promise.all(students.map(async (student) => {
      return prisma.invoice.create({
        data: {
          studentId: student.id,
          termId,
          totalAmount,
          balance: totalAmount,
          status: 'PENDING',
          items: {
            create: feeStructure.items.map(item => ({
              name: item.name,
              amount: item.amount
            }))
          }
        }
      });
    }));

    return success(res, invoices, `${invoices.length} invoices generated.`);
  } catch (err) {
    return error(res, err.message);
  }
};

// RECORD Payment (Bursar)
const recordPayment = async (req, res) => {
  try {
    const { invoiceId, amount, paymentMethod, reference, date } = req.body;

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return error(res, 'Invoice not found.', 404);

    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          invoiceId,
          amount: parseFloat(amount),
          paymentMethod,
          reference,
          paymentDate: new Date(date || Date.now()),
          recordedById: req.user.id
        }
      });

      const newBalance = invoice.balance - parseFloat(amount);
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          balance: newBalance,
          status: newBalance <= 0 ? 'PAID' : 'PARTIAL'
        }
      });

      return newPayment;
    });

    return created(res, payment, 'Payment recorded successfully');
  } catch (err) {
    return error(res, err.message);
  }
};

// GET Arrears List
const getArrears = async (req, res) => {
  try {
    const { gradeId } = req.query;
    const invoices = await prisma.invoice.findMany({
      where: {
        balance: { gt: 0 },
        student: { stream: { gradeId } }
      },
      include: { student: true, term: true },
      orderBy: { balance: 'desc' }
    });
    return success(res, invoices);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { createFeeStructure, generateInvoices, recordPayment, getArrears };
