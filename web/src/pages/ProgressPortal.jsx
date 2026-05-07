import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Award, Target, FileText, ChevronRight, TrendingUp, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProgressPortal = () => {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [termData, setTermData] = useState(null);
  const [weeklyReports, setWeeklyReports] = useState([]);
  const [analysis, setAnalysis] = useState([]);
  const [materials, setMaterials] = useState([]);
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const termRes = await axios.get('http://localhost:5000/api/academic-years/current-term');
      setTermData(termRes.data.data);
      
      const studentRes = await axios.get('http://localhost:5000/api/students/my-students');
      const students = studentRes.data.data;
      if (students.length > 0) {
        handleStudentSelect(students[0], termRes.data.data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStudentSelect = async (student, termId) => {
    setSelectedStudent(student);
    try {
      const [reportsRes, materialRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/weekly-reports/student?studentId=${student.id}&termId=${termId}`),
        axios.get(`http://localhost:5000/api/improvement/suggestions?studentId=${student.id}&termId=${termId}`)
      ]);
      setWeeklyReports(reportsRes.data.data);
      setMaterials(materialRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getRatingColor = (rating) => {
    const map = { 'EE': 'var(--success)', 'ME': 'var(--info)', 'AE': 'var(--warning)', 'BE': 'var(--danger)' };
    return map[rating] || 'var(--text-muted)';
  };

  return (
    <div className="progress-portal">
      <div className="page-header mb-8">
        <h1>Learning Progress Portal</h1>
        <p className="text-muted">Tracking competencies and learning outcomes</p>
      </div>

      <div className="portal-grid">
        {/* Left Column: Summary & Weekly Reports */}
        <div className="left-column">
          <div className="card glass p-6 mb-6 welcome-banner">
            <div className="flex items-center gap-4">
              <Award size={48} className="text-primary" />
              <div>
                <h2>Hello, {user.profile.firstName}!</h2>
                <p className="text-muted">Viewing progress for: <span className="text-main font-bold">{selectedStudent?.firstName}</span></p>
              </div>
            </div>
          </div>

          <div className="weekly-reports-section">
            <div className="section-header flex justify-between items-center mb-4">
              <h3>Weekly Progress Reports</h3>
              <FileText size={20} className="text-muted" />
            </div>
            {weeklyReports.length === 0 ? (
              <div className="card p-6 text-center text-dim">No weekly reports available yet.</div>
            ) : (
              <div className="reports-list">
                {weeklyReports.map(report => (
                  <motion.div 
                    key={report.id} 
                    className="report-card card p-4 mb-3"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold">Week {report.weekNumber}</p>
                        <p className="text-xs text-muted">Term {termData?.termNumber}</p>
                      </div>
                      <span className="badge badge-success">Released</span>
                    </div>
                    <p className="mt-3 text-sm">{report.summary}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Strengths/Weaknesses & Materials */}
        <div className="right-column">
          <div className="analysis-section mb-8">
            <div className="section-header flex items-center gap-2 mb-4">
              <Target size={22} className="text-secondary" />
              <h3>Improvement Roadmap</h3>
            </div>
            
            {materials.length === 0 ? (
              <div className="card glass p-8 text-center">
                <TrendingUp size={32} className="text-dim mb-2 mx-auto" />
                <p className="text-muted">Performance data is being analyzed to generate your personal roadmap.</p>
              </div>
            ) : (
              <div className="materials-list">
                <p className="text-sm text-muted mb-4">Recommended resources based on current learning gaps:</p>
                {materials.map(material => (
                  <div key={material.id} className="material-card card p-5 mb-4 border-l-4 border-primary">
                    <div className="flex justify-between">
                      <h4 className="text-primary">{material.title}</h4>
                      <span className="text-xs font-bold text-muted">{material.resourceType?.toUpperCase()}</span>
                    </div>
                    <p className="text-sm my-2">{material.description}</p>
                    <div className="flex items-center justify-between mt-4">
                      <p className="text-xs text-dim italic">Linked to: {material.learningOutcome?.subStrand.strand.subject.name}</p>
                      <button className="btn btn-outline btn-sm text-xs">Open Resource</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="help-card card p-6 bg-primary/5 border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <HelpCircle className="text-primary" />
              <h4>Need Clarification?</h4>
            </div>
            <p className="text-sm text-muted mb-4">If you have questions about the ratings or comments, please visit the school or contact the class teacher via email.</p>
            <button className="btn btn-primary w-full btn-sm">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPortal;
