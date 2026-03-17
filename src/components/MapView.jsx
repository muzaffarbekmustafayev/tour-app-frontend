import React, { useState } from 'react';

const MapView = ({ hotel }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [routeSrc, setRouteSrc] = useState(null);
  const [locating, setLocating] = useState(false);

  const lat = hotel?.location?.lat;
  const lng = hotel?.location?.lng;
  const name = hotel?.name || '';

  const buildRoute = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: uLat, longitude: uLng } = pos.coords;
        // OSRM route embed via OpenStreetMap directions
        const src = `https://www.openstreetmap.org/directions?engine=osrm_car&route=${uLat},${uLng};${lat},${lng}#map=13/${lat}/${lng}`;
        setRouteSrc(src);
        setFullscreen(true);
        setLocating(false);
      },
      () => {
        // fallback: just open directions page
        window.open(
          `https://www.openstreetmap.org/directions?engine=osrm_car&route=;${lat},${lng}#map=13/${lat}/${lng}`,
          '_blank'
        );
        setLocating(false);
      }
    );
  };

  if (lat && lng) {
    const bbox = `${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}`;
    const bboxBig = `${lng - 0.05},${lat - 0.05},${lng + 0.05},${lat + 0.05}`;
    const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
    const srcBig = `https://www.openstreetmap.org/export/embed.html?bbox=${bboxBig}&layer=mapnik&marker=${lat},${lng}`;

    return (
      <>
        <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
          <iframe title="map" src={src} className="w-full h-full border-0" loading="lazy" />
          <div className="absolute bottom-3 right-3 flex gap-2">
            <button
              onClick={buildRoute}
              disabled={locating}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1 hover:bg-blue-700 transition active:scale-95 disabled:opacity-60"
            >
              {locating ? '⏳' : '🧭'} Marshrut
            </button>
            <button
              onClick={() => setFullscreen(true)}
              className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition"
            >
              ⛶ Kattalashtirish
            </button>
          </div>
        </div>

        {fullscreen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900">
              <span className="font-semibold text-sm text-gray-800 dark:text-white">📍 {name}</span>
              <button
                onClick={() => { setFullscreen(false); setRouteSrc(null); }}
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl leading-none"
              >
                ✕
              </button>
            </div>
            <iframe
              title="map-full"
              src={routeSrc || srcBig}
              className="flex-1 w-full border-0"
            />
          </div>
        )}
      </>
    );
  }

  const query = encodeURIComponent(`${name} ${hotel?.city || ''} ${hotel?.country || ''}`);
  const href = `https://www.google.com/maps/search/${query}`;

  return (
    <div className="relative h-48 md:h-64 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-100 dark:bg-slate-800 flex flex-col items-center justify-center gap-3">
      <div className="text-4xl">📍</div>
      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-center px-4">
        {hotel?.address && <span className="block">{hotel.address}</span>}
        {hotel?.city}, {hotel?.country}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition active:scale-95"
      >
        Google Maps da ko'rish
      </a>
    </div>
  );
};

export default MapView;
