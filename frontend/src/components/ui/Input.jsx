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
  placeholder,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col space-y-1.5 w-full font-poppins">
      {/* Static Label to prevent any overlap */}
      {label && (
        <label className={`text-sm font-semibold transition-colors duration-200 ${
          error ? 'text-red-500' : isFocused ? 'text-[#00B4D8]' : 'text-white/80'
        }`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Left Icon */}
        {Icon && (
          <div className={`absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200 ${
            error ? 'text-red-500' : isFocused ? 'text-blue-600' : 'text-slate-400 dark:text-slate-500'
          }`}>
            <Icon size={18} />
          </div>
        )}
        
        {/* Input Field - box-sizing border-box applied by Tailwind */}
        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          placeholder={placeholder || (label ? `Enter your ${label.toLowerCase()}` : '')}
          className={`
            block w-full rounded-2xl bg-[#061422]/50 backdrop-blur-sm
            border border-white/10 outline-none transition-all duration-300
            h-[56px] ${Icon ? 'pl-12' : 'pl-5'} 
            ${isPassword ? 'pr-12' : 'pr-5'} 
            text-[16px] text-white font-medium
            placeholder-white/40
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20' 
              : 'hover:border-white/30 focus:border-[#00B4D8] focus:shadow-[0_0_15px_rgba(0,180,216,0.2)]'
            }
          `}
          {...props}
        />
        
        {/* Right Icon for Password Toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        )}
      </div>
      
      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: 'auto', marginTop: 4 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            className="text-red-500 text-xs font-semibold"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Input;
