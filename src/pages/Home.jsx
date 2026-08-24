import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import AttractionCard from '../components/AttractionCard';
import AIRecommendations from '../components/AIRecommendations';
import AccessibilityBanner from '../components/AccessibilityBanner';
import api from '../services/api';
import { fetchAttractions } from '../services/attractions';
import { imgSrc } from '../utils/media';
import heroBg from '../assets/hero.png';
import {
  FiSearch, FiMapPin, FiMap, FiStar,
  FiTrendingUp, FiFrown, FiAlertTriangle, FiArrowUp,
  FiArrowRight, FiChevronRight, FiPlayCircle, FiShield, FiCompass
} from 'react-icons/fi';
import { LuLandmark, LuHospital, LuStore, LuBuilding2 } from 'react-icons/lu';
import { FaMosque, FaMountain, FaShoppingBag } from 'react-icons/fa';

/* ── Skeleton ── */
const Skeleton = () => (
  <div className="glass-panel overflow-hidden animate-pulse rounded-2xl">
    <div className="h-48 shimmer" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 shimmer rounded-full w-3/4" />
      <div className="h-3 shimmer rounded-full w-1/2" />
      <div className="h-9 shimmer rounded-xl w-full mt-2" />
    </div>
  </div>
);

const DISTRICT_INFO = [
  { name: 'Navoiy shahri', desc: 'Zamonaviy shahar, parklar, savdo majmualari', color: '#6366f1', gradient: 'from-indigo-500/20 to-indigo-600/10' },
  { name: 'Nurota', desc: 'Chashma, Nur qal\'asi, ziyorat va tabiat', color: '#f59e0b', gradient: 'from-amber-500/20 to-amber-600/10' },
  { name: 'Xatirchi', desc: 'Qadimiy obidalar, ziyoratgohlar va bog\'lar', color: '#10b981', gradient: 'from-emerald-500/20 to-emerald-600/10' },
  { name: 'Qiziltepa', desc: 'Raboti Malik, Sardoba va tarixiy meros', color: '#8b5cf6', gradient: 'from-violet-500/20 to-violet-600/10' },
];

const CATEGORY_QUICK_EXPLORER = [
  { key: 'tarixiy', label: 'Tarixiy Obidalar', icon: LuLandmark, color: '#f59e0b', to: '/attractions?category=tarixiy' },
  { key: 'ziyoratgoh', label: 'Ziyoratgohlar', icon: FaMosque, color: '#10b981', to: '/attractions?category=ziyoratgoh' },
  { key: 'tabiat', label: 'Tabiat & Tog\'lar', icon: FaMountain, color: '#059669', to: '/attractions?category=tabiat' },
  { key: 'hotels', label: 'Mehmonxonalar', icon: LuBuilding2, color: '#6366f1', to: '/search' },
  { key: 'kasalxona', label: 'Kasalxona (24/7)', icon: LuHospital, color: '#ef4444', to: '/attractions?category=kasalxona' },
  { key: 'iib', label: 'IIB / Xavfsizlik', icon: FiShield, color: '#3b82f6', to: '/attractions?category=iib' },
  { key: 'savdo', label: 'Bozor & Supermarket', icon: FaShoppingBag, color: '#ec4899', to: '/attractions?category=savdo' },
];

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
    fetchAttractions({ limit: 12 })
      .then((res) => setAttractions(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => setAttractions([]));
  }, []);

  return (
    <>
      <Helmet>
        <title>Tourism for Everyone — Navoiy Viloyati Inklyuziv Turizm Markazi</title>
        <meta name="description" content="Navoiy shahri, Nurota, Xatirchi va Qiziltepa tumanlaridagi barcha tarixiy obidalar, ziyoratgohlar, shifoxonalar, 360° virtual turlar va mehmonxonalar." />
      </Helmet>

      <div className="pb-24 md:pb-12 overflow-x-hidden">
        {/* ══════════════════════════════════════════
            1. HERO SECTION — PREMIUM NAVOIY VIBE
        ══════════════════════════════════════════ */}
        <header className="relative w-full overflow-hidden min-h-[520px] sm:min-h-[600px] flex items-center justify-center">
          {/* Background Image */}
          <img
            src={heroBg}
            alt="Navoiy viloyati"
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105"
            loading="eager"
          />

          {/* Deep Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(170deg, rgba(10,8,45,0.78) 0%, rgba(20,15,60,0.55) 45%, rgba(6,4,28,0.95) 100%)'
            }}
          />

          {/* Decorative Glowing Orbs */}
          <div className="absolute top-10 right-10 w-96 h-96 rounded-full pointer-events-none animate-float blur-3xl opacity-40"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent 70%)' }} />
          <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full pointer-events-none animate-float blur-3xl opacity-30"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent 70%)', animationDelay: '2s' }} />

          {/* Hero Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center py-16 sm:py-20 flex flex-col items-center">
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-lg mb-4 sm:mb-6 animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <FiMapPin className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider">Navoiy Viloyati · Inklyuziv Turizm Portali</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4 sm:mb-6 animate-fade-in">
              Qadimiy Meros va Zamonaviy <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-violet-400 bg-clip-text text-transparent">
                Dam Olish Maskani
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 max-w-2xl font-medium mb-8 leading-relaxed animate-fade-in">
              Navoiy shahri, Nurota, Xatirchi va Qiziltepadagi tarixiy obidalar, 360° virtual sayohatlar, qulay mehmonxonalar va shoshilinch xizmatlar.
            </p>

            {/* Search Bar Shortcut */}
            <div className="w-full max-w-xl animate-fade-in">
              <div
                onClick={() => navigate('/search')}
                className="w-full flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-white/15 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/25 shadow-2xl cursor-pointer hover:bg-white/20 transition-all duration-200 active:scale-[0.99]"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <FiSearch className="w-4 h-4" />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/90 truncate">Obida, ziyoratgoh yoki mehmonxona qidirish...</p>
                  <p className="text-[10px] text-white/60">Tuman, toifa yoki nomi bo'yicha</p>
                </div>
                <div className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-black text-xs transition-colors shrink-0 flex items-center gap-1.5">
                  <span>Qidirish</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>

            {/* Quick Live Stats Ticker */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/80 text-xs font-bold animate-fade-in">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <FiCompass className="text-amber-400" />
                <span>4 ta Asosiy Hudud</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <FiPlayCircle className="text-indigo-400" />
                <span>360° Virtual Turlar</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <LuHospital className="text-rose-400" />
                <span>24/7 Shoshilinch Xizmatlar</span>
              </div>
            </div>
          </div>

          {/* Bottom Wave Softener */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-[var(--bg-main)] to-transparent" />
        </header>

        {/* ══════════════════════════════════════════
            2. MAIN CONTENT WRAPPER
        ══════════════════════════════════════════ */}
        <main className="px-4 max-w-7xl mx-auto space-y-12 sm:space-y-16 -mt-8 relative z-20">

          {/* ── 2.1. 4 TA ASOSIY HUDUD KARTALARI ── */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {DISTRICT_INFO.map((d, i) => {
                const hCount = hotels.filter(h => (h.district || h.city) === d.name).length;
                const aCount = attractions.filter(a => (a.district || a.city) === d.name).length;
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => navigate(`/attractions?district=${encodeURIComponent(d.name)}`)}
                    className="glass-panel p-4 sm:p-5 rounded-2xl text-left transition-all duration-200 hover:shadow-lg active:scale-[0.98] border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between group"
                    style={{ borderTop: `4px solid ${d.color}` }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs" style={{ background: d.color }}>
                          <FiMapPin className="w-4 h-4" />
                        </span>
                        <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mb-1">{d.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">{d.desc}</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>{aCount || 'Ko\'rish'} ta maskan</span>
                      <span>{hCount > 0 ? `${hCount} hotel` : ''}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 2.2. TOIFALAR BO'YICHA TEZKOR EXPLORER ── */}
          <section className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCompass className="text-indigo-500" /> Qulay Yo'nalish Bo'yicha Qidiruv
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">O'zingizga kerakli turdagi obyektlarni bir bosishda toping</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {CATEGORY_QUICK_EXPLORER.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => navigate(cat.to)}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all duration-200 active:scale-95 flex flex-col items-center text-center group"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-xs transition-transform group-hover:scale-110"
                      style={{ background: `${cat.color}15`, color: cat.color }}
                    >
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate w-full">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 2.3. INTERAKTIV 3D XARITA BANNERI ── */}
          <section>
            <div
              onClick={() => navigate('/map')}
              className="p-6 sm:p-8 rounded-3xl cursor-pointer transition-all duration-300 active:scale-[0.99] border border-indigo-200/60 dark:border-indigo-900/40 relative overflow-hidden group shadow-lg shadow-indigo-500/10"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.15) 100%)'
              }}
            >
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
                    <FiMap className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10.5px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Interaktiv Xarita</span>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Navoiy Viloyatining Barcha Joylari Bir Xaritada</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                      Obidalar, ziyoratgohlar, shifoxonalar va eng yaqin mehmonxonalarni 3D xaritada filtrlang va masofasini ko'ring.
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-md shadow-indigo-500/25 group-hover:bg-indigo-700 transition-colors">
                  <span>Xaritani Ochish</span>
                  <FiArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>

          {/* ── 2.4. DIQQATGA SAZOVOR JOYLAR VA 360° VR ── */}
          {attractions.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <LuLandmark className="text-amber-500 w-6 h-6" /> Diqqatga Sazovor Obyektlar
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Tarixiy obidalar, ziyoratgohlar va tabiat maskanlari
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/attractions')}
                  className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                >
                  Barchasini ko'rish ({attractions.length}) <FiChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {attractions.slice(0, 6).map((a) => (
                  <AttractionCard key={a._id} attraction={a} />
                ))}
              </div>
            </section>
          )}

          {/* ── 2.5. INKLYUZIVLIK BANNERI & AI TAVSIYALAR ── */}
          <AccessibilityBanner />
          <AIRecommendations />

          {/* ── 2.6. MASHHUR MEHMONXONALAR ── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FiTrendingUp className="text-rose-500 w-5 h-5" /> Qulay Mehmonxonalar & Turar Joylar
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Sayohat davomida qulay hordiq chiqarish uchun maskanlar
                </p>
              </div>
              {!loading && hotels.length > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/search')}
                  className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  Barchasi <FiChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {error && (
              <div className="rounded-2xl p-4 mb-6 flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600">
                <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-bold">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3].map(i => <Skeleton key={i} />)}
              </div>
            ) : hotels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {hotels.slice(0, 6).map(hotel => <HotelCard key={hotel._id} hotel={hotel} />)}
              </div>
            ) : !error ? (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
                <FiFrown className="mx-auto w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Mehmonxonalar topilmadi</h3>
                <p className="text-xs text-slate-400">Admin paneldan yangi mehmonxona qo'shishingiz mumkin.</p>
              </div>
            ) : null}
          </section>
        </main>

        {/* Scroll To Top */}
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 sm:bottom-8 right-4 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 bg-gradient-to-r from-indigo-600 to-violet-600"
            aria-label="Yuqoriga"
          >
            <FiArrowUp className="w-5 h-5" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </>
  );
};

export default Home;
