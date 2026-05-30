import React, { useEffect, useState } from 'react';
import { FiX, FiClock, FiBell, FiCheck } from 'react-icons/fi';

/**
 * Qayta ishlatiladigan "Tez orada" modali.
 * Hali tayyor bo'lmagan funksiyalar uchun ko'rsatiladi.
 *
 * Props:
 *  - open: boolean — modal ochiqmi
 *  - onClose: () => void — yopish
 *  - title: string — sarlavha
 *  - description: string — tavsif
 *  - icon: ReactNode — ixtiyoriy ikonka
 */
const ComingSoonModal = ({
  open,
  onClose,
  title = 'Tez orada qo‘shiladi',
  description = 'Bu funksiya hozircha ishlab chiqilmoqda. Tez orada foydalanishingiz mumkin bo‘ladi.',
  icon,
  notifyKey, // berilsa — "Tayyor bo'lganda xabar bering" tugmasi ko'rsatiladi
}) => {
  // Bu funksiya uchun avval obuna bo'lganmi (localStorage)
  const [notified, setNotified] = useState(false);

  useEffect(() => {
    if (open && notifyKey) {
      try {
        const list = JSON.parse(localStorage.getItem('comingSoonNotify') || '[]');
        setNotified(list.includes(notifyKey));
      } catch { setNotified(false); }
    }
  }, [open, notifyKey]);

  const handleNotify = () => {
    try {
      const list = JSON.parse(localStorage.getItem('comingSoonNotify') || '[]');
      if (!list.includes(notifyKey)) {
        list.push(notifyKey);
        localStorage.setItem('comingSoonNotify', JSON.stringify(list));
      }
    } catch { /* localStorage yo'q — jim o'tkazib yuborish */ }
    setNotified(true);
  };

  // Esc tugmasi bilan yopish + body scroll'ni bloklash
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        background: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        animation: 'csmFade 0.2s ease',
      }}
    >
      <style>{`
        @keyframes csmFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes csmPop {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 360,
          background: 'var(--bg-card, #fff)',
          borderRadius: '1.5rem',
          border: '1px solid var(--border, #e5e7eb)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
          padding: '28px 24px 24px',
          textAlign: 'center',
          position: 'relative',
          animation: 'csmPop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Yopish tugmasi */}
        <button
          onClick={onClose}
          aria-label="Yopish"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 32, height: 32, borderRadius: '50%',
            border: 'none', cursor: 'pointer',
            background: 'var(--bg-hover, #f1f5f9)',
            color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <FiX size={16} />
        </button>

        {/* Ikonka */}
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          margin: '0 auto 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
          color: '#6366F1',
        }}>
          {icon || <FiClock size={28} />}
        </div>

        <h3 style={{
          fontSize: '1.1rem', fontWeight: 800,
          color: 'var(--text-main)', marginBottom: 8,
        }}>
          {title}
        </h3>

        <p style={{
          fontSize: '0.86rem', lineHeight: 1.55,
          color: 'var(--text-muted)', marginBottom: 22,
        }}>
          {description}
        </p>

        {/* "Xabar bering" — faqat notifyKey berilganda */}
        {notifyKey && (
          notified ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px 16px', marginBottom: 10,
              borderRadius: '0.875rem',
              background: 'rgba(16,185,129,0.12)', color: '#059669',
              fontWeight: 700, fontSize: '0.86rem',
            }}>
              <FiCheck size={16} /> Tayyor bo‘lganda xabar beramiz
            </div>
          ) : (
            <button
              onClick={handleNotify}
              style={{
                width: '100%', padding: '11px 16px', marginBottom: 10,
                border: '1.5px solid #6366F1', borderRadius: '0.875rem',
                background: 'transparent', color: '#6366F1',
                fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              <FiBell size={15} /> Tayyor bo‘lganda xabar bering
            </button>
          )
        )}

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '11px 16px',
            border: 'none', borderRadius: '0.875rem',
            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem',
            cursor: 'pointer',
          }}
        >
          Tushunarli
        </button>
      </div>
    </div>
  );
};

export default ComingSoonModal;
