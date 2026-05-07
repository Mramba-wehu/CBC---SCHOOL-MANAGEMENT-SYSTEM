const nodemailer = require('nodemailer');
const africastalking = require('africastalking');

// Initialize Africa's Talking
const at = africastalking({
  apiKey: process.env.AT_API_KEY || 'your_api_key',
  username: process.env.AT_USERNAME || 'sandbox'
});

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const sendSMS = async (to, message) => {
  try {
    const sms = at.SMS;
    const response = await sms.send({ to: [to], message });
    console.log('SMS sent:', response);
    return response;
  } catch (error) {
    console.error('SMS failed:', error);
    throw error;
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Wehu CBC School" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email failed:', error);
    throw error;
  }
};

module.exports = { sendSMS, sendEmail };
