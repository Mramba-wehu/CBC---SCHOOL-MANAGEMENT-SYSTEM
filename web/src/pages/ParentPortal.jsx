import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Users, CreditCard, FileText, Bell, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ParentPortal = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/students/my-students');
      setChildren(res.data.data);
      if (res.data.data.length > 0) setSelectedChild(res.data.data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="parent-portal">
      <div className="page-header mb-8">
        <h1>Parent Dashboard</h1>
        <p className="text-muted">Manage your children's academic and financial records</p>
      </div>

      <div className="portal-grid">
        {/* Child Selection & Overview */}
        <div className="child-selector mb-8 flex gap-4">
          {children.map(child => (
            <button 
              key={child.id} 
              className={`child-btn card glass p-4 flex items-center gap-3 ${selectedChild?.id === child.id ? 'active' : ''}`}
              onClick={() => setSelectedChild(child)}
            >
              <div className="user-avatar small">
                {child.photo ? <img src={child.photo} /> : <span>{child.firstName[0]}</span>}
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">{child.firstName}</p>
                <p className="text-xs text-dim">{child.stream.grade.name}</p>
              </div>
            </button>
          ))}
        </div>

        {selectedChild && (
          <motion.div 
            className="dashboard-content grid grid-cols-1 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={selectedChild.id}
          >
            {/* Academic Summary */}
            <div className="card glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2"><FileText size={20} className="text-primary" /> Progress</h3>
                <button className="text-xs text-primary font-bold">Details</button>
              </div>
              <div className="summary-list">
                <div className="flex justify-between mb-4">
                  <span className="text-sm text-muted">Attendance Rate</span>
                  <span className="text-sm font-bold">94%</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-sm text-muted">Last Assessment</span>
                  <span className="badge badge-success">ME</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-sm text-muted">Recent Weekly Report</span>
                  <span className="text-xs text-dim">Week 5</span>
                </div>
              </div>
              <button className="btn btn-outline btn-sm w-full mt-4">View Report Card</button>
            </div>

            {/* Financial Summary */}
            <div className="card glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2"><CreditCard size={20} className="text-success" /> Fees</h3>
                <button className="text-xs text-success font-bold">History</button>
              </div>
              <div className="fee-summary text-center py-4">
                <p className="text-xs text-muted mb-1">Outstanding Balance</p>
                <h2 className="text-3xl font-bold text-danger">KES 14,250</h2>
              </div>
              <div className="flex flex-col gap-3 mt-4">
                <button className="btn btn-primary btn-sm">Pay Fees (M-Pesa)</button>
                <button className="btn btn-outline btn-sm">Download Statement</button>
              </div>
            </div>

            {/* Announcements */}
            <div className="card glass p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center gap-2"><Bell size={20} className="text-warning" /> Updates</h3>
                <button className="text-xs text-warning font-bold">View All</button>
              </div>
              <div className="updates-list flex flex-col gap-4">
                {[1, 2].map(i => (
                  <div key={i} className="update-item flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-1.5"></div>
                    <div>
                      <p className="text-sm font-medium">Term 3 School Reopening</p>
                      <p className="text-xs text-dim">2 days ago</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ParentPortal;
