import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import ChatWindow from './components/Chat/ChatWindow';
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav';

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
        <div className="flex-grow scroll-smooth main-container relative md:pl-[260px] lg:pl-[280px] pb-28 md:pb-8 w-full min-w-0 overflow-x-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
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
                <h1 className="text-5xl font-extrabold text-slate-900 dark:text-white mb-4 animate-slide-up">404</h1>
                <p className="text-slate-500 mb-8 animate-fade-in text-lg">Kechirasiz, bu sahifa topilmadi</p>
                <Link to="/" className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-hover hover:shadow-glow transition-all active:scale-95 animate-scale-in">Bosh sahifaga qaytish</Link>
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
    <HelmetProvider>
      <AuthProvider>
        <ChatProvider>
          <AppContent />
          <ChatWindow />
        </ChatProvider>
      </AuthProvider>
    </HelmetProvider>
  );
};

export default App;
