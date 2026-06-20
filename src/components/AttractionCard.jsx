import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiArrowRight, FiPlayCircle } from 'react-icons/fi';
import { MdAccessible } from 'react-icons/md';

const FALLBACK = 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800';

const AttractionCard = ({ attraction: a }) => {
  const name = a.name || "Nomi yo'q";
  const hasVideo = !!a.video360?.url;
  const accCount = a.accessibility
    ? Object.values(a.accessibility).filter(Boolean).length
    : 0;

  return (
    <article className="premium-card group relative flex flex-col" aria-label={`${name} tarixiy joyi`}>
      {/* ── Image ── */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3', minHeight: 0 }}>
        <div className="absolute inset-0 shimmer" aria-hidden="true" />
        <img
          src={a.images?.[0] || FALLBACK}
          alt={`${name}`}
          className="w-full h-full object-cover relative z-10 transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
        />
        <div className="absolute inset-0 z-20"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 40%, rgba(0,0,0,0.65) 100%)' }} />

        {/* Top-left badges */}
        <div className="absolute top-2.5 left-2.5 z-30 flex flex-col gap-1.5">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-white"
            style={{ background: 'rgba(217,119,6,0.9)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            🏛️ Tarixiy joy
          </div>
          {hasVideo && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
              style={{ background: 'rgba(79,70,229,0.85)', backdropFilter: 'blur(8px)' }}>
              <FiPlayCircle className="w-3 h-3" /> 360°
            </div>
          )}
        </div>

        {/* District + rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <FiMapPin className="w-3 h-3 text-rose-300" />
            <span className="text-xs font-black text-white">{a.district}</span>
          </div>
          {a.rating > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <FiStar className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-sm font-black text-white">{a.rating?.toFixed?.(1) ?? a.rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        <h3 className="font-extrabold text-base line-clamp-1 mb-1" style={{ color: 'var(--text-main)' }}>{name}</h3>
        {a.descriptionShort && (
          <p className="text-xs line-clamp-2 mb-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {a.descriptionShort}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {a.entryFee && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)' }}>
              {a.entryFee}
            </span>
          )}
          {accCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.2)' }}>
              <MdAccessible className="w-3 h-3" /> {accCount} qulaylik
            </span>
          )}
        </div>

        <div className="mt-auto pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <Link
            to={`/attraction/${a._id}`}
            aria-label={`${name} joyini batafsil ko'rish`}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 hover:brightness-110 press-effect"
            style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 4px 14px -4px rgba(217,119,6,0.4)', textDecoration: 'none', minHeight: 46 }}
          >
            360° ko'rish va atrofi
            <FiArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default AttractionCard;
