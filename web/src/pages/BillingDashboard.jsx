import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, FileText, AlertCircle, Plus, CheckCircle, TrendingUp, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BillingDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices', 'arrears', 'structure'
  const [invoices, setInvoices] = useState([]);
  const [arrears, setArrears] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'invoices') {
        const res = await axios.get('http://localhost:5000/api/billing/arrears'); // Simplified
        setInvoices(res.data.data);
      } else if (activeTab === 'arrears') {
        const res = await axios.get('http://localhost:5000/api/billing/arrears');
        setArrears(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (invoiceId) => {
    try {
      await axios.post('http://localhost:5000/api/billing/payment', {
        invoiceId,
        amount: paymentAmount,
        paymentMethod: 'CASH',
        reference: 'MANUAL_PAYMENT',
        date: new Date()
      });
      alert('Payment recorded!');
      setPaymentAmount('');
      fetchData();
    } catch (err) {
      alert('Error recording payment.');
    }
  };

  return (
    <div className="billing-page">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1>Finance & Billing</h1>
          <p className="text-muted">Manage fee structures, payments, and student balances</p>
        </div>
        <div className="flex gap-4">
          <button className="btn btn-outline">
            <TrendingUp size={18} />
            <span>Financial Reports</span>
          </button>
          <button className="btn btn-primary">
            <Plus size={18} />
            <span>New Fee Structure</span>
          </button>
        </div>
      </div>

      <div className="stats-grid mb-8">
        <div className="stat-card glass">
          <Wallet size={24} className="text-success mb-2" />
          <h3>KES 1.2M</h3>
          <p className="text-muted">Total Collected (Term 2)</p>
        </div>
        <div className="stat-card glass">
          <AlertCircle size={24} className="text-danger mb-2" />
          <h3>KES 450K</h3>
          <p className="text-muted">Total Arrears</p>
        </div>
        <div className="stat-card glass">
          <TrendingUp size={24} className="text-primary mb-2" />
          <h3>72%</h3>
          <p className="text-muted">Collection Rate</p>
        </div>
      </div>

      <div className="tab-switcher flex gap-4 mb-8">
        <button className={`tab-btn ${activeTab === 'invoices' ? 'active' : ''}`} onClick={() => setActiveTab('invoices')}>
          <FileText size={18} />
          <span>Active Invoices</span>
        </button>
        <button className={`tab-btn ${activeTab === 'arrears' ? 'active' : ''}`} onClick={() => setActiveTab('arrears')}>
          <AlertCircle size={18} />
          <span>Arrears List</span>
        </button>
        <button className={`tab-btn ${activeTab === 'structure' ? 'active' : ''}`} onClick={() => setActiveTab('structure')}>
          <CreditCard size={18} />
          <span>Fee Structures</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center p-12">Loading financial data...</div>
      ) : (
        <div className="billing-content animate-fade-in">
          {activeTab === 'invoices' && (
            <div className="invoices-table card glass overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="p-4">Student</th>
                    <th className="p-4">Admission</th>
                    <th className="p-4">Balance (KES)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-t border-white/5">
                      <td className="p-4 font-medium">{invoice.student.firstName} {invoice.student.lastName}</td>
                      <td className="p-4 text-muted">{invoice.student.studentId}</td>
                      <td className="p-4 font-bold text-danger">{invoice.balance.toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`badge ${invoice.status === 'PAID' ? 'badge-success' : 'badge-warning'}`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <input 
                            type="number" className="input text-xs w-24" placeholder="Amount"
                            onChange={(e) => setPaymentAmount(e.target.value)}
                          />
                          <button className="btn btn-primary btn-sm" onClick={() => handleRecordPayment(invoice.id)}>
                            Pay
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {activeTab === 'structure' && (
            <div className="structure-view p-12 text-center card glass">
              <CreditCard size={48} className="mx-auto mb-4 text-dim" />
              <p className="text-muted">Fee structures for Grades 1-9 have been configured. <br/>You can update them in the settings module.</p>
              <button className="btn btn-outline mt-6">View Grade 1 Structure</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BillingDashboard;
