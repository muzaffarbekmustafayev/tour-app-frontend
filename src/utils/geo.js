/**
 * geo.js — lokatsiyani matn/havoladan ajratib olish va OSM orqali qidirish.
 *
 * Maqsad: foydalanuvchi koordinatani qo'lda kiritmasdan, oddiygina Google/Yandex
 * xarita havolasini yoki "lat, lng" matnini joylab lokatsiyani belgilashi.
 */

const inRange = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) &&
  Math.abs(lat) <= 90 && Math.abs(lng) <= 180;

const ok = (lat, lng) =>
  inRange(lat, lng) ? { lat: +(+lat).toFixed(6), lng: +(+lng).toFixed(6) } : null;

/**
 * parseLocationInput — matn/havoladan { lat, lng } ajratadi (topilmasa null).
 *
 * Qo'llab-quvvatlanadi:
 *   - "40.5640, 65.6895"  yoki  "40.5640 65.6895"
 *   - Google Maps:  .../@40.56,65.68,15z ,  ?q=40.56,65.68 ,  !3d40.56!4d65.68
 *   - Yandex Maps:  ?ll=65.68,40.56   (e'tibor: lng,lat tartibida!)
 *   - OpenStreetMap:  #map=12/40.56/65.68 ,  ?mlat=40.56&mlon=65.68
 *   - geo:40.56,65.68
 */
export function parseLocationInput(input) {
  if (!input || typeof input !== 'string') return null;
  const s = input.trim();
  if (!s) return null;

  // 1) Google Maps  !3dLAT!4dLNG  (eng aniq belgi)
  let m = s.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
  if (m) { const r = ok(+m[1], +m[2]); if (r) return r; }

  // 2) Google Maps  @LAT,LNG
  m = s.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
  if (m) { const r = ok(+m[1], +m[2]); if (r) return r; }

  // 3) OSM  mlat / mlon
  const mlat = s.match(/[?&]mlat=(-?\d+(?:\.\d+)?)/i);
  const mlon = s.match(/[?&]mlon=(-?\d+(?:\.\d+)?)/i);
  if (mlat && mlon) { const r = ok(+mlat[1], +mlon[1]); if (r) return r; }

  // 4) OSM  #map=ZOOM/LAT/LNG
  m = s.match(/#map=[\d.]+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/i);
  if (m) { const r = ok(+m[1], +m[2]); if (r) return r; }

  // 5) ?q= / query= / destination= / ll= / sll=  → LAT,LNG (Yandex `ll` esa lng,lat)
  m = s.match(/[?&](q|query|destination|ll|sll)=(-?\d+(?:\.\d+)?)(?:,|%2C)\s*(-?\d+(?:\.\d+)?)/i);
  if (m) {
    const a = +m[2], b = +m[3];
    const isYandexLl = m[1].toLowerCase() === 'll' && /yandex/i.test(s);
    const r = isYandexLl ? ok(b, a) : ok(a, b);
    if (r) return r;
  }

  // 6) geo:LAT,LNG
  m = s.match(/geo:(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i);
  if (m) { const r = ok(+m[1], +m[2]); if (r) return r; }

  // 7) Oddiy "LAT, LNG" (havola bo'lmasa)
  if (!/https?:\/\//i.test(s)) {
    m = s.match(/^\s*(-?\d{1,2}(?:\.\d+)?)\s*[,;\s]\s*(-?\d{1,3}(?:\.\d+)?)\s*$/);
    if (m) { const r = ok(+m[1], +m[2]); if (r) return r; }
  }

  return null;
}

/**
 * geocodeSearch — joy nomi bo'yicha OpenStreetMap (Nominatim) orqali qidirish.
 * Bepul, API kalit talab qilmaydi.
 * @returns {Promise<Array<{label:string, lat:number, lng:number}>>}
 */
export async function geocodeSearch(query, { signal, limit = 6 } = {}) {
  const q = (query || '').trim();
  if (q.length < 3) return [];
  const url =
    `https://nominatim.openstreetmap.org/search?format=jsonv2` +
    `&limit=${limit}&accept-language=uz,ru,en&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Geokodlash xatosi');
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((d) => ({
    label: d.display_name,
    lat: +(+d.lat).toFixed(6),
    lng: +(+d.lon).toFixed(6),
  }));
}
