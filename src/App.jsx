import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import ThemeToggle from './components/ThemeToggle';
// import PushNotifications from './components/PushNotifications'; // Uncommented

import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import HotelDetail from './pages/HotelDetail';
import Bookings from './pages/Bookings';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
// import ChatPage from './pages/ChatPage'; // Added
import TransportRoutes from './pages/TransportRoutes';

const App = () => {
  return (
    <AuthProvider>
      {/* <SocketProvider> */}
        <Router>
          <div className="flex flex-col min-h-screen"> {/* Original div className was "min-h-screen", updated to match provided code edit */}
            
            {/* Global User Notification Handler */}
            {/* <PushNotifications /> */}

            <div className="flex-grow scroll-smooth pb-16 md:pb-0 relative"> {/* Added new div and its classes */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/routes" element={<TransportRoutes />} />
                <Route path="/hotel/:id" element={<HotelDetail />} />
                <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
                <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                {/* <Route path="/chat/:bookingId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} /> */}
                <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                <Route path="/owner" element={<ProtectedRoute roles={['HOTEL_OWNER']}><OwnerDashboard /></ProtectedRoute>} />
                {/* Added 404 route */}
                <Route path="*" element={
                  <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-gray-500 mb-6">Sahifa topilmadi</p>
                    <a href="/" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">Bosh sahifaga qaytish</a>
                  </div>
                } />
              </Routes>
            </div>
            
            <BottomNav />
            <ThemeToggle />
          </div>
        </Router>
      {/* </SocketProvider> */}
    </AuthProvider>
  );
};

export default App;