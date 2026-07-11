import React from 'react';
import { FiX, FiLoader, FiAlertTriangle, FiNavigation } from 'react-icons/fi';
import { fmtDist, fmtTime } from './mapUtils';

const MapRouteOverlay = ({
  activeHotel,
  loading,
  clearGuidance,
  isRouting,
  routeInfo,
  routeError,
  geoMsg,
}) => {
  if (!activeHotel || loading) return null;

  return (
    <div className="absolute top-4 left-4 z-[550] animate-fade-in pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 px-2 py-1.5 rounded-2xl shadow-lg shadow-black/10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/40 dark:border-white/10 ring-1 ring-black/5">
        
        {isRouting ? (
           <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 pl-2 pr-1">
             <FiLoader className="w-4 h-4 animate-spin" />
             <span>Hisoblanmoqda...</span>
           </div>
        ) : routeError || geoMsg ? (
           <div className="flex items-center gap-2 text-[11px] font-bold text-red-500 pl-2 pr-1">
             <FiAlertTriangle className="w-4 h-4 shrink-0" />
             <span className="max-w-[120px] truncate">{routeError || geoMsg}</span>
           </div>
        ) : routeInfo ? (
           <div className="flex items-center gap-2.5 pl-2">
             <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
               <FiNavigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 animate-pulse" />
             </div>
             <div className="flex flex-col leading-none">
               <span className="text-[13px] font-black text-slate-800 dark:text-slate-100 mb-0.5">{fmtTime(routeInfo.duration)}</span>
               <span className="text-[10px] font-bold text-slate-500">{fmtDist(routeInfo.distance)}</span>
             </div>
           </div>
        ) : null}

        <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />
        
        <button
          onClick={clearGuidance}
          className="w-7 h-7 rounded-full hover:bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-colors text-slate-500 hover:text-red-500 shrink-0"
        >
          <FiX className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

export default MapRouteOverlay;
