import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiBell, FiInbox } from 'react-icons/fi';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [show, setShow] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    api.get('/bookings/my-bookings')
      .then(res => {
        const notifs = res.data.map(b => ({
          id: b._id,
          message: getBookingMessage(b),
          time: new Date(b.updatedAt || b.createdAt).toLocaleDateString('uz-UZ'),
          unread: b.status === 'confirmed' || b.status === 'cancelled',
          status: b.status,
        }));
        setNotifications(notifs);
      })
      .catch(() => {});
  }, [user]);

  const getBookingMessage = (b) => {
    const name = b.hotel?.name || 'Mehmonxona';
    if (b.status === 'confirmed') return `${name} — broningiz tasdiqlandi!`;
    if (b.status === 'cancelled') return `${name} — bron bekor qilindi`;
    if (b.status === 'completed') return `${name} — broningiz yakunlandi`;
    return `${name} — bron kutilmoqda`;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="relative bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:scale-110 transition-transform active:scale-95 group focus:ring-2 focus:ring-blue-500/50 outline-none"
      >
        <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 bg-red-500 text-white w-4 h-4 flex items-center justify-center rounded-full text-[8px] font-black border-2 border-white dark:border-slate-800 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {show && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShow(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-gray-900 dark:text-white">Bildirishnomalar</h3>
            </div>
            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length > 0 ? notifications.map(n => (
                <div key={n.id} className={`p-4 border-b border-gray-100 dark:border-gray-800 last:border-0 flex space-x-4 ${n.unread ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${n.unread ? 'bg-blue-600' : 'bg-transparent'}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1 leading-snug">{n.message}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{n.time}</p>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center">
                  <FiInbox className="w-12 h-12 mb-3 mx-auto text-gray-300 dark:text-gray-600" />
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Bildirishnoma yo'q</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
