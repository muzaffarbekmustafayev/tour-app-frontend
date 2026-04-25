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
      className="flex flex-col overflow-hidden"
      style={{ height: '100dvh', background: 'var(--bg-main)' }}
    >
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

      {/* MAP */}
      <div className="flex-1 relative overflow-hidden">
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
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#3b82f6', weight: 14, opacity: 0.12, lineCap: 'round', lineJoin: 'round' }}
                />
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#2563eb', weight: 5.5, opacity: 1, lineCap: 'round', lineJoin: 'round' }}
                />
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: '#ffffff', weight: 2, opacity: 0.5, dashArray: '1, 12', lineCap: 'round' }}
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
                  <div style={{ minWidth: 160, padding: '4px 2px' }}>
                    <p
                      style={{ fontWeight: 800, fontSize: 13, color: '#1e293b', marginBottom: 4, cursor: 'pointer' }}
                      onClick={() => navigate(`/hotel/${hotel._id}`)}
                    >
                      {hotel.name}
                    </p>
                    <Stars count={hotel.stars} />
                    {fmtPrice(getMinPrice(hotel)) && (
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#059669', marginTop: 3 }}>
                        {fmtPrice(getMinPrice(hotel))} UZS
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <button
                        onClick={() => {
                          openPanel(hotel);
                          startGuidance(hotel);
                        }}
                        style={{
                          flex: 1,
                          background: '#6366f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 0',
                          fontSize: 11,
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          cursor: 'pointer',
                          minHeight: 'unset',
                        }}
                      >
                        <FiNavigation style={{ width: 11, height: 11 }} /> Yo'l
                      </button>
                      <button
                        onClick={() => navigate(`/hotel/${hotel._id}`)}
                        style={{
                          flex: 1,
                          background: '#f1f5f9',
                          color: '#1e293b',
                          border: 'none',
                          borderRadius: 8,
                          padding: '6px 0',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          minHeight: 'unset',
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
          <div className="absolute bottom-4 left-4 z-[400] flex flex-col gap-2">
            <div
              className="hidden sm:flex flex-col gap-1.5 p-3 rounded-2xl animate-fade-in"
              style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <FiLayers style={{ width: 10, height: 10 }} /> Turlari
              </p>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: CATEGORY_COLORS[cat] }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
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
