import React, { useState } from 'react';
import { imgSrc, handleImageError, FALLBACK_IMAGE } from '../utils/media';

/**
 * SafeImage — Xatoliklarga chidamli, skeleton yuklanishli va responsiv rasm komponenti.
 *
 * @param {string} src - Rasm URL yoki nisbiy yo'li
 * @param {string} [fallback] - Xatolik yoki bo'sh rasmda ishlatiladigan zaxira rasm
 * @param {string} [alt] - Rasm alt matni
 * @param {string} [className] - Tashqi konteyner CSS klasslari
 * @param {string} [imgClassName] - Ichki img tegining CSS klasslari
 * @param {boolean} [hoverZoom] - Hoverda silliq kattalashish effekti (default: true)
 * @param {'lazy' | 'eager'} [loading] - Brauzer loading rejimi (default: 'lazy')
 */
const SafeImage = ({
  src,
  fallback = FALLBACK_IMAGE,
  alt = '',
  className = '',
  imgClassName = '',
  hoverZoom = true,
  loading = 'lazy',
  onClick,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const resolvedUrl = imgSrc(src, fallback);
  const finalSrc = hasError ? fallback : resolvedUrl;

  return (
    <div
      className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${className}`}
      onClick={onClick}
    >
      {/* Shimmer Placeholder (Rasm yuklanguncha chiqadi) */}
      {!isLoaded && !hasError && (
        <div
          className="absolute inset-0 shimmer pointer-events-none z-0"
          aria-hidden="true"
        />
      )}

      {/* Asosiy Rasm */}
      <img
        src={finalSrc}
        alt={alt}
        loading={loading}
        onLoad={() => setIsLoaded(true)}
        onError={(e) => {
          setHasError(true);
          handleImageError(e, fallback);
        }}
        className={`w-full h-full object-cover transition-all duration-500 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-98'
        } ${hoverZoom ? 'group-hover:scale-105' : ''} ${imgClassName}`}
        {...props}
      />
    </div>
  );
};

export default SafeImage;
