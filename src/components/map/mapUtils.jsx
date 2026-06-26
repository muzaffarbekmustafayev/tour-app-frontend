import React from 'react';
import { FiStar } from 'react-icons/fi';

export const NAVOIY_CENTER = [40.0842, 65.3791];

export const CATEGORY_COLORS = { hotel: '#6366f1', resort: '#10b981', hostel: '#f59e0b', attraction: '#d97706' };
export const CATEGORY_LABELS = { attraction: 'Tarixiy joy', hotel: 'Mehmonxona', resort: 'Dam olish maskani', hostel: 'Hostel' };

// Tarixiy/diqqatga sazovor joy markeri rangi (amber)
export const ATTRACTION_COLOR = '#d97706';

// Tur (kategoriya) filtri — tarixiy joylar ham qo'shildi
export const FILTERS = [
  { key: 'all',        label: 'Barchasi' },
  { key: 'attraction', label: 'Tarixiy joylar' },
  { key: 'hotel',      label: 'Mehmonxonalar' },
  { key: 'resort',     label: 'Dam olish maskanlari' },
  { key: 'hostel',     label: 'Hostellar' },
];

// Navoiy viloyatining 3 tumani — xarita filtri
export const DISTRICTS = ['Nurota', 'Xatirchi', 'Qiziltepa'];
export const DISTRICT_FILTERS = [
  { key: 'all',      label: 'Barcha tumanlar' },
  { key: 'Nurota',   label: 'Nurota' },
  { key: 'Xatirchi', label: 'Xatirchi' },
  { key: 'Qiziltepa', label: 'Qiziltepa' },
];

// OSRM manevr turini o'zbekcha yo'riqnomaga aylantirish
const MANEUVER_UZ = {
  'turn-left': "Chapga buriling",
  'turn-right': "O'ngga buriling",
  'turn-slight left': "Bir oz chapga buriling",
  'turn-slight right': "Bir oz o'ngga buriling",
  'turn-sharp left': "Keskin chapga buriling",
  'turn-sharp right': "Keskin o'ngga buriling",
  'turn-straight': "To'g'riga davom eting",
  'turn-uturn': "Orqaga qayting (U burilish)",
  'depart': "Yo'lni boshlang",
  'arrive': "Manzilga yetib keldingiz",
  'roundabout': "Aylanma yo'lga kiring",
  'rotary': "Aylanma yo'lga kiring",
  'merge': "Yo'lga qo'shiling",
  'fork-left': "Ayriliqda chapni tanlang",
  'fork-right': "Ayriliqda o'ngni tanlang",
  'end of road-left': "Yo'l oxirida chapga buriling",
  'end of road-right': "Yo'l oxirida o'ngga buriling",
};

function maneuverText(step) {
  const m = step.maneuver || {};
  const key = `${m.type}-${m.modifier || ''}`.trim().replace(/-$/, '');
  const base = MANEUVER_UZ[key] || MANEUVER_UZ[m.type] || "To'g'riga davom eting";
  const road = step.name ? ` — ${step.name}` : '';
  return base + road;
}

export async function fetchRoute(from, to, profile = 'driving') {
  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${from[1]},${from[0]};${to[1]},${to[0]}` +
    `?overview=full&geometries=geojson&steps=true`;
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res  = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('Marshrut topilmadi');
    const r = data.routes[0];
    const steps = (r.legs?.[0]?.steps || []).map(s => ({
      text: maneuverText(s),
      type: s.maneuver?.type || 'continue',
      modifier: s.maneuver?.modifier || '',
      distance: s.distance,
      location: s.maneuver?.location ? [s.maneuver.location[1], s.maneuver.location[0]] : null,
    }));
    return {
      coords:   r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distance: r.distance,
      duration: r.duration,
      steps,
    };
  } catch (e) { clearTimeout(timer); throw e; }
}

export const fmtDist = m => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
export const fmtTime = s => s < 60 ? `${Math.round(s)} sek` : s < 3600 ? `${Math.round(s / 60)} daq` : `${Math.floor(s / 3600)}s ${Math.round((s % 3600) / 60)}d`;
export const fmtPrice = p => p ? new Intl.NumberFormat('uz-UZ').format(p) : null;

export const Stars = ({ count = 0, size = 'sm' }) => (
  <span className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar key={i}
        style={{
          width: size === 'sm' ? 10 : 12,
          height: size === 'sm' ? 10 : 12,
          color: i < count ? '#fbbf24' : '#cbd5e1',
          fill: i < count ? '#fbbf24' : 'none',
        }} />
    ))}
  </span>
);

export const getMinPrice = h => h.basePricePerNight || (h.rooms?.length ? Math.min(...h.rooms.map(r => r.pricePerNight || 0)) : null);
