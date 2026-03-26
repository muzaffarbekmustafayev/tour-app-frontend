import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiStar, FiMapPin } from 'react-icons/fi';

const HotelCard = ({ hotel }) => {
  const { user, favorites, toggleFavorite } = useContext(AuthContext);
  const isFav = favorites.includes(hotel._id);

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(hotel._id);
  };

  return (
    <div className="glass-panel overflow-hidden group flex flex-col h-full relative"
      style={{ transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-8px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '220px' }}>
        {/* Skeleton */}
        <div className="absolute inset-0 shimmer" />

        <img
          src={hotel.image || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'}
          alt={hotel.name}
          className="w-full h-full object-cover relative z-10"
          style={{ transition: 'transform 0.7s ease' }}
          loading="lazy"
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-20"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(8,8,30,0.8) 100%)' }} />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-30">
          <div className="flex flex-col gap-1.5">
            {hotel.roomsAvailable !== undefined && hotel.roomsAvailable <= 3 && hotel.roomsAvailable > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse"
                style={{ background: 'rgba(239,68,68,0.85)', backdropFilter: 'blur(8px)', border: '1px solid rgba(248,113,113,0.5)', color: 'white' }}>
                🔥 {hotel.roomsAvailable} ta qoldi
              </div>
            )}
          </div>

          {user && (
            <button onClick={handleFav}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: isFav ? '#EF4444' : 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${isFav ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.3)'}`,
                boxShadow: isFav ? '0 4px 16px -4px rgba(239,68,68,0.5)' : 'none',
                color: 'white',
              }}
            >
              <FiHeart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>

        {/* Rating badge */}
        {hotel.rating > 0 && (
          <div className="absolute bottom-3 left-3 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: '#F59E0B' }}>
              <FiStar className="w-3 h-3 text-white fill-current" />
            </div>
            <span className="text-sm font-black text-white">{hotel.rating?.toFixed?.(1) || hotel.rating}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3 className="font-extrabold text-gray-900 dark:text-white text-lg line-clamp-1 mb-1"
            style={{ transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#6366F1'}
            onMouseLeave={e => e.currentTarget.style.color = ''}>
            {hotel.name}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-medium">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
          </div>
        </div>

        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hotel.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.15)' }}>
                {a}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'rgba(99,102,241,0.08)', color: '#6366F1', border: '1px solid rgba(99,102,241,0.15)' }}>
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Price & CTA */}
        <div className="mt-auto pt-4 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}>
          <div>
            <span className="block text-[10px] uppercase font-black tracking-widest mb-0.5"
              style={{ color: 'var(--text-muted)' }}>Bir kecha</span>
            <div className="flex items-baseline gap-1">
              <span className="font-black text-2xl" style={{ color: '#6366F1' }}>
                {new Intl.NumberFormat('uz-UZ').format(Number(hotel.pricePerNight || hotel.basePricePerNight || hotel.rooms?.[0]?.pricePerNight || 0) || 0)}
              </span>
              <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>UZS</span>
            </div>
          </div>
          <Link to={`/hotel/${hotel._id}`}
            className="btn-primary px-5 py-2.5 rounded-2xl text-sm font-bold"
            style={{ textDecoration: 'none' }}>
            Ko'rish →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
