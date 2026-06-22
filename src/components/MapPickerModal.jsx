import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AuthContext } from '../context/AuthContext';
import { FiMapPin, FiX, FiCheck, FiCrosshair, FiLoader } from 'react-icons/fi';

// Leaflet default marker ikonkasini tuzatish
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const NAVOIY_CENTER = [40.0842, 65.3791];

const ClickHandler = ({ onPick }) => {
  useMapEvents({ click: (e) => onPick(e.latlng) });
  return null;
};

const Recenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(lat) && Number.isFinite(lng)) map.setView([lat, lng], map.getZoom() || 13);
  }, [lat, lng, map]);
  return null;
};

const Resizer = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 350);
    return () => clearTimeout(t);
  }, [map]);
  return null;
};

/**
 * MapPickerModal — koordinata tanlash uchun yagona, qayta ishlatiladigan modal.
 *
 * Props:
 *   open      — ko'rinadimi
 *   onClose   — yopish
 *   value     — { lat, lng } (string yoki number)
 *   onChange  — ({ lat, lng }) string (toFixed 6) ko'rinishida qaytaradi
 *   title     — sarlavha (ixtiyoriy)
 */
const MapPickerModal = ({ open, onClose, value, onChange, title = 'Joylashuvni belgilang' }) => {
  const { darkMode } = useContext(AuthContext);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Escape bilan yopish
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const pick = (latlng) => onChange?.({ lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) });

  const locateMe = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { pick({ lat: coords.latitude, lng: coords.longitude }); setGpsLoading(false); },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // OpenStreetMap (open map). Dark rejimda o'qilishi uchun OSM-ma'lumotli qorong'i qatlam.
  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const tileAttribution = darkMode
    ? '&copy; OpenStreetMap hissadorlari &copy; CARTO'
    : '&copy; OpenStreetMap hissadorlari';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200/70 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — gradient */}
        <div className="relative px-6 py-4 flex items-center gap-3 text-white overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 55%,#8B5CF6 100%)' }}>
          <div className="absolute -top-8 -right-4 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)', filter: 'blur(8px)' }} />
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <FiMapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 z-10">
            <h3 className="text-base font-black tracking-tight leading-tight">{title}</h3>
            <p className="text-[11px] font-medium text-white/75">Xaritani bosing yoki markerni torting</p>
          </div>
          <button onClick={onClose} aria-label="Yopish"
            className="z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[400px] relative bg-slate-100 dark:bg-slate-950">
          <MapContainer
            center={hasCoords ? [lat, lng] : NAVOIY_CENTER}
            zoom={hasCoords ? 14 : 8}
            style={{ height: '100%', width: '100%', minHeight: 400 }}
            zoomControl={true}
          >
            <TileLayer url={tileUrl} attribution={tileAttribution} />
            <Resizer />
            <ClickHandler onPick={pick} />
            {hasCoords && (
              <>
                <Marker
                  position={[lat, lng]}
                  draggable
                  eventHandlers={{ dragend: (e) => pick(e.target.getLatLng()) }}
                />
                <Recenter lat={lat} lng={lng} />
              </>
            )}
          </MapContainer>

          {/* Ko'rsatma pill */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[500] pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-lg backdrop-blur-md border border-white/60 dark:border-slate-700/60 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Joyni tanlash uchun xaritaga bosing
            </span>
          </div>

          {/* GPS locate */}
          <button onClick={locateMe} aria-label="Mening joylashuvim" disabled={gpsLoading}
            className="absolute bottom-4 right-4 z-[500] w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200/70 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors active:scale-95">
            {gpsLoading ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiCrosshair className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer — koordinata kartochkalari + tasdiqlash */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            {[
              { label: 'Kenglik', val: value?.lat },
              { label: 'Uzunlik', val: value?.lng },
            ].map((c) => (
              <div key={c.label} className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{c.label}</p>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate">{c.val || '—'}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Bekor
            </button>
            <button onClick={onClose} disabled={!hasCoords}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              style={{ background: hasCoords ? 'linear-gradient(135deg,#4F46E5,#8B5CF6)' : '#94a3b8' }}>
              <FiCheck className="w-4 h-4" /> Tasdiqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
