import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import BackButton from '../components/BackButton';
import api from '../services/api';
import {
  FiMapPin, FiNavigation, FiStar, FiX, FiExternalLink,
  FiPhone, FiGlobe, FiInfo, FiChevronRight, FiMap,
  FiHome, FiAirplay, FiTruck, FiTag, FiLayers, FiLoader
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

// FlyTo + draw route
const RouteLayer = ({ userPos, hotel }) => {
  const map = useMap();
  useEffect(() => {
    if (!userPos || !hotel?.location) return;
    const dest = [hotel.location.lat, hotel.location.lng];
    map.flyToBounds([userPos, dest], { padding: [60, 60], duration: 1.2 });
  }, [userPos, hotel, map]);
  return null;
};

const createHotelIcon = (color = '#6366f1', isSelected = false) => {
  const size = isSelected ? 44 : 36;
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 4px 14px -2px ${color}88;
      ">
        <div style="
          width:100%;height:100%;
          display:flex;align-items:center;justify-content:center;
          transform:rotate(45deg);
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="${isSelected ? 16 : 13}" height="${isSelected ? 16 : 13}" viewBox="0 0 24 24" fill="white" stroke="none">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
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

const TransportRoutes = () => {
  const navigate = useNavigate();
  const [hotels, setHotels]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [userPos, setUserPos]     = useState(null);   // [lat, lng]
  const [routing, setRouting]     = useState(false);  // geolocation loading
  const [routeTarget, setRouteTarget] = useState(null); // hotel being routed to
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

  const getName = (h) =>
    typeof h.name === 'object'
      ? (h.name.uz || h.name.en || Object.values(h.name)[0])
      : h.name;

  const getMinPrice = (h) => {
    if (h.basePricePerNight) return h.basePricePerNight;
    if (h.rooms?.length) return Math.min(...h.rooms.map(r => r.pricePerNight || 0));
    return null;
  };

  const startRoute = (hotel) => {
    setRouting(true);
    setRouteTarget(hotel);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setRouting(false);
      },
      () => {
        // Geolocation ruxsat berilmasa — Navoiy markazidan boshlaymiz
        setUserPos(NAVOIY_CENTER);
        setRouting(false);
      },
      { timeout: 6000 }
    );
  };

  const clearRoute = () => {
    setUserPos(null);
    setRouteTarget(null);
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
            {filtered.length} ta joy • belgiga bosib marshrut oling
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

      {/* ── Map + Side panel ── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Map */}
        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10"
              style={{ background: 'var(--bg-main)' }}>
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>Xarita yuklanmoqda...</p>
            </div>
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

              {selected && <FlyToHotel hotel={selected} />}

              {/* Route line */}
              {userPos && routeTarget && (
                <>
                  <RouteLayer userPos={userPos} hotel={routeTarget} />
                  <Polyline
                    positions={[userPos, [routeTarget.location.lat, routeTarget.location.lng]]}
                    pathOptions={{ color: '#6366f1', weight: 4, dashArray: '8 6', opacity: 0.85 }}
                  />
                  <Marker position={userPos} icon={userLocationIcon}>
                    <Popup>
                      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 13 }}>
                        Siz shu yerdasiz
                      </span>
                    </Popup>
                  </Marker>
                </>
              )}

              {filtered.map(hotel => (
                <Marker
                  key={hotel._id}
                  position={[hotel.location.lat, hotel.location.lng]}
                  icon={createHotelIcon(
                    CATEGORY_COLORS[hotel.category] || '#6366f1',
                    selected?._id === hotel._id
                  )}
                  ref={el => { if (el) markerRefs.current[hotel._id] = el; }}
                  eventHandlers={{ click: () => setSelected(hotel) }}
                >
                  <Popup>
                    <div style={{ minWidth: 200, fontFamily: 'Outfit, sans-serif' }}>
                      <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 4, color: '#1e293b' }}>
                        {getName(hotel)}
                      </p>
                      <Stars count={hotel.stars} />
                      {hotel.address && (
                        <p style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{hotel.address}</p>
                      )}
                      {getMinPrice(hotel) && (
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#10b981', marginTop: 6 }}>
                          {formatPrice(getMinPrice(hotel))} UZS / kecha
                        </p>
                      )}
                      <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                        <button
                          onClick={() => { setSelected(hotel); startRoute(hotel); }}
                          style={{
                            flex: 1, background: '#6366f1', color: 'white',
                            border: 'none', borderRadius: 10, padding: '7px 10px',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                          </svg>
                          Yo'l ko'rsatish
                        </button>
                        <button
                          onClick={() => navigate(`/hotel/${hotel._id}`)}
                          style={{
                            flex: 1, background: '#f1f5f9', color: '#1e293b',
                            border: 'none', borderRadius: 10, padding: '7px 10px',
                            fontSize: 12, fontWeight: 700, cursor: 'pointer',
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

          {/* Active route banner */}
          {userPos && routeTarget && !loading && (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: '#6366f1', color: 'white', boxShadow: '0 4px 20px rgba(99,102,241,0.5)', maxWidth: 'calc(100% - 2rem)' }}
            >
              <FiNavigation className="w-4 h-4 shrink-0 animate-pulse" />
              <span className="text-xs font-bold truncate">
                {getName(routeTarget)} — yo'nalish ko'rsatilmoqda
              </span>
              <button
                onClick={clearRoute}
                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.2)', minHeight: 24, minWidth: 24 }}
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Legend */}
          {!loading && (
            <div
              className="absolute bottom-4 left-4 z-[400] flex flex-col gap-1.5 p-3 rounded-2xl"
              style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(16px)', border: '1px solid var(--border)' }}
            >
              <p className="text-[9px] font-black uppercase tracking-widest mb-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <FiLayers className="w-3 h-3" /> Turlari
              </p>
              {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
                <div key={cat} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[cat] }} />
                  <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Side panel ── */}
        {selected && (
          <div
            className="w-80 shrink-0 overflow-y-auto flex flex-col"
            style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}
          >
            {/* Cover image */}
            <div className="relative h-44 shrink-0 overflow-hidden bg-gray-100 dark:bg-slate-800">
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

              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.5)', color: 'white', minHeight: 32, minWidth: 32 }}
                aria-label="Yopish"
              >
                <FiX className="w-4 h-4" />
              </button>

              {/* Category badge */}
              <span
                className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white"
                style={{ background: CATEGORY_COLORS[selected.category] || '#6366f1' }}
              >
                {CATEGORY_LABELS[selected.category] || selected.category}
              </span>
            </div>

            {/* Details */}
            <div className="p-4 flex flex-col gap-3 flex-1">

              {/* Name + rating */}
              <div>
                <h2 className="text-base font-extrabold leading-snug mb-1.5" style={{ color: 'var(--text-main)' }}>
                  {getName(selected)}
                </h2>
                <div className="flex items-center gap-2">
                  <Stars count={selected.stars} />
                  {selected.rating > 0 && (
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                      {selected.rating.toFixed(1)} — {selected.reviewsCount || 0} ta sharh
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              {selected.address && (
                <div className="flex items-start gap-2">
                  <FiMapPin className="w-4 h-4 mt-0.5 shrink-0 text-indigo-500" />
                  <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text-muted)' }}>
                    {selected.address}
                  </p>
                </div>
              )}

              {/* Price */}
              {getMinPrice(selected) && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-0.5 flex items-center gap-1">
                    <FiTag className="w-3 h-3" /> Narx (bir kecha)
                  </p>
                  <p className="text-lg font-black text-emerald-600">
                    {formatPrice(getMinPrice(selected))}
                    <span className="text-sm font-semibold"> UZS</span>
                  </p>
                </div>
              )}

              {/* Short description */}
              {(selected.descriptionShort?.uz || selected.description?.uz) && (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {selected.descriptionShort?.uz || selected.description?.uz}
                </p>
              )}

              {/* Amenities */}
              {selected.amenities?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider mb-2 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <FiInfo className="w-3 h-3" /> Qulayliklar
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.amenities.slice(0, 6).map((a, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact */}
              {(selected.contact?.phone || selected.contact?.website) && (
                <div className="flex flex-col gap-2">
                  {selected.contact.phone && (
                    <a
                      href={`tel:${selected.contact.phone}`}
                      className="flex items-center gap-2 text-sm font-semibold"
                      style={{ color: 'var(--text-main)' }}
                    >
                      <FiPhone className="w-4 h-4 text-indigo-500 shrink-0" />
                      {selected.contact.phone}
                    </a>
                  )}
                  {selected.contact.website && (
                    <a
                      href={selected.contact.website}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-sm font-semibold"
                      style={{ color: '#6366f1' }}
                    >
                      <FiGlobe className="w-4 h-4 shrink-0" />
                      Rasmiy veb-sayt
                      <FiExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}

              {/* Distance */}
              {(selected.distance?.airport || selected.distance?.cityCenter || selected.distance?.trainStation) && (
                <div
                  className="rounded-xl p-3 flex flex-col gap-2"
                  style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}
                >
                  <p className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <FiNavigation className="w-3 h-3" /> Masofalar
                  </p>
                  {selected.distance.cityCenter && (
                    <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <FiHome className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                      Shahar markazi — {selected.distance.cityCenter}
                    </p>
                  )}
                  {selected.distance.airport && (
                    <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <FiAirplay className="w-3.5 h-3.5 shrink-0 text-sky-400" />
                      Aeroport — {selected.distance.airport}
                    </p>
                  )}
                  {selected.distance.trainStation && (
                    <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                      <FiTruck className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      Temir yo'l vokzali — {selected.distance.trainStation}
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-2 mt-auto pt-2">
                <button
                  onClick={() => {
                    if (routeTarget?._id === selected._id && userPos) {
                      clearRoute();
                    } else {
                      startRoute(selected);
                    }
                  }}
                  disabled={routing}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-70"
                  style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}
                >
                  {routing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Joylashuv aniqlanmoqda...
                    </>
                  ) : routeTarget?._id === selected._id && userPos ? (
                    <>
                      <FiX className="w-4 h-4" />
                      Marshrutni yopish
                    </>
                  ) : (
                    <>
                      <FiNavigation className="w-4 h-4" />
                      Yo'l ko'rsatish
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/hotel/${selected._id}`)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm transition-all active:scale-95"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                >
                  To'liq ma'lumot
                  <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Mobile hotel list (bottom scroll) ── */}
      <div
        className="md:hidden shrink-0 overflow-x-auto hide-scrollbar flex gap-3 px-4 py-3"
        style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderTop: '1px solid var(--border)' }}
      >
        {!loading && filtered.length === 0 && (
          <p className="text-sm font-semibold py-2 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
            Ushbu turkumda joy topilmadi
          </p>
        )}
        {filtered.map(hotel => (
          <button
            key={hotel._id}
            onClick={() => handleSelect(hotel)}
            className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl transition-all active:scale-95"
            style={{
              background: selected?._id === hotel._id
                ? (CATEGORY_COLORS[hotel.category] || '#6366f1')
                : 'var(--bg-card)',
              border: `1px solid ${selected?._id === hotel._id ? 'transparent' : 'var(--border)'}`,
              color: selected?._id === hotel._id ? 'white' : 'var(--text-main)',
              minHeight: 44, minWidth: 'auto',
            }}
          >
            <FiMapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-bold whitespace-nowrap">{getName(hotel)}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransportRoutes;
