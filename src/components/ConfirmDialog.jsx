import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

/**
 * ConfirmDialog — window.confirm o'rniga ishlatiladigan styled, accessible modal.
 *
 * Foydalanish:
 *   const [confirm, setConfirm] = useState(null); // { title, message, onConfirm }
 *   ...
 *   <ConfirmDialog
 *     open={!!confirm}
 *     title={confirm?.title}
 *     message={confirm?.message}
 *     loading={loading}
 *     onConfirm={confirm?.onConfirm}
 *     onClose={() => setConfirm(null)}
 *   />
 */
const ConfirmDialog = ({
  open,
  title = 'Tasdiqlang',
  message = '',
  confirmText = "Ha, o'chirish",
  cancelText = 'Bekor qilish',
  variant = 'danger', // 'danger' | 'primary'
  loading = false,
  onConfirm,
  onClose,
}) => {
  const confirmBtnRef = useRef(null);

  // ESC bilan yopish + ochilganda confirm tugmasiga fokus
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape' && !loading) onClose?.(); };
    document.addEventListener('keydown', onKey);
    confirmBtnRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const accent = variant === 'danger'
    ? { ring: 'bg-rose-50 dark:bg-rose-950/30 text-rose-500', btn: 'bg-rose-600 hover:bg-rose-700' }
    : { ring: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700' };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={() => !loading && onClose?.()}
    >
      <div
        className="glass-panel w-full max-w-sm overflow-hidden animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${accent.ring}`}>
              <FiAlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="confirm-title" className="text-lg font-black text-slate-900 dark:text-white mb-1.5">{title}</h2>
              {message && <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>}
            </div>
            <button
              onClick={() => !loading && onClose?.()}
              aria-label="Yopish"
              className="w-8 h-8 -mt-1 -mr-1 shrink-0 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3 mt-7">
            <button
              onClick={() => !loading && onClose?.()}
              disabled={loading}
              className="flex-1 py-3 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              ref={confirmBtnRef}
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 disabled:opacity-50 ${
                variant === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/30' : 'btn-primary'
              }`}
            >
              {loading ? 'Bajarilmoqda...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
