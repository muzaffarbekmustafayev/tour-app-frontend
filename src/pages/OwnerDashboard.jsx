import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FiArrowLeft, FiEdit3, FiMapPin, FiNavigation,
  FiMap, FiDollarSign, FiUsers, FiImage,
  FiClock, FiFile, FiBell, FiCheck, FiCommand,
  FiLock, FiPlus, FiHome, FiStar, FiEdit2, FiEye, FiTrash2,
  FiRotateCw
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
  amenities: [], images: [''], videoTour: '',
  nearbyPlaces: [], security: [],
  accessibility: {},
  location: { lat: '', lng: '' },
  rooms: [{ name: 'Standart Xona', roomType: 'Double Room', category: 'Standard', capacity: 2, pricePerNight: 500000, totalRooms: 5, roomsAvailable: 5 }]
};


const OwnerDashboard = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState(emptyHotel);
  const [uploadingIdx, setUploadingIdx] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
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
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

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

  // ---------- FORM VIEW ----------
  if (showForm) {
    return (
      <div className="pb-28 md:pb-8 pt-6 px-4 max-w-5xl mx-auto min-h-screen lg:pl-32">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm gap-4 sticky top-4 z-[50]">
          <div className="flex items-center gap-4">
            <BackButton onClick={() => { if (hotels.length > 0) setShowForm(false); else navigate(-1); }} />
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {editingId ? 'Mehmonxonani Tahrirlash' : 'Yangi Mehmonxona'}
              </h1>
            </div>
          </div>
          <button
            onClick={handleFormSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
          >
            {submitting ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
          </button>
        </div>

        {formError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-4 mb-6 text-sm font-medium whitespace-pre-wrap">
            {formError}
          </div>
        )}


        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
            
            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">360° Video Tour (YouTube URL)</label>
              <div className="relative">
                <FiRotateCw className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  value={form.videoTour || ''} 
                  onChange={e => handleFormChange('videoTour', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://www.youtube.com/watch?v=..." 
                />
              </div>
              <p className="mt-2 text-[10px] text-gray-400 font-medium">YouTube 360° video havolasini kiriting. Bu mijozlarga mehmonxonani 360° formatda ko'rish imkonini beradi.</p>
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-gray-100 dark:border-slate-800 shadow-sm">
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
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen lg:pl-32">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Hamkor Paneli</h1>
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 h-40 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm" />)}
      </div>
    </div>
  );

  return (
    <div className="pb-28 md:pb-8 pt-6 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hamkor Paneli
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">Mehmonxonalaringizni boshqarish va bronlar</p>
          </div>
        </div>
        <button
          onClick={openAddForm}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <FiPlus className="w-5 h-5" />
          Yangi Mehmonxona
        </button>
      </div>


      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        {[
          { label: 'Mening Hotellarim', value: hotels.length, color: 'bg-indigo-600', icon: <FiHome className="w-5 h-5" /> },
          { label: 'O\'rtacha Reyting', value: '4.8', color: 'bg-amber-500', icon: <FiStar className="w-5 h-5" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm group hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 ${stat.color} text-white rounded-xl flex items-center justify-center shadow-sm`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{stat.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Mening Mehmonxonalarim</h2>

      {/* Hotels List */}
      <div className="space-y-4">
          {hotels.map(hotel => (
              <div key={hotel._id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors truncate">{hotel.name}</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                        <FiMapPin className="text-rose-500 w-3.5 h-3.5" /> {hotel.city}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        • {hotel.rooms?.length || 0} xona turi • {new Intl.NumberFormat('uz-UZ').format(Number(hotel.pricePerNight || 0) || 0)} UZS/kecha
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${hotel.approved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'}`}>
                    {hotel.approved ? 'Faol' : 'Kutilmoqda'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center border border-slate-100/50 dark:border-slate-700/50">
                    <p className="text-lg font-black text-yellow-500 flex items-center justify-center gap-1"><FiStar className="fill-current w-3.5 h-3.5" /> {hotel.rating?.toFixed(1) || '—'}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reyting</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl text-center border border-slate-100/50 dark:border-slate-700/50">
                    <p className="text-lg font-black text-emerald-600">{hotel.reviewsCount || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sharhlar</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-6 border-t border-slate-50 dark:border-slate-800">
                  <button onClick={() => openEditForm(hotel)} className="flex-1 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-sm">
                    <FiEdit2 className="w-3.5 h-3.5" /> Tahrirlash
                  </button>
                  <button onClick={() => navigate(`/hotel/${hotel._id}`)} className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <FiEye className="w-3.5 h-3.5" /> Ko'rish
                  </button>
                  <button onClick={() => handleDeleteHotel(hotel._id)} disabled={actionLoading === hotel._id} className="w-full sm:w-14 py-3 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 transition-all">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
          ))}
          {hotels.length === 0 && (
            <div className="text-center py-20 glass-panel">
              <FiHome className="w-16 h-16 text-indigo-300 mx-auto mb-4" />
              <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">Hozircha mehmonxonalar yo'q</h3>
              <p className="text-gray-500 mb-6">Mijozlar mehmonxonangizni ko'rishlari uchun birinchi mehmonxonangizni qo'shing.</p>
              <button onClick={openAddForm} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform">
                + Mehmonxona Qo'shish
              </button>
            </div>
          )}
        </div>
    </div>
  );
};

export default OwnerDashboard;