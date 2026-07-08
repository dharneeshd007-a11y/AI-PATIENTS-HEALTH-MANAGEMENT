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
        w-full flex items-center justify-center gap-3 h-[56px] px-4
        bg-white border-none
        rounded-full text-[16px] font-bold text-slate-800
        shadow-[0_8px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)]
        focus:outline-none transition-all duration-300 font-poppins
        ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <FcGoogle size={22} />
      Continue with Google
    </motion.button>
  );
};

export default GoogleLoginButton;
