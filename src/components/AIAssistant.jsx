import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FiMessageSquare, FiX, FiSend, FiStar, FiMapPin } from 'react-icons/fi';

/**
 * AIAssistant — mavjud ma'lumotlar asosida javob beruvchi suzuvchi AI chat.
 *
 * "Eng yaxshi joy" → reyting bo'yicha eng yaxshi maskan;
 * "7 kunlik plan yoz" → N-kunlik sayohat rejasi.
 * Backend: POST /api/assistant  { message } → { reply, hotels?, plan?, suggestions? }
 */

const WELCOME = {
  role: 'bot',
  reply: "Salom! 👋 Men NavaiTour AI yordamchisiman.\nQuyidagilarni so'rab ko'ring:",
  suggestions: ['Eng yaxshi joy', '7 kunlik plan yoz', 'Tarixiy joylar', 'Aravacha uchun qulay'],
};

const AttractionMini = ({ a, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex gap-3 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 hover:border-amber-400 transition-all text-left active:scale-[0.98]"
  >
    {a.image && <img src={a.image} alt={a.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">🏛️ {a.name}</p>
        {a.rating > 0 && (
          <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
            <FiStar className="w-3 h-3 fill-current" />{a.rating?.toFixed?.(1) ?? a.rating}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
        <FiMapPin className="w-3 h-3" />{a.district}{a.entryFee ? ` · ${a.entryFee}` : ''}
      </p>
      {a.descriptionShort && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{a.descriptionShort}</p>
      )}
    </div>
  </button>
);

const HotelMini = ({ h, onClick }) => (
  <button
    onClick={onClick}
    className="w-full flex gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all text-left active:scale-[0.98]"
  >
    {h.image && <img src={h.image} alt={h.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />}
    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold text-sm text-slate-800 dark:text-slate-100 truncate">{h.name}</p>
        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-500 shrink-0">
          <FiStar className="w-3 h-3 fill-current" />{h.rating?.toFixed?.(1) ?? h.rating}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
        <FiMapPin className="w-3 h-3" />{h.city}{h.category ? ` · ${h.category}` : ''}
      </p>
      {h.descriptionShort && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{h.descriptionShort}</p>
      )}
      {h.nearbyPlaces?.[0] && (
        <p className="text-[11px] text-indigo-500 dark:text-indigo-400 truncate mt-0.5">🏛️ {h.nearbyPlaces[0]}</p>
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
      {/* Suzuvchi tugma */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="AI yordamchi"
          style={{
            position: 'fixed', bottom: 90, right: 84, zIndex: 401,
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg,#f59e0b,#8b5cf6)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(139,92,246,0.45)',
          }}
        >
          <FiMessageSquare size={22} color="#fff" />
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#10b981',
            color: '#fff', fontSize: 9, fontWeight: 800, padding: '2px 5px',
            borderRadius: 8, border: '2px solid #fff',
          }}>AI</span>
        </button>
      )}

      {/* Chat oynasi */}
      {open && (
        <div
          className="fixed z-[402] flex flex-col bg-slate-50 dark:bg-slate-900 shadow-2xl"
          style={{
            bottom: 0, right: 0,
            width: 'min(400px, 100vw)', height: 'min(600px, 100dvh)',
            borderTopLeftRadius: 24, borderTopRightRadius: 24,
            border: '1px solid var(--border)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 text-white shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <FiMessageSquare size={18} />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">NavaiTour AI</p>
                <p className="text-[11px] text-white/70">Mavjud joylardan tavsiya beradi</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Yopish" className="p-1.5 rounded-lg hover:bg-white/15">
              <FiX size={20} />
            </button>
          </div>

          {/* Xabarlar */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div className={m.role === 'user'
                  ? 'max-w-[80%] px-3.5 py-2.5 rounded-2xl rounded-br-md bg-indigo-600 text-white text-sm whitespace-pre-line'
                  : 'max-w-[88%] w-full'}>
                  {m.role === 'bot' ? (
                    <div className="space-y-2">
                      <div className="px-3.5 py-2.5 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-line">
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
                              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800 hover:bg-indigo-100">
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
              <div className="flex justify-start">
                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Kiritish */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="flex items-center gap-2 p-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Masalan: 7 kunlik plan yoz..."
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-400"
            />
            <button type="submit" disabled={loading || !input.trim()}
              aria-label="Yuborish"
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40"
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
