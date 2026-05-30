import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  // Foydalanuvchi qo'lda tanlaganmi yoki tizim temasiga ergashyaptimi
  const [themeUserSet, setThemeUserSet] = useState(() => localStorage.getItem('darkMode') !== null);
  const [darkMode, setDarkModeRaw] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) return saved === 'true';
    // Hech qachon tanlanmagan bo'lsa — tizim temasiga ergash (default: light)
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });

  // Toggle bosilganda — foydalanuvchi tanlovini saqlash
  const setDarkMode = useCallback((val) => {
    setThemeUserSet(true);
    setDarkModeRaw(prev => (typeof val === 'function' ? val(prev) : val));
  }, []);

  // Tema o'zgarganda: dark klass, localStorage, color-scheme va mobil panel rangi
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', darkMode);
    root.style.colorScheme = darkMode ? 'dark' : 'light';
    if (themeUserSet) localStorage.setItem('darkMode', darkMode);

    // Mobil brauzer manzil paneli rangi
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', darkMode ? '#0B1120' : '#ffffff');
  }, [darkMode, themeUserSet]);

  // Foydalanuvchi qo'lda tanlamagan bo'lsa — tizim temasi o'zgarsa ergashish
  useEffect(() => {
    if (themeUserSet) return;
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!mq) return;
    const onChange = (e) => setDarkModeRaw(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [themeUserSet]);

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
