import React, { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiCheckCircle } from 'react-icons/fi';

const AvailabilityChecker = ({ hotel }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [roomId, setRoomId] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  
  const [upsells, setUpsells] = useState({
    breakfast: false,
    airportTransfer: false,
    extraBed: false
  });

  const [isAvailable, setIsAvailable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [message, setMessage] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const selectedRoom = useMemo(() => {
    if (!hotel?.rooms) return null;
    return hotel.rooms.find(r => r._id === roomId) || hotel.rooms[0] || null;
  }, [hotel, roomId]);

  // Set initial room id
  React.useEffect(() => {
    if (hotel?.rooms?.[0] && !roomId) {
      setRoomId(hotel.rooms[0]._id);
    }
  }, [hotel, roomId]);

  const { nights, roomTotal, grandTotal } = useMemo(() => {
    if (!checkIn || !checkOut || !selectedRoom) return { nights: 0, roomTotal: 0, grandTotal: 0 };
    
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const n = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (n <= 0) return { nights: 0, roomTotal: 0, grandTotal: 0 };

    let calculatedRoomTotal = 0;
    let currentDay = new Date(start);

    while (currentDay < end) {
      let daily = selectedRoom.pricePerNight;
      const dayOfWeek = currentDay.getDay();
      
      // Weekend markup (Friday=5, Saturday=6)
      if (dayOfWeek === 5 || dayOfWeek === 6) {
        const markup = hotel?.dynamicPricing?.weekendMarkupPercent || 0;
        daily += (daily * markup) / 100;
      }
      calculatedRoomTotal += daily;
      currentDay.setDate(currentDay.getDate() + 1);
    }

    // Upsell Costs
    let upsellTotal = 0;
    if (upsells.breakfast) upsellTotal += (150000 * guests * n); // 150k per guest per night
    if (upsells.airportTransfer) upsellTotal += 250000; // Flat 250k
    if (upsells.extraBed) upsellTotal += (100000 * n); // 100k per night

    return { 
      nights: n, 
      roomTotal: calculatedRoomTotal, 
      grandTotal: calculatedRoomTotal + upsellTotal 
    };
  }, [checkIn, checkOut, selectedRoom, hotel, guests, upsells]);

  const handleCheck = async () => {
    if (!checkIn || !checkOut || !hotel || !selectedRoom) return;
    if (new Date(checkOut) <= new Date(checkIn)) {
      setMessage('Xato: Chiqish sanasi kirish sanasidan keyin bo\'lishi kerak.');
      setIsAvailable(false);
      return;
    }
    
    if (guests > selectedRoom.capacity) {
       setMessage(`Kechirasiz, ushbu xona maksimal ${selectedRoom.capacity} kishiga mo'ljallangan.`);
       setIsAvailable(false);
       return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await api.get(`/hotels/${hotel._id}/availability?roomId=${selectedRoom._id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
      setIsAvailable(res.data.available);
      setMessage(res.data.message || '');
    } catch (err) {
      setIsAvailable(false);
      setMessage('Tarmoq xatosi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleReserve = async () => {
    if (!user) return navigate('/login');

    setBooking(true);
    try {
      await api.post('/bookings', {
        hotelId: hotel._id,
        roomId: selectedRoom._id,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestsCount: guests,
        upsells
      });
      setBooked(true);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Bron qilishda xatolik yuz berdi.');
    } finally {
      setBooking(false);
    }
  };

  if (booked) {
    return (
      <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 text-center">
        <FiCheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Bron tasdiqlandi!</h3>
        <p className="text-gray-500 text-sm mb-4">
          {hotel.name} · {selectedRoom?.name} · {nights} tun
        </p>
        <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mb-6">
          {new Intl.NumberFormat('uz-UZ').format(grandTotal)} UZS
        </p>
        <button
          onClick={() => navigate('/bookings')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl transition-all active:scale-[0.98]"
        >
          Mening bronlarim
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1e293b] p-6 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800">
      
      {/* Price Display */}
      <div className="flex justify-between items-baseline mb-6">
        <div>
          <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {new Intl.NumberFormat('uz-UZ').format(selectedRoom?.pricePerNight || hotel?.basePricePerNight || 0)}
          </span>
          <span className="text-gray-400 dark:text-gray-500 text-sm ml-1 font-medium">UZS/tun</span>
        </div>
        
        {hotel?.policies?.cancellation === 'non-refundable' ? (
           <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-1 rounded-full uppercase tracking-wider">Qaytarilmaydigan</span>
        ) : (
           <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wider">Bepul bekor qilish</span>
        )}
      </div>

      <div className="space-y-4 mb-6">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
          <div className="bg-white dark:bg-slate-900 p-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Kirish</label>
            <input 
              type="date" 
              min={today}
              className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none" 
              value={checkIn}
              onChange={(e) => { setCheckIn(e.target.value); setIsAvailable(null); }}
            />
          </div>
          <div className="bg-white dark:bg-slate-900 p-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Chiqish</label>
            <input 
              type="date" 
              min={checkIn || today}
              className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none" 
              value={checkOut}
              onChange={(e) => { setCheckOut(e.target.value); setIsAvailable(null); }}
            />
          </div>
        </div>

        {/* Room Selection */}
        {hotel?.rooms?.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-3">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Xona tanlang</label>
            <select
              className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none"
              value={roomId}
              onChange={(e) => { setRoomId(e.target.value); setIsAvailable(null); }}
            >
              {hotel.rooms.map(room => (
                <option key={room._id} value={room._id} className="dark:bg-slate-900">
                  {room.name} ({room.category}) - Max {room.capacity} kishi
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Guests */}
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-3">
          <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Mehmonlar</label>
          <select 
            className="w-full text-sm font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white outline-none"
            value={guests}
            onChange={(e) => { setGuests(Number(e.target.value)); setIsAvailable(null); }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n} className="dark:bg-slate-900">{n} Kishi</option>
            ))}
          </select>
        </div>
        
        {/* Upsells (Qo'shimcha Xizmatlar) */}
        <div className="pt-2">
            <label className="block text-[10px] uppercase font-bold text-gray-400 mb-2">Qo'shimcha Xizmatlar</label>
            <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <input type="checkbox" checked={upsells.breakfast} onChange={(e) => setUpsells({...upsells, breakfast: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Ertalabki Nonushta</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">+150k /k</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <input type="checkbox" checked={upsells.airportTransfer} onChange={(e) => setUpsells({...upsells, airportTransfer: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Aeroport Transferi</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">+250k</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl transition-colors">
                    <input type="checkbox" checked={upsells.extraBed} onChange={(e) => setUpsells({...upsells, extraBed: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">Qo'shimcha Yotoq</span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">+100k /tun</span>
                </label>
            </div>
        </div>

      </div>

      <button 
        onClick={handleCheck}
        disabled={loading || !checkIn || !checkOut}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex justify-center items-center ${loading || !checkIn || !checkOut ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
        {loading ? 'Tekshirilmoqda...' : 'Mavjudligini tekshirish'}
      </button>

      {isAvailable === false && !loading && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl text-center">
          {message || 'Kechirasiz, tanlangan kunlar uchun bo\'sh xona yo\'q.'}
        </div>
      )}

      {isAvailable === true && nights > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Room Total ({nights} tun)</span>
            <span className="font-bold text-gray-900 dark:text-white">{new Intl.NumberFormat('uz-UZ').format(roomTotal)} UZS</span>
          </div>
          {grandTotal - roomTotal > 0 && (
            <div className="flex justify-between text-sm text-blue-600 dark:text-blue-400">
                <span>Qo'shimcha xizmatlar</span>
                <span className="font-bold">+{new Intl.NumberFormat('uz-UZ').format(grandTotal - roomTotal)} UZS</span>
            </div>
          )}
          <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center mb-4">
            <span className="font-bold text-gray-900 dark:text-white">Jami Summa</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">{new Intl.NumberFormat('uz-UZ').format(grandTotal)} UZS</span>
          </div>
          
          <button 
            onClick={handleReserve}
            disabled={booking}
            className={`w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all active:scale-[0.98] flex items-center justify-center ${booking ? 'opacity-60' : ''}`}
          >
            {booking && <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />}
            {booking ? 'Band qilinmoqda...' : user ? 'Oldindan band qilish (To\'lovsiz)' : 'Kirish va band qilish'}
          </button>
          <p className="text-[10px] text-center text-gray-400 uppercase font-bold tracking-widest mt-3">Joyingiz kafolatlanadi</p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;