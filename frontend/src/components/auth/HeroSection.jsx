import React from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiPhoneCall } from 'react-icons/fi';
import BackgroundParticles from './BackgroundParticles';
import AnimatedECG from './AnimatedECG';
import FeatureCards from './FeatureCards';

const HeroSection = () => {
  return (
    <div className="hidden lg:flex relative overflow-hidden bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center flex-col p-16 justify-between h-full">
      
      {/* Dark Blue Transparent Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A2540]/90 to-[#0057B8]/75 mix-blend-multiply"></div>
      
      {/* Background Particles & ECG */}
      <BackgroundParticles />
      <AnimatedECG />
      <FeatureCards />

      {/* Top Section */}
      <div className="relative z-10 flex justify-between items-start w-full">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 border border-white/30 backdrop-blur-md p-3.5 rounded-2xl shadow-lg">
            <FiPlus className="text-white w-8 h-8" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-white m-0 tracking-tight leading-none font-poppins">
              AI Smart Hospital
            </h2>
            <p className="text-white/80 text-[0.7rem] font-bold uppercase tracking-[0.2em] mt-1.5">
              KMCH Hospitals
            </p>
          </div>
        </div>

        {/* AI Powered Badge */}
        <div className="bg-white/20 border border-white/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
          </span>
          <span className="text-white text-xs font-bold uppercase tracking-wider">AI Powered</span>
        </div>
      </div>

      {/* Center Typography Block */}
      <div className="relative z-10 max-w-2xl py-20 pointer-events-none">
        <motion.h1 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-6xl font-extrabold mb-6 leading-[1.1] font-poppins text-white"
        >
          AI Powered Smart Hospital Management System
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-white/90 font-medium text-xl max-w-xl"
        >
          Secure, Intelligent and Real-Time Patient Care Platform.
        </motion.p>
      </div>

      {/* Bottom Section - Hospital Contact */}
      <div className="relative z-10 flex justify-between items-end w-full">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
          <div className="text-white/70 text-xs font-bold uppercase tracking-widest mb-3">Hospital Contact</div>
          <div className="flex flex-col gap-2">
            <a href="tel:+919876543210" className="text-white font-semibold flex items-center gap-2 hover:text-accent transition-colors">
              <FiPhoneCall /> +91 98765 43210
            </a>
            <a href="mailto:support@hospital.com" className="text-white/80 hover:text-white transition-colors">
              support@hospital.com
            </a>
          </div>
        </div>

        {/* Emergency Ambulance Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-danger hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.5)] flex items-center gap-3 transition-colors"
        >
          <FiPlus className="w-6 h-6" />
          Call Ambulance
        </motion.button>
      </div>
    </div>
  );
};

export default HeroSection;
