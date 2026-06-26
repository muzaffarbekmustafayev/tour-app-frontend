import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import AttractionCard from '../components/AttractionCard';
import AIRecommendations from '../components/AIRecommendations';
import AccessibilityBanner from '../components/AccessibilityBanner';
import api from '../services/api';
import { fetchAttractions } from '../services/attractions';
import { imgSrc } from '../utils/media';
import { LuLandmark } from 'react-icons/lu';
import heroBg from '../assets/image.png';
import {
  FiSearch, FiMapPin, FiMap, FiStar,
  FiTrendingUp, FiFrown, FiAlertTriangle, FiArrowUp,
  FiArrowRight, FiHome, FiSun, FiAward,
  FiDollarSign, FiBriefcase, FiChevronRight
} from 'react-icons/fi';
import {
  MdAccessible, MdHearing, MdVisibility,
  MdFamilyRestroom, MdElderly, MdSignLanguage,
} from 'react-icons/md';
import { TbWheelchair, TbBraille } from 'react-icons/tb';

/* ── Category chips ── */
const CATEGORIES = [
  { name: 'Hashamatli', icon: <FiAward className="w-5 h-5" />, query: 'luxury', color: '#f59e0b' },
  { name: 'Resort', icon: <FiSun className="w-5 h-5" />, query: 'resort', color: '#10b981' },
  { name: 'Arzon', icon: <FiDollarSign className="w-5 h-5" />, query: 'budget', color: '#6366f1' },
  { name: 'Oilaviy', icon: <MdFamilyRestroom className="w-5 h-5" />, query: 'family', color: '#ec4899' },
  { name: 'Butik', icon: <FiHome className="w-5 h-5" />, query: 'boutique', color: '#8b5cf6' },
  { name: 'Biznes', icon: <FiBriefcase className="w-5 h-5" />, query: 'business', color: '#0ea5e9' },
  { name: 'Aravacha', icon: <TbWheelchair className="w-5 h-5" />, query: 'wheelchair', color: '#7c3aed', accessKey: 'wheelchair' },
  { name: 'Eshitish', icon: <MdHearing className="w-5 h-5" />, query: 'audioGuides', color: '#06b6d4', accessKey: 'audioGuides' },
  { name: "Ko'rish", icon: <MdVisibility className="w-5 h-5" />, query: 'tactilePaving', color: '#059669', accessKey: 'tactilePaving' },
  { name: 'Keksalar', icon: <MdElderly className="w-5 h-5" />, query: 'family', color: '#d97706' },
];

/* ── Skeleton ── */
const Skeleton = () => (
  <div className="glass-panel overflow-hidden animate-pulse" style={{ borderRadius: '2rem' }}>
    <div className="h-52 shimmer" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-4 shimmer rounded-full w-3/4" />
      <div className="h-3 shimmer rounded-full w-1/2" />
      <div className="h-8 shimmer rounded-2xl w-full mt-2" />
    </div>
  </div>
);

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const fetchHotels = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.get('/hotels');
      setHotels(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch {
      setError('Mehmonxonalarni yuklashda xatolik yuz berdi.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  useEffect(() => {
    fetchAttractions({ limit: 6 })
      .then((res) => setAttractions(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => setAttractions([]));
  }, []);

  return (
    <div className="pb-24 md:pb-8 lg:pb-12 overflow-x-hidden">

      {/* ══════════════════════════════════════════
          HERO — Navoiy vibe
      ══════════════════════════════════════════ */}
      <header className="relative w-full overflow-hidden" style={{ minHeight: 'clamp(420px, 85svh, 720px)' }}>

        {/* Background */}
        <img
          src={heroBg}
          alt="Navoiy viloyati"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 35%' }}
          loading="eager"
        />

        {/* Deep gradient — Navoiy night sky tones */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(160deg, rgba(10,8,45,0.72) 0%, rgba(30,20,80,0.45) 40%, rgba(8,6,35,0.92) 100%)'
        }} />

        {/* Decorative orbs */}
        <div className="absolute top-10 right-10 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25), transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-32 left-0 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15), transparent 70%)', filter: 'blur(50px)' }} />

        {/* Top border removed for classic clean look */}

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-5 sm:px-8 text-center pb-16 sm:pb-20">

          {/* Location pill */}
          <div className="flex items-center gap-2 mb-4 sm:mb-5 px-4 py-2 rounded-full animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.2)',
              animationDelay: '0.1s'
            }}>
            <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">Navoiy · O'zbekiston</span>
          </div>

          {/* Main heading */}
          <h1
            className="text-white font-black leading-[1.08] mb-3 sm:mb-5 animate-fade-in"
            style={{
              fontSize: 'clamp(2rem, 9vw, 5rem)',
              textShadow: '0 8px 40px rgba(0,0,0,0.6)',
              animationDelay: '0.2s',
              letterSpacing: '-0.02em',
            }}
          >
            Navoiy viloyatidagi
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 40%, #a78bfa 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Ko'ngil ochar maskanlar
            </span>
          </h1>

          {/* Subtitle — mobilda ham ko'rinadi */}
          <p className="text-white/75 font-medium mb-6 sm:mb-8 max-w-xs sm:max-w-lg animate-fade-in"
            style={{ fontSize: 'clamp(0.8rem, 3.5vw, 1.1rem)', lineHeight: 1.6, animationDelay: '0.3s' }}>
            Eng sara mehmonxonalar, resortlar va dam olish maskanlarini kashf eting.
          </p>

          {/* Search shortcut button */}
          <button
            onClick={() => navigate('/search')}
            className="w-full max-w-sm animate-fade-in flex items-center gap-3 px-4 sm:px-5 py-3.5 sm:py-4 rounded-[2rem] font-bold text-sm transition-all hover:bg-white/5 active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(20px)',
              border: '1.5px solid rgba(255,255,255,0.35)',
              color: 'rgba(255,255,255,0.95)',
              animationDelay: '0.4s',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(255,255,255,0.25)' }}>
              <FiSearch className="w-4 h-4" />
            </div>
            <span className="flex-1 text-left opacity-80">Mehmonxona qidirish...</span>
            <FiArrowRight className="w-4 h-4 opacity-60" />
          </button>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{ background: 'linear-gradient(to top, var(--bg-main), transparent)' }} />
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main className="px-4 max-w-7xl mx-auto">

        {/* ── Hududlar (tumanlar) — bosilganda shu tuman joylari chiqadi ── */}
        {!loading && hotels.length > 0 && (() => {
          const districts = [...new Set(hotels.map(h => h.city).filter(Boolean))];
          const colors = ['#6366f1', '#f43f5e', '#f59e0b'];
          return (
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 -mt-8 sm:-mt-6 mb-8 sm:mb-12 relative z-10 px-1">
              {districts.map((district, i) => {
                const count = hotels.filter(h => h.city === district).length;
                const color = colors[i % colors.length];
                return (
                  <button
                    key={district}
                    onClick={() => navigate(`/search?city=${encodeURIComponent(district)}`)}
                    className="glass-panel press-effect flex flex-col items-center gap-1 sm:gap-1.5 py-4 sm:py-5 px-1 sm:px-2 text-center transition-all hover:shadow-md active:scale-[0.97]"
                    style={{
                      borderRadius: '1.25rem',
                      borderTop: `3px solid ${color}`,
                      boxShadow: `0 4px 20px -6px ${color}30`,
                    }}
                    aria-label={`${district} tumanidagi joylar`}
                  >
                    <FiMapPin className="w-4 h-4 sm:w-5 sm:h-5" style={{ color }} />
                    <p className="text-sm sm:text-lg font-black leading-tight" style={{ color }}>{district}</p>
                    <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{count} ta maskan</p>
                  </button>
                );
              })}
            </div>
          );
        })()}

        {/* ── Navoiy highlights banner ── */}


        {/* ── Categories ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black" style={{ color: 'var(--text-main)' }}>Kategoriyalar</h2>
            <button onClick={() => navigate('/search')}
              className="flex items-center gap-1 text-sm font-bold transition-all hover:gap-2"
              style={{ color: '#6366f1' }}>
              Barchasi <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="snap-x-scroll -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => {
                  if (cat.accessKey) {
                    navigate(`/search?accessibility=${cat.accessKey}`);
                  } else {
                    navigate(`/search?q=${cat.query}`);
                  }
                }}
                className="press-effect flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm transition-colors"
                style={{
                  background: `${cat.color}12`,
                  border: `1.5px solid ${cat.color}25`,
                  color: cat.color,
                  minHeight: 'unset',
                  minWidth: 'unset',
                }}
                aria-label={`${cat.name} mehmonxonalarini qidirish`}
              >
                {cat.icon}
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Map quick link ── */}
        <button
          onClick={() => navigate('/map')}
          className="w-full mb-10 sm:mb-12 flex items-center gap-4 p-4 sm:p-5 rounded-[1.5rem] transition-all active:scale-[0.98] hover:shadow-md text-left press-effect"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(139,92,246,0.07) 100%)',
            border: '1.5px solid rgba(99,102,241,0.22)',
            boxShadow: '0 4px 24px -8px rgba(99,102,241,0.22)',
          }}
        >
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 6px 16px -4px rgba(99,102,241,0.5)' }}>
            <FiMap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-sm sm:text-base mb-0.5" style={{ color: 'var(--text-main)' }}>
              Mehmonxonalar xaritasi
            </p>
            <p className="text-xs font-medium line-clamp-1" style={{ color: 'var(--text-muted)' }}>
              Barcha dam olish maskanlarini xaritada ko'ring
            </p>
          </div>
          <FiArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-indigo-400" />
        </button>

        {/* ── Diqqatga sazovor (tarixiy) joylar ── */}
        {attractions.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <LuLandmark className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
                <h2 className="text-xl font-black" style={{ color: 'var(--text-main)' }}>Diqqatga sazovor joylar</h2>
              </div>
              <button onClick={() => navigate('/attractions')}
                className="flex items-center gap-1 text-sm font-bold transition-all hover:gap-2" style={{ color: '#d97706' }}>
                Barchasi <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs font-medium mb-5" style={{ color: 'var(--text-muted)' }}>
              360° video bilan kashf eting — har joyga yaqin tunash maskanlari tavsiya qilinadi
            </p>
            <div className="hotel-grid">
              {attractions.slice(0, 3).map((a) => <AttractionCard key={a._id} attraction={a} />)}
            </div>
          </div>
        )}

        {/* ── Accessibility Banner ── */}
        <AccessibilityBanner />

        {/* ── AI Recommendations ── */}
        <div className="mb-12">
          <AIRecommendations />
        </div>

        {/* ── Tarixiy joylar bo'yicha dam olish maskanlari ── */}
        {!loading && hotels.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-1">
              <LuLandmark className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
              <h2 className="text-xl font-black" style={{ color: 'var(--text-main)' }}>Tarixiy joylar va yaqin maskanlar</h2>
            </div>
            <p className="text-xs font-medium mb-5" style={{ color: 'var(--text-muted)' }}>
              Har bir tarixiy yoki sayohatbop joyga eng yaqin dam olish maskanlari
            </p>

            <div className="space-y-6">
              {[...new Set(hotels.map(h => h.city).filter(Boolean))].map(district => {
                const group = hotels.filter(h => h.city === district);
                const places = [...new Set(group.flatMap(h => h.nearbyPlaces || []))];
                return (
                  <div key={district} className="glass-panel p-4 sm:p-5" style={{ borderRadius: '1.5rem' }}>
                    {/* District + historical places */}
                    <div className="flex items-center gap-2 mb-2">
                      <FiMapPin className="w-4 h-4 text-rose-500" />
                      <h3 className="text-base font-black" style={{ color: 'var(--text-main)' }}>{district} tumani</h3>
                    </div>
                    {places.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {places.map((p, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg"
                            style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid rgba(245,158,11,0.25)' }}>
                            <LuLandmark className="w-3 h-3" /> {p}
                          </span>
                        ))}
                      </div>
                    )}
                    {/* Nearby resting places */}
                    <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                      Yaqin dam olish maskanlari
                    </p>
                    <div className="snap-x-scroll -mx-1 px-1 pb-1 flex gap-3">
                      {group.map(h => (
                        <button key={h._id} onClick={() => navigate(`/hotel/${h._id}`)}
                          className="press-effect shrink-0 w-44 text-left rounded-2xl overflow-hidden border transition-all hover:shadow-md active:scale-[0.98]"
                          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                          {h.images?.[0] && (
                            <img src={imgSrc(h.images[0])} alt={h.name} className="w-full h-24 object-cover" loading="lazy" />
                          )}
                          <div className="p-2.5">
                            <p className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text-main)' }}>{h.name}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-[11px] font-medium capitalize" style={{ color: 'var(--text-muted)' }}>{h.category}</span>
                              <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                                <FiStar className="w-3 h-3 fill-current" />{h.rating?.toFixed?.(1) ?? h.rating}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Hotels grid ── */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <FiTrendingUp className="text-rose-500" />
              Mashhur mehmonxonalar
            </h2>
            {!loading && hotels.length > 0 && (
              <button onClick={() => navigate('/search')}
                className="flex items-center gap-1 text-sm font-bold"
                style={{ color: '#6366f1' }}>
                Hammasi <FiChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm font-semibold text-red-500">{error}</p>
            </div>
          )}

          {loading ? (
            <div className="hotel-grid">
              {[1, 2, 3, 4].map(i => <Skeleton key={i} />)}
            </div>
          ) : hotels.length > 0 ? (
            <div className="hotel-grid">
              {hotels.map(hotel => <HotelCard key={hotel._id} hotel={hotel} />)}
            </div>
          ) : !error ? (
            <div className="text-center py-20 glass-panel" style={{ borderRadius: '2rem' }}>
              <FiFrown className="mx-auto w-14 h-14 mb-4 text-gray-300" />
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-main)' }}>Mehmonxonalar topilmadi</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Ma'lumot qo'shish uchun <code className="px-2 py-0.5 rounded-lg text-xs font-mono"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>npm run seed</code> ni ishga tushiring.
              </p>
            </div>
          ) : null}
        </div>
      </main>

      {/* ── Scroll to top ── */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 sm:bottom-8 right-4 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:-translate-y-1 active:scale-[0.92] press-effect"
          style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}
          aria-label="Yuqoriga"
        >
          <FiArrowUp className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default Home;
