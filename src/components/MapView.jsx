import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiNavigation, FiX, FiMaximize, FiMinimize, FiMapPin, FiLoader } from 'react-icons/fi';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Hotel destination marker
const hotelIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.2));
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="#3b82f6" stroke="white" stroke-width="2" stroke-linejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// User location icon (blue pulsing dot)
const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:0;
        background:#3b82f6;border-radius:50%;
        border:4px solid white;
        box-shadow:0 0 15px rgba(59,130,246,0.6);
        z-index:2;
      "></div>
      <div style="
        position:absolute;inset:-8px;
        background:rgba(59,130,246,0.3);
        border-radius:50%;
        animation:pulse 2s infinite;
        z-index:1;
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Fit map to show both points
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 2) {
      map.fitBounds(points, { padding: [80, 80], duration: 1.5 });
    } else if (points.length === 1) {
      map.flyTo(points[0], 15, { duration: 1.2 });
    }
  }, [points, map]);
  return null;
};

// Map Layers stable component
const MapLayers = ({ hasCoords, lat, lng, userPos, boundsPoints }) => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {boundsPoints.length > 0 && <FitBounds points={boundsPoints} />}
      {hasCoords && <Marker position={[lat, lng]} icon={hotelIcon} />}
      {userPos && (
        <>
          <Marker position={userPos} icon={userLocationIcon} />
          {hasCoords && (
            <>
              <Polyline
                positions={[userPos, [lat, lng]]}
                pathOptions={{ color: '#2563eb', weight: 8, opacity: 0.2 }}
              />
              <Polyline
                positions={[userPos, [lat, lng]]}
                pathOptions={{ color: '#2563eb', weight: 4, dashArray: '10, 10', opacity: 0.9 }}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

const MapView = ({ hotel, userPos: externalUserPos, onClearGuidance }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [internalUserPos, setInternalUserPos] = useState(null);
  const [loadingPos, setLoadingPos]           = useState(false);

  // Use external userPos if provided, otherwise internal
  const userPos       = externalUserPos ?? internalUserPos;
  const clearGuidance = onClearGuidance ?? (() => setInternalUserPos(null));

  const lat  = hotel?.location?.lat;
  const lng  = hotel?.location?.lng;
  const name = (hotel?.name || '');

  const hasCoords = lat && lng;
  const center    = hasCoords ? [lat, lng] : [40.0842, 65.3791];

  const startGuidance = () => {
    setLoadingPos(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setInternalUserPos(coords);
        setLoadingPos(false);
      },
      () => {
        const fallback = [40.0842, 65.3791];
        setInternalUserPos(fallback);
        setLoadingPos(false);
      },
      { timeout: 6000 }
    );
  };

  const boundsPoints = userPos && hasCoords
    ? [userPos, [lat, lng]]
    : hasCoords
      ? [[lat, lng]]
      : [];

  const getExternalMapUrl = () => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  };

  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (userPos && hasCoords) {
      const d = L.latLng(userPos).distanceTo(L.latLng([lat, lng]));
      setDistance(d > 1000 ? `${(d / 1000).toFixed(1)} km` : `${Math.round(d)} m`);
    } else {
      setDistance(null);
    }
  }, [userPos, lat, lng, hasCoords]);

  return (
    <>
      {/* Inline map */}
      <div className="relative overflow-hidden w-full transition-all duration-500"
        style={{ height: 'clamp(260px, 35vh, 380px)', borderRadius: '2.5rem', border: '1.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <MapContainer
          center={center}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <MapLayers hasCoords={hasCoords} lat={lat} lng={lng} userPos={userPos} boundsPoints={boundsPoints} />
        </MapContainer>

        {/* Controls Overlay */}
        <div className="absolute inset-x-0 top-0 p-4 pointer-events-none flex justify-between items-start z-[400]">
           {/* Active Guidance Badge */}
           {userPos ? (
            <div className="pointer-events-auto flex flex-col gap-1.5 animate-fade-in">
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl"
                style={{ background: '#2563eb', color: 'white', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 10px 25px rgba(37,99,235,0.4)' }}>
                <FiNavigation className="w-4 h-4 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-wider">Yo'nalish faol</span>
              </div>
              {distance && (
                <div className="px-3 py-1.5 rounded-xl text-[11px] font-black self-start"
                  style={{ background: 'rgba(255,255,255,0.95)', color: '#1e293b', backdropFilter: 'blur(12px)', border: '1px solid var(--border)' }}>
                  Masofa: {distance}
                </div>
              )}
            </div>
          ) : <div />}

          <button
            onClick={() => setFullscreen(true)}
            className="pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', border: '1px solid var(--border)', color: '#1e293b', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}
          >
            <FiMaximize className="w-4 h-4" />
            <span className="text-[11px] font-black uppercase tracking-widest">Kattalashtirish</span>
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 p-6 pointer-events-none z-[400]">
          <div className="flex justify-center sm:justify-end gap-3 pointer-events-auto">
            {userPos ? (
              <>
                <a
                  href={getExternalMapUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="h-14 px-6 rounded-[1.25rem] flex items-center gap-3 transition-all active:scale-95"
                  style={{ background: 'white', color: '#1e293b', border: '1.5px solid var(--border)', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }}
                >
                  <FiMapPin className="w-5 h-5 text-rose-500" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Google Maps</span>
                </a>
                <button
                  onClick={clearGuidance}
                  className="h-14 px-6 rounded-[1.25rem] flex items-center gap-3 transition-all active:scale-95"
                  style={{ background: 'rgba(239,68,68,0.95)', color: 'white', border: 'none', boxShadow: '0 10px 25px rgba(239,68,68,0.3)' }}
                >
                  <FiX className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Yopish</span>
                </button>
              </>
            ) : (
              <button
                onClick={startGuidance}
                disabled={loadingPos}
                className="h-14 px-8 rounded-[1.25rem] flex items-center gap-3 transition-all active:scale-95 disabled:opacity-70"
                style={{ background: 'var(--gradient-main)', color: 'white', border: 'none', boxShadow: 'var(--shadow-colored)' }}
              >
                {loadingPos ? (
                  <FiLoader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <FiNavigation className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Yo'nalishni ko'rish</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: 'var(--bg-main)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.1)' }}>
                <FiMapPin className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-extrabold" style={{ color: 'var(--text-main)' }}>{name}</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
                  {userPos ? 'Yo\'nalish ko\'rsatilmoqda' : 'Xaritada joylashuv'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userPos ? (
                <button
                  onClick={clearGuidance}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#ef4444' }}
                >
                  <FiX className="w-3.5 h-3.5" /> Yopish
                </button>
              ) : (
                <button
                  onClick={startGuidance}
                  disabled={loadingPos}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-70"
                  style={{ background: '#6366f1' }}
                >
                  {loadingPos
                    ? <FiLoader className="w-3.5 h-3.5 animate-spin" />
                    : <><FiNavigation className="w-3.5 h-3.5" /> Yo'l ko'rsatish</>
                  }
                </button>
              )}
              <button
                onClick={() => setFullscreen(false)}
                className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
              >
                <FiMinimize className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Full map */}
          <div className="flex-1">
            <MapContainer
              center={center}
              zoom={14}
              style={{ width: '100%', height: '100%' }}
              zoomControl={true}
            >
              <MapLayers hasCoords={hasCoords} lat={lat} lng={lng} userPos={userPos} boundsPoints={boundsPoints} />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;
