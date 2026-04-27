import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { FiNavigation, FiLayers } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/Loader';

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

const HotelsMap = () => {
  const navigate = useNavigate();
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
        const list = Array.isArray(res.data) ? res.data : res.data.hotels || [];
        setHotels(list.filter((h) => h.location?.lat && h.location?.lng));
      })
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

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
      setRouteError("Yo'l topolmadi.");
    } finally {
      setRouteLoading(false);
    }
  }, []);

  // ── Start guidance ──────────────────────────────────────────────────────────
  const startGuidance = (hotel, prof = profile) => {
    setGeoLoading(true);
    setGeoMsg(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setActiveHotel(hotel);

    const useFallback = (msg) => {
      setUserPos(NAVOIY_CENTER);
      setGeoLoading(false);
      setGeoMsg(msg);
      calcRoute(NAVOIY_CENTER, hotel, prof);
    };

    if (!navigator.geolocation) {
      useFallback('Geolokatsiya mavjud emas.');
      return;
    }

    const timer = setTimeout(
      () => useFallback("Joylashuv topilmadi. Navoiy markazidan yo'l ko'rsatilmoqda."),
      5000
    );

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        const from = [pos.coords.latitude, pos.coords.longitude];
        setUserPos(from);
        setGeoLoading(false);
        setGeoMsg(null);
        calcRoute(from, hotel, prof);
      },
      (err) => {
        clearTimeout(timer);
        useFallback(
          err.code === 1 ? "Ruxsat berilmadi. Navoiy markazidan yo'l ko'rsatilmoqda." : "Joylashuv topilmadi. Navoiy markazidan yo'l ko'rsatilmoqda."
        );
      },
      { timeout: 4000, enableHighAccuracy: false, maximumAge: 120000 }
    );
  };

  const switchProfile = (prof) => {
    setProfile(prof);
    if (userPos && activeHotel) calcRoute(userPos, activeHotel, prof);
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
      <div className="flex-1 relative z-0">
        {loading ? (
          <Loader message="Xarita yuklanmoqda..." />
        ) : (
          <MapContainer
            center={NAVOIY_CENTER}
            zoom={13}
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                  pathOptions={{ color: '#1e40af', weight: 8, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
                />
                {/* Clean Inner Line */}
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#3b82f6', weight: 4, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
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
                      style={{ fontWeight: 800, fontSize: 14, color: '#0f172a', marginBottom: 6, cursor: 'pointer', lineHeight: 1.2 }}
                      onClick={() => navigate(`/hotel/${hotel._id}`)}
                    >
                      {hotel.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <Stars count={hotel.stars} />
                    </div>
                    {fmtPrice(getMinPrice(hotel)) && (
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#059669', marginTop: 4 }}>
                        {fmtPrice(getMinPrice(hotel))} UZS
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                      <button
                        onClick={() => {
                          openPanel(hotel);
                          startGuidance(hotel);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white transition-colors"
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
                        <FiNavigation style={{ width: 12, height: 12 }} /> Yo'l
                      </button>
                      <button
                        onClick={() => navigate(`/hotel/${hotel._id}`)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
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
                        Batafsil
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
                <FiLayers className="w-3.5 h-3.5 text-blue-500" /> Turlari
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
