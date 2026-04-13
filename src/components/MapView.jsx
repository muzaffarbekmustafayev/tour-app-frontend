import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiNavigation, FiX, FiMaximize, FiMinimize, FiMapPin } from 'react-icons/fi';

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
      width:38px;height:38px;
      background:#6366f1;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      border:3px solid white;
      box-shadow:0 4px 14px -2px rgba(99,102,241,0.6);
    ">
      <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;transform:rotate(45deg);">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

// User location marker
const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:20px;height:20px;">
      <div style="position:absolute;inset:0;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(59,130,246,0.6);"></div>
      <div style="position:absolute;inset:-7px;background:rgba(59,130,246,0.2);border-radius:50%;"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Fit map to show both points
const FitBounds = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    if (points.length === 2) {
      map.fitBounds(points, { padding: [50, 50], duration: 1 });
    } else if (points.length === 1) {
      map.flyTo(points[0], 15, { duration: 1 });
    }
  }, [points, map]);
  return null;
};

const MapView = ({ hotel, userPos: externalUserPos, onClearRoute }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [internalUserPos, setInternalUserPos] = useState(null);
  const [routing, setRouting]                 = useState(false);

  // Use external userPos if provided (from HotelDetail), otherwise internal
  const userPos    = externalUserPos ?? internalUserPos;
  const clearRoute = onClearRoute ?? (() => setInternalUserPos(null));

  const lat  = hotel?.location?.lat;
  const lng  = hotel?.location?.lng;
  const name = typeof hotel?.name === 'object'
    ? (hotel.name.uz || hotel.name.en || Object.values(hotel.name)[0])
    : (hotel?.name || '');

  const hasCoords = lat && lng;
  const center    = hasCoords ? [lat, lng] : [40.0842, 65.3791];

  const startRoute = () => {
    setRouting(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        if (onClearRoute) {
          // controlled from parent — parent manages userPos via HotelDetail state
          // we need to lift it up; use a local setter as fallback
          setInternalUserPos(coords);
        } else {
          setInternalUserPos(coords);
        }
        setRouting(false);
      },
      () => {
        const fallback = [40.0842, 65.3791];
        setInternalUserPos(fallback);
        setRouting(false);
      },
      { timeout: 6000 }
    );
  };

  const boundsPoints = userPos && hasCoords
    ? [userPos, [lat, lng]]
    : hasCoords
      ? [[lat, lng]]
      : [];

  const MapContent = () => (
    <>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {boundsPoints.length > 0 && <FitBounds points={boundsPoints} />}
      {hasCoords && <Marker position={[lat, lng]} icon={hotelIcon} />}
      {userPos && (
        <>
          <Marker position={userPos} icon={userIcon} />
          {hasCoords && (
            <Polyline
              positions={[userPos, [lat, lng]]}
              pathOptions={{ color: '#6366f1', weight: 4, dashArray: '8 6', opacity: 0.85 }}
            />
          )}
        </>
      )}
    </>
  );

  return (
    <>
      {/* Inline map */}
      <div className="relative overflow-hidden w-full"
        style={{ height: 220, borderRadius: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
        <MapContainer
          center={center}
          zoom={14}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
        >
          <MapContent />
        </MapContainer>

        {/* Controls */}
        <div className="absolute bottom-3 right-3 flex gap-2 z-[400]">
          {userPos ? (
            <button
              onClick={clearRoute}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
              style={{ background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <FiX className="w-3.5 h-3.5" /> Marshrutni yopish
            </button>
          ) : (
            <button
              onClick={startRoute}
              disabled={routing}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95 disabled:opacity-70"
              style={{ background: 'rgba(99,102,241,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {routing
                ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Aniqlanmoqda...</>
                : <><FiNavigation className="w-3.5 h-3.5" /> Yo'l ko'rsatish</>
              }
            </button>
          )}
          <button
            onClick={() => setFullscreen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
            style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: '#1e293b' }}
          >
            <FiMaximize className="w-3.5 h-3.5" /> To'liq
          </button>
        </div>

        {/* Route active indicator */}
        {userPos && (
          <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.9)', backdropFilter: 'blur(10px)', color: 'white' }}>
            <FiNavigation className="w-3 h-3 animate-pulse" />
            <span className="text-[11px] font-bold">Marshrut ko'rsatilmoqda</span>
          </div>
        )}
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
                  {userPos ? 'Marshrut ko\'rsatilmoqda' : 'Xaritada joylashuv'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {userPos ? (
                <button
                  onClick={clearRoute}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: '#ef4444' }}
                >
                  <FiX className="w-3.5 h-3.5" /> Marshrutni yopish
                </button>
              ) : (
                <button
                  onClick={startRoute}
                  disabled={routing}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white disabled:opacity-70"
                  style={{ background: '#6366f1' }}
                >
                  {routing
                    ? <><div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Aniqlanmoqda...</>
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
              <MapContent />
            </MapContainer>
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;
