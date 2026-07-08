import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import authService from '../services/authService';

import Input from './ui/Input';
import Button from './ui/Button';
import GoogleButton from './ui/GoogleButton';
import ForgotPassword from './ui/ForgotPassword';
import ThemeToggle from './ui/ThemeToggle';
import Toast from './ui/Toast';
import Logo from './ui/Logo';

const LoginCard = () => {
  const navigate = useNavigate();
  
  // State Machine Logic
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Doctor'
  });
  
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  // Input Validation Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear specific error on typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, isVisible: false })), 4000);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStatus('loading');

    try {
      // Real API Call
      const data = await authService.login(formData);
      
      // Fake delay to show spinner if API is too fast
      await new Promise(resolve => setTimeout(resolve, 800));
      
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

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="relative w-full max-w-lg z-10 mx-auto lg:ml-auto">
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      {/* Floating Glassmorphism Container */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/40 dark:border-slate-800/60 p-8 sm:p-12 rounded-[24px] shadow-2xl"
      >
        {/* Header */}
        <div className="mb-8 text-center sm:text-left flex flex-col items-center sm:items-start">
          <div className="sm:hidden mb-6">
            <Logo />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-poppins tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Sign in to your clinical account</p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
          
          <Input
            label="Email Address"
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

          {/* Role Selector */}
          <div className="flex flex-col space-y-1.5 w-full font-poppins">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Clinical Role
            </label>
            <div className="relative">
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="block w-full rounded-xl bg-white dark:bg-slate-900/60 border-2 border-slate-200 dark:border-slate-700/80 p-3.5 text-sm font-medium text-slate-800 dark:text-slate-100 hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-600/20 outline-none transition-all duration-300 appearance-none cursor-pointer"
              >
                <option value="Doctor">Doctor / Physician</option>
                <option value="Nurse">Nurse / Clinical Staff</option>
                <option value="Patient">Patient</option>
                <option value="Admin">System Admin</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                <FiCheckCircle className="absolute text-white w-3 h-3 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Remember device</span>
            </label>
            
            <ForgotPassword onClick={() => showToast('Reset instructions dispatched to email.', 'success')} />
          </div>

          <div className="pt-4">
            <Button 
              type="submit" 
              isLoading={status === 'loading' || status === 'success'} 
              className="h-14 text-[15px] shadow-blue-600/25 shadow-xl"
            >
              {status === 'success' ? 'Verified' : 'Authenticate Identity'}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative py-4 flex items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Or Continue With</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
          </div>

          <GoogleButton 
            onClick={() => showToast('OAuth SSO integration pending.', 'error')} 
            disabled={status === 'loading' || status === 'success'} 
          />
          
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Unregistered personnel?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500 transition-colors underline-offset-4 hover:underline">
                Request Access
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginCard;
