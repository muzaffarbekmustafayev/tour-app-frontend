import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    return false; // Default to Light Mode
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await api.get('/auth/favorites');
      setFavorites(res.data.filter(Boolean).map(f => f._id || f));
    } catch {
      setFavorites([]);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get('/auth/me')
        .then(res => { setUser(res.data); fetchFavorites(); })
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchFavorites]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    fetchFavorites();
    return res.data.user;
  };

  /** Google OAuth — access_token ni backendga yuborish */
  const loginWithGoogle = async (access_token) => {
    const res = await api.post('/auth/google', { access_token });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    fetchFavorites();
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setFavorites([]);
  };

  const toggleFavorite = async (hotelId) => {
    if (!user) return;
    const isFav = favorites.includes(hotelId);
    setFavorites(prev => isFav ? prev.filter(id => id !== hotelId) : [...prev, hotelId]);
    try {
      if (isFav) await api.delete(`/auth/favorites/${hotelId}`);
      else await api.post(`/auth/favorites/${hotelId}`);
    } catch {
      setFavorites(prev => isFav ? [...prev, hotelId] : prev.filter(id => id !== hotelId));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, register, logout, loading, favorites, toggleFavorite, darkMode, setDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};
