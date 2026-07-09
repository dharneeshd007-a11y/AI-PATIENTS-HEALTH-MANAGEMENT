import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import authService from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Lock, Shield, ArrowRight, HeartPulse, Brain, AlertCircle, ArrowLeft } from 'lucide-react';
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { FcGoogle } from 'react-icons/fc';

const FeatureCard = ({ icon: Icon, title, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.5 }}
    className="flex items-center gap-4 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-colors"
  >
    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10 flex items-center justify-center text-cyan-400">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-white font-semibold">{title}</h3>
    </div>
  </motion.div>
);

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState('patient'); // 'patient' or 'staff'
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      // Decode if necessary, though get() handles most decoding
      setError(errorParam);
      // Automatically switch to staff view if it's a Google Auth error
      if (errorParam.includes('Administrator') || errorParam.includes('Google') || errorParam.includes('Access Denied')) {
        setViewMode('staff');
      }
    }
  }, [location]);

  const particlesOptions = useMemo(() => ({
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "repulse" },
      },
      modes: { repulse: { distance: 100, duration: 0.4 } },
    },
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Force Patient role context for manual login
      const data = await authService.login({ ...formData, role: 'Patient' });
      
      // Even if user provides phone, we trust backend to return the correct role
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
      
      {/* LEFT SIDE (60%) */}
      <div className="hidden lg:flex lg:w-[60%] relative flex-col justify-center p-20 z-10">
        
        {/* Animated Blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/20 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 -z-20">
          <ParticlesProvider init={loadSlim}>
            <Particles id="tsparticles" options={particlesOptions} className="w-full h-full" />
          </ParticlesProvider>
        </div>

        {/* ECG Line Animation Overlay (CSS based) */}
        <div className="absolute top-1/2 left-0 w-full h-[200px] -translate-y-1/2 opacity-20 pointer-events-none -z-10">
           <svg className="w-full h-full stroke-cyan-400" viewBox="0 0 1000 200" preserveAspectRatio="none">
             <path 
               d="M 0 100 L 200 100 L 220 50 L 240 150 L 260 80 L 280 120 L 300 100 L 500 100 L 520 50 L 540 150 L 560 80 L 580 120 L 600 100 L 1000 100" 
               fill="none" 
               strokeWidth="2" 
               className="animate-[dash_3s_linear_infinite]"
               strokeDasharray="1000"
               strokeDashoffset="1000"
             />
           </svg>
           <style>{`
             @keyframes dash {
               to { stroke-dashoffset: 0; }
             }
           `}</style>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]">
              <Shield size={28} />
            </div>
            <span className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 uppercase">
              DKD Hospital
            </span>
          </div>

          <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 tracking-tight">
            AI-Powered Continuous <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
              Patient Telemetry
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-12 max-w-xl leading-relaxed">
            Real-Time Patient Monitoring • AI Health Analytics • Emergency Alert System • Smart Hospital Dashboard
          </p>

          <div className="flex flex-col gap-4 max-w-md">
            <FeatureCard icon={HeartPulse} title="Live ECG Monitoring" delay={0.2} />
            <FeatureCard icon={Brain} title="AI Disease Prediction" delay={0.4} />
            <FeatureCard icon={AlertCircle} title="Instant Emergency Alerts" delay={0.6} />
          </div>
        </motion.div>
      </div>

      {/* RIGHT SIDE (40%) - LOGIN CARD */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 z-20 relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          
          {viewMode === 'patient' && (
            <motion.div 
              key="patient-view"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full max-w-[500px] bg-[#111827]/65 backdrop-blur-xl border border-white/10 rounded-[30px] p-10 sm:p-12 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

              <div className="text-center mb-10">
                <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">Patient Portal</h2>
                <p className="text-slate-400 text-base">Sign in to view your health records</p>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-6 text-center border border-red-500/20 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                
                <div className="space-y-1.5 relative group">
                  <label className="text-sm font-medium text-slate-400 ml-1">Phone Number</label>
                  <div className="relative flex items-center">
                    <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="tel" 
                      name="phone" 
                      required 
                      placeholder="+1 (555) 000-0000"
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300 text-lg"
                      style={{ paddingLeft: '3.5rem' }}
                    />
                  </div>
                </div>

                <div className="space-y-1.5 relative group">
                  <label className="text-sm font-medium text-slate-400 ml-1">Password</label>
                  <div className="relative flex items-center">
                    <Lock size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                    <input 
                      type="password" 
                      name="password" 
                      required 
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={handleChange} 
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300 text-lg"
                      style={{ paddingLeft: '3.5rem' }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="w-5 h-5 rounded border border-white/20 bg-white/5 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                      <input type="checkbox" className="opacity-0 absolute w-0 h-0" />
                      <div className="w-3 h-3 bg-cyan-400 rounded-sm opacity-0 scale-50 group-focus-within:opacity-100 group-focus-within:scale-100 transition-all"></div>
                    </div>
                    <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Remember me</span>
                  </label>
                  <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Forgot Password?</a>
                </div>

                <motion.button 
                  type="submit" 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow relative overflow-hidden group"
                  disabled={loading}
                >
                  <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
                  {!loading && <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>
                </motion.button>
              </form>

              <div className="mt-8 text-center text-slate-400 text-[15px]">
                New OP Patient?{' '}
                <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Register here
                </Link>
              </div>

              <div className="text-center mt-6 pt-6 border-t border-white/10 text-sm">
                <button 
                  onClick={() => { setError(''); setViewMode('staff'); }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Admin / Doctor Login &rarr;
                </button>
              </div>
            </motion.div>
          )}

          {viewMode === 'staff' && (
            <motion.div 
              key="staff-view"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="w-full max-w-md bg-[#111827]/65 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 sm:p-10 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-blue-900 to-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg border border-white/10">
                  <Shield size={32} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Staff Portal</h2>
                <p className="text-slate-400 text-sm">Secure access for Doctors & Administrators</p>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-red-500/10 text-red-400 p-4 rounded-xl mb-8 text-center border border-red-500/20 text-sm font-medium"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex flex-col gap-4 mb-8">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleLogin}
                  className="w-full py-3.5 rounded-xl bg-white text-slate-900 font-semibold flex items-center justify-center gap-3 hover:bg-slate-100 transition-colors shadow-lg"
                >
                  <FcGoogle size={24} />
                  Continue with Google
                </motion.button>
              </div>
              
              <div className="text-center text-xs text-slate-500 mb-8 max-w-[280px] mx-auto leading-relaxed">
                <p>Authentication restricted to authorized clinical staff and system administrators only.</p>
              </div>

              <div className="text-center pt-6 border-t border-white/10 text-sm">
                <button 
                  onClick={() => { setError(''); setViewMode('patient'); }}
                  className="text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <ArrowLeft size={16} />
                  Back to Patient Login
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
