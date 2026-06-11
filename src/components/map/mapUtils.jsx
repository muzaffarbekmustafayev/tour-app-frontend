import React, { useEffect } from 'react';
import { renderToString } from 'react-dom/server';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiStar } from 'react-icons/fi';
import { FaBuilding } from 'react-icons/fa';

export const NAVOIY_CENTER = [40.0842, 65.3791];

export const CATEGORY_COLORS = { hotel: '#6366f1', resort: '#10b981', hostel: '#f59e0b' };
export const CATEGORY_LABELS = { hotel: 'Mehmonxona', resort: 'Dam olish maskani', hostel: 'Hostel' };
export const FILTERS = [
  { key: 'all',    label: 'Barchasi' },
  { key: 'hotel',  label: 'Mehmonxonalar' },
  { key: 'resort', label: 'Dam olish maskanlari' },
  { key: 'hostel', label: 'Hostellar' },
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

// Fix leafet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:22px;">
    <div style="position:absolute;inset:0;background:#10b981;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:2;"></div>
    <div style="position:absolute;inset:-10px;background:rgba(16,185,129,0.3);border-radius:50%;z-index:1;animation:pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);"></div>
    <div style="position:absolute;inset:-20px;background:rgba(16,185,129,0.15);border-radius:50%;z-index:0;animation:pulse-ring 2s infinite cubic-bezier(0.215, 0.61, 0.355, 1);animation-delay:1s;"></div>
  </div>`,
  iconSize: [22, 22], iconAnchor: [11, 11],
});

export const createHotelIcon = (selected = false) => {
  const size = selected ? 40 : 30;
  const bgColor = selected ? '#f43f5e' : '#4f46e5'; // Accent (Rose-500) vs Primary (Indigo-600)
  const shadowOpacity = selected ? '0.5' : '0.3';
  
  // Use a serious icon instead of emoji
  const iconSvg = renderToString(<FaBuilding style={{ color: 'white', width: selected ? '18px' : '14px', height: selected ? '18px' : '14px' }} />);

  return L.divIcon({
    className: '',
    html: `<div style="filter:drop-shadow(0 4px 6px rgba(0,0,0,${shadowOpacity}));">
      <div style="position:relative;width:${size}px;height:${size * 1.25}px;">
        <div style="
          width:${size}px;height:${size}px;
          background:${bgColor};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:${selected ? '3px' : '2px'} solid white;
          position:absolute;top:0;left:0;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.2);
        "></div>
        <span style="position:absolute;top:0;left:0;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;z-index:2;">
          ${iconSvg}
        </span>
      </div>
    </div>`,
    iconSize: [size, size * 1.25],
    iconAnchor: [size / 2, size * 1.25],
    popupAnchor: [0, -size * 1.25],
  });
};

export const FlyTo = ({ coords, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (!coords) return;
    if (Array.isArray(coords[0])) {
      const isMobile = window.innerWidth < 768;
      const options = isMobile ? {
        paddingTopLeft: [24, 180], // [left, top] pad top to avoid floating route overlay
        paddingBottomRight: [24, 90], // [right, bottom] pad bottom to avoid bottom nav
        duration: 1.2
      } : {
        paddingTopLeft: [60, 60], // [left, top]
        paddingBottomRight: [400, 60], // [right, bottom] pad right to avoid floating route overlay
        duration: 1.2
      };
      map.flyToBounds(L.latLngBounds(coords), options);
    } else {
      map.flyTo(coords, zoom || 15, { duration: 0.9 });
    }
  }, [coords, map, zoom]);
  return null;
};

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
