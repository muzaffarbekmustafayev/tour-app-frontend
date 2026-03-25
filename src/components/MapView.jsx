import React, { useState, useEffect } from 'react';
import { FiNavigation, FiMaximize, FiMapPin, FiX } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons
const hotelIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to dynamically adjust map bounds
const MapBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const MapView = ({ hotel }) => {
  const [fullscreen, setFullscreen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [mapBounds, setMapBounds] = useState(null);

  const lat = hotel?.location?.lat;
  const lng = hotel?.location?.lng;
  const name = hotel?.name || '';

  const buildNativeRoute = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: uLat, longitude: uLng } = pos.coords;
        setUserLocation([uLat, uLng]);

        try {
          // Fetch route from OSRM public API
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${uLng},${uLat};${lng},${lat}?overview=full&geometries=geojson`
          );
          const data = await response.json();

          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            // OSRM returns GeoJSON coordinates in [lng, lat] format, convert to [lat, lng] for Leaflet
            const coords = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            setRouteCoords(coords);
            
            // Calculate distance and duration
            const distanceKm = (route.distance / 1000).toFixed(1);
            const durationMin = Math.round(route.duration / 60);
            setRouteInfo({ distance: distanceKm, duration: durationMin });

            // Fit bounds to show entire route
            setMapBounds([
              [uLat, uLng],
              [lat, lng]
            ]);
            
            // Auto open fullscreen for better route rendering if not opened
            setFullscreen(true);
          }
        } catch (err) {
          console.error('Error calculating route:', err);
          alert("Marshrutni hisoblashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert("Joylashuvingizni aniqlab bo'lmadi. Iltimos brauzerda geolocation ruxsatini bering.");
        setLocating(false);
      }
    );
  };

  if (!lat || !lng) {
    const query = encodeURIComponent(`${name} ${hotel?.city || ''} ${hotel?.country || ''}`);
    const href = `https://www.google.com/maps/search/${query}`;

    return (
      <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm bg-gray-50 dark:bg-slate-800/80 flex flex-col items-center justify-center gap-4 p-6 hover:shadow-md transition-shadow">
        <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-lg border border-gray-100 dark:border-gray-600">
          <FiMapPin className="w-8 h-8 text-red-500" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">{name}</h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {hotel?.address && <span className="block">{hotel.address}</span>}
            {hotel?.city}, {hotel?.country}
          </p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 bg-blue-600 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-blue-700 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
        >
          <FiNavigation className="w-4 h-4" /> Boshqa tizimda ko'rish
        </a>
      </div>
    );
  }

  const center = [lat, lng];

  return (
    <>
      <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none bg-gray-100 dark:bg-slate-800 group z-10 w-full">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={center} icon={hotelIcon}>
            <Popup><span className="font-bold">{name}</span></Popup>
          </Marker>
        </MapContainer>

        <div className="absolute bottom-4 right-4 flex gap-2 z-[400] pointer-events-auto opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={buildNativeRoute}
            disabled={locating}
            className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed border border-blue-500"
          >
            {locating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FiNavigation className="w-4 h-4" />} 
            Marshrut
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-gray-900 dark:text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 border border-white dark:border-gray-700 hover:bg-white transition-all active:scale-95"
          >
            <FiMaximize className="w-4 h-4" /> Xarita
          </button>
        </div>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm z-[5000] bg-white dark:bg-slate-900">
            <div>
               <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <FiMapPin className="text-red-500 w-4 h-4" /> 
                 </div>
                 {name}
               </h3>
               {routeInfo && (
                 <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                   <FiNavigation className="text-blue-500" /> Masofa: <span className="text-blue-600 dark:text-blue-400 font-bold">{routeInfo.distance} km</span> <span className="mx-1">•</span> Taxminiy vaqt: <span className="text-orange-600 dark:text-orange-400 font-bold">{routeInfo.duration} daq</span>
                 </p>
               )}
            </div>
            <button
              onClick={() => { setFullscreen(false); }}
              className="bg-gray-100 dark:bg-slate-800 p-3 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center shrink-0 active:scale-90"
              title="Yopish"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 w-full relative z-[4000]">
            <MapContainer 
               center={userLocation || center} 
               zoom={14} 
               style={{ height: '100%', width: '100%' }}
               zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              <Marker position={center} icon={hotelIcon}>
                <Popup className="font-bold">{name}</Popup>
              </Marker>

              {userLocation && (
                <Marker position={userLocation} icon={userIcon}>
                  <Popup><span className="font-bold text-blue-600">Sizning joylashuvingiz</span></Popup>
                </Marker>
              )}

              {routeCoords.length > 0 && (
                <Polyline 
                  positions={routeCoords} 
                  color="#2563eb" 
                  weight={5} 
                  opacity={0.8} 
                  lineCap="round" 
                  lineJoin="round"
                />
              )}

              {mapBounds && <MapBounds bounds={mapBounds} />}
            </MapContainer>
            
            {!routeCoords.length && (
               <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[5000]">
                 <button
                    onClick={buildNativeRoute}
                    disabled={locating}
                    className="bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black shadow-2xl shadow-blue-500/40 flex items-center gap-3 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95 disabled:opacity-60"
                  >
                    {locating ? <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" /> : <FiNavigation className="w-6 h-6" />} 
                    Marshrutni aniqlash
                 </button>
               </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;
