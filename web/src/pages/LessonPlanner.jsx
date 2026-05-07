import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { BookOpen, FileText, Plus, Save, ChevronRight, Layout } from 'lucide-react';

const LessonPlanner = () => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'schemes'
  const [lessonPlans, setLessonPlans] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'plans' ? '/api/lesson-plans/my-plans' : '/api/lesson-plans/schemes';
      const res = await axios.get(`http://localhost:5000${endpoint}`);
      if (activeTab === 'plans') setLessonPlans(res.data.data);
      else setSchemes(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lesson-planner-page">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1>Academic Planning</h1>
          <p className="text-muted">Manage your schemes of work and daily lesson plans</p>
        </div>
        <button className="btn btn-primary">
          <Plus size={20} />
          <span>New {activeTab === 'plans' ? 'Lesson Plan' : 'Scheme Entry'}</span>
        </button>
      </div>

      <div className="tab-switcher flex gap-4 mb-8">
        <button 
          className={`tab-btn ${activeTab === 'plans' ? 'active' : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          <FileText size={18} />
          <span>Daily Lesson Plans</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
          onClick={() => setActiveTab('schemes')}
        >
          <Layout size={18} />
          <span>Schemes of Work</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12">Loading planning data...</div>
      ) : (
        <div className="planner-content animate-fade-in">
          {activeTab === 'plans' ? (
            <div className="plans-grid grid grid-cols-1 md:grid-cols-2 gap-6">
              {lessonPlans.length === 0 ? (
                <div className="card glass p-12 text-center col-span-full">
                  <BookOpen size={48} className="mx-auto mb-4 text-dim" />
                  <p className="text-muted">No lesson plans created for this term.</p>
                </div>
              ) : (
                lessonPlans.map(plan => (
                  <div key={plan.id} className="plan-card card p-6 hover:border-primary transition-colors cursor-pointer">
                    <div className="flex justify-between items-start mb-4">
                      <span className="badge badge-info">Week {plan.weekNumber}</span>
                      <span className="text-xs text-muted">{new Date(plan.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="mb-2">{plan.topic}</h3>
                    <p className="text-sm text-dim mb-4 line-clamp-2">Objectives: {plan.objectives}</p>
                    <div className="flex items-center gap-2 text-xs text-primary font-bold">
                      <FileText size={14} />
                      <span>{plan.subject.name}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="schemes-table card glass overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-4">Week</th>
                    <th className="p-4">Strand / Sub-strand</th>
                    <th className="p-4">Learning Outcomes</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {schemes.length === 0 ? (
                    <tr><td colSpan="4" className="p-12 text-center text-dim">No schemes of work generated.</td></tr>
                  ) : (
                    schemes.map(scheme => (
                      <tr key={scheme.id} className="border-t border-white/5">
                        <td className="p-4 font-bold">Week {scheme.weekNumber}</td>
                        <td className="p-4">
                          <p className="font-medium">{scheme.strand}</p>
                          <p className="text-xs text-dim">{scheme.subStrand}</p>
                        </td>
                        <td className="p-4 text-sm max-w-md">{scheme.learningOutcomes}</td>
                        <td className="p-4 text-center">
                          <button className="btn btn-outline btn-sm">View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonPlanner;
