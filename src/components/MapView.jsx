import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  FiNavigation, FiX, FiMaximize, FiMinimize, FiMapPin,
  FiLoader, FiClock, FiAlertTriangle, FiExternalLink
} from 'react-icons/fi';
import { MdDirectionsCar, MdDirectionsWalk, MdMyLocation } from 'react-icons/md';

// ── Leaflet icon fix ──────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Markerlar ─────────────────────────────────────────────────────────────────
const hotelIcon = L.divIcon({
  className: '',
  html: `<div style="filter:drop-shadow(0 4px 8px rgba(0,0,0,0.35))">
    <div style="
      width:36px;height:44px;position:relative;
    ">
      <div style="
        width:36px;height:36px;
        background:linear-gradient(135deg,#6366f1,#8b5cf6);
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 16px rgba(99,102,241,0.5);
        position:absolute;top:0;left:0;
      "></div>
      <span style="
        position:absolute;top:3px;left:3px;
        width:30px;height:30px;
        display:flex;align-items:center;justify-content:center;
        font-size:15px;
      ">🏨</span>
    </div>
  </div>`,
  iconSize: [36, 44],
  iconAnchor: [18, 44],
  popupAnchor: [0, -44],
});

const userIcon = L.divIcon({
  className: '',
  html: `<div style="position:relative;width:22px;height:22px;">
    <div style="
      position:absolute;inset:0;
      background:#3b82f6;border-radius:50%;
      border:3px solid white;
      box-shadow:0 0 12px rgba(59,130,246,0.7);
      z-index:2;
    "></div>
    <div style="
      position:absolute;inset:-7px;
      background:rgba(59,130,246,0.22);
      border-radius:50%;
      z-index:1;
    "></div>
  </div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// ── FitBounds helper ──────────────────────────────────────────────────────────
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length >= 2) {
      map.fitBounds(L.latLngBounds(points), { padding: [60, 60], animate: true, duration: 1.2 });
    } else if (points.length === 1) {
      map.flyTo(points[0], 15, { duration: 1.0 });
    }
  }, [JSON.stringify(points)]);
  return null;
};

// ── OSRM haqiqiy yo'l marshrutini olish ──────────────────────────────────────
async function getOSRMRoute(fromLatLng, toLatLng, profile = 'driving') {
  // OSRM API: koordinatlar [lat, lng] bo'lishi kerak, lekin URL da [lng,lat] tartibida
  const [fromLat, fromLng] = fromLatLng;
  const [toLat, toLng]     = toLatLng;

  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${fromLng},${fromLat};${toLng},${toLat}` +
    `?overview=full&geometries=geojson&steps=false`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    const res  = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.code !== 'Ok' || !json.routes?.length) throw new Error('Marshrut topilmadi');

    const r     = json.routes[0];
    // GeoJSON koordinatlari [lng, lat] → biz [lat, lng] ga aylantiramiz
    const coords = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    return { coords, distance: r.distance, duration: r.duration };
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

// ── Yordamchi formatlash ──────────────────────────────────────────────────────
const fmtDist = m => m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
const fmtTime = s => {
  if (s < 60) return `${Math.round(s)} sek`;
  if (s < 3600) return `${Math.round(s / 60)} daqiqa`;
  return `${Math.floor(s / 3600)} soat ${Math.round((s % 3600) / 60)} daq`;
};

// ── Xarita ichki qavat ────────────────────────────────────────────────────────
const MapInner = ({ lat, lng, hasCoords, userPos, routeCoords, fitTarget }) => {
  const map = useMap();
  const { darkMode } = useContext(AuthContext);
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        url={darkMode ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
      />

      {fitTarget.length > 0 && <FitBounds points={fitTarget} />}

      {/* Mehmonxona markeri */}
      {hasCoords && (
        <Marker position={[lat, lng]} icon={hotelIcon} />
      )}

      {/* Foydalanuvchi markeri */}
      {userPos && (
        <Marker position={userPos} icon={userIcon} />
      )}

      {/* ── OSRM yo'l chiziqlari (3 qavat) ── */}
      {routeCoords.length > 1 && (
        <>
          {/* Orqa yoqilg'i (glow) */}
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#3b82f6', weight: 16, opacity: 0.12, lineCap: 'round', lineJoin: 'round' }}
          />
          {/* Asosiy yo'l */}
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#2563eb', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
          />
          {/* Ustdagi oq pulsatsiya */}
          <Polyline
            positions={routeCoords}
            pathOptions={{ color: '#ffffff', weight: 2.5, opacity: 0.55, dashArray: '1, 14', lineCap: 'round' }}
          />
        </>
      )}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
const MapView = ({ hotel, userPos: externalUserPos, onClearGuidance }) => {
  const [fullscreen,      setFullscreen]      = useState(false);
  const [userPos,         setUserPos]         = useState(externalUserPos ?? null);
  const [geoLoading,      setGeoLoading]      = useState(false);
  const [geoError,        setGeoError]        = useState(null);
  const [routeCoords,     setRouteCoords]     = useState([]);
  const [routeInfo,       setRouteInfo]       = useState(null);
  const [routeLoading,    setRouteLoading]    = useState(false);
  const [routeError,      setRouteError]      = useState(null);
  const [profile,         setProfile]         = useState('driving');

  const lat      = hotel?.location?.lat;
  const lng      = hotel?.location?.lng;
  const name     = hotel?.name || '';
  const hasCoords = !!(lat && lng);
  const center    = hasCoords ? [lat, lng] : [40.0842, 65.3791];

  // ── Marshrut hisoblash ──────────────────────────────────────────────────────
  const calcRoute = async (from, to, prof) => {
    if (!from || !to) return;
    setRouteLoading(true);
    setRouteError(null);
    setRouteCoords([]);
    try {
      const result = await getOSRMRoute(from, to, prof);
      setRouteCoords(result.coords);
      setRouteInfo({ distance: result.distance, duration: result.duration });
    } catch (err) {
      console.error('OSRM xato:', err);
      setRouteError(err.name === 'AbortError' ? 'So\'rov vaqti tugadi.' : 'Yo\'l topolmadi.');
    } finally {
      setRouteLoading(false);
    }
  };

  // ── Geolokatsiya ────────────────────────────────────────────────────────────
  const startGuidance = (prof = profile) => {
    setGeoLoading(true);
    setGeoError(null);
    setRouteCoords([]);
    setRouteInfo(null);

    // Navoiy markazi fallback (geolokatsiya ishlamasa)
    const FALLBACK = [40.0842, 65.3791];

    const useFallback = (reason) => {
      setUserPos(FALLBACK);
      setGeoLoading(false);
      setGeoError(reason);
      if (hasCoords) calcRoute(FALLBACK, [lat, lng], prof);
    };

    if (!navigator.geolocation) {
      useFallback('Geolokatsiya qo\'llab-quvvatlanmaydi. Navoiy markazidan ko\'rsatilmoqda.');
      return;
    }

    // 5 soniyadan keyin avtomatik fallback (browser freeze bo'lmasligi uchun)
    const fallbackTimer = setTimeout(() => {
      useFallback('Joylashuv aniqlanmadi. Navoiy markazidan yo\'l ko\'rsatilmoqda.');
    }, 5000);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallbackTimer);
        const from = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(from);
        setGeoLoading(false);
        setGeoError(null);
        if (hasCoords) calcRoute(from, [lat, lng], prof);
      },
      (err) => {
        clearTimeout(fallbackTimer);
        console.warn('Geolokatsiya xatosi:', err.code, err.message);
        const msg = err.code === 1
          ? 'Ruxsat berilmadi. Navoiy markazidan yo\'l ko\'rsatilmoqda.'
          : 'Joylashuv topilmadi. Navoiy markazidan yo\'l ko\'rsatilmoqda.';
        useFallback(msg);
      },
      { timeout: 4000, enableHighAccuracy: false, maximumAge: 120000 }
    );
  };

  // ── Transport profil almashtirish ───────────────────────────────────────────
  const switchProfile = (newProf) => {
    setProfile(newProf);
    if (userPos && hasCoords) {
      calcRoute(userPos, [lat, lng], newProf);
    }
  };

  // ── Yo'nalishni tozalash ────────────────────────────────────────────────────
  const clearRoute = () => {
    if (onClearGuidance) onClearGuidance();
    setUserPos(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setRouteError(null);
    setGeoError(null);
  };

  // ── Xaritaga moslashtirish ─────────────────────────────────────────────────
  const fitTarget = routeCoords.length > 1
    ? routeCoords
    : (userPos && hasCoords)
      ? [userPos, [lat, lng]]
      : hasCoords ? [[lat, lng]] : [];

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${profile === 'walking' ? 'walking' : 'driving'}`
    : '#';

  // ── ProfileBar ──────────────────────────────────────────────────────────────
  const ProfileBar = ({ small = false }) => (
    <div className="flex gap-1.5">
      {[
        { key: 'driving', icon: <MdDirectionsCar className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} />, label: 'Mashina', activeColor: '#2563eb' },
        { key: 'walking', icon: <MdDirectionsWalk className={small ? 'w-3.5 h-3.5' : 'w-4 h-4'} />, label: 'Piyoda',  activeColor: '#059669' },
      ].map(p => (
        <button
          key={p.key}
          onClick={() => switchProfile(p.key)}
          className={`flex items-center gap-1 ${small ? 'px-2.5 py-1.5 text-[10px]' : 'px-3 py-2 text-xs'} rounded-xl font-bold transition-all active:scale-95`}
          style={{
            background: profile === p.key ? p.activeColor : 'rgba(255,255,255,0.92)',
            color:      profile === p.key ? 'white'        : '#1e293b',
            border: '1px solid rgba(255,255,255,0.4)',
            boxShadow: profile === p.key ? `0 4px 12px ${p.activeColor}55` : 'none',
          }}
        >
          {p.icon} {p.label}
        </button>
      ))}
    </div>
  );

  // ── RouteInfoPanel ──────────────────────────────────────────────────────────
  const RouteInfoPanel = () => (
    <div className="flex flex-col gap-1.5 animate-fade-in pointer-events-auto">
      {/* Faol badge */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-2xl"
        style={{ background: '#2563eb', color: 'white', boxShadow: '0 8px 20px rgba(37,99,235,0.4)' }}>
        <FiNavigation className="w-3.5 h-3.5 animate-pulse shrink-0" />
        <span className="text-[10px] font-black uppercase tracking-wider">Yo'nalish faol</span>
      </div>

      {/* Transport tanlash */}
      <ProfileBar small />

      {/* Masofa + Vaqt */}
      {routeLoading && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-bold"
          style={{ background: 'rgba(255,255,255,0.94)', color: '#1e293b' }}>
          <FiLoader className="w-3 h-3 animate-spin text-blue-600" /> Yo'l hisoblanmoqda...
        </div>
      )}

      {!routeLoading && routeInfo && (
        <div className="flex gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black"
            style={{ background: 'rgba(255,255,255,0.94)', color: '#1e293b', border: '1px solid rgba(0,0,0,0.06)' }}>
            <FiMapPin className="w-2.5 h-2.5 text-blue-600" />
            {fmtDist(routeInfo.distance)}
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-black"
            style={{ background: 'rgba(255,255,255,0.94)', color: '#1e293b', border: '1px solid rgba(0,0,0,0.06)' }}>
            <FiClock className="w-2.5 h-2.5 text-emerald-600" />
            {fmtTime(routeInfo.duration)}
          </div>
        </div>
      )}

      {/* Xato xabar */}
      {(routeError || geoError) && (
        <div className="flex items-start gap-1.5 px-2.5 py-1.5 rounded-xl text-[10px] font-semibold max-w-[200px]"
          style={{ background: 'rgba(254,202,202,0.96)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.25)' }}>
          <FiAlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
          <span>{routeError || geoError}</span>
        </div>
      )}
    </div>
  );

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      {/* ── Inline xarita ── */}
      <div className="relative overflow-hidden w-full animate-fade-in"
        style={{
          height: 'clamp(260px, 35vh, 380px)',
          borderRadius: '2.5rem',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-sm)',
        }}>

        <MapContainer
          center={center} zoom={14}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false} scrollWheelZoom={false}
        >
          <MapInner
            lat={lat} lng={lng} hasCoords={hasCoords}
            userPos={userPos} routeCoords={routeCoords} fitTarget={fitTarget}
          />
        </MapContainer>

        {/* ── Yuqori panel ── */}
        <div className="absolute inset-x-0 top-0 p-3 z-[400] flex justify-between items-start pointer-events-none">
          {userPos
            ? <RouteInfoPanel />
            : <div />
          }

          <button
            onClick={() => setFullscreen(true)}
            className="pointer-events-auto flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', color: '#1e293b', boxShadow: '0 8px 20px rgba(0,0,0,0.1)' }}
          >
            <FiMaximize className="w-3.5 h-3.5" /> Kattalashtirish
          </button>
        </div>

        {/* ── Quyi panel ── */}
        <div className="absolute inset-x-0 bottom-0 p-4 z-[400] pointer-events-none">
          <div className="flex justify-center sm:justify-end gap-2 pointer-events-auto">
            {userPos ? (
              <>
                <a href={googleMapsUrl} target="_blank" rel="noreferrer"
                  className="h-12 px-5 rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                  style={{ background: 'white', color: '#1e293b', border: '1.5px solid var(--border)', boxShadow: '0 8px 20px rgba(0,0,0,0.08)' }}>
                  <FiExternalLink className="w-4 h-4 text-rose-500" /> Google Maps
                </a>
                <button onClick={clearRoute}
                  className="h-12 px-5 rounded-2xl flex items-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all active:scale-95"
                  style={{ background: '#ef4444', color: 'white', boxShadow: '0 8px 20px rgba(239,68,68,0.3)' }}>
                  <FiX className="w-4 h-4" /> Yopish
                </button>
              </>
            ) : (
              <button
                onClick={() => startGuidance(profile)}
                disabled={geoLoading}
                className="h-12 px-7 rounded-2xl flex items-center gap-2.5 text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-60"
                style={{ background: 'var(--gradient-main)', color: 'white', boxShadow: 'var(--shadow-colored)' }}
              >
                {geoLoading
                  ? <><FiLoader className="w-4 h-4 animate-spin" /> Aniqlanmoqda...</>
                  : <><FiNavigation className="w-4 h-4" /> Yo'nalishni ko'rish</>
                }
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Fullscreen modal ── */}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: 'var(--bg-main)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0"
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>

            {/* Chap: nom + info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: 'rgba(99,102,241,0.1)' }}>
                <FiMapPin className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-extrabold truncate" style={{ color: 'var(--text-main)' }}>{name}</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {routeInfo
                    ? `${fmtDist(routeInfo.distance)} · ${fmtTime(routeInfo.duration)}`
                    : userPos ? 'Yo\'nalish faol' : 'Xaritada joylashuv'
                  }
                </p>
              </div>
            </div>

            {/* O'ng: tugmalar */}
            <div className="flex items-center gap-2 shrink-0">
              {userPos ? (
                <>
                  <ProfileBar small />
                  {routeLoading && (
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                      <FiLoader className="w-3.5 h-3.5 animate-spin" /> Yo'l...
                    </div>
                  )}
                  <a href={googleMapsUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                    <FiExternalLink className="w-3.5 h-3.5 text-rose-500" /> Google
                  </a>
                  <button onClick={clearRoute}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                    style={{ background: '#ef4444' }}>
                    <FiX className="w-3.5 h-3.5" /> Yopish
                  </button>
                </>
              ) : (
                <button
                  onClick={() => startGuidance(profile)}
                  disabled={geoLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-60"
                  style={{ background: '#6366f1' }}>
                  {geoLoading
                    ? <><FiLoader className="w-3.5 h-3.5 animate-spin" /> Aniqlanmoqda...</>
                    : <><MdMyLocation className="w-3.5 h-3.5" /> Yo'l ko'rsatish</>
                  }
                </button>
              )}

              {/* Xato (fullscreen) */}
              {(geoError || routeError) && (
                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold max-w-[180px]"
                  style={{ background: 'rgba(254,202,202,0.95)', color: '#b91c1c', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{geoError || routeError}</span>
                </div>
              )}

              <button onClick={() => setFullscreen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <FiMinimize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Loading overlay */}
          {routeLoading && (
            <div className="absolute inset-0 z-[10001] flex items-end justify-center pb-20 pointer-events-none">
              <div className="flex items-center gap-3 px-6 py-3.5 rounded-2xl shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(16px)' }}>
                <FiLoader className="w-5 h-5 animate-spin text-blue-600" />
                <span className="text-sm font-bold text-slate-800">Yo'l hisoblanmoqda...</span>
              </div>
            </div>
          )}

          {/* Full map */}
          <div className="flex-1">
            <MapContainer center={center} zoom={14} style={{ width: '100%', height: '100%' }} zoomControl>
              <MapInner
                lat={lat} lng={lng} hasCoords={hasCoords}
                userPos={userPos} routeCoords={routeCoords} fitTarget={fitTarget}
              />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;
