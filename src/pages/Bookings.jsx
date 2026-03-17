import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';

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
              <div key={booking._id} className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-5 flex flex-col md:flex-row gap-5 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
                {/* Hotel Image */}
                <div className="w-full md:w-44 h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-800">
                  {hotel.images?.[0] ? (
                    <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">🏨</div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{hotel.name || 'Hotel'}</h3>
        <p className="text-sm text-gray-500 flex items-center mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                          {hotel.city || '—'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>

                    <div className="inline-flex items-center space-x-3 bg-gray-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-slate-700 text-sm">
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Kirish</span>
                        <span className="font-bold text-gray-900 dark:text-gray-200">
                          {checkIn ? new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      </div>
                      <div className="text-gray-300 dark:text-gray-600 font-bold">→</div>
                      <div>
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Chiqish</span>
                        <span className="font-bold text-gray-900 dark:text-gray-200">
                          {checkOut ? new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—'}
                        </span>
                      </div>
                      <div className="pl-3 border-l border-gray-200 dark:border-gray-700">
                        <span className="block text-[9px] uppercase font-bold text-gray-400">Tunlar</span>
                        <span className="font-bold text-gray-900 dark:text-gray-200">{nights}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Jami to'lov</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('uz-UZ').format(booking.totalPrice)} UZS
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {hotel._id && (
                        <button
                          onClick={() => navigate(`/hotel/${hotel._id}`)}
                          className="px-4 py-2 text-sm font-bold bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                        >
                          Ko'rish
                        </button>
                      )}
                      {(booking.status === 'confirmed' || booking.status === 'pending') && (
                        <button
                          onClick={() => handleCancel(booking._id)}
                          disabled={cancelling === booking._id}
                          className="px-4 py-2 text-sm font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-60"
                        >
                          {cancelling === booking._id ? '...' : 'Bekor qilish'}
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
          <p className="text-5xl mb-4 opacity-60">🗓️</p>
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