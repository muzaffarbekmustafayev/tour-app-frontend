import React, { useEffect, useCallback } from 'react';
import { FiX, FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';
import SafeImage from './SafeImage';
import { FALLBACK_IMAGE } from '../utils/media';

/**
 * ImageLightboxModal — Rasmlarni to'liq ekranda (fullscreen) yuqori sifatda ko'rish modali.
 */
const ImageLightboxModal = ({
  images = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onChangeIndex,
  fallback = FALLBACK_IMAGE,
  title = '',
}) => {
  const total = images.length;

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex?.((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onChangeIndex]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    onChangeIndex?.((currentIndex + 1) % total);
  }, [currentIndex, total, onChangeIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, handlePrev, handleNext, onClose]);

  if (!isOpen || total === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Rasm galereyasi"
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-between bg-black/95 backdrop-blur-xl animate-fade-in text-white select-none p-3 sm:p-6"
    >
      {/* ── Top Bar ── */}
      <div className="w-full max-w-7xl flex items-center justify-between z-20 pb-2">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-black bg-white/15 border border-white/20 backdrop-blur-md">
            {currentIndex + 1} / {total}
          </span>
          {title && (
            <h3 className="text-sm sm:text-base font-bold text-white/90 truncate max-w-[200px] sm:max-w-md">
              {title}
            </h3>
          )}
        </div>

        <button
          onClick={onClose}
          aria-label="Yopish"
          className="w-10 h-10 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all active:scale-95 border border-white/20"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* ── Center Image with Navigation Arrows ── */}
      <div className="relative flex-1 w-full max-w-6xl flex items-center justify-center my-auto min-h-0">
        {total > 1 && (
          <button
            onClick={handlePrev}
            aria-label="Oldingi rasm"
            className="absolute left-2 sm:left-4 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white transition-all active:scale-90"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div className="relative max-h-[70vh] sm:max-h-[76vh] w-full h-full flex items-center justify-center">
          <SafeImage
            src={currentImage}
            fallback={fallback}
            alt={`${title} - ${currentIndex + 1}`}
            loading="eager"
            hoverZoom={false}
            className="max-h-full max-w-full rounded-2xl shadow-2xl overflow-hidden object-contain"
            imgClassName="max-h-[70vh] sm:max-h-[76vh] w-auto h-auto object-contain mx-auto"
          />
        </div>

        {total > 1 && (
          <button
            onClick={handleNext}
            aria-label="Keyingi rasm"
            className="absolute right-2 sm:right-4 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white transition-all active:scale-90"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* ── Bottom Thumbnails ── */}
      {total > 1 && (
        <div className="w-full max-w-3xl flex items-center justify-center gap-2 overflow-x-auto hide-scrollbar py-2 z-20">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChangeIndex?.(idx)}
              className={`relative shrink-0 w-14 h-10 sm:w-18 sm:h-12 rounded-xl overflow-hidden border-2 transition-all active:scale-95 ${
                idx === currentIndex
                  ? 'border-amber-400 scale-105 shadow-lg shadow-amber-500/30 opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              <SafeImage
                src={img}
                fallback={fallback}
                alt={`thumb-${idx + 1}`}
                hoverZoom={false}
                className="w-full h-full"
                imgClassName="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageLightboxModal;
