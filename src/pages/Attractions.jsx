import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AttractionCard from '../components/AttractionCard';
import BackButton from '../components/BackButton';
import { fetchAttractions, DISTRICTS } from '../services/attractions';
import { FiMapPin, FiFrown, FiAlertTriangle } from 'react-icons/fi';

const Skeleton = () => (
  <div className="glass-panel overflow-hidden animate-pulse" style={{ borderRadius: '1.5rem' }}>
    <div className="h-44 shimmer" />
    <div className="p-4 flex flex-col gap-3">
      <div className="h-4 shimmer rounded-full w-3/4" />
      <div className="h-3 shimmer rounded-full w-1/2" />
      <div className="h-8 shimmer rounded-2xl w-full mt-2" />
    </div>
  </div>
);

const Attractions = () => {
  const [params, setParams] = useSearchParams();
  const district = params.get('district') || '';
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetchAttractions(district ? { district } : {});
      setItems(Array.isArray(res) ? res : (res.data || []));
    } catch {
      setError('Tarixiy joylarni yuklashda xatolik yuz berdi.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [district]);

  useEffect(() => { load(); }, [load]);

  const setDistrict = (d) => {
    if (d) params.set('district', d); else params.delete('district');
    setParams(params, { replace: true });
  };

  return (
    <div className="pb-24 md:pb-8 px-4 max-w-7xl mx-auto pt-6">
      <div className="mb-5"><BackButton /></div>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl">🏛️</span>
        <h1 className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-main)' }}>Tarixiy joylar</h1>
      </div>
      <p className="text-sm font-medium mb-6" style={{ color: 'var(--text-muted)' }}>
        Navoiy viloyatining diqqatga sazovor joylari — 360° video, atrofidagi ko'rgazmalar va yaqin tunash maskanlari bilan.
      </p>

      {/* District filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button onClick={() => setDistrict('')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all press-effect"
          style={!district
            ? { background: 'var(--gradient-main)', color: '#fff', boxShadow: 'var(--shadow-colored)' }
            : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}>
          Barchasi
        </button>
        {DISTRICTS.map((d) => (
          <button key={d} onClick={() => setDistrict(d)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-sm transition-all press-effect"
            style={district === d
              ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff', boxShadow: '0 4px 14px -4px rgba(217,119,6,0.5)' }
              : { background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1.5px solid var(--border)' }}>
            <FiMapPin className="w-3.5 h-3.5" /> {d}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl p-4 mb-6 flex items-start gap-3"
          style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <FiAlertTriangle className="text-red-500 mt-0.5 shrink-0" />
          <p className="text-sm font-semibold text-red-500">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="hotel-grid">{[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}</div>
      ) : items.length > 0 ? (
        <div className="hotel-grid">
          {items.map((a) => <AttractionCard key={a._id} attraction={a} />)}
        </div>
      ) : !error ? (
        <div className="text-center py-20 glass-panel" style={{ borderRadius: '2rem' }}>
          <FiFrown className="mx-auto w-14 h-14 mb-4 text-gray-300" />
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-main)' }}>Tarixiy joy topilmadi</h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {district ? `${district} tumani bo'yicha hozircha joy yo'q.` : "Ma'lumot qo'shilishini kuting."}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default Attractions;
