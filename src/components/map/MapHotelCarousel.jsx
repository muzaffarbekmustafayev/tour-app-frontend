import React from 'react';
import { fmtPrice, getMinPrice, Stars } from './mapUtils';

const MapHotelCarousel = ({ filtered, selected, openPanel }) => {
  return (
    <div
      className="shrink-0 z-[400]"
      style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Handle */}
      <div className="flex justify-center pt-2 pb-1">
        <div className="w-8 h-1 rounded-full" style={{ background: 'var(--border)' }} />
      </div>

      {/* Horizontal snapping cards */}
      <div
        className="flex gap-3 px-4 pb-4 overflow-x-auto hide-scrollbar"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {filtered.map((hotel) => {
          const price = fmtPrice(getMinPrice(hotel));
          return (
            <button
              key={hotel._id}
              onClick={() => openPanel(hotel)}
              className="flex-shrink-0 flex gap-3 p-2.5 rounded-2xl active:scale-[0.98] text-left transition-all"
              style={{
                scrollSnapAlign: 'start',
                width: 240,
                background: selected?._id === hotel._id ? 'var(--primary-light)' : 'var(--bg-main)',
                border: `1.5px solid ${selected?._id === hotel._id ? 'var(--primary)' : 'var(--border)'}`,
                boxShadow: 'var(--shadow-sm)',
                minHeight: 'unset',
              }}
            >
              {/* Thumb */}
              <div
                className="w-16 h-16 rounded-xl overflow-hidden shrink-0"
                style={{ background: 'var(--border)' }}
              >
                {(hotel.images?.[0] || hotel.image) && (
                  <img
                    src={(hotel.images?.[0] || hotel.image).startsWith('http')
                      ? (hotel.images?.[0] || hotel.image)
                      : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${hotel.images?.[0] || hotel.image}`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <p className="text-xs font-extrabold line-clamp-1" style={{ color: 'var(--text-main)' }}>
                  {hotel.name}
                </p>
                <Stars count={hotel.stars} size="sm" />
                <div className="flex items-center justify-between mt-0.5">
                  {price && (
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#059669' }}>
                      {price} <span style={{ color: 'var(--text-muted)' }}>UZS</span>
                    </span>
                  )}
                  {hotel.rating > 0 && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>
                      ★ {hotel.rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MapHotelCarousel;
