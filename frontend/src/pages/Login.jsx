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
              className="w-full max-w-[720px] min-h-[720px] bg-[#0A1225]/80 backdrop-blur-3xl border border-[rgba(0,212,255,0.25)] rounded-[28px] p-[48px] shadow-[0_0_60px_rgba(0,212,255,0.1)] relative flex flex-col justify-center"
            >
              <div className="flex flex-col">
                <h2 className="text-[54px] font-bold text-white tracking-tight leading-tight text-center">Patient Portal</h2>
                <p className="text-[#AAB6D6] text-[20px] mt-[12px] text-center">Sign in to securely view your health records</p>
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 text-red-400 p-[16px] rounded-[16px] mt-[24px] text-center border border-red-500/20 text-[16px] font-medium">
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col w-full mt-[36px]">
                <div className="flex flex-col w-full">
                  <label className="text-[16px] font-semibold text-[#AAB6D6] mb-[8px] pl-[4px]">PHONE NUMBER</label>
                  <div className="relative flex items-center w-full">
                    <Phone size={24} className="absolute left-[20px] text-[#4FC3FF]" />
                    <input 
                      type="tel" name="phone" required placeholder="+1 (555) 000-0000"
                      value={formData.phone} onChange={handleChange} 
                      className="w-full h-[64px] bg-[#030817]/50 border border-[rgba(0,212,255,0.2)] rounded-[16px] pr-[20px] text-white placeholder:text-[#AAB6D6]/50 focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all text-[18px]"
                      style={{ paddingLeft: '60px' }}
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full mt-[24px]">
                  <label className="text-[16px] font-semibold text-[#AAB6D6] mb-[8px] pl-[4px]">PASSWORD</label>
                  <div className="relative flex items-center w-full">
                    <Lock size={24} className="absolute left-[20px] text-[#4FC3FF]" />
                    <input 
                      type={showPassword ? 'text' : 'password'} name="password" required placeholder="Enter your password"
                      value={formData.password} onChange={handleChange} 
                      className="w-full h-[64px] bg-[#030817]/50 border border-[rgba(0,212,255,0.2)] rounded-[16px] pr-[60px] text-white placeholder:text-[#AAB6D6]/50 focus:outline-none focus:border-[#00D4FF] focus:shadow-[0_0_20px_rgba(0,212,255,0.2)] transition-all text-[18px]"
                      style={{ paddingLeft: '60px' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-[20px] text-[#AAB6D6] hover:text-[#00D4FF] transition-colors flex items-center justify-center h-full">
                      {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full mt-[24px] px-[4px]">
                  <label className="flex items-center gap-[12px] cursor-pointer group">
                    <div className="w-[20px] h-[20px] rounded-[4px] border border-[#AAB6D6]/50 flex items-center justify-center bg-transparent group-hover:border-[#00D4FF] transition-colors relative">
                      <input type="checkbox" className="opacity-0 absolute w-full h-full cursor-pointer z-10" />
                      <div className="w-[10px] h-[10px] bg-[#00D4FF] rounded-[2px] opacity-0 group-focus-within:opacity-100 transition-all"></div>
                    </div>
                    <span className="text-[16px] text-[#AAB6D6] group-hover:text-white transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-[16px] text-[#00D4FF] hover:text-[#4FC3FF] transition-colors">Forgot Password?</a>
                </div>

                <button 
                  type="submit"
                  className="w-full h-[64px] mt-[32px] rounded-[16px] bg-gradient-to-r from-[#009DFF] to-[#00D4FF] text-white font-bold text-[22px] flex items-center justify-center gap-[12px] shadow-[0_10px_30px_rgba(0,212,255,0.3)] hover:shadow-[0_15px_40px_rgba(0,212,255,0.6)] transition-all"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In'}
                  {!loading && <ArrowRight size={24} />}
                </button>
              </form>

              <div className="w-full mt-[24px] text-center text-[#AAB6D6] text-[18px]">
                New OP Patient?{' '}
                <Link to="/register" className="text-[#00D4FF] hover:text-[#4FC3FF] transition-colors font-semibold underline decoration-2 decoration-[#00D4FF]/40 underline-offset-4">
                  Register here
                </Link>
              </div>

              <div className="w-full mt-[20px] pt-[20px] border-t border-[rgba(0,212,255,0.15)] flex justify-start">
                <button 
                  onClick={() => { setError(''); setViewMode('staff'); }}
                  className="text-[#AAB6D6] hover:text-white transition-colors text-[18px] font-medium flex items-center gap-[8px]"
                >
                  Admin / Doctor Login <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'staff' && (
            <motion.div 
              key="staff-view"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full max-w-[720px] min-h-[620px] bg-[#0A1225]/80 backdrop-blur-3xl border border-[rgba(0,212,255,0.25)] rounded-[28px] p-[48px] shadow-[0_0_60px_rgba(0,212,255,0.1)] relative flex flex-col justify-center"
            >
              <div className="flex flex-col items-center w-full">
                <div className="w-[80px] h-[80px] bg-gradient-to-br from-[#009DFF] to-[#00D4FF] rounded-[24px] flex items-center justify-center text-white mb-[24px] shadow-[0_10px_30px_rgba(0,212,255,0.3)] border border-white/20">
                  <Shield size={40} />
                </div>
                <h2 className="text-[54px] font-bold text-white tracking-tight leading-tight text-center">Staff Portal</h2>
                <p className="text-[#AAB6D6] text-[20px] mt-[12px] text-center">Secure enterprise access for Doctors & Administrators</p>
              </div>
              
              {error && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 text-red-400 p-[16px] rounded-[16px] mt-[24px] text-center border border-red-500/20 text-[16px] font-medium">
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col w-full mt-[36px]">
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full h-[64px] rounded-[16px] bg-white text-[#030817] font-bold text-[22px] flex items-center justify-center gap-[16px] hover:bg-slate-50 transition-colors shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
                >
                  <FcGoogle size={32} />
                  Continue with Google
                </button>
              </div>
              
              <div className="w-full mt-[32px] text-center text-[18px] text-[#AAB6D6]/80 leading-relaxed max-w-[500px] mx-auto">
                <p>Authentication restricted to authorized clinical staff and system administrators only.</p>
              </div>

              <div className="w-full mt-[24px] pt-[20px] border-t border-[rgba(0,212,255,0.15)] flex justify-start">
                <button 
                  onClick={() => { setError(''); setViewMode('patient'); }}
                  className="text-[#AAB6D6] hover:text-white transition-colors text-[18px] font-medium flex items-center gap-[8px]"
                >
                  <ArrowLeft size={20} /> Back to Patient Login
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
