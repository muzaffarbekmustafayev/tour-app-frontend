import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiNavigation, FiLayers } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/Loader';
import { calcAccessibilityScore, getScoreStyle } from '../utils/accessibilityScore';
import { AuthContext } from '../context/AuthContext';

import {
  NAVOIY_CENTER,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  FILTERS,
  fetchRoute,
  fmtPrice,
  getMinPrice,
  userIcon,
  createHotelIcon,
  FlyTo,
  Stars,
} from '../components/map/mapUtils';

import MapTopBar from '../components/map/MapTopBar';
import MapHotelPanel from '../components/map/MapHotelPanel';
import MapRouteOverlay from '../components/map/MapRouteOverlay';

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 250);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const HotelsMap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // panel
  const [filterCat, setFilterCat] = useState('all');
  const [userPos, setUserPos] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [profile, setProfile] = useState('driving');
  const [activeHotel, setActiveHotel] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [showPanel, setShowPanel] = useState(false); // mobile bottom sheet open state
  const markerRefs = useRef({});

  useEffect(() => {
    api
      .get('/hotels?limit=100')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.hotels || []);
        setHotels(list.filter((h) => h.location?.lat && h.location?.lng));
      })
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (hotels.length > 0 && location.state?.targetHotelId && !routeLoading) {
      const target = hotels.find(h => h._id === location.state.targetHotelId);
      if (target) {
        // give it a short timeout so the map has time to render
        setTimeout(() => startGuidance(target), 500);
        window.history.replaceState({}, document.title);
      }
    }
  }, [hotels, location.state]);

  const filtered = filterCat === 'all' ? hotels : hotels.filter((h) => h.category === filterCat);

  // ── Route calculation ───────────────────────────────────────────────────────
  const calcRoute = useCallback(async (from, hotel, prof) => {
    if (!from || !hotel?.location) return;
    const to = [hotel.location.lat, hotel.location.lng];
    setRouteLoading(true);
    setRouteError(null);
    setRouteCoords([]);
    setRouteInfo(null);
    try {
      const r = await fetchRoute(from, to, prof);
      setRouteCoords(r.coords);
      setRouteInfo({ distance: r.distance, duration: r.duration });
      setFlyTarget(r.coords);
    } catch {
      setRouteError("Yo'nalishni hisoblashda xatolik yuz berdi.");
    } finally {
      setRouteLoading(false);
    }
  }, []);

  // ── Start guidance ──────────────────────────────────────────────────────────
  const startGuidance = (hotel, prof = profile) => {
    setActiveHotel(hotel);
    closePanel(); // <-- Avtomatik ravishda panelni yopish (xaritani to'liq ko'rish uchun)

    if (userPos) {
      setFlyTarget([userPos, [hotel.location.lat, hotel.location.lng]]);
      calcRoute(userPos, hotel, prof);
      return; // Fast path: skip geolocation if we already have it
    }

    setGeoLoading(true);
    setGeoMsg(null);
    setRouteCoords([]);
    setRouteInfo(null);

    const useFallback = (msg) => {
      const fallbackPos = NAVOIY_CENTER;
      setUserPos(fallbackPos);
      setGeoLoading(false);
      setGeoMsg(msg);
      // Xaritani foydalanuvchi joylashuvi (fallback) va mehmonxona orasida darhol sozlash
      setFlyTarget([fallbackPos, [hotel.location.lat, hotel.location.lng]]);
      calcRoute(fallbackPos, hotel, prof);
    };

    if (!navigator.geolocation) {
      useFallback('Qurilmangizda geolokatsiya xizmati aniqlanmadi.');
      return;
    }

    const timer = setTimeout(
      () => useFallback("Hozirgi joylashuvingizni aniqlab bo'lmadi. Navoiy shahar markazidan yo'nalish chizilmoqda."),
      8000 // Increased timeout for better GPS lock
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        const from = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(from);
        setGeoLoading(false);
        setGeoMsg(null);
        // Xaritani foydalanuvchi joylashuvi va mehmonxona orasida darhol sozlash
        setFlyTarget([from, [hotel.location.lat, hotel.location.lng]]);
        calcRoute(from, hotel, prof);
      },
      (err) => {
        clearTimeout(timer);
        useFallback(
          err.code === 1 ? "Joylashuvni aniqlashga ruxsat berilmadi. Navoiy shahar markazidan yo'nalish chizilmoqda." : "Hozirgi joylashuvingizni aniqlab bo'lmadi. Navoiy shahar markazidan yo'nalish chizilmoqda."
        );
      },
      { timeout: 7000, enableHighAccuracy: true, maximumAge: 60000 }
    );
  };

  const switchProfile = (prof) => {
    setProfile(prof);
    if (userPos && activeHotel) {
      setFlyTarget([userPos, [activeHotel.location.lat, activeHotel.location.lng]]);
      calcRoute(userPos, activeHotel, prof);
    }
  };

  const clearGuidance = () => {
    setUserPos(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setRouteError(null);
    setGeoMsg(null);
    setActiveHotel(null);
    setFlyTarget(null);
  };

  const openPanel = (hotel) => {
    setSelected(hotel);
    setShowPanel(true);
    setFlyTarget([hotel.location.lat, hotel.location.lng]);
    setTimeout(() => markerRefs.current[hotel._id]?.openPopup(), 350);
  };

  const closePanel = () => {
    setShowPanel(false);
    if (selected && markerRefs.current[selected._id]) {
      markerRefs.current[selected._id].closePopup();
    }
    setTimeout(() => setSelected(null), 300);
  };

  const isRouting = geoLoading || routeLoading;

  return (
    <div
      className="relative w-full overflow-hidden flex flex-col"
      style={{ height: '100dvh', background: 'var(--bg-main)' }}
    >
      {/* TOP BAR OUTSIDE MAP */}
      <div className="shrink-0 z-[600] border-b border-slate-200 dark:border-slate-800 shadow-sm" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <MapTopBar
          filteredCount={filtered.length}
          filterCat={filterCat}
          setFilterCat={setFilterCat}
          FILTERS={FILTERS}
          geoLoading={geoLoading}
          setGeoLoading={setGeoLoading}
          setUserPos={setUserPos}
          NAVOIY_CENTER={NAVOIY_CENTER}
          setFlyTarget={setFlyTarget}
        />
      </div>

      {/* MAP BACKGROUND */}
      <div className="flex-1 relative z-0 animate-fade-in">
        {loading ? (
          <Loader message="Xarita yuklanmoqda..." />
        ) : (
          <MapContainer
            center={NAVOIY_CENTER}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <MapResizer />
            <TileLayer
              attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
              url={darkMode ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
            />

            {flyTarget && <FlyTo coords={flyTarget} zoom={15} />}

            {/* User position */}
            {userPos && <Marker position={userPos} icon={userIcon} />}

            {/* Route polylines */}
            {routeCoords.length > 1 && (
              <>
                {/* Crisp Outline */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#312e81', weight: 8, opacity: 0.8, lineCap: 'round', lineJoin: 'round' }}
                />
                {/* Clean Inner Line */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#4f46e5', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                />
              </>
            )}

            {/* Hotel markers */}
            {filtered.map((hotel) => (
              <Marker
                key={hotel._id}
                position={[hotel.location.lat, hotel.location.lng]}
                icon={createHotelIcon(selected?._id === hotel._id)}
                ref={(el) => {
                  if (el) markerRefs.current[hotel._id] = el;
                }}
                eventHandlers={{
                  click: () => {
                    if (selected?._id === hotel._id && showPanel) closePanel();
                    else openPanel(hotel);
                  },
                }}
              >
                <Popup closeButton={false}>
                  <div style={{ minWidth: 160, padding: '4px' }}>
                    <p
                      style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-main)', marginBottom: 6, cursor: 'pointer', lineHeight: 1.2 }}
                      onClick={() => navigate(`/hotel/${hotel._id}`)}
                    >
                      {hotel.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Stars count={hotel.stars} />
                    </div>
                    {fmtPrice(getMinPrice(hotel)) && (
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                        {fmtPrice(getMinPrice(hotel))} UZS <span style={{ fontSize: 10, color: '#64748b', fontWeight: 500 }}>(boshlang'ich narx)</span>
                      </p>
                    )}
                    {calcAccessibilityScore(hotel) > 0 && (
                      <div style={{ marginTop: 6 }}>
                        <span
                          style={{
                            background: getScoreStyle(calcAccessibilityScore(hotel)).bg,
                            color: getScoreStyle(calcAccessibilityScore(hotel)).color,
                            padding: '2px 6px',
                            borderRadius: '12px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          ♿ Inklyuzivlik: {calcAccessibilityScore(hotel)}%
                        </span>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startGuidance(hotel);
                        }}
                        className="btn-primary"
                        style={{
                          flex: 1,
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 0',
                          fontSize: 12,
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                          cursor: 'pointer',
                        }}
                      >
                        <FiNavigation style={{ width: 12, height: 12 }} /> Marshrut
                      </button>
                      <button
                        onClick={() => navigate(`/hotel/${hotel._id}`)}
                        className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                        style={{
                          flex: 1,
                          border: 'none',
                          borderRadius: 6,
                          padding: '8px 0',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Batafsil ko'rish
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}

        {/* Route overlay controls */}
        <MapRouteOverlay
          activeHotel={activeHotel}
          loading={loading}
          clearGuidance={clearGuidance}
          switchProfile={switchProfile}
          profile={profile}
          isRouting={isRouting}
          geoLoading={geoLoading}
          routeInfo={routeInfo}
          routeError={routeError}
          geoMsg={geoMsg}
        />

        {/* Legend */}
        {!loading && (
          <div className="absolute bottom-6 left-4 z-[400] flex flex-col gap-2 pointer-events-auto">
            <div
              className="hidden sm:flex flex-col gap-3 p-4 rounded-2xl animate-fade-in shadow-lg shadow-slate-200/40 dark:shadow-black/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60"
            >
              <p
                className="text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
              >
                <FiLayers className="w-3.5 h-3.5 text-blue-500" /> Turkumlar
              </p>
              <div className="flex flex-col gap-2.5">
                {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                  <div key={cat} className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 -mx-1 rounded-md transition-colors cursor-pointer">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ background: CATEGORY_COLORS[cat] }} />
                    <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Panel */}
      <MapHotelPanel
        selected={selected}
        showPanel={showPanel}
        closePanel={closePanel}
        activeHotel={activeHotel}
        routeInfo={routeInfo}
        isRouting={isRouting}
        userPos={userPos}
        startGuidance={startGuidance}
        clearGuidance={clearGuidance}
        profile={profile}
        navigate={navigate}
      />
    </div>
  );
};

export default HotelsMap;
