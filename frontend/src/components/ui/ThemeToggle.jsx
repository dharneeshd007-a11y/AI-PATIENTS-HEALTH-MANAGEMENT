import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial theme from document class or localStorage
    const hasDarkClass = document.documentElement.classList.contains('dark');
    const isLightMode = document.documentElement.classList.contains('light-mode');
    setIsDark(hasDarkClass && !isLightMode);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    if (isDark) {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light-mode');
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="p-2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
      aria-label="Toggle Theme"
    >
      <div className="relative w-6 h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiMoon size={20} className="text-secondary" />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FiSun size={20} className="text-orange-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
};

export default ThemeToggle;
