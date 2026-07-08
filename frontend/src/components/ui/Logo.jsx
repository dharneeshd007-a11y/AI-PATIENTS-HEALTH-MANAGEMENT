import React from 'react';
import { Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

const Logo = () => {
  return (
    <Link to="/" className="flex items-center gap-3 no-underline">
      <div className="bg-primary/10 p-2 rounded-xl">
        <Activity className="text-primary w-8 h-8" />
      </div>
      <div>
        <h2 className="text-xl font-bold font-poppins text-dark dark:text-white m-0 leading-tight">
          KMCH <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">AI</span>
        </h2>
        <p className="text-[0.65rem] text-slate-500 font-medium uppercase tracking-wider m-0">
          Health Management
        </p>
      </div>
    </Link>
  );
};

export default Logo;
