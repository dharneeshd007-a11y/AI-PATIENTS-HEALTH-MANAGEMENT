import React from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiShield, FiCpu, FiFileText, FiClock } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const FeatureCards = () => {
  const floatVariants = {
    animate: {
      y: [0, -12, 0],
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
    }
  };

  const features = [
    { id: 1, title: '24×7 Emergency', icon: FiClock, color: 'text-danger', bg: 'bg-danger/20', position: 'top-10 left-10', delay: 0 },
    { id: 2, title: 'AI Patient Monitoring', icon: FiActivity, color: 'text-accent', bg: 'bg-accent/20', position: 'bottom-32 left-12', delay: 0.7 },
    { id: 3, title: 'Smart Analytics', icon: FiCpu, color: 'text-purple-400', bg: 'bg-purple-500/20', position: 'top-20 right-10', delay: 1.4 },
    { id: 4, title: 'Secure Google Auth', icon: FcGoogle, color: '', bg: 'bg-white/10', position: 'bottom-20 right-16', delay: 2.1 },
    { id: 5, title: 'Medical Records', icon: FiFileText, color: 'text-success', bg: 'bg-success/20', position: 'top-1/2 left-20', delay: 1.0 },
    { id: 6, title: 'Real-Time Telemetry', icon: FiShield, color: 'text-blue-400', bg: 'bg-blue-500/20', position: 'top-1/2 right-20', delay: 1.8 },
  ];

  return (
    <div className="absolute inset-0 hidden xl:block pointer-events-none">
      {features.map((feature) => (
        <motion.div
          key={feature.id}
          variants={floatVariants}
          animate="animate"
          transition={{ delay: feature.delay }}
          className={`absolute ${feature.position}`}
        >
          <div className="bg-white/10 border border-white/20 backdrop-blur-xl p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] hover:bg-white/20 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] transition-all duration-300">
            <div className={`${feature.bg} p-2.5 rounded-xl ${feature.color}`}>
              <feature.icon size={22} />
            </div>
            <div className="font-semibold text-white text-sm tracking-wide">
              {feature.title}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default FeatureCards;
