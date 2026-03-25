import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FiArrowLeft, FiEdit3, FiMapPin, FiNavigation, 
  FiMap, FiDollarSign, FiUsers, FiImage, 
  FiClock, FiFile, FiBell, FiCheck, FiCommand, 
  FiLock, FiPlus, FiHome, FiList, FiStar, FiEdit2, FiEye, FiTrash2, FiMessageCircle 
} from 'react-icons/fi';

const amenitiesList = ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Air Conditioning', 'Airport Shuttle', 'Bar', 'Meeting Rooms', 'Laundry', 'Room Service', '24h Reception'];
const accessibilityList = [
  { key: 'wheelchairAccessible', label: 'Wheelchair Access' },
  { key: 'elevator', label: 'Elevator' },
  { key: 'accessibleRooms', label: 'Accessible Rooms' },
  { key: 'brailleSigns', label: 'Braille Signs' },
  { key: 'hearingAssistance', label: 'Hearing Assistance' },
  { key: 'specialParking', label: 'Special Parking' },
];

const emptyHotel = {
  name: '', description: '', shortDescription: '',
  city: '', country: 'Uzbekistan', address: '',
  category: 'hotel', stars: 3,
  pricePerNight: '', roomsAvailable: '', totalRooms: '', maxGuests: '',
  checkInTime: '14:00', checkOutTime: '12:00',
  amenities: [], images: [''],
  accessibility: {},
  location: { lat: '', lng: '' },
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
      name: hotel.name || '',
      description: hotel.description || '',
      shortDescription: hotel.shortDescription || '',
      city: hotel.city || '',
      country: hotel.country || 'Uzbekistan',
      address: hotel.address || '',
      category: hotel.category || 'hotel',
      stars: hotel.stars || 3,
      pricePerNight: hotel.pricePerNight || '',
      roomsAvailable: hotel.roomsAvailable || '',
      totalRooms: hotel.totalRooms || '',
      maxGuests: hotel.maxGuests || '',
      checkInTime: hotel.checkInTime || '14:00',
      checkOutTime: hotel.checkOutTime || '12:00',
      amenities: hotel.amenities || [],
      images: hotel.images?.length > 0 ? hotel.images : [''],
      accessibility: hotel.accessibility || {},
      nearbyPlaces: hotel.nearbyPlaces || [],
      security: hotel.security || [],
      location: { lat: hotel.location?.lat || '', lng: hotel.location?.lng || '' },
    });
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) return setFormError("Brauzeringiz GPS ni qo'llab-quvvatlamaydi.");
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm(prev => ({ ...prev, location: { lat: coords.latitude, lng: coords.longitude } }));
        setGpsLoading(false);
      },
      () => {
        setFormError("Joylashuvni aniqlab bo'lmadi. Ruxsat bering.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
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

    const payload = {
      ...form,
      stars: Number(form.stars),
      pricePerNight: Number(form.pricePerNight),
      roomsAvailable: Number(form.roomsAvailable),
      totalRooms: Number(form.totalRooms),
      maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
      images: form.images.filter(img => img.trim() !== ''),
      location: (form.location?.lat && form.location?.lng)
        ? { lat: Number(form.location.lat), lng: Number(form.location.lng) }
        : undefined,
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
      <div className="pb-24 pt-4 px-4 max-w-3xl mx-auto min-h-screen">
        <div className="flex items-center mb-6">
          <button onClick={() => { if (hotels.length > 0) setShowForm(false); }} className={`mr-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full transition ${hotels.length > 0 ? 'hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer' : 'opacity-30 cursor-not-allowed'}`}>
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">
              {editingId ? 'Edit Hotel' : hotels.length === 0 ? <><FiHome className="inline mr-2" /> Birinchi mehmonxonangizni qo'shing</> : 'Add New Hotel'}
            </h1>
            {!editingId && hotels.length === 0 && (
              <p className="text-sm text-gray-500 mt-1">Bronlarni qabul qilish uchun kamida bitta mehmonxona kiriting.</p>
            )}
          </div>
        </div>

        {formError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-4 mb-6 text-sm font-medium">
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
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Registon Plaza" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description *</label>
                <textarea required rows={4} value={form.description} onChange={e => handleFormChange('description', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Describe your hotel..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Category</label>
                  <select value={form.category} onChange={e => handleFormChange('category', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                    {['hotel', 'resort', 'hostel', 'boutique', 'motel', 'guesthouse'].map(c => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Stars *</label>
                  <select value={form.stars} onChange={e => handleFormChange('stars', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500">
                    {[1, 2, 3, 4, 5].map(s => <option key={s} value={s}>{'★'.repeat(s)} ({s})</option>)}
                  </select>
                </div>
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
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Samarkand" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Country</label>
                  <input type="text" value={form.country} onChange={e => handleFormChange('country', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Address</label>
                <input type="text" value={form.address} onChange={e => handleFormChange('address', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Registon Square 1" />
              </div>
              {/* GPS Koordinatalar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">GPS Koordinatalar</label>
                  <button
                    type="button"
                    onClick={handleGetGPS}
                    disabled={gpsLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl transition active:scale-95"
                  >
                    {gpsLoading ? (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : <FiNavigation className="w-4 h-4" />}
                    {gpsLoading ? 'Aniqlanmoqda...' : 'Joriy joylashuvni olish'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Latitude</label>
                    <input
                      type="number" step="any"
                      value={form.location?.lat || ''}
                      onChange={e => setForm(prev => ({ ...prev, location: { ...prev.location, lat: e.target.value } }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="41.2995"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Longitude</label>
                    <input
                      type="number" step="any"
                      value={form.location?.lng || ''}
                      onChange={e => setForm(prev => ({ ...prev, location: { ...prev.location, lng: e.target.value } }))}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="69.2401"
                    />
                  </div>
                </div>
                {form.location?.lat && form.location?.lng && (
                  <a
                    href={`https://www.google.com/maps?q=${form.location.lat},${form.location.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-blue-600 hover:underline"
                  >
                    <FiMap className="w-4 h-4" /> Google Maps da tekshirish
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Rooms */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiDollarSign className="text-green-500" /> Pricing & Rooms</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Price/Night (UZS) *</label>
                <input type="number" required min={0} value={form.pricePerNight} onChange={e => handleFormChange('pricePerNight', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="1200000" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Available Rooms *</label>
                <input type="number" required min={0} value={form.roomsAvailable} onChange={e => handleFormChange('roomsAvailable', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Rooms</label>
                <input type="number" min={0} value={form.totalRooms} onChange={e => handleFormChange('totalRooms', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="50" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1"><FiUsers /> Max Mehmonlar</label>
                <input type="number" min={1} value={form.maxGuests} onChange={e => handleFormChange('maxGuests', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500" placeholder="2" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
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
                  className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${
                    form.amenities.includes(a)
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
            <input
              type="text"
              placeholder="vergul bilan ajrating: Registon, Bibi-Xonim, Shoh-i-Zinda"
              value={(form.nearbyPlaces || []).join(', ')}
              onChange={e => handleFormChange('nearbyPlaces', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Security */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2"><FiLock className="text-gray-500" /> Xavfsizlik tizimlari</h2>
            <input
              type="text"
              placeholder="vergul bilan ajrating: CCTV, 24/7 Qo'riqchi, Seyf"
              value={(form.security || []).join(', ')}
              onChange={e => handleFormChange('security', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
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
        {[1,2].map(i => <div key={i} className="animate-pulse bg-white dark:bg-slate-800 h-40 rounded-3xl border border-gray-100 dark:border-gray-800" />)}
      </div>
    </div>
  );

  return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
          <FiArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Owner Dashboard</h1>
            <p className="text-gray-500 font-medium">Manage your properties</p>
          </div>
          <button onClick={openAddForm} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-95 flex items-center">
            <FiPlus className="mr-2 w-5 h-5" />
            Add Hotel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'My Hotels', value: hotels.length, icon: <FiHome className="text-blue-500" /> },
          { label: 'Total Bookings', value: allBookings.length, icon: <FiList className="text-purple-500" /> },
          { label: 'Pending', value: allBookings.filter(b => b.status === 'pending').length, icon: <FiClock className="text-orange-500" /> },
          { label: 'Revenue', value: new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(totalRevenue) + ' UZS', icon: <FiDollarSign className="text-green-500" /> },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-[#1e293b] p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <p className="text-2xl mb-2">{s.icon}</p>
            <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-6">
        {[
          { key: 'hotels', label: <span className="flex items-center gap-2"><FiHome /> My Hotels</span> },
          { key: 'bookings', label: <span className="flex items-center gap-2"><FiList /> Bookings</span> },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
              activeTab === t.key
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
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
              <div key={hotel._id} className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{hotel.name}</h3>
                    <p className="text-sm text-gray-500">{hotel.city} · {hotel.stars}★ · {hotel.roomsAvailable} rooms · {new Intl.NumberFormat('uz-UZ').format(hotel.pricePerNight)} UZS/night</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${hotel.approved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                    {hotel.approved ? 'Active' : 'Pending'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                    <p className="text-lg font-black text-blue-600">{hBookings.length}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Bookings</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                    <p className="text-lg font-black text-yellow-500 flex items-center justify-center gap-1"><FiStar className="fill-current w-4 h-4" /> {hotel.rating?.toFixed(1) || '—'}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Rating</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl text-center">
                    <p className="text-lg font-black text-green-600">{hotel.reviewsCount || 0}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Reviews</p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button onClick={() => openEditForm(hotel)} className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold py-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <FiEdit2 /> Edit
                  </button>
                  <button onClick={() => navigate(`/hotel/${hotel._id}`)} className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white font-bold py-3 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors">
                    <FiEye /> View
                  </button>
                  <button onClick={() => handleDeleteHotel(hotel._id)} disabled={actionLoading === hotel._id}
                    className="px-5 flex items-center justify-center bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50">
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}
          {hotels.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800">
              <FiHome className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No hotels yet</h3>
              <p className="text-gray-500 mb-6">Add your first hotel to start receiving bookings.</p>
              <button onClick={openAddForm} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform">
                + Add Hotel
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
                  className={`px-5 py-2 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
                    bookingFilter === tab
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
                <div key={b._id} className="bg-white dark:bg-[#1e293b] rounded-[2rem] p-5 lg:p-6 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all overflow-hidden relative">
                  {/* Decorative status bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${b.status === 'confirmed' ? 'bg-green-500' : b.status === 'pending' ? 'bg-yellow-400' : b.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-400'}`} />
                  
                  {/* Info Section */}
                  <div className="flex-1 flex flex-col sm:flex-row gap-5">
                    <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl shrink-0 border border-blue-100 dark:border-blue-800/50">
                      {b.user?.name?.[0]?.toUpperCase() || 'M'}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                         <div className="flex items-center gap-2">
                           <h3 className="font-extrabold text-gray-900 dark:text-white text-lg leading-none">{b.user?.name || 'Mijoz'}</h3>
                           <span className="text-xs font-bold text-gray-400">({b.user?.email || 'Mavjud emas'})</span>
                         </div>
                         <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            b.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800/50' :
                            b.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800/50' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800/50'
                          }`}>
                            {b.status === 'pending' ? 'Kutilmoqda' : b.status === 'confirmed' ? 'Tasdiqlangan' : b.status === 'cancelled' ? 'Bemkor qilingan' : b.status}
                         </span>
                      </div>
                      
                      <div className="bg-gray-50/80 dark:bg-slate-800/60 rounded-2xl p-4 border border-gray-100/50 dark:border-gray-700/50">
                         <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center"><FiHome className="mr-1.5" /> {h.name}</p>
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
                    <div className="text-left md:text-right mb-0 md:mb-4">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-0.5">Umumiy Summa</span>
                      <span className="text-xl font-black text-gray-900 dark:text-white block">
                        {new Intl.NumberFormat('uz-UZ').format(b.totalPrice || 0)} <span className="text-sm text-gray-400">UZS</span>
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto relative">
                      {b.status === 'pending' && (
                        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                          <button onClick={() => handleConfirmBooking(b._id)} disabled={actionLoading === b._id}
                            className="flex-1 px-4 py-2.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800/50 rounded-xl text-sm font-bold active:scale-95 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                            {actionLoading === b._id ? <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : <FiCheck />} Qabul qilish
                          </button>
                          <button onClick={() => handleCancelBooking(b._id)} disabled={actionLoading === b._id}
                            className="flex-1 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800/50 rounded-xl text-sm font-bold active:scale-95 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
                            Rad etish
                          </button>
                        </div>
                      )}
                      
                      <button onClick={() => navigate(`/chat/${b._id}`)} className="w-full px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-xl text-sm font-bold active:scale-95 transition-colors flex items-center justify-center gap-2 mt-1">
                        <FiMessageCircle /> Xabar yozish
                      </button>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-16 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800">
                <FiList className="mx-auto w-12 h-12 text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-gray-900 dark:text-white font-bold text-lg">{bookingFilter !== 'all' ? `Bu turdagi bronlar yo'q (${bookingFilter})` : 'Sizda hozircha bronlar mavjud emas.'}</p>
                <p className="text-gray-500 text-sm mt-1">Yangi mijozlar joy band qilganda shu yerda ko'rinadi.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;