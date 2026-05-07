import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Staff from './pages/Staff';
import BillingDashboard from './pages/BillingDashboard';
import AcademicAssessment from './pages/AcademicAssessment';
import ProgressPortal from './pages/ProgressPortal';
import AssignmentDashboard from './pages/AssignmentDashboard';
import AttendanceRegister from './pages/AttendanceRegister';
import TimetableManager from './pages/TimetableManager';
import LessonPlanner from './pages/LessonPlanner';
import ReportCardManager from './pages/ReportCardManager';
import AdminPanel from './pages/AdminPanel';
import ParentPortal from './pages/ParentPortal';
import About from './pages/About';
import Portal from './components/Portal';
import Layout from './components/Layout';
import OfflineAlert from './components/OfflineAlert';
import AuthProvider from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <OfflineAlert />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/students" element={<Students />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/cbc" element={<AcademicAssessment />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/assignments" element={<AssignmentDashboard />} />
            <Route path="/attendance" element={<AttendanceRegister />} />
            <Route path="/timetable" element={<TimetableManager />} />
            <Route path="/planning" element={<LessonPlanner />} />
            <Route path="/reports" element={<ReportCardManager />} />
            <Route path="/billing" element={<BillingDashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/settings" element={<AdminPanel />} />
            <Route path="/about" element={<About />} />
            {/* Add more routes as we progress */}
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
