import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Download, Send, AlertCircle, Search, Printer } from 'lucide-react';

const ReportCardManager = () => {
  const [grades, setGrades] = useState([]);
  const [streams, setStreams] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [term, setTerm] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [gRes, tRes] = await Promise.all([
        axios.get('http://localhost:5000/api/grades'),
        axios.get('http://localhost:5000/api/academic-years/current-term')
      ]);
      setGrades(gRes.data.data);
      setTerm(tRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadReports = async (streamId) => {
    setSelectedStream(streamId);
    setIsLoading(true);
    try {
      // In a real system, we'd fetch existing report cards for this stream
      // For now, we'll fetch students and show their report status
      const res = await axios.get(`http://localhost:5000/api/students?streamId=${streamId}`);
      setReports(res.data.data.map(s => ({ ...s, status: 'NOT_GENERATED' })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateData = async (studentId) => {
    try {
      await axios.post('http://localhost:5000/api/report-cards/aggregate', {
        studentId,
        termId: term.id
      });
      alert('Report data aggregated!');
      loadReports(selectedStream);
    } catch (err) {
      alert('Error aggregating data.');
    }
  };

  const handlePrintPDF = async (reportId) => {
    try {
      const res = await axios.post(`http://localhost:5000/api/report-cards/${reportId}/generate-pdf`);
      window.open(`http://localhost:5000/${res.data.data.fileUrl}`, '_blank');
    } catch (err) {
      alert('Error generating PDF.');
    }
  };

  return (
    <div className="reports-page">
      <div className="page-header mb-8">
        <h1>Report Cards & Assessments</h1>
        <p className="text-muted">Generate and approve end-of-term CBC report cards</p>
      </div>

      <div className="card glass p-6 mb-8 flex gap-6 items-end">
        <div className="form-group">
          <label>Grade</label>
          <select className="input" onChange={(e) => setSelectedGrade(e.target.value)}>
            <option value="">-- Select Grade --</option>
            {grades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Stream</label>
          <select className="input" disabled={!selectedGrade} onChange={(e) => loadReports(e.target.value)}>
            <option value="">-- Select Stream --</option>
            {grades.find(g => g.id === selectedGrade)?.streams.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => alert('Generating all...')}>
          <CheckCircle size={18} />
          <span>Generate All</span>
        </button>
      </div>

      <div className="reports-list card glass overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-white/5">
              <th className="p-4">Student</th>
              <th className="p-4">Admission</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan="4" className="p-12 text-center">Loading...</td></tr>
            ) : reports.length === 0 ? (
              <tr><td colSpan="4" className="p-12 text-center text-dim">Select a stream to see reports.</td></tr>
            ) : (
              reports.map(report => (
                <tr key={report.id} className="border-t border-white/5">
                  <td className="p-4 font-medium">{report.firstName} {report.lastName}</td>
                  <td className="p-4 text-muted">{report.studentId}</td>
                  <td className="p-4">
                    <span className={`badge ${report.status === 'RELEASED' ? 'badge-success' : 'badge-warning'}`}>
                      {report.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        className="btn btn-outline btn-sm" 
                        onClick={() => handleGenerateData(report.id)}
                        title="Sync Assessment Data"
                      >
                        <FileText size={16} />
                      </button>
                      <button 
                        className="btn btn-outline btn-sm"
                        onClick={() => alert('Open Comment Editor')}
                        title="Add Comments"
                      >
                        <AlertCircle size={16} />
                      </button>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePrintPDF(report.id)}
                        title="Generate & Print PDF"
                      >
                        <Printer size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportCardManager;
