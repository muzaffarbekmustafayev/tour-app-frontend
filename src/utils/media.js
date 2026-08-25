/**
 * media.js — rasm/video URL'larini ko'rsatishga tayyor holatga keltirish.
 *
 * Backend endi rasmlarni NISBIY (`/uploads/<fayl>`) URL bilan saqlaydi.
 * Bu yerda ularni joriy API origin'iga bog'laymiz — shu sabab server domeni
 * yoki porti o'zgarsa ham (lokal → server) rasm topiladi. Bundan tashqari,
 * eski absolyut `http://localhost:5000/uploads/...` yozuvlari ham tuzatiladi.
 */
import { API_URL, FALLBACK_IMAGE } from '../config/app';

// API bazasi `/api` bilan: `https://domen.uz/api`. Rasmlar shu yo'l orqali
// (`/api/uploads/...`) so'raladi — reverse-proxy (nginx) odatda faqat `/api` ni
// backendga uzatadi, `/uploads` esa frontend domenida 404 beradi.
const API_BASE   = (API_URL || '').replace(/\/+$/, '');     // https://domen.uz/api
const API_ORIGIN = API_BASE.replace(/\/api$/, '');           // https://domen.uz

/**
 * Saqlangan media URL'ini to'liq ko'rsatiladigan URL'ga aylantiradi.
 * Natija: `<API_BASE>/uploads/<fayl>` (ya'ni `/api/uploads/...`).
 * Eski absolyut `http://localhost:5000/uploads/...` yozuvlar ham tuzatiladi.
 * @param {string} url
 * @returns {string}
 */
export function resolveMediaUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const v = url.trim();
  if (!v || v.startsWith('data:') || v.startsWith('blob:')) return v;

  // Har qanday URL ichidagi `/uploads/...` — `/api/uploads/...` ga keltiramiz
  const i = v.indexOf('/uploads/');
  if (i !== -1) return `${API_BASE}${v.slice(i)}`;

  // Nisbiy yo'llar
  if (/^uploads\//i.test(v)) return `${API_BASE}/${v}`;
  if (v.startsWith('/')) return `${API_ORIGIN}${v}`;

  // Yalang fayl nomi (eski yozuvlar): "1782454049536.jpg" → /api/uploads/...
  if (!v.includes('/') && /\.(jpe?g|png|webp|gif|avif|mp4|webm|mov)$/i.test(v)) {
    return `${API_BASE}/uploads/${v}`;
  }

  // Tashqi absolyut URL (unsplash, youtube va h.k.) — o'zgarmaydi
  return v;
}

// ── Standart Yuqori Sifatli Zaxira Rasmlar ─────────────────────
export const FALLBACK_HOTEL =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200';

export const FALLBACK_ATTRACTION =
  'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1200';

export { FALLBACK_IMAGE };

/**
 * Rasm uchun: resolve qiladi, bo'sh bo'lsa fallback rasmni qaytaradi.
 * @param {string} url
 * @param {string} [fallback]
 * @returns {string}
 */
export function imgSrc(url, fallback = FALLBACK_IMAGE) {
  return resolveMediaUrl(url) || fallback;
}

/**
 * Image onError hodisasini xavfsiz boshqarish (infinite loop ga tushmaslik uchun).
 * Agar rasm 404 yoki xato bo'lsa, zaxira rasmga almashtiradi.
 * @param {React.SyntheticEvent<HTMLImageElement, Event>} e
 * @param {string} [fallback]
 */
export function handleImageError(e, fallback = FALLBACK_IMAGE) {
  if (e?.currentTarget) {
    e.currentTarget.onerror = null; // Qayta xato bermasligi uchun tozalaymiz
    if (e.currentTarget.src !== fallback) {
      e.currentTarget.src = fallback;
    }
  }
}

