import React from 'react';
import { FiMapPin, FiX, FiClock, FiNavigation, FiLoader, FiExternalLink, FiChevronRight, FiStar } from 'react-icons/fi';
import { CATEGORY_COLORS, CATEGORY_LABELS, Stars, fmtDist, fmtTime } from './mapUtils';
import { calcAccessibilityScore, getScoreStyle } from '../../utils/accessibilityScore';

const MapHotelPanel = ({
  selected,
  showPanel,
  closePanel,
  activeHotel,
  routeInfo,
  isRouting,
  userPos,
  startGuidance,
  clearGuidance,
  profile,
  navigate,
}) => {
  if (!selected) return null;

  const googleUrl = (hotel, prof) =>
    `https://www.google.com/maps/dir/?api=1&destination=${hotel.location.lat},${hotel.location.lng}&travelmode=${prof === 'walking' ? 'walking' : 'driving'}`;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[600]"
        style={{
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          background: 'rgba(0, 0, 0, 0.4)',
          opacity: showPanel ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: showPanel ? 'auto' : 'none',
        }}
        onClick={closePanel}
      />

      {/* ── Bottom Sheet / Floating Card ── */}
      <div
        className="fixed left-0 right-0 bottom-0 md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:w-[420px] z-[650] overflow-hidden flex flex-col md:rounded-2xl bg-white dark:bg-slate-900 md:shadow-xl md:border md:border-slate-200 dark:border-slate-800"
        style={{
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          borderTop: '1px solid var(--border)',
          maxHeight: '85dvh',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          transform: showPanel ? 'translateY(0)' : 'translateY(120%)',
          transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Scrollable Content Container */}
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar w-full overscroll-contain pb-6 md:pb-0" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>

          {/* ── Float Drag Handle (Mobile Only) ── */}
          <div className="md:hidden absolute top-3 left-1/2 -translate-x-1/2 z-[660] pointer-events-none">
            <div className="w-10 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>

          {/* ── Header Image ── */}
          <div className="relative w-full h-[180px] sm:h-[220px] shrink-0 bg-slate-200 dark:bg-slate-800">
            {selected.images?.length > 0 || selected.image ? (
              <img
                src={(selected.images?.[0] || selected.image).startsWith('http')
                  ? (selected.images?.[0] || selected.image)
                  : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${selected.images?.[0] || selected.image}`}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400">
                <FiImage className="w-8 h-8 opacity-50" />
              </div>
            )}
            {/* Soft gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Close button inside image */}
            <button
              onClick={closePanel}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>

            {/* Image content overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white uppercase tracking-wide mb-1">
                {CATEGORY_LABELS[selected.category] || selected.category}
              </div>
              <h2 className="text-[20px] font-bold leading-tight mb-1 text-shadow-sm">
                {selected.name}
              </h2>
              <div className="flex items-center gap-3 text-sm text-slate-200">
                <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded">
                  <FiStar className="text-yellow-400 fill-yellow-400" />
                  <span className="font-semibold">{selected.rating ? selected.rating.toFixed(1) : '4.5'}</span>
                  <span className="text-slate-300 text-xs">({selected.reviewsCount || 0} ta sharh)</span>
                </div>
                {selected.city && (
                  <div className="flex items-center gap-1">
                    <FiMapPin />
                    <span className="truncate">{selected.city}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Details Area ── */}
          <div className="p-4 flex flex-col gap-4">

            {/* Accessibility Score Badge */}
            {calcAccessibilityScore(selected) > 0 && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs uppercase"
                style={{
                  background: getScoreStyle(calcAccessibilityScore(selected)).bg,
                  color: getScoreStyle(calcAccessibilityScore(selected)).color,
                  border: `1px solid ${getScoreStyle(calcAccessibilityScore(selected)).color}30`
                }}
              >
                ♿ Inklyuzivlik: {calcAccessibilityScore(selected)}%
              </div>
            )}

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
              {selected.description || 'Bu maskan dam olish va sayohat qilish uchun ajoyib tanlov. Barcha qulayliklarga ega zamonaviy xonalar va yuqori darajadagi xizmat kafolatlanadi.'}
            </p>

            {/* Routing Info Block */}
            {activeHotel?._id === selected._id && (routeInfo || isRouting) && (
              <div className="flex p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 mt-2">
                {isRouting ? (
                  <div className="w-full flex justify-center items-center gap-2 py-2 text-indigo-600 dark:text-indigo-400">
                    <FiLoader className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-semibold">Yo'nalish hisoblanmoqda...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 flex flex-col justify-center px-2">
                      <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Masofa</span>
                      <span className="text-[18px] font-bold text-slate-800 dark:text-slate-200">{fmtDist(routeInfo.distance)}</span>
                    </div>
                    <div className="w-px bg-blue-200 dark:bg-blue-800" />
                    <div className="flex-1 flex flex-col justify-center px-4">
                      <span className="text-[11px] font-semibold text-blue-500 uppercase tracking-wide mb-1">Vaqt</span>
                      <span className="text-[18px] font-bold text-slate-800 dark:text-slate-200">{fmtTime(routeInfo.duration)}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-2">
              <button
                onClick={() => navigate(`/hotel/${selected._id}`)}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                Batafsil <FiChevronRight />
              </button>
              
              {activeHotel?._id === selected._id ? (
                <button
                  onClick={clearGuidance}
                  className="flex-1 py-3 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <FiX /> Yo'lni yopish
                </button>
              ) : (
                <button
                  onClick={() => startGuidance(selected)}
                  className="btn-primary flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <FiNavigation /> Marshrut
                </button>
              )}
            </div>

            {activeHotel?._id === selected._id && !isRouting && routeInfo && (
              <a
                href={googleUrl(selected, profile)}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold flex items-center justify-center gap-2 transition-colors mt-1"
              >
                <FiExternalLink className="text-emerald-500" /> Google Maps
              </a>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MapHotelPanel;
