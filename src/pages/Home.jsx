import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import AIRecommendations from '../components/AIRecommendations';
import api from '../services/api';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const navigate = useNavigate();

  const categories = [
    { name: 'Hashamatli', icon: '💎', query: 'luxury' },
    { name: 'Resort', icon: '🏖️', query: 'resort' },
    { name: 'Arzon', icon: '💰', query: 'budget' },
    { name: 'Oilaviy', icon: '👨‍👩‍👧‍👦', query: 'family' },
    { name: 'Butik', icon: '🏠', query: 'boutique' },
    { name: 'Biznes', icon: '💼', query: 'business' },
  ];

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/hotels');
      setHotels(Array.isArray(res.data) ? res.data : []);
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
    <div className="pb-24">
      {/* Hero */}
      <div className="relative h-[500px] w-full mb-8">
        <div className="absolute inset-0">
          <img src="https://marakandatravel.asia/wp-content/uploads/2019/11/p5111803-5-844x473.jpg" onError={(e) => { e.target.style.display = 'none'; }} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <p className="text-yellow-400 font-bold text-sm uppercase tracking-widest mb-3">🏨 NavaiTour</p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-lg leading-tight">
            Ideal mehmonxonangizni<br />toping
          </h1>
          <p className="text-white/80 text-base mb-8 max-w-md">
            Navoi bo'ylab eng yaxshi mehmonxonalarni qidiring va band qiling.
          </p>
          <form onSubmit={handleSearch} className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-400">
            <div className="flex flex-col md:flex-row">
              <div className="flex-1 flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3 text-blue-600 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
                <div className="flex-1">
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Manzil</label>
                  <input type="text" placeholder="Qayerga borasiz?" className="w-full bg-transparent border-none focus:ring-0 text-gray-900 font-bold text-sm outline-none placeholder-gray-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3 text-blue-600 flex-shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Kirish</label>
                  <input type="date" min={today} className="bg-transparent border-none focus:ring-0 text-gray-900 font-bold text-sm outline-none w-full" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center px-4 py-3 border-b md:border-b-0 md:border-r border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-3 text-blue-600 flex-shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Chiqish</label>
                  <input type="date" min={checkIn || today} className="bg-transparent border-none focus:ring-0 text-gray-900 font-bold text-sm outline-none w-full" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 transition-all active:scale-95 text-sm uppercase tracking-wide">
                Qidirish
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="px-4 max-w-7xl mx-auto">

        {/* Statistika */}
        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: '🏨', value: hotels.length + '+', label: 'Mehmonxona' },
              { icon: '🌆', value: [...new Set(hotels.map(h => h.city).filter(Boolean))].length + '+', label: 'Shahar' },
              { icon: '⭐', value: (hotels.reduce((s, h) => s + (h.rating || 0), 0) / hotels.length).toFixed(1), label: "O'rtacha reyting" },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800 shadow-sm">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Kategoriyalar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Kategoriya bo'yicha</h2>
            <button onClick={() => navigate('/search')} className="text-blue-600 text-sm font-semibold hover:underline">Barchasi</button>
          </div>
          <div className="flex space-x-3 overflow-x-auto hide-scrollbar pb-2">
            {categories.map((cat) => (
              <button key={cat.name} onClick={() => navigate(`/search?q=${cat.query}`)} className="flex-shrink-0 bg-white dark:bg-[#1e293b] border border-gray-100 dark:border-gray-800 px-6 py-4 rounded-2xl flex flex-col items-center min-w-[100px] shadow-sm hover:border-blue-500 hover:shadow-md transition-all group">
                <span className="text-2xl mb-2 group-hover:scale-125 transition-transform">{cat.icon}</span>
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <AIRecommendations />
        </div>

        {/* Mashhur mehmonxonalar */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6 flex items-center text-gray-900 dark:text-white">
            <span className="mr-2">🔥</span> Mashhur mehmonxonalar
          </h2>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-5 mb-6">
              <p className="font-bold mb-1">Ulanishda xatolik</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 h-80 rounded-3xl" />)}
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map(hotel => <HotelCard key={hotel._id} hotel={hotel} />)}
            </div>
          ) : !error ? (
            <div className="text-center py-16 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800">
              <p className="text-5xl mb-4">🏨</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mehmonxonalar yo'q</h3>
              <p className="text-gray-500 mb-6">Namuna ma'lumotlar qo'shish uchun <code className="bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-sm">npm run seed</code> ni ishga tushiring.</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Home;
