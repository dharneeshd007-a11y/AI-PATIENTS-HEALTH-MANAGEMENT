import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const Input = ({
  label,
  type = 'text',
  icon: Icon,
  error,
  value,
  onChange,
  name,
  required,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;
  const hasValue = value && value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="w-full mb-4">
      <div className="relative">
        <div 
          className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200
            ${error ? 'text-red-500' : isFocused ? 'text-primary' : 'text-slate-400 dark:text-slate-500'}`}
        >
          {Icon && <Icon size={18} />}
        </div>
        
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className={`
            block w-full rounded-xl bg-white/50 dark:bg-slate-900/50 
            border-2 outline-none transition-all duration-300
            ${Icon ? 'pl-10' : 'pl-4'} 
            ${isPassword ? 'pr-10' : 'pr-4'} 
            pt-5 pb-2 text-sm text-slate-800 dark:text-slate-100 font-poppins
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' 
              : 'border-slate-200 dark:border-slate-700/50 focus:border-primary focus:ring-4 focus:ring-primary/20'
            }
          `}
          {...props}
        />
        
        <label
          className={`
            absolute left-0 transition-all duration-200 pointer-events-none
            ${Icon ? 'ml-10' : 'ml-4'}
            ${isActive 
              ? '-translate-y-1.5 top-1.5 text-[0.65rem] font-medium uppercase tracking-wider' 
              : 'translate-y-3.5 text-sm'
            }
            ${error ? 'text-red-500' : isFocused ? 'text-primary' : 'text-slate-500'}
          `}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary transition-colors focus:outline-none"
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-red-500 text-xs mt-1 ml-1 font-medium font-poppins"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
