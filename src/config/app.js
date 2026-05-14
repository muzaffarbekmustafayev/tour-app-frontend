/**
 * app.js — Markaziy konfiguratsiya
 *
 * Ilovaning barcha global sozlamalari shu yerda.
 * Istalgan qiymatni o'zgartirish uchun faqat .env faylini tahrirlang —
 * kod ichidagi hech narsani o'zgartirmasangiz ham bo'ladi.
 */

// ── Ilova identifikatori ──────────────────────────────────────
export const APP_NAME        = import.meta.env.VITE_APP_NAME        || 'NavaiTour';
export const APP_DESCRIPTION = import.meta.env.VITE_APP_DESCRIPTION || 'Navoiy viloyatidagi mehmonxonalarni qidiring';

// ── API ulanish sozlamalari ───────────────────────────────────
export const API_URL         = import.meta.env.VITE_API_URL         || 'http://localhost:5000/api';
export const API_TIMEOUT_MS  = 15_000;   // 15 soniya

// ── Token saqlash kaliti ──────────────────────────────────────
export const TOKEN_KEY       = 'token';
export const DARK_MODE_KEY   = 'darkMode';

// ── Pagination ────────────────────────────────────────────────
export const PAGE_SIZE       = 12;

// ── Rasm fallback ─────────────────────────────────────────────
export const FALLBACK_IMAGE  =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';

// ── Til ───────────────────────────────────────────────────────
export const DEFAULT_LOCALE  = 'uz-UZ';
export const CURRENCY        = 'UZS';
