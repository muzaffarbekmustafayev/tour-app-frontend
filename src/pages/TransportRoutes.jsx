import React, { useState, useMemo } from 'react';
import BackButton from '../components/BackButton';
import {
  FiMapPin, FiClock, FiNavigation, FiChevronDown, FiChevronUp,
  FiSearch, FiInfo, FiArrowRight, FiTruck, FiPackage, FiMap
} from 'react-icons/fi';

/* ─── NAVOIY SHAHRI TRANSPORT MARSHRUTLARI ──────────────── */
const ROUTES_DATA = [
  {
    id: 1,
    number: '1',
    name: 'Markaziy bozor — Navoi GES',
    type: 'avtobus',
    color: '#4F46E5',
    interval: '10-15 daqiqa',
    workTime: '06:00 – 22:00',
    price: '1 500 UZS',
    stops: [
      'Markaziy bozor', 'Navoi ko\'chasi', 'Turon maydon', 'Jayhun ko\'chasi',
      'Poliklinika', 'Navoiy shahri hokimiyati', 'Yoshlar markazi',
      "Bog' ko'chasi", 'Navoi GES',
    ],
  },
  {
    id: 2,
    number: '2',
    name: 'Temir yo\'l vokzali — Qiziltepa',
    type: 'avtobus',
    color: '#EC4899',
    interval: '15-20 daqiqa',
    workTime: '06:00 – 21:00',
    price: '2 000 UZS',
    stops: [
      'Temir yo\'l vokzali', 'Avtovokzal', 'Markaziy bozor',
      'Navoi ko\'chasi', 'Mustaqillik maydoni', 'Kimyo zavodi',
      "O'quv markazi", 'Qiziltepa yo\'li', 'Qiziltepa',
    ],
  },
  {
    id: 3,
    number: '3',
    name: 'Aeroport — Zarafshon yo\'li',
    type: 'mikroavtobus',
    color: '#F59E0B',
    interval: '12-18 daqiqa',
    workTime: '06:30 – 21:30',
    price: '2 000 UZS',
    stops: [
      'Navoi aeroporti', 'Aeroport ko\'chasi', '1-KMR', 'Markaziy bozor',
      'Kosmonavtlar ko\'chasi', 'Navoi KMK', 'Sanoat zonasi',
      'Zarafshon yo\'li',
    ],
  },
  {
    id: 4,
    number: '5',
    name: 'Yangi shahar — Eski shahar',
    type: 'avtobus',
    color: '#10B981',
    interval: '8-12 daqiqa',
    workTime: '06:00 – 22:30',
    price: '1 500 UZS',
    stops: [
      'Yangi shahar tumani', '5-KMR', '4-KMR', '3-KMR',
      'Turon maydoni', 'Alisher Navoiy haykali', 'Markaziy bozor',
      'Eski shahar bozori', 'Eski shahar',
    ],
  },
  {
    id: 5,
    number: '7',
    name: 'Olmaliq — Navoi shaharchasi',
    type: 'mikroavtobus',
    color: '#8B5CF6',
    interval: '20-25 daqiqa',
    workTime: '07:00 – 20:00',
    price: '2 500 UZS',
    stops: [
      'Olmaliq mahallasi', 'Do\'stlik ko\'chasi', 'Bunyodkor ko\'chasi',
      'Markaziy kasalxona', 'Turon maydoni', 'Navoi KMK',
      'Navoi shaharchasi',
    ],
  },
  {
    id: 6,
    number: '10',
    name: 'Avtovokzal — Langar tumani',
    type: 'avtobus',
    color: '#EF4444',
    interval: '25-35 daqiqa',
    workTime: '06:30 – 19:30',
    price: '3 000 UZS',
    stops: [
      'Avtovokzal', 'Markaziy bozor', 'Navoi shahri chiqishi',
      'Konimex zavodi', 'Langar qishlog\'i', 'Langar Resort',
      'Langar tumani',
    ],
  },
  {
    id: 7,
    number: '12',
    name: '2-KMR — Sanoat zonasi',
    type: 'mikroavtobus',
    color: '#0EA5E9',
    interval: '10-15 daqiqa',
    workTime: '06:00 – 21:00',
    price: '1 500 UZS',
    stops: [
      '2-KMR', 'Maktab ko\'chasi', 'Bolalar bog\'chasi',
      'Turon maydoni', 'Poliklinika', 'Oziq-ovqat bozori',
      'Navoi KMK', 'Sanoat zonasi',
    ],
  },
  {
    id: 8,
    number: '15',
    name: 'Temir yo\'l — Konimex',
    type: 'avtobus',
    color: '#D946EF',
    interval: '15-20 daqiqa',
    workTime: '06:00 – 20:00',
    price: '2 000 UZS',
    stops: [
      'Temir yo\'l vokzali', 'Avtovokzal', 'Turon maydoni',
      'Mustaqillik ko\'chasi', 'Kimyo zavodi',
      'Konimex zavodi', 'Konimex shaharchasi',
    ],
  },
];

const typeLabels = {
  avtobus: { label: 'Avtobus', icon: <FiTruck className="w-3 h-3" /> },
  mikroavtobus: { label: 'Mikroavtobus', icon: <FiPackage className="w-3 h-3" /> },
};

/* ─── ROUTE CARD ────────────────────────────────────────── */
const RouteCard = ({ route }) => {
  const [expanded, setExpanded] = useState(false);
  const typeInfo = typeLabels[route.type] || typeLabels.avtobus;

  return (
    <div
      className="glass-panel overflow-hidden transition-all"
      style={{ borderRadius: '1.5rem', borderLeft: `4px solid ${route.color}` }}
    >
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(prev => !prev)}
        className="w-full text-left p-5 flex items-start gap-4 transition-colors hover:bg-gray-50/40 dark:hover:bg-white/[0.03]"
        style={{ cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
      >
        {/* Route Number */}
        <div
          className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
          style={{ background: route.color, boxShadow: `0 6px 18px -4px ${route.color}55` }}
        >
          {route.number}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-base mb-1" style={{ color: 'var(--text-main)' }}>
            {route.name}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: `${route.color}15`, color: route.color, border: `1px solid ${route.color}25` }}
            >
              {typeInfo.icon} {typeInfo.label}
            </span>
            <span
              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <FiClock className="w-3 h-3" /> {route.interval}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
            <span className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" /> {route.workTime}
            </span>
            <span>•</span>
            <span className="font-bold" style={{ color: '#10B981' }}>{route.price}</span>
          </div>
        </div>

        {/* Expand toggle */}
        <div
          className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-1 transition-colors"
          style={{ background: expanded ? `${route.color}15` : 'rgba(99,102,241,0.06)', color: expanded ? route.color : 'var(--text-muted)' }}
        >
          {expanded ? <FiChevronUp className="w-5 h-5" /> : <FiChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {/* Stops — expandable */}
      {expanded && (
        <div className="px-5 pb-5 animate-fade-in">
          <div className="border-t pt-4 mb-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5"
              style={{ color: 'var(--text-muted)' }}>
              <FiNavigation className="w-3.5 h-3.5" /> Yo'nalish bekatlar ({route.stops.length} ta)
            </p>
          </div>

          <div className="relative pl-6">
            {/* Vertical line */}
            <div
              className="absolute left-[9px] top-1 bottom-1 w-[2px] rounded-full"
              style={{ background: `linear-gradient(to bottom, ${route.color}, ${route.color}40)` }}
            />

            {route.stops.map((stop, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === route.stops.length - 1;

              return (
                <div key={idx} className="relative flex items-center gap-3 mb-3 last:mb-0">
                  {/* Dot */}
                  <div
                    className="absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center z-10"
                    style={{
                      background: (isFirst || isLast) ? route.color : 'var(--bg-card)',
                      border: (isFirst || isLast) ? 'none' : `2px solid ${route.color}`,
                      boxShadow: (isFirst || isLast) ? `0 3px 10px -3px ${route.color}77` : 'none',
                    }}
                  >
                    {(isFirst || isLast) && (
                      <FiMapPin className="w-2.5 h-2.5 text-white" />
                    )}
                  </div>

                  {/* Stop name */}
                  <span
                    className={`text-sm ${(isFirst || isLast) ? 'font-extrabold' : 'font-medium'}`}
                    style={{ color: (isFirst || isLast) ? route.color : 'var(--text-main)' }}
                  >
                    {stop}
                  </span>

                  {/* Arrow between stops */}
                  {!isLast && (
                    <FiArrowRight
                      className="w-3 h-3 ml-auto flex-shrink-0"
                      style={{ color: 'var(--text-muted)', opacity: 0.3 }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── MAIN PAGE ─────────────────────────────────────────── */
const TransportRoutes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredRoutes = useMemo(() => {
    return ROUTES_DATA.filter(route => {
      const matchesSearch =
        !searchQuery ||
        route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        route.number.includes(searchQuery) ||
        route.stops.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || route.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [searchQuery, filterType]);

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto min-h-screen lg:pl-32">

      <div className="mb-4"><BackButton /></div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black mb-1.5" style={{ color: 'var(--text-main)' }}>
          <FiTruck className="w-7 h-7 text-indigo-500" /> Shaharda yo'nalishlar
        </h1>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
          Navoiy shahri jamoat transporti yo'nalishlari va bekatlar
        </p>
      </div>

      {/* Info Banner */}
      <div
        className="glass-panel p-4 mb-6 flex items-start gap-3"
        style={{ borderRadius: '1.25rem', borderLeft: '4px solid #6366F1' }}
      >
        <FiInfo className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          <p className="font-bold mb-0.5" style={{ color: 'var(--text-main)' }}>Ma'lumot</p>
          Yo'nalishlar taxminiy. Haqiqiy vaqt va interval ob-havo va harakatga qarab
          o'zgarishi mumkin. Narxlar so'nggi yangilanish bo'yicha.
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <FiSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Yo'nalish yoki bekat qidirish..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-5 py-3.5 bg-white dark:bg-[#1e293b] font-bold text-sm outline-none"
          style={{
            borderRadius: '2rem',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--text-main)',
          }}
          onFocus={e => {
            e.target.style.borderColor = '#6366F1';
            e.target.style.boxShadow = 'var(--shadow)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = 'var(--shadow-sm)';
          }}
        />
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto hide-scrollbar pb-1">
        {[
          { key: 'all', label: 'Barchasi', icon: <FiMap className="w-3.5 h-3.5" /> },
          { key: 'avtobus', label: 'Avtobuslar', icon: <FiTruck className="w-3.5 h-3.5" /> },
          { key: 'mikroavtobus', label: 'Mikroavtobuslar', icon: <FiPackage className="w-3.5 h-3.5" /> },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
            style={{
              background: filterType === f.key ? 'var(--gradient-main)' : 'var(--bg-card)',
              color: filterType === f.key ? 'white' : 'var(--text-main)',
              border: `1px solid ${filterType === f.key ? 'transparent' : 'var(--border)'}`,
              boxShadow: filterType === f.key ? 'var(--shadow-colored)' : 'var(--shadow-sm)',
            }}
          >
            <span>{f.icon}</span> {f.label}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
        {filteredRoutes.length} ta yo'nalish topildi
      </p>

      {/* Route Cards */}
      <div className="space-y-4">
        {filteredRoutes.length > 0 ? (
          filteredRoutes.map(route => <RouteCard key={route.id} route={route} />)
        ) : (
          <div className="glass-panel flex flex-col items-center justify-center text-center py-16 px-4" style={{ borderRadius: '1.5rem' }}>
            <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-5">
              <FiSearch className="w-8 h-8 text-indigo-300" />
            </div>
            <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-main)' }}>
              Yo'nalish topilmadi
            </h3>
            <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--text-muted)' }}>
              Bu bekat yoki yo'nalish bo'yicha natija topilmadi. Boshqa qidiruvni sinab ko'ring.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setFilterType('all'); }}
              className="btn-primary px-6 py-2.5 rounded-2xl text-sm font-bold"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransportRoutes;
