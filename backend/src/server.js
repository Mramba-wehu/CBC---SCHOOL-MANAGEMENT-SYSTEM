require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth.routes');
const schoolRoutes = require('./routes/school.routes');
const userRoutes = require('./routes/user.routes');
const studentRoutes = require('./routes/student.routes');
const staffRoutes = require('./routes/staff.routes');
const gradeRoutes = require('./routes/grade.routes');
const subjectRoutes = require('./routes/subject.routes');
const academicYearRoutes = require('./routes/academicYear.routes');
const assessmentRoutes = require('./routes/assessment.routes');
const weeklyReportRoutes = require('./routes/weeklyReport.routes');
const assignmentRoutes = require('./routes/assignment.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const timetableRoutes = require('./routes/timetable.routes');
const lessonPlanRoutes = require('./routes/lessonPlan.routes');
const reportCardRoutes = require('./routes/reportCard.routes');
const billingRoutes = require('./routes/billing.routes');
const announcementRoutes = require('./routes/announcement.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const parentRoutes = require('./routes/parent.routes');
const improvementRoutes = require('./routes/improvement.routes');
const adminRoutes = require('./routes/admin.routes');
const notificationRoutes = require('./routes/notification.routes');

const { errorHandler } = require('./middleware/error.middleware');
const prisma = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Health Check ─────────────────────────────
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'OK',
      message: 'Wehu CBC SMS API is running',
      timestamp: new Date().toISOString(),
      database: 'connected',
      demoMode: process.env.DEMO_MODE === 'true',
    });
  } catch (error) {
    res.status(503).json({ status: 'ERROR', database: 'disconnected', error: error.message });
  }
});

// ─── API Routes ───────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/school', schoolRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/weekly-reports', weeklyReportRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/report-cards', reportCardRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/improvement', improvementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// ─── 404 Handler ─────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Error Handler ────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`\n🏫 Wehu CBC SMS API`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🎭 Demo Mode: ${process.env.DEMO_MODE === 'true' ? 'ON' : 'OFF'}\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

module.exports = app;
