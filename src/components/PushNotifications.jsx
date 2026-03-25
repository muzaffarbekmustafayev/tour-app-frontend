import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../context/SocketContext';
import { FiMessageCircle, FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const PushNotifications = () => {
  const { socket } = useContext(SocketContext);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;
    
    socket.on('push_notification', (data) => {
      const id = Date.now();
      setNotifications(prev => [...prev, { ...data, id }]);
      
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    });

    return () => socket.off('push_notification');
  }, [socket]);

  // If we are currently on the chat page for this booking, we might not want to show the popup!
  // But for standard setup, we show it everywhere.

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      {notifications.map(n => (
        <div 
          key={n.id} 
          className="pointer-events-auto w-80 bg-white/95 dark:bg-[#1e293b]/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl shadow-blue-500/10 border border-gray-100 dark:border-gray-800 flex items-start gap-4 cursor-pointer transform transition-all duration-300 translate-y-0 opacity-100" 
          onClick={() => {
            setNotifications(prev => prev.filter(x => x.id !== n.id));
            if (n.bookingId) navigate(`/chat/${n.bookingId}`);
          }}
        >
           <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900/50">
             <FiMessageCircle className="w-5 h-5" />
           </div>
           <div className="flex-1 min-w-0">
             <h4 className="text-sm font-extrabold text-gray-900 dark:text-white truncate">{n.title}</h4>
             <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">{n.body}</p>
           </div>
           <button 
             onClick={(e) => { 
               e.stopPropagation(); 
               setNotifications(prev => prev.filter(x => x.id !== n.id)); 
             }} 
             className="text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 p-1.5 rounded-full transition-colors"
           >
             <FiX className="w-4 h-4" />
           </button>
        </div>
      ))}
    </div>
  );
}

export default PushNotifications;
