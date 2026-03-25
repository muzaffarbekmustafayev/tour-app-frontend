import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiSun, FiMoon } from 'react-icons/fi';

const ThemeToggle = () => {
  const { darkMode, setDarkMode } = useContext(AuthContext);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed top-4 right-4 z-[999] w-12 h-12 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md text-amber-500 dark:text-blue-400 rounded-full shadow-lg shadow-black/5 dark:shadow-none flex items-center justify-center border border-white/50 dark:border-gray-700/50 hover:scale-110 active:scale-95 transition-all"
      aria-label="Toggle Dark Mode"
    >
      {darkMode ? <FiSun className="w-5 h-5 fill-current" /> : <FiMoon className="w-5 h-5 fill-current" />}
    </button>
  );
};

export default ThemeToggle;
