import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiInbox } from 'react-icons/fi';

/**
 * NotificationBell — tizim bildirishnomalari
 * Hozircha bo'sh holat ko'rsatadi.
 * Kelajakda backend /api/notifications endpointi bilan ulash mumkin.
 */
const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [show, setShow] = useState(false);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        aria-label="Bildirishnomalar"
        aria-expanded={show}
        className="relative bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 transition-transform active:scale-95 group focus:ring-2 focus:ring-blue-500/50 outline-none"
      >
        <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
      </button>

      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Bildirishnomalar</h3>
            </div>
            <div className="p-10 text-center">
              <FiInbox className="w-12 h-12 mb-3 mx-auto text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bildirishnoma yo'q</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
