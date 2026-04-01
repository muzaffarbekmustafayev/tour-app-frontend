import React, { useState } from 'react';
import { FiNavigation, FiMaximize, FiMapPin, FiX, FiExternalLink } from 'react-icons/fi';

const MapView = ({ hotel }) => {
  const [fullscreen, setFullscreen] = useState(false);

  const lat = hotel?.location?.lat;
  const lng = hotel?.location?.lng;
  const name = hotel?.name || '';
  const city = hotel?.city || '';
  
  // Construct destination URL for Google Maps
  const googleMapsUrl = lat && lng 
    ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + city)}`;

  // As a fallback for Embed API without key, we use the standard search iframe
  const fallbackEmbedUrl = `https://maps.google.com/maps?q=${lat || name},${lng || city}&t=&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <>
      <div className="relative h-48 md:h-64 rounded-[2.5rem] overflow-hidden border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none bg-gray-100 dark:bg-slate-800 group z-10 w-full hover:shadow-xl transition-all duration-500">
        <iframe
          title="Google Map"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0, filter: 'grayscale(0.1) contrast(1.1)' }}
          src={fallbackEmbedUrl}
          allowFullScreen
        ></iframe>

        <div className="absolute bottom-4 right-4 flex gap-2 z-[400] pointer-events-auto opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => window.open(googleMapsUrl, '_blank')}
            className="bg-emerald-600/90 backdrop-blur-md text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 hover:bg-emerald-700 transition-all active:scale-95 border border-emerald-500"
          >
            <FiNavigation className="w-4 h-4" /> 
            Marshrut
          </button>
          <button
            onClick={() => setFullscreen(true)}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md text-gray-900 dark:text-white px-4 py-2.5 rounded-2xl text-xs font-bold shadow-xl flex items-center gap-2 border border-white dark:border-gray-700 hover:bg-white transition-all active:scale-95"
          >
            <FiMaximize className="w-4 h-4" /> To'liq
          </button>
        </div>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[9999] bg-white dark:bg-slate-900 flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 shadow-sm z-[5000] bg-white dark:bg-slate-900">
            <div>
               <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <FiMapPin className="text-emerald-500 w-4 h-4" /> 
                 </div>
                 {name}
               </h3>
               <p className="text-[13px] font-medium text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2">
                 Google Maps orqali yo'nalish olish <FiExternalLink className="w-3 h-3" />
               </p>
            </div>
            <button
              onClick={() => setFullscreen(false)}
              className="bg-gray-100 dark:bg-slate-800 p-3 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all flex items-center justify-center shrink-0 active:scale-90"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 w-full relative">
            <iframe
              title="Google Map Fullscreen"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={fallbackEmbedUrl}
              allowFullScreen
            ></iframe>

            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[5000] w-full max-w-xs px-6">
                 <button
                    onClick={() => window.open(googleMapsUrl, '_blank')}
                    className="w-full bg-blue-600 text-white px-8 py-5 rounded-[2rem] font-black shadow-2xl shadow-blue-500/40 flex items-center justify-center gap-3 hover:bg-blue-700 hover:-translate-y-1 transition-all active:scale-95"
                  >
                    <FiNavigation className="w-6 h-6" /> 
                    Yo'l boshlash (Google Maps)
                 </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapView;
