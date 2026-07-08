import React from 'react';
import { FiCloud } from 'react-icons/fi';

const WeatherWidget = () => {
  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 font-poppins bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/50">
      <FiCloud className="w-4 h-4 text-blue-500" />
      <span>24°C</span>
      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
      <span>Clear</span>
    </div>
  );
};

export default WeatherWidget;
