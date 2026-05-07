import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Settings, Users, CreditCard, Send, Shield, Zap, TrendingUp, Filter } from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [financials, setFinancials] = useState(null);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bulk Promotion State
  const [promotion, setPromotion] = useState({ from: '', to: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [finRes, gradeRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/financial-summary'),
        axios.get('http://localhost:5000/api/grades')
      ]);
      setFinancials(finRes.data.data);
      setGrades(gradeRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="page-header mb-8">
        <h1>Administrative Control Center</h1>
        <p className="text-muted">High-level management and bulk school operations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="card glass p-4 flex flex-col gap-2">
            <button className={`tab-btn w-full ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
              <TrendingUp size={18} /> <span>Executive Summary</span>
            </button>
            <button className={`tab-btn w-full ${activeTab === 'bulk' ? 'active' : ''}`} onClick={() => setActiveTab('bulk')}>
              <Zap size={18} /> <span>Bulk Operations</span>
            </button>
            <button className={`tab-btn w-full ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>
              <Send size={18} /> <span>Broadcast Tools</span>
            </button>
            <button className={`tab-btn w-full ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
              <Shield size={18} /> <span>System Security</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'summary' && financials && (
            <div className="summary-view animate-fade-in">
              <div className="stats-grid mb-8">
                <div className="stat-card glass">
                  <p className="text-xs text-muted mb-1">Expected Revenue</p>
                  <h3 className="text-primary">KES {financials.expected.toLocaleString()}</h3>
                </div>
                <div className="stat-card glass">
                  <p className="text-xs text-muted mb-1">Actual Collection</p>
                  <h3 className="text-success">KES {financials.collected.toLocaleString()}</h3>
                </div>
                <div className="stat-card glass">
                  <p className="text-xs text-muted mb-1">Collection Rate</p>
                  <h3 className="text-warning">{financials.collectionRate}%</h3>
                </div>
              </div>

              <div className="card glass p-8 text-center">
                <TrendingUp size={48} className="mx-auto mb-4 text-dim" />
                <h3>Financial Insights</h3>
                <p className="text-muted max-w-md mx-auto">Overall collection is on track. Focus on Grade 4 arrears which account for 30% of total outstanding balances.</p>
                <button className="btn btn-outline mt-6">Generate Full Audit Report</button>
              </div>
            </div>
          )}

          {activeTab === 'bulk' && (
            <div className="bulk-view animate-fade-in card glass p-8">
              <h3 className="mb-6 flex items-center gap-2"><Zap size={20} className="text-warning" /> Student Promotion</h3>
              <p className="text-sm text-muted mb-8">End of year promotion. This will move all students from one stream to another and increment their academic record.</p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="form-group">
                  <label>Promote From</label>
                  <select className="input">
                    <option>Grade 4 East</option>
                    <option>Grade 4 West</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Promote To</label>
                  <select className="input">
                    <option>Grade 5 East</option>
                    <option>Grade 5 West</option>
                  </select>
                </div>
              </div>

              <button className="btn btn-primary w-full" onClick={() => alert('Promotion Process Initiated')}>
                Start Bulk Promotion
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-view animate-fade-in card glass p-8">
              <h3 className="mb-6">Send School Broadcast</h3>
              <div className="form-group mb-4">
                <label>Target Audience</label>
                <select className="input">
                  <option>All Parents</option>
                  <option>All Staff</option>
                  <option>Grade 4 Parents Only</option>
                </select>
              </div>
              <div className="form-group mb-4">
                <label>Subject</label>
                <input type="text" className="input" placeholder="e.g. Term 3 Closing Date" />
              </div>
              <div className="form-group mb-6">
                <label>Message Content</label>
                <textarea className="input" rows="4" placeholder="Type your message here..."></textarea>
              </div>
              <div className="flex gap-6 mb-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked readOnly /> <span>SMS</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked readOnly /> <span>Email</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" /> <span>Push Notification</span>
                </label>
              </div>
              <button className="btn btn-primary w-full">Broadcast Notification</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
