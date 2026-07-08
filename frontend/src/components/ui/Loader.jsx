import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ fullScreen = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center">
      <motion.svg 
        width="60" 
        height="60" 
        viewBox="0 0 100 100"
        initial="hidden"
        animate="visible"
        className="text-primary drop-shadow-[0_0_10px_rgba(37,99,235,0.5)]"
      >
        <motion.path
          d="M10 50 L30 50 L40 20 L60 80 L70 50 L90 50"
          fill="transparent"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: 1,
            transition: { 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "easeInOut",
              repeatType: "loop"
            }
          }}
        />
      </motion.svg>
      <div className="mt-4 text-sm font-medium text-slate-500 font-poppins animate-pulse">
        Initializing AI Systems...
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
