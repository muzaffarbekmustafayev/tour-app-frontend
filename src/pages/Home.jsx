import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import AIRecommendations from '../components/AIRecommendations';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiAward, FiSun, FiDollarSign, FiUsers, FiHome, FiBriefcase, FiMapPin, FiCalendar, FiMap, FiStar, FiTrendingUp, FiFrown, FiAlertTriangle, FiArrowUp, FiTruck } from 'react-icons/fi';
import BackButton from '../components/BackButton';


const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useContext(AuthContext);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const categories = [
    { name: 'Hashamatli', icon: <FiAward className="w-8 h-8 text-yellow-500" />, query: 'luxury' },
    { name: 'Resort',     icon: <FiSun className="w-8 h-8 text-orange-500" />, query: 'resort' },
    { name: 'Arzon',      icon: <FiDollarSign className="w-8 h-8 text-green-500" />, query: 'budget' },
    { name: 'Oilaviy',    icon: <FiUsers className="w-8 h-8 text-blue-500" />, query: 'family' },
    { name: 'Butik',      icon: <FiHome className="w-8 h-8 text-indigo-500" />, query: 'boutique' },
    { name: 'Biznes',     icon: <FiBriefcase className="w-8 h-8 text-purple-500" />, query: 'business' },
  ];

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/hotels');
      setHotels(Array.isArray(res.data) ? res.data : (res.data.data || []));
    } catch (err) {
      console.error(err);
      setError('Mehmonxonalarni yuklashda xatolik. Backend ishlaayotganini tekshiring.');
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    navigate(`/search?${params.toString()}`);
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="pb-28 lg:pl-32">

      {/* Back Button Overlay */}
      <div className="absolute top-6 left-4 z-30">
        <BackButton />
      </div>

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: 'clamp(520px, 80vh, 680px)' }}>


        {/* Background Image */}
        <img
          src="https://marakandatravel.asia/wp-content/uploads/2019/11/p5111803-5-844x473.jpg"
          onError={(e) => { e.target.style.display = 'none'; }}
          alt="Hero"
          className="w-full h-full object-cover"
          style={{ objectPosition: 'center 40%' }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to bottom, rgba(15,12,60,0.55) 0%, rgba(15,12,60,0.25) 45%, rgba(10,8,40,0.88) 100%)'
        }} />

        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #818CF8, transparent)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-0 w-64 h-64 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #EC4899, transparent)', filter: 'blur(70px)' }} />

        {/* Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center pb-20 sm:pb-28">

          {/* Badge */}
          <div className="glass-pill mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <FiMap className="text-amber-400 w-4 h-4 inline mr-2" />
            <span className="font-black">NavaiTour · O'zbekiston</span>
          </div>

          {/* Title */}
          <h1 className="text-white font-black mb-6 leading-[1.1] animate-fade-in"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', textShadow: '0 10px 40px rgba(0,0,0,0.5)', animationDelay: '0.2s' }}>
            Ideal sarguzasht
            <br />
            <span className="text-reveal">
              sizi kutmoqda
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/90 font-medium mb-10 max-w-xl animate-fade-in"
            style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', lineHeight: '1.6', animationDelay: '0.3s' }}>
            O'zbekistonning eng go'zal go'shalarida unutilmas lahzalarni biz bilan birga his qiling.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-4xl animate-fade-in"
            style={{
              background: 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(30px)',
              borderRadius: '2.5rem',
              padding: '12px',
              boxShadow: '0 30px 70px -15px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.4)',
              animationDelay: '0.4s'
            }}
          >
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Location input */}
              <div className="flex-[1.5] flex items-center px-6 py-4 rounded-[2rem] gap-4 transition-all focus-within:ring-2 ring-indigo-500/20"
                style={{ background: 'rgba(241, 245, 249, 0.8)' }}>
                <FiMapPin className="text-indigo-600 flex-shrink-0 w-6 h-6" />
                <div className="flex-1 text-left min-w-0">
                  <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Manzil yoki Nomi</label>
                  <input
                    type="text"
                    placeholder="Qayerga boramiz?"
                    className="w-full bg-transparent border-none outline-none text-slate-900 font-bold text-base placeholder-slate-400 truncate"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Date inputs */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1">
                <div className="flex-1 flex items-center px-6 py-4 rounded-[2rem] gap-3 transition-all focus-within:ring-2 ring-indigo-500/20"
                  style={{ background: 'rgba(241, 245, 249, 0.8)' }}>
                  <FiCalendar className="text-indigo-500 flex-shrink-0 w-5 h-5" />
                  <div className="text-left w-full">
                    <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Kelish</label>
                    <input type="date" min={today}
                      className="bg-transparent border-none outline-none text-slate-900 font-bold text-sm w-full p-0 leading-tight"
                      value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                  </div>
                </div>

                <div className="flex-1 flex items-center px-6 py-4 rounded-[2rem] gap-3 transition-all focus-within:ring-2 ring-indigo-500/20"
                  style={{ background: 'rgba(241, 245, 249, 0.8)' }}>
                  <FiCalendar className="text-rose-500 flex-shrink-0 w-5 h-5" />
                  <div className="text-left w-full">
                    <label className="block text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Ketish</label>
                    <input type="date" min={checkIn || today}
                      className="bg-transparent border-none outline-none text-slate-900 font-bold text-sm w-full p-0 leading-tight"
                      value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button type="submit" className="btn-primary flex items-center justify-center gap-3 font-extrabold px-10 py-5 rounded-[2rem] text-base group hover:scale-[1.02]"
                style={{ borderRadius: '2rem' }}>
                <FiSearch className="w-6 h-6 transition-transform group-hover:rotate-12" />
                Topish
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── MAIN CONTENT ──────────────────────────────────── */}
      <div className="px-4 max-w-7xl mx-auto">

        {/* Statistics */}
        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-3 gap-3 -mt-7 mb-10 relative z-10">
            {[
              { icon: <FiHome className="text-indigo-500 w-8 h-8" />, value: hotels.length + '+', label: 'Mehmonxona', color: '#6366F1' },
              { icon: <FiMapPin className="text-pink-500 w-8 h-8" />, value: [...new Set(hotels.map(h => h.city).filter(Boolean))].length + '+', label: 'Shahar', color: '#EC4899' },
              { icon: <FiStar className="text-amber-500 w-8 h-8" />, value: (hotels.reduce((s, h) => s + (h.rating || 0), 0) / hotels.length).toFixed(1), label: "O'rtacha reyting", color: '#F59E0B' },
            ].map(s => (
              <div key={s.label} className="glass-panel p-4 text-center flex flex-col items-center gap-2"
                style={{ borderRadius: '1.25rem', boxShadow: `0 8px 24px -6px ${s.color}25` }}>
                <span className="mb-1">{s.icon}</span>
                <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-tight">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Categories */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Kategoriyalar</h2>
            <button onClick={() => navigate('/search')}
              className="text-sm font-bold px-4 py-1.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#6366F1' }}>
              Barchasi →
            </button>
          </div>
          <div className="flex space-x-4 overflow-x-auto hide-scrollbar pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat, idx) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/search?q=${cat.query}`)}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-3 transition-all group active:scale-95 animate-scale-in"
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '2rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                  animationDelay: `${0.1 * idx}s`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--primary)';
                  e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(99,102,241,0.3)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 group-hover:rotate-6"
                  style={{ background: 'rgba(99,102,241,0.05)' }}>
                  {cat.icon}
                </div>
                <span className="text-xs font-black text-slate-700 dark:text-slate-200 uppercase tracking-tight">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Transport Routes Quick Link */}
        <div className="mb-10">
          <button
            onClick={() => navigate('/routes')}
            className="w-full glass-panel p-5 flex items-center gap-4 transition-all active:scale-[0.99]"
            style={{
              borderRadius: '1.5rem',
              borderLeft: '4px solid #6366F1',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid var(--border)',
              borderLeftWidth: '4px',
              borderLeftColor: '#6366F1',
              fontFamily: 'inherit',
              textAlign: 'left',
            }}
          >
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <FiTruck className="w-6 h-6 text-indigo-500" />
            </div>
            <div className="flex-1">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-0.5">
                Shahar yo'nalishlari
              </h3>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Navoiy shahri jamoat transporti marshrutlari
              </p>
            </div>
            <FiMapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          </button>
        </div>

        {/* AI Recommendations */}
        <div className="mb-10">
          <AIRecommendations />
        </div>

        {/* Hotels */}
        <div className="mb-10">
          <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
            <FiTrendingUp className="text-rose-500" />
            Mashhur mehmonxonalar
          </h2>
          {error && (
            <div className="rounded-2xl p-5 mb-6 flex items-start gap-3"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <FiAlertTriangle className="text-2xl text-red-500 mt-1" />
              <div>
                <p className="font-bold text-red-600 dark:text-red-400 mb-0.5">Ulanishda xatolik</p>
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="shimmer h-80 rounded-3xl" />
              ))}
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(hotel => <HotelCard key={hotel._id} hotel={hotel} />)}
            </div>
          ) : !error ? (
            <div className="text-center py-20 glass-panel">
              <FiFrown className="mx-auto w-16 h-16 mb-4 text-gray-300" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mehmonxonalar yo'q</h3>
              <p className="text-gray-500 mb-6">
                Namuna ma'lumotlar qo'shish uchun{' '}
                <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-sm">npm run seed</code>{' '}
                ni ishga tushiring.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* ── SCROLL TO TOP ──────────────────────────────────── */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-28 right-5 z-50 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all hover:opacity-90 active:scale-90"
          style={{
            background: 'var(--gradient-main)',
            boxShadow: 'var(--shadow-colored)',
            animation: 'fadeInUp 0.3s ease forwards',
          }}
          aria-label="Yuqoriga qaytish"
        >
          <FiArrowUp className="w-5 h-5 text-white" strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default Home;
