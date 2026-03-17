import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PAYMENT_METHODS = ['Visa', 'MasterCard', 'UzCard', 'Humo', 'Click', 'Payme'];

const AvailabilityChecker = ({ hotel }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [roomType, setRoomType] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isAvailable, setIsAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [message, setMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const roomTotal = nights * (hotel?.pricePerNight || 0);
  const serviceFee = roomTotal > 0 ? 50000 : 0;
  const grandTotal = roomTotal + serviceFee;

  const handleCheck = async () => {
    if (!checkIn || !checkOut || !hotel) return;
    if (new Date(checkOut) <= new Date(checkIn)) {
      setMessage('Check-out date must be after check-in date.');
      setIsAvailable(false);
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await api.get(`/hotels/${hotel._id}/availability?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      setIsAvailable(res.data.available);
      setMessage(res.data.message || '');
    } catch (err) {
      console.error(err);
      setIsAvailable(false);
      setMessage('Could not check availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!paymentMethod) {
      setMessage("Iltimos, to'lov usulini tanlang.");
      return;
    }
    setBooking(true);
    try {
      await api.post('/bookings', {
        hotelId: hotel._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestsCount: guests,
        roomType: roomType || 'Standard',
        paymentMethod,
        totalPrice: grandTotal
      });
      setBooked(true);
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Booking failed. Please try again.';
      setMessage(errMsg);
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Bron tasdiqlandi!</h3>
        <p className="text-gray-500 text-sm mb-4">
          {hotel.name} · {nights} tun · {new Date(checkIn).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })} → {new Date(checkOut).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' })}
        </p>
        <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-6">
          {new Intl.NumberFormat('uz-UZ').format(grandTotal)} UZS
        </p>
        <button
          onClick={() => navigate('/bookings')}
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-2xl transition-all active:scale-[0.98]"
        >
          Bronlarimni ko'rish
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="flex justify-between items-baseline mb-6">
        <div>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('uz-UZ').format(hotel?.pricePerNight || 0)}
          </span>
          <span className="text-gray-400 dark:text-gray-500 text-sm ml-1 font-medium">UZS / night</span>
        </div>
        {hotel?.roomsAvailable > 0 && (
          <span className="text-[10px] font-black text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full uppercase tracking-wider">
            {hotel.roomsAvailable} xona bor
          </span>
        )}
      </div>

      <div className="space-y-3 mb-6">
        <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <div className="bg-white dark:bg-slate-900 p-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1">Kirish</label>
            <input 
              type="date" 
              min={today}
              className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none" 
              value={checkIn}
              onChange={(e) => { setCheckIn(e.target.value); setIsAvailable(null); setBooked(false); }}
            />
          </div>
          <div className="bg-white dark:bg-slate-900 p-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1">Chiqish</label>
            <input 
              type="date" 
              min={checkIn || today}
              className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none" 
              value={checkOut}
              onChange={(e) => { setCheckOut(e.target.value); setIsAvailable(null); setBooked(false); }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-3">
          <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1">Mehmonlar</label>
          <select 
            className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none"
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n} className="dark:bg-slate-900">{n} Mehmon{n > 1 ? '' : ''}</option>
            ))}
          </select>
        </div>

        {hotel?.roomTypes?.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 mb-1">Xona turi</label>
            <select
              className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none"
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
            >
              <option value="">Standart</option>
              {hotel.roomTypes.map(rt => (
                <option key={rt.type} value={rt.type} className="dark:bg-slate-900">{rt.type}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <button 
        onClick={handleCheck}
        disabled={loading || !checkIn || !checkOut}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] flex justify-center items-center ${loading || !checkIn || !checkOut ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
        {loading ? 'Tekshirilmoqda...' : 'Mavjudligini tekshirish'}
      </button>

      {isAvailable === false && !loading && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl text-center">
          {message || 'Not available for selected dates.'}
        </div>
      )}

      {isAvailable === true && nights > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>{new Intl.NumberFormat('uz-UZ').format(hotel.pricePerNight)} × {nights} tun</span>
            <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('uz-UZ').format(roomTotal)} UZS</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Xizmat to'lovi</span>
            <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('uz-UZ').format(serviceFee)} UZS</span>
          </div>
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="font-bold text-gray-900 dark:text-white">Jami</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{new Intl.NumberFormat('uz-UZ').format(grandTotal)} UZS</span>
          </div>

          {/* Payment Method */}
          <div className="pt-3">
            <p className="text-[10px] uppercase font-bold text-gray-400 mb-2">To'lov usuli</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${
                    paymentMethod === method
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleReserve}
            disabled={booking}
            className={`w-full mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center ${booking ? 'opacity-60' : ''}`}
          >
            {booking && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
            {booking ? 'Band qilinmoqda...' : user ? 'Hozir band qilish' : 'Kirish va band qilish'}
          </button>
          <p className="text-[10px] text-center text-gray-400 uppercase font-bold tracking-widest mt-3">Hozircha to'lov olinmaydi</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;