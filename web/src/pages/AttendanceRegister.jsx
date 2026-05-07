import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Check, X, Clock, Save, Search, User } from 'lucide-react';

const AttendanceRegister = () => {
  const [grades, setGrades] = useState([]);
  const [streams, setStreams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendance, setAttendance] = useState({}); // { studentId: { status, notes } }
  const [isSaving, setIsSaving] = useState(false);

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
    try {
      const res = await axios.get(`http://localhost:5000/api/grades/${gradeId}/streams`);
      setStreams(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadStudents = async (streamId) => {
    setSelectedStream(streamId);
    try {
      const res = await axios.get(`http://localhost:5000/api/students?streamId=${streamId}`);
      const studentList = res.data.data;
      setStudents(studentList);
      
      // Initialize attendance state with PRESENT for all
      const initial = {};
      studentList.forEach(s => {
        initial[s.id] = { status: 'PRESENT', notes: '' };
      });
      setAttendance(initial);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const termRes = await axios.get('http://localhost:5000/api/academic-years/current-term');
      const termId = termRes.data.data.id;

      const attendanceData = Object.entries(attendance).map(([studentId, data]) => ({
        studentId,
        status: data.status,
        notes: data.notes
      }));

      await axios.post('http://localhost:5000/api/attendance/bulk', {
        streamId: selectedStream,
        subjectId: selectedSubject,
        termId,
        date,
        attendanceData
      });
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="attendance-page">
      <div className="page-header mb-8">
        <h1>Digital Attendance Register</h1>
        <p className="text-muted">Mark daily subject attendance for your classes</p>
      </div>

      <div className="card p-6 mb-8 flex flex-wrap gap-6 items-end glass">
        <div className="form-group">
          <label>Date</label>
          <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Grade</label>
          <select className="input" value={selectedGrade} onChange={(e) => handleGradeChange(e.target.value)}>
            <option value="">-- Select Grade --</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Stream</label>
          <select className="input" value={selectedStream} onChange={(e) => loadStudents(e.target.value)} disabled={!selectedGrade}>
            <option value="">-- Select Stream --</option>
            {streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Subject</label>
          <select className="input" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
            <option value="">-- Select Subject --</option>
            {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={isSaving || !selectedStream || !selectedSubject}>
          <Save size={18} />
          <span>{isSaving ? 'Saving...' : 'Submit Register'}</span>
        </button>
      </div>

      {students.length > 0 && (
        <motion.div 
          className="attendance-list card glass overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4">Student Name</th>
                <th className="p-4">Admission No</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-t border-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="user-avatar small">
                        {student.photo ? <img src={student.photo} /> : <span>{student.firstName[0]}</span>}
                      </div>
                      <span className="font-medium">{student.firstName} {student.lastName}</span>
                    </div>
                  </td>
                  <td className="p-4 text-muted">{student.studentId}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        className={`status-btn p-2 rounded-lg ${attendance[student.id]?.status === 'PRESENT' ? 'bg-success text-white' : 'bg-white/5 text-dim'}`}
                        onClick={() => handleStatusChange(student.id, 'PRESENT')}
                        title="Present"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        className={`status-btn p-2 rounded-lg ${attendance[student.id]?.status === 'ABSENT' ? 'bg-danger text-white' : 'bg-white/5 text-dim'}`}
                        onClick={() => handleStatusChange(student.id, 'ABSENT')}
                        title="Absent"
                      >
                        <X size={18} />
                      </button>
                      <button 
                        className={`status-btn p-2 rounded-lg ${attendance[student.id]?.status === 'LATE' ? 'bg-warning text-white' : 'bg-white/5 text-dim'}`}
                        onClick={() => handleStatusChange(student.id, 'LATE')}
                        title="Late"
                      >
                        <Clock size={18} />
                      </button>
                    </div>
                  </td>
                  <td className="p-4">
                    <input 
                      type="text" className="input text-xs" placeholder="e.g. Sent to hospital"
                      value={attendance[student.id]?.notes || ''}
                      onChange={(e) => setAttendance(prev => ({ ...prev, [student.id]: { ...prev[student.id], notes: e.target.value } }))}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
};

export default AttendanceRegister;
