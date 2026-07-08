import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiShield, FiActivity, FiHeart } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import authService from '../services/authService';

import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import GoogleButton from '../components/ui/GoogleButton';
import Logo from '../components/ui/Logo';
import ForgotPassword from '../components/ui/ForgotPassword';
import ThemeToggle from '../components/ui/ThemeToggle';
import Toast from '../components/ui/Toast';
import Loader from '../components/ui/Loader';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    role: 'Doctor'
  });
  
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ isVisible: false, message: '', type: 'success' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showToast = (message, type = 'success') => {
    setToast({ isVisible: true, message, type });
    setTimeout(() => setToast({ isVisible: false, message: '', type: 'success' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authService.login(formData);
      
      showToast('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        // Redirect based on role
        if (data.user.role === 'Admin') {
          navigate('/admin-dashboard');
        } else if (data.user.role === 'Doctor') {
          navigate('/doctor-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      }, 1000);
      
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed. Please check credentials.', 'error');
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark font-poppins selection:bg-primary/30">
      <Toast {...toast} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />

      {/* LEFT SIDE - Illustration Panel (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-primary to-secondary p-12 flex-col justify-between">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
            <FiActivity className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white m-0 tracking-tight leading-none">KMCH <span className="font-light">AI</span></h2>
            <p className="text-white/80 text-xs font-medium uppercase tracking-widest mt-1">Health Management</p>
          </div>
        </div>

        {/* Middle Content - Floating Elements & ECG */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center mt-12">
          
          <div className="relative w-full max-w-md aspect-square">
            {/* Center Glowing Orb */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <motion.div 
                className="absolute w-32 h-32 bg-white/20 backdrop-blur-md rounded-full border border-white/30 flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <FiHeart className="w-12 h-12 text-white drop-shadow-md" />
              </motion.div>
            </div>

            {/* Floating Icons */}
            <motion.div variants={floatVariants} animate="animate" className="absolute top-10 left-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <FaStethoscope className="w-8 h-8 text-white" />
            </motion.div>
            
            <motion.div variants={floatVariants} animate="animate" transition={{ delay: 1 }} className="absolute bottom-20 left-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <FiShield className="w-8 h-8 text-white" />
            </motion.div>

            <motion.div variants={floatVariants} animate="animate" transition={{ delay: 2 }} className="absolute top-32 right-4 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <FiActivity className="w-8 h-8 text-white" />
            </motion.div>

            {/* ECG Line Path SVG */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 opacity-50">
              <svg width="100%" height="100" viewBox="0 0 500 100" preserveAspectRatio="none">
                <motion.path
                  d="M0 50 L150 50 L170 20 L200 90 L230 10 L250 50 L500 50"
                  fill="none"
                  stroke="rgba(255,255,255,0.8)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="relative z-10 text-white mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold mb-4 leading-tight font-poppins"
          >
            AI Patient Health<br/>Management System
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-3 text-white/80 font-medium"
          >
            <div className="flex items-center gap-2"><FiCheckCircle size={18} className="text-white"/> Real-Time Patient Monitoring</div>
            <div className="flex items-center gap-2"><FiCheckCircle size={18} className="text-white"/> AI Early Warning Alerts</div>
            <div className="flex items-center gap-2"><FiCheckCircle size={18} className="text-white"/> Secure Healthcare Platform</div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        {/* Mobile Background Elements */}
        <div className="absolute lg:hidden top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute lg:hidden bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4"></div>

        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md z-10"
        >
          {/* Form Card */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 p-8 sm:p-10 rounded-[32px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:shadow-none">
            
            <motion.div variants={itemVariants} className="mb-10 text-center lg:text-left flex flex-col items-center lg:items-start">
              <div className="lg:hidden mb-6">
                <Logo />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Welcome Back</h2>
              <p className="text-slate-500 dark:text-slate-400">Sign in to your account to continue</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              <motion.div variants={itemVariants}>
                <Input
                  label="Username"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  icon={FiMail}
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  icon={FiLock}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="mt-2">
                <div className="mb-2">
                  <label className="text-sm text-slate-500 dark:text-slate-400 block mb-1">Login As</label>
                  <select 
                    name="role" 
                    value={formData.role} 
                    onChange={handleChange}
                    className="w-full rounded-xl bg-white/50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700/50 p-3 text-sm text-slate-800 dark:text-slate-100 focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-300"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Patient">Patient</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-600 rounded bg-transparent peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                    <FiCheckCircle className="absolute text-white w-3 h-3 opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">Remember Me</span>
                </label>
                
                <ForgotPassword onClick={() => showToast('Password reset link sent to email', 'success')} />
              </motion.div>

              <motion.div variants={itemVariants} className="pt-2">
                <Button type="submit" isLoading={loading} className="h-14 text-[15px]">
                  Sign In to Account
                </Button>
              </motion.div>

              <motion.div variants={itemVariants} className="relative py-2 flex items-center">
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-slate-200 dark:border-slate-700"></div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <GoogleButton onClick={() => showToast('Google login is not configured', 'error')} />
              </motion.div>

            </form>

            <motion.div variants={itemVariants} className="mt-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-primary hover:text-secondary transition-colors underline-offset-4 hover:underline">
                  Create Account
                </Link>
              </p>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </div>
  );
};

// Quick missing icon for the features list
const FiCheckCircle = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export default Login;
