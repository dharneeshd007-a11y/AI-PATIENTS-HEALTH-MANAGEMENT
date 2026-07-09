import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Shield, ArrowRight, HeartPulse, Brain, Bell, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { FcGoogle } from 'react-icons/fc';

const FeatureCard = ({ icon: Icon, title, subtitle, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: "easeOut" }}
    whileHover={{ y: -5, boxShadow: "0 10px 30px -10px rgba(0,212,255,0.3)" }}
    className="flex items-center gap-5 bg-white/[0.02] backdrop-blur-xl border border-[rgba(0,212,255,0.25)] rounded-[20px] p-5 transition-all duration-300"
  >
    <div className="flex-shrink-0 p-3.5 rounded-[16px] bg-gradient-to-br from-[#009DFF]/20 to-[#00D4FF]/20 text-[#00D4FF] shadow-[0_0_15px_rgba(0,212,255,0.2)]">
      <Icon size={26} strokeWidth={2} />
    </div>
    <div>
      <h3 className="text-white font-bold text-[17px] tracking-wide">{title}</h3>
      <p className="text-[#AAB6D6] text-[14px] mt-1">{subtitle}</p>
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
    interactivity: { events: { onHover: { enable: true, mode: "repulse" } }, modes: { repulse: { distance: 120, duration: 0.4 } } },
    particles: {
      color: { value: "#4FC3FF" },
      links: { color: "#00D4FF", distance: 150, enable: true, opacity: 0.25, width: 1 },
      move: { enable: true, random: false, speed: 1.2, straight: false },
      number: { density: { enable: true, area: 1000 }, value: 90 },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1.5, max: 3.5 } },
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
    <div className="min-h-screen flex bg-gradient-to-br from-[#030817] to-[#071326] overflow-hidden text-white font-[Inter,sans-serif] relative">
      {/* BACKGROUND EFFECTS */}
      <div className="absolute inset-0 -z-20">
        <ParticlesProvider init={loadSlim}>
          <Particles id="tsparticles" options={particlesOptions} className="w-full h-full" />
        </ParticlesProvider>
      </div>
      
      {/* Geometric Nodes & Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#009DFF]/10 blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#00D4FF]/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* LEFT SECTION (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-center px-12 lg:px-20 xl:px-28 z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
          
          <div className="flex items-center gap-4 mb-10">
            <div className="w-[52px] h-[52px] rounded-[16px] bg-gradient-to-br from-[#009DFF] to-[#00D4FF] flex items-center justify-center text-white shadow-[0_0_25px_rgba(0,212,255,0.4)]">
              <Shield size={28} fill="white" className="text-white" />
            </div>
            <span className="text-[20px] font-extrabold text-white tracking-[0.25em] uppercase">
              DKD HOSPITAL
            </span>
          </div>

          <h1 className="text-[72px] font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            AI-Powered Continuous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#009DFF] to-[#00D4FF]">
              Patient Telemetry
            </span>
          </h1>
          
          <p className="text-[19px] text-[#AAB6D6] mb-14 max-w-2xl leading-relaxed tracking-wide font-medium">
            Real-Time Patient Monitoring • AI Health Analytics • Emergency Alert System • Smart Hospital Dashboard
          </p>

          <div className="flex flex-col gap-5 max-w-[500px]">
            <FeatureCard icon={HeartPulse} title="Live ECG Monitoring" subtitle="Real-time heart activity tracking" delay={0.2} />
            <FeatureCard icon={Brain} title="AI Disease Prediction" subtitle="Early detection with AI analytics" delay={0.4} />
            <FeatureCard icon={Bell} title="Instant Emergency Alerts" subtitle="Immediate notifications for critical events" delay={0.6} />
          </div>
          
        </motion.div>
      </div>

      {/* RIGHT SECTION (40%) - LOGIN CARD */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 z-20 relative lg:pr-[6%]">
        <AnimatePresence mode="wait">
          {viewMode === 'patient' && (
            <motion.div 
              key="patient-view"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[500px] bg-[#0A1225]/80 backdrop-blur-3xl border border-[#0ea5e9]/40 rounded-3xl p-10 sm:p-12 shadow-[0_0_50px_rgba(14,165,233,0.15)] relative flex flex-col justify-center"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Patient Portal</h2>
                <p className="text-[#AAB6D6] text-sm sm:text-base font-medium">Sign in to securely view your health records</p>
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-center border border-red-500/20 text-sm font-medium">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#AAB6D6] uppercase tracking-wider pl-1">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4FC3FF]" />
                    <input 
                      type="tel" name="phone" required placeholder="+1 (555) 000-0000"
                      value={formData.phone} onChange={handleChange} 
                      className="w-full h-[52px] bg-[#030817]/50 border border-[rgba(0,212,255,0.2)] rounded-xl pr-4 text-white placeholder-[#AAB6D6]/50 focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all text-base"
                      style={{ paddingLeft: '3rem' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#AAB6D6] uppercase tracking-wider pl-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4FC3FF]" />
                    <input 
                      type={showPassword ? 'text' : 'password'} name="password" required placeholder="Enter your password"
                      value={formData.password} onChange={handleChange} 
                      className="w-full h-[52px] bg-[#030817]/50 border border-[rgba(0,212,255,0.2)] rounded-xl pr-12 text-white placeholder-[#AAB6D6]/50 focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all text-base"
                      style={{ paddingLeft: '3rem' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#AAB6D6] hover:text-[#00D4FF] transition-colors flex items-center justify-center">
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pl-1">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-5 h-5 rounded border border-[#AAB6D6]/50 flex items-center justify-center bg-transparent group-hover:border-[#00D4FF] transition-colors">
                      <input type="checkbox" className="opacity-0 absolute w-0 h-0" />
                      <div className="w-2.5 h-2.5 bg-[#00D4FF] rounded-sm opacity-0 group-focus-within:opacity-100 transition-all"></div>
                    </div>
                    <span className="text-sm text-[#AAB6D6] group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-[#00D4FF] hover:text-[#4FC3FF] transition-colors font-medium">Forgot Password?</a>
                </div>

                <motion.button 
                  type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full h-[52px] mt-4 rounded-xl bg-gradient-to-r from-[#009DFF] to-[#00D4FF] text-white font-bold text-lg flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(0,212,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,212,255,0.6)] transition-all relative overflow-hidden group"
                  disabled={loading}
                >
                  <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
                  {!loading && <ArrowRight size={22} className="relative z-10 group-hover:translate-x-2 transition-transform duration-300" />}
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>
                </motion.button>
              </form>

              <div className="mt-8 text-center text-[#AAB6D6] text-sm">
                New OP Patient?{' '}
                <Link to="/register" className="text-[#00D4FF] hover:text-[#4FC3FF] transition-colors font-semibold underline decoration-2 decoration-[#00D4FF]/40 underline-offset-4">
                  Register here
                </Link>
              </div>

              <div className="mt-8 pt-6 border-t border-[rgba(0,212,255,0.15)] flex justify-start">
                <button 
                  onClick={() => { setError(''); setViewMode('staff'); }}
                  className="text-[#AAB6D6] hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group"
                >
                  Admin / Doctor Login <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'staff' && (
            <motion.div 
              key="staff-view"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[500px] bg-[#0A1225]/80 backdrop-blur-3xl border border-[#0ea5e9]/40 rounded-3xl p-10 sm:p-12 shadow-[0_0_50px_rgba(14,165,233,0.15)] relative flex flex-col justify-center"
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#009DFF] to-[#00D4FF] rounded-2xl flex items-center justify-center text-white mb-6 shadow-[0_10px_30px_rgba(0,212,255,0.3)] border border-white/20">
                  <Shield size={32} />
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 tracking-tight">Staff Portal</h2>
                <p className="text-[#AAB6D6] text-sm sm:text-base font-medium">Secure enterprise access for Doctors & Administrators</p>
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 text-center border border-red-500/20 text-sm font-medium">
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col gap-6 mb-10">
                <motion.button 
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleGoogleLogin}
                  className="w-full h-[52px] rounded-xl bg-white text-[#030817] font-bold text-lg flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
                >
                  <FcGoogle size={24} />
                  Continue with Google
                </motion.button>
              </div>
              
              <div className="text-center text-sm text-[#AAB6D6]/80 mb-10 max-w-[320px] mx-auto leading-relaxed">
                <p>Authentication restricted to authorized clinical staff and system administrators only.</p>
              </div>

              <div className="mt-8 pt-6 border-t border-[rgba(0,212,255,0.15)] flex justify-start">
                <button 
                  onClick={() => { setError(''); setViewMode('patient'); }}
                  className="text-[#AAB6D6] hover:text-white transition-colors text-sm font-medium flex items-center gap-2 group"
                >
                  <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Patient Login
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
