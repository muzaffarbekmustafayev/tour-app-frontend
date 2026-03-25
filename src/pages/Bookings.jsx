import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { FiMapPin, FiInbox, FiMessageCircle } from 'react-icons/fi';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [cancelling, setCancelling] = useState(null);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/bookings/my-bookings')
      .then(res => {
        setBookings(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Could not load bookings. Please make sure you are logged in and the backend is running.');
        setLoading(false);
      });
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setCancelling(null);
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
      case 'completed': return 'bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-300 border-gray-200 dark:border-slate-700';
      case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
    }
  };

  const tabs = ['all', 'confirmed', 'completed', 'cancelled', 'pending'];
  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status?.toLowerCase() === filter);

  return (
    <div className="pb-24 pt-4 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8">
        <BackButton className="mb-3" />
        <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Bronlarim</h1>
        <p className="text-gray-500 font-medium">Kelgusi va o'tgan bronlarni boshqaring.</p>
      </div>

      {/* Status Tabs */}
      <div className="flex space-x-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              filter === tab
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab === 'all' ? 'Barchasi' : tab === 'confirmed' ? 'Tasdiqlangan' : tab === 'completed' ? 'Yakunlangan' : tab === 'cancelled' ? 'Bekor qilingan' : 'Kutilmoqda'}
            {tab !== 'all' && bookings.filter(b => b.status?.toLowerCase() === tab).length > 0 && (
              <span className="ml-2 text-[10px] bg-blue-600 text-white rounded-full px-1.5 py-0.5">
                {bookings.filter(b => b.status?.toLowerCase() === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-4 mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 h-36 rounded-3xl border border-gray-100 dark:border-slate-800" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(booking => {
            const hotel = booking.hotel || {};
            const checkIn = booking.checkIn || booking.checkInDate;
            const checkOut = booking.checkOut || booking.checkOutDate;
            const nights = checkIn && checkOut
              ? Math.max(1, Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)))
              : booking.nights || '?';

            return (
              <div key={booking._id} className="group bg-white dark:bg-[#1e293b] rounded-[2rem] p-4 sm:p-5 flex flex-col md:flex-row gap-5 lg:gap-6 border border-gray-100 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all dark:shadow-none relative overflow-hidden">
                {/* Decorative side bar for status */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${booking.status === 'confirmed' ? 'bg-green-500' : booking.status === 'pending' ? 'bg-yellow-400' : booking.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'}`} />
                
                {/* Hotel Image (larger on mobile) */}
                <div className="w-full md:w-56 h-48 md:h-full min-h-[140px] flex-shrink-0 rounded-[1.5rem] overflow-hidden bg-gray-100 dark:bg-slate-800 relative shadow-inner">
                  {hotel.images?.[0] ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">🏨</div>
                  )}
                  {/* Status Badges Overlaid on Mobile */}
                  <div className="absolute top-3 right-3 md:hidden">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md shadow-sm border ${getStatusStyle(booking.status)}`}>
                      {booking.status === 'pending' ? 'Kutilmoqda' : booking.status === 'confirmed' ? 'Tasdiqlangan' : booking.status === 'cancelled' ? 'Bekor qilingan' : 'Yakunlangan'}
                    </span>
                  </div>
                </div>

                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">{hotel.name || 'Mehmonxona'}</h3>
                        <p className="text-sm font-bold text-gray-500 flex items-center mt-1">
                          <FiMapPin className="mr-1.5 w-4 h-4 text-blue-500" />
                          {hotel.city || 'Belgilanmagan'}
                          {hotel.stars && <span className="ml-3 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-[10px]">{hotel.stars} Yulduzli</span>}
                        </p>
                      </div>
                      {/* Desktop Status Badge */}
                      <span className={`hidden md:inline-block px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider border shadow-sm ${getStatusStyle(booking.status)}`}>
                        {booking.status === 'pending' ? 'Kutilmoqda' : booking.status === 'confirmed' ? 'Tasdiqlangan' : booking.status === 'cancelled' ? 'Bekor qilingan' : 'Yakunlangan'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4 bg-gray-50/80 dark:bg-slate-800/50 p-4 rounded-[1.5rem] border border-gray-100/50 dark:border-gray-700/50">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black text-gray-400 mb-0.5 tracking-widest">Kirish</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {checkIn ? new Date(checkIn).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-black text-gray-400 mb-0.5 tracking-widest">Chiqish</span>
                         <span className="font-bold text-gray-900 dark:text-white text-sm">
                           {checkOut ? new Date(checkOut).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '—'}
                         </span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-black text-gray-400 mb-0.5 tracking-widest">Mehmon</span>
                         <span className="font-bold text-gray-900 dark:text-white text-sm">
                           {booking.guestsCount || 1} kishi
                         </span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-[10px] uppercase font-black text-gray-400 mb-0.5 tracking-widest">Davomiylik</span>
                         <span className="font-bold text-blue-600 dark:text-blue-400 text-sm">
                           {nights} tun
                         </span>
                      </div>
                    </div>
                    
                    {/* Upsells Display if any */}
                    {(booking.upsells?.breakfast || booking.upsells?.airportTransfer || booking.upsells?.extraBed) && (
                       <div className="flex gap-2 mb-4 flex-wrap">
                          {booking.upsells.breakfast && <span className="bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-orange-100 dark:border-orange-800/50">☕ Nonushta</span>}
                          {booking.upsells.airportTransfer && <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800/50">✈️ Transfer</span>}
                          {booking.upsells.extraBed && <span className="bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg border border-teal-100 dark:border-teal-800/50">🛏️ Qo'sh. yotoq</span>}
                       </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mt-2 pt-4 border-t border-gray-100 dark:border-gray-800/80 gap-4">
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Jami To'lov summasi</span>
                      <span className="text-xl font-black text-gray-900 dark:text-white">
                        {new Intl.NumberFormat('uz-UZ').format(booking.totalPrice)} UZS
                      </span>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate(`/chat/${booking._id}`)}
                        className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                         <FiMessageCircle className="w-4 h-4" /> Xabar yozish
                      </button>
                      {hotel._id && (
                        <button
                          onClick={() => navigate(`/hotel/${hotel._id}`)}
                          className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold bg-white dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
                        >
                          Joyni ko'rish
                        </button>
                      )}
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {cancelling === booking._id && <span className="w-3.5 h-3.5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>}
                          Bekor qilish
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center mt-12 p-10 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="mb-4"><FiInbox className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto" /></div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {filter !== 'all' ? `${filter} bronlar yo'q` : 'Bronlar yo\'q'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
            {filter !== 'all' ? `Sizda ${filter} bronlar mavjud emas.` : "Siz hali hech qanday bron qilmagansiz."}
          </p>
          <button onClick={() => navigate('/search')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all active:scale-95">
            Mehmonxonalarni ko'rish
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;