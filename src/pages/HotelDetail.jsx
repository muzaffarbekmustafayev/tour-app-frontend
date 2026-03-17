import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AvailabilityChecker from '../components/AvailabilityChecker';
import MapView from '../components/MapView';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';

const amenityIcons = {
  'Free WiFi': '📶', 'Pool': '🏊', 'Spa': '💆', 'Restaurant': '🍽️',
  'Gym': '🏋️', 'Parking': '🅿️', 'Air Conditioning': '❄️',
  'Airport Shuttle': '🚌', 'Bar': '🍸', 'Meeting Rooms': '📊',
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
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
    </div>
  );

  if (error || !hotel) return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <p className="text-5xl mb-4">😕</p>
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Couldn't load hotel</h2>
      <p className="text-gray-500 mb-6 text-center">{error}</p>
      <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold">Go Back</button>
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
      {/* Back Button */}
      <div className="px-4 pt-4 mb-4">
        <BackButton />
      </div>

      {/* Image Gallery */}
      <div className="px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-64 md:h-[450px]">
          <div className="md:col-span-2 h-full overflow-hidden rounded-3xl relative">
            <img
              src={images[activeImage]}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
              alt={hotel.name}
            />
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${idx === activeImage ? 'bg-white w-6' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="hidden md:grid grid-rows-2 gap-3">
            {images.slice(1, 3).map((img, idx) => (
              <div key={idx} className="overflow-hidden rounded-3xl h-full">
                <img
                  src={img}
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                  alt={`Gallery ${idx + 1}`}
                  onClick={() => setActiveImage(idx + 1)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 flex flex-col lg:flex-row gap-12">
        {/* Left: Hotel Info */}
        <div className="lg:flex-1 min-w-0">

          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 pr-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600 text-xs font-black uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                  {hotel.category || 'Hotel'}
                </span>
                <span className="text-yellow-500 text-sm">
                  {'★'.repeat(hotel.stars || 0)}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">{hotel.name}</h1>
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                <span className="font-medium">{hotel.address && `${hotel.address}, `}{hotel.city}, {hotel.country}</span>
              </div>
            </div>
            <div className="bg-blue-600 p-3 rounded-2xl text-center flex-shrink-0 shadow-lg shadow-blue-200 dark:shadow-none">
              <span className="block text-2xl font-black text-white leading-none">{hotel.rating?.toFixed(1) || '—'}</span>
              <span className="text-[10px] font-bold text-blue-100 uppercase tracking-widest mt-1 block">
                {reviews.length > 0 ? `${reviews.length} sharh` : 'Sharh yo\'q'}
              </span>
            </div>
          </div>

          {/* Overview */}
          <div className="mb-8 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Tavsif</h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {hotel.description || 'No description available.'}
            </p>
            {(hotel.checkInTime || hotel.checkOutTime) && (
              <div className="flex space-x-6 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                {hotel.checkInTime && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kirish vaqti</p>
                    <p className="font-bold text-gray-900 dark:text-white">{hotel.checkInTime}</p>
                  </div>
                )}
                {hotel.checkOutTime && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Chiqish vaqti</p>
                    <p className="font-bold text-gray-900 dark:text-white">{hotel.checkOutTime}</p>
                  </div>
                )}
                {hotel.roomsAvailable !== undefined && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Bo'sh xonalar</p>
                    <p className="font-bold text-green-600">{hotel.roomsAvailable}</p>
                  </div>
                )}
                {hotel.maxGuests && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Max mehmonlar</p>
                    <p className="font-bold text-gray-900 dark:text-white">👥 {hotel.maxGuests} kishi</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amenities */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="mb-8 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Xizmatlar</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hotel.amenities.map(amenity => (
                  <div key={amenity} className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    <span>{amenityIcons[amenity] || '✓'}</span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Accessibility */}
          {hotel.accessibility && Object.values(hotel.accessibility).some(Boolean) && (
            <div className="mb-8 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">♿ Nogironlar uchun qulayliklar</h2>
              <div className="flex flex-wrap gap-3">
                {Object.entries({
                  wheelchairAccessible: 'Nogironlar aravachasi',
                  elevator: 'Lift',
                  accessibleRooms: 'Moslashtirilgan xonalar',
                  brailleSigns: 'Brayl belgilar',
                  hearingAssistance: 'Eshitish moslamasi',
                  specialParking: 'Maxsus avtoturargoh',
                }).map(([key, label]) => hotel.accessibility[key] && (
                  <span key={key} className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full text-xs font-bold border border-green-200 dark:border-green-900/50">
                    ✓ {label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Room Types */}
          {hotel.roomTypes && hotel.roomTypes.length > 0 && (
            <div className="mb-8 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🛏️ Xona turlari</h2>
              <div className="space-y-3">
                {hotel.roomTypes.map((rt, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{rt.type}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {rt.capacity && `${rt.capacity} kishi · `}
                        {rt.roomsAvailable !== undefined && `${rt.roomsAvailable} bo'sh xona`}
                      </p>
                      {rt.amenities?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rt.amenities.map(a => <span key={a} className="text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-500 px-2 py-0.5 rounded-full">{a}</span>)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-blue-600 dark:text-blue-400">{new Intl.NumberFormat('uz-UZ').format(rt.price || hotel.pricePerNight)}</p>
                      <p className="text-[10px] text-gray-400">UZS/tun</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security */}
          {hotel.security && hotel.security.length > 0 && (
            <div className="mb-8 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">🔒 Xavfsizlik</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.security.map(s => (
                  <span key={s} className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-3 py-1.5 rounded-full text-xs font-bold">🛡️ {s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Nearby Places */}
          {hotel.nearbyPlaces && hotel.nearbyPlaces.length > 0 && (
            <div className="mb-8 bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📍 Yaqin turistik joylar</h2>
              <div className="flex flex-wrap gap-2">
                {hotel.nearbyPlaces.map(p => (
                  <span key={p} className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100 dark:border-blue-800/50">📌 {p}</span>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          <div className="mb-8">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">📍 Joylashuv</h2>
            <MapView hotel={hotel} />
          </div>

          {/* Reviews Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">
              Mehmon sharhlari ({reviews.length})
            </h2>

            {/* Review Form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Sharh yozing</h3>
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Bahoyingiz</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button type="button" key={star} onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))} className={`text-2xl transition-transform hover:scale-125 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                    ))}
                  </div>
                </div>
                <textarea
                  placeholder="Tajribangizni ulashing..."
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                  required rows={3}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <button type="submit" disabled={submittingReview} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl transition-all active:scale-95 disabled:opacity-60 flex items-center">
                  {submittingReview && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                  Sharh yuborish
                </button>
              </form>
            ) : (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-3xl border border-blue-100 dark:border-blue-800/50 mb-6 text-center">
                <p className="text-gray-700 dark:text-gray-300 font-medium mb-3">Sharh qoldirish uchun tizimga kiring</p>
                <button onClick={() => navigate('/login')} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold active:scale-95 transition-transform">
                  Kirish
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
                      <div className="flex text-yellow-400 text-sm">
                        {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
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
                <p className="text-3xl mb-2">📝</p>
                <p className="text-gray-500 font-medium">Hali sharh yo'q. Birinchi bo'lib sharh qoldiring!</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Booking Widget */}
        <div className="lg:w-96">
          <div className="sticky top-4">
            <AvailabilityChecker hotel={hotel} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelDetail;