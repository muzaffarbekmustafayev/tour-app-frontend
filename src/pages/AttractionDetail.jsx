import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import HotelCard from '../components/HotelCard';
import { fetchAttraction, fetchNearbyStays, addAttractionReview } from '../services/attractions';
import { imgSrc, resolveMediaUrl } from '../utils/media';
import {
  FiMapPin, FiStar, FiFrown, FiPlayCircle, FiX, FiClock, FiFeather,
  FiAward, FiSun, FiNavigation, FiHome, FiCheck,
} from 'react-icons/fi';
import { MdAccessible } from 'react-icons/md';
import { LuLandmark } from 'react-icons/lu';

const Section = ({ title, icon, children, className = '' }) => (
  <div className={`bg-white/95 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-2xl mb-6 shadow-sm ${className}`}>
    {title && (
      <h2 className="flex items-center gap-3 text-[13px] font-black mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-white uppercase tracking-wider">
        <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">{icon}</span> {title}
      </h2>
    )}
    {children}
  </div>
);

const StarRow = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((i) => (
      <FiStar key={i} className="w-3.5 h-3.5"
        style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fill: i <= rating ? '#f59e0b' : 'none' }} />
    ))}
  </div>
);

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const re = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const m = url.match(re);
  return (m && m[2].length === 11) ? `https://www.youtube.com/embed/${m[2]}?autoplay=1&rel=0` : url;
};

const TYPE_LABELS = {
  tabiat: '🌿 Tabiat', tarix: '🏛️ Tarix', bozor: '🛍️ Bozor',
  ovqat: '🍽️ Ovqat', diniy: '🕌 Diniy', boshqa: '📍 Boshqa',
};

const AttractionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [a, setA] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const data = await fetchAttraction(id);
        setA(data);
        const near = await fetchNearbyStays(id);
        setNearby(Array.isArray(near) ? near : (near.data || []));
      } catch {
        setError("Ma'lumotni yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await addAttractionReview(id, reviewForm);
      const fresh = await fetchAttraction(id);
      setA(fresh);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error('[AttractionDetail] sharh xatosi:', err.message);
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]"><Loader message="Yuklanmoqda..." /></div>
  );

  if (error || !a) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <FiFrown className="w-12 h-12 mb-4 text-gray-400" />
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Xatolik yuz berdi</h2>
      <p className="text-gray-500 mb-6 text-sm">{error}</p>
      <button onClick={() => navigate(-1)} className="bg-amber-600 hover:bg-amber-700 px-6 py-2 rounded text-white font-semibold transition-colors">Orqaga</button>
    </div>
  );

  const images = a.images?.length ? a.images : ['https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1000'];
  const accFeatures = Object.entries({
    wheelchairAccessible: 'Aravacha uchun qulay',
    accessibleParking: 'Maxsus parking',
    accessibleToilet: 'Inklyuziv hojatxona',
    brailleSigns: 'Brayl yozuvlari',
    audioGuides: "Ovozli yo'riqnoma",
    signLanguageStaff: 'Imo-ishora tili',
    quietZones: 'Shovqinsiz hudud',
    serviceAnimalFriendly: "Yo'l-yo'riq hayvonlari",
  }).filter(([k]) => a.accessibility?.[k]);

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">

        <div className="mb-4"><BackButton /></div>

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30">
                <LuLandmark className="w-3 h-3" /> Tarixiy joy
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400">
                <FiMapPin className="w-3.5 h-3.5 text-rose-500" /> {a.district} tumani
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">{a.name}</h1>
            {a.address && (
              <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
                <FiMapPin className="text-rose-500 w-4 h-4 shrink-0" /> {a.address}
              </p>
            )}
          </div>
          {a.rating > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 p-4 rounded-2xl flex items-center gap-3.5 border border-amber-100/80 dark:border-amber-900/30 shadow-sm shrink-0">
              <div className="bg-amber-500 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md shrink-0">
                {a.rating?.toFixed(1)}
              </div>
              <div>
                <p className="font-black text-amber-950 dark:text-amber-200 text-sm leading-tight">Sayohatchilar bahosi</p>
                <p className="text-xs font-bold text-amber-600/85 dark:text-amber-400/85 mt-0.5">{a.reviewsCount || 0} ta sharh</p>
              </div>
            </div>
          )}
        </div>

        {/* Hero image + 360 button */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm mb-8">
          <img src={imgSrc(images[0])} alt={a.name} className="w-full h-[300px] sm:h-[420px] object-cover" />
          {a.video360?.url && (
            <button onClick={() => setVideoOpen(true)}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all group">
              <span className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/95 text-indigo-700 font-black text-sm shadow-xl group-active:scale-95 transition-transform">
                <FiPlayCircle className="w-5 h-5" /> 360° videoni ko'rish
                {a.video360.captioned && <span className="ml-1 bg-blue-100 text-blue-700 text-[9px] font-black px-1.5 py-0.5 rounded">CC</span>}
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">

            <Section title="Joy haqida" icon={<FiAward />}>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{a.description}</p>
              <div className="flex flex-wrap gap-2 mt-5">
                {a.entryFee && (
                  <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/30">
                    Kirish: {a.entryFee}
                  </span>
                )}
                {a.bestSeason && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-400 border border-sky-200/60 dark:border-sky-900/30">
                    <FiSun className="w-3.5 h-3.5" /> {a.bestSeason}
                  </span>
                )}
              </div>
            </Section>

            {/* Atrofda nima bor */}
            {a.thingsToSeeAround?.length > 0 && (
              <Section title="Atrofda aylanishga arzigulik" icon={<FiNavigation />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {a.thingsToSeeAround.map((t, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{TYPE_LABELS[t.type] || t.type}</span>
                        {Number.isFinite(t.walkingMinutes) && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-500">
                            <FiClock className="w-3 h-3" /> {t.walkingMinutes} daq piyoda
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{t.title}</p>
                      {t.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t.description}</p>}
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Atmosfera */}
            {a.atmosphere && (a.atmosphere.mood || a.atmosphere.soundscape || a.atmosphere.bestTimeOfDay || a.atmosphere.localTip) && (
              <Section title="Joy atmosferasi" icon={<FiFeather />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {a.atmosphere.mood && (
                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-xl shrink-0">🌿</span>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Kayfiyat</p><p className="text-sm font-bold text-slate-800 dark:text-slate-200">{a.atmosphere.mood}</p></div>
                    </div>
                  )}
                  {a.atmosphere.bestTimeOfDay && (
                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-xl shrink-0">🕐</span>
                      <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Eng yaxshi vaqt</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300">{a.atmosphere.bestTimeOfDay}</p></div>
                    </div>
                  )}
                  {a.atmosphere.soundscape && (
                    <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl p-4 border border-indigo-100/30 dark:border-indigo-900/10 md:col-span-2">
                      <span className="text-xl shrink-0">🎵</span>
                      <div><p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider mb-1">Ovoz manzarasi</p><p className="text-sm italic font-medium text-slate-700 dark:text-slate-300 leading-relaxed">"{a.atmosphere.soundscape}"</p></div>
                    </div>
                  )}
                  {a.atmosphere.localTip && (
                    <div className="flex items-start gap-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl p-4 border border-amber-100/30 dark:border-amber-900/10 md:col-span-2">
                      <span className="text-xl shrink-0">💡</span>
                      <div><p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Mahalliy maslahat</p><p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{a.atmosphere.localTip}</p></div>
                    </div>
                  )}
                </div>
              </Section>
            )}

            {/* Inklyuziv qulayliklar */}
            {accFeatures.length > 0 && (
              <Section title="Inklyuziv qulayliklar" icon={<MdAccessible />}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-700 dark:text-slate-300 font-medium">
                  {accFeatures.map(([, label]) => (
                    <div key={label} className="flex items-center gap-2.5 py-0.5">
                      <FiCheck className="w-4 h-4 text-emerald-500 shrink-0" /><span>{label}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Reviews */}
            <Section title="Sayohatchilar fikri" icon={<FiStar />}>
              {/* Add review */}
              <form onSubmit={submitReview} className="mb-6 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-500">Bahongiz:</span>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button type="button" key={n} onClick={() => setReviewForm((p) => ({ ...p, rating: n }))}>
                      <FiStar className="w-5 h-5" style={{ color: n <= reviewForm.rating ? '#f59e0b' : '#cbd5e1', fill: n <= reviewForm.rating ? '#f59e0b' : 'none' }} />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm((p) => ({ ...p, comment: e.target.value }))}
                  placeholder="Bu joy haqida taassurotingiz..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm outline-none focus:border-amber-400 text-slate-800 dark:text-slate-100"
                />
                <button type="submit" disabled={submitting}
                  className="mt-3 px-5 py-2.5 rounded-xl font-bold text-sm text-white disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)' }}>
                  {submitting ? 'Yuborilmoqda...' : 'Sharh qoldirish'}
                </button>
                {!user && <p className="text-[11px] text-slate-400 mt-2">Sharh qoldirish uchun tizimga kirgan bo'lishingiz kerak.</p>}
              </form>

              <div className="space-y-5">
                {(a.reviews || []).slice().reverse().map((rv, i) => (
                  <div key={rv._id || i} className="pb-5 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-xl flex items-center justify-center font-black text-sm shrink-0">
                          {rv.name?.[0]?.toUpperCase() || 'M'}
                        </div>
                        <div>
                          <p className="font-black text-sm text-slate-800 dark:text-slate-200">{rv.name || 'Mehmon'}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{rv.createdAt ? new Date(rv.createdAt).toLocaleDateString('uz-UZ') : ''}</p>
                        </div>
                      </div>
                      <StarRow rating={rv.rating} />
                    </div>
                    {rv.comment && <p className="text-gray-700 dark:text-slate-300 text-sm italic">"{rv.comment}"</p>}
                  </div>
                ))}
                {(!a.reviews || a.reviews.length === 0) && <p className="text-gray-400 text-sm italic">Hozircha sharhlar yo'q. Birinchi bo'ling!</p>}
              </div>
            </Section>
          </div>

          {/* Right column: nearby stays */}
          <div className="w-full lg:w-[340px] shrink-0">
            <div className="lg:sticky lg:top-6">
              <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm">
                <h3 className="font-black text-slate-800 dark:text-white mb-1 text-[11px] uppercase tracking-wider flex items-center gap-2">
                  <FiHome className="text-indigo-600 w-4 h-4 shrink-0" /> Yaqin tunash joylari
                </h3>
                <p className="text-[11px] text-slate-500 mb-4">10 km radiusdagi dam olish maskanlari. Eng yaqini avtomatik tanlangan — egasi bilan suhbatlashing.</p>

                {nearby.length > 0 ? (
                  <div className="space-y-4">
                    {/* Eng yaqin tunash joyi — avtomatik tanlangan */}
                    <div className="rounded-2xl border-2 border-indigo-300 dark:border-indigo-700/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-2.5">
                      <div className="flex items-center justify-between gap-2 mb-2 px-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-600 text-white flex items-center gap-1">
                          <FiStar className="w-2.5 h-2.5 fill-current" /> Eng yaqin
                        </span>
                        {Number.isFinite(nearby[0].distanceKm) && (
                          <span className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                            <FiNavigation className="w-3 h-3" /> {nearby[0].distanceKm} km
                          </span>
                        )}
                      </div>
                      <HotelCard hotel={nearby[0]} />
                    </div>

                    {/* Qolgan yaqin joylar */}
                    {nearby.length > 1 && (
                      <>
                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 pt-1 ml-1">Boshqa yaqin joylar</p>
                        {nearby.slice(1).map((h) => (
                          <div key={h._id}>
                            <HotelCard hotel={h} />
                            {Number.isFinite(h.distanceKm) && (
                              <p className="text-[11px] font-bold text-indigo-500 mt-1.5 ml-1 flex items-center gap-1">
                                <FiNavigation className="w-3 h-3" /> Taxminan {h.distanceKm} km uzoqlikda
                              </p>
                            )}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic py-4 text-center">Yaqin atrofda tunash maskani topilmadi.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 360 Video Modal */}
        {videoOpen && a.video360?.url && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90" onClick={() => setVideoOpen(false)}>
            <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden bg-black border border-white/10" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setVideoOpen(false)} className="absolute top-4 right-4 z-[510] bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all">
                <FiX className="text-xl" />
              </button>
              {a.video360.type === 'file' ? (
                <video src={resolveMediaUrl(a.video360.url)} controls autoPlay className="w-full h-full">
                  {a.video360.captioned && <track kind="captions" />}
                </video>
              ) : (
                <iframe src={getYouTubeEmbedUrl(a.video360.url)} title="360 video" className="w-full h-full border-0" allow="autoplay; fullscreen" allowFullScreen />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttractionDetail;
