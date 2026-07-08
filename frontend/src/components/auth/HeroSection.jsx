import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiPhoneCall, FiActivity, FiCpu, FiFileText, FiClock } from 'react-icons/fi';
import BackgroundParticles from './BackgroundParticles';
import AnimatedECG from './AnimatedECG';

const HeroSection = () => {
  const cards = [
    { title: 'AI Patient Monitoring', icon: FiActivity },
    { title: 'Smart Analytics', icon: FiCpu },
    { title: 'Electronic Medical Records', icon: FiFileText },
    { title: '24×7 Emergency Services', icon: FiClock }
  ];

  return (
    <div className="hidden lg:flex relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center flex-col p-16 justify-between h-full">
      
      {/* Dark Navy and Blue Gradient Overlay with Blur */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#071B2F]/95 to-[#0057B8]/80 backdrop-blur-sm mix-blend-multiply"></div>
      
      {/* Background Particles & ECG */}
      <BackgroundParticles />
      <AnimatedECG />

      {/* Top Section */}
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-[#0057B8] to-[#0A2540] p-3 rounded-2xl shadow-lg border border-white/10">
            <FiPlus className="text-white w-8 h-8 stroke-[3]" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white m-0 tracking-tight leading-none font-poppins">
              DKD Smart Hospital
            </h2>
          </div>
        </div>
      </div>

      {/* Center Typography Block & Glass Cards */}
      <div className="relative z-10 w-full max-w-3xl py-12">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-[48px] font-bold mb-4 leading-[1.2] font-poppins text-white"
        >
          AI Powered<br />Hospital Management System
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-white/80 font-medium text-xl max-w-xl mb-12"
        >
          Secure, Intelligent and Real-Time Healthcare Platform
        </motion.p>

        {/* 4 Premium Glass Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-2 gap-4"
        >
          {cards.map((card, index) => (
            <div key={index} className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl">
              <div className="bg-[#00B4D8]/20 p-2 rounded-lg text-[#00B4D8]">
                <card.icon size={20} />
              </div>
              <span className="text-white font-medium text-sm">{card.title}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom Section - Hospital Contact */}
      <div className="relative z-10 flex justify-between items-end w-full">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
          <div className="text-white/60 text-xs font-bold uppercase tracking-widest mb-3">DKD Smart Hospital</div>
          <div className="flex flex-col gap-2">
            <div className="text-white font-semibold flex items-center gap-2">
              <span className="text-red-400">Emergency</span>
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            </div>
            <a href="tel:+919876543210" className="text-white/90 text-lg font-bold hover:text-[#00B4D8] transition-colors">
              +91 98765 43210
            </a>
            <a href="mailto:support@dkdhospital.com" className="text-[#00B4D8] text-sm hover:text-white transition-colors">
              support@dkdhospital.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
