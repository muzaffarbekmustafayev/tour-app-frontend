import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiStar, FiArrowRight, FiPlayCircle, FiSun, FiNavigation, FiPhone, FiClock } from 'react-icons/fi';
import { MdAccessible } from 'react-icons/md';
import { LuLandmark, LuHospital, LuTrees, LuBuilding2 } from 'react-icons/lu';
import { FaMosque, FaMountain, FaShoppingBag, FaShoppingCart, FaShoppingBasket, FaShieldAlt, FaTheaterMasks, FaPlane } from 'react-icons/fa';
import { imgSrc, FALLBACK_ATTRACTION } from '../utils/media';
import SafeImage from './SafeImage';

export const CATEGORY_META = {
  tarixiy:        { label: 'Tarixiy Obida',  icon: LuLandmark,         color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  ziyoratgoh:     { label: 'Ziyoratgoh',     icon: FaMosque,           color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  madaniy:        { label: 'Madaniy Markaz', icon: FaTheaterMasks,     color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  tabiat:         { label: 'Tabiat & Tog\'', icon: FaMountain,         color: '#059669', bg: 'rgba(5,150,105,0.15)' },
  istirohat_bogi: { label: 'Istirohat Bog\'i',icon: LuTrees,            color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  kasalxona:      { label: 'Kasalxona (24/7)',icon: LuHospital,         color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  iib:            { label: 'IIB / Xavfsizlik',icon: FaShieldAlt,        color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  hokimiyat:      { label: 'Hokimiyat',      icon: LuBuilding2,        color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
  transport:      { label: 'Transport',      icon: FaPlane,            color: '#0284c7', bg: 'rgba(2,132,199,0.15)' },
  bozor:          { label: 'Dehqon Bozori',  icon: FaShoppingBasket,   color: '#d97706', bg: 'rgba(217,119,6,0.15)' },
  supermarket:    { label: 'Supermarket',    icon: FaShoppingCart,     color: '#2563eb', bg: 'rgba(37,99,235,0.15)' },
  mall:           { label: 'Savdo Majmuasi', icon: FaShoppingBag,      color: '#7c3aed', bg: 'rgba(124,58,237,0.15)' },
  boshqa:         { label: 'Obyekt',         icon: LuLandmark,         color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
};

const AttractionCard = ({ attraction: a }) => {
  const name = a.name || "Nomi yo'q";
  const hasVideo = !!a.video360?.url;
  const accCount = a.accessibility
    ? Object.values(a.accessibility).filter(Boolean).length
    : 0;

  const catMeta = CATEGORY_META[a.category] || CATEGORY_META.tarixiy;
  const CatIcon = catMeta.icon;

  return (
    <article
      className="premium-card group relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      aria-label={`${name} obyekt kartochkasi`}
    >
      {/* ── Image Header ── */}
      <div className="relative overflow-hidden aspect-[16/10] sm:aspect-[4/3] w-full shrink-0">
        <SafeImage
          src={a.images?.[0]}
          fallback={FALLBACK_ATTRACTION}
          alt={`${name}`}
          className="w-full h-full"
          imgClassName="w-full h-full object-cover"
          loading="lazy"
        />
        <div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.75) 100%)' }}
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 z-30 flex flex-wrap items-center gap-1.5 pointer-events-none">
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10.5px] font-black text-white shadow-sm"
            style={{ background: catMeta.color, backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <CatIcon className="w-3 h-3" /> {catMeta.label}
          </div>

          {hasVideo && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              <FiPlayCircle className="w-3.5 h-3.5" /> Video
            </div>
          )}
        </div>

        {/* Bottom District & Rating */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 z-30 flex items-center justify-between pointer-events-none">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <FiMapPin className="w-3 h-3 text-rose-400" />
            <span className="text-xs font-black text-white">{a.district}</span>
          </div>

          {a.rating > 0 && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <FiStar className="w-3 h-3 text-amber-400 fill-current" />
              <span className="text-xs font-black text-white">{a.rating?.toFixed?.(1) ?? a.rating}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-extrabold text-base line-clamp-1 mb-1 text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {name}
        </h3>

        {a.descriptionShort && (
          <p className="text-xs line-clamp-2 mb-3 leading-relaxed text-slate-500 dark:text-slate-400">
            {a.descriptionShort}
          </p>
        )}

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {a.phone && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
              <FiPhone className="w-2.5 h-2.5" /> {a.phone}
            </span>
          )}
          {a.workingHours && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
              <FiClock className="w-2.5 h-2.5" /> {a.workingHours}
            </span>
          )}
          {a.entryFee && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40">
              {a.entryFee}
            </span>
          )}
          {a.thingsToSeeAround?.length > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border border-violet-200/60 dark:border-violet-800/40">
              <FiNavigation className="w-2.5 h-2.5" /> {a.thingsToSeeAround.length} atrofda
            </span>
          )}
          {accCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
              <MdAccessible className="w-2.5 h-2.5" /> {accCount} qulaylik
            </span>
          )}
        </div>

        {/* Action Link */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link
            to={`/attraction/${a._id}`}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
            style={{ minHeight: 46, textDecoration: 'none' }}
          >
            Batafsil ko'rish
            <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </article>
  );
};

export default AttractionCard;
