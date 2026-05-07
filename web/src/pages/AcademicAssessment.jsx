import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, CheckCircle, AlertCircle, Search, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AcademicAssessment = () => {
  const [grades, setGrades] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [strands, setStrands] = useState([]);
  
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  
  const [assessments, setAssessments] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const ratings = [
    { code: 'EE', label: 'Exceeds Expectation', color: 'badge-success' },
    { code: 'ME', label: 'Meets Expectation', color: 'badge-info' },
    { code: 'AE', label: 'Approaches Expectation', color: 'badge-warning' },
    { code: 'BE', label: 'Below Expectation', color: 'badge-danger' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [gRes, sRes] = await Promise.all([
        axios.get('http://localhost:5000/api/grades'),
        axios.get('http://localhost:5000/api/subjects')
      ]);
      setGrades(gRes.data.data);
      setSubjects(sRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeChange = async (gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedStream('');
    setStudents([]);
    try {
      const res = await axios.get(`http://localhost:5000/api/grades/${gradeId}/streams`);
      setStreams(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStreamChange = async (streamId) => {
    setSelectedStream(streamId);
    try {
      const res = await axios.get(`http://localhost:5000/api/students?streamId=${streamId}`);
      setStudents(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadCurriculum = async () => {
    if (!selectedSubject || !selectedGrade) return;
    const grade = grades.find(g => g.id === selectedGrade);
    try {
      const res = await axios.get(`http://localhost:5000/api/subjects/curriculum/strands?subjectId=${selectedSubject}&gradeLevel=${grade.level}`);
      setStrands(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCurriculum();
  }, [selectedSubject, selectedGrade]);

  const handleRatingChange = (outcomeId, rating) => {
    setAssessments(prev => ({
      ...prev,
      [outcomeId]: { ...prev[outcomeId], rating }
    }));
  };

  const handleNoteChange = (outcomeId, notes) => {
    setAssessments(prev => ({
      ...prev,
      [outcomeId]: { ...prev[outcomeId], notes }
    }));
  };

  const saveAssessments = async () => {
    if (!selectedStudent) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const termRes = await axios.get('http://localhost:5000/api/academic-years/current-term');
      const termId = termRes.data.data.id;

      const promises = Object.entries(assessments).map(([outcomeId, data]) => {
        return axios.post('http://localhost:5000/api/assessments', {
          studentId: selectedStudent.id,
          learningOutcomeId: outcomeId,
          termId,
          rating: data.rating,
          teacherNotes: data.notes
        });
      });

      await Promise.all(promises);
      setMessage({ type: 'success', text: 'All assessments saved successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save some assessments.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="assessment-page">
      <div className="page-header mb-6">
        <h1>CBC Academic Assessment</h1>
        <p className="text-muted">Record formative assessments for learning outcomes</p>
      </div>

      <div className="assessment-grid">
        {/* Selection Sidebar */}
        <div className="selection-panel card p-6">
          <div className="form-group mb-4">
            <label>Select Grade</label>
            <select className="input" value={selectedGrade} onChange={(e) => handleGradeChange(e.target.value)}>
              <option value="">-- Choose Grade --</option>
              {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
          </div>

          <div className="form-group mb-4">
            <label>Select Stream</label>
            <select className="input" value={selectedStream} onChange={(e) => handleStreamChange(e.target.value)} disabled={!selectedGrade}>
              <option value="">-- Choose Stream --</option>
              {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="form-group mb-6">
            <label>Select Subject</label>
            <select className="input" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
              <option value="">-- Choose Subject --</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <hr className="mb-6" />

          <div className="student-list">
            <h4 className="mb-4">Students ({students.length})</h4>
            {students.length === 0 ? (
              <p className="text-dim text-sm">Select a stream to see students.</p>
            ) : (
              <div className="student-items">
                {students.map(student => (
                  <button 
                    key={student.id} 
                    className={`student-btn ${selectedStudent?.id === student.id ? 'active' : ''}`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <User size={16} />
                    <span>{student.firstName} {student.lastName}</span>
                    <ChevronRight size={14} className="ml-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assessment Entry Area */}
        <div className="entry-panel">
          {!selectedStudent ? (
            <div className="empty-state card glass">
              <Search size={48} className="mb-4 text-dim" />
              <h3>No Student Selected</h3>
              <p className="text-muted">Please select a grade, stream, and student to begin assessment.</p>
            </div>
          ) : (
            <motion.div 
              className="assessment-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              key={selectedStudent.id}
            >
              <div className="student-header card p-6 mb-6">
                <div className="flex items-center gap-4">
                  <div className="user-avatar large">
                    {selectedStudent.photo ? <img src={selectedStudent.photo} /> : <span>{selectedStudent.firstName[0]}</span>}
                  </div>
                  <div>
                    <h2>{selectedStudent.firstName} {selectedStudent.lastName}</h2>
                    <p className="text-muted">{selectedStudent.studentId} • {selectedStudent.stream.grade.name} {selectedStudent.stream.name}</p>
                  </div>
                  <button 
                    className="btn btn-primary ml-auto" 
                    onClick={saveAssessments}
                    disabled={isSaving || Object.keys(assessments).length === 0}
                  >
                    <Save size={18} />
                    <span>{isSaving ? 'Saving...' : 'Save All Ratings'}</span>
                  </button>
                </div>
                {message && (
                  <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${message.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span>{message.text}</span>
                  </div>
                )}
              </div>

              <div className="strands-list">
                {strands.map(strand => (
                  <div key={strand.id} className="strand-section mb-8">
                    <h3 className="mb-4 text-primary">{strand.name}</h3>
                    {strand.subStrands.map(subStrand => (
                      <div key={subStrand.id} className="substrand-card card p-6 mb-4">
                        <h4 className="mb-4">{subStrand.name}</h4>
                        <div className="outcomes-table">
                          {subStrand.learningOutcomes.map(outcome => (
                            <div key={outcome.id} className="outcome-row p-4">
                              <div className="outcome-info">
                                <p className="font-medium">{outcome.description}</p>
                                <textarea 
                                  placeholder="Teacher remarks..." 
                                  className="input text-sm mt-2" 
                                  rows="1"
                                  onChange={(e) => handleNoteChange(outcome.id, e.target.value)}
                                ></textarea>
                              </div>
                              <div className="outcome-rating">
                                {ratings.map(r => (
                                  <button 
                                    key={r.code}
                                    className={`rating-btn ${r.code} ${assessments[outcome.id]?.rating === r.code ? 'selected' : ''}`}
                                    onClick={() => handleRatingChange(outcome.id, r.code)}
                                    title={r.label}
                                  >
                                    {r.code}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcademicAssessment;
