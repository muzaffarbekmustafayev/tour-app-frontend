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
      className={`group flex items-center gap-2 px-4 py-2 bg-glass dark:bg-glass-dark backdrop-blur-md border border-glass-border rounded-xl text-slate-700 dark:text-slate-200 font-bold text-sm shadow-sm hover:shadow-md hover:border-primary-light active:scale-95 transition-all duration-300 ${className}`}
    >
      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-light dark:group-hover:bg-primary/30 transition-colors duration-300">
        <FiArrowLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors duration-300" />
      </div>

      <span>Orqaga</span>
    </button>
  );
};

export default BackButton;
