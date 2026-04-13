import { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapView from '../components/MapView';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import {
  FiWifi, FiDroplet, FiHeart, FiCoffee, FiMapPin, FiWind,
  FiBriefcase, FiMap, FiCheckCircle, FiShield, FiFrown,
  FiUsers, FiStar, FiEdit3, FiCheck, FiPhone, FiMail,
  FiVolume2, FiVolumeX, FiX, FiTag, FiCalendar, FiAward,
  FiChevronRight
} from 'react-icons/fi';

const AMENITY_ICONS = {
  'Free WiFi': <FiWifi className="w-4 h-4" />,
  'Pool': <FiDroplet className="w-4 h-4" />,
  'Spa': <FiHeart className="w-4 h-4" />,
  'Restaurant': <FiCoffee className="w-4 h-4" />,
  'Gym': <FiCheckCircle className="w-4 h-4" />,
  'Parking': <FiMapPin className="w-4 h-4" />,
  'Air Conditioning': <FiWind className="w-4 h-4" />,
  'Airport Shuttle': <FiMap className="w-4 h-4" />,
  'Bar': <FiCoffee className="w-4 h-4" />,
  'Meeting Rooms': <FiBriefcase className="w-4 h-4" />,
};

const Section = ({ title, icon, children, className = '' }) => (
  <div className={`glass-panel p-5 sm:p-6 ${className}`} style={{ borderRadius: '1.75rem' }}>
    {title && (
      <h2 className="flex items-center gap-2 text-base font-extrabold mb-4" style={{ color: 'var(--text-main)' }}>
        <span style={{ color: '#6366f1' }}>{icon}</span> {title}
      </h2>
    )}
    {children}
  </div>
);

const StarRow = ({ rating, size = 'sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <FiStar key={i} className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
        style={{ color: i <= rating ? '#fbbf24' : 'var(--border)', fill: i <= rating ? '#fbbf24' : 'none' }} />
    ))}
  </div>
);

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [hotel, setHotel]               = useState(null);
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeImg, setActiveImg]       = useState(0);
  const [reviewForm, setReviewForm]     = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [audioModal, setAudioModal]     = useState(false);
  const [isReading, setIsReading]       = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true); setError(null);
      try {
        const [h, r] = await Promise.all([
          api.get(`/hotels/${id}`),
          api.get(`/reviews/hotel/${id}`)
        ]);
        setHotel(h.data);
        setReviews(r.data);
      } catch {
        setError("Mehmonxona topilmadi yoki server ishlamayapti.");
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
      const res = await api.post('/reviews', { hotelId: id, ...reviewForm });
      setReviews(p => [{ ...res.data, user: { name: user.name } }, ...p]);
      setReviewForm({ rating: 5, comment: '' });
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Loader message="Mehmonxona yuklanmoqda" />
    </div>
  );

  if (error || !hotel) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <FiFrown className="w-16 h-16 mb-4" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
      <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-main)' }}>Yuklab bo'lmadi</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{error}</p>
      <button onClick={() => navigate(-1)}
        className="btn-primary px-6 py-2.5 rounded-2xl font-bold text-sm text-white">
        Orqaga
      </button>
    </div>
  );

  const FALLBACK = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
  ];
  const images = hotel.images?.length ? hotel.images : FALLBACK;

  const name = typeof hotel.name === 'object'
    ? (hotel.name.uz || hotel.name.en || Object.values(hotel.name)[0])
    : hotel.name;

  const desc = typeof hotel.description === 'object'
    ? (hotel.description.uz || hotel.description.en || '')
    : hotel.description;

  const price = hotel.basePricePerNight || hotel.pricePerNight || hotel.rooms?.[0]?.pricePerNight || 0;

  const imgSrc = (src) => src?.startsWith('http')
    ? src
    : `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}/${src}`;

  return (
    <div className="pb-28 md:pb-8 max-w-7xl mx-auto lg:pl-32">

      {/* ── Gallery ── */}
      <div className="px-0 sm:px-4 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3" style={{ height: 'clamp(260px, 50vh, 480px)' }}>
          {/* Main image */}
          <div className="md:col-span-3 h-full overflow-hidden relative group rounded-b-[2rem] sm:rounded-[2rem]">
            <div className="absolute top-4 left-4 z-20"><BackButton /></div>
            <img
              src={imgSrc(images[activeImg])}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
            {/* Dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 px-4 py-2 rounded-full z-10"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                {images.map((_, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className="rounded-full transition-all"
                    style={{ width: i === activeImg ? 24 : 8, height: 8, background: i === activeImg ? 'white' : 'rgba(255,255,255,0.45)' }} />
                ))}
              </div>
            )}
          </div>
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3 h-full">
            {images.slice(1, 3).map((img, i) => (
              <div key={i} className="flex-1 overflow-hidden rounded-[2rem] relative group cursor-pointer"
                onClick={() => setActiveImg(i + 1)}>
                <img src={imgSrc(img)} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(99,102,241,0.15)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col lg:flex-row gap-8">

        {/* ── Left column ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">

          {/* Header */}
          <div className="glass-panel p-5 sm:p-7" style={{ borderRadius: '1.75rem' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                    {hotel.category || 'Hotel'}
                  </span>
                  {hotel.stars > 0 && (
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: hotel.stars }).map((_, i) => (
                        <FiStar key={i} className="w-3.5 h-3.5 text-amber-400" style={{ fill: '#fbbf24' }} />
                      ))}
                    </div>
                  )}
                  <span className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <FiCheckCircle className="w-3 h-3" /> Tasdiqlangan
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight mb-2" style={{ color: 'var(--text-main)' }}>
                  {name}
                </h1>
                {(hotel.address || hotel.city) && (
                  <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                    <FiMapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    {[hotel.address, hotel.city, hotel.country].filter(Boolean).join(', ')}
                  </p>
                )}
              </div>
              {/* Rating badge */}
              {hotel.rating > 0 && (
                <div className="shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', minWidth: 72 }}>
                  <span className="text-2xl font-black text-white leading-none">{hotel.rating.toFixed(1)}</span>
                  <FiStar className="w-3.5 h-3.5 text-amber-300 my-1" style={{ fill: '#fcd34d' }} />
                  <span className="text-[9px] font-bold text-indigo-200 uppercase tracking-wider">
                    {reviews.length} sharh
                  </span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid var(--border)' }}>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                  Bir kecha uchun
                </p>
                <p className="text-2xl font-black" style={{ color: '#6366f1' }}>
                  {new Intl.NumberFormat('uz-UZ').format(price)}
                  <span className="text-sm font-bold ml-1" style={{ color: 'var(--text-muted)' }}>UZS</span>
                </p>
              </div>
              <button
                onClick={() => setAudioModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-95"
                style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 16px -6px rgba(99,102,241,0.5)' }}
              >
                <FiVolume2 className="w-4 h-4" /> Ovozli o'qish
              </button>
            </div>
          </div>

          {/* Description */}
          {desc && (
            <Section title="Mehmonxona haqida" icon={<FiAward className="w-4 h-4" />}>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              {(hotel.checkIn || hotel.checkOut) && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  {hotel.checkIn && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                      <FiCalendar className="w-3.5 h-3.5" /> Kirish: {hotel.checkIn}
                    </div>
                  )}
                  {hotel.checkOut && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                      style={{ background: 'rgba(244,63,94,0.08)', color: '#f43f5e' }}>
                      <FiCalendar className="w-3.5 h-3.5" /> Chiqish: {hotel.checkOut}
                    </div>
                  )}
                </div>
              )}
            </Section>
          )}

          {/* Amenities + Accessibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hotel.amenities?.length > 0 && (
              <Section title="Qulayliklar" icon={<FiCheckCircle className="w-4 h-4" />}>
                <div className="flex flex-col gap-2.5">
                  {hotel.amenities.map(a => (
                    <div key={a} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}>
                        {AMENITY_ICONS[a] || <FiCheck className="w-4 h-4" />}
                      </div>
                      <span className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{a}</span>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {hotel.accessibility && Object.values(hotel.accessibility).some(v => typeof v === 'boolean' && v) && (
              <Section title="Maxsus qulayliklar" icon={<FiUsers className="w-4 h-4" />}>
                <div className="flex flex-wrap gap-2">
                  {[
                    ['wheelchairAccessible', 'Nogironlar aravachasi'],
                    ['elevator', 'Lift'],
                    ['brailleSigns', 'Brayl yozuvi'],
                    ['hearingAssistance', 'Eshitish moslamasi'],
                    ['wideDoors', 'Keng eshiklar'],
                  ].map(([k, l]) => hotel.accessibility?.mobility?.[k] && (
                    <span key={k} className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                      {l}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>

          {/* Rooms */}
          {hotel.rooms?.length > 0 && (
            <div>
              <h2 className="text-lg font-extrabold mb-3 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
                <FiBriefcase className="w-4 h-4 text-indigo-500" />
                Xona turlari
                <span className="text-xs font-black px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                  {hotel.rooms.length} ta
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {hotel.rooms.map(r => (
                  <div key={r._id} className="glass-panel p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between"
                    style={{ borderRadius: '1.5rem' }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-main)' }}>{r.name}</h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                          {r.category}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>
                        <span className="flex items-center gap-1"><FiUsers className="w-3.5 h-3.5" /> {r.capacity} kishi</span>
                        {r.areaSqMeters && <span className="flex items-center gap-1"><FiMap className="w-3.5 h-3.5" /> {r.areaSqMeters} m²</span>}
                        {r.bedType && <span className="flex items-center gap-1"><FiBriefcase className="w-3.5 h-3.5" /> {r.bedType}</span>}
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
                      <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Bir kecha</p>
                        <p className="text-lg font-black" style={{ color: '#6366f1' }}>
                          {new Intl.NumberFormat('uz-UZ').format(r.pricePerNight || 0)}
                          <span className="text-xs font-bold ml-1" style={{ color: 'var(--text-muted)' }}>UZS</span>
                        </p>
                      </div>
                      <span className={`text-[11px] font-black px-3 py-1.5 rounded-xl ${r.roomsAvailable > 0 ? '' : ''}`}
                        style={{
                          background: r.roomsAvailable > 0 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                          color: r.roomsAvailable > 0 ? '#10b981' : '#ef4444',
                          border: `1px solid ${r.roomsAvailable > 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                        }}>
                        {r.roomsAvailable > 0 ? `${r.roomsAvailable} ta bo'sh` : 'Band'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {hotel.security?.length > 0 && (
            <Section title="Xavfsizlik" icon={<FiShield className="w-4 h-4" />}>
              <div className="flex flex-wrap gap-2">
                {hotel.security.map(s => (
                  <span key={s} className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--bg-main)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                    <FiCheck className="w-3 h-3 text-indigo-400" /> {s}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {/* Nearby + Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {hotel.nearbyPlaces?.length > 0 && (
              <Section title="Yaqin joylar" icon={<FiMapPin className="w-4 h-4" />}>
                <div className="flex flex-col gap-2">
                  {hotel.nearbyPlaces.map(p => (
                    <div key={p} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: 'var(--bg-main)', color: 'var(--text-main)', border: '1px solid var(--border)' }}>
                      <FiMap className="w-4 h-4 text-indigo-400 shrink-0" /> {p}
                    </div>
                  ))}
                </div>
              </Section>
            )}
            <div>
              <h2 className="flex items-center gap-2 text-base font-extrabold mb-3" style={{ color: 'var(--text-main)' }}>
                <FiMap className="w-4 h-4 text-emerald-500" /> Xaritada
              </h2>
              <MapView hotel={hotel} />
            </div>
          </div>

          {/* Owner */}
          {hotel.owner && (
            <Section title="Ma'muriyat" icon={<FiUsers className="w-4 h-4" />}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shrink-0"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                  {hotel.owner.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-sm mb-1" style={{ color: 'var(--text-main)' }}>
                    {hotel.owner.name || "Noma'lum"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {hotel.owner.phone && (
                      <a href={`tel:${hotel.owner.phone}`}
                        className="flex items-center gap-1.5 text-xs font-bold"
                        style={{ color: '#6366f1' }}>
                        <FiPhone className="w-3.5 h-3.5" /> {hotel.owner.phone}
                      </a>
                    )}
                    {hotel.owner.email && (
                      <a href={`mailto:${hotel.owner.email}`}
                        className="flex items-center gap-1.5 text-xs font-bold"
                        style={{ color: '#6366f1' }}>
                        <FiMail className="w-3.5 h-3.5" /> {hotel.owner.email}
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Section>
          )}

          {/* Reviews */}
          <div>
            <h2 className="text-lg font-extrabold mb-4 flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
              <FiStar className="w-4 h-4 text-amber-400" style={{ fill: '#fbbf24' }} />
              Mehmon sharhlari
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                {reviews.length}
              </span>
            </h2>

            {/* Review form */}
            {user && user.role !== 'GUEST' ? (
              <form onSubmit={submitReview} className="glass-panel p-5 mb-4" style={{ borderRadius: '1.5rem' }}>
                <p className="font-extrabold text-sm mb-3" style={{ color: 'var(--text-main)' }}>Sharh yozing</p>
                <div className="flex gap-1.5 mb-3">
                  {[1,2,3,4,5].map(s => (
                    <button type="button" key={s}
                      onClick={() => setReviewForm(p => ({ ...p, rating: s }))}
                      className="transition-transform hover:scale-125 active:scale-95">
                      <FiStar className="w-6 h-6"
                        style={{ color: s <= reviewForm.rating ? '#fbbf24' : 'var(--border)', fill: s <= reviewForm.rating ? '#fbbf24' : 'none' }} />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Tajribangizni ulashing..."
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  required rows={3}
                  className="w-full px-4 py-3 text-sm font-medium rounded-2xl outline-none resize-none mb-3"
                  style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', color: 'var(--text-main)' }}
                />
                <button type="submit" disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm text-white disabled:opacity-60"
                  style={{ background: 'var(--gradient-main)' }}>
                  {submitting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                </button>
              </form>
            ) : !user ? (
              <div className="glass-panel p-5 mb-4 flex items-center justify-between gap-4" style={{ borderRadius: '1.5rem' }}>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Sharh yozish uchun tizimga kiring
                </p>
                <button onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm text-white shrink-0"
                  style={{ background: 'var(--gradient-main)' }}>
                  Kirish <FiChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : null}

            {/* Reviews list */}
            {reviews.length > 0 ? (
              <div className="flex flex-col gap-3">
                {reviews.map(rv => (
                  <div key={rv._id} className="glass-panel p-4" style={{ borderRadius: '1.5rem' }}>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0"
                          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                          {rv.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: 'var(--text-main)' }}>{rv.user?.name || 'Mehmon'}</p>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            {new Date(rv.createdAt).toLocaleDateString('uz-UZ')}
                          </p>
                        </div>
                      </div>
                      <StarRow rating={rv.rating} />
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{rv.comment}</p>
                    {rv.ownerReply && (
                      <div className="mt-3 pl-3 pt-3" style={{ borderTop: '1px solid var(--border)', borderLeft: '2px solid #6366f1' }}>
                        <p className="text-[11px] font-black text-indigo-500 mb-1">Egasining javobi</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{rv.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass-panel flex flex-col items-center py-12 text-center" style={{ borderRadius: '1.5rem' }}>
                <FiEdit3 className="w-10 h-10 mb-3" style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
                  Hali sharh yo'q. Birinchi bo'ling!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: booking widget placeholder ── */}
        <div className="lg:w-80 shrink-0">
          <div className="sticky top-4">
            {/* AvailabilityChecker will go here */}
          </div>
        </div>
      </div>

      {/* ── Audio modal ── */}
      {audioModal && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
          onClick={() => { setAudioModal(false); setIsReading(false); }}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(6px)' }} />
          <div className="relative w-full max-w-sm p-7 rounded-[2rem] shadow-2xl"
            style={{ background: 'linear-gradient(145deg,#1e1b4b,#312e81)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={e => e.stopPropagation()}>
            <button onClick={() => { setAudioModal(false); setIsReading(false); }}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }}>
              <FiX className="w-4 h-4" />
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative"
                style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
                {isReading && <div className="absolute inset-0 rounded-full animate-ping" style={{ background: 'rgba(99,102,241,0.3)' }} />}
                {isReading
                  ? <FiVolumeX className="w-7 h-7 text-indigo-300 relative z-10" />
                  : <FiVolume2 className="w-7 h-7 text-indigo-300 relative z-10" />
                }
              </div>
              <h3 className="text-lg font-black text-white mb-1">Ovozli o'qish</h3>
              <p className="text-indigo-300 text-xs text-center">
                Tez orada Gemini AI orqali mehmonxona tavsifini o'zbek tilida ovozli o'qiydi.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setIsReading(r => !r)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold text-sm text-white"
                style={{ background: isReading ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
                {isReading ? <><FiVolumeX className="w-4 h-4" /> To'xtatish</> : <><FiVolume2 className="w-4 h-4" /> Demo</>}
              </button>
              <button onClick={() => { setAudioModal(false); setIsReading(false); }}
                className="px-5 py-3 rounded-2xl font-bold text-sm"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#c7d2fe' }}>
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetail;
