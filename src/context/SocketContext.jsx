import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (user) {
      // Connect to the Socket.io server which runs on the same port as the backend API
      const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
      
      const newSocket = io(backendUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'] // Ensure fallbacks and primary connection works
      });
      
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Socket.IO Globally Connected:', newSocket.id);
        const userId = user.id || user._id;
        if (userId) {
          newSocket.emit('join_user', userId);
        }
      });

      // Global Push Notification Listener can go here
      // For now, it will be handled by a Toast Component or App.jsx
      
      return () => {
        if (newSocket.connected) {
          newSocket.disconnect();
        }
      };
    } else {
      setSocket(null);
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
