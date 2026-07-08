import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const LiveClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 font-poppins">
      <FiClock className="w-4 h-4" />
      <span>{time.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
      <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
      <span>{time.toLocaleTimeString()}</span>
    </div>
  );
};

export default LiveClock;
