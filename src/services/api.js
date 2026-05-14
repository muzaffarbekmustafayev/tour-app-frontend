/**
 * api.js — Markaziy HTTP klient
 *
 * Barcha backend so'rovlari shu modul orqali o'tadi.
 *  - Avtomatik Authorization header
 *  - 401 => tokenni tozalash va login sahifasiga yo'naltirish
 *  - So'rov vaqt chegarasi (timeout)
 *  - Tushunarli xato xabarlari (uzbekcha)
 *  - So'rov/javob log (faqat development rejimida)
 */

import axios from 'axios';
import { API_URL, API_TIMEOUT_MS, TOKEN_KEY } from '../config/app';

// Axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

// So'rov interceptori
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.debug(`[API ->] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Javob interceptori
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug(`[API <-] ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message;

    // 401 - Token muddati tugagan: avtomatik chiqish
    if (status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(new Error('Sessiya muddati tugadi. Qayta kiring.'));
    }

    // 403 - Ruxsat yo'q
    if (status === 403) {
      return Promise.reject(new Error(message || "Bu amalni bajarishga ruxsatingiz yo'q."));
    }

    // 404 - Topilmadi
    if (status === 404) {
      return Promise.reject(new Error(message || "Ma'lumot topilmadi."));
    }

    // 400 / 422 - Validatsiya xatosi
    if (status === 400 || status === 422) {
      return Promise.reject(new Error(message || "Ma'lumotlar noto'g'ri kiritilgan."));
    }

    // 500+ - Server xatosi
    if (status >= 500) {
      return Promise.reject(new Error("Server xatosi yuz berdi. Keyinroq urinib ko'ring."));
    }

    // Tarmoq xatosi
    if (!error.response) {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new Error("So'rov vaqti tugadi. Internet aloqasini tekshiring."));
      }
      return Promise.reject(new Error("Serverga ulanib bo'lmadi. Internet aloqasini tekshiring."));
    }

    return Promise.reject(error);
  },
);

export default api;
