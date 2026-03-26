import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import AIRecommendations from '../components/AIRecommendations';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiAward, FiSun, FiDollarSign, FiUsers, FiHome, FiBriefcase, FiMapPin, FiCalendar, FiMap, FiStar, FiTrendingUp, FiFrown, FiAlertTriangle } from 'react-icons/fi';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const navigate = useNavigate();
  const { darkMode } = useContext(AuthContext);

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
    <div className="pb-28">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <div className="relative w-full overflow-hidden" style={{ height: '580px' }}>
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
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center" style={{ paddingBottom: '100px' }}>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)' }}>
            <FiMap className="text-amber-400 w-4 h-4" />
            <span className="text-white text-xs font-black uppercase tracking-[0.2em]">NavaiTour · O'zbekiston</span>
          </div>

          {/* Title */}
          <h1 className="text-white font-black mb-4 leading-tight"
            style={{ fontSize: 'clamp(2rem, 6vw, 3.25rem)', textShadow: '0 4px 24px rgba(0,0,0,0.4)' }}>
            Ideal mehmonxona
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #818CF8, #C084FC, #F472B6)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              sizi kutmoqda
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/80 font-medium mb-8 max-w-md"
            style={{ fontSize: 'clamp(0.875rem, 2.5vw, 1rem)' }}>
            O'zbekiston bo'ylab eng sara mehmonxonalarni oson band qiling.
          </p>

          {/* Search Form */}
          <form
            onSubmit={handleSearch}
            className="w-full max-w-3xl"
            style={{
              background: 'rgba(255,255,255,0.96)',
              backdropFilter: 'blur(24px)',
              borderRadius: '2rem',
              padding: '8px',
              boxShadow: '0 24px 60px -12px rgba(0,0,0,0.4)',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Location input */}
              <div className="flex-1 flex items-center px-4 py-3 rounded-[1.5rem] gap-3"
                style={{ background: 'rgba(240,244,255,0.8)' }}>
                <FiMapPin className="text-indigo-500 flex-shrink-0 w-5 h-5" />
                <div className="flex-1 text-left min-w-0">
                  <label className="block text-[10px] uppercase font-black text-gray-400 tracking-wider mb-0.5">Manzil yoki Nomi</label>
                  <input
                    type="text"
                    placeholder="Qayerga ketyapsiz?"
                    className="w-full bg-transparent border-none outline-none text-gray-900 font-bold text-sm placeholder-gray-400 truncate"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {/* Date inputs */}
              <div className="flex gap-2">
                <div className="flex items-center px-4 py-3 rounded-[1.5rem] gap-2 shrink-0"
                  style={{ background: 'rgba(240,244,255,0.8)' }}>
                  <FiCalendar className="text-indigo-400 flex-shrink-0 w-4 h-4" />
                  <div className="text-left">
                    <label className="block text-[9px] uppercase font-black text-gray-400 tracking-wider mb-0.5">Kirish</label>
                    <input type="date" min={today}
                      className="bg-transparent border-none outline-none text-gray-900 font-bold text-sm w-full p-0"
                      value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center px-4 py-3 rounded-[1.5rem] gap-2 shrink-0"
                  style={{ background: 'rgba(240,244,255,0.8)' }}>
                  <FiCalendar className="text-rose-400 flex-shrink-0 w-4 h-4" />
                  <div className="text-left">
                    <label className="block text-[9px] uppercase font-black text-gray-400 tracking-wider mb-0.5">Chiqish</label>
                    <input type="date" min={checkIn || today}
                      className="bg-transparent border-none outline-none text-gray-900 font-bold text-sm w-full p-0"
                      value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Search Button */}
              <button type="submit" className="btn-primary flex items-center justify-center gap-2 font-bold px-7 py-3 rounded-[1.5rem] text-sm sm:w-auto w-full mt-1 sm:mt-0"
                style={{ borderRadius: '1.5rem' }}>
                <FiSearch className="w-5 h-5" />
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
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => navigate(`/search?q=${cat.query}`)}
                className="flex-shrink-0 flex flex-col items-center justify-center gap-2 transition-all group active:scale-95"
                style={{
                  width: '100px',
                  height: '96px',
                  borderRadius: '1.5rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#6366F1';
                  e.currentTarget.style.boxShadow = '0 8px 24px -6px rgba(99,102,241,0.25)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>{cat.icon}</span>
                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
              </button>
            ))}
          </div>
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
    </div>
  );
};

export default Home;
