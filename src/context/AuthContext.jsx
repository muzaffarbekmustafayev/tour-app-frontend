import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const darkMode = false;
  const setDarkMode = () => {};

  // Faqat mobil manzil paneli rangini oq qilib qo'yish
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.style.colorScheme = 'light';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', '#ffffff');
  }, []);

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

  /** Google OAuth — access_token / id_token ni backendga yuborish */
  const loginWithGoogle = async (tokenPayload) => {
    const payload = typeof tokenPayload === 'string' ? { access_token: tokenPayload } : tokenPayload;
    const res = await api.post('/auth/google', payload);
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
