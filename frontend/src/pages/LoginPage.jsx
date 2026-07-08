import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '../components/auth/HeroSection';
import LoginForm from '../components/auth/LoginForm';
import WeatherWidget from '../components/ui/WeatherWidget';
import ThemeToggle from '../components/ui/ThemeToggle';

const LoginPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen w-full flex flex-col lg:flex-row bg-background dark:bg-[#061422] font-poppins selection:bg-primary/30 overflow-x-hidden relative"
    >
      
      {/* Top Right Utilities */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-4">
        <WeatherWidget />
        <ThemeToggle />
      </div>

      {/* LEFT PANEL: 60% Desktop Hero */}
      <div className="lg:w-[60%] w-full h-[60vh] lg:h-screen">
        <HeroSection />
      </div>

      {/* RIGHT PANEL: 40% Desktop Auth Deck */}
      <div className="lg:w-[40%] w-full h-[40vh] lg:h-screen flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
        
        {/* Mobile styling gradients */}
        <div className="absolute lg:hidden top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        
        <LoginForm />
        
      </div>
      
    </motion.div>
  );
};

export default LoginPage;
