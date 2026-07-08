import React from 'react';
import { motion } from 'framer-motion';

const AnimatedECG = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center opacity-70 pointer-events-none">
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
            <stop offset="0%" stopColor="#00B4D8" stopOpacity="0" />
            <stop offset="50%" stopColor="#00B4D8" stopOpacity="1" />
            <stop offset="100%" stopColor="#00B4D8" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AnimatedECG;
