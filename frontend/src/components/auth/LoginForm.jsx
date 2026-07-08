import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiShield, FiPlus } from 'react-icons/fi';
import authService from '../../services/authService';

import Input from '../ui/Input';
import Button from '../ui/Button';
import GoogleLoginButton from '../ui/GoogleLoginButton';
import LiveClock from '../ui/LiveClock';
import Toast from '../ui/Toast';

const LoginForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email address is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setStatus('loading');

    try {
      const data = await authService.login(formData);
      await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay for UX
      
      setStatus('success');
      showToast('Authentication verified. Access granted.', 'success');
      
      setTimeout(() => {
        if (data.user.role === 'Admin') navigate('/admin-dashboard');
        else if (data.user.role === 'Doctor') navigate('/doctor-dashboard');
        else navigate('/patient-dashboard');
      }, 1500);
      
    } catch (err) {
      setStatus('error');
      showToast(err.response?.data?.message || 'Authentication failed. Invalid credentials.', 'error');
    }
  };

  return (
    <div className="w-full lg:w-[500px] lg:max-w-[500px] mx-auto z-10 font-poppins">
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl space-y-6"
      >
        {/* Header section */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
              <FiPlus size={24} strokeWidth={3} />
            </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">DKD Smart Hospital</span>
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Sign in to continue</p>
        </div>

        {/* Live Clock & SSL Badge */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-4">
          <LiveClock />
          <div className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-md">
            <FiShield /> Secure SSL
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <Input
            label="Email"
            name="email"
            type="email"
            icon={FiMail}
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="doctor@dkdhospital.com"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            icon={FiLock}
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
          />

          <div className="flex justify-between items-center">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-slate-600 dark:bg-slate-800"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Remember Me</span>
            </label>
            
            <button type="button" onClick={() => showToast('Reset instructions sent to email.', 'success')} className="text-sm font-semibold text-primary hover:text-blue-700 transition-colors">
              Forgot Password?
            </button>
          </div>

          <Button 
            type="submit" 
            isLoading={status === 'loading' || status === 'success'} 
            className="h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-500 text-white text-[15px] font-bold hover:scale-105 hover:shadow-blue-500/40 transition-all duration-300 w-full flex items-center justify-center"
          >
            {status === 'success' ? 'Authenticated' : 'Sign In'}
          </Button>

          <div className="my-6 flex items-center before:flex-1 before:border-t before:border-slate-200 before:dark:border-slate-700 after:flex-1 after:border-t after:border-slate-200 after:dark:border-slate-700">
            <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
          </div>

          <GoogleLoginButton disabled={status === 'loading' || status === 'success'} />
          
          <div className="text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex flex-col gap-1">
              <span>Don't have an account?</span>
              <a href="mailto:admin@dkdhospital.com" className="font-semibold text-primary hover:underline">
                Contact Administrator
              </a>
            </p>
          </div>
        </form>
        
        {/* Footer */}
        <div className="mt-6 text-center text-xs font-medium text-slate-500 dark:text-slate-500">
          <p>© 2026 DKD Smart Hospital. All Rights Reserved.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
