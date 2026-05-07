import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CreditCard, 
  BookOpen, 
  Calendar, 
  Bell, 
  LogOut, 
  Menu, 
  X,
  Settings,
  ShieldCheck,
  TrendingUp,
  FileText,
  CheckCircle,
  Shield,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'BURSAR', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'RECEPTIONIST'] },
    { name: 'Portal', icon: TrendingUp, path: '/portal', roles: ['PARENT', 'STUDENT'] },
    { name: 'Students', icon: Users, path: '/students', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'DEPUTY_PRINCIPAL', 'CLASS_TEACHER', 'RECEPTIONIST'] },
    { name: 'Staff Members', icon: UserSquare2, path: '/staff', roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
    { name: 'Academic CBC', icon: BookOpen, path: '/cbc', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'] },
    { name: 'Assignments', icon: FileText, path: '/assignments', roles: ['ALL'] },
    { name: 'Attendance', icon: CheckCircle, path: '/attendance', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'] },
    { name: 'Lesson Planning', icon: BookOpen, path: '/planning', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER', 'SUBJECT_TEACHER'] },
    { name: 'Report Cards', icon: FileText, path: '/reports', roles: ['SUPER_ADMIN', 'PRINCIPAL', 'CLASS_TEACHER'] },
    { name: 'Finance & Billing', icon: CreditCard, path: '/billing', roles: ['SUPER_ADMIN', 'BURSAR', 'PARENT'] },
    { name: 'Control Center', icon: Shield, path: '/admin', roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
    { name: 'Timetable', icon: Calendar, path: '/timetable', roles: ['ALL'] },
    { name: 'Announcements', icon: Bell, path: '/announcements', roles: ['ALL'] },
    { name: 'About System', icon: Info, path: '/about', roles: ['ALL'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['SUPER_ADMIN', 'PRINCIPAL'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes('ALL') || item.roles.includes(user?.role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <motion.aside 
        className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 80 }}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">W</div>
            {isSidebarOpen && <span className="logo-text">Wehu SMS</span>}
          </div>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <item.icon size={22} />
              {isSidebarOpen && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.profile?.photo ? (
                <img src={user.profile.photo} alt="User" />
              ) : (
                <div className="avatar-placeholder">{user?.profile?.firstName?.[0] || 'A'}</div>
              )}
            </div>
            {isSidebarOpen && (
              <div className="user-details">
                <p className="user-name">{user?.profile?.firstName} {user?.profile?.lastName}</p>
                <p className="user-role">{user?.role?.replace('_', ' ')}</p>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar glass">
          <div className="top-bar-left">
            <h2 className="page-title">Welcome back, {user?.profile?.firstName}</h2>
          </div>
          <div className="top-bar-right">
            <div className="notification-bell">
              <Bell size={20} />
              <span className="notification-dot"></span>
            </div>
            <div className="role-badge">
              <ShieldCheck size={16} />
              <span>{user?.role}</span>
            </div>
          </div>
        </header>

        <div className="content-area animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
