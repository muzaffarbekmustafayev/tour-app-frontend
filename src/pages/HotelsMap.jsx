import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLayers, FiBox, FiMap } from 'react-icons/fi';
import api from '../services/api';
import Loader from '../components/Loader';
import { AuthContext } from '../context/AuthContext';

import {
  NAVOIY_CENTER,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  FILTERS,
  DISTRICT_FILTERS,
  fetchRoute,
} from '../components/map/mapUtils';
import { fetchNearbyStays } from '../services/attractions';

import MapLibreView from '../components/map/MapLibreView';
import MapTopBar from '../components/map/MapTopBar';
import MapHotelPanel from '../components/map/MapHotelPanel';
import MapAttractionPanel from '../components/map/MapAttractionPanel';
import MapRouteOverlay from '../components/map/MapRouteOverlay';

const HotelsMap = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useContext(AuthContext);
  const [hotels, setHotels] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // hotel panel
  const [selectedAttraction, setSelectedAttraction] = useState(null); // tarixiy joy paneli
  const [attractionNearby, setAttractionNearby] = useState([]); // tanlangan joyning yaqin maskanlari
  const [attractionLoading, setAttractionLoading] = useState(false);
  const [filterCat, setFilterCat] = useState('all');
  const [districtFilter, setDistrictFilter] = useState('all');
  const [userPos, setUserPos] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoMsg, setGeoMsg] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState(null);
  const [profile, setProfile] = useState('driving');
  const [activeHotel, setActiveHotel] = useState(null);
  const [flyTarget, setFlyTarget] = useState(null);
  const [showPanel, setShowPanel] = useState(false); // mobile bottom sheet open state
  const [view3D, setView3D] = useState(false); // boshida 2D; marshrut ochilganda 3D
  const markerRefs = useRef({});

  useEffect(() => {
    const coordOk = (o) => {
      const lat = o.location?.lat ?? o.geo?.coordinates?.[1];
      const lng = o.location?.lng ?? o.geo?.coordinates?.[0];
      return Number.isFinite(lat) && Number.isFinite(lng);
    };
    Promise.all([
      api.get('/hotels?limit=100').then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || res.data.hotels || []);
        return list.filter(coordOk);
      }).catch(() => []),
      api.get('/attractions?limit=100').then((res) => {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        // Tarixiy joyning location'i geo'dan ham kelishi mumkin — normallashtiramiz
        return list.filter(coordOk).map((a) => ({
          ...a,
          location: a.location?.lat ? a.location : { lat: a.geo?.coordinates?.[1], lng: a.geo?.coordinates?.[0] },
        }));
      }).catch(() => []),
    ])
      .then(([h, a]) => { setHotels(h); setAttractions(a); })
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

  // ── Filtr: tur (kategoriya/tarixiy joy) + tuman ──────────────────────────────
  const inDistrict = (o) => districtFilter === 'all' || o.district === districtFilter;

  const visibleHotels = (filterCat === 'attraction' ? [] : hotels).filter(
    (h) => (filterCat === 'all' || filterCat === 'attraction' || h.category === filterCat) && inDistrict(h)
  );
  const visibleAttractions = (filterCat === 'all' || filterCat === 'attraction')
    ? attractions.filter(inDistrict)
    : [];

  // Marker soni (yuqori paneldagi hisob)
  const totalVisible = visibleHotels.length + visibleAttractions.length;

  // ── Tarixiy joy tanlanganda — yaqin tunash joylarini yuklab, eng yaqinini auto-tanlash ──
  const openAttraction = async (a) => {
    // Hotel panelini yopamiz
    setShowPanel(false);
    setSelected(null);
    setSelectedAttraction(a);
    setAttractionNearby([]);
    const lat = a.location?.lat ?? a.geo?.coordinates?.[1];
    const lng = a.location?.lng ?? a.geo?.coordinates?.[0];
    if (Number.isFinite(lat) && Number.isFinite(lng)) setFlyTarget([lat, lng]);
    setAttractionLoading(true);
    try {
      const res = await fetchNearbyStays(a._id);
      setAttractionNearby(Array.isArray(res) ? res : (res.data || []));
    } catch {
      setAttractionNearby([]);
    } finally {
      setAttractionLoading(false);
    }
  };

  const closeAttraction = () => {
    setSelectedAttraction(null);
    setAttractionNearby([]);
  };

  // Tarixiy joy panelidan "tunash joyi" kartochkasini bosish → hotel panelini ochish
  const openHotelFromAttraction = (hotel) => {
    closeAttraction();
    openPanel(hotel);
  };

  // Tarixiy joy panelidan "Yo'l" → foydalanuvchidan eng yaqin maskangacha marshrut
  const routeFromAttraction = (hotel) => {
    closeAttraction();
    startGuidance(hotel);
  };

  // ── Route calculation ───────────────────────────────────────────────────────
  const calcRoute = useCallback(async (from, hotel, prof) => {
    if (!from || !hotel?.location) return;
    const to = [hotel.location.lat, hotel.location.lng];
    setRouteLoading(true);
    setRouteError(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setRouteSteps([]);
    try {
      const r = await fetchRoute(from, to, prof);
      setRouteCoords(r.coords);
      setRouteInfo({ distance: r.distance, duration: r.duration });
      setRouteSteps(r.steps || []);
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
    setView3D(true); // marshrut ochilganda 3D ko'rinishga o'tish
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
    setRouteSteps([]);
    setRouteError(null);
    setGeoMsg(null);
    setActiveHotel(null);
    setView3D(false); // marshrut yopilganda 2D ko'rinishga qaytish
    setFlyTarget(null);
  };

  const openPanel = (hotel) => {
    setSelected(hotel);
    setShowPanel(true);
    setFlyTarget([hotel.location.lat, hotel.location.lng]);
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
          filteredCount={totalVisible}
          filterCat={filterCat}
          setFilterCat={setFilterCat}
          FILTERS={FILTERS}
          districtFilter={districtFilter}
          setDistrictFilter={setDistrictFilter}
          DISTRICT_FILTERS={DISTRICT_FILTERS}
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
          <>
            <MapLibreView
              hotels={visibleHotels}
              attractions={visibleAttractions}
              selectedId={selected?._id}
              selectedAttractionId={selectedAttraction?._id}
              onSelect={(hotel) => {
                if (selectedAttraction) closeAttraction();
                if (selected?._id === hotel._id && showPanel) closePanel();
                else openPanel(hotel);
              }}
              onSelectAttraction={(a) => {
                if (selectedAttraction?._id === a._id) closeAttraction();
                else openAttraction(a);
              }}
              userPos={userPos}
              routeCoords={routeCoords}
              flyTarget={flyTarget}
              view3D={view3D}
              darkMode={darkMode}
            />

            {/* 2D / 3D segmentli boshqaruv (Google Maps uslubida) */}
            <div className="absolute top-4 right-4 z-[450] flex items-center gap-1 p-1 rounded-2xl shadow-lg shadow-black/10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/40 dark:border-white/10 ring-1 ring-black/5">
              {[
                { v: false, label: '2D', icon: FiMap },
                { v: true, label: '3D', icon: FiBox },
              ].map(({ v, label, icon: Icon }) => {
                const active = view3D === v;
                return (
                  <button
                    key={label}
                    onClick={() => setView3D(v)}
                    aria-pressed={active}
                    aria-label={`${label} ko'rinish`}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {label}
                  </button>
                );
              })}
            </div>
          </>
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
          routeSteps={routeSteps}
          routeError={routeError}
          geoMsg={geoMsg}
        />

        {/* Legend */}
        {!loading && (
          <div className="absolute bottom-6 left-4 z-[400] flex flex-col gap-2 pointer-events-auto">
            <div
              className="hidden sm:flex flex-col gap-3 p-4 rounded-2xl animate-fade-in shadow-lg shadow-black/10 bg-white/85 dark:bg-slate-900/85 backdrop-blur-xl border border-white/40 dark:border-white/10 ring-1 ring-black/5"
            >
              <p
                className="text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 text-slate-400 dark:text-slate-500"
              >
                <FiLayers className="w-3.5 h-3.5 text-indigo-500" /> Turkumlar
              </p>
              <div className="flex flex-col gap-1.5">
                {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                  <div key={cat} className="flex items-center gap-2.5 hover:bg-slate-100/60 dark:hover:bg-slate-800/50 px-1.5 py-1 -mx-1.5 rounded-lg transition-colors">
                    <span className="w-2.5 h-2.5 rounded-full ring-2 ring-white/70 dark:ring-slate-900/70" style={{ background: CATEGORY_COLORS[cat], boxShadow: `0 0 8px ${CATEGORY_COLORS[cat]}66` }} />
                    <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet Panel — Mehmonxona */}
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

      {/* Bottom Sheet Panel — Tarixiy joy + eng yaqin tunash joyi */}
      <MapAttractionPanel
        attraction={selectedAttraction}
        nearby={attractionNearby}
        loading={attractionLoading}
        onClose={closeAttraction}
        onViewAttraction={(a) => navigate(`/attraction/${a._id}`)}
        onViewHotel={openHotelFromAttraction}
        onRouteHotel={routeFromAttraction}
      />
    </div>
  );
};

export default HotelsMap;
