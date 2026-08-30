import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiX, FiSend, FiStar, FiMapPin, FiNavigation, FiSun } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { LuLandmark } from 'react-icons/lu';
import { GoDotFill } from 'react-icons/go';
import { resolveMediaUrl } from '../utils/media';

/**
 * AIAssistant — mavjud ma'lumotlar asosida javob beruvchi suzuvchi AI chat.
 *
 * Backend: POST /api/assistant { message } → { reply, hotels?, attractions?, plan?, suggestions? }
 * Dizayn: Modern Minimal (indigo→violet aksent), dark mode, micro-interactions.
 */

const WELCOME = {
  role: 'bot',
  reply: "Salom! 👋 Men NavaiTour AI yordamchisiman.\nQulayliklar, tarixiy joylar, sayohat rejasi va boshqa savollarga javob beraman. Quyidagilarni so'rab ko'ring:",
  suggestions: ['Nima qila olasan?', 'Tarixiy joylar', 'Bepul Wi-Fi bormi?', '3 kunlik plan yoz'],
};


const AttractionMini = ({ a, onClick }) => (
  <button
    onClick={onClick}
    className="group w-full flex gap-3 p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 hover:border-amber-400 dark:hover:border-amber-600 hover:shadow-md active:scale-[0.98] transition-all duration-200 text-left"
  >
    {a.image && (
      <img src={resolveMediaUrl(a.image)} alt={a.name} loading="lazy" decoding="async"
        className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-amber-200/60 dark:ring-amber-900/40" />
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
          <LuLandmark className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate">{a.name}</span>
        </p>
        {a.rating > 0 && (
          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
            <FiStar className="w-3 h-3 fill-current" />{a.rating?.toFixed?.(1) ?? a.rating}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
        <FiMapPin className="w-3 h-3" />{a.district}{a.entryFee ? ` · ${a.entryFee}` : ''}
      </p>
      {(a.quiet || a.peak) && (
        <div className="mt-1.5 flex flex-col gap-0.5">
          {a.quiet && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 line-clamp-1 flex items-center gap-1">
              <GoDotFill className="w-2.5 h-2.5 shrink-0" /> Tinch: {a.quiet}
            </span>
          )}
          {a.peak && (
            <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 line-clamp-1 flex items-center gap-1">
              <GoDotFill className="w-2.5 h-2.5 shrink-0" /> Pik: {a.peak}
            </span>
          )}
          {a.bestSeason && (
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 line-clamp-1 flex items-center gap-1">
              <FiSun className="w-2.5 h-2.5 shrink-0" /> {a.bestSeason}
            </span>
          )}
        </div>
      )}
    </div>
  </button>
);

const HotelMini = ({ h, onClick }) => (
  <button
    onClick={onClick}
    className="group w-full flex gap-3 p-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md active:scale-[0.98] transition-all duration-200 text-left"
  >
    {h.image && (
      <img src={resolveMediaUrl(h.image)} alt={h.name} loading="lazy" decoding="async"
        className="w-14 h-14 rounded-xl object-cover shrink-0 ring-1 ring-slate-200/60 dark:ring-slate-700" />
    )}
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{h.name}</p>
        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
          <FiStar className="w-3 h-3 fill-current" />{h.rating?.toFixed?.(1) ?? h.rating}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
        <FiMapPin className="w-3 h-3" />{h.district || h.city}{h.category ? ` · ${h.category}` : ''}
        {Number.isFinite(h.stars) && <span className="text-amber-500">{' · '}{'★'.repeat(h.stars)}</span>}
      </p>

      {Number.isFinite(h.distanceKm) && (
        <p className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 flex items-center gap-1 mt-0.5">
          <FiNavigation className="w-3 h-3" /> ~{h.distanceKm} km uzoqlikda
        </p>
      )}
      {!Number.isFinite(h.distanceKm) && h.nearbyPlaces?.[0] && (
        <p className="text-[11px] text-indigo-500 dark:text-indigo-400 truncate mt-0.5 flex items-center gap-1">
          <LuLandmark className="w-3 h-3 shrink-0" /> {h.nearbyPlaces[0]}
        </p>
      )}
    </div>
  </button>
);

const AIAssistant = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setMessages((m) => [...m, { role: 'user', reply: msg }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post('/assistant', { message: msg });
      setMessages((m) => [...m, { role: 'bot', ...res.data }]);
    } catch {
      setMessages((m) => [...m, { role: 'bot', reply: "Kechirasiz, javob olishda xatolik yuz berdi. Qaytadan urinib ko'ring." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes aiPop { 0% { opacity:0; transform: translateY(28px) scale(0.9); } 60% { opacity:1; transform: translateY(-4px) scale(1.01); } 100% { opacity:1; transform: translateY(0) scale(1); } }
        @keyframes aiGlow { 0%,100% { opacity:.5; transform: translate(0,0) scale(1); } 50% { opacity:.85; transform: translate(8px,-6px) scale(1.18); } }
        @keyframes aiRing { 0% { transform: scale(0.9); opacity:.7; } 70% { transform: scale(1.5); opacity:0; } 100% { opacity:0; } }
        @keyframes aiUp { from { opacity:0; transform: translateY(6px); } to { opacity:1; transform: translateY(0); } }
        @keyframes aiDot { 0%,60%,100% { transform: translateY(0); opacity:.4; } 30% { transform: translateY(-5px); opacity:1; } }
        .ai-msg-in { animation: aiUp .22s cubic-bezier(0.4,0,0.2,1); }
        .ai-send:hover:not(:disabled) { filter: brightness(1.08); transform: scale(1.06) rotate(-8deg); }
        @media (prefers-reduced-motion: reduce) { .ai-anim, .ai-msg-in { animation: none !important; } }
      `}</style>

      {/* Suzuvchi tugma */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="AI yordamchini ochish"
          className="ai-anim group"
          style={{
            position: 'fixed', bottom: 'calc(90px + env(safe-area-inset-bottom, 0px))', right: 84, zIndex: 401,
            width: 58, height: 58, borderRadius: '50%',
            background: 'linear-gradient(135deg,#6366f1 0%,#8b5cf6 55%,#a855f7 100%)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 10px 30px -6px rgba(139,92,246,0.6)',
          }}
        >
          <span style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(139,92,246,0.45)', animation: 'aiRing 2.4s ease-out infinite', zIndex: -1,
          }} />
          <HiSparkles size={24} color="#fff" />
          <span style={{
            position: 'absolute', top: -3, right: -3, background: '#10b981',
            color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 6px',
            borderRadius: 9, border: '2px solid #fff', letterSpacing: '0.03em',
          }}>AI</span>
        </button>
      )}

      {/* Chat oynasi */}
      {open && (
        <div
          className="ai-anim fixed z-[402] flex flex-col glass-panel overflow-hidden"
          style={{
            bottom: 0, right: 0,
            width: 'min(404px, 100vw)', height: 'min(624px, 100dvh)',
            borderTopLeftRadius: 28, borderTopRightRadius: 28,
            border: '1px solid var(--border, #e5e7eb)',
            boxShadow: '0 -10px 50px -12px rgba(99,102,241,0.4)',
            transformOrigin: 'bottom right',
            animation: 'aiPop 0.42s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Header */}
          <div className="relative flex items-center gap-3 px-4 py-3.5 text-white shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#8b5cf6 100%)', borderTopLeftRadius: 28, borderTopRightRadius: 28 }}>
            <div className="pointer-events-none absolute -top-7 -right-3 w-28 h-28 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4), transparent 70%)', filter: 'blur(8px)', animation: 'aiGlow 6s ease-in-out infinite' }} />
            <div className="relative z-10 w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 ring-1 ring-white/30">
              <HiSparkles size={20} />
            </div>
            <div className="relative z-10 flex-1 min-w-0">
              <p className="font-black text-[15px] leading-tight tracking-tight">NavaiTour AI</p>
              <p className="text-[11px] text-white/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.9)]" />
                Onlayn · joylardan tavsiya beradi
              </p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Yopish"
              className="relative z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors">
              <FiX size={19} />
            </button>
          </div>

          {/* Xabarlar */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 hide-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`ai-msg-in ${m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                <div className={m.role === 'user'
                  ? 'max-w-[82%] px-4 py-2.5 text-white text-sm whitespace-pre-line shadow-md'
                  : 'max-w-[90%] w-full'}
                  style={m.role === 'user' ? {
                    background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                    borderRadius: '18px 18px 6px 18px',
                  } : undefined}>
                  {m.role === 'bot' ? (
                    <div className="space-y-2">
                      <div className="px-4 py-3 glass-panel border border-glass-border text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line shadow-sm leading-relaxed"
                        style={{ borderRadius: '6px 18px 18px 18px' }}>
                        {m.reply}
                      </div>
                      {m.attractions?.length > 0 && (
                        <div className="space-y-2">
                          {m.attractions.map((a) => (
                            <AttractionMini key={a._id} a={a} onClick={() => { navigate(`/attraction/${a._id}`); setOpen(false); }} />
                          ))}
                        </div>
                      )}
                      {m.hotels?.length > 0 && (
                        <div className="space-y-2">
                          {m.hotels.map((h) => (
                            <HotelMini key={h._id} h={h} onClick={() => { navigate(`/hotel/${h._id}`); setOpen(false); }} />
                          ))}
                        </div>
                      )}
                      {m.suggestions?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {m.suggestions.map((s) => (
                            <button key={s} onClick={() => send(s)}
                              className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200/70 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:border-indigo-300 active:scale-95 transition-all">
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : m.reply}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start ai-msg-in">
                <div className="px-4 py-3 glass-panel border border-glass-border shadow-sm" style={{ borderRadius: '6px 18px 18px 18px' }}>
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="w-2 h-2 rounded-full bg-indigo-400" style={{ animation: `aiDot 1.2s ease-in-out ${i * 0.18}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Kiritish */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 p-3 border-t border-glass-border glass-panel shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Masalan: Qachon borish yaxshi?"
              aria-label="Xabar yozing"
              className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 border border-transparent focus:border-indigo-400 dark:focus:border-indigo-500 text-sm text-slate-800 dark:text-slate-100 outline-none transition-colors"
            />
            <button type="submit" disabled={loading || !input.trim()}
              aria-label="Yuborish"
              className="ai-send w-11 h-11 rounded-2xl flex items-center justify-center text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <FiSend size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AIAssistant;
