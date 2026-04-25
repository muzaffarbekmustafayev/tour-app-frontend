import React from 'react';
import { FiMap } from 'react-icons/fi';

const Loader = ({ fullScreen = false, message = "NavaiTour Yuklanmoqda..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Premium Loader Animation */}
      <div className="relative mb-8">
        {/* outer glowing rings */}
        <div className="absolute inset-[-12px] rounded-full bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-xl animate-pulse" />
        <div className="absolute inset-[-4px] rounded-full border-2 border-indigo-500/10 animate-spin-slow" />
        
        {/* central rotating borders */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div className="absolute inset-0 border-[3px] border-indigo-100 dark:border-indigo-900/20 rounded-full" />
          <div className="absolute inset-0 border-[3px] border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(79,70,229,0.4)]" />
          
          <div className="bg-white dark:bg-slate-900 w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-2xl flex items-center justify-center relative z-10 border border-slate-100 dark:border-indigo-800/30">
            <FiMap className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-600 dark:text-indigo-400 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Message with gradient text */}
      <div className="text-center">
        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 font-extrabold text-xs sm:text-sm uppercase tracking-[0.3em] mb-2 px-2 animate-pulse">
          {message}
        </h3>
        {/* progress indicator line */}
        <div className="w-32 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto overflow-hidden">
          <div className="h-full bg-indigo-600 dark:bg-indigo-500 rounded-full animate-progress-classic" />
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-[#0B1120] flex items-center justify-center z-[9999] overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]" />
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[40vh] py-10 animate-fade-in">
      {content}
    </div>
  );
};

export default Loader;
