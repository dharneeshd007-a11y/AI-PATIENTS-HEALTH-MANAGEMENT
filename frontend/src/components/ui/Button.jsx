import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
  isLoading,
  onClick,
  ...props
}) => {
  const baseStyles = "relative flex justify-center items-center w-full py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden transition-all duration-300 font-poppins";
  
  const variants = {
    primary: "text-white bg-primary hover:bg-blue-700 focus:ring-primary shadow-primary/25 shadow-lg",
    secondary: "text-white bg-secondary hover:bg-sky-600 focus:ring-secondary",
    outline: "text-slate-700 dark:text-slate-200 bg-transparent border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-slate-500",
  };

  const currentVariant = variants[variant] || variants.primary;

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      type={type}
      className={`
        ${baseStyles} 
        ${currentVariant} 
        ${disabled || isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      <div className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </motion.button>
  );
};

export default Button;
