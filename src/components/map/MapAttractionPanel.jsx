import React from 'react';
import {
  FiX, FiMapPin, FiStar, FiHome, FiNavigation, FiChevronRight,
  FiImage, FiLoader, FiPlayCircle,
} from 'react-icons/fi';
import { LuLandmark } from 'react-icons/lu';
import { resolveMediaUrl } from '../../utils/media';

/**
 * MapAttractionPanel — Xaritada tarixiy joy tanlanganda chiqadigan pastki panel.
 *
 * Joyning qisqa ma'lumoti + unga GEO bo'yicha ENG YAQIN tunash joyi
 * (avtomatik tanlangan) ko'rsatiladi. Foydalanuvchi tunash joyini ochishi yoki
 * o'zidan o'sha maskangacha marshrut chizishi mumkin.
 */
const imgUrl = (src) => resolveMediaUrl(src) || null;

const MapAttractionPanel = ({
  attraction,
  nearby = [],
  loading = false,
  onClose,
  onViewAttraction,
  onViewHotel,
  onRouteHotel,
}) => {
  if (!attraction) return null;

  const nearest = nearby[0] || null;
  const rest = nearby.slice(1);
  const cover = imgUrl(attraction.images?.[0]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[600]"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className="fixed left-0 right-0 bottom-0 md:left-1/2 md:-translate-x-1/2 md:bottom-6 md:w-[420px] z-[650] overflow-hidden flex flex-col bg-white dark:bg-slate-900 md:rounded-2xl md:shadow-xl md:border md:border-slate-200 dark:border-slate-800 animate-slide-up"
        style={{
          borderTopLeftRadius: '1.5rem',
          borderTopRightRadius: '1.5rem',
          maxHeight: '85dvh',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar w-full overscroll-contain" style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}>

          {/* Header image */}
          <div className="relative w-full h-[170px] sm:h-[210px] shrink-0 bg-slate-200 dark:bg-slate-800">
            {cover ? (
              <img src={cover} alt={attraction.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400"><FiImage className="w-8 h-8 opacity-50" /></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors">
              <FiX className="w-5 h-5" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-600 text-white uppercase tracking-wide shadow-sm"
                  style={{
                    backgroundColor: attraction.category === 'kasalxona' ? '#dc2626' :
                      attraction.category === 'iib' ? '#2563eb' :
                      attraction.category === 'ziyoratgoh' ? '#059669' :
                      attraction.category === 'tabiat' ? '#16a34a' :
                      attraction.category === 'supermarket' || attraction.category === 'bozor' ? '#ea580c' :
                      attraction.category === 'mall' ? '#9333ea' : '#d97706'
                  }}>
                  <LuLandmark className="w-3 h-3" /> {attraction.category ? (attraction.category.charAt(0).toUpperCase() + attraction.category.slice(1).replace('_', ' ')) : 'Tarixiy joy'}
                </span>
                {attraction.video360?.url && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-black/40 text-white"><FiPlayCircle className="w-3 h-3" /> Video</span>
                )}
              </div>
              <h2 className="text-[20px] font-bold leading-tight mb-1">{attraction.name}</h2>
              <div className="flex items-center gap-1 text-sm text-slate-200">
                <FiMapPin className="w-3.5 h-3.5" />
                <span className="truncate">{attraction.district}</span>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {attraction.descriptionShort || attraction.description ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                {attraction.descriptionShort || attraction.description}
              </p>
            ) : null}

            {/* Eng yaqin tunash joyi — avtomatik tanlangan */}
            <div>
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-2">
                <FiHome className="w-4 h-4 text-indigo-600" /> Eng yaqin tunash joyi
              </h3>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-6 text-indigo-600 dark:text-indigo-400">
                  <FiLoader className="w-5 h-5 animate-spin" /> <span className="text-sm font-semibold">Qidirilmoqda...</span>
                </div>
              ) : nearest ? (
                <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                      {imgUrl(nearest.images?.[0]) ? (
                        <img src={imgUrl(nearest.images[0])} alt={nearest.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><FiHome className="w-5 h-5" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{nearest.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <FiStar className="w-3 h-3 fill-current" /> {nearest.rating ? nearest.rating.toFixed(1) : '—'}
                        </span>
                        {Number.isFinite(nearest.distanceKm) && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                            <FiNavigation className="w-3 h-3" /> {nearest.distanceKm} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => onViewHotel?.(nearest)} className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                      Tunash joyi <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onRouteHotel?.(nearest)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95">
                      <FiNavigation className="w-3.5 h-3.5" /> Yo'l
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic py-3 text-center">10 km radiusda tunash maskani topilmadi.</p>
              )}
            </div>

            {/* Boshqa yaqin joylar */}
            {rest.length > 0 && (
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Boshqa yaqin joylar</p>
                <div className="space-y-1.5">
                  {rest.map((h) => (
                    <button key={h._id} onClick={() => onViewHotel?.(h)} className="w-full text-left flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <div className="w-9 h-9 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                        {imgUrl(h.images?.[0]) ? (
                          <img src={imgUrl(h.images[0])} alt={h.name} className="w-full h-full object-cover" />
                        ) : (<div className="w-full h-full flex items-center justify-center text-slate-400"><FiHome className="w-4 h-4" /></div>)}
                      </div>
                      <span className="flex-1 min-w-0 text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{h.name}</span>
                      {Number.isFinite(h.distanceKm) && (
                        <span className="text-[11px] font-bold text-slate-400 shrink-0">{h.distanceKm} km</span>
                      )}
                      <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tarixiy joy batafsil */}
            <button onClick={() => onViewAttraction?.(attraction)} className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors active:scale-95">
              Tarixiy joy haqida batafsil <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MapAttractionPanel;
