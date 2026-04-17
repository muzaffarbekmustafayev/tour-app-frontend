import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BackButton from '../components/BackButton';
import api from '../services/api';
import {
  FiMapPin, FiNavigation, FiStar, FiX, FiChevronRight, FiMap,
  FiTag, FiLayers, FiLoader
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CATEGORY_COLORS = {
  hotel: '#6366f1',
  resort: '#10b981',
  hostel: '#f59e0b',
};

const CATEGORY_LABELS = {
  hotel: 'Mehmonxona',
  resort: 'Resort',
  hostel: 'Yotoqxona',
};

// User location icon (blue pulsing dot)
const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="
        position:absolute;inset:0;
        background:#3b82f6;border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(59,130,246,0.6);
      "></div>
      <div style="
        position:absolute;inset:-6px;
        background:rgba(59,130,246,0.25);
        border-radius:50%;
        animation:pulse 1.8s infinite;
      "></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// FlyTo + draw guidance line
const GuidanceLayer = ({ userPos, hotel }) => {
  const map = useMap();
  useEffect(() => {
    if (!userPos || !hotel?.location) return;
    const dest = [hotel.location.lat, hotel.location.lng];
    map.flyToBounds([userPos, dest], { padding: [60, 60], duration: 1.2 });
  }, [userPos, hotel, map]);
  return null;
};

const createHotelIcon = (isSelected = false) => {
  const size = isSelected ? 38 : 30;
  return L.divIcon({
    className: '',
    html: `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        filter: drop-shadow(0 3px 6px rgba(59,130,246,0.4));
        transition: all 0.3s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="#2563eb" stroke="white" stroke-width="2.5" stroke-linejoin="round">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
};

const FlyToHotel = ({ hotel }) => {
  const map = useMap();
  useEffect(() => {
    if (hotel?.location?.lat && hotel?.location?.lng) {
      map.flyTo([hotel.location.lat, hotel.location.lng], 15, { duration: 1.2 });
    }
  }, [hotel, map]);
  return null;
};

const Stars = ({ count = 0 }) => (
  <span className="flex items-center gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <FiStar
        key={i}
        className="w-3 h-3"
        style={{ color: i < count ? '#fbbf24' : '#cbd5e1', fill: i < count ? '#fbbf24' : 'none' }}
      />
    ))}
  </span>
);

const NAVOIY_CENTER = [40.0842, 65.3791];

const FILTERS = [
  { key: 'all',    label: 'Barchasi' },
  { key: 'hotel',  label: 'Mehmonxona' },
  { key: 'resort', label: 'Resort' },
  { key: 'hostel', label: 'Yotoqxona' },
];

const HotelsMap = () => {
  const navigate = useNavigate();
  const [hotels, setHotels]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [userPos, setUserPos]     = useState(null);   // [lat, lng]
  const [routing, setRouting]     = useState(false);  // geolocation loading
  const [activeGuidance, setActiveGuidance] = useState(null); // hotel being guided to
  const markerRefs = useRef({});

  useEffect(() => {
    api.get('/hotels?limit=100')
      .then(res => {
        const list = Array.isArray(res.data) ? res.data : (res.data.hotels || []);
        setHotels(list.filter(h => h.location?.lat && h.location?.lng));
      })
      .catch(() => setHotels([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterCat === 'all'
    ? hotels
    : hotels.filter(h => h.category === filterCat);

  const handleSelect = (hotel) => {
    setSelected(hotel);
    setTimeout(() => {
      markerRefs.current[hotel._id]?.openPopup();
    }, 400);
  };

  const getName = (h) => h.name;

  const getMinPrice = (h) => {
    if (h.basePricePerNight) return h.basePricePerNight;
    if (h.rooms?.length) return Math.min(...h.rooms.map(r => r.pricePerNight || 0));
    return null;
  };

  const startGuidance = (hotel) => {
    setRouting(true);
    setActiveGuidance(hotel);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setRouting(false);
      },
      () => {
        setUserPos(NAVOIY_CENTER);
        setRouting(false);
      },
      { timeout: 6000 }
    );
  };

  const clearGuidance = () => {
    setUserPos(null);
    setActiveGuidance(null);
  };

  const formatPrice = (p) => new Intl.NumberFormat('uz-UZ').format(p);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-main)' }}>

      {/* ── Top bar ── */}
      <div
        className="flex items-center gap-3 px-4 py-3 z-[500] shrink-0"
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}
      >
        <BackButton className="static" />

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold flex items-center gap-1.5 truncate" style={{ color: 'var(--text-main)' }}>
            <FiMap className="w-4 h-4 text-indigo-500 shrink-0" />
            Navoiy — Mehmonxonalar xaritasi
          </h1>
          <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} ta joy • xaritadan tanlang
          </p>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 shrink-0 overflow-x-auto hide-scrollbar">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilterCat(f.key)}
              className="px-3 rounded-full text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap"
              style={{
                background: filterCat === f.key ? 'var(--gradient-main)' : 'var(--bg-card)',
                color: filterCat === f.key ? 'white' : 'var(--text-muted)',
                border: `1px solid ${filterCat === f.key ? 'transparent' : 'var(--border)'}`,
                minHeight: 32, minWidth: 'auto', padding: '6px 12px',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Map + Panels ── */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">

        {/* Map Container */}
        <div className="flex-1 relative order-1 md:order-1">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-[450]"
              style={{ background: 'var(--bg-main)' }}>
              <FiLoader className="w-10 h-10 text-indigo-500 animate-spin" />
              <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Xarita yuklanmoqda...</p>
            </div>
          ) : (
            <MapContainer
              center={NAVOIY_CENTER}
              zoom={13}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {selected && <FlyToHotel hotel={selected} />}

              {/* Guidance line */}
              {userPos && activeGuidance && (
                <>
                  <GuidanceLayer userPos={userPos} hotel={activeGuidance} />
                  {/* Outer glow line */}
                  <Polyline
                    positions={[userPos, [activeGuidance.location.lat, activeGuidance.location.lng]]}
                    pathOptions={{ color: '#2563eb', weight: 8, opacity: 0.2 }}
                  />
                  {/* Main dashed line */}
                  <Polyline
                    positions={[userPos, [activeGuidance.location.lat, activeGuidance.location.lng]]}
                    pathOptions={{ color: '#2563eb', weight: 4, dashArray: '10, 10', opacity: 0.9 }}
                  />
                  <Marker position={userPos} icon={userLocationIcon}>
                    <Popup>
                      <span className="font-bold text-xs">Siz shu yerdasiz</span>
                    </Popup>
                  </Marker>
                </>
              )}

              {filtered.map(hotel => (
                <Marker
                  key={hotel._id}
                  position={[hotel.location.lat, hotel.location.lng]}
                  icon={createHotelIcon(
                    selected?._id === hotel._id
                  )}
                  ref={el => { if (el) markerRefs.current[hotel._id] = el; }}
                  eventHandlers={{ 
                    click: () => {
                      if (selected?._id === hotel._id) {
                        navigate(`/hotel/${hotel._id}`);
                      } else {
                        setSelected(hotel);
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="min-w-[180px] p-1">
                      <p 
                        className="font-extrabold text-sm mb-1 text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                        onClick={() => navigate(`/hotel/${hotel._id}`)}
                      >
                        {getName(hotel)}
                      </p>
                      <Stars count={hotel.stars} />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => { setSelected(hotel); startGuidance(hotel); }}
                          className="flex-1 bg-indigo-600 text-white border-none rounded-lg py-1.5 text-[11px] font-bold flex items-center justify-center gap-1.5"
                        >
                          <FiNavigation className="w-3 h-3" /> Yo'l
                        </button>
                        <button
                          onClick={() => navigate(`/hotel/${hotel._id}`)}
                          className="flex-1 bg-slate-100 text-slate-800 border-none rounded-lg py-1.5 text-[11px] font-bold"
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

          {/* Active guidance banner */}
          {userPos && activeGuidance && !loading && (
            <div
              className="absolute top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-[400] flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: '#6366f1', color: 'white', boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
            >
              <FiNavigation className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="text-xs font-bold truncate flex-1">
                {getName(activeGuidance)} — yo'nalish
              </span>
              <button
                onClick={clearGuidance}
                className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
                style={{ background: 'rgba(255,255,255,0.2)' }}
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Legend */}
          {!loading && (!selected || window.innerWidth > 768) && (
            <div
              className="absolute bottom-6 left-6 z-[400] hidden sm:flex flex-col gap-1.5 p-3 rounded-2xl"
              style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)' }}
            >
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <FiLayers className="w-3 h-3" /> Turlari
              </p>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <div key={cat} className="flex items-center gap-2">
                  <FiStar className="w-3 h-3 text-blue-500 fill-blue-500 shrink-0" />
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mobile FAB for Location */}
          {!loading && (
            <button
              onClick={() => {
                setRouting(true);
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    setUserPos([pos.coords.latitude, pos.coords.longitude]);
                    setRouting(false);
                  },
                  () => {
                    setUserPos(NAVOIY_CENTER);
                    setRouting(false);
                  }
                );
              }}
              className="absolute bottom-6 right-6 z-[400] w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90"
              style={{ background: 'white', color: '#6366f1', border: '1px solid var(--border)' }}
            >
              {routing ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiNavigation className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* ── Details Panel ── */}
        {selected && (
          <>
            <div
              className="fixed inset-0 z-[550] md:hidden"
              style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(2px)' }}
              onClick={() => setSelected(null)}
            />
            <div
              className="fixed bottom-0 left-0 right-0 z-[600] md:relative md:w-80 md:flex md:flex-col shrink-0 overflow-y-auto hide-scrollbar transition-all duration-300 transform translate-y-0"
              style={{
                background: 'var(--bg-card)',
                borderTopLeftRadius: '2rem',
                borderTopRightRadius: '2rem',
                maxHeight: '80vh',
                borderLeft: '1px solid var(--border)',
                boxShadow: '0 -10px 40px rgba(0,0,0,0.1)'
              }}
            >
              <div className="md:hidden w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto my-3" />
              <div className="relative h-40 md:h-44 shrink-0 overflow-hidden bg-gray-100 dark:bg-slate-800">
                {selected.images?.[0] ? (
                  <img
                    src={selected.images[0].startsWith('http')
                      ? selected.images[0]
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${selected.images[0]}`}
                    alt={getName(selected)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--gradient-main)' }}>
                    <FiMapPin className="w-12 h-12 text-white opacity-40" />
                  </div>
                )}
                <button
                  onClick={() => setSelected(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center hidden md:flex"
                  style={{ background: 'rgba(0,0,0,0.5)', color: 'white' }}
                >
                  <FiX className="w-4 h-4" />
                </button>
                <span
                  className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                  style={{ background: CATEGORY_COLORS[selected.category] || '#6366f1' }}
                >
                  {CATEGORY_LABELS[selected.category] || selected.category}
                </span>
              </div>
              <div className="p-5 flex flex-col gap-4 overflow-y-auto">
                <div>
                  <h2 
                    className="text-lg font-black leading-tight mb-1.5 cursor-pointer hover:text-indigo-600 transition-colors" 
                    style={{ color: 'var(--text-main)' }}
                    onClick={() => navigate(`/hotel/${selected._id}`)}
                  >
                    {getName(selected)}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Stars count={selected.stars} />
                    {selected.rating > 0 && (
                      <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                        {selected.rating.toFixed(1)} <span className="opacity-50 mx-1">•</span> {selected.reviewsCount || 0} ta sharh
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {getMinPrice(selected) && (
                    <div className="rounded-2xl p-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-0.5">Narx</p>
                      <p className="text-sm font-black text-emerald-600 truncate">{formatPrice(getMinPrice(selected))} UZS</p>
                    </div>
                  )}
                  {selected.city && (
                    <div className="rounded-2xl p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-indigo-600 mb-0.5">Hudud</p>
                      <p className="text-sm font-black text-indigo-600 truncate">{selected.city}</p>
                    </div>
                  )}
                </div>
                <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {selected.descriptionShort || selected.description || "Tavsif mavjud emas."}
                </p>
                <div className="flex flex-col gap-2 mt-2 pb-6 md:pb-0">
                  <button
                    onClick={() => {
                      if (activeGuidance?._id === selected._id && userPos) clearGuidance();
                      else startGuidance(selected);
                    }}
                    disabled={routing}
                    className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl font-black text-sm text-white transition-all active:scale-95 disabled:opacity-70"
                    style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}
                  >
                    {routing ? (
                      <FiLoader className="w-5 h-5 animate-spin" />
                    ) : activeGuidance?._id === selected._id && userPos ? (
                      <><FiX className="w-4 h-4" /> Marshrutni yopish</>
                    ) : (
                      <><FiNavigation className="w-4 h-4" /> Yo'l ko'rsatish</>
                    )}
                  </button>
                  <button
                    onClick={() => navigate(`/hotel/${selected._id}`)}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all active:scale-95"
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                  >
                    Batafsil ma'lumot <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Mobile Scroller ── */}
      {!selected && (
        <div
          className="md:hidden shrink-0 overflow-x-auto hide-scrollbar flex gap-3 px-4 py-4 z-[500]"
          style={{ background: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}
        >
          {filtered.map(hotel => (
            <button
              key={hotel._id}
              onClick={() => handleSelect(hotel)}
              className="flex-shrink-0 flex flex-col gap-2 p-2 rounded-2xl transition-all active:scale-95 text-left w-36"
              style={{ background: 'var(--bg-main)', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
            >
              <div className="w-full h-20 rounded-xl overflow-hidden bg-slate-100">
                {hotel.images?.[0] && (
                  <img
                    src={hotel.images[0].startsWith('http') ? hotel.images[0] : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${hotel.images[0]}`}
                    alt="" className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="px-1">
                <p className="text-[11px] font-black truncate" style={{ color: 'var(--text-main)' }}>{getName(hotel)}</p>
                <div className="flex items-center justify-between mt-1">
                  <Stars count={1} />
                  <span className="text-[10px] font-bold text-emerald-600">{formatPrice(getMinPrice(hotel))}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HotelsMap;
