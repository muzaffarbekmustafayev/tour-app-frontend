import React, { useState } from 'react';
import { FiNavigation, FiX, FiLoader, FiMapPin, FiClock, FiExternalLink, FiAlertTriangle, FiChevronDown, FiCornerUpLeft, FiCornerUpRight, FiArrowUp, FiFlag } from 'react-icons/fi';
import { MdDirectionsCar } from 'react-icons/md';
import { fmtDist, fmtTime } from './mapUtils';

// Manevr turiga mos ikonka
const stepIcon = (step) => {
  const mod = step.modifier || '';
  if (step.type === 'arrive') return <FiFlag className="w-4 h-4 text-green-600" />;
  if (step.type === 'depart') return <FiMapPin className="w-4 h-4 text-blue-600" />;
  if (mod.includes('left')) return <FiCornerUpLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
  if (mod.includes('right')) return <FiCornerUpRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
  return <FiArrowUp className="w-4 h-4 text-slate-600 dark:text-slate-300" />;
};

const MapRouteOverlay = ({
  activeHotel,
  loading,
  clearGuidance,
  switchProfile,
  profile,
  isRouting,
  geoLoading,
  routeInfo,
  routeSteps = [],
  routeError,
  geoMsg,
}) => {
  const [showSteps, setShowSteps] = useState(false);
  if (!activeHotel || loading) return null;

  const googleUrl = (hotel, prof) =>
    `https://www.google.com/maps/dir/?api=1&destination=${hotel.location.lat},${hotel.location.lng}&travelmode=${prof === 'walking' ? 'walking' : 'driving'}`;

  return (
    <div className="absolute bottom-3 md:bottom-auto md:top-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[550] w-[94%] md:w-[360px] max-w-[400px] pointer-events-none animate-slide-up">
      <div
        className="pointer-events-auto flex flex-col overflow-hidden rounded-2xl shadow-xl shadow-slate-200/40 dark:shadow-black/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60"
      >
        {/* Header Region */}
        <div className="relative flex items-center justify-between px-4 py-3 md:px-5 md:py-4 border-b border-slate-100 dark:border-slate-800">
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
            aria-label="Yo'nalishni yopish"
            className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors shrink-0 text-slate-500"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content Region */}
        <div className="p-3 md:p-4 flex flex-col gap-3 md:gap-4">

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

          {/* Turn-by-turn yo'riqnoma (Google Maps uslubida) */}
          {!isRouting && !routeError && routeSteps.length > 0 && (
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
              {/* Keyingi manevr — yirik ko'rsatilgan */}
              <div className="flex items-center gap-3 px-3.5 py-3 bg-blue-50 dark:bg-blue-900/20">
                <div className="w-9 h-9 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-sm">
                  {stepIcon(routeSteps[0])}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{routeSteps[0].text}</p>
                  {routeSteps[0].distance > 0 && (
                    <p className="text-[11px] font-semibold text-slate-500">{fmtDist(routeSteps[0].distance)}</p>
                  )}
                </div>
              </div>

              {/* Barcha qadamlar — yig'iladigan */}
              <button
                onClick={() => setShowSteps(s => !s)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <span>Barcha bosqichlar ({routeSteps.length})</span>
                <FiChevronDown className={`w-4 h-4 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
              </button>

              {showSteps && (
                <ol className="max-h-[32dvh] md:max-h-52 overflow-y-auto overscroll-contain divide-y divide-slate-100 dark:divide-slate-800">
                  {routeSteps.map((s, i) => (
                    <li key={i} className="flex items-start gap-3 px-3.5 py-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                        {stepIcon(s)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 leading-snug">{s.text}</p>
                        {s.distance > 0 && <p className="text-[11px] text-slate-400">{fmtDist(s.distance)}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapRouteOverlay;
