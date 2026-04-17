import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const { darkMode, setDarkMode } = useContext(AuthContext);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-4 right-4 z-[999] w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 active:scale-90 group overflow-hidden"
      style={{ 
        background: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
      aria-label="Toggle Dark Mode"
    >
      <div className="relative w-6 h-6">
        <FiSun 
          className={`w-6 h-6 absolute inset-0 text-amber-500 transition-all duration-500 transform ${darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} 
          fill="currentColor"
        />
        <FiMoon 
          className={`w-6 h-6 absolute inset-0 text-indigo-400 transition-all duration-500 transform ${darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} 
          fill="currentColor"
        />
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    </button>
  );
};

export default ThemeToggle;
