/**
 * media.js — rasm/video URL'larini ko'rsatishga tayyor holatga keltirish.
 *
 * Backend endi rasmlarni NISBIY (`/uploads/<fayl>`) URL bilan saqlaydi.
 * Bu yerda ularni joriy API origin'iga bog'laymiz — shu sabab server domeni
 * yoki porti o'zgarsa ham (lokal → server) rasm topiladi. Bundan tashqari,
 * eski absolyut `http://localhost:5000/uploads/...` yozuvlari ham tuzatiladi.
 */
import { API_URL, FALLBACK_IMAGE } from '../config/app';

// `https://api.domen.uz/api` → `https://api.domen.uz`
const API_ORIGIN = (API_URL || '').replace(/\/api\/?$/, '');

/**
 * Saqlangan media URL'ini to'liq ko'rsatiladigan URL'ga aylantiradi.
 * @param {string} url
 * @returns {string}
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const v = url.trim();
  if (!v || v.startsWith('data:') || v.startsWith('blob:')) return v;

  // Har qanday URL ichidagi `/uploads/...` — joriy API origin orqali ko'rsatamiz
  const i = v.indexOf('/uploads/');
  if (i !== -1) return `${API_ORIGIN}${v.slice(i)}`;

  // Nisbiy yo'llar
  if (/^uploads\//i.test(v)) return `${API_ORIGIN}/${v}`;
  if (v.startsWith('/')) return `${API_ORIGIN}${v}`;

  // Tashqi absolyut URL (unsplash, youtube va h.k.) — o'zgarmaydi
  return v;
}

/**
 * Rasm uchun: resolve qiladi, bo'sh bo'lsa fallback rasmni qaytaradi.
 * @param {string} url
 * @param {string} [fallback]
 * @returns {string}
 */
export function imgSrc(url, fallback = FALLBACK_IMAGE) {
  return resolveMediaUrl(url) || fallback;
}
