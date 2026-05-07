import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FileText, Calendar, Users, Send, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AssignmentDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form State for new assignment
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subjectId: '',
    streamId: '',
    dueDate: '',
    maxScore: 10
  });

  const [subjects, setSubjects] = useState([]);
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assignRes, subRes, streamRes] = await Promise.all([
        axios.get('http://localhost:5000/api/assignments'),
        axios.get('http://localhost:5000/api/subjects'),
        axios.get('http://localhost:5000/api/grades') // Simplified for now
      ]);
      setAssignments(assignRes.data.data);
      setSubjects(subRes.data.data);
      // Logic for streams...
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/assignments', newAssignment);
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="assignments-page">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1>Assignments & Homework</h1>
          <p className="text-muted">Manage and track classroom assignments</p>
        </div>
        {user.role !== 'STUDENT' && (
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={20} />
            <span>Create Assignment</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center p-12">Loading assignments...</div>
      ) : (
        <div className="assignments-grid grid">
          {assignments.length === 0 ? (
            <div className="card glass p-12 text-center col-span-full">
              <FileText size={48} className="mx-auto mb-4 text-dim" />
              <p className="text-muted">No assignments published yet.</p>
            </div>
          ) : (
            assignments.map((assignment, index) => (
              <motion.div 
                key={assignment.id} 
                className="assignment-card card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`subject-tag badge ${assignment.subject.name.toLowerCase()}`}>
                    {assignment.subject.name}
                  </div>
                  <div className="status-badge flex items-center gap-1 text-xs font-bold text-success">
                    <CheckCircle size={14} />
                    <span>PUBLISHED</span>
                  </div>
                </div>
                <h3 className="mb-2">{assignment.title}</h3>
                <p className="text-sm text-muted mb-6 line-clamp-2">{assignment.description}</p>
                
                <div className="assignment-meta grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="meta-item flex items-center gap-2 text-xs text-muted">
                    <Calendar size={14} />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="meta-item flex items-center gap-2 text-xs text-muted">
                    <Users size={14} />
                    <span>{assignment._count.submissions} Submissions</span>
                  </div>
                </div>
                
                <button className="btn btn-outline btn-sm w-full mt-6">
                  {user.role === 'STUDENT' ? 'Submit Work' : 'View Submissions'}
                </button>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay glass">
            <motion.div 
              className="modal-content card p-8"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="mb-6">Create New Assignment</h2>
              <form onSubmit={handleCreateAssignment}>
                <div className="form-group mb-4">
                  <label>Title</label>
                  <input 
                    type="text" className="input" 
                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group mb-4">
                  <label>Description</label>
                  <textarea 
                    className="input" rows="3"
                    onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="form-group">
                    <label>Due Date</label>
                    <input 
                      type="date" className="input" 
                      onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Score</label>
                    <input 
                      type="number" className="input" 
                      onChange={(e) => setNewAssignment({...newAssignment, maxScore: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <button type="button" className="btn btn-outline flex-1" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary flex-1">Publish</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AssignmentDashboard;
