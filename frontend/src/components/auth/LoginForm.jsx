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
    <div className="w-full lg:w-[460px] lg:max-w-[460px] mx-auto z-10 font-poppins">
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 p-[48px] pt-[32px] pl-[32px] rounded-[28px] shadow-[0_8px_32px_0_rgba(0,0,0,0.15)] flex flex-col"
      >
        {/* Header section */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left mb-2">
          <div className="flex items-center gap-3 mb-4 lg:hidden">
            <div className="bg-gradient-to-br from-[#0057B8] to-[#0A2540] p-2.5 rounded-xl shadow-md border border-white/10">
              <FiPlus className="text-white w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-xl font-bold text-white">DKD Smart Hospital</span>
          </div>
          
          <h2 className="text-[40px] font-bold text-white mb-2 leading-tight">Welcome Back</h2>
          <p className="text-white/70 text-sm font-medium">Sign in to continue</p>
        </div>

        {/* Live Clock & SSL Badge */}
        <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
          <div className="text-white/80 text-xs font-semibold">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-1 rounded-md border border-green-500/20">
            <FiShield /> Secure SSL
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-[24px]">
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
            placeholder="Password"
          />

          <div className="flex justify-between items-center px-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00B4D8] focus:ring-[#00B4D8]"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="text-sm font-medium text-white/80">Remember Me</span>
            </label>
            
            <button type="button" onClick={() => showToast('Reset instructions sent to email.', 'success')} className="text-sm font-semibold text-[#00B4D8] hover:text-white transition-colors">
              Forgot Password?
            </button>
          </div>

          <div className="mt-2">
            <Button 
              type="submit" 
              isLoading={status === 'loading' || status === 'success'} 
              className="h-[56px] rounded-full bg-gradient-to-r from-[#0057B8] to-[#00B4D8] hover:shadow-[0_0_20px_rgba(0,180,216,0.4)] text-white text-[18px] font-bold transition-all duration-300 w-full flex items-center justify-center border border-white/10"
            >
              {status === 'success' ? 'Authenticated' : 'Sign In'}
            </Button>
          </div>

          <div className="my-5 flex justify-center relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative bg-[#071B2F]/10 px-4">
              <span className="text-xs font-bold text-white/50 uppercase tracking-widest bg-transparent">OR</span>
            </div>
          </div>

          <GoogleLoginButton disabled={status === 'loading' || status === 'success'} />
        </form>
        
        {/* Footer */}
        <div className="mt-10 mb-2 flex justify-center">
          <div className="text-center text-xs font-medium text-white/50 flex flex-col gap-1 w-full">
            <p>
              Need Help? <a href="mailto:support@dkdhospital.com" className="text-[#00B4D8] hover:text-white transition-colors">Contact Administrator</a>
            </p>
            <p className="mt-2">© 2026 DKD Smart Hospital.<br/>All Rights Reserved.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginForm;
