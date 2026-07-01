import React from 'react';
import { FiLoader, FiArrowLeft } from 'react-icons/fi';
import { MdMyLocation } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const MapTopBar = ({
  filteredCount,
  filterCat,
  setFilterCat,
  FILTERS,
  districtFilter,
  setDistrictFilter,
  DISTRICT_FILTERS = [],
  geoLoading,
  setGeoLoading,
  setUserPos,
  NAVOIY_CENTER,
  setFlyTarget,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className="pointer-events-auto w-full bg-white dark:bg-[#0f172a] transition-all"
    >
      {/* Row 1: Back + Title + Location count */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
        >
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <h1 className="text-[17px] font-bold truncate leading-tight text-slate-900 dark:text-white">
            Xarita
          </h1>
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredCount} ta joy
          </p>
        </div>
        {/* My location FAB */}
        <button
          onClick={() => {
            setGeoLoading(true);
            const t = setTimeout(() => {
              setUserPos(NAVOIY_CENTER);
              setGeoLoading(false);
              setFlyTarget(NAVOIY_CENTER);
            }, 5000);
            navigator.geolocation.getCurrentPosition(
              pos => {
                clearTimeout(t);
                const p = [pos.coords.latitude, pos.coords.longitude];
                setUserPos(p);
                setGeoLoading(false);
                setFlyTarget(p);
              },
              () => {
                clearTimeout(t);
                setUserPos(NAVOIY_CENTER);
                setGeoLoading(false);
                setFlyTarget(NAVOIY_CENTER);
              },
              { timeout: 4000, enableHighAccuracy: false }
            );
          }}
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400"
        >
          {geoLoading ? (
            <FiLoader className="w-5 h-5 animate-spin" />
          ) : (
            <MdMyLocation className="w-[18px] h-[18px]" />
          )}
        </button>
      </div>

      {/* Row 2: Tur (kategoriya) filtri */}
      <div
        className="flex gap-2 px-4 pb-2 pt-1 overflow-x-auto hide-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {FILTERS.map(f => {
          const isActive = filterCat === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilterCat(f.key)}
              className={`shrink-0 text-[13px] font-semibold px-4 py-2 rounded-full transition-colors ${
                isActive
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              style={{
                scrollSnapAlign: 'start',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Row 3: Tuman filtri (3 tuman) */}
      {DISTRICT_FILTERS.length > 0 && (
        <div
          className="flex items-center gap-2 px-4 pb-4 pt-0.5 overflow-x-auto hide-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <span className="shrink-0 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-0.5">Tuman:</span>
          {DISTRICT_FILTERS.map(d => {
            const isActive = districtFilter === d.key;
            return (
              <button
                key={d.key}
                onClick={() => setDistrictFilter(d.key)}
                className={`shrink-0 text-[12px] font-bold px-3.5 py-1.5 rounded-full border transition-colors ${
                  isActive
                    ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                    : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-amber-300 dark:hover:border-amber-700'
                }`}
                style={{ scrollSnapAlign: 'start' }}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MapTopBar;
