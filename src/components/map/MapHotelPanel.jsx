import React from 'react';
import { FiMapPin, FiX, FiClock, FiNavigation, FiLoader, FiExternalLink, FiChevronRight, FiStar } from 'react-icons/fi';
import { CATEGORY_COLORS, CATEGORY_LABELS, Stars, fmtPrice, fmtDist, fmtTime, getMinPrice } from './mapUtils';

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

  const price = getMinPrice(selected);

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className="fixed inset-0 z-[600]"
        style={{
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          opacity: showPanel ? 1 : 0,
          transition: 'opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          pointerEvents: showPanel ? 'auto' : 'none',
        }}
        onClick={closePanel}
      />

      {/* ── Bottom Sheet ── */}
      <div
        className="fixed left-0 right-0 bottom-0 z-[650] overflow-hidden flex flex-col"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderTopLeftRadius: '2rem',
          borderTopRightRadius: '2rem',
          borderTop: '1px solid var(--border)',
          maxHeight: '85dvh', /* mobile-safe viewport height */
          boxShadow: '0 -20px 60px -15px rgba(0,0,0,0.3)',
          transform: showPanel ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* Scrollable Content Container */}
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar w-full overscroll-contain" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>

          {/* ── Float Drag Handle ── */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[660] pointer-events-none">
            <div className="w-12 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.8)', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>

          {/* ── Header Image Layer ── */}
          <div className="relative w-full shrink-0" style={{ height: 'clamp(180px, 35vh, 260px)' }}>
            {selected.images?.[0] || selected.image ? (
              <img
                src={(selected.images?.[0] || selected.image).startsWith('http')
                  ? (selected.images?.[0] || selected.image)
                  : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${selected.images?.[0] || selected.image}`}
                alt={selected.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                <FiMapPin style={{ width: 48, height: 48, color: 'rgba(0,0,0,0.1)' }} />
              </div>
            )}
            
            {/* Gradient Overlays for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/20 to-[#0f172a]/40" />

            {/* Float Close Button */}
            <button
              onClick={closePanel}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                color: 'white',
              }}
            >
              <FiX style={{ width: 16, height: 16 }} />
            </button>

            {/* Overlaid Title & Category */}
            <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5">
              <span
                className="self-start px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-lg"
                style={{ background: CATEGORY_COLORS[selected.category] || '#6366f1' }}
              >
                {CATEGORY_LABELS[selected.category] || selected.category}
              </span>
              <h2 className="text-2xl font-black text-white leading-tight drop-shadow-md line-clamp-2">
                {selected.name}
              </h2>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <FiStar className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-white text-sm font-bold">{selected.rating ? selected.rating.toFixed(1) : 'Baho yo\'q'}</span>
                </span>
                {selected.reviewsCount > 0 && (
                  <span className="text-white/80 text-xs font-medium">({selected.reviewsCount} sharh)</span>
                )}
                {selected.city && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/50" />
                    <span className="text-white/90 text-sm font-semibold">{selected.city}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Details Area ── */}
          <div className="p-5 flex flex-col gap-4">
            
            {/* Price Row (If available) */}
            {price && (
              <div className="flex items-center justify-between p-4 rounded-2xl" style={{ background: 'var(--bg-main)', border: '1px solid var(--border)' }}>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Boshlang'ich narx</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{fmtPrice(price)}</span>
                    <span className="text-xs font-bold text-gray-500">UZS</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                  <FiMapPin className="w-5 h-5" />
                </div>
              </div>
            )}

            {/* Description Area */}
            {(selected.descriptionShort || selected.description) && (
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {selected.descriptionShort || selected.description}
              </p>
            )}

            {/* Active Route Context Box */}
            {activeHotel?._id === selected._id && routeInfo && !isRouting && (
              <div className="flex bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 gap-4 box-border border-l-4 border-indigo-500">
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-0.5">Masofa</span>
                  <span className="text-lg font-black text-indigo-700 dark:text-indigo-300">{fmtDist(routeInfo.distance)}</span>
                </div>
                <div className="w-px bg-indigo-200 dark:bg-indigo-800" />
                <div className="flex-1 flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-0.5">Ketish vaqti</span>
                  <span className="text-lg font-black text-teal-700 dark:text-teal-300">{fmtTime(routeInfo.duration)}</span>
                </div>
              </div>
            )}

            {/* Buttons Rack */}
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() => navigate(`/hotel/${selected._id}`)}
                className="flex items-center justify-center gap-2 py-3.5 rounded-[1rem] font-bold text-sm transition-all active:scale-[0.98]"
                style={{
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-main)',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                Batafsil <FiChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <button
                onClick={() => {
                  if (activeHotel?._id === selected._id && userPos) clearGuidance();
                  else startGuidance(selected);
                }}
                disabled={isRouting}
                className="relative flex items-center justify-center gap-2 py-3.5 rounded-[1rem] font-black text-sm text-white overflow-hidden transition-all active:scale-[0.98] disabled:opacity-75 disabled:scale-100 shadow-lg"
                style={{
                  background: activeHotel?._id === selected._id && userPos 
                    ? '#ef4444' // Red if closing route
                    : 'var(--gradient-main)', // Primary if navigating
                }}
              >
                {/* Shine effect overlay */}
                <div className="absolute inset-0 bg-white/20" style={{ clipPath: 'polygon(0 0, 30% 0, 50% 100%, 20% 100%)', opacity: 0.1 }} />
                
                {isRouting ? (
                  <><FiLoader className="w-4 h-4 animate-spin" /> Hisob...</>
                ) : activeHotel?._id === selected._id && userPos ? (
                  <><FiX className="w-4 h-4" /> Yopish</>
                ) : (
                  <><FiNavigation className="w-4 h-4" /> Yo'l</>
                )}
              </button>
            </div>

            {/* Open in external Maps (If route active) */}
            {activeHotel?._id === selected._id && userPos && (
              <a
                href={googleUrl(selected, profile)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 rounded-[1rem] font-bold text-sm transition-all active:scale-[0.98] mt-1"
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  color: '#0f172a',
                  textDecoration: 'none',
                }}
              >
                <FiExternalLink className="w-4 h-4 text-emerald-600" /> Google Maps orqali yurish
              </a>
            )}
            
          </div>
        </div>
      </div>
    </>
  );
};

export default MapHotelPanel;
