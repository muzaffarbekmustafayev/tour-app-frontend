import React, { useEffect, useState, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import AIRecommendations from '../components/AIRecommendations';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiSearch, FiAward, FiSun, FiDollarSign, FiUsers, FiHome, FiBriefcase, FiMapPin, FiCalendar, FiMap, FiStar, FiTrendingUp, FiFrown, FiMoon } from 'react-icons/fi';

const Home = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(AuthContext);

  const categories = [
    { name: 'Hashamatli', icon: <FiAward />, query: 'luxury' },
    { name: 'Resort', icon: <FiSun />, query: 'resort' },
    { name: 'Arzon', icon: <FiDollarSign />, query: 'budget' },
    { name: 'Oilaviy', icon: <FiUsers />, query: 'family' },
    { name: 'Butik', icon: <FiHome />, query: 'boutique' },
    { name: 'Biznes', icon: <FiBriefcase />, query: 'business' },
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
    <div className="pb-24">
      {/* Hero */}
      <div className="relative h-[500px] w-full mb-8">
        <div className="absolute inset-0">
          <img src="https://marakandatravel.asia/wp-content/uploads/2019/11/p5111803-5-844x473.jpg" onError={(e) => { e.target.style.display = 'none'; }} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
        </div>
          <p className="text-yellow-400 font-black text-sm uppercase tracking-widest mb-3 flex items-center justify-center drop-shadow-md"><FiMap className="inline mr-2" /> NavaiTour</p>
          <h1 className="text-[2rem] sm:text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg leading-tight tracking-tight">
            Ideal mehmonxona <br className="sm:hidden" />kutmoqda
          </h1>
          <p className="text-white/90 text-sm sm:text-base font-medium mb-10 max-w-md drop-shadow max-w-[90%] mx-auto">
            O'zbekiston bo'ylab eng sara mehmonxonalarni oson band qiling.
          </p>
          
          <form onSubmit={handleSearch} className="w-[95%] sm:w-full max-w-4xl bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl rounded-[2rem] sm:rounded-full shadow-2xl p-2 mx-auto border border-white/20 dark:border-gray-700/50">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center px-5 py-3 sm:py-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-3xl sm:rounded-full hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors">
                <FiMapPin className="mr-3 text-blue-600 dark:text-blue-400 flex-shrink-0 w-6 h-6" />
                <div className="flex-1 text-left">
                  <label className="block text-[10px] uppercase font-black text-gray-500 mb-0.5 tracking-wider">Manzil yoki Nomi</label>
                  <input type="text" placeholder="Qayerga ketyapsiz?" className="w-full bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-bold text-sm sm:text-base outline-none placeholder-gray-400 truncate" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1 flex items-center px-4 sm:px-5 py-3 sm:py-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-3xl sm:rounded-full hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors shrink-0">
                  <FiCalendar className="mr-2 sm:mr-3 text-indigo-500 flex-shrink-0 w-5 h-5" />
                  <div className="text-left w-full">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-black text-gray-500 mb-0.5 tracking-wider">Kirish</label>
                    <input type="date" min={today} className="bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-bold text-[13px] sm:text-base outline-none w-full p-0" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
                  </div>
                </div>
                
                <div className="flex-1 flex items-center px-4 sm:px-5 py-3 sm:py-4 bg-gray-50/80 dark:bg-slate-800/80 rounded-3xl sm:rounded-full hover:bg-gray-100 dark:hover:bg-slate-700/80 transition-colors shrink-0">
                  <FiCalendar className="mr-2 sm:mr-3 text-rose-500 flex-shrink-0 w-5 h-5" />
                  <div className="text-left w-full">
                    <label className="block text-[9px] sm:text-[10px] uppercase font-black text-gray-500 mb-0.5 tracking-wider">Chiqish</label>
                    <input type="date" min={checkIn || today} className="bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white font-bold text-[13px] sm:text-base outline-none w-full p-0" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
                  </div>
                </div>
              </div>
              
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-4 rounded-full transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto mt-2 sm:mt-0">
                <FiSearch className="w-5 h-5" /> Topish
              </button>
            </div>
          </form>
      </div>

      <div className="px-4 max-w-7xl mx-auto">

        {/* Statistika */}
        {!loading && hotels.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { icon: <FiHome />, value: hotels.length + '+', label: 'Mehmonxona' },
              { icon: <FiMapPin />, value: [...new Set(hotels.map(h => h.city).filter(Boolean))].length + '+', label: 'Shahar' },
              { icon: <FiStar />, value: (hotels.reduce((s, h) => s + (h.rating || 0), 0) / hotels.length).toFixed(1), label: "O'rtacha reyting" },
            ].map(s => (
              <div key={s.label} className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 text-center border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center">
                <div className="text-2xl mb-1 text-gray-400 dark:text-gray-500">{s.icon}</div>
                <p className="text-xl font-black text-blue-600 dark:text-blue-400">{s.value}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Kategoriyalar */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Kategoriyalar</h2>
            <button onClick={() => navigate('/search')} className="text-blue-600 dark:text-blue-400 text-[13px] sm:text-sm font-bold hover:underline bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full">Barchasi</button>
          </div>
          <div className="flex space-x-3 sm:space-x-4 overflow-x-auto hide-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((cat) => (
              <button key={cat.name} onClick={() => navigate(`/search?q=${cat.query}`)} className="flex-shrink-0 bg-white dark:bg-slate-800/80 border border-gray-100 dark:border-gray-800 w-[105px] h-[100px] sm:w-auto sm:px-8 sm:py-5 rounded-[1.5rem] flex flex-col items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group active:scale-95">
                <span className="text-[28px] sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform text-blue-500">{cat.icon}</span>
                <span className="text-[12px] sm:text-sm font-bold text-gray-700 dark:text-gray-300">{cat.name}</span>
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
            <FiTrendingUp className="mr-2 text-red-500" /> Mashhur mehmonxonalar
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
              <FiFrown className="mx-auto w-16 h-16 mb-4 text-gray-300" />
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
