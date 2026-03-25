import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const BackButton = ({ className = '' }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className={`flex items-center space-x-1 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold transition-colors ${className}`}
    >
      <FiArrowLeft className="w-5 h-5" />
      <span className="text-sm">Orqaga</span>
    </button>
  );
};

export default BackButton;
