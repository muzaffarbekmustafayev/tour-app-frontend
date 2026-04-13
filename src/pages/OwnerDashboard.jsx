import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FiArrowLeft, FiEdit3, FiMapPin, FiNavigation,
  FiMap, FiDollarSign, FiUsers, FiImage,
  FiClock, FiFile, FiBell, FiCheck, FiCommand,
  FiLock, FiPlus, FiHome, FiList, FiStar, FiEdit2, FiEye, FiTrash2
} from 'react-icons/fi';
import BackButton from '../components/BackButton';


const amenitiesList = ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Air Conditioning', 'Airport Shuttle', 'Bar', 'Meeting Rooms', 'Laundry', 'Room Service', '24h Reception'];
const accessibilityList = [
  { key: 'wheelchairAccessible', label: 'Arava (Kolyaska) bilan kirish' },
  { key: 'elevator', label: 'Lift mavjud' },
  { key: 'brailleSigns', label: 'Brayl shrifti (Ko\'zi ojizlar uchun)' },
  { key: 'tactileFlooring', label: 'Taktil pol qoplamalari' },
  { key: 'hearingAssistance', label: 'Eshitish moslamalari' },
  { key: 'voiceAssistant', label: 'Ovozli boshqaruv / Yordam' },
  { key: 'signLanguage', label: 'Imo-ishora tili xizmati' },
  { key: 'emergencyButtons', label: 'Favqulodda yordam tugmalari' },
  { key: 'wideDoors', label: 'Keng eshiklar' },
  { key: 'showerSeat', label: 'Dush o\'rindig\'i' },
];


const nearbyPlacesList = [
  'Navoiy bog\'i', 'Alisher Navoiy haykali', 'Markaziy xiyobon', 'Poytaxt savdo markazi',
  'Hazrati Mir Said Bahrom maqbarasi', 'Qosim Shayx xonaqohi', 'Sarmishsoy qoyatoshlari',
  'Nurata Chashma majmuasi', 'Aydarko\'l', 'G\'ozg\'on koshonasi', 'Navoiy markaziy stadioni'
];


const securityList = [
  'CCTV (Kameratizm)', '24/7 Qo\'riqlash', 'Seyf', 'Yong\'in o\'chirish tizimi',
  'Signalizatsiya', 'Kodli qulf', 'Elektron kalit', 'Video domofon'
];


const emptyHotel = {
  name: '', description: '', shortDescription: '',
  city: '', country: 'Uzbekistan', address: '',
  category: 'hotel', basePricePerNight: 500000, roomsAvailable: 10, totalRooms: '', maxGuests: '',
  checkInTime: '14:00', checkOutTime: '12:00',
  amenities: [], images: [''],
  nearbyPlaces: [], security: [],
  accessibility: {},
  location: { lat: '', lng: '' },
  rooms: [{ name: 'Standart Xona', roomType: 'Double Room', category: 'Standard', capacity: 2, pricePerNight: 500000, totalRooms: 5, roomsAvailable: 5 }]
};


const OwnerDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [hotelBookings, setHotelBookings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hotels');
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyHotel);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [bookingFilter, setBookingFilter] = useState('all');
  const fileInputRefs = useRef({});
  const navigate = useNavigate();

  const handleImageUpload = async (idx, file) => {
    if (!file) return;
    setUploadingIdx(idx);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleImageChange(idx, res.data.url);
    } catch (err) {
      setFormError("Rasmni yuklashda xatolik yuz berdi.");
    } finally {
      setUploadingIdx(null);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hotels/owner');
      setHotels(res.data);
      // Hotel yo'q bo'lsa forma ochilsin
      if (res.data.length === 0) {
        setShowForm(true);
      }
      const bookingsMap = {};
      for (const hotel of res.data) {
        try {
          const bRes = await api.get(`/bookings/hotel/${hotel._id}`);
          bookingsMap[hotel._id] = bRes.data;
        } catch { bookingsMap[hotel._id] = []; }
      }
      setHotelBookings(bookingsMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleConfirmBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/confirm`);
      const updated = {};
      for (const [hid, bks] of Object.entries(hotelBookings)) {
        updated[hid] = bks.map(b => b._id === bookingId ? { ...b, status: 'confirmed' } : b);
      }
      setHotelBookings(updated);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const handleCancelBooking = async (bookingId) => {
    setActionLoading(bookingId);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      const updated = {};
      for (const [hid, bks] of Object.entries(hotelBookings)) {
        updated[hid] = bks.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b);
      }
      setHotelBookings(updated);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm({ ...emptyHotel });
    setFormError('');
    setShowForm(true);
  };

  const openEditForm = (hotel) => {
    setEditingId(hotel._id);
    setForm({
      ...hotel,
      location: hotel.location || { lat: '', lng: '' },
      rooms: hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms : emptyHotel.rooms
    });
    setFormError('');
    setShowForm(true);
  };


  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleRoomFieldChange = (idx, field, value) => {
    setForm(prev => {
      const newRooms = [...prev.rooms];
      newRooms[idx] = { ...newRooms[idx], [field]: value };
      
      // Avtomatik nomlash: "2 kishilik Deluxe"
      const capacity = newRooms[idx].capacity || 2;
      const category = newRooms[idx].category || 'Standard';
      newRooms[idx].name = `${capacity} kishilik ${category}`;
      
      return { ...prev, rooms: newRooms };
    });
  };


  const addRoomType = () => {
    setForm(prev => ({
      ...prev,
      rooms: [...prev.rooms, { name: '', roomType: 'Double Room', category: 'Standard', capacity: 2, pricePerNight: 500000, totalRooms: 1, roomsAvailable: 1 }]
    }));
  };

  const removeRoomType = (idx) => {
    if (form.rooms.length > 1) {
      setForm(prev => ({ 
        ...prev, 
        rooms: prev.rooms.filter((_, i) => i !== idx) 
      }));
    }
  };


  const handleGetGPS = async (useHighAccuracy = true) => {
    setGpsLoading(true);
    setFormError('');

    if (!navigator.geolocation) {
      setFormError("Brauzeringiz geolokatsiyani qo'llab-quvvatlamaydi!");
      setGpsLoading(false);
      return;
    }

    try {
      // Brauzer ruxsatini tekshirish
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        if (result.state === 'denied') {
          setFormError("Ruxsat berilmagan. Iltimos, brauzer sozlalaridan (URL yonidagi qulf belgisi) joylashuvga ruxsat bering va sahifani yangilang.");
          setGpsLoading(false);
          return;
        }
      }

      const options = {
        enableHighAccuracy: useHighAccuracy,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          setForm(prev => ({
            ...prev,
            location: {
              lat: coords.latitude.toFixed(6),
              lng: coords.longitude.toFixed(6)
            }
          }));
          setFormError(''); 
          setGpsLoading(false);
        },

        (error) => {
          console.error("GPS Error:", error);
          if (useHighAccuracy && error.code !== error.PERMISSION_DENIED) {
             return handleGetGPS(false);
          }

        let msg = "";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Joylashuvga ruxsat bloklangan! 🛑 \nIltimos, brauzerning manzillar satridagi (URL yonidagi) 🔒 Qulf belgisini bosing va 'Location' (Joylashuv) ruxsatini 'Allow' (Ruxsat berish) qilib o'zgartiring. Keyin sahifani yangilab qayta urinib ko'ring.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Sizning hududingizda GPS ma'lumoti topilmadi. Koordinatalarni qo'lda kiritishingiz mumkin.";
            break;
          case error.TIMEOUT:
            msg = "Kutish vaqti tugadi. Internet aloqasini tekshiring.";
            break;
          default:
            msg = "Tizimda noma'lum xatolik yuz berdi.";
        }
        setFormError(msg);
        setGpsLoading(false);
      },

        options
      );
    } catch (e) {
      console.error(e);
      setGpsLoading(false);
    }
  };




  const toggleAmenity = (amenity) => {
    setForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const toggleAccessibility = (key) => {
    setForm(prev => ({
      ...prev,
      accessibility: { ...prev.accessibility, [key]: !prev.accessibility[key] }
    }));
  };

  const toggleNearbyPlace = (place) => {
    setForm(prev => ({
      ...prev,
      nearbyPlaces: (prev.nearbyPlaces || []).includes(place)
        ? prev.nearbyPlaces.filter(i => i !== place)
        : [...(prev.nearbyPlaces || []), place]
    }));
  };

  const toggleSecurity = (item) => {
    setForm(prev => ({
      ...prev,
      security: (prev.security || []).includes(item)
        ? prev.security.filter(i => i !== item)
        : [...(prev.security || []), item]
    }));
  };


  const handleImageChange = (idx, value) => {
    setForm(prev => {
      const imgs = [...prev.images];
      imgs[idx] = value;
      return { ...prev, images: imgs };
    });
  };

  const addImageField = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, ''] }));
  };

  const removeImageField = (idx) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    // Validation
    const images = form.images.filter(img => img.trim() !== '');
    if (images.length === 0) {
      setFormError('Kamida bitta rasm havolasini kiritish shart!');
      setFormLoading(false);
      return;
    }
    if (!form.address || form.address.trim() === '') {
      setFormError('Mehmonxona manzili kiritilishi shart!');
      setFormLoading(false);
      return;
    }
    if (!form.location.lat || !form.location.lng) {
      setFormError('Xaritadagi joylashuv (koordinatalar) aniqlanishi shart!');
      setFormLoading(false);
      return;
    }
    if (!form.amenities || form.amenities.length === 0) {
      setFormError('Kamida bitta qulaylik (Amenity) tanlanishi shart!');
      setFormLoading(false);
      return;
    }
    if (!form.category) {
      setFormError('Mehmonxona kategoriyasi tanlanishi shart!');
      setFormLoading(false);
      return;
    }

    const payload = {
      ...form,
      pricePerNight: Number(form.basePricePerNight || form.pricePerNight),
      basePricePerNight: Number(form.basePricePerNight || form.pricePerNight),
      roomsAvailable: Number(form.roomsAvailable),
      totalRooms: Number(form.totalRooms),
      maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
      images: images,
      location: { lat: Number(form.location.lat), lng: Number(form.location.lng) },
      rooms: form.rooms.map(r => ({
        ...r,
        capacity: Number(r.capacity),
        pricePerNight: Number(r.pricePerNight),
        totalRooms: Number(r.totalRooms),
        roomsAvailable: Number(r.totalRooms) // Dastlab jami xonalarga teng
      }))
    };



    try {
      if (editingId) {
        await api.put(`/hotels/${editingId}`, payload);
      } else {
        await api.post('/hotels', payload);
      }
      setShowForm(false);
      fetchData(); // Refresh list
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save hotel. Please check all fields.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel? This cannot be undone.')) return;
    setActionLoading(hotelId);
    try {
      await api.delete(`/hotels/${hotelId}`);
      setHotels(prev => prev.filter(h => h._id !== hotelId));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const allBookings = hotels.flatMap(h => {
    const bks = hotelBookings[h._id] || [];
    return bks.map(b => ({ ...b, hotelObj: h }));
  }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).reverse();

  const filteredBookings = bookingFilter === 'all' ? allBookings : allBookings.filter(b => b.status === bookingFilter);

  const totalRevenue = allBookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.totalPrice || 0), 0);

  // ---------- FORM VIEW ----------
  if (showForm) {
    return (
      <div className="pb-28 md:pb-8 pt-4 px-4 max-w-3xl mx-auto min-h-screen lg:pl-32">
        <div className="flex items-center mb-6">
          <BackButton onClick={() => { if (hotels.length > 0) setShowForm(false); else navigate(-1); }} />
          <div className="ml-4">


            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {editingId ? 'Mehmonxonani Tahrirlash' : hotels.length === 0 ? <><FiHome className="inline mr-2" /> Birinchi mehmonxonangizni qo'shing</> : 'Yangi Mehmonxona Qo\'shish'}
            </h1>
            {!editingId && hotels.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">Bronlarni qabul qilish uchun kamida bitta mehmonxona kiriting.</p>
            )}
          </div>
        </div>

        {formError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-4 mb-6 text-sm font-medium whitespace-pre-wrap">
            {formError}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiEdit3 className="text-blue-500" /> Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Hotel Name *</label>
                <input type="text" required value={form.name} onChange={e => handleFormChange('name', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder=" Navai City" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe your hotel..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Kategoriya</label>
                  <select value={form.category} onChange={e => handleFormChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                    {['hotel', 'resort', 'hostel', 'boutique', 'motel', 'guesthouse'].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Xonalar soni *</label>
                  <input type="number" required value={form.roomsAvailable} onChange={e => handleFormChange('roomsAvailable', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 10" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Bir kecha uchun narx (UZS) *</label>
                <input type="number" required value={form.pricePerNight} onChange={e => handleFormChange('pricePerNight', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 500000" />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiMapPin className="text-red-500" /> Location</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">City *</label>
                  <input type="text" required value={form.city} onChange={e => handleFormChange('city', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Navoiy" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Country</label>
                  <input type="text" value="Uzbekistan" readOnly
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none opacity-70 cursor-not-allowed" />
                </div>

              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => handleFormChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="" />
              </div>
              {/* GPS Koordinatalar */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">GPS Koordinatalar *</label>
                  <div className="flex gap-2">
                    <a
                      href="https://www.google.com/maps"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 text-[11px] font-bold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 transition"
                    >
                      <FiMap className="w-3.5 h-3.5" /> Xaritadan qidirish
                    </a>
                    <button
                      type="button"
                      onClick={() => handleGetGPS(true)}
                      disabled={gpsLoading}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm ${
                        gpsLoading
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {gpsLoading ? (
                        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : <FiNavigation className="w-3.5 h-3.5" />}
                      {gpsLoading ? 'Qidirilmoqda...' : 'GPSni aniqlash'}
                    </button>
                  </div>
                </div>
              </div>

                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Latitude (Kenglik)</label>
                    <input
                      type="number" step="any"
                      value={form.location?.lat || ''}
                      onChange={e => setForm(prev => ({ ...prev, location: { ...prev.location, lat: e.target.value } }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Masalan: 40.1023"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Longitude (Uzunlik)</label>
                    <input
                      type="number" step="any"
                      value={form.location?.lng || ''}
                      onChange={e => setForm(prev => ({ ...prev, location: { ...prev.location, lng: e.target.value } }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Masalan: 65.3733"
                    />
                  </div>
                </div>
                
                <p className="mt-3 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-800/30">
                  <span className="font-bold text-blue-600 dark:text-blue-400 underline mr-1">Maslahat:</span> 
                  Agar GPS ishlamasa, <strong>"Xaritadan qidirish"</strong> tugmasini bosing, Google Maps da joyingizni topib, ustiga bosing va pastda chiqqan koordinatalarni bu yerga kiriting.
                </p>

                {form.location?.lat && form.location?.lng && (
                  <div className="mt-3 flex justify-end">
                    <a
                      href={`https://www.google.com/maps?q=${form.location.lat},${form.location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:underline px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
                    >
                      <FiEye className="w-3.5 h-3.5" /> Koordinatalarni xaritada tekshirish
                    </a>
                  </div>
                )}
              </div>
            </div>




          {/* Room Types */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2"><FiHome className="text-indigo-500" /> Xona turlari</h2>
              <button type="button" onClick={addRoomType} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100 transition">
                <FiPlus className="w-3.5 h-3.5" /> Xona turi qo'shish
              </button>
            </div>
            <div className="space-y-4">
              {form.rooms.map((room, idx) => (
                <div key={idx} className="p-4 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-gray-700/50 relative group">
                  {form.rooms.length > 1 && (
                    <button type="button" onClick={() => removeRoomType(idx)} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 transition opacity-0 group-hover:opacity-100">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Xona Kategoriyasi</label>
                      <select value={room.category || 'Standard'} onChange={e => handleRoomFieldChange(idx, 'category', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        {['Standard', 'Comfort', 'Deluxe', 'Suite', 'Luxury / VIP'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Sig'imi (Kishi)</label>
                        <select value={room.capacity} onChange={e => handleRoomFieldChange(idx, 'capacity', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500">
                          {[1, 2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} kishilik</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Soni (Jami)</label>
                        <input type="number" min={1} value={room.totalRooms} required onChange={e => handleRoomFieldChange(idx, 'totalRooms', e.target.value)}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Bir kecha uchun narxi (UZS)</label>
                      <input type="number" min={0} value={room.pricePerNight} required onChange={e => handleRoomFieldChange(idx, 'pricePerNight', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500 text-green-600" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Xona turi (Bino ko'rinishi)</label>
                      <select value={room.roomType} onChange={e => handleRoomFieldChange(idx, 'roomType', e.target.value)}
                        className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-blue-500">
                        {['Single Room', 'Double Room', 'Triple Room', 'Quad Room', 'Family Room'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Pricing & Time (General) */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiClock className="text-green-500" /> Vaqt va Umumiy ma'lumotlar</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Check-in Time</label>
                <input type="time" value={form.checkInTime} onChange={e => handleFormChange('checkInTime', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Check-out Time</label>
                <input type="time" value={form.checkOutTime} onChange={e => handleFormChange('checkOutTime', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="mt-4 hidden">
              {/* Fallback metrics if needed */}
              <input type="hidden" value={form.basePricePerNight} />
              <input type="hidden" value={form.roomsAvailable} />
            </div>
          </div>


          {/* Images */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiImage className="text-purple-500" /> Rasmlar</h2>
            <div className="space-y-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex gap-2">
                    <input type="text" value={img} onChange={e => handleImageChange(idx, e.target.value)}
                      className="flex-1 px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://... yoki quyidagi tugma orqali yuklang" />
                    <button
                      type="button"
                      onClick={() => fileInputRefs.current[idx]?.click()}
                      disabled={uploadingIdx === idx}
                      className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-100 transition whitespace-nowrap disabled:opacity-50"
                    >
                      {uploadingIdx === idx ? <FiClock className="animate-spin w-4 h-4" /> : <><FiFile className="mr-1" /> Fayl</>}
                    </button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={el => fileInputRefs.current[idx] = el}
                      onChange={e => handleImageUpload(idx, e.target.files[0])}
                    />
                    {form.images.length > 1 && (
                      <button type="button" onClick={() => removeImageField(idx)} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition">✕</button>
                    )}
                  </div>
                  {img && img.startsWith('http') && (
                    <img src={img} alt="preview" className="h-20 w-32 object-cover rounded-xl border border-gray-200 dark:border-gray-700" />
                  )}
                </div>
              ))}
              <button type="button" onClick={addImageField} className="text-blue-600 text-sm font-bold hover:underline">+ Rasm qo'shish</button>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiBell className="text-yellow-500" /> Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map(a => (
                <button key={a} type="button" onClick={() => toggleAmenity(a)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${form.amenities.includes(a)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                    }`}>
                  {form.amenities.includes(a) && <FiCheck className="inline mr-1" />}{a}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiCommand className="text-blue-500" /> Nogironlar uchun qulayliklar</h2>
            <div className="grid grid-cols-2 gap-3">
              {accessibilityList.map(opt => (
                <label key={opt.key} className="flex items-center cursor-pointer group">
                  <input type="checkbox" checked={!!form.accessibility[opt.key]} onChange={() => toggleAccessibility(opt.key)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nearby Places */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiMapPin className="text-red-500" /> Yaqin turistik joylar</h2>
            <div className="flex flex-wrap gap-2">
              {nearbyPlacesList.map(p => (
                <button key={p} type="button" onClick={() => toggleNearbyPlace(p)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${form.nearbyPlaces.includes(p)
                    ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-red-400'
                    }`}>
                  {form.nearbyPlaces.includes(p) && <FiCheck className="inline mr-1" />}{p}
                </button>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiLock className="text-gray-500" /> Xavfsizlik tizimlari</h2>
            <div className="flex flex-wrap gap-2">
              {securityList.map(s => (
                <button key={s} type="button" onClick={() => toggleSecurity(s)}
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${form.security.includes(s)
                    ? 'bg-slate-700 text-white border-slate-700 shadow-md shadow-gray-200 dark:shadow-none'
                    : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    }`}>
                  {form.security.includes(s) && <FiCheck className="inline mr-1" />}{s}
                </button>
              ))}
            </div>
          </div>


          {/* Submit */}
          <button
            type="submit"
            disabled={formLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center ${formLoading ? 'opacity-60' : ''}`}
          >
            {formLoading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
            {formLoading ? 'Saqlanmoqda...' : editingId ? 'Yangilash' : 'Mehmonxona qo\'shish'}
          </button>
        </form>
      </div>
    );
  }

  // ---------- MAIN VIEW ----------
  if (loading) return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Owner Dashboard</h1>
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="animate-pulse bg-white dark:bg-slate-800 h-40 rounded-3xl border border-gray-100 dark:border-gray-800" />)}
      </div>
    </div>
  );

  return (
    <div className="pb-28 md:pb-8 pt-4 px-4 max-w-7xl mx-auto min-h-screen lg:pl-32">
      <div className="flex flex-col sm:flex-row sm:items-center mb-10 gap-6">
        <BackButton />
        <div className="flex-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 ml-0 sm:ml-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2 leading-tight">Mehmonxonalar Paneli</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              O'z mehmonxonalaringizni boshqaring
            </p>
          </div>
          <button onClick={openAddForm} className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-[2rem] font-black text-sm shadow-xl shadow-blue-200/50 dark:shadow-none transition-all active:scale-95 flex items-center justify-center group">
            <div className="p-1.5 bg-white/20 rounded-lg mr-3 group-hover:rotate-90 transition-transform duration-300">
              <FiPlus className="w-5 h-5 text-white" />
            </div>
            Mehmonxona Qo'shish
          </button>
        </div>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Mening Mehmonxonalarim', value: hotels.length, gradient: 'from-[#4F46E5] to-[#7C3AED]', icon: <FiHome className="w-6 h-6" /> },
          // { label: 'Jami Bronlar', value: allBookings.length, gradient: 'from-[#EC4899] to-[#8B5CF6]', icon: <FiList className="w-6 h-6" /> },
          // { label: 'Kutilayotgan', value: allBookings.filter(b => b.status === 'pending').length, gradient: 'from-[#F59E0B] to-[#EF4444]', icon: <FiClock className="w-6 h-6" /> },
          // { label: 'Daromad', value: new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(totalRevenue) + ' UZS', gradient: 'from-[#10B981] to-[#047857]', icon: <FiDollarSign className="w-6 h-6" /> },
        ].filter(s => s.label === 'Mening Mehmonxonalarim').map((s, i) => (

          <div key={i} className={`bg-gradient-to-br ${s.gradient} p-7 rounded-[2rem] text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                {s.icon}
              </div>
              <div>
                <h3 className="text-4xl font-black drop-shadow-md mb-1">{s.value}</h3>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-sm">{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-3 mb-10 overflow-x-auto hide-scrollbar pb-2 px-1">
        {[
          { key: 'hotels', label: <span className="flex items-center gap-2"><FiHome /> Mening Mehmonxonalarim</span> },
          // { key: 'bookings', label: <span className="flex items-center gap-2"><FiList /> Mijozlar Bronlari</span> },
        ].filter(t => t.key === 'hotels').map(t => (

          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-7 py-3.5 rounded-2xl font-black text-[13px] whitespace-nowrap transition-all duration-300 ${activeTab === t.key
              ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-300 dark:shadow-none scale-105 transform'
              : 'glass-panel text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-slate-800 hover:-translate-y-0.5'
              }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Hotels Tab */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          {hotels.map(hotel => {
            const hBookings = hotelBookings[hotel._id] || [];
            return (
              <div key={hotel._id} className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">{hotel.name}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                        <FiMapPin className="text-red-500" /> {hotel.city}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">
                        • {hotel.rooms?.length || 0} xona turlari • {new Intl.NumberFormat('uz-UZ').format(Number(hotel.pricePerNight || 0) || 0)} UZS/kecha
                      </span>
                    </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${hotel.approved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {hotel.approved ? 'Active' : 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-gray-100/50 dark:border-gray-700/50">
                    <p className="text-xl font-black text-blue-600 dark:text-blue-400">{(hotelBookings[hotel._id] || []).length}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bookings</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-gray-100/50 dark:border-gray-700/50">
                    <p className="text-xl font-black text-yellow-500 flex items-center justify-center gap-1"><FiStar className="fill-current w-3.5 h-3.5" /> {hotel.rating?.toFixed(1) || '—'}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Rating</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center border border-gray-100/50 dark:border-gray-700/50">
                    <p className="text-xl font-black text-green-600">{hotel.reviewsCount || 0}</p>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reviews</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => openEditForm(hotel)} className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-black py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-100 dark:border-blue-800/50">
                    <FiEdit2 /> Tahrirlash
                  </button>
                  <button onClick={() => navigate(`/hotel/${hotel._id}`)} className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 font-black py-4 rounded-2xl hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-gray-900 transition-all active:scale-95 border border-gray-100 dark:border-gray-700">
                    <FiEye /> Ko'rish
                  </button>
                  <button onClick={() => handleDeleteHotel(hotel._id)} disabled={actionLoading === hotel._id}
                    className="w-full sm:w-16 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all active:scale-95 disabled:opacity-50 border border-red-100 dark:border-red-800/50">
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
          {hotels.length === 0 && (
            <div className="text-center py-20 glass-panel">
              <FiHome className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Hozircha mehmonxonalar yo'q</h3>
              <p className="text-gray-500 mb-6">Bronlarni qabul qilishni boshlash uchun birinchi mehmonxonangizni qo'shing.</p>
              <button onClick={openAddForm} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform">
                + Mehmonxona Qo'shish
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div>
          {/* Booking Filters */}
          <div className="flex space-x-2 mb-6 overflow-x-auto hide-scrollbar pb-2">
            {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map(tab => {
              const count = tab === 'all' ? allBookings.length : allBookings.filter(b => b.status === tab).length;
              return (
                <button
                  key={tab}
                  onClick={() => setBookingFilter(tab)}
                  className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${bookingFilter === tab
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                    }`}
                >
                  {tab === 'all' ? 'Barchasi' : tab === 'pending' ? 'Yangi So\'rovlar' : tab === 'confirmed' ? 'Tasdiqlangan' : tab === 'cancelled' ? 'Bekor qilingan' : 'Yakunlangan'}
                  {count > 0 && tab !== 'all' && (
                    <span className="ml-2 text-[10px] bg-blue-600 text-white rounded-full px-1.5 py-0.5">{count}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-4">
            {filteredBookings.length > 0 ? filteredBookings.map(b => {
              const h = b.hotelObj || {};
              const nights = b.checkInDate && b.checkOutDate ? Math.max(1, Math.ceil((new Date(b.checkOutDate) - new Date(b.checkInDate)) / (1000 * 60 * 60 * 24))) : '?';

              return (
                <div key={b._id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center gap-6 relative overflow-hidden group hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800">
                  {/* Decorative status bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-2 ${b.status === 'confirmed' ? 'bg-gradient-to-b from-green-400 to-green-600' : b.status === 'pending' ? 'bg-gradient-to-b from-yellow-400 to-yellow-600' : b.status === 'cancelled' ? 'bg-gradient-to-b from-red-400 to-red-600' : 'bg-gradient-to-b from-gray-400 to-gray-600'}`} />

                  {/* Info Section */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-5">
                    <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-2xl shrink-0 shadow-inner border border-white dark:border-slate-800">
                      {b.user?.name?.[0]?.toUpperCase() || 'M'}
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-gray-900 dark:text-white text-[17px] leading-tight group-hover:text-indigo-600 transition-colors">{b.user?.name || 'Mijoz'}</h3>
                          <span className="text-xs font-bold text-gray-400">({b.user?.email || 'Mavjud emas'})</span>
                        </div>
                        <span className={`w-fit px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${b.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50'
                          }`}>
                          {b.status === 'pending' ? 'Kutilmoqda' : b.status === 'confirmed' ? 'Tasdiqlangan' : b.status === 'cancelled' ? 'Bemkor qilingan' : b.status}
                        </span>
                      </div>

                      <div className="bg-white/50 dark:bg-slate-800/50 rounded-2xl p-4 border border-white/60 dark:border-gray-700/50">
                        <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center"><FiHome className="mr-1.5" /> {h.name}</p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                          <div>
                            <span className="text-[10px] uppercase font-black text-gray-400 block mb-0.5 tracking-widest">Sanalar</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">
                              {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '—'} <span className="text-gray-300 mx-1">→</span> {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' }) : '—'}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-black text-gray-400 block mb-0.5 tracking-widest">Tafsilot</span>
                            <span className="font-bold text-gray-800 dark:text-gray-200">{nights} tun, {b.guestsCount || 1} mehmon</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions / Price Section */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800/80 pt-4 md:pt-0 md:pl-6 shrink-0 min-w-[180px]">
                    <div className="text-left md:text-right mb-0 md:mb-5">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Umumiy Summa</span>
                      <span className="text-2xl font-black text-gray-900 dark:text-white block tracking-tight">
                        {new Intl.NumberFormat('uz-UZ').format(b.totalPrice || 0)} <span className="text-sm font-bold text-gray-400">UZS</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto relative">
                      {b.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                          <button onClick={() => handleConfirmBooking(b._id)} disabled={actionLoading === b._id}
                            className="flex-1 px-4 py-3 bg-green-50/80 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-xl text-[13px] font-bold active:scale-95 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                            {actionLoading === b._id ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : <FiCheck />} Qabul qilish
                          </button>
                          <button onClick={() => handleCancelBooking(b._id)} disabled={actionLoading === b._id}
                            className="flex-1 px-4 py-3 bg-red-50/80 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-xl text-[13px] font-bold active:scale-95 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                            Rad etish
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-24 glass-panel">
                <FiList className="mx-auto w-16 h-16 text-indigo-300 dark:text-slate-600 mb-4" />
                <p className="text-gray-900 dark:text-white font-black text-xl mb-1">{bookingFilter !== 'all' ? `Bu turdagi bronlar yo'q (${bookingFilter})` : 'Sizda hozircha bronlar mavjud emas.'}</p>
                <p className="text-gray-500 text-[13px] font-medium">Yangi mijozlar joy band qilganda shu yerda ko'rinadi.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;