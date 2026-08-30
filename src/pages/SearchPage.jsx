import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import HotelCard from '../components/HotelCard';
import api from '../services/api';
import BackButton from '../components/BackButton';
import {
  FiSearch, FiFilter, FiX, FiAward, FiThumbsUp, FiSmile, FiCheck,
  FiChevronDown, FiChevronUp, FiSliders, FiStar, FiAlertCircle, FiMapPin
} from 'react-icons/fi';
import {
  MdAccessible, MdHearing, MdVisibility,
  MdFamilyRestroom, MdWifi, MdSignLanguage,
  MdSelfImprovement,
} from 'react-icons/md';
import { TbWheelchair, TbBraille, TbEar } from 'react-icons/tb';
import { DISTRICTS } from '../components/map/mapUtils';

/* ── Filter groups ── */
const FILTER_GROUPS = [
  {
    id: 'mobility', label: 'Harakatlanish', icon: <TbWheelchair className="w-4 h-4" />,
    options: [
      { key: 'wheelchair',        label: 'Nogironlar aravachasi',       param: 'wheelchair' },
      { key: 'accessibleRooms',   label: 'Maxsus moslashtirilgan xona', param: 'accessibleRooms' },
      { key: 'accessibleParking', label: 'Maxsus parking',              param: 'accessibleParking' },
    ],
  },
  {
    id: 'visual', label: "Ko'rish va yo'naltirish", icon: <MdVisibility className="w-4 h-4" />,
    options: [
      { key: 'tactilePaving',       label: "Taktil yo'lakchalar",        param: 'tactilePaving' },
      { key: 'highContrastSignage', label: 'Yuqori kontrastli belgilar', param: 'highContrastSignage' },
      { key: 'brailleSigns',        label: 'Brayl yozuvi',               param: 'brailleSigns' },
    ],
  },
  {
    id: 'auditory', label: 'Eshitish', icon: <MdHearing className="w-4 h-4" />,
    options: [
      { key: 'audioGuides',       label: "Ovozli yo'riqnomalar",   param: 'audioGuides' },
      { key: 'vibrationAlerts',   label: 'Vibro-signal tizimi',    param: 'vibrationAlerts' },
      { key: 'signLanguageStaff', label: 'Imo-ishora tili xodimi', param: 'signLanguageStaff' },
    ],
  },
  {
    id: 'cognitive', label: 'Kognitiv qulaylik', icon: <MdSelfImprovement className="w-4 h-4" />,
    options: [
      { key: 'quietZones',        label: 'Shovqinsiz hududlar',         param: 'quietZones' },
      { key: 'easyToReadSignage', label: 'Sodda piktogramma belgilari', param: 'easyToReadSignage' },
    ],
  },
  {
    id: 'family', label: 'Oila va keksalar', icon: <MdFamilyRestroom className="w-4 h-4" />,
    options: [
      { key: 'strollerAccessible',   label: "Bolalar aravachasi uchun yo'l", param: 'strollerAccessible' },
      { key: 'medicalServiceOnSite', label: 'Tibbiy yordam punkti',          param: 'medicalServiceOnSite' },
      { key: 'nursingRoom',          label: 'Ona va bola xonasi',            param: 'nursingRoom' },
    ],
  },
  {
    id: 'digital', label: 'Raqamli qulaylik', icon: <MdWifi className="w-4 h-4" />,
    options: [
      { key: 'offlineDataSupport', label: "Oflayn rejim (PWA)",         param: 'offlineDataSupport' },
      { key: 'lowDataMode',        label: 'Past internet rejimi',       param: 'lowDataMode' },
    ],
  },
];

const ALL_ACCESS_KEYS = FILTER_GROUPS.flatMap(g => g.options.map(o => o.key));

/* ── Skeleton card ── */
const Skeleton = () => (
  <div className="glass-panel overflow-hidden animate-pulse" style={{ borderRadius: '2rem' }}>
    <div className="h-52 shimmer" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-4 shimmer rounded-full w-3/4" />
      <div className="h-3 shimmer rounded-full w-1/2" />
      <div className="h-10 shimmer rounded-2xl w-full mt-2" />
    </div>
  </div>
);

/* ── Filter section wrapper ── */
const FilterSection = ({ label, icon, children }) => (
  <div className="glass-panel p-4" style={{ borderRadius: '1.25rem' }}>
    <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mb-3"
      style={{ color: '#6366f1' }}>
      {icon} {label}
    </p>
    {children}
  </div>
);

/* ── Accordion group ── */
const AccordionGroup = ({ group, filters, onToggle, openGroups, onToggleGroup }) => {
  const active = group.options.filter(o => filters.access[o.key]).length;
  const open   = !!openGroups[group.id];
  return (
    <div className="glass-panel overflow-hidden" style={{ borderRadius: '1.25rem' }}>
      <button
        type="button"
        onClick={() => onToggleGroup(group.id)}
        className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors"
        style={{ background: 'transparent' }}
      >
        <span className="flex items-center gap-2 text-sm font-bold" style={{ color: 'var(--text-main)' }}>
          <span style={{ color: 'var(--primary)' }}>{group.icon}</span>
          {group.label}
          {active > 0 && (
            <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-black">{active}</span>
          )}
        </span>
        {open
          ? <FiChevronUp className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
          : <FiChevronDown className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
        }
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 flex flex-col gap-2.5"
          style={{ borderTop: '1px solid var(--border)' }}>
          {group.options.map(opt => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer group transition-all">
              <div
                className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all"
                style={{
                  background: filters.access[opt.key] ? 'var(--primary)' : 'var(--bg-main)',
                  border: `2px solid ${filters.access[opt.key] ? 'var(--primary)' : 'var(--border)'}`,
                  boxShadow: filters.access[opt.key] ? '0 0 10px rgba(79,70,229,0.3)' : 'none'
                }}
              >
                {filters.access[opt.key] && <FiCheck className="w-3 h-3 text-white" />}
              </div>
              <input type="checkbox" className="sr-only"
                checked={!!filters.access[opt.key]}
                onChange={() => onToggle(opt.key)} />
              <span className="text-sm font-semibold leading-tight transition-colors group-hover:text-indigo-500" style={{ color: filters.access[opt.key] ? 'var(--primary)' : 'var(--text-muted)' }}>
                {opt.label}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Main ── */
const SearchPage = () => {
  const [searchParams]                  = useSearchParams();
  const [hotels, setHotels]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showFilters, setShowFilters]   = useState(false);
  const [totalHotels, setTotalHotels]   = useState(0);
  const [openGroups, setOpenGroups]     = useState({ mobility: true });

  const initAccess = () => {
    const init = {};
    ALL_ACCESS_KEYS.forEach(k => { init[k] = false; });
    (searchParams.getAll('accessibility') || []).forEach(k => { if (k in init) init[k] = true; });
    return init;
  };

  const [filters, setFilters] = useState({
    search:    searchParams.get('q')         || '',
    city:      searchParams.get('city')      || '',
    minRating: searchParams.get('minRating') || '',
    access:    initAccess(),
  });

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (filters.search)    p.set('search',    filters.search);
      if (filters.city)      p.set('city',      filters.city);
      if (filters.minRating) p.set('minRating', filters.minRating);
      // Accessibility filtrlari — backend ACC_MAP bilan mos keladi
      Object.entries(filters.access).forEach(([key, active]) => {
        if (active) {
          const opt = FILTER_GROUPS.flatMap(g => g.options).find(o => o.key === key);
          if (opt) p.set(opt.param, 'true');
        }
      });
      p.set('limit', '50'); // bir sahifada ko'p natija
      const res  = await api.get(`/hotels?${p.toString()}`);
      // Pagination formatini qo'llab-quvvatlash: { data, total } yoki oddiy array
      const data  = Array.isArray(res.data) ? res.data : (res.data.data || res.data.hotels || []);
      const total = res.data.total ?? data.length;
      setHotels(data);
      setTotalHotels(total);
    } catch (err) {
      console.error('[SearchPage] Qidiruv xatosi:', err.message);
      setHotels([]); setTotalHotels(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const set          = (key, val) => setFilters(p => ({ ...p, [key]: val }));
  const toggleAccess = key => setFilters(p => ({ ...p, access: { ...p.access, [key]: !p.access[key] } }));
  const clearFilters = () => setFilters({ search: '', city: '', minRating: '', access: initAccess() });
  const toggleGroup  = id => setOpenGroups(p => ({ ...p, [id]: !p[id] }));

  const activeCount = Object.values(filters.access).filter(Boolean).length
    + [filters.minRating, filters.city].filter(Boolean).length;

  const title = filters.search
    ? `"${filters.search}" natijalari`
    : filters.city
      ? `${filters.city} mehmonxonalari`
      : 'Barcha mehmonxonalar';

  /* ── Filter panel (shared between mobile drawer & desktop sidebar) ──
     MUHIM: bu komponent emas, balki JSX qiymati. `<FilterPanel/>` sifatida
     render qilinsa, har bosishda remount bo'lib input fokusi yo'qoladi.
     Shu sababli `{filterPanel}` ko'rinishida inline render qilinadi. */
  const filterPanel = (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
          <FiSliders className="w-4 h-4 text-indigo-500" /> Filtrlar
          {activeCount > 0 && (
            <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black">{activeCount}</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={clearFilters} className="text-xs font-bold text-rose-500 hover:underline">
              Tozalash
            </button>
          )}
          <button
            onClick={() => setShowFilters(false)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-full"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <FiX className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

      {/* Accessibility */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest mb-2 px-1"
          style={{ color: '#6366f1' }}>
          Maxsus qulayliklar
        </p>
        <div className="flex flex-col gap-2">
          {FILTER_GROUPS.map(group => (
            <AccordionGroup
              key={group.id}
              group={group}
              filters={filters}
              onToggle={toggleAccess}
              openGroups={openGroups}
              onToggleGroup={toggleGroup}
            />
          ))}
        </div>
      </div>

      {/* Tuman / Shahar */}
      <FilterSection label="Tuman / Shahar" icon={<FiMapPin className="w-3.5 h-3.5" />}>
        <div className="relative">
          <select
            value={filters.city || ''}
            onChange={e => set('city', e.target.value)}
            className="w-full px-4 py-2.5 text-sm font-semibold rounded-xl outline-none"
            style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
          >
            <option value="">Barcha tumanlar</option>
            {DISTRICTS.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </FilterSection>

      {/* Rating */}
      <FilterSection label="Minimal reyting" icon={<FiStar className="w-3.5 h-3.5" />}>
        <div className="flex flex-col gap-2">
          {[
            { v: '0.9', l: "9+ / 10 — A'lo",      icon: <FiAward    className="w-3.5 h-3.5 text-amber-500" /> },
            { v: '0.8', l: '8+ / 10 — Yaxshi',    icon: <FiThumbsUp className="w-3.5 h-3.5 text-blue-500"  /> },
            { v: '0.7', l: '7+ / 10 — Qoniqarli', icon: <FiSmile    className="w-3.5 h-3.5 text-green-500" /> },
          ].map(r => (
            <label key={r.v} className="flex items-center gap-3 cursor-pointer">
              <div
                className="rounded-full shrink-0 transition-all"
                style={{
                  width: 18, height: 18,
                  border: filters.minRating === r.v ? '5px solid var(--primary)' : '2px solid var(--border)',
                  background: 'var(--bg-card)',
                }}
              />
              <input type="radio" name="minRating" value={r.v} className="sr-only"
                checked={filters.minRating === r.v}
                onChange={e => set('minRating', e.target.value)} />
              <span className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: 'var(--text-main)' }}>
                {r.icon} {r.l}
              </span>
            </label>
          ))}
          {filters.minRating && (
            <button onClick={() => set('minRating', '')}
              className="text-xs font-bold text-rose-500 hover:underline text-left mt-1">
              Bekor qilish
            </button>
          )}
        </div>
      </FilterSection>

      {/* Apply (mobile) */}
      <button
        onClick={() => setShowFilters(false)}
        className="md:hidden w-full py-3.5 rounded-2xl font-extrabold text-sm text-white mt-2"
        style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}
      >
        {loading ? 'Qidirilmoqda...' : `${totalHotels} ta natijani ko'rish`}
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Mehmonxonalarni qidirish — Tourism for Everyone</title>
        <meta name="description" content="Navoiy viloyatidagi barcha inklyuziv mehmonxonalar, dam olish maskanlari va sanatoriylarni izlang va band qiling." />
      </Helmet>
      <div className="pb-28 md:pb-8 pt-3 sm:pt-4 px-4 max-w-7xl mx-auto min-h-screen">

      {/* ── Top bar ── */}
      <div className="flex items-center gap-2.5 mb-5">
        <BackButton />
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)', width: 18, height: 18 }} />
          <input
            type="search"
            placeholder="Mehmonxona yoki shahar..."
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            className="w-full pl-11 pr-5 font-bold outline-none transition-all bg-glass dark:bg-glass-dark backdrop-blur-md border border-glass-border shadow-sm text-slate-900 dark:text-white"
            style={{
              borderRadius: '2rem',
              height: 50,
              fontSize: 15,
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px var(--primary-light)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'var(--shadow-sm)'; }}
          />
        </div>
        {/* Mobile filter button */}
        <button
          onClick={() => setShowFilters(true)}
          className={`md:hidden relative flex items-center justify-center gap-1.5 px-4 rounded-2xl font-bold text-sm shrink-0 transition-all active:scale-95 press-effect ${
            activeCount > 0 ? 'bg-primary text-white border-transparent shadow-md shadow-primary/30' : 'bg-glass dark:bg-glass-dark backdrop-blur-md border border-glass-border text-slate-800 dark:text-slate-200'
          }`}
          style={{ height: 50, minWidth: 50 }}
        >
          <FiFilter className="w-4 h-4" />
          {activeCount > 0 && (
            <span className="text-xs font-black">{activeCount}</span>
          )}
        </button>
      </div>

      {/* ── Result title ── */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: 'var(--text-main)' }}>
            {title}
          </h1>
          <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
            {loading ? 'Qidirilmoqda...' : `${totalHotels} ta mehmonxona topildi`}
          </p>
        </div>
        {activeCount > 0 && (
          <button onClick={clearFilters}
            className="shrink-0 flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}>
            <FiX className="w-3.5 h-3.5" /> Filtrlarni tozalash
          </button>
        )}
      </div>

      <div className="flex gap-6">

        {/* ── Desktop sidebar ── */}
        <aside className="hidden md:block w-64 lg:w-72 shrink-0 sticky top-4 self-start max-h-[calc(100vh-6rem)] overflow-y-auto hide-scrollbar">
          {filterPanel}
        </aside>

        {/* ── Results ── */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="hotel-grid">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} />)}
            </div>
          ) : hotels.length > 0 ? (
            <div className="hotel-grid">
              {hotels.map(hotel => <HotelCard key={hotel._id} hotel={hotel} />)}
            </div>
          ) : (
            <div className="glass-panel flex flex-col items-center justify-center text-center py-20 px-6"
              style={{ borderRadius: '2rem' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                style={{ background: 'rgba(99,102,241,0.08)' }}>
                <FiAlertCircle className="w-9 h-9 text-indigo-300" />
              </div>
              <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-main)' }}>
                Hech narsa topilmadi
              </h2>
              <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
                Mavjud filtrlar bo'yicha mos mehmonxonalar yo'q. Boshqa shartlar kiritib ko'ring.
              </p>
              <button onClick={clearFilters}
                className="btn-primary px-7 py-3 rounded-2xl font-bold text-sm text-white">
                Filtrlarni tozalash
              </button>
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile filter drawer ── */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 z-[150] md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowFilters(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-[160] md:hidden rounded-t-[2rem] overflow-y-auto"
            style={{
              background: 'var(--bg-main)',
              maxHeight: '88vh',
              padding: '1.5rem 1rem 2rem',
              boxShadow: '0 -20px 60px -12px rgba(0,0,0,0.3)',
            }}
          >
            {/* Drag handle */}
            <div className="w-10 h-1 rounded-full mx-auto mb-5"
              style={{ background: 'var(--border)' }} />
            {filterPanel}
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default SearchPage;
