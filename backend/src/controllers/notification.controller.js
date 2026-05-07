const prisma = require('../config/database');
const { success, error } = require('../utils/response');
const { sendSMS, sendEmail } = require('../utils/notifications');

// SEND Bulk Announcement (Admin)
const sendBulkNotification = async (req, res) => {
  try {
    const { target, subject, message, channels } = req.body;
    // target: { role, gradeId, streamId }
    // channels: ['SMS', 'EMAIL', 'PUSH']

    let users = [];
    if (target.role === 'PARENT') {
      users = await prisma.user.findMany({
        where: { role: 'PARENT' },
        include: { parentProfile: true }
      });
    } else if (target.gradeId) {
      users = await prisma.user.findMany({
        where: { studentProfile: { stream: { gradeId: target.gradeId } } }
      });
    }

    const results = { sms: 0, email: 0 };

    for (const user of users) {
      if (channels.includes('SMS') && user.parentProfile?.phone) {
        await sendSMS(user.parentProfile.phone, message);
        results.sms++;
      }
      if (channels.includes('EMAIL') && user.email) {
        await sendEmail(user.email, subject, `<p>${message}</p>`);
        results.email++;
      }
    }

    // Record the announcement in DB
    await prisma.announcement.create({
      data: {
        title: subject,
        content: message,
        targetRoles: [target.role || 'ALL'],
        createdById: req.user.id
      }
    });

    return success(res, results, `Notification sent to ${results.sms} via SMS and ${results.email} via Email.`);
  } catch (err) {
    return error(res, err.message);
  }
};

module.exports = { sendBulkNotification };
