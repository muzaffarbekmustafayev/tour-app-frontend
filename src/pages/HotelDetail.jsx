import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AvailabilityChecker from '../components/AvailabilityChecker';
import MapView from '../components/MapView';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { 
  FiWifi, FiDroplet, FiHeart, FiCoffee, 
  FiMapPin, FiWind, FiBriefcase, FiMap, 
  FiCheckCircle, FiShield, FiFrown, FiUsers, 
  FiStar, FiEdit3, FiImage, FiCheck
} from 'react-icons/fi';

const amenityIcons = {
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

const HotelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [hotelRes, reviewsRes] = await Promise.all([
          api.get(`/hotels/${id}`),
          api.get(`/reviews/hotel/${id}`)
        ]);
        setHotel(hotelRes.data);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error(err);
        setError('Hotel not found or backend is unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      const res = await api.post('/reviews', { hotelId: id, ...reviewForm });
      setReviews(prev => [{ ...res.data, user: { name: user.name } }, ...prev]);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Loader message="Mehmonxona yuklanmoqda" />
    </div>
  );

  if (error || !hotel) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <FiFrown className="w-16 h-16 text-gray-400 mb-4 mx-auto" strokeWidth={1.5} />
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Couldn't load hotel</h2>
      <p className="text-gray-500 mb-6 text-center">{error}</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition">Go Back</button>
    </div>
  );

  const fallbackImages = [
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1000',
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1000',
  ];
  const images = (hotel.images && hotel.images.length > 0) ? hotel.images : fallbackImages;

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      <div className="px-0 sm:px-4 mb-8 sm:mb-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[60vh] sm:h-[500px]">
          <div className="md:col-span-3 h-full overflow-hidden sm:rounded-[2.5rem] rounded-b-[2.5rem] relative group shadow-sm -mt-2 sm:mt-0">
            {/* Floating Mobile/Desktop Back Button overlay */}
            <div className="absolute top-6 left-4 sm:top-6 sm:left-6 z-20">
              <BackButton />
            </div>
            <img
              src={images[activeImage]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={hotel.name}
            />
            {/* Elegant Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-gray-900/30 pointer-events-none" />
            
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2 z-10 bg-black/40 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/20">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${idx === activeImage ? 'bg-white w-8 shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'bg-white/50 w-2 hover:bg-white/80'}`}
                  />
                ))}
              </div>
            )}
          </div>
          
          <div className="hidden md:flex flex-col gap-4">
            {images.slice(1, 3).map((img, idx) => (
               <div key={idx} className="overflow-hidden rounded-[2.5rem] h-full relative group shadow-sm border border-gray-100 dark:border-gray-800">
                <img
                  src={img}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 cursor-pointer"
                  alt={`Gallery ${idx + 1}`}
                  onClick={() => setActiveImage(idx + 1)}
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col lg:flex-row gap-12">
        {/* Left: Hotel Info */}
        <div className="lg:flex-1 min-w-0">

          {/* Detailed Header */}
          <div className="mb-10 pb-8 border-b border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-start gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-full shadow-md shadow-blue-500/20">
                    {hotel.category || 'Hotel'}
                  </span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight tracking-tight">
                  {hotel.name}
                </h1>
                
                <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                  <div className="flex items-center text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <FiMapPin className="mr-2 text-rose-500 w-4 h-4" />
                    <span>{hotel.address && `${hotel.address}, `}{hotel.city}, {hotel.country}</span>
                  </div>
                  <div className="flex items-center text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2.5 rounded-2xl border border-emerald-100 dark:border-emerald-800/60">
                    <FiCheckCircle className="mr-2 w-4 h-4" />
                    <span>Tasdiqlangan joy</span>
                  </div>
                </div>
              </div>
              
              {/* Premium Rating Block */}
              <div className="hidden sm:flex flex-col items-end">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-5 rounded-[2rem] shadow-xl shadow-blue-500/30 text-center min-w-[110px] border border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:opacity-20 transition-opacity" />
                  <span className="block text-4xl font-black text-white leading-none mb-1">{hotel.rating?.toFixed(1) || '—'}</span>
                  <div className="flex justify-center text-yellow-300 mb-2 mt-1">
                    <FiStar className="w-3.5 h-3.5 fill-current" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest block border-t border-white/20 pt-2 mt-1">
                    {reviews.length > 0 ? `${reviews.length} sharh` : 'Yangi'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Overview & Quick Highlights */}
          <div className="mb-12">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-900 dark:text-white">Mehmonxona haqida</h2>
            <div className="bg-white/60 dark:bg-[#1e293b]/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[17px] font-medium mb-8">
                {hotel.description || 'Mehmonxona haqida batafsil ma\'lumot kiritilmagan.'}
              </p>
              
              {(hotel.checkInTime || hotel.checkOutTime) && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-gray-100 dark:border-gray-800/60">
                  {hotel.checkInTime && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/20 w-fit px-3 py-1 rounded-lg">Kirish vaqti</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{hotel.checkInTime}</p>
                    </div>
                  )}
                  {hotel.checkOutTime && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest bg-orange-50 dark:bg-orange-900/20 w-fit px-3 py-1 rounded-lg">Chiqish vaqti</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{hotel.checkOutTime}</p>
                    </div>
                  )}
                  {hotel.maxGuests && (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 w-fit px-3 py-1 rounded-lg">Max mehmonlar</p>
                      <div className="text-xl font-black text-gray-900 dark:text-white mt-1 flex items-center">
                         <FiUsers className="mr-2 text-indigo-500 w-5 h-5" /> {hotel.maxGuests} <span className="text-sm text-gray-400 ml-1.5 font-semibold">kishigacha</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {hotel.amenities && hotel.amenities.length > 0 && (
              <div className="bg-white/60 dark:bg-slate-800/40 border border-white dark:border-gray-800/80 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none h-full">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Qulayliklar</h2>
                <div className="flex flex-col gap-4">
                  {hotel.amenities.map(amenity => (
                    <div key={amenity} className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50">
                        {amenityIcons[amenity] || <FiCheck className="w-5 h-5" />}
                      </div>
                      <span className="text-[15px] font-bold text-gray-700 dark:text-gray-300">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* Accessibility */}
              {hotel.accessibility && Object.values(hotel.accessibility).some(Boolean) && (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-100 dark:border-emerald-800/30 rounded-[2.5rem] p-8 h-full">
                  <h2 className="text-lg font-bold mb-5 text-emerald-900 dark:text-emerald-400 flex items-center gap-2">
                     <FiCheckCircle className="w-5 h-5" /> Maxsus qulayliklar
                  </h2>
                  <div className="flex flex-wrap gap-2.5">
                    {Object.entries({
                      wheelchairAccessible: 'Nogironlar aravachasi',
                      elevator: 'Lift',
                      accessibleRooms: 'Moslashtirilgan',
                      brailleSigns: 'Brayl yozuvi',
                      hearingAssistance: 'Eshitish',
                      specialParking: 'Maxsus Joy',
                    }).map(([key, label]) => hotel.accessibility[key] && (
                      <span key={key} className="bg-white/80 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-full text-xs font-bold shadow-sm backdrop-blur-sm border border-emerald-100 dark:border-emerald-700/50">
                        {label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Security */}
              {hotel.security && hotel.security.length > 0 && (
                 <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-gray-700/50 rounded-[2.5rem] p-8">
                  <h2 className="text-lg font-bold mb-5 text-gray-900 dark:text-white flex items-center gap-2">
                     <FiShield className="text-indigo-500 w-5 h-5" /> Xavfsizlik
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {hotel.security.map(s => (
                       <span key={s} className="flex items-center gap-2 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-2xl text-[13px] font-bold shadow-sm border border-gray-100 dark:border-gray-800">
                          <FiCheck className="text-indigo-500 w-4 h-4" /> {s}
                       </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stunning Rooms Presentation */}
          {hotel.rooms && hotel.rooms.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                 Xona turlari <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 text-sm px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800/50">{hotel.rooms.length} ta</span>
              </h2>
              <div className="flex flex-col gap-6">
                {hotel.rooms.map((rt) => (
                  <div key={rt._id} className="group bg-white dark:bg-[#1e293b]/80 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-300 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300" />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{rt.name}</h3>
                        <span className="text-[10px] font-black uppercase bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-600">{rt.category}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-5 text-[13px] text-gray-600 dark:text-gray-400 font-bold mb-5">
                        <div className="flex items-center gap-2"><FiUsers className="text-blue-500 w-4 h-4" /> {rt.capacity} kishi</div>
                        {rt.areaSqMeters && <div className="flex items-center gap-2"><FiMap className="text-orange-500 w-4 h-4" /> {rt.areaSqMeters} m²</div>}
                        {rt.bedType && <div className="flex items-center gap-2"><FiBriefcase className="text-purple-500 w-4 h-4" /> {rt.bedType}</div>}
                      </div>
                      
                      {rt.amenities?.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-1">
                          {rt.amenities.map(a => <span key={a} className="text-[10px] uppercase font-extrabold bg-gray-50 dark:bg-slate-900/50 text-gray-500 dark:text-gray-400 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-800">{a}</span>)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-between md:justify-center items-end border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-5 md:pt-0 md:pl-8 min-w-[200px]">
                      <div className="text-left md:text-right w-full">
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bir kecha uchun</p>
                         <div className="flex items-baseline md:justify-end">
                           <span className="font-black text-gray-900 dark:text-white text-3xl">{new Intl.NumberFormat('uz-UZ').format(Number(rt.pricePerNight || 0) || 0)}</span>
                           <span className="text-sm text-gray-400 ml-1.5 font-bold">UZS</span>
                         </div>
                      </div>
                      
                      {rt.roomsAvailable > 0 ? (
                         <div className="mt-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-bold px-4 py-2.5 rounded-xl border border-green-200 dark:border-green-800/50 flex items-center justify-center gap-2 w-full md:w-auto text-[13px]">
                            <FiCheckCircle className="w-4 h-4" /> {rt.roomsAvailable} ta qoldi
                         </div>
                      ) : (
                         <div className="mt-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 font-bold px-4 py-2.5 rounded-xl border border-red-200 dark:border-red-800/50 flex items-center justify-center gap-2 w-full md:w-auto text-[13px]">
                            <FiX className="w-4 h-4" /> Band qilingan
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {hotel.security && hotel.security.length > 0 && (
             <div className="mb-8 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                 <FiShield className="text-indigo-500" /> Xavfsizlik
              </h2>
              <div className="flex flex-wrap gap-2">
                {hotel.security.map(s => (
                   <span key={s} className="flex items-center gap-1.5 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-bold">
                      <FiCheckCircle className="w-3 h-3 text-gray-400" /> {s}
                   </span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby & Map Block */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Nearby Places */}
            {hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && (
               <div className="bg-white/60 dark:bg-[#1e293b]/60 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 h-full">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                   <FiMapPin className="text-red-500" /> Turistik joylar
                </h2>
                <div className="flex flex-col gap-3">
                  {hotel.nearbyPlaces.map(p => (
                     <div key={p} className="flex items-center gap-4 bg-gray-50 dark:bg-slate-800/70 text-gray-800 dark:text-gray-300 px-4 py-3.5 rounded-2xl text-[14px] font-bold border border-gray-200/60 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                          <FiMap className="w-4 h-4" /> 
                        </div>
                        {p}
                     </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            <div className="flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2 px-2">
                   <FiMap className="text-emerald-500" /> Manzil xaritada
                </h2>
              <div className="flex-1">
                <MapView hotel={hotel} />
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Mehmon sharhlari ({reviews.length})
            </h2>

            {/* Review Form */}
            {user && user.role !== 'GUEST' ? (
              <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 mb-6 group">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Sharh yozing</h3>
                <div className="mb-4">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Bahoyingiz</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))} className={`text-2xl transition-transform hover:scale-125 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                         <FiStar className={`${star <= reviewForm.rating ? 'fill-current' : ''}`} />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Tajribangizni batafsil ulashing..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  required rows={4}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/50 resize-none transition-all placeholder:text-gray-400"
                />
                <button type="submit" disabled={submittingReview} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-60 flex items-center justify-center w-full sm:w-auto">
                  {submittingReview && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                  {submittingReview ? 'Yuborilmoqda...' : 'Sharhni yuborish'}
                </button>
              </form>
            ) : (
               <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-3xl border border-blue-100 dark:border-blue-800/50 mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                   <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1">Mijozlar sharh yozishi mumkin</h3>
                   <p className="text-sm font-medium text-blue-600/80 dark:text-blue-400/80 mb-0">Haqiqiy tajriba ulashish uchun ro'yxatdan o'ting yoki tizimga kiring.</p>
                </div>
                <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold shadow-md hover:shadow-lg active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2">
                   Kirish <FiCheckCircle className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Reviews List */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review._id} className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
                          {review.user?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{review.user?.name || 'Guest'}</p>
                          <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <div className="flex text-yellow-400 text-sm space-x-0.5">
                         {[...Array(5)].map((_, i) => <FiStar key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />)}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                    {review.ownerReply && (
                      <div className="mt-3 pl-4 border-l-2 border-blue-200 dark:border-blue-800">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">Owner's Reply</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.ownerReply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800">
                <div className="mb-3"><FiEdit3 className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto" strokeWidth={1.5} /></div>
                <p className="text-gray-500 font-medium">Hali sharh yo'q. Birinchi bo'lib sharh qoldiring!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Widget */}
        <div className="lg:w-96 pb-20 lg:pb-0" id="booking-widget">
          <div className="sticky top-4">
            <AvailabilityChecker hotel={hotel} />
          </div>
        </div>
      </div>

      {/* Floating Mobile Booking Footer */}
      <div className="lg:hidden fixed bottom-[72px] left-0 right-0 p-4 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800/80 flex justify-between items-center z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
        <div>
           <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Narxlar</p>
            <div className="flex items-baseline">
               <span className="font-extrabold text-gray-900 dark:text-white text-xl">{new Intl.NumberFormat('uz-UZ').format(Number(hotel.basePricePerNight || hotel.rooms?.[0]?.pricePerNight || 0) || 0)}</span>
               <span className="text-[10px] font-bold text-gray-400 ml-1 uppercase">UZS / tun</span>
            </div>
        </div>
        <button onClick={() => {
            const widget = document.getElementById('booking-widget');
            if(widget) {
                const y = widget.getBoundingClientRect().top + window.scrollY - 80;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }
        }} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3.5 rounded-2xl font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-transform text-sm h-full max-h-[52px] flex items-center justify-center">
           Band qilish
        </button>
      </div>

    </div>
  );
};

export default HotelDetail;