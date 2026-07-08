import React from 'react';
import { FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 no-underline">
      {/* Premium Medical Cross Icon with Blue Gradient */}
      <div className="bg-gradient-to-br from-[#0057B8] to-[#0A2540] p-2.5 rounded-xl shadow-[0_4px_12px_rgba(0,87,184,0.3)]">
        <FiPlus className="text-white w-6 h-6 stroke-[3]" />
      </div>
      <div>
        <h2 className="text-xl font-bold font-poppins text-slate-800 dark:text-white m-0 leading-tight">
          DKD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0057B8] to-[#00B4D8]">Smart Hospital</span>
        </h2>
        <p className="text-[0.65rem] text-slate-500 font-bold uppercase tracking-[0.15em] m-0">
          Management System
        </p>
      </div>
    </Link>
  );
};

export default Logo;
