import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  FiArrowLeft, FiEdit3, FiMapPin, FiNavigation,
  FiMap, FiDollarSign, FiUsers, FiImage,
  FiClock, FiFile, FiBell, FiCheck, FiCommand,
  FiLock, FiPlus, FiHome, FiStar, FiEdit2, FiEye, FiTrash2,
  FiRotateCw, FiAlertTriangle, FiX, FiMessageCircle, FiSend, FiUser
} from 'react-icons/fi';
import BackButton from '../components/BackButton';
import FullHotelForm from '../components/FullHotelForm';


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
  city: 'Navoiy', country: 'Uzbekistan', address: '',
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
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [inboxLoading, setInboxLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Poll conversations & selected chat
  useEffect(() => {
    let interval;

    const pollInboxData = async () => {
      try {
        const res = await api.get('/chat/owner/inbox');
        setConversations(res.data);

        if (activeConv) {
          // Find if there is updated version of activeConv to keep active state in sync
          const updatedConv = res.data.find(c => c.id === activeConv.id);
          if (updatedConv && updatedConv.unreadCount > 0) {
            // If there are new unread messages, fetching history will mark them as read
            const chatRes = await api.get(`/chat/history/${activeConv.hotel._id}/${activeConv.customer._id}`);
            setChatMessages(chatRes.data);
          } else {
            const chatRes = await api.get(`/chat/history/${activeConv.hotel._id}/${activeConv.customer._id}`);
            setChatMessages(chatRes.data);
          }
        }
      } catch (err) {
        console.error('Error polling inbox:', err);
      }
    };

    if (activeTab === 'messages') {
      pollInboxData();
      interval = setInterval(pollInboxData, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, activeConv]);

  // Scroll active chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const selectConversation = async (conv) => {
    setActiveConv(conv);
    setInboxLoading(true);
    try {
      const chatRes = await api.get(`/chat/history/${conv.hotel._id}/${conv.customer._id}`);
      setChatMessages(chatRes.data);
      
      // Update unread count immediately in local state
      setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unreadCount: 0 } : c));
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setInboxLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeConv) return;

    const messageText = chatInput.trim();
    setChatInput('');

    // Optimistic UI update
    const tempId = Date.now().toString();
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: 'owner' },
      receiver: { _id: activeConv.customer._id },
      hotel: activeConv.hotel._id,
      content: messageText,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, optimisticMessage]);

    try {
      const res = await api.post('/chat/send', {
        hotelId: activeConv.hotel._id,
        receiverId: activeConv.customer._id,
        content: messageText
      });
      
      // Update with exact data from backend
      setChatMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
      
      // Refresh inbox list to update last message preview immediately
      const resInbox = await api.get('/chat/owner/inbox');
      setConversations(resInbox.data);
    } catch (err) {
      console.error('Failed to send reply:', err);
      setChatMessages(prev => prev.filter(m => m._id !== tempId));
    }
  };

  const totalUnreadMessages = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);

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
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen lg:pl-32">
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
                        <FiMapPin className="text-rose-500 w-3.5 h-3.5" /> {hotel.city}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        • {hotel.rooms?.length || 0} xona turi • {new Intl.NumberFormat('uz-UZ').format(Number(hotel.pricePerNight || 0) || 0)} UZS/kecha
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-start">
                    <span className={`px-3 py-1.5 text-[10px] font-black rounded-full uppercase tracking-wide border ${
                      hotel.isActive !== false
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                        : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                    }`}>
                      {hotel.isActive !== false ? 'Faol' : 'Nofaol'}
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
                    onClick={() => handleDeleteHotel(hotel._id)}
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
                  className="mt-4 px-6 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition-all hover:scale-102"
                >
                  Birinchi mehmonxonani qo'shish
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── TAB 2: INBOX (CHAT CLIENT) ── */}
      {activeTab === 'messages' && (
        <div className="flex flex-col md:flex-row h-[600px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800/80 shadow-xl overflow-hidden">
          
          {/* Left Panel: Conversations List */}
          <div className="w-full md:w-[350px] shrink-0 border-r border-slate-200/60 dark:border-slate-800/80 flex flex-col h-1/2 md:h-full bg-slate-50/30 dark:bg-slate-900/20">
            <div className="p-5 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FiMessageCircle className="text-indigo-600 dark:text-indigo-400" />
                Muloqotlar
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {conversations.map((conv) => {
                const isActive = activeConv && activeConv.id === conv.id;
                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv)}
                    className={`w-full text-left p-4 rounded-2xl transition-all border flex items-start gap-3 group relative ${
                      isActive
                        ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-600/10'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700/60'
                    }`}
                  >
                    {/* User Avatar Placeholder */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 uppercase border ${
                      isActive 
                        ? 'bg-white/20 border-white/10 text-white' 
                        : 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-100/30 dark:border-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    }`}>
                      {conv.customer.name ? conv.customer.name.substring(0, 2) : 'MI'}
                    </div>

                    {/* Meta info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center gap-1 mb-0.5">
                        <h4 className="font-bold text-xs truncate">
                          {conv.customer.name}
                        </h4>
                        <span className={`text-[9px] font-medium shrink-0 opacity-70`}>
                          {new Date(conv.lastMessage.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className={`text-[10px] font-bold mb-1 truncate ${isActive ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'}`}>
                        {conv.hotel.name}
                      </p>
                      <p className={`text-xs truncate ${isActive ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
                        {conv.lastMessage.content}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {conv.unreadCount > 0 && !isActive && (
                      <span className="absolute right-4 bottom-4 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {conversations.length === 0 && (
                <div className="text-center p-8 text-slate-400 dark:text-slate-600">
                  <FiMessageCircle className="w-10 h-10 mx-auto opacity-40 mb-3 stroke-[1.5]" />
                  <p className="text-xs font-semibold">Kelgan xabarlar mavjud emas</p>
                  <p className="text-[10px] opacity-75 mt-1 max-w-[200px] mx-auto leading-relaxed">
                    Mijozlar sizning mehmonxonalaringiz sahifasida chat widget orqali yozishganda bu yerda paydo bo'ladi.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: Active Chat Room */}
          <div className="flex-1 flex flex-col h-1/2 md:h-full bg-slate-50/40 dark:bg-slate-950/20">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between shrink-0 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                        {activeConv.customer.name ? activeConv.customer.name.substring(0, 2) : 'MI'}
                      </div>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-slate-900 rounded-full"></span>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-white leading-tight">
                        {activeConv.customer.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">
                        {activeConv.hotel.name}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages Thread */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {inboxLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent" />
                    </div>
                  ) : (
                    chatMessages.map((msg) => {
                      // Check if owner sent the message
                      const isOwn = msg.sender._id === 'owner' || msg.sender === 'owner' || (msg.sender && (msg.sender._id || msg.sender) === activeConv.hotel.owner?._id || (msg.sender && (msg.sender._id || msg.sender) === activeConv.hotel.owner));
                      
                      return (
                        <div
                          key={msg._id}
                          className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm shadow-sm relative group ${
                              isOwn
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800/80 rounded-tl-none'
                            }`}
                          >
                            <p className="break-words leading-relaxed font-medium">{msg.content}</p>
                            
                            {/* Meta row: Time + read checks */}
                            <div
                              className={`flex items-center justify-end gap-1 mt-1 text-[9px] select-none opacity-70 ${
                                isOwn ? 'text-indigo-200' : 'text-slate-400'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {isOwn && (
                                <span className="inline-flex">
                                  {msg.isRead ? (
                                    <span className="flex text-emerald-300 font-bold" title="Mijoz o'qidi">
                                      <FiCheck className="w-3 h-3" />
                                      <FiCheck className="w-3 h-3 -ml-1.5" />
                                    </span>
                                  ) : (
                                    <span className="text-indigo-300" title="Yuborildi">
                                      <FiCheck className="w-3 h-3" />
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Reply Form */}
                <form
                  onSubmit={handleSendReply}
                  className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center gap-3 shrink-0"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Mijozga javob yozing..."
                    className="flex-1 px-4 py-3 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border-0 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="w-12 h-12 rounded-xl text-white flex items-center justify-center transition-all disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 shadow-md shadow-indigo-500/10"
                    style={{ background: 'var(--gradient-main, linear-gradient(135deg, #4f46e5, #6366f1))' }}
                  >
                    <FiSend className="text-base" />
                  </button>
                </form>
              </>
            ) : (
              // Empty State for Room
              <div className="flex flex-col items-center justify-center h-full text-center p-12 text-slate-400 dark:text-slate-600">
                <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-md flex items-center justify-center text-slate-300 dark:text-slate-700 mb-4 animate-pulse">
                  <FiMessageCircle className="text-3xl stroke-[1.5]" />
                </div>
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  Suhbatni tanlang
                </h4>
                <p className="text-xs opacity-75 mt-1 max-w-[280px] leading-relaxed">
                  Chap tarafdagi ro'yxatdan mijozni tanlang, u bilan kelgan xabarlarni ko'rish va bevosita javob qaytarish imkoni ochiladi.
                </p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
