import React, { useEffect, useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import AttractionCard from '../components/AttractionCard';
import AccessibilityBanner from '../components/AccessibilityBanner';
import { fetchAttractions } from '../services/attractions';
import heroBg from '../assets/hero.png';
import {
  FiSearch, FiMapPin, FiMap, FiStar,
  FiArrowRight, FiChevronRight, FiPlayCircle, FiShield, FiCompass,
  FiFilter, FiLayers, FiCheck
} from 'react-icons/fi';
import { LuLandmark, LuHospital, LuStore, LuBuilding2, LuTrees } from 'react-icons/lu';
import { FaMosque, FaMountain, FaShoppingBag, FaTheaterMasks } from 'react-icons/fa';

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
  { name: 'Navoiy shahri', desc: 'Zamonaviy shahar, teatrlar, istirohat bog\'lari va savdo majmualari', color: '#6366f1' },
  { name: 'Nurota', desc: 'Nur qal\'asi, Chashma majmuasi, Nurota tog\'lari va qadimiy ziyoratgohlar', color: '#f59e0b' },
  { name: 'Xatirchi', desc: 'Qadimiy obidalar, ziyoratgohlar, sharsharalar va yashil bog\'lar', color: '#10b981' },
  { name: 'Qiziltepa', desc: 'Raboti Malik karvonsaroyi, Sardoba va qadimiy madaniy meros', color: '#8b5cf6' },
];

const ATTRACTION_CATEGORIES = [
  { key: 'all', label: 'Barcha Joylar', icon: FiLayers, color: '#6366f1' },
  { key: 'tarixiy', label: 'Tarixiy Obidalar', icon: LuLandmark, color: '#f59e0b' },
  { key: 'madaniy', label: 'Teatr & Muzeylar', icon: FaTheaterMasks, color: '#8b5cf6' },
  { key: 'istirohat_bogi', label: 'Istirohat Bog\'lari', icon: LuTrees, color: '#0284c7' },
  { key: 'tabiat', label: 'Tog\' & Sharsharalar', icon: FaMountain, color: '#059669' },
  { key: 'ziyoratgoh', label: 'Ziyoratgohlar', icon: FaMosque, color: '#10b981' },
  { key: 'savdo', label: 'Savdo Majmualari', icon: FaShoppingBag, color: '#ec4899' },
];

const Home = () => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTop, setShowTop] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fn = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAttractions({ limit: 100 })
      .then((res) => {
        const list = Array.isArray(res) ? res : (res.data || []);
        setAttractions(list);
      })
      .catch(() => {
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
        setAttractions([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filtered attractions
  const filteredAttractions = useMemo(() => {
    return attractions.filter((a) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'savdo') {
          if (!['bozor', 'supermarket', 'mall', 'savdo'].includes(a.category)) return false;
        } else if (a.category !== selectedCategory) {
          return false;
        }
      }
      // District filter
      if (selectedDistrict !== 'all' && a.district !== selectedDistrict) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = a.name?.toLowerCase().includes(q);
        const matchesDist = a.district?.toLowerCase().includes(q);
        const matchesDesc = (a.descriptionShort || a.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesDist && !matchesDesc) return false;
      }
      return true;
    });
  }, [attractions, selectedCategory, selectedDistrict, searchQuery]);

  return (
    <>
      <Helmet>
        <title>Tourism for Everyone — Navoiy Tarixiy va Madaniy Joylar Portali</title>
        <meta name="description" content="Navoiy shahri, Nurota, Xatirchi va Qiziltepadagi barcha tarixiy obidalar, teatrlar, istirohat bog'lari, tog' va sharsharalar hamda yaqin dam olish maskanlari." />
      </Helmet>

      <div className="pb-24 md:pb-12 overflow-x-hidden">
        {/* ══════════════════════════════════════════
            1. HERO SECTION — NAVOIY MADANIYAT VA MEROS
        ══════════════════════════════════════════ */}
        <header className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[580px] flex items-center justify-center">
          {/* Background Image */}
          <img
            src={heroBg}
            alt="Navoiy viloyati obidalari"
            className="absolute inset-0 w-full h-full object-cover object-center transform scale-105"
            loading="eager"
          />

          {/* Deep Gradient Overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(170deg, rgba(10,8,45,0.82) 0%, rgba(20,15,60,0.6) 45%, rgba(6,4,28,0.96) 100%)'
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
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4 sm:mb-5 animate-fade-in">
              Qadimiy Meros, Madaniyat <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-violet-400 bg-clip-text text-transparent">
                va Tabiat Maskani
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base lg:text-lg text-slate-200/90 max-w-2xl font-medium mb-8 leading-relaxed animate-fade-in">
              Tarixiy obidalar, teatr va muzeylar, istirohat bog'lari, tog' va sharsharalar, ziyoratgohlar hamda savdo majmualari. Joy tafsilotlarida eng yaqin mehmonxonalar tavsiya etiladi.
            </p>

            {/* Search Input Bar */}
            <div className="w-full max-w-xl animate-fade-in">
              <div className="w-full flex items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-white/15 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/25 shadow-2xl transition-all duration-200 focus-within:bg-white/25">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <FiSearch className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Obida, teatr, bog' yoki tog' nomini izlang..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-white placeholder-white/60 text-xs sm:text-sm font-semibold outline-none border-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                  >
                    Tozalash
                  </button>
                )}
              </div>
            </div>

            {/* Quick Live Stats Ticker */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-white/85 text-xs font-bold animate-fade-in">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <LuLandmark className="text-amber-400" />
                <span>Tarixiy Obidalar</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <FaTheaterMasks className="text-purple-300" />
                <span>Teatr & Madaniyat</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <LuTrees className="text-emerald-400" />
                <span>Istirohat Bog'lari</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md">
                <FaMountain className="text-teal-300" />
                <span>Tog' & Sharsharalar</span>
              </div>
            </div>
          </div>

          {/* Bottom Wave Softener */}
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-[var(--bg-main)] to-transparent" />
        </header>

        {/* ══════════════════════════════════════════
            2. MAIN CONTENT WRAPPER
        ══════════════════════════════════════════ */}
        <main className="px-4 max-w-7xl mx-auto space-y-10 sm:space-y-14 -mt-8 relative z-20">

          {/* ── 2.1. 4 TA ASOSIY HUDUD KARTALARI ── */}
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {DISTRICT_INFO.map((d) => {
                const count = attractions.filter(a => (a.district || a.city) === d.name).length;
                const isSelected = selectedDistrict === d.name;
                return (
                  <button
                    key={d.name}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedDistrict('all');
                      } else {
                        setSelectedDistrict(d.name);
                      }
                    }}
                    className={`glass-panel p-4 sm:p-5 rounded-2xl text-left transition-all duration-300 hover:shadow-xl active:scale-[0.98] border flex flex-col justify-between group ${
                      isSelected ? 'ring-2 ring-primary shadow-lg scale-[1.02]' : 'border-glass-border'
                    }`}
                    style={{ borderTop: `4px solid ${d.color}` }}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-xs" style={{ background: d.color }}>
                          <FiMapPin className="w-4 h-4" />
                        </span>
                        {isSelected ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-600 text-white">Tanlangan</span>
                        ) : (
                          <FiArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                        )}
                      </div>
                      <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white mb-1">{d.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{d.desc}</p>
                    </div>
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      <span className="text-indigo-600 dark:text-indigo-400">{count > 0 ? `${count} ta maskan` : "Barcha joylar"}</span>
                      <span>{isSelected ? "Barchasi" : "Filtrlash"}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 2.2. TOIFALAR BO'YICHA TEZKOR EXPLORER VA FILTR ── */}
          <section className="glass-panel p-5 sm:p-6 rounded-3xl border border-glass-border shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <FiCompass className="text-amber-500 w-5 h-5" /> Sayohat va Madaniyat Yo'nalishlari
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Tarixiy obidalar, teatrlar, istirohat bog'lari, tog' va sharsharalar, savdo majmualari
                </p>
              </div>

              {(selectedCategory !== 'all' || selectedDistrict !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedDistrict('all');
                    setSearchQuery('');
                  }}
                  className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors"
                >
                  Filtrlarni tozalash
                </button>
              )}
            </div>

            {/* Category Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {ATTRACTION_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                const isActive = selectedCategory === cat.key;
                const count = cat.key === 'all'
                  ? attractions.length
                  : cat.key === 'savdo'
                    ? attractions.filter(a => ['bozor', 'supermarket', 'mall', 'savdo'].includes(a.category)).length
                    : attractions.filter(a => a.category === cat.key).length;

                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`p-3.5 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center group active:scale-95 ${
                      isActive
                        ? 'btn-primary shadow-md scale-[1.02]'
                        : 'glass-panel hover:border-primary-light text-slate-800 dark:text-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 shadow-xs transition-transform group-hover:scale-110 ${
                        isActive ? 'bg-white/20 text-white' : ''
                      }`}
                      style={!isActive ? { background: `${cat.color}15`, color: cat.color } : {}}
                    >
                      <CatIcon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold truncate w-full">{cat.label}</span>
                    <span className={`text-[10px] mt-0.5 font-bold ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                      {count} ta joy
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Shoshilinch va Ma'muriy Xizmatlar */}
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] font-medium flex items-center gap-1.5">
                <FiShield className="text-indigo-500" /> Zarur bo'lganda shoshilinch yordam:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => navigate('/attractions?category=kasalxona')}
                  className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40 text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1"
                >
                  <LuHospital className="w-3.5 h-3.5" /> Kasalxona (103)
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/attractions?category=iib')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/40 text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1"
                >
                  <FiShield className="w-3.5 h-3.5" /> IIB / Xavfsizlik (102)
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/attractions?category=hokimiyat')}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-bold transition-all active:scale-95 flex items-center gap-1"
                >
                  <LuBuilding2 className="w-3.5 h-3.5" /> Hokimiyat & DXM
                </button>
              </div>
            </div>
          </section>

          {/* ── 2.3. DIQQATGA SAZOVOR JOYLAR RO'YXATI ── */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <LuLandmark className="text-amber-500 w-6 h-6" /> Diqqatga Sazovor Maskanlar
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedDistrict !== 'all' ? `${selectedDistrict} bo'yicha: ` : ''}
                  {filteredAttractions.length} ta maskan topildi. Har bir joy ichida eng yaqin mehmonxonalar tavsiya etiladi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/attractions')}
                className="text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 shrink-0"
              >
                Barchasini ko'rish ({attractions.length}) <FiChevronRight className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} />)}
              </div>
            ) : filteredAttractions.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredAttractions.map((a) => (
                  <AttractionCard key={a._id} attraction={a} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                <LuLandmark className="mx-auto w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Mos joylar topilmadi</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                  Tanlangan toifa yoki qidiruv so'rovi bo'yicha ma'lumot topilmadi. Boshqa toifani tanlab ko'ring.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setSelectedDistrict('all');
                    setSearchQuery('');
                  }}
                  className="btn-primary px-5 py-2.5 rounded-xl text-xs font-bold text-white"
                >
                  Filtrlarni tozalash
                </button>
              </div>
            )}
          </section>

          {/* ── 2.4. INTERAKTIV 3D XARITA BANNERI ── */}
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
                    <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">Navoiy Viloyatining Barcha Maskanlari Xaritada</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                      Obidalar, teatrlar, bog'lar, tog'lar va ularning atrofidagi eng yaqin mehmonxonalarni 3D xaritada ko'ring va marshrut tuzing.
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 rounded-xl btn-primary flex items-center gap-2 self-start sm:self-auto shrink-0 transition-colors">
                  <span>Xaritani Ochish</span>
                  <FiArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </section>

          {/* ── 2.5. INKLYUZIVLIK BANNERI ── */}
          <AccessibilityBanner />
        </main>

        {/* Scroll To Top */}
        {showTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-24 sm:bottom-8 right-4 sm:right-6 z-50 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white shadow-xl transition-all active:scale-95 bg-gradient-to-r from-indigo-600 to-violet-600"
            aria-label="Yuqoriga"
          >
            <FiChevronRight className="w-5 h-5 -rotate-90" />
          </button>
        )}
      </div>
    </>
  );
};

export default Home;
