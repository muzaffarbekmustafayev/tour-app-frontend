import { useEffect, useState, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Removed MapView import
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import ChatWidget from '../components/ChatWidget';
import ComingSoonModal from '../components/ComingSoonModal';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Thumbs, FreeMode } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import {
  FiWifi, FiDroplet, FiHeart, FiCoffee, FiMapPin, FiWind,
  FiBriefcase, FiMap, FiCheckCircle, FiShield, FiFrown,
  FiUsers, FiStar, FiCheck, FiPhone, FiMail,
  FiVolume2, FiX, FiCalendar, FiAward,
  FiRotateCw, FiMaximize, FiExternalLink, FiFeather,
  FiSun, FiMusic, FiNavigation
} from 'react-icons/fi';
import {
  MdAccessible, MdHearing, MdVisibility,
  MdFamilyRestroom, MdLocalHospital, MdSignLanguage,
  MdElectricBolt,
} from 'react-icons/md';
import { TbWheelchair, TbBraille, TbEar, TbHandStop } from 'react-icons/tb';
import { calcAccessibilityScore, getScoreStyle } from '../utils/accessibilityScore';

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

const Section = ({ title, icon, children, className = '', id = '' }) => (
  <div className={`bg-white/95 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 p-6 md:p-8 rounded-2xl mb-6 shadow-sm transition-all hover:shadow-md ${className}`} id={id}>
    {title && (
      <h2 className="flex items-center gap-3 text-[13px] font-black mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-white uppercase tracking-wider">
        <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm">{icon}</span> {title}
      </h2>
    )}
    {children}
  </div>
);

const StarRow = ({ rating, size = 'sm' }) => (
  <div className="flex items-center gap-0.5">
    {[1,2,3,4,5].map(i => (
      <FiStar key={i} className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}
        style={{ color: i <= rating ? '#f59e0b' : '#e2e8f0', fill: i <= rating ? '#f59e0b' : 'none' }} />
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
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [reviewForm, setReviewForm]     = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [ttsModal, setTtsModal]           = useState(false);
  const [videoModal, setVideoModal]       = useState(false);
  const [panoramaModal, setPanoramaModal] = useState(null); // aktiv panorama indeksi

  useEffect(() => {
    const handleScroll = () => {
      const header = document.getElementById('sticky-header');
      if (header) {
        if (window.scrollY > 300) {
          header.style.transform = 'translateY(0)';
          header.style.opacity = '1';
        } else {
          header.style.transform = 'translateY(-100%)';
          header.style.opacity = '0';
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
        setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
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
    } catch (err) {
      console.error('[HotelDetail] Sharh yuborishda xatolik:', err.message);
    } finally { setSubmitting(false); }
  };

  // Ovozli tinglash (TTS) hozircha ishlab chiqilmoqda — "Tez orada" modali ko'rsatiladi
  const speakDescription = () => {
    setTtsModal(true);
  };


  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Loader message="Yuklanmoqda..." />
    </div>
  );

  if (error || !hotel) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <FiFrown className="w-12 h-12 mb-4 text-gray-400" />
      <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">Xatolik yuz berdi</h2>
      <p className="text-gray-500 mb-6 text-sm">{error}</p>
      <button onClick={() => navigate(-1)}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white font-semibold transition-colors">
        Orqaga
      </button>
    </div>
  );

  const images = hotel.images?.length ? hotel.images : [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000'
  ];
  const name = hotel.name;
  const desc = hotel.description;
  const price = hotel.basePricePerNight || hotel.pricePerNight || hotel.rooms?.[0]?.pricePerNight || 0;

  const imgSrc = (src) => src?.startsWith('http')
    ? src
    : `${import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:5000'}/${src}`;

  // Build accessibility feature list with react-icons
  const accessFeatures = [
    [hotel.accessibility?.mobility?.wheelchairAccessible, <TbWheelchair className="w-4 h-4 text-indigo-500" />, "Aravacha uchun yo'l"],
    [hotel.accessibility?.mobility?.elevator,             <MdElectricBolt className="w-4 h-4 text-violet-500" />, 'Keng liftlar'],
    [hotel.accessibility?.mobility?.accessibleParking,    <MdAccessible className="w-4 h-4 text-blue-500" />,    'Maxsus parking'],
    [hotel.accessibility?.visual?.brailleSigns,           <TbBraille className="w-4 h-4 text-emerald-500" />,    'Brayl yozuvlari'],
    [hotel.accessibility?.visual?.tactilePaving,          <MdVisibility className="w-4 h-4 text-teal-500" />,    "Taktil yo'lakcha"],
    [hotel.accessibility?.visual?.highContrastSignage,    <MdVisibility className="w-4 h-4 text-green-500" />,   'Kontrast belgilar'],
    [hotel.accessibility?.auditory?.hearingAssistance,    <TbEar className="w-4 h-4 text-sky-500" />,            'Eshitish uskunalari'],
    [hotel.accessibility?.auditory?.signLanguageStaff,    <MdSignLanguage className="w-4 h-4 text-cyan-500" />,  'Imo-ishora tili xodimi'],
    [hotel.accessibility?.auditory?.audioGuides,          <MdHearing className="w-4 h-4 text-blue-400" />,       "Ovozli yo'riqnoma"],
    [hotel.accessibility?.cognitive?.quietZones,          <TbHandStop className="w-4 h-4 text-amber-500" />,     'Shovqinsiz hudud'],
    [hotel.familyAndElderly?.strollerAccessible,          <MdFamilyRestroom className="w-4 h-4 text-pink-500" />, 'Bolalar aravachasi'],
    [hotel.familyAndElderly?.medicalServiceOnSite,        <MdLocalHospital className="w-4 h-4 text-red-500" />,  'Tibbiy yordam punkti'],
  ].filter(([cond]) => cond);

  // Reja 6: accessibility skori hisoblash
  const accScore   = calcAccessibilityScore(hotel);
  const scoreStyle = getScoreStyle(accScore);
  const srText     = hotel?.digitalInclusion?.screenReaderDescription || '';

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
        
        {/* ── Sticky Mobile Header ── */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-[160] bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-3 transform translate-y-[-100%] opacity-0 transition-all shadow-sm" id="sticky-header">
           <div className="flex items-center gap-3">
              <BackButton className="static" />
              <h2 className="text-sm font-bold truncate text-gray-900 dark:text-white">{name}</h2>
           </div>
        </div>

        {/* ── Floating Mobile Bar ── — Kirish/Chiqish vaqtlari */}
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-[150] px-4 animate-slide-up">
          <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between shadow-2xl border border-gray-100 dark:border-slate-800 rounded-2xl">
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Kirish</p>
                <p className="font-bold text-gray-900 dark:text-white">{hotel?.checkIn || '14:00'}</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-slate-700" />
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Chiqish</p>
                <p className="font-bold text-gray-900 dark:text-white">{hotel?.checkOut || '12:00'}</p>
              </div>
            </div>
            {hotel?.contact?.phone && (
              <a href={`tel:${hotel.contact.phone}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-white shrink-0 transition-all hover:brightness-110"
                style={{ background: 'var(--gradient-main)' }}
              >
                <FiPhone className="w-4 h-4" /> Bog'lanish
              </a>
            )}
          </div>
        </div>

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="mb-4"><BackButton /></div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                hotel.category === 'resort' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' :
                hotel.category === 'hostel' ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30' :
                'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30'
              }`}>
                {hotel.category === 'hotel' ? 'Mehmonxona' : hotel.category === 'resort' ? 'Dam olish maskani' : 'Hostel'}
              </span>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/80 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-800">
                <StarRow rating={hotel.stars} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3 leading-tight">{name}</h1>
            <p className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-semibold">
              <FiMapPin className="text-rose-500 w-4 h-4 shrink-0" /> <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">{hotel.address}, {hotel.city}</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/20 dark:to-indigo-900/10 p-4 rounded-2xl flex items-center gap-3.5 border border-indigo-100/80 dark:border-indigo-900/30 shadow-sm shrink-0 hover:scale-[1.02] transition-transform duration-300">
             <div className="bg-indigo-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-md shadow-indigo-600/20 shrink-0">
                {hotel.rating?.toFixed(1) || '0.0'}
             </div>
             <div>
                <p className="font-black text-indigo-950 dark:text-indigo-200 text-sm leading-tight">{hotel.rating >= 4.7 ? 'Mukammal' : hotel.rating >= 4.3 ? 'Juda yaxshi' : hotel.rating >= 4.0 ? 'Ajoyib' : 'Yaxshi'}</p>
                <p className="text-xs font-bold text-indigo-600/85 dark:text-indigo-400/85 mt-0.5">{reviews.length} ta sharh</p>
             </div>
          </div>
        </div>

        {/* ── Gallery (Swiper Carousel) ── */}
        <div className="mb-8">
          {/* Main Swiper */}
          <div className="gallery-swiper-main relative rounded-xl overflow-hidden border border-gray-200 dark:border-slate-800 shadow-sm">
            <Swiper
              modules={[Navigation, Pagination, Thumbs]}
              navigation={{
                nextEl: '.gallery-next',
                prevEl: '.gallery-prev',
              }}
              pagination={{ clickable: true, dynamicBullets: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              onSlideChange={(s) => setActiveImg(s.activeIndex)}
              loop={images.length > 1}
              className="w-full h-full"
              style={{ '--swiper-pagination-color': '#2563eb', '--swiper-pagination-bullet-inactive-color': '#fff', '--swiper-pagination-bullet-inactive-opacity': '0.6' }}
            >
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <img
                    src={imgSrc(img)}
                    alt={`${name} - ${i + 1}`}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? 'eager' : 'lazy'}
                  />
                </SwiperSlide>
              ))}

              {/* Nav buttons */}
              <button className="gallery-prev absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-slate-700 hover:bg-white transition-all active:scale-95">
                <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button className="gallery-next absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/90 dark:bg-slate-800/90 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-slate-700 hover:bg-white transition-all active:scale-95">
                <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
              </button>

              {/* Rasm soni badge */}
              <div className="absolute top-3 right-3 z-10 bg-black/50 text-white text-[11px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                {activeImg + 1} / {images.length}
              </div>

              {/* Media tugmalari */}
              <div className="absolute bottom-12 left-3 z-10 flex gap-2">
                {hotel.videoTour?.url && (
                  <button
                    onClick={() => setVideoModal(true)}
                    className="bg-white/90 text-blue-600 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg border border-gray-200 transition active:scale-95 hover:bg-white"
                  >
                    <FiRotateCw className="w-3.5 h-3.5" />
                    Video tur
                    {hotel.videoTour.captioned && (
                      <span className="ml-1 bg-blue-100 text-blue-700 text-[9px] font-black px-1 py-0.5 rounded">CC</span>
                    )}
                  </button>
                )}
                {hotel.panoramas?.length > 0 && (
                  <button
                    onClick={() => setPanoramaModal(0)}
                    className="bg-white/90 text-indigo-600 px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-lg border border-gray-200 transition active:scale-95 hover:bg-white"
                  >
                    <FiMaximize className="w-3.5 h-3.5" />
                    360° Ko'rinish
                  </button>
                )}
              </div>
            </Swiper>
          </div>

          {/* Thumbnail Swiper — 2 va undan ko'p rasm bo'lsa ko'rsatiladi */}
          {images.length > 1 && (
            <div className="mt-2">
              <Swiper
                modules={[FreeMode, Thumbs]}
                onSwiper={setThumbsSwiper}
                spaceBetween={6}
                slidesPerView="auto"
                freeMode
                watchSlidesProgress
                className="thumb-swiper"
              >
                {images.map((img, i) => (
                  <SwiperSlide key={i} style={{ width: '72px', height: '52px' }}>
                    <div className={`w-full h-full rounded-md overflow-hidden cursor-pointer border-2 transition-all ${activeImg === i ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'}`}>
                      <img src={imgSrc(img)} alt={`thumb-${i}`} className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Column ── */}
          <div className="flex-1 min-w-0">
            
            <Section title="Mehmonxona haqida" icon={<FiAward />}>
              {/* Reja 3.3: screenReaderDescription ARIA ulash */}
              <article aria-describedby={srText ? `sr-desc-${hotel._id}` : undefined}>
                {srText && <p id={`sr-desc-${hotel._id}`} className="sr-only">{srText}</p>}
                <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{desc}</p>
              </article>
              {/* Ovozli tinglash — hozircha "Tez orada" */}
              <button
                onClick={speakDescription}
                className="mt-4 font-bold text-xs flex items-center gap-1.5 transition-colors text-blue-600 hover:text-blue-700"
              >
                <FiVolume2 />
                Ovozli tinglash (o'zbek tili)
              </button>
            </Section>

            {/* ── Atmosfera ── */}
            {hotel.atmosphere && (hotel.atmosphere.mood || hotel.atmosphere.soundscape || hotel.atmosphere.bestTimeOfDay || hotel.atmosphere.localTip) && (
              <Section title="Joy atmosferasi" icon={<FiFeather />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.atmosphere.mood && (
                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-xl shrink-0 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">🌿</span>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Umumiy kayfiyat</p>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{hotel.atmosphere.mood}</p>
                      </div>
                    </div>
                  )}
                  {hotel.atmosphere.bestTimeOfDay && (
                    <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/30 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="text-xl shrink-0 p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">🕐</span>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Eng yaxshi vaqt</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{hotel.atmosphere.bestTimeOfDay}</p>
                      </div>
                    </div>
                  )}
                  {hotel.atmosphere.soundscape && (
                    <div className="flex items-start gap-3 bg-indigo-50/50 dark:bg-indigo-950/10 rounded-xl p-4 border border-indigo-100/30 dark:border-indigo-900/10 md:col-span-2 shadow-sm">
                      <span className="text-xl shrink-0 p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">🎵</span>
                      <div>
                        <p className="text-[10px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-wider mb-1">Ovoz manzarasi</p>
                        <p className="text-sm italic font-medium text-slate-700 dark:text-slate-300 leading-relaxed">"{hotel.atmosphere.soundscape}"</p>
                      </div>
                    </div>
                  )}
                  {hotel.atmosphere.localTip && (
                    <div className="flex items-start gap-3 bg-amber-50/50 dark:bg-amber-950/10 rounded-xl p-4 border border-amber-100/30 dark:border-amber-900/10 md:col-span-2 shadow-sm">
                      <span className="text-xl shrink-0 p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">💡</span>
                      <div>
                        <p className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Mahalliy maslahat</p>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{hotel.atmosphere.localTip}</p>
                      </div>
                    </div>
                  )}
                </div>
              </Section>
            )}

              <div id="rooms" className="scroll-mt-4 mb-8">
              <h2 className="text-[13px] font-black text-slate-800 dark:text-white mb-5 uppercase tracking-wider flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 shadow-sm"><FiBriefcase className="w-4 h-4" /></span> Mavjud xonalar
              </h2>
              <div className="space-y-4">
                {hotel.rooms?.map(r => (
                  <div key={r._id} className="bg-white/85 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row justify-between gap-5 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all duration-300">
                    <div className="flex-1">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-2 leading-snug">{r.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3 font-semibold">
                        <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800"><FiUsers className="w-3.5 h-3.5 text-indigo-500" /> {r.capacity} kishi</span>
                        {r.areaSqMeters && <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800"><FiMaximize className="w-3.5 h-3.5 text-violet-500" /> {r.areaSqMeters} m²</span>}
                        {r.bedType && <span className="bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 capitalize text-slate-600 dark:text-slate-300">{r.bedType}</span>}
                        {r.bathroomType && <span className="bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800 capitalize text-slate-600 dark:text-slate-300">{r.bathroomType === 'private' ? 'Alohida hammom' : 'Umumiy hammom'}</span>}
                      </div>
                      {r.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                           {r.amenities.slice(0, 4).map(a => (
                             <span key={a} className="text-[10px] font-black px-2.5 py-1 rounded-lg"
                               style={{ background: 'rgba(99,102,241,0.07)', color: '#6366f1', border: '1px solid rgba(99,102,241,0.15)' }}>
                               {a}
                             </span>
                           ))}
                        </div>
                      )}
                    </div>
                    {/* Narx — boshlang'ich narx */}
                    {r.pricePerNight > 0 && (
                      <div className="flex flex-col md:items-end justify-center border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6 shrink-0">
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mb-1">Boshlang'ich narx</p>
                        <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                          {new Intl.NumberFormat('uz-UZ').format(r.pricePerNight)} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">UZS / tun</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5">Muassasa bilan kelishiladi</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
               <Section title="Qulayliklar" icon={<FiCheckCircle />} className="mb-0">
                  <div className="grid grid-cols-1 gap-2.5 text-xs text-gray-700 dark:text-slate-300 font-medium">
                     {hotel.amenities?.map(a => (
                       <div key={a} className="flex items-center gap-3">
                          <span className="text-blue-600">{AMENITY_ICONS[a] || <FiCheck />}</span> {a}
                       </div>
                     ))}
                  </div>
               </Section>

               {/* ── Inklyuziv qulayliklar — react-icons bilan ── */}
               <Section title="Inklyuziv qulayliklar" icon={<MdAccessible />} className="mb-0">
                  <div className="grid grid-cols-1 gap-2 text-xs text-gray-700 dark:text-slate-300 font-medium">
                    {accessFeatures.length > 0 ? (
                      accessFeatures.map(([, icon, label]) => (
                        <div key={label} className="flex items-center gap-3 py-0.5">
                          <span className="shrink-0">{icon}</span>
                          <span>{label}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 italic text-xs">Ma'lumot mavjud emas</p>
                    )}
                  </div>
               </Section>
            </div>

            <Section title="Mijozlar fikri" icon={<FiStar />}>
               <div className="space-y-6">
                {reviews.map(rv => (
                  <div key={rv._id} className="pb-6 border-b border-gray-100 dark:border-slate-800 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-xl flex items-center justify-center font-black text-sm shadow-md shadow-indigo-500/10 shrink-0">
                            {rv.user?.name?.[0]?.toUpperCase() || 'M'}
                         </div>
                         <div>
                            <p className="font-black text-sm text-slate-800 dark:text-slate-200">{rv.user?.name || 'Mehmon'}</p>
                            <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(rv.createdAt).toLocaleDateString('uz-UZ')}</p>
                         </div>
                      </div>
                      <StarRow rating={rv.rating} />
                    </div>
                    <p className="text-gray-700 dark:text-slate-300 text-sm italic">"{rv.comment}"</p>
                  </div>
                ))}
                {reviews.length === 0 && <p className="text-gray-400 text-sm italic">Hozircha sharhlar yo'q.</p>}
               </div>
            </Section>
          </div>

          {/* ── Right Column ── */}
          <div className="w-full lg:w-[320px] shrink-0">
             <div className="lg:sticky lg:top-6 space-y-6">
                
                 {/* ── Bog'lanish va ma'lumot bloki ── */}
                  <div className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                     <h3 className="font-black text-slate-800 dark:text-white mb-5 text-[11px] uppercase tracking-wider flex items-center gap-2">
                       <FiPhone className="text-indigo-600 w-4 h-4 shrink-0" /> Bog'lanish
                     </h3>

                     {/* Telefon */}
                     {(hotel.contact?.phone || hotel.owner?.phone) && (
                       <a href={`tel:${hotel.contact?.phone || hotel.owner?.phone}`}
                         className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black text-xs text-white mb-5 transition-all active:scale-97 hover:shadow-lg shadow-indigo-600/10"
                         style={{ background: 'var(--gradient-main)', boxShadow: '0 4px 14px -4px rgba(99,102,241,0.4)' }}
                       >
                         <FiPhone className="w-3.5 h-3.5 shrink-0" /> {hotel.contact?.phone || hotel.owner?.phone}
                       </a>
                     )}

                     {/* Email */}
                     {(hotel.contact?.email || hotel.owner?.email) && (
                       <a href={`mailto:${hotel.contact?.email || hotel.owner?.email}`}
                         className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors mb-4"
                       >
                         <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100/40 dark:border-indigo-900/20 shrink-0">
                           <FiMail className="w-4 h-4" />
                         </div>
                         <span className="text-xs font-black truncate">{hotel.contact?.email || hotel.owner?.email}</span>
                       </a>
                     )}

                     {/* Kirish / Chiqish */}
                     <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2 space-y-3.5 text-slate-600">
                       <div className="flex justify-between items-center">
                         <span className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500"><FiCalendar className="text-slate-400 w-3.5 h-3.5 shrink-0" /> Kirish vaqti</span>
                         <span className="font-extrabold text-slate-700 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">{hotel.checkIn || '14:00'}</span>
                       </div>
                       <div className="flex justify-between items-center">
                         <span className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-500"><FiCalendar className="text-slate-400 w-3.5 h-3.5 shrink-0" /> Chiqish vaqti</span>
                         <span className="font-extrabold text-slate-700 dark:text-slate-300 text-xs bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-800">{hotel.checkOut || '12:00'}</span>
                       </div>
                     </div>

                     {/* Inklyuzivlik skori */}
                     {accScore > 0 && (
                       <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                         <div
                           className="flex items-center gap-2 text-[10px] font-black uppercase px-3 py-2.5 rounded-xl shadow-sm"
                           style={{ background: scoreStyle.bg, color: scoreStyle.color, border: `1px solid ${scoreStyle.color}15` }}
                         >
                           <MdAccessible className="w-4 h-4 shrink-0" />
                           Inklyuzivlik: {accScore}% — {scoreStyle.label}
                         </div>
                         {accessFeatures.length > 0 && (
                           <p className="flex items-center gap-2 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider ml-1">
                             <MdAccessible className="w-4 h-4 shrink-0" /> {accessFeatures.length} ta maxsus qulaylik
                           </p>
                         )}
                       </div>
                     )}

                     {/* Boshlang'ich narx */}
                     {price > 0 && (
                       <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-wider mb-1">Boshlang'ich narx</p>
                         <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                           {new Intl.NumberFormat('uz-UZ').format(price)} <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">UZS</span>
                         </p>
                         <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1.5">* Kelishuv muassasa bilan to'g'ridan-to'g'ri bo'ladi</p>
                       </div>
                     )}
                  </div>

                <div id="map-section" className="bg-white/90 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                   <h3 className="font-black text-slate-800 dark:text-white mb-3 text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <FiMapPin className="text-rose-500 w-4 h-4 shrink-0" /> Joylashuv
                   </h3>
                   <p className="text-sm text-slate-600 dark:text-slate-400 mb-5 font-medium">
                      {hotel.address}, {hotel.city}, O'zbekiston
                   </p>
                   <button
                     onClick={() => navigate('/map', { state: { targetHotelId: hotel._id } })}
                     className="w-full py-3.5 rounded-xl font-black text-xs text-white transition-all active:scale-95 hover:shadow-lg flex items-center justify-center gap-2"
                     style={{ background: 'var(--gradient-main)' }}
                   >
                     <FiNavigation className="w-4 h-4" /> Yo'nalishni ko'rish
                   </button>
                </div>

             </div>
          </div>
        </div>

        {/* ── Modals ── */}
        {/* Reja 5: audioModal o'chirildi — speakDescription to'g'ridan-to'g'ri ishlaydi */}

        {/* ── Video Modal ── */}
        {videoModal && hotel.videoTour?.url && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90" onClick={() => setVideoModal(false)}>
            <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden bg-black border border-white/10" onClick={e => e.stopPropagation()}>
              <button onClick={() => setVideoModal(false)} className="absolute top-4 right-4 z-[510] bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all">
                <FiX className="text-xl" />
              </button>
              <iframe
                src={getYouTubeEmbedUrl(hotel.videoTour.url)}
                title="Video tur"
                className="w-full h-full border-0"
                allowFullScreen
              />
              {hotel.videoTour.captioned && (
                <div className="absolute bottom-4 left-4 bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded">
                  CC — Subtitr mavjud
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Panorama Modal ── */}
        {panoramaModal !== null && hotel.panoramas?.length > 0 && (
          <div className="fixed inset-0 z-[500] flex flex-col bg-black/95" onClick={() => setPanoramaModal(null)}>
            <div className="relative flex-1 flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <button onClick={() => setPanoramaModal(null)} className="absolute top-4 right-4 z-[510] bg-white/10 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all">
                <FiX className="text-xl" />
              </button>
              <img
                src={imgSrc(hotel.panoramas[panoramaModal].url)}
                alt={hotel.panoramas[panoramaModal].caption || '360° panorama'}
                className="max-w-full max-h-full object-contain"
              />
              {hotel.panoramas[panoramaModal].caption && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs font-semibold px-4 py-2 rounded-full">
                  {hotel.panoramas[panoramaModal].caption}
                  {hotel.panoramas[panoramaModal].room && (
                    <span className="ml-2 opacity-60">· {hotel.panoramas[panoramaModal].room}</span>
                  )}
                </div>
              )}
            </div>
            {/* Panorama thumbnails */}
            {hotel.panoramas.length > 1 && (
              <div className="flex gap-2 justify-center pb-6 px-4 overflow-x-auto" onClick={e => e.stopPropagation()}>
                {hotel.panoramas.map((p, i) => (
                  <button key={i} onClick={() => setPanoramaModal(i)}
                    className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === panoramaModal ? 'border-white scale-105' : 'border-white/20 opacity-60 hover:opacity-100'}`}>
                    <img src={imgSrc(p.url)} alt={p.caption || `${i+1}-panorama`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <ChatWidget 
          hotelId={hotel._id} 
          ownerId={hotel.owner?._id || hotel.owner} 
          hotelName={hotel.name}
        />

        {/* Ovozli tinglash — "Tez orada" modali */}
        <ComingSoonModal
          open={ttsModal}
          onClose={() => setTtsModal(false)}
          icon={<FiVolume2 size={28} />}
          title="Ovozli tinglash tez orada"
          description="Matnni ovozga aylantirish (TTS) funksiyasi hozircha ishlab chiqilmoqda. Tez orada mehmonxona tavsifini o'zbek tilida tinglashingiz mumkin bo'ladi."
          notifyKey="tts"
        />

      </div>
    </div>
  );
};

const getYouTubeEmbedUrl = (url) => {
  if (!url) return '';
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
    : url;
};

export default HotelDetail;
