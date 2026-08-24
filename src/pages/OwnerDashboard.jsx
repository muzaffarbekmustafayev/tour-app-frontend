import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FiPlus, FiHome, FiStar, FiEdit2, FiEye, FiTrash2,
  FiMessageCircle, FiChevronRight, FiMapPin,
  FiCheckCircle, FiClock, FiInfo,
} from 'react-icons/fi';
import BackButton from '../components/BackButton';
import FullHotelForm from '../components/FullHotelForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { ChatContext } from '../context/ChatContext';


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
  'Chashma majmuasi', 'Nur qal\'asi xarobalari', 'Sarmishsoy petrogliflari', 'Nurota tog\'lari', 'Aydarko\'l',
  'Polkan baxshi xotira majmuasi', 'Xatirchi tarixiy markazi', 'Zarafshon daryosi sohili',
  'Toshmasjid majmuasi (Vangozi)', 'Xoja Boyazid Bistomiy maqbarasi', 'Qadimiy So\'g\'d manzilgohi xarobalari'
];


const securityList = [
  'CCTV (Kameratizm)', '24/7 Qo\'riqlash', 'Seyf', 'Yong\'in o\'chirish tizimi',
  'Signalizatsiya', 'Kodli qulf', 'Elektron kalit', 'Video domofon'
];


const emptyHotel = {
  name: '', description: '', shortDescription: '',
  district: '', city: 'Navoiy', country: 'Uzbekistan', address: '',
  category: 'hotel', basePricePerNight: 500000, roomsAvailable: 10, totalRooms: '', maxGuests: '',
  checkInTime: '14:00', checkOutTime: '12:00',
  amenities: [], images: [''],
  videoTour: { url: '', captioned: false, durationSec: '' },
  panoramas: [],
  atmosphere: { mood: '', soundscape: '', bestTimeOfDay: '', localTip: '' },
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

  const [activeTab, setActiveTab] = useState('hotels');
  const [confirmDelete, setConfirmDelete] = useState(null); // { id }

  // Chat — markaziy ChatContext (socket.io bilan ishlaydigan yagona tizim)
  const { conversations, openConversation, unreadTotal, fetchConversations } = useContext(ChatContext);

  useEffect(() => {
    if (activeTab === 'messages') fetchConversations();
  }, [activeTab, fetchConversations]);

  const totalUnreadMessages = unreadTotal;

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
    if (e && e.preventDefault) e.preventDefault();
    setFormLoading(true);
    setFormError('');

    // Validation
    if (!form.name || !form.name.trim()) {
      setFormError('Mehmonxona nomi kiritilishi shart!');
      setFormLoading(false);
      return;
    }
    if (!form.district) {
      setFormError('Tuman tanlanishi shart! "Umumiy Ma\'lumot" bo\'limidan viloyat tumanini tanlang.');
      setFormLoading(false);
      return;
    }

    const basePrice = Number(form.basePricePerNight || form.pricePerNight) || 500000;
    const images = (form.images || []).filter(img => typeof img === 'string' && img.trim() !== '');

    const payload = {
      ...form,
      pricePerNight: basePrice,
      basePricePerNight: basePrice,
      roomsAvailable: Number(form.roomsAvailable || form.totalRooms) || 10,
      totalRooms: Number(form.totalRooms || form.roomsAvailable) || 10,
      stars: Number(form.stars) || 4,
      maxGuests: form.maxGuests ? Number(form.maxGuests) : undefined,
      images: images,
      location: (form.location?.lat && form.location?.lng) ? {
        lat: Number(form.location.lat),
        lng: Number(form.location.lng)
      } : undefined,
      rooms: (form.rooms || []).map(r => ({
        ...r,
        name: r.name || `${r.capacity || 2} kishilik ${r.category || 'Standard'}`,
        capacity: Number(r.capacity) || 2,
        pricePerNight: Number(r.pricePerNight || basePrice) || basePrice,
        totalRooms: Number(r.totalRooms) || 1,
        roomsAvailable: Number(r.roomsAvailable !== undefined ? r.roomsAvailable : r.totalRooms) || 1
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
      setFormError(err.response?.data?.message || err.message || "Mehmonxonani saqlab bo'lmadi. Barcha maydonlarni tekshiring.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    setActionLoading(hotelId);
    try {
      await api.delete(`/hotels/${hotelId}`);
      setHotels(prev => prev.filter(h => h._id !== hotelId));
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); setConfirmDelete(null); }
  };

  // ---------- FORM VIEW ----------
  if (showForm) {
    return (
      <div className="pb-28 md:pb-8 pt-6 px-4 max-w-5xl mx-auto min-h-screen">
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
            onClick={(e) => handleSubmit(e)}
            disabled={formLoading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
          >
            {formLoading ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
          </button>
        </div>

        {formError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-2xl p-4 mb-6 text-sm font-medium whitespace-pre-wrap">
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FullHotelForm form={form} setForm={setForm} loading={formLoading} isEdit={!!editingId} />
        </form>
      </div>
    );
  }

  // ---------- MAIN VIEW ----------
  if (loading) return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-8">Hamkor Paneli</h1>
      <div className="space-y-4">
        {[1, 2].map(i => <div key={i} className="animate-pulse bg-white dark:bg-slate-900 h-40 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm" />)}
      </div>
    </div>
  );

  return (
    <div className="pb-28 md:pb-8 pt-6 px-4 max-w-7xl mx-auto min-h-screen">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hamkor Paneli
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">
              Mehmonxonalaringizni boshqarish va mijozlar bilan muloqot
            </p>
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

      {/* Tabs Navigation */}
      <div className="flex gap-6 border-b border-slate-200 dark:border-slate-800 mb-8 pb-px">
        <button
          onClick={() => setActiveTab('hotels')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'hotels'
              ? 'border-indigo-600 text-indigo-600 dark:text-white dark:border-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FiHome className="w-4 h-4" />
          Mehmonxonalar
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`pb-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 relative ${
            activeTab === 'messages'
              ? 'border-indigo-600 text-indigo-600 dark:text-white dark:border-white'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FiMessageCircle className="w-4 h-4" />
          Kelgan Xabarlar
          {totalUnreadMessages > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {totalUnreadMessages}
            </span>
          )}
        </button>
      </div>

      {/* ── TAB 1: HOTELS LIST ── */}
      {activeTab === 'hotels' && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
            {(() => {
              const rated = hotels.filter(h => Number(h.rating) > 0);
              const avgRating = rated.length
                ? (rated.reduce((s, h) => s + Number(h.rating), 0) / rated.length).toFixed(1)
                : '—';
              return [
                { label: 'Mening mehmonxonalarim', value: hotels.length, color: 'bg-indigo-600', icon: <FiHome className="w-5 h-5" /> },
                { label: "O'rtacha reyting", value: avgRating, color: 'bg-amber-500', icon: <FiStar className="w-5 h-5" /> },
              ];
            })().map((stat, i) => (
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

          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Mening Mehmonxonalarim</h2>

          {/* Admin tasdig'i haqida ogohlantirish */}
          <div className="flex items-start gap-3 p-4 mb-6 rounded-2xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/40">
            <FiInfo className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 leading-relaxed">
              Yangi qo'shilgan yoki tahrirlangan mehmonxona <span className="font-black">admin tasdig'idan</span> o'tgach saytda ko'rinadi.
              Holatni har bir kartochkada kuzatishingiz mumkin.
            </p>
          </div>

          {/* Hotels List Cards */}
          <div className="space-y-4">
            {hotels.map(hotel => (
              <div key={hotel._id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-indigo-600 transition-colors truncate">
                      {hotel.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
                        <FiMapPin className="text-rose-500 w-3.5 h-3.5" /> {hotel.district || hotel.city}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        • {hotel.rooms?.length || 0} xona turi
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
                    <span className={`px-3 py-1.5 text-[10px] font-black rounded-full uppercase tracking-wide border flex items-center gap-1.5 ${
                      hotel.approved
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800'
                    }`}>
                      {hotel.approved
                        ? <><FiCheckCircle className="w-3 h-3" /> Tasdiqlangan</>
                        : <><FiClock className="w-3 h-3" /> Admin tasdig'ini kutmoqda</>}
                    </span>
                  </div>
                </div>

                {/* Modern Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => navigate(`/hotel/${hotel._id}`)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white bg-slate-50 dark:bg-slate-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all flex items-center gap-2"
                  >
                    <FiEye className="w-4 h-4" />
                    Ko'rish
                  </button>
                  <button
                    onClick={() => openEditForm(hotel)}
                    className="px-4 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-white bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-600 dark:hover:bg-indigo-600 rounded-xl transition-all flex items-center gap-2"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Tahrirlash
                  </button>
                  <button
                    onClick={() => setConfirmDelete(hotel._id)}
                    disabled={actionLoading === hotel._id}
                    className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-600 dark:hover:bg-rose-600 rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    {actionLoading === hotel._id ? "O'chirilmoqda..." : "O'chirish"}
                  </button>
                </div>
              </div>
            ))}
            {hotels.length === 0 && (
              <div className="text-center p-12 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <FiHome className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  Hozircha mehmonxona qo'shilmagan.
                </p>
                <button
                  onClick={openAddForm}
                  className="mt-4 px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:brightness-110 active:scale-95"
                >
                  Birinchi mehmonxonani qo'shish
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB 2: KELGAN XABARLAR (ChatContext — socket bilan ishlaydi) ── */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <FiMessageCircle className="text-indigo-600 dark:text-indigo-400" /> Muloqotlar
            </h3>
            {unreadTotal > 0 && (
              <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full">
                {unreadTotal} yangi
              </span>
            )}
          </div>

          {conversations.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {conversations.map((conv) => {
                const other = conv.participants?.find(p => p.role === 'CUSTOMER') || conv.participants?.[0];
                const unread = typeof conv.unreadCount === 'number' ? conv.unreadCount : 0;
                return (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv, false)}
                    className="w-full text-left p-4 sm:p-5 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 uppercase bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                      {other?.name ? other.name.substring(0, 2) : 'MI'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{other?.name || 'Mijoz'}</h4>
                        {conv.lastMessageAt && (
                          <span className="text-[10px] font-medium text-slate-400 shrink-0">
                            {new Date(conv.lastMessageAt).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                      {conv.hotel?.name && (
                        <p className="text-[11px] font-bold text-indigo-500 dark:text-indigo-400 truncate mb-0.5">{conv.hotel.name}</p>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{conv.lastMessage || 'Suhbat boshlandi'}</p>
                    </div>
                    {unread > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">{unread}</span>
                    )}
                    <FiChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-indigo-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-12 text-slate-400 dark:text-slate-600">
              <FiMessageCircle className="w-12 h-12 mx-auto opacity-40 mb-3 stroke-[1.5]" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Kelgan xabarlar mavjud emas</p>
              <p className="text-xs opacity-75 mt-1 max-w-xs mx-auto leading-relaxed">
                Mijozlar mehmonxona sahifangizdagi chat tugmasi orqali yozishganda bu yerda paydo bo'ladi.
              </p>
            </div>
          )}
        </div>
      )}

      {/* O'chirishni tasdiqlash */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Mehmonxonani o'chirish"
        message="Bu amalni ortga qaytarib bo'lmaydi. Mehmonxona butunlay o'chiriladi."
        loading={actionLoading === confirmDelete}
        onConfirm={() => handleDeleteHotel(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
};

export default OwnerDashboard;
