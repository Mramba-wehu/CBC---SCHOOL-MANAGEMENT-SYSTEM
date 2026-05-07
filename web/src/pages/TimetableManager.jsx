import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Clock, Edit3, Trash2, Plus, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TimetableManager = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(null);
  const [selectedStream, setSelectedStream] = useState('');
  const [streams, setStreams] = useState([]);
  const [term, setTerm] = useState(null);
  
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const periods = [
    { name: 'Period 1', start: '08:00', end: '08:40' },
    { name: 'Period 2', start: '08:40', end: '09:20' },
    { name: 'Break', start: '09:20', end: '09:50', isBreak: true },
    { name: 'Period 3', start: '09:50', end: '10:30' },
    { name: 'Period 4', start: '10:30', end: '11:10' },
    { name: 'Lunch', start: '11:10', end: '12:10', isBreak: true },
    { name: 'Period 5', start: '12:10', end: '12:50' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [streamRes, termRes] = await Promise.all([
        axios.get('http://localhost:5000/api/grades'), // Simplified
        axios.get('http://localhost:5000/api/academic-years/current-term')
      ]);
      setTerm(termRes.data.data);
      // Logic to flatten streams...
    } catch (err) {
      console.error(err);
    }
  };

  const getSlot = (day, periodName) => {
    if (!timetable) return null;
    return timetable.slots.find(s => s.dayOfWeek === day && s.periodName === periodName);
  };

  return (
    <div className="timetable-page">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1>School Timetable</h1>
          <p className="text-muted">Academic schedule for Term {term?.termNumber}, {term?.academicYear?.year}</p>
        </div>
        <div className="flex gap-4">
          {user.role === 'SUPER_ADMIN' && (
            <button className="btn btn-outline">
              <Edit3 size={18} />
              <span>Modify Schedule</span>
            </button>
          )}
          <button className="btn btn-primary">
            <Plus size={18} />
            <span>Apply Template</span>
          </button>
        </div>
      </div>

      <div className="timetable-grid card glass overflow-x-auto p-1">
        <table className="w-full min-w-[800px] border-collapse">
          <thead>
            <tr>
              <th className="p-4 bg-white/5 border border-white/10 w-32">Time</th>
              {days.map(day => (
                <th key={day} className="p-4 bg-white/5 border border-white/10">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map(period => (
              <tr key={period.name} className={period.isBreak ? 'bg-white/5' : ''}>
                <td className="p-4 border border-white/10 text-center">
                  <div className="font-bold text-sm">{period.name}</div>
                  <div className="text-xs text-dim">{period.start} - {period.end}</div>
                </td>
                {days.map(day => {
                  const slot = getSlot(day, period.name);
                  return (
                    <td key={`${day}-${period.name}`} className={`p-4 border border-white/10 relative ${period.isBreak ? 'text-dim text-center italic' : ''}`}>
                      {period.isBreak ? (
                        <span>{period.name}</span>
                      ) : slot ? (
                        <div className="slot-card bg-primary/10 border border-primary/20 p-2 rounded">
                          <p className="font-bold text-xs text-primary">{slot.subject.name}</p>
                          <p className="text-[10px] text-muted">Room 4B • Mrs. Kamau</p>
                        </div>
                      ) : (
                        <div className="empty-slot h-10 flex items-center justify-center opacity-10">
                          <Plus size={14} />
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TimetableManager;
