import React from 'react';
import { FiLoader } from 'react-icons/fi';
import { MdMyLocation } from 'react-icons/md';
import BackButton from '../BackButton';

const MapTopBar = ({
  filteredCount,
  filterCat,
  setFilterCat,
  FILTERS,
  geoLoading,
  setGeoLoading,
  setUserPos,
  NAVOIY_CENTER,
  setFlyTarget,
}) => {
  return (
    <div
      className="shrink-0 z-[500]"
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid var(--border)',
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* Row 1: Back + Title + Location count */}
      <div className="flex items-center gap-2 px-3 pt-2 pb-1.5">
        <BackButton className="static shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-extrabold truncate" style={{ color: 'var(--text-main)' }}>
            Mehmonxonalar xaritasi
          </p>
          <p className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
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
          className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: '#6366f1',
            minHeight: 'unset',
            minWidth: 'unset',
          }}
        >
          {geoLoading ? (
            <FiLoader style={{ width: 16, height: 16 }} className="animate-spin" />
          ) : (
            <MdMyLocation style={{ width: 18, height: 18 }} />
          )}
        </button>
      </div>

      {/* Row 2: Filter chips */}
      <div
        className="flex gap-2 px-3 pb-2.5 overflow-x-auto hide-scrollbar"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilterCat(f.key)}
            className="shrink-0 text-[11px] font-bold px-3 py-1.5 rounded-full transition-all active:scale-95"
            style={{
              scrollSnapAlign: 'start',
              background: filterCat === f.key ? 'var(--gradient-main)' : 'var(--bg-card)',
              color: filterCat === f.key ? 'white' : 'var(--text-muted)',
              border: `1px solid ${filterCat === f.key ? 'transparent' : 'var(--border)'}`,
              minHeight: 'unset',
              minWidth: 'unset',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapTopBar;
