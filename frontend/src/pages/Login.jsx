import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Shield, ArrowRight, HeartPulse, Brain, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { FcGoogle } from 'react-icons/fc';

const FeatureCard = ({ icon: Icon, title, subtitle, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-5 bg-[#0f172a]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 hover:bg-white/5 transition-colors"
  >
    <div className="flex-shrink-0 p-3 rounded-2xl bg-cyan-500/10 text-cyan-400">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-white font-bold text-[15px]">{title}</h3>
      <p className="text-slate-400 text-[13px] mt-0.5">{subtitle}</p>
    </div>
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('patient');
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError(errorParam);
      if (errorParam.includes('Administrator') || errorParam.includes('Google') || errorParam.includes('Access Denied')) {
        setViewMode('staff');
      }
    }
  }, [location]);

  const particlesOptions = useMemo(() => ({
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    interactivity: { events: { onHover: { enable: true, mode: "repulse" } }, modes: { repulse: { distance: 100, duration: 0.4 } } },
    particles: {
      color: { value: "#38bdf8" },
      links: { color: "#38bdf8", distance: 150, enable: true, opacity: 0.2, width: 1 },
      move: { enable: true, random: false, speed: 1, straight: false },
      number: { density: { enable: true, area: 800 }, value: 80 },
      opacity: { value: 0.3 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 3 } },
    },
    detectRetina: true,
  }), []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authService.login({ ...formData, role: 'Patient' });
      if (data.user.role === 'Admin') navigate('/admin-dashboard');
      else if (data.user.role === 'Doctor') navigate('/doctor-dashboard');
      else navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex bg-[#030712] overflow-hidden text-slate-300 font-sans relative">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 -z-20">
        <ParticlesProvider init={loadSlim}>
          <Particles id="tsparticles" options={particlesOptions} className="w-full h-full" />
        </ParticlesProvider>
      </div>
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* LEFT SIDE (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-center p-20 z-10 pl-[8%]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-[10px] bg-[#0ea5e9] flex items-center justify-center text-white">
              <Shield size={22} fill="white" className="text-white" />
            </div>
            <span className="text-[17px] font-extrabold text-white tracking-[0.2em] uppercase">
              DKD HOSPITAL
            </span>
          </div>

          <h1 className="text-5xl lg:text-[54px] font-extrabold text-white leading-[1.2] mb-5 tracking-tight">
            AI-Powered Continuous <br />
            <span className="text-[#06b6d4]">
              Patient Telemetry
            </span>
          </h1>
          
          <p className="text-[17px] text-slate-300 mb-10 max-w-xl leading-relaxed">
            Real-Time Patient Monitoring • AI Health Analytics • Emergency Alert System • Smart Hospital Dashboard
          </p>

          <div className="flex flex-col gap-4 max-w-md">
            <FeatureCard icon={HeartPulse} title="Live ECG Monitoring" subtitle="Real-time heart activity tracking" delay={0.2} />
            <FeatureCard icon={Brain} title="AI Disease Prediction" subtitle="Early detection with AI analytics" delay={0.4} />
            <FeatureCard icon={AlertCircle} title="Instant Emergency Alerts" subtitle="Immediate notifications for critical events" delay={0.6} />
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE (40%) - LOGIN CARD */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 z-20 relative">
        <AnimatePresence mode="wait">
          {viewMode === 'patient' && (
            <motion.div 
              key="patient-view"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}
              className="w-full max-w-[480px] bg-[#0A101F]/90 backdrop-blur-3xl border border-[#0ea5e9]/40 rounded-3xl p-10 shadow-[0_0_50px_rgba(14,165,233,0.15)] relative"
            >
              <div className="text-center mb-8">
                <h2 className="text-[34px] font-bold text-white mb-2 tracking-tight">Patient Portal</h2>
                <p className="text-slate-300 text-[14.5px]">Sign in to securely view your health records</p>
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-center border border-red-500/20 text-sm">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-white uppercase tracking-wider">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="tel" name="phone" required placeholder="+1 (555) 000-0000"
                      value={formData.phone} onChange={handleChange} 
                      className="w-full bg-transparent border border-slate-700 rounded-xl py-3 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-[#0ea5e9] transition-colors text-[15px]"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-white uppercase tracking-wider">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type={showPassword ? 'text' : 'password'} name="password" required placeholder="Enter your password"
                      value={formData.password} onChange={handleChange} 
                      className="w-full bg-transparent border border-slate-700 rounded-xl py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:border-[#0ea5e9] transition-colors text-[15px]"
                      style={{ paddingLeft: '2.75rem' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded-[4px] border border-slate-600 flex items-center justify-center bg-transparent group-hover:border-slate-400 transition-colors">
                      <input type="checkbox" className="opacity-0 absolute w-0 h-0" />
                      <div className="w-2 h-2 bg-cyan-400 rounded-[2px] opacity-0 group-focus-within:opacity-100 transition-all"></div>
                    </div>
                    <span className="text-[14px] text-white">Remember me</span>
                  </label>
                  <a href="#" className="text-[14px] text-[#0ea5e9] hover:text-cyan-300 transition-colors">Forgot Password?</a>
                </div>

                <motion.button 
                  type="submit" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  className="w-full py-3 mt-3 rounded-xl bg-gradient-to-r from-blue-600 to-[#00c6ff] text-white font-bold text-[16px] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  {!loading && <ArrowRight size={20} />}
                </motion.button>
              </form>

              <div className="mt-5 text-center text-slate-400 text-[14.5px]">
                New OP Patient?{' '}
                <Link to="/register" className="text-[#0ea5e9] hover:text-cyan-300 transition-colors underline decoration-[#0ea5e9]/50 underline-offset-4">
                  Register here
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-left">
                <button 
                  onClick={() => { setError(''); setViewMode('staff'); }}
                  className="text-slate-400 hover:text-white transition-colors text-[14.5px] flex items-center gap-2"
                >
                  Admin / Doctor Login <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'staff' && (
            <motion.div 
              key="staff-view"
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}
              className="w-full max-w-[480px] bg-[#0A101F]/90 backdrop-blur-3xl border border-[#0ea5e9]/40 rounded-3xl p-10 shadow-[0_0_50px_rgba(14,165,233,0.15)] relative"
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-blue-900 to-[#0ea5e9] rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg border border-white/10">
                  <Shield size={32} />
                </div>
                <h2 className="text-[34px] font-bold text-white mb-2 tracking-tight">Staff Portal</h2>
                <p className="text-slate-300 text-[14.5px]">Secure access for Doctors & Administrators</p>
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 text-center border border-red-500/20 text-sm">
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col gap-4 mb-8">
                <motion.button 
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} onClick={handleGoogleLogin}
                  className="w-full py-3.5 rounded-xl bg-white text-slate-900 font-bold text-[16px] flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <FcGoogle size={24} />
                  Continue with Google
                </motion.button>
              </div>
              
              <div className="text-center text-[13px] text-slate-400 mb-8 max-w-[280px] mx-auto leading-relaxed">
                <p>Authentication restricted to authorized clinical staff and system administrators only.</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800 text-left">
                <button 
                  onClick={() => { setError(''); setViewMode('patient'); }}
                  className="text-slate-400 hover:text-white transition-colors text-[14.5px] flex items-center gap-2"
                >
                  <ArrowLeft size={16} /> Back to Patient Login
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Login;

