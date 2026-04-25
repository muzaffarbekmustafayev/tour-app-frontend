import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiStar } from 'react-icons/fi';

export const NAVOIY_CENTER = [40.0842, 65.3791];

export const CATEGORY_COLORS = { hotel: '#6366f1', resort: '#10b981', hostel: '#f59e0b' };
export const CATEGORY_LABELS = { hotel: 'Mehmonxona', resort: 'Resort', hostel: 'Yotoqxona' };
export const FILTERS = [
  { key: 'all',    label: 'Barchasi' },
  { key: 'hotel',  label: 'Mehmonxona' },
  { key: 'resort', label: 'Resort' },
  { key: 'hostel', label: 'Yotoqxona' },
];

export async function fetchRoute(from, to, profile = 'driving') {
  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${from[1]},${from[0]};${to[1]},${to[0]}` +
    `?overview=full&geometries=geojson`;
  const ctrl  = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 10000);
  try {
    const res  = await fetch(url, { signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('Marshrut topilmadi');
    const r = data.routes[0];
    return {
      coords:   r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
      distance: r.distance,
      duration: r.duration,
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
  html: `<div style="position:relative;width:20px;height:20px;">
    <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;border:2.5px solid white;box-shadow:0 0 10px rgba(59,130,246,0.8);z-index:2;"></div>
    <div style="position:absolute;inset:-6px;background:rgba(59,130,246,0.2);border-radius:50%;z-index:1;animation:none;"></div>
  </div>`,
  iconSize: [20, 20], iconAnchor: [10, 10],
});

export const createHotelIcon = (selected = false) => {
  const size = selected ? 40 : 30;
  return L.divIcon({
    className: '',
    html: `<div style="filter:drop-shadow(0 3px 8px rgba(99,102,241,${selected ? '0.7' : '0.4'}));">
      <div style="position:relative;width:${size}px;height:${size * 1.25}px;">
        <div style="
          width:${size}px;height:${size}px;
          background:${selected ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'linear-gradient(135deg,#2563eb,#6366f1)'};
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          border:${selected ? '3px' : '2px'} solid white;
          position:absolute;top:0;left:0;
        "></div>
        <span style="position:absolute;top:4px;left:4px;width:${size - 8}px;height:${size - 8}px;display:flex;align-items:center;justify-content:center;font-size:${selected ? 15 : 11}px;">🏨</span>
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
      map.flyToBounds(L.latLngBounds(coords), { padding: [50, 50], duration: 1.0 });
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
