import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import BackButton from '../components/BackButton';
import { FiHeart, FiTrash2, FiSearch, FiMapPin, FiStar, FiZap } from 'react-icons/fi';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { imgSrc } from '../utils/media';

/* ── Skeleton card ── */
const SkeletonCard = () => (
  <div className="glass-panel overflow-hidden animate-pulse" style={{ borderRadius: '2rem' }}>
    <div className="h-52 shimmer" />
    <div className="p-5 flex flex-col gap-3">
      <div className="h-4 shimmer rounded-full w-3/4" />
      <div className="h-3 shimmer rounded-full w-1/2" />
      <div className="h-3 shimmer rounded-full w-1/3 mt-2" />
    </div>
  </div>
);

/* ── Hotel card (inline, no dependency on HotelCard) ── */
const FavCard = ({ hotel, onRemove }) => {
  const name = (hotel.name || 'Nomi yo\'q');

  const img = imgSrc(hotel.images?.[0]);

  return (
    <article
      className="glass-panel overflow-hidden flex flex-col group relative"
      style={{ borderRadius: '2rem', transition: 'all 0.35s cubic-bezier(0.25,1,0.5,1)' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = '0 24px 48px -12px rgba(99,102,241,0.22)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: 200 }}>
        <img
          src={img}
          alt={name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(8,8,30,0.75) 100%)' }} />

        {/* Rating */}
        {hotel.rating > 0 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center bg-amber-400">
              <FiStar className="w-3 h-3 text-white fill-current" />
            </div>
            <span className="text-sm font-black text-white">{hotel.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Stars */}
        {hotel.stars > 0 && (
          <div className="absolute top-3 left-3 flex items-center gap-0.5">
            {Array.from({ length: hotel.stars }).map((_, i) => (
              <FiStar key={i} className="w-3 h-3 text-amber-400 fill-current" style={{ fill: '#fbbf24' }} />
            ))}
          </div>
        )}

        {/* Remove button */}
        <button
          onClick={() => onRemove(hotel._id)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{
            background: 'rgba(239,68,68,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            minHeight: 36, minWidth: 36,
          }}
          title="Sevimlilardan olib tashlash"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-extrabold text-base mb-1 line-clamp-1" style={{ color: 'var(--text-main)' }}>
          {name}
        </h3>
        <div className="flex items-center gap-1.5 mb-3">
          <FiMapPin className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
          <span className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>
            {hotel.city}{hotel.country ? `, ${hotel.country}` : ''}
          </span>
        </div>

        {/* Amenities */}
        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>
                {a}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}>
          <Link
            to={`/hotel/${hotel._id}`}
            className="btn-primary flex-1 h-11 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-white transition-all active:scale-95 shadow-lg"
          >
            <FiZap className="w-4 h-4" /> Batafsil ko'rish
          </Link>
        </div>
      </div>
    </article>
  );
};

/* ── Main page ── */
const Favorites = () => {
  const [hotels, setHotels]   = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate              = useNavigate();
  const { toggleFavorite }    = useContext(AuthContext);

  useEffect(() => {
    const t = setTimeout(async () => {
      try {
        const res = await api.get('/auth/favorites');
        setHotels(res.data.filter(Boolean));
      } catch {
        setHotels([]);
      } finally {
        setLoading(false);
      }
    }, 150);
    return () => clearTimeout(t);
  }, []);

  const handleRemove = (hotelId) => {
    toggleFavorite(hotelId);
    setHotels(prev => prev.filter(h => h._id !== hotelId));
  };

  return (
    <div className="pb-28 md:pb-8 pt-4 px-4 max-w-7xl mx-auto min-h-screen lg:pl-32">

      {/* Header */}
      <div className="mb-8">
        <BackButton className="mb-3" />
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-black flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <FiHeart className="w-7 h-7 text-rose-500" style={{ fill: '#f43f5e' }} />
              Sevimlilar
            </h1>
            <p className="text-sm font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
              {loading ? 'Yuklanmoqda...' : `${hotels.length} ta saqlangan mehmonxona`}
            </p>
          </div>

          {!loading && hotels.length > 0 && (
            <span
              className="text-xs font-black px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(244,63,94,0.1)', color: '#f43f5e', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              {hotels.length} ta
            </span>
          )}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Cards */}
      {!loading && hotels.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(hotel => (
            <FavCard key={hotel._id} hotel={hotel} onRemove={handleRemove} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && hotels.length === 0 && (
        <div className="flex flex-col items-center justify-center mt-16 px-4">
          <div
            className="w-28 h-28 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(244,63,94,0.08)', border: '2px dashed rgba(244,63,94,0.25)' }}
          >
            <FiHeart className="w-12 h-12 text-rose-300" strokeWidth={1.5} />
          </div>
          <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--text-main)' }}>
            Hali hech narsa saqlanmagan
          </h3>
          <p className="text-sm font-medium text-center max-w-xs mb-8" style={{ color: 'var(--text-muted)' }}>
            Yoqtirgan mehmonxonangizni saqlash uchun kartochkadagi yurak belgisini bosing.
          </p>
          <button
            onClick={() => navigate('/search')}
            className="btn-primary flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white"
          >
            <FiSearch className="w-4 h-4" />
            Mehmonxonalarni ko'rish
          </button>
        </div>
      )}
    </div>
  );
};

export default Favorites;
