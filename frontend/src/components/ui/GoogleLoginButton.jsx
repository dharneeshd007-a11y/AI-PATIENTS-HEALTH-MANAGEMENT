import React from 'react';
import { motion } from 'framer-motion';
import { FcGoogle } from 'react-icons/fc';

const GoogleLoginButton = ({ disabled, isLoading }) => {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      type="button"
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      className={`
        w-full flex items-center justify-center gap-3 py-3.5 px-4
        bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700
        rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200
        shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-200
        transition-colors duration-200 font-poppins
        ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <FcGoogle size={22} />
      Continue with Google
    </motion.button>
  );
};

export default GoogleLoginButton;
