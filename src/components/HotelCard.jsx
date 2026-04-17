import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiStar, FiMapPin, FiEye, FiZap } from 'react-icons/fi';

const HotelCard = ({ hotel }) => {
  const { user, favorites, toggleFavorite } = useContext(AuthContext);
  const isFav = favorites.includes(hotel._id);
  const [imgHovered, setImgHovered] = useState(false);

  const name = hotel.name || 'Nomi yo\'q';

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(hotel._id);
  };

  // Accessibility badges
  const accessBadges = [
    hotel.accessibility?.mobility?.wheelchairAccessible && { icon: '♿', label: 'Nogironlar aravachasi uchun moslashgan' },
    hotel.accessibility?.auditory?.audioGuides           && { icon: '🔔', label: 'Ovozli yo\'riqnoma mavjud' },
    hotel.accessibility?.cognitive?.quietZones           && { icon: '🧠', label: 'Shovqinsiz hudud mavjud' },
    hotel.familyAndElderly?.strollerAccessible           && { icon: '👨\u200d👩\u200d👧', label: 'Bolalar aravachasi uchun qulay' },
  ].filter(Boolean);

  // Check if hotel is "new" (created within last 7 days)
  const isNew = hotel.createdAt && (Date.now() - new Date(hotel.createdAt)) < 7 * 24 * 60 * 60 * 1000;

  return (
    <article
      className="glass-panel overflow-hidden group flex flex-col h-full relative border-0"
      aria-label={`${name} mehmonxonasi`}
      style={{ 
        transition: 'all 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
        borderRadius: '2rem',
        boxShadow: 'var(--shadow)',
        background: 'var(--bg-card)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
        e.currentTarget.style.boxShadow = '0 30px 60px -12px rgba(99, 102, 241, 0.25)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = 'var(--shadow)';
      }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{ height: '220px' }}
        onMouseEnter={() => setImgHovered(true)}
        onMouseLeave={() => setImgHovered(false)}
      >
        {/* Skeleton */}
        <div className="absolute inset-0 shimmer" aria-hidden="true" />

        <img
          src={hotel.image || hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800'}
          alt={`${name} mehmonxonasining tashqi ko'rinishi`}
          className="w-full h-full object-cover relative z-10"
          style={{ transition: 'transform 0.5s ease', transform: imgHovered ? 'scale(1.04)' : 'scale(1)' }}
          loading="lazy"
          width="800"
          height="220"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 z-20"
          style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(8,8,30,0.8) 100%)' }} />

        {/* Top badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-40">

          <div className="flex flex-col gap-2">
            {isNew && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg"
                style={{ background: 'rgba(16,185,129,0.9)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                <FiStar className="w-3 h-3 fill-current" /> Yangi
              </div>
            )}
          </div>

          {user && (
            <button
              onClick={handleFav}
              aria-label={isFav ? `${name} sevimlilardan olib tashlash` : `${name} sevimlilarga qo'shish`}
              aria-pressed={isFav}
              className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{
                background: isFav ? '#EF4444' : 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(12px)',
                border: `1px solid ${isFav ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.3)'}`,
                boxShadow: isFav ? '0 4px 16px -4px rgba(239,68,68,0.5)' : 'none',
                color: 'white',
              }}
            >
              <FiHeart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} aria-hidden="true" />
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

        {/* Quick view overlay on hover */}
        <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: 'rgba(0,0,0,0.15)' }}>
          <Link
            to={`/hotel/${hotel._id}`}
            aria-label={`${name} mehmonxonasini batafsil ko'rish`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold text-white"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={e => e.stopPropagation()}>
            <FiEye className="w-4 h-4" aria-hidden="true" /> Ko'rish
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="mb-3">
          <h3
            className="font-extrabold text-gray-900 dark:text-white text-base sm:text-lg line-clamp-1 mb-1"
            style={{ transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#6366F1'}
            onMouseLeave={e => e.currentTarget.style.color = ''}>
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
            <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate font-medium">{hotel.city}{hotel.country ? `, ${hotel.country}` : ''}</span>
          </div>
        </div>

        {/* Accessibility badges */}
        {accessBadges.length > 0 && (
          <div className="flex gap-1.5 mb-3" aria-label="Maxsus qulayliklar">
            {accessBadges.map(b => (
              <span
                key={b.icon}
                title={b.label}
                aria-label={b.label}
                className="text-base leading-none"
                role="img"
              >
                {b.icon}
              </span>
            ))}
          </div>
        )}

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
        <div
          className="mt-auto pt-5 flex items-center justify-between"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <div>
            <span className="block text-[10px] uppercase font-black tracking-widest mb-1 opacity-60">Bir kecha uchun</span>
            <div className="flex items-baseline gap-1" aria-label={`Narx: ${new Intl.NumberFormat('uz-UZ').format(Number(hotel.pricePerNight || hotel.basePricePerNight || hotel.rooms?.[0]?.pricePerNight || 0) || 0)} so'm`}>
              <span className="font-black text-2xl" style={{ color: 'var(--primary)' }}>
                {new Intl.NumberFormat('uz-UZ').format(Number(hotel.pricePerNight || hotel.basePricePerNight || hotel.rooms?.[0]?.pricePerNight || 0) || 0)}
              </span>
              <span className="text-xs font-bold opacity-60" aria-hidden="true">UZS</span>
            </div>
          </div>
          <Link
            to={`/hotel/${hotel._id}`}
            aria-label={`${name} mehmonxonasini batafsil ko'rish`}
            className="btn-primary w-12 h-12 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg"
            style={{ textDecoration: 'none' }}
          >
            <FiZap className="w-5 h-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
