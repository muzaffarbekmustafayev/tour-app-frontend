import React from 'react';
import { FiMap } from 'react-icons/fi';

const Loader = ({ fullScreen = false, message = "Kuting..." }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-6">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-blue-100 dark:border-blue-900/30 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <div className="bg-white dark:bg-slate-800 w-16 h-16 rounded-full shadow-lg flex items-center justify-center relative z-10">
          <FiMap className="w-8 h-8 text-blue-600 animate-pulse" />
        </div>
      </div>
      <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">
        {message}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex items-center justify-center z-[9999]">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full min-h-[50vh]">
      {content}
    </div>
  );
};

export default Loader;
