import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import api from '../services/api';
import BackButton from '../components/BackButton';
import { FiSearch, FiFilter, FiX, FiStar, FiAward, FiThumbsUp, FiSmile
} from 'react-icons/fi';

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

  const handleAccessibilityToggle = (feature) => {
    setFilters(prev => ({
      ...prev,
      accessibility: prev.accessibility.includes(feature)
        ? prev.accessibility.filter(f => f !== feature)
        : [...prev.accessibility, feature]
    }));
  };

  const clearFilters = () => setFilters({ search: '', city: '', minPrice: '', maxPrice: '', minRating: '', accessibility: [] });

  const activeFiltersCount = [filters.minPrice, filters.maxPrice, filters.minRating, filters.city].filter(Boolean).length + filters.accessibility.length;

  const accessibilityOptions = [
    { key: 'wheelchairAccessible', label: 'Nogironlar aravachasi' },
    { key: 'elevator', label: 'Lift mavjud' },
    { key: 'brailleSigns', label: 'Brayl shrifti (Ko\'zi ojizlar)' },
    { key: 'tactileFlooring', label: 'Taktil pol qoplamalari' },
    { key: 'hearingAssistance', label: 'Eshitish moslamalari' },
    { key: 'voiceAssistant', label: 'Ovozli boshqaruv' },
    { key: 'signLanguage', label: 'Imo-ishora tili xizmati' },
    { key: 'emergencyButtons', label: 'Favqulodda yordam tugmalari' },
    { key: 'wideDoors', label: 'Keng eshiklar' },
    { key: 'showerSeat', label: 'Dush o\'rindig\'i' },
  ];


  return (
    <div className="pb-28 pt-4 px-4 max-w-7xl mx-auto min-h-screen lg:pl-32">

      <div className="mb-4"><BackButton /></div>
      
      {/* ── SEARCH BAR ────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 flex items-center pl-5 pointer-events-none transition-colors group-focus-within:text-indigo-600"
            style={{ color: 'var(--text-muted)' }}>
            <FiSearch className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Mehmonxona yoki shahar qidiring..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-white dark:bg-[#1e293b] font-bold text-gray-900 dark:text-white outline-none transition-all"
            style={{ 
              borderRadius: '2rem', 
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)'
            }}
            onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = 'var(--shadow)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}
          />
        </div>
        
        <button
          onClick={() => setShowFilters(true)}
          className="md:hidden flex items-center justify-center bg-white dark:bg-[#1e293b] px-6 py-4 font-bold relative transition-all active:scale-95"
          style={{ borderRadius: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}
        >
          <FiFilter className="mr-2 w-5 h-5" />
          Filtrlar
          {activeFiltersCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 text-white text-[11px] font-black rounded-full flex items-center justify-center shadow-lg transform scale-110">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* ── FILTERS SIDEBAR ───────────────────────────────── */}
        <aside className={`md:w-72 flex-shrink-0 space-y-5 ${showFilters ? 'fixed inset-0 z-[110] bg-white dark:bg-slate-900 p-6 overflow-y-auto w-full' : 'hidden md:block'}`}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <FiFilter className="text-indigo-500" /> Filtrlar
            </h2>
            <div className="flex items-center space-x-4">
              {activeFiltersCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-rose-500 font-bold hover:underline">
                  Tozalash
                </button>
              )}
              <button onClick={() => setShowFilters(false)} className="md:hidden w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full active:scale-95 transition-transform">
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Shahar</h3>
            <input
              type="text"
              placeholder="masalan: Samarqand"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Narx (kecha)</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Min</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pl-1">Max</label>
                <input
                  type="number"
                  placeholder="5000000"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-50/50 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>



          <div className="glass-panel p-5">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Minimal reyting</h3>
            <div className="space-y-3">
              {[
                { v: '0.9', l: "9+ / 10 A'lo", i: <FiAward className="text-amber-500 w-3.5 h-3.5" /> },
                { v: '0.8', l: '8+ / 10 Yaxshi', i: <FiThumbsUp className="text-blue-500 w-3.5 h-3.5" /> },
                { v: '0.7', l: '7+ / 10 Qoniqarli', i: <FiSmile className="text-green-500 w-3.5 h-3.5" /> }
              ].map(r => (
                <label key={r.v} className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border ${filters.minRating === r.v ? 'border-[6px] border-indigo-600' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600'} transition-all mr-3 shadow-sm`} />
                  <input type="radio" name="minRating" value={r.v} className="hidden" checked={filters.minRating === r.v} onChange={(e) => handleFilterChange('minRating', e.target.value)} />
                  <span className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                    {r.i} {r.l}
                  </span>
                </label>
              ))}
            </div>
            {filters.minRating && (
              <button onClick={() => handleFilterChange('minRating', '')} className="text-xs text-rose-500 hover:text-rose-600 mt-3 font-bold block">
                Tanlovni bekor qilish
              </button>
            )}
          </div>

          <div className="glass-panel p-5">
            <h3 className="font-bold mb-4 text-gray-900 dark:text-white text-[11px] uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Maxsus qulayliklar</h3>
            <div className="space-y-3">
              {accessibilityOptions.map(opt => (
                <label key={opt.key} className="flex items-center cursor-pointer group">
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all mr-3 ${filters.accessibility.includes(opt.key) ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-gray-600'}`}>
                    {filters.accessibility.includes(opt.key) && <FiCheck className="text-white w-3.5 h-3.5" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={filters.accessibility.includes(opt.key)} onChange={() => handleAccessibilityToggle(opt.key)} />
                  <span className="text-sm font-bold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>



          <button onClick={() => setShowFilters(false)} className="w-full md:hidden btn-primary py-4 rounded-2xl font-black text-base shadow-xl mt-6">
            {totalHotels} ta natijani ko'rish
          </button>
        </aside>

        {/* ── RESULTS ───────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-3xl font-black mb-2" style={{ color: 'var(--text-main)' }}>
              {filters.search ? `"${filters.search}" natijalari` : filters.city ? `${filters.city} mehmonxonalari` : 'Barcha mehmonxonalar'}
            </h1>
            <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>
              {loading ? 'Qidirilmoqda...' : `Jami ${totalHotels} ta topildi`}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="shimmer h-[380px] rounded-3xl" />)}
            </div>
          ) : hotels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {hotels.map(hotel => <HotelCard key={hotel._id} hotel={hotel} />)}
            </div>
          ) : (
            <div className="glass-panel flex flex-col items-center justify-center text-center py-24 px-4">
              <div className="w-24 h-24 bg-indigo-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                <FiSearch className="w-10 h-10 text-indigo-300" />
              </div>
              <h3 className="text-2xl font-black mb-3" style={{ color: 'var(--text-main)' }}>Hech narsa topilmadi</h3>
              <p className="mb-8 max-w-sm mx-auto" style={{ color: 'var(--text-muted)' }}>Mavjud filtrlar bo'yicha mos mehmonxonalar yo'q. Boshqa shartlar kiritib ko'ring.</p>
              <button onClick={clearFilters} className="btn-primary px-8 py-3.5 rounded-2xl font-bold shadow-lg">
                Filtrlarni tozalash
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
