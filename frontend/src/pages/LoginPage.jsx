import React from 'react';
import { motion } from 'framer-motion';
import { FiShield, FiActivity, FiCpu, FiPlus } from 'react-icons/fi';
import LoginCard from '../components/LoginCard';
import ThemeToggle from '../components/ui/ThemeToggle';

const Login = () => {
  const floatVariants = {
    animate: {
      y: [0, -12, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  return (
    // Master View Layout - strict grid, full min height, overflow controlled
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-slate-950 font-poppins selection:bg-blue-600/30 overflow-x-hidden relative">
      
      {/* Absolute Theme Toggle Top Right */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT PANEL: Enterprise Telemetry Display (Desktop Only) */}
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 flex-col p-16 justify-between">
        
        {/* Background Gradients & Glows */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay"></div>

        {/* Top Header */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-blue-600/20 border border-blue-500/30 backdrop-blur-md p-3.5 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.3)]">
            <FiActivity className="text-blue-400 w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white m-0 tracking-tight leading-none">
              KMCH <span className="font-light text-blue-400">AI</span>
            </h2>
            <p className="text-slate-400 text-[0.7rem] font-bold uppercase tracking-[0.2em] mt-1.5">
              Clinical Intelligence
            </p>
          </div>
        </div>

        {/* Middle Telemetry UI */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-12">
          <div className="relative w-full max-w-lg aspect-video flex items-center justify-center">
            
            {/* Animated ECG Pulse Line SVG */}
            <div className="absolute inset-0 flex items-center justify-center opacity-70">
              <svg width="100%" height="200" viewBox="0 0 800 200" preserveAspectRatio="none">
                <motion.path
                  d="M0 100 L250 100 L280 40 L320 160 L360 20 L400 100 L800 100"
                  fill="none"
                  stroke="url(#ecg-gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
                <defs>
                  <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                    <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Floating Metric Cards */}
            <motion.div variants={floatVariants} animate="animate" className="absolute top-0 left-0">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-lg text-blue-400"><FiActivity size={24} /></div>
                <div><div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Heart Rate</div><div className="text-xl font-bold text-white">72 BPM</div></div>
              </div>
            </motion.div>

            <motion.div variants={floatVariants} animate="animate" transition={{ delay: 0.7 }} className="absolute bottom-4 left-12">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-teal-500/20 p-2 rounded-lg text-teal-400"><FiShield size={24} /></div>
                <div><div className="text-xs text-slate-400 font-medium uppercase tracking-wider">System Status</div><div className="text-xl font-bold text-white">Secured</div></div>
              </div>
            </motion.div>

            <motion.div variants={floatVariants} animate="animate" transition={{ delay: 1.4 }} className="absolute top-12 right-0">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-lg text-purple-400"><FiCpu size={24} /></div>
                <div><div className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Analysis</div><div className="text-xl font-bold text-white">Active</div></div>
              </div>
            </motion.div>

            <motion.div variants={floatVariants} animate="animate" transition={{ delay: 2.1 }} className="absolute bottom-16 right-16">
              <div className="bg-white/5 border border-white/10 backdrop-blur-xl p-3 rounded-full">
                <div className="bg-rose-500/20 p-3 rounded-full text-rose-400"><FiPlus size={24} /></div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Typography Block */}
        <div className="relative z-10 max-w-xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold mb-6 leading-[1.1] font-poppins text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-100 to-slate-400"
          >
            AI-Powered Patient Health Management
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col gap-4 text-slate-300 font-medium text-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 
              Real-Time Patient Monitoring
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 
              AI Early Warning Alerts
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> 
              Secure Healthcare Platform
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT PANEL: Authentication Deck */}
      <div className="flex items-center justify-center p-6 lg:p-12 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
        {/* Mobile Background Elements (since left panel is hidden) */}
        <div className="absolute lg:hidden top-0 right-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute lg:hidden bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

        <LoginCard />
      </div>
      
    </div>
  );
};

export default Login;
