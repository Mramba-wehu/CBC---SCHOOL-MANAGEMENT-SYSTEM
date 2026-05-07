import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Connection failed. Ensure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-success/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <motion.div 
        className="login-card w-full max-w-md p-10 glass relative z-10"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-10">
          <motion.div 
            className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/30"
            initial={{ rotate: -15 }}
            animate={{ rotate: 0 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <Shield size={40} className="text-primary" />
          </motion.div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Wehu CBC</h1>
          <p className="text-muted text-sm font-medium">School Management System • Secure Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label className="text-xs uppercase font-bold tracking-widest text-dim mb-2 block">Identity (Email)</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
              <input 
                type="email" 
                className="input pl-12 bg-white/5 border-white/10 focus:border-primary transition-all py-4" 
                placeholder="admin@wehu.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="text-xs uppercase font-bold tracking-widest text-dim mb-2 block">Security Token (Password)</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-dim" size={18} />
              <input 
                type="password" 
                className="input pl-12 bg-white/5 border-white/10 focus:border-primary transition-all py-4" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {error && (
            <motion.div 
              className="p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger text-xs font-bold text-center"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {error}
            </motion.div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary w-full py-4 text-sm font-bold tracking-wide flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                <span>Access Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-muted font-bold uppercase tracking-widest opacity-50">
            Authorized Personnel Only • IP Logged
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
