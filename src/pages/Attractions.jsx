import React, { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useSearchParams } from 'react-router-dom';
import AttractionCard from '../components/AttractionCard';
import BackButton from '../components/BackButton';
import { fetchAttractions, DISTRICTS } from '../services/attractions';
import {
  FiMapPin, FiFrown, FiAlertTriangle, FiSearch, FiLayers, FiX
} from 'react-icons/fi';
import { LuLandmark, LuHospital, LuTrees, LuBuilding2 } from 'react-icons/lu';
import { FaMosque, FaMountain, FaShoppingBag, FaShieldAlt, FaTheaterMasks, FaPlane } from 'react-icons/fa';

const Skeleton = () => (
  <div className="glass-panel overflow-hidden animate-pulse rounded-2xl">
    <div className="h-44 shimmer" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 shimmer rounded-full w-3/4" />
      <div className="h-3 shimmer rounded-full w-1/2" />
      <div className="h-8 shimmer rounded-xl w-full mt-2" />
    </div>
  </div>
);

const CATEGORY_TABS = [
  { key: 'all', label: 'Barchasi', icon: FiLayers },
  { key: 'tarixiy', label: 'Tarixiy Obidalar', icon: LuLandmark },
  { key: 'ziyoratgoh', label: 'Ziyoratgohlar', icon: FaMosque },
  { key: 'madaniy', label: 'Madaniy Markazlar', icon: FaTheaterMasks },
  { key: 'tabiat', label: 'Tabiat & Tog\'lar', icon: FaMountain },
  { key: 'istirohat_bogi', label: 'Bog\'lar & Ko\'llar', icon: LuTrees },
  { key: 'kasalxona', label: 'Kasalxona (24/7)', icon: LuHospital },
  { key: 'iib', label: 'IIB / Xavfsizlik', icon: FaShieldAlt },
  { key: 'hokimiyat', label: 'Hokimiyat', icon: LuBuilding2 },
  { key: 'transport', label: 'Vokzal & Aeroport', icon: FaPlane },
  { key: 'savdo', label: 'Bozor & Savdo', icon: FaShoppingBag },
];

const Attractions = () => {
  const [params, setParams] = useSearchParams();
  const district = params.get('district') || '';
  const category = params.get('category') || 'all';
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const queryPayload = { limit: 100 };
      if (district) queryPayload.district = district;
      if (category && category !== 'all') queryPayload.category = category;
      const res = await fetchAttractions(queryPayload);
      setItems(Array.isArray(res) ? res : (res.data || []));
    } catch {
      setError('Obyektlarni yuklashda xatolik yuz berdi.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [district, category]);

  useEffect(() => { load(); }, [load]);

  const setDistrict = (d) => {
    if (d) params.set('district', d); else params.delete('district');
    setParams(params, { replace: true });
  };

  const setCategory = (c) => {
    if (c && c !== 'all') params.set('category', c); else params.delete('category');
    setParams(params, { replace: true });
  };

  const filteredItems = items.filter(it => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (it.name && it.name.toLowerCase().includes(q)) ||
      (it.district && it.district.toLowerCase().includes(q)) ||
      (it.descriptionShort && it.descriptionShort.toLowerCase().includes(q))
    );
  });

  return (
    <>
      <Helmet>
        <title>Diqqatga Sazovor Joylar va Xizmatlar — Navoiy Viloyati</title>
        <meta name="description" content="Navoiy shahri, Nurota, Xatirchi va Qiziltepadagi tarixiy obidalar, muqaddas ziyoratgohlar, shifoxonalar va bozorlar." />
      </Helmet>

      <div className="pb-24 md:pb-12 px-4 max-w-7xl mx-auto pt-6 space-y-6">
        <div className="flex items-center justify-between">
          <BackButton />
          <span className="text-xs font-bold text-slate-400">
            Jami: <strong className="text-slate-900 dark:text-white font-black">{filteredItems.length}</strong> ta obyekt
          </span>
        </div>

        {/* Title Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LuLandmark className="w-7 h-7 text-amber-500 shrink-0" />
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              Diqqatga Sazovor Maskanlar & Xizmatlar
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Navoiy viloyatining tarixiy obidalari, ziyoratgohlari, shoshilinch xizmatlari va savdo maskanlari bilan tanishing.
          </p>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Obyekt nomi yoki kalit so'z bo'yicha qidirish..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <FiX className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORY_TABS.map((tab) => {
              const Icon = tab.icon;
              const isSelected = category === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setCategory(tab.key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* District Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 mr-1 shrink-0">Tuman:</span>
            <button
              type="button"
              onClick={() => setDistrict('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shrink-0 ${
                !district
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Barcha tumanlar
            </button>
            {DISTRICTS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDistrict(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shrink-0 flex items-center gap-1 ${
                  district === d
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <FiMapPin className="w-3 h-3 text-rose-500" />
                <span>{d}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-2xl p-4 flex items-start gap-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 text-rose-600">
            <FiAlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} />)}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((a) => (
              <AttractionCard key={a._id} attraction={a} />
            ))}
          </div>
        ) : !error ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <FiFrown className="mx-auto w-14 h-14 mb-3 text-slate-300 dark:text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Mos obyekt topilmadi</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Qidiruv so'zini o'zgartirib yoki boshqa tuman / toifani tanlab ko'ring.
            </p>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default Attractions;
