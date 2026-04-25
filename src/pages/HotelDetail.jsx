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
  FiUsers, FiStar, FiCheck, FiPhone, FiMail,
  FiVolume2, FiX, FiCalendar, FiAward,
  FiRotateCw, FiMaximize, FiExternalLink
} from 'react-icons/fi';
import {
  MdAccessible, MdHearing, MdVisibility,
  MdFamilyRestroom, MdLocalHospital, MdSignLanguage,
  MdElectricBolt,
} from 'react-icons/md';
import { TbWheelchair, TbBraille, TbEar, TbHandStop } from 'react-icons/tb';

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
  <div className={`bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 p-5 rounded-lg mb-6 shadow-sm ${className}`} id={id}>
    {title && (
      <h2 className="flex items-center gap-2 text-lg font-bold mb-4 pb-3 border-b border-gray-100 dark:border-slate-800 text-gray-800 dark:text-white">
        <span className="text-blue-600 dark:text-blue-400">{icon}</span> {title}
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
  const [reviewForm, setReviewForm]     = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting]     = useState(false);
  const [audioModal, setAudioModal]     = useState(false);
  const [videoModal, setVideoModal]     = useState(false);

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
    } catch { /* ignore */ }
    finally { setSubmitting(false); }
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

        {/* ── Floating Mobile Bar ── */}
        <div className="md:hidden fixed bottom-6 left-0 right-0 z-[150] px-4 animate-slide-up">
          <div className="bg-white dark:bg-slate-900 p-4 flex items-center justify-between shadow-2xl border border-gray-100 dark:border-slate-800 rounded-2xl">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Narxlar boshlanadi</p>
              <p className="text-lg font-bold text-blue-600 dark:text-blue-400 leading-none">
                {new Intl.NumberFormat('uz-UZ').format(price)} <span className="text-[10px] text-gray-500 uppercase">UZS</span>
              </p>
            </div>
          </div>
        </div>

        {/* ── Header ── */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="mb-4"><BackButton /></div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                {hotel.category}
              </span>
              <StarRow rating={hotel.stars} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">{name}</h1>
            <p className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 text-sm">
              <FiMapPin className="text-gray-400" /> {hotel.address}, {hotel.city}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg flex items-center gap-3 border border-blue-100 dark:border-blue-900/30">
             <div className="bg-blue-600 text-white w-10 h-10 rounded flex items-center justify-center font-bold text-lg">
                {hotel.rating?.toFixed(1) || '0.0'}
             </div>
             <div>
                <p className="font-bold text-blue-900 dark:text-blue-300 text-sm">Juda yaxshi</p>
                <p className="text-xs text-blue-700 dark:text-blue-400">{reviews.length} ta sharh</p>
             </div>
          </div>
        </div>

        {/* ── Gallery ── */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 h-[260px] sm:h-[400px]">
            <div className="md:col-span-3 h-full overflow-hidden relative rounded-lg border border-gray-200 dark:border-slate-800">
              <img src={imgSrc(images[activeImg])} alt={name} className="w-full h-full object-cover" />
              {hotel.videoTour && (
                <button onClick={() => setVideoModal(true)} className="absolute bottom-4 left-4 bg-white/90 text-blue-600 px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg border border-gray-200 transition active:scale-95">
                  <FiRotateCw className="animate-spin-slow" /> 360° Virtual Tur
                </button>
              )}
            </div>
            <div className="hidden md:flex flex-col gap-2 h-full">
              {images.slice(1, 4).map((img, i) => (
                <div key={i} className="flex-1 overflow-hidden rounded-lg cursor-pointer hover:opacity-90 border border-gray-200 dark:border-slate-800"
                  onClick={() => setActiveImg(i + 1)}>
                  <img src={imgSrc(img)} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Left Column ── */}
          <div className="flex-1 min-w-0">
            
            <Section title="Mehmonxona haqida" icon={<FiAward />}>
              <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">{desc}</p>
              <button onClick={() => setAudioModal(true)} className="mt-4 text-blue-600 font-bold text-xs hover:underline flex items-center gap-1.5">
                <FiVolume2 /> Ovozli ma'lumot
              </button>
            </Section>

            <div id="rooms" className="scroll-mt-4 mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiBriefcase className="text-blue-600" /> Mavjud xonalar
              </h2>
              <div className="space-y-3">
                {hotel.rooms?.map(r => (
                  <div key={r._id} className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 flex flex-col md:flex-row justify-between gap-4 hover:border-blue-400 transition-colors">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{r.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3 font-medium">
                        <span className="flex items-center gap-1"><FiUsers /> {r.capacity} kishi</span>
                        {r.areaSqMeters && <span className="flex items-center gap-1"><FiMaximize /> {r.areaSqMeters} m²</span>}
                      </div>
                      <div className="text-[11px] text-green-600 font-bold flex items-center gap-1.5">
                        <FiCheck /> Bepul bekor qilish xizmati
                      </div>
                    </div>
                    <div className="flex flex-col md:items-end justify-between gap-3 border-t md:border-t-0 md:border-l border-gray-100 dark:border-slate-800 pt-3 md:pt-0 md:pl-6">
                      <div className="text-left md:text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mb-1">1 tun uchun</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {new Intl.NumberFormat('uz-UZ').format(r.pricePerNight || 0)} <span className="text-xs font-normal text-gray-500 uppercase">UZS</span>
                        </p>
                      </div>
                    </div>
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
                         <div className="w-9 h-9 bg-gray-100 dark:bg-slate-800 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {rv.user?.name?.[0]?.toUpperCase() || 'M'}
                         </div>
                         <div>
                            <p className="font-bold text-sm text-gray-900 dark:text-white">{rv.user?.name || 'Mehmon'}</p>
                            <p className="text-[10px] text-gray-400">{new Date(rv.createdAt).toLocaleDateString('uz-UZ')}</p>
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
                
                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-6 shadow-sm text-center">
                   <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Narxlar boshlanadi</p>
                   <p className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      {new Intl.NumberFormat('uz-UZ').format(price)} <span className="text-sm font-medium text-gray-500 uppercase">UZS</span>
                   </p>
                   
                   <div className="space-y-3 mb-6 text-sm text-gray-600">
                      <div className="flex justify-between py-2 border-b border-gray-50 dark:border-slate-800">
                         <span className="flex items-center gap-2"><FiCalendar className="text-gray-400" /> Kirish</span>
                         <span className="font-bold text-gray-800 dark:text-slate-300">{hotel.checkIn || '14:00'}</span>
                      </div>
                      <div className="flex justify-between py-2">
                         <span className="flex items-center gap-2"><FiCalendar className="text-gray-400" /> Chiqish</span>
                         <span className="font-bold text-gray-800 dark:text-slate-300">{hotel.checkOut || '12:00'}</span>
                      </div>
                   </div>
                   
                   <div className="mt-6 pt-4 border-t border-gray-50 dark:border-slate-800 space-y-2">
                      <p className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase"><FiShield /> Xavfsiz to'lov</p>
                      <p className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase"><FiCheckCircle /> Tasdiqlangan ob'ekt</p>
                      {accessFeatures.length > 0 && (
                        <p className="flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase">
                          <MdAccessible className="w-3.5 h-3.5" /> {accessFeatures.length} inklyuziv qulaylik
                        </p>
                      )}
                   </div>
                </div>

                <div id="map-section" className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg overflow-hidden shadow-sm">
                   <div className="p-4 border-b border-gray-100 dark:border-slate-800 font-bold text-sm text-gray-800 dark:text-white">
                      <FiMapPin className="text-blue-600 inline mr-2" /> Joylashuv
                   </div>
                   <div className="p-1">
                      <MapView hotel={hotel} />
                   </div>
                   <div className="p-4 bg-gray-50 dark:bg-slate-900 text-[11px] text-gray-500 font-medium">
                      {hotel.address}, {hotel.city}, O'zbekiston
                   </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg p-5 shadow-sm">
                   <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-sm flex items-center gap-2"><FiPhone className="text-blue-600" /> Bog'lanish</h3>
                   <div className="space-y-4 text-xs font-bold">
                      <a href={`tel:${hotel.owner?.phone}`} className="flex items-center gap-3 text-gray-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
                         <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                            <FiPhone />
                         </div>
                         <span>{hotel.owner?.phone || '+998 -- --- -- --'}</span>
                      </a>
                      <a href={`mailto:${hotel.owner?.email}`} className="flex items-center gap-3 text-gray-700 dark:text-slate-300 hover:text-blue-600 transition-colors">
                         <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                            <FiMail />
                         </div>
                         <span>{hotel.owner?.email || 'hotel@info.uz'}</span>
                      </a>
                   </div>
                </div>

             </div>
          </div>
        </div>

        {/* ── Modals ── */}
        {audioModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setAudioModal(false)}>
             <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-lg shadow-xl p-6" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center text-center">
                   <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center mb-4">
                      <FiVolume2 />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Ovozli ma'lumot</h3>
                   <p className="text-gray-500 dark:text-slate-400 text-xs mb-6 leading-relaxed">
                      Mehmonxona haqidagi ma'lumotlarni o'zbek tilida tinglash imkoniyati tez orada ishga tushadi.
                   </p>
                   <button onClick={() => setAudioModal(false)} className="w-full bg-blue-600 text-white py-2.5 rounded font-bold text-sm">
                      Yopish
                   </button>
                </div>
             </div>
          </div>
        )}

        {videoModal && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90" onClick={() => setVideoModal(false)}>
            <div className="relative w-full max-w-5xl aspect-video rounded-lg overflow-hidden bg-black border border-white/10" onClick={e => e.stopPropagation()}>
              <button onClick={() => setVideoModal(false)} className="absolute top-4 right-4 z-[510] bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 hover:bg-white hover:text-black transition-all">
                <FiX className="text-xl" />
              </button>
              <iframe src={getYouTubeEmbedUrl(hotel.videoTour)} title="Video" className="w-full h-full border-0" allowFullScreen />
            </div>
          </div>
        )}

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
