import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiSun, FiMoon } from 'react-icons/fi';

/**
 * Global tema almashtirish tugmasi — barcha sahifalarda ko'rinadi.
 * Mobil uchun: safe-area hisobga olingan, kichikroq o'lcham,
 * z-index modal/sticky-header/toast'lardan PAST (ular ustiga tushmasligi uchun).
 */
const ThemeToggle = () => {
  const { darkMode, setDarkMode } = useContext(AuthContext);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="fixed z-[150] w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all duration-500 active:scale-90 group overflow-hidden motion-reduce:transition-none"
      style={{
        // Safe-area (notch / yumaloq burchak) hisobga olingan joylashuv
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        right: 'calc(env(safe-area-inset-right, 0px) + 12px)',
        background: darkMode ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow)',
      }}
      aria-label={darkMode ? 'Yorug‘ rejimga o‘tish' : 'Tungi rejimga o‘tish'}
      title={darkMode ? 'Yorug‘ rejim' : 'Tungi rejim'}
    >
      <div className="relative w-5 h-5 sm:w-6 sm:h-6">
        <FiSun
          className={`w-5 h-5 sm:w-6 sm:h-6 absolute inset-0 text-amber-500 transition-all duration-500 transform motion-reduce:transition-none ${darkMode ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}
          fill="currentColor"
        />
        <FiMoon
          className={`w-5 h-5 sm:w-6 sm:h-6 absolute inset-0 text-indigo-400 transition-all duration-500 transform motion-reduce:transition-none ${darkMode ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}
          fill="currentColor"
        />
      </div>

      {/* Hover effect */}
      <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
    </button>
  );
};

export default ThemeToggle;
