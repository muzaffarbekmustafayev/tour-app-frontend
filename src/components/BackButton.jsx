import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = ({ className = '', onClick }) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    } else {
      navigate(-1);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`group flex items-center gap-2 px-4 py-2.5 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-gray-100 dark:border-gray-700 rounded-2xl text-gray-700 dark:text-gray-200 font-bold text-sm shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-600 active:scale-95 transition-all duration-200 ${className}`}
    >
      <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-slate-700 flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
        <FiArrowLeft className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
      </div>

      <span>Orqaga</span>
    </button>
  );
};

export default BackButton;
