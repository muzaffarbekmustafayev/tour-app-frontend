import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import api from '../services/api';
import BackButton from '../components/BackButton';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [totalHotels, setTotalHotels] = useState(0);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    search: searchParams.get('q') || '',
    city: searchParams.get('city') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    stars: searchParams.getAll('stars') || [],
    minRating: searchParams.get('minRating') || '',
    accessibility: searchParams.getAll('accessibility') || [],
  });

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.city) params.set('city', filters.city);
      if (filters.minPrice) params.set('priceMin', filters.minPrice);
      if (filters.maxPrice) params.set('priceMax', filters.maxPrice);
      if (filters.minRating) params.set('minRating', filters.minRating);
      filters.stars.forEach(s => params.append('stars', s));
      filters.accessibility.forEach(a => params.append('accessibility', a));
      const res = await api.get(`/hotels?${params.toString()}`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || res.data.hotels || []);
      setHotels(data);
      setTotalHotels(data.length);
    } catch (err) {
      console.error(err);
      setHotels([]);
      setTotalHotels(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

  const handleStarToggle = (star) => {
    setFilters(prev => {
      const s = String(star);
      return { ...prev, stars: prev.stars.includes(s) ? prev.stars.filter(x => x !== s) : [...prev.stars, s] };
    });
  };

  const handleAccessibilityToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      accessibility: prev.accessibility.includes(feature)
        ? prev.accessibility.filter(f => f !== feature)
        : [...prev.accessibility, feature]
    }));
  };

  const clearFilters = () => setFilters({ search: '', city: '', minPrice: '', maxPrice: '', stars: [], minRating: '', accessibility: [] });

  const activeFiltersCount = [filters.minPrice, filters.maxPrice, filters.minRating, filters.city].filter(Boolean).length + filters.stars.length + filters.accessibility.length;

  const accessibilityOptions = [
    { key: 'wheelchair', label: 'Nogironlar aravachasi' },
    { key: 'elevator', label: 'Lift' },
    { key: 'braille', label: 'Brayl belgilar' },
    { key: 'hearing', label: 'Eshitish moslamasi' },
    { key: 'parking', label: 'Maxsus avtoturargoh' },
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="mb-4"><BackButton /></div>
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input type="text" placeholder="Mehmonxona yoki shahar qidiring..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="w-full pl-11 pr-4 py-3 bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 rounded-2xl font-semibold text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition" />
        </div>
        <button onClick={() => setShowFilters(true)} className="md:hidden flex items-center justify-center bg-white dark:bg-[#1e293b] border border-gray-200 dark:border-gray-700 px-5 py-3 rounded-2xl font-semibold relative">
          <FiFilter className="mr-2 w-5 h-5" />
          Filtrlar
          {activeFiltersCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center">{activeFiltersCount}</span>}
        </button>
      </div>

      <div className="flex gap-8">
        <aside className={`md:w-64 flex-shrink-0 space-y-6 ${showFilters ? 'fixed inset-0 z-[60] bg-white dark:bg-slate-900 p-6 overflow-y-auto' : 'hidden md:block'}`}>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Filtrlar</h2>
            <div className="flex items-center space-x-3">
              {activeFiltersCount > 0 && <button onClick={clearFilters} className="text-xs text-red-500 font-bold hover:underline">Tozalash</button>}
              <button onClick={() => setShowFilters(false)} className="md:hidden p-2 bg-gray-100 dark:bg-slate-800 rounded-full">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm uppercase tracking-wider">Shahar</h3>
            <input type="text" placeholder="masalan: Samarqand" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)} className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm uppercase tracking-wider">Narx (kecha)</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Min</label>
                <input type="number" placeholder="0" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Max</label>
                <input type="number" placeholder="5000000" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)} className="w-full mt-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm uppercase tracking-wider">Yulduz darajasi</h3>
            {[5, 4, 3, 2, 1].map(star => (
              <label key={star} className="flex items-center mb-2 cursor-pointer group">
                <input type="checkbox" checked={filters.stars.includes(String(star))} onChange={() => handleStarToggle(star)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-3 text-sm text-yellow-500 font-semibold">{'★'.repeat(star)}{'☆'.repeat(5 - star)}</span>
              </label>
            ))}
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm uppercase tracking-wider">Minimal reyting</h3>
            {[{ v: '0.9', l: '9+ / 10 🌟 A\'lo' }, { v: '0.8', l: '8+ / 10 👍 Juda yaxshi' }, { v: '0.7', l: '7+ / 10 😊 Yaxshi' }].map(r => (
              <label key={r.v} className="flex items-center mb-2 cursor-pointer">
                <input type="radio" name="minRating" value={r.v} checked={filters.minRating === r.v} onChange={(e) => handleFilterChange('minRating', e.target.value)} className="w-4 h-4 text-blue-600" />
                <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">{r.l}</span>
              </label>
            ))}
            {filters.minRating && <button onClick={() => handleFilterChange('minRating', '')} className="text-xs text-gray-400 hover:text-red-500 mt-1 font-semibold">Tozalash</button>}
          </div>

          <div className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-gray-100 dark:border-gray-800">
            <h3 className="font-bold mb-3 text-gray-900 dark:text-white text-sm uppercase tracking-wider">Nogironlar uchun</h3>
            {accessibilityOptions.map(opt => (
              <label key={opt.key} className="flex items-center mb-2 cursor-pointer">
                <input type="checkbox" checked={filters.accessibility.includes(opt.key)} onChange={() => handleAccessibilityToggle(opt.key)} className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <span className="ml-3 text-sm text-gray-600 dark:text-gray-400 font-medium">{opt.label}</span>
              </label>
            ))}
          </div>

          <button onClick={() => setShowFilters(false)} className="w-full md:hidden bg-blue-600 text-white py-3 rounded-xl font-bold shadow-lg">
            {totalHotels} ta natijani ko'rish
          </button>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">
                {filters.search ? `"${filters.search}" bo'yicha natijalar` : filters.city ? `${filters.city} shahridagi mehmonxonalar` : 'Barcha mehmonxonalar'}
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                {loading ? 'Qidirilmoqda...' : `${totalHotels} ta mehmonxona topildi`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-800 h-80 rounded-3xl" />)}
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {hotels.map(hotel => <HotelCard key={hotel._id} hotel={hotel} />)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800">
              <FiSearch className="mx-auto w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mehmonxona topilmadi</h3>
              <p className="text-gray-500 mb-6 text-center max-w-sm">Filtrlarni o'zgartirib ko'ring yoki tozalang.</p>
              <button onClick={clearFilters} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold active:scale-95 transition-transform">Filtrlarni tozalash</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
