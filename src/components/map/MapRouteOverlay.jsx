import React from 'react';
import { FiNavigation, FiX, FiLoader, FiMapPin, FiClock, FiExternalLink, FiAlertTriangle } from 'react-icons/fi';
import { MdDirectionsCar, MdDirectionsWalk } from 'react-icons/md';
import { fmtDist, fmtTime } from './mapUtils';

const MapRouteOverlay = ({
  activeHotel,
  loading,
  clearGuidance,
  switchProfile,
  profile,
  isRouting,
  geoLoading,
  routeInfo,
  routeError,
  geoMsg,
}) => {
  if (!activeHotel || loading) return null;

  const googleUrl = (hotel, prof) =>
    `https://www.google.com/maps/dir/?api=1&destination=${hotel.location.lat},${hotel.location.lng}&travelmode=${prof === 'walking' ? 'walking' : 'driving'}`;

  return (
    <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[550] w-[92%] md:w-[360px] max-w-[400px] pointer-events-none animate-slide-up">
      <div
        className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60"
      >
        {/* Header Region */}
        <div className="relative flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <FiNavigation className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Yo'nalish
              </span>
              <span className="text-[16px] font-bold truncate text-slate-900 dark:text-white">
                {activeHotel.name}
              </span>
            </div>
          </div>
          <button
            onClick={clearGuidance}
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0 text-slate-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Region */}
        <div className="p-4 flex flex-col gap-4">

          {/* Mode Toggle */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            {[
              { key: 'driving', icon: MdDirectionsCar, label: 'Avtomobilda' },

            ].map(p => {
              const Icon = p.icon;
              const isActive = profile === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => switchProfile(p.key)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-semibold transition-colors ${isActive
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                  <Icon className="w-[18px] h-[18px]" />
                  {p.label}
                </button>
              );
            })}
          </div>

          {/* Status & Stats */}
          {isRouting ? (
            <div className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-blue-600 dark:text-blue-400">
              <FiLoader className="w-5 h-5 animate-spin" />
              <span>{geoLoading ? 'Joylashuv...' : 'Hisoblanmoqda...'}</span>
            </div>
          ) : routeError || geoMsg ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-800/30">
              <FiAlertTriangle className="w-5 h-5 shrink-0" />
              <span>{routeError || geoMsg}</span>
            </div>
          ) : routeInfo ? (
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 mb-0.5 flex items-center gap-1">
                    <FiMapPin /> Masofa
                  </span>
                  <span className="text-[17px] font-bold text-slate-800 dark:text-slate-100">{fmtDist(routeInfo.distance)}</span>
                </div>
                <div className="w-px bg-slate-200 dark:bg-slate-700" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold uppercase text-slate-500 mb-0.5 flex items-center gap-1">
                    <FiClock /> Vaqt
                  </span>
                  <span className="text-[17px] font-bold text-green-600 dark:text-green-400">{fmtTime(routeInfo.duration)}</span>
                </div>
              </div>

              <a
                href={googleUrl(activeHotel, profile)}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-blue-600 transition-colors"
                title="Google Maps"
              >
                <FiExternalLink className="w-[18px] h-[18px]" />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MapRouteOverlay;
