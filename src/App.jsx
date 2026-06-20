import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ChatWindow from './components/Chat/ChatWindow';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';
import ThemeToggle from './components/ThemeToggle';
import Loader from './components/Loader';
import { APP_NAME } from './config/app';

import Home from './pages/Home';
import SearchPage from './pages/SearchPage';
import HotelDetail from './pages/HotelDetail';
import Attractions from './pages/Attractions';
import AttractionDetail from './pages/AttractionDetail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import HotelsMap from './pages/HotelsMap';
import ChatPage from './pages/ChatPage';
import AIAssistant from './components/AIAssistant';

const AppContent = () => {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return <Loader fullScreen message={`${APP_NAME} tizimi yuklanmoqda...`} />;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {/* Theme toggle — barcha sahifalarda ko'rinadi */}
        <ThemeToggle />
        <div className="flex-grow scroll-smooth main-container relative">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/map" element={<HotelsMap />} />
            <Route path="/hotel/:id" element={<HotelDetail />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/attraction/:id" element={<AttractionDetail />} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/owner" element={<ProtectedRoute roles={['HOTEL_OWNER']}><OwnerDashboard /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[70vh]">
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-4">404</h1>
                <p className="text-gray-500 mb-6">Sahifa topilmadi</p>
                <Link to="/" className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">Bosh sahifaga qaytish</Link>
              </div>
            } />
          </Routes>
        </div>
        <AIAssistant />
        <BottomNav />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <ChatProvider>
        <AppContent />
        <ChatWindow />
      </ChatProvider>
    </AuthProvider>
  );
};

export default App;
