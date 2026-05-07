import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, GraduationCap, CreditCard, BookOpen, TrendingUp, Calendar, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    staff: 0,
    attendance: '94%',
    revenue: '1.2M'
  });

  useEffect(() => {
    // Fetch real stats here in a real scenario
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard-page">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.profile?.firstName || 'User'}</h1>
          <p className="text-muted">Here's what's happening at Wehu CBC School today.</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full border border-primary/20">
          <Calendar size={18} />
          <span className="font-bold text-sm">{new Date().toLocaleDateString('en-KE', { dateStyle: 'long' })}</span>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="stat-card glass hover:border-primary transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/20 rounded-xl text-primary"><Users size={24} /></div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Total Students</p>
              <h2 className="text-2xl font-bold">482</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-success text-xs font-bold">
            <TrendingUp size={14} /> <span>+12 this term</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="stat-card glass hover:border-success transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-success/20 rounded-xl text-success"><CheckCircle size={24} /></div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Today's Attendance</p>
              <h2 className="text-2xl font-bold">96.4%</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-muted text-xs">
            <Clock size={14} /> <span>Updated 10m ago</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="stat-card glass hover:border-warning transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-warning/20 rounded-xl text-warning"><CreditCard size={24} /></div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Fee Collection</p>
              <h2 className="text-2xl font-bold">KES 3.4M</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-warning text-xs font-bold">
            <AlertCircle size={14} /> <span>15% arrears remaining</span>
          </div>
        </motion.div>

        <motion.div variants={item} className="stat-card glass hover:border-info transition-all cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-info/20 rounded-xl text-info"><BookOpen size={24} /></div>
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">Active Lessons</p>
              <h2 className="text-2xl font-bold">24</h2>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1 text-info text-xs font-bold">
             <span>Grade 1 - 9 active</span>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="card glass p-8 h-full">
            <div className="flex justify-between items-center mb-8">
              <h3 className="flex items-center gap-2"><TrendingUp size={20} className="text-primary" /> Academic Performance</h3>
              <select className="input text-xs w-32 py-1">
                <option>Grade 4</option>
                <option>Grade 1</option>
              </select>
            </div>
            <div className="performance-chart h-64 flex items-end justify-between gap-4 px-4">
              {[65, 80, 45, 90, 70, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div 
                    className="w-full bg-primary/20 rounded-t-lg relative group"
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[10px] font-bold px-2 py-1 rounded">
                      {h}%
                    </div>
                  </motion.div>
                  <span className="text-[10px] text-muted font-bold">Sub {i+1}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-muted mt-8">Overall academic rating: <span className="text-success font-bold">Exceeding Expectations (EE)</span></p>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card glass p-8 h-full">
            <h3 className="mb-6 flex items-center gap-2"><Clock size={20} className="text-warning" /> Recent Activity</h3>
            <div className="activity-feed space-y-6">
              {[
                { title: 'Assessment Recorded', user: 'Mrs. Kamau', time: '5m ago', type: 'academic' },
                { title: 'Fee Payment Received', user: 'KES 15,000', time: '20m ago', type: 'finance' },
                { title: 'Report Card Approved', user: 'Principal', time: '1h ago', type: 'admin' },
                { title: 'New Student Admitted', user: 'Receptionist', time: '3h ago', type: 'admin' },
              ].map((act, i) => (
                <div key={i} className="activity-item flex gap-4">
                  <div className={`w-1.5 h-full rounded-full ${act.type === 'academic' ? 'bg-primary' : act.type === 'finance' ? 'bg-success' : 'bg-warning'}`}></div>
                  <div>
                    <p className="text-sm font-bold">{act.title}</p>
                    <p className="text-xs text-muted">{act.user} • {act.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn btn-outline w-full mt-8">View All Activity</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Helper to avoid CheckCircle error if not imported
const CheckCircle = ({ size }) => <GraduationCap size={size} />;
