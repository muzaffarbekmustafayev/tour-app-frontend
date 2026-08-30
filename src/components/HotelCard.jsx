import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiHeart, FiStar, FiMapPin, FiArrowRight } from 'react-icons/fi';
import {
  MdAccessible, MdFamilyRestroom, MdLocalHospital, MdSignLanguage, MdElectricBolt,
} from 'react-icons/md';
import { TbWheelchair, TbEar, TbBraille, TbHandStop } from 'react-icons/tb';
import { calcAccessibilityScore, getScoreStyle } from '../utils/accessibilityScore';
import { imgSrc, FALLBACK_HOTEL } from '../utils/media';
import SafeImage from './SafeImage';

const HotelCard = ({ hotel }) => {
  const { user, favorites, toggleFavorite } = useContext(AuthContext);
  const isFav = favorites?.includes(hotel._id);

  const name = hotel.name || "Nomi yo'q";

  const handleFav = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(hotel._id);
  };

  const accessBadges = [
    hotel.accessibility?.mobility?.wheelchairAccessible && {
      icon: <TbWheelchair className="w-3.5 h-3.5" />, label: 'Nogironlar aravachasi',
      color: '#6366f1', bg: 'rgba(99,102,241,0.12)',
    },
    hotel.accessibility?.mobility?.elevator && {
      icon: <MdElectricBolt className="w-3.5 h-3.5" />, label: 'Lift mavjud',
      color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)',
    },
    hotel.accessibility?.auditory?.audioGuides && {
      icon: <TbEar className="w-3.5 h-3.5" />, label: "Ovozli yo'riqnoma",
      color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)',
    },
    hotel.accessibility?.auditory?.signLanguageStaff && {
      icon: <MdSignLanguage className="w-3.5 h-3.5" />, label: 'Imo-ishora tili',
      color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',
    },
    hotel.accessibility?.visual?.brailleSigns && {
      icon: <TbBraille className="w-3.5 h-3.5" />, label: 'Brayl yozuvi',
      color: '#10b981', bg: 'rgba(16,185,129,0.12)',
    },
    hotel.accessibility?.cognitive?.quietZones && {
      icon: <TbHandStop className="w-3.5 h-3.5" />, label: 'Shovqinsiz hudud',
      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',
    },
    hotel.familyAndElderly?.strollerAccessible && {
      icon: <MdFamilyRestroom className="w-3.5 h-3.5" />, label: 'Oila uchun',
      color: '#ec4899', bg: 'rgba(236,72,153,0.12)',
    },
    hotel.familyAndElderly?.medicalServiceOnSite && {
      icon: <MdLocalHospital className="w-3.5 h-3.5" />, label: 'Tibbiy yordam',
      color: '#ef4444', bg: 'rgba(239,68,68,0.12)',
    },
  ].filter(Boolean);

  const accessCount = accessBadges.length;

  const accScore = calcAccessibilityScore(hotel);
  const scoreStyle = getScoreStyle(accScore);
  const srText = hotel.digitalInclusion?.screenReaderDescription || hotel.description || '';

  return (
    <article
      className="premium-card group relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      aria-label={`${name} mehmonxonasi`}
      aria-describedby={srText ? `sr-${hotel._id}` : undefined}
    >
      {srText && (
        <p id={`sr-${hotel._id}`} className="sr-only">{srText}</p>
      )}
      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[16/10] sm:aspect-[4/3] w-full shrink-0">
        <SafeImage
          src={hotel.image || hotel.images?.[0]}
          fallback={FALLBACK_HOTEL}
          alt={`${name} mehmonxonasi`}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Gradient */}
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.75) 100%)' }}
        />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 z-30 flex flex-col gap-1.5 pointer-events-none">
          {accessCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-white"
              style={{ background: 'rgba(79,70,229,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}>
              <MdAccessible className="w-3 h-3" />
              {accessCount} qulaylik
            </div>
          )}
          {/* Accessibility skori badge */}
          {accScore > 0 && (
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
              style={{ background: scoreStyle.bg, color: scoreStyle.color, backdropFilter: 'blur(8px)', border: `1px solid ${scoreStyle.color}40` }}
              title={`Inklyuzivlik darajasi: ${scoreStyle.label}`}
            >
              ♿ {accScore}%
            </div>
          )}
        </div>

        {/* Favorite button */}
        {user && (
          <button onClick={handleFav}
            aria-label={isFav ? `${name} sevimlilardan olib tashlash` : `${name} sevimlilarga qo'shish`}
            aria-pressed={isFav}
            className="absolute top-2.5 right-2.5 z-30 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{
              background: isFav ? '#ef4444' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${isFav ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.3)'}`,
              color: 'white',
              minHeight: 'unset', minWidth: 'unset',
            }}>
            <FiHeart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
          </button>
        )}

        {/* Bottom row: rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none">
          {hotel.rating > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: '#f59e0b' }}>
                <FiStar className="w-2.5 h-2.5 text-white fill-current" />
              </div>
              <span className="text-sm font-black text-white">{hotel.rating?.toFixed?.(1)}</span>
              {hotel.reviewsCount > 0 && (
                <span className="text-[10px] font-medium text-white/80">({hotel.reviewsCount})</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Name + location */}
        <div className="mb-3">
          <h3 className="font-extrabold text-base line-clamp-1 mb-1"
            style={{ color: 'var(--text-main)' }}>
            {name}
          </h3>
          <div className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
            <FiMapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{[hotel.city, hotel.country].filter(Boolean).join(', ')}</span>
          </div>
        </div>

        {/* Reja 3.1: Qisqa hissiy tavsif */}
        {hotel.descriptionShort && (
          <p className="text-xs line-clamp-2 mb-3 leading-relaxed"
            style={{ color: 'var(--text-muted)' }}>
            {hotel.descriptionShort}
          </p>
        )}

        {/* Accessibility icons */}
        {accessBadges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3" aria-label="Inklyuziv qulayliklar">
            {accessBadges.slice(0, 4).map((b, i) => (
              <span key={i} title={b.label} aria-label={b.label}
                className="inline-flex items-center justify-center w-7 h-7 rounded-lg"
                style={{ color: b.color, background: b.bg, border: `1px solid ${b.color}25`,
                  minHeight: 'unset', minWidth: 'unset' }}>
                {b.icon}
              </span>
            ))}
            {accessBadges.length > 4 && (
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[10px] font-black"
                style={{ color: '#6366f1', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                  minHeight: 'unset', minWidth: 'unset' }}>
                +{accessBadges.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Amenities */}
        {hotel.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {hotel.amenities.slice(0, 3).map(a => (
              <span key={a} className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.07)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>
                {a}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.07)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>
                +{hotel.amenities.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <Link
            to={`/hotel/${hotel._id}`}
            aria-label={`${name} mehmonxonasini batafsil ko'rish`}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
            style={{ minHeight: 46, textDecoration: 'none' }}
          >
            Batafsil ko'rish
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default HotelCard;
