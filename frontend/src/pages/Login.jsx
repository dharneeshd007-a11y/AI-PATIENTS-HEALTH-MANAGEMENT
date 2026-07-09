import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { motion } from 'framer-motion';
import { User, Phone, Mail, Lock, Shield, ArrowRight, HeartPulse, Brain, AlertCircle } from 'lucide-react';
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";

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
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'Doctor'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      const data = await authService.login(formData);
      if (data.user.role === 'Admin') navigate('/admin-dashboard');
      else if (data.user.role === 'Doctor') navigate('/doctor-dashboard');
      else navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
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
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12 z-20 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md bg-[#111827]/65 backdrop-blur-xl border border-white/10 rounded-[30px] p-8 sm:p-10 shadow-[0_0_50px_rgba(37,99,235,0.15)] relative overflow-hidden"
        >
          {/* Subtle top border glow */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-slate-400">Sign in to continue securely</p>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="space-y-1 relative group">
              <label className="text-sm font-medium text-slate-400 ml-1">Email / Phone</label>
              <div className="relative flex items-center">
                <Mail size={18} className="absolute left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="name@hospital.com"
                  value={formData.email} 
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1 relative group">
              <label className="text-sm font-medium text-slate-400 ml-1">Password</label>
              <div className="relative flex items-center">
                <Lock size={18} className="absolute left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input 
                  type="password" 
                  name="password" 
                  required 
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={handleChange} 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300"
                />
              </div>
            </div>

            <div className="space-y-1 relative group">
              <label className="text-sm font-medium text-slate-400 ml-1">Login As</label>
              <div className="relative flex items-center">
                <User size={18} className="absolute left-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all duration-300 appearance-none cursor-pointer"
                >
                  <option value="Doctor" className="bg-slate-900">Doctor</option>
                  <option value="Patient" className="bg-slate-900">Patient</option>
                  <option value="Admin" className="bg-slate-900">Admin</option>
                </select>
                {/* Custom chevron for select */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
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
              className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-shadow relative overflow-hidden group"
              disabled={loading}
            >
              <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />}
              {/* Ripple effect base */}
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out z-0"></div>
            </motion.button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-slate-500 text-sm font-medium">OR</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <div className="flex flex-col gap-3">
            <motion.button whileHover={{ y: -2 }} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </motion.button>
            <motion.button whileHover={{ y: -2 }} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium flex items-center justify-center gap-3 hover:bg-white/10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z" fill="#00a4ef"/>
              </svg>
              Continue with Microsoft
            </motion.button>
          </div>

          <div className="text-center mt-8 text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
              Register
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
