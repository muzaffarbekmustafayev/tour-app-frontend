import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAccessible,
  MdHearing,
  MdVisibility,
  MdElderly,
  MdFamilyRestroom,
  MdSignLanguage,
} from 'react-icons/md';
import { FiArrowRight, FiX } from 'react-icons/fi';

const FEATURES = [
  {
    icon: <MdAccessible className="w-6 h-6" />,
    title: 'Harakatlanish',
    desc: 'Lift, pandus, nogironlar aravachasi yo\'li',
    color: '#6366f1',
  },
  {
    icon: <MdHearing className="w-6 h-6" />,
    title: 'Eshitish',
    desc: 'Ovozli signallar, imo-ishora tili xodimi',
    color: '#0ea5e9',
  },
  {
    icon: <MdVisibility className="w-6 h-6" />,
    title: "Ko'rish",
    desc: "Brayl, taktil yo'lakcha, yirik shrift",
    color: '#10b981',
  },
  {
    icon: <MdSignLanguage className="w-6 h-6" />,
    title: 'Kognitiv',
    desc: "Sodda belgilar, shovqinsiz hudud",
    color: '#f59e0b',
  },
  {
    icon: <MdFamilyRestroom className="w-6 h-6" />,
    title: 'Oila',
    desc: 'Bolalar aravachasi, emizish xonasi',
    color: '#ec4899',
  },
  {
    icon: <MdElderly className="w-6 h-6" />,
    title: 'Keksalar',
    desc: 'Tibbiy yordam, past balandlikdagi stendlar',
    color: '#8b5cf6',
  },
];

const AccessibilityBanner = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem('accessBannerDismissed') === '1'
  );

  const handleDismiss = () => {
    localStorage.setItem('accessBannerDismissed', '1');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <div
      className="mb-12 rounded-[2rem] overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      }}
      role="region"
      aria-label="Inklyuziv turizm haqida ma'lumot"
    >
      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.1)', color: 'white', minWidth: 32, minHeight: 32 }}
        aria-label="Yopish"
      >
        <FiX className="w-4 h-4" />
      </button>

      {/* Animated background dots */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />

      {/* ISA symbol watermark */}
      <div
        className="absolute right-8 bottom-0 opacity-5 pointer-events-none select-none"
        style={{ fontSize: '10rem', lineHeight: 1 }}
        aria-hidden="true"
      >
        <MdAccessible />
      </div>

      <div className="relative z-10 p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            aria-hidden="true"
          >
            <MdAccessible className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-300">
            Inklyuziv Turizm · WCAG 2.1
          </span>
        </div>

        <h2 className="text-white text-xl sm:text-2xl font-black mb-1 leading-tight">
          Hamma uchun qulay dam olish
        </h2>
        <p className="text-indigo-200 text-sm mb-6 max-w-lg">
          Navoiydagi mehmonxonalar maxsus ehtiyojlari bo'lgan mehmonlar uchun 
          inklyuziv qulayliklarni taqdim etadi.
        </p>

        {/* Feature chips */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
              style={{
                background: `${f.color}18`,
                border: `1px solid ${f.color}35`,
              }}
            >
              <span style={{ color: f.color }} aria-hidden="true">{f.icon}</span>
              <div>
                <p className="text-white text-xs font-bold leading-none mb-0.5">{f.title}</p>
                <p className="text-indigo-300 text-[10px] font-medium leading-tight">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={() => navigate('/search?accessibility=wheelchair')}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm text-white transition-all hover:brightness-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: '0 8px 24px -6px rgba(99,102,241,0.5)',
          }}
          aria-label="Inklyuziv mehmonxonalarni ko'rish"
        >
          Inklyuziv mehmonxonalar
          <FiArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AccessibilityBanner;
