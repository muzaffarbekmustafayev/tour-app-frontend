import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  FiUsers, FiHome, FiAward, FiTrendingUp, FiPlus, FiEdit2, 
  FiTrash2, FiArrowLeft, FiX, FiAlertTriangle, FiStar, FiPhone,
  FiCheck, FiMapPin, FiCompass, FiShield, FiSearch, FiFilter,
  FiLayers, FiEye, FiActivity, FiClock, FiVideo, FiCheckCircle
} from 'react-icons/fi';
import { 
  LuLandmark, LuBuilding2, LuHospital, LuStore, LuTrees,
  LuPlane, LuHotel, LuMountain, LuSparkles
} from 'react-icons/lu';
import { 
  FaMosque, FaTheaterMasks, FaTree, FaWater, 
  FaHospital, FaShieldAlt, FaLandmark, FaPlane,
  FaShoppingBasket, FaShoppingCart, FaShoppingBag, 
  FaBuilding, FaUmbrellaBeach, FaHome, FaGem, FaMountain
} from 'react-icons/fa';
import BackButton from '../components/BackButton';
import FullHotelForm, { emptyHotelTemplate, HOTEL_DISTRICTS } from '../components/FullHotelForm';
import AttractionForm, { emptyAttractionTemplate, DISTRICTS, ATTRACTION_CATEGORIES } from '../components/AttractionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  fetchAttractions, createAttraction, updateAttraction, deleteAttraction as apiDeleteAttraction,
} from '../services/attractions';
import { 
  ATTRACTION_TEMPLATES, 
  CIVIC_SERVICE_TEMPLATES, 
  HOTEL_TEMPLATES 
} from '../utils/datasetTemplates';
import { imgSrc, FALLBACK_ATTRACTION, FALLBACK_HOTEL } from '../utils/media';
import SafeImage from '../components/SafeImage';

// React-icons xaritasi
export const CATEGORY_ICON_MAP = {
  tarixiy: LuLandmark,
  ziyoratgoh: FaMosque,
  madaniy: FaTheaterMasks,
  tabiat: FaMountain,
  istirohat_bogi: FaWater,
  kasalxona: LuHospital,
  iib: FiShield,
  hokimiyat: FaLandmark,
  transport: LuPlane,
  bozor: FaShoppingBasket,
  supermarket: FaShoppingCart,
  mall: FaShoppingBag,
  boshqa: FiMapPin,
  hotel: FaBuilding,
  resort: FaUmbrellaBeach,
  guesthouse: FaHome,
  boutique: FaGem,
};

// Tartiblangan va toifalangan obyektlar katalogi (Faqat React Icons bilan)
export const OBJECT_TYPE_GROUPS = [
  {
    groupTitle: "Tarixiy va Madaniy Meros",
    groupIcon: LuLandmark,
    groupColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/30",
    groupDesc: "Qadimiy qal'alar, ziyoratgohlar, muzeylar va teatrlar",
    items: [
      { key: 'tarixiy', label: "Tarixiy Obida / Qal'a", icon: LuLandmark, formType: 'attraction', desc: "Qal'a, minora, arxeologik yodgorlik", color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
      { key: 'ziyoratgoh', label: 'Muqaddas Ziyoratgoh', icon: FaMosque, formType: 'attraction', desc: 'Chashma, maqbara, masjid, qadamjo', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
      { key: 'madaniy', label: 'Madaniyat / Muzey / Teatr', icon: FaTheaterMasks, formType: 'attraction', desc: "O'lkashunoslik muzeyi, teatr, san'at saroyi", color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/40' },
    ]
  },
  {
    groupTitle: "Tabiat va Sayrgohlar",
    groupIcon: FaTree,
    groupColor: "text-green-600 bg-green-50 dark:bg-green-950/30",
    groupDesc: "Tog'lar, sharsharalar, daralar va shahar bog'lari",
    items: [
      { key: 'tabiat', label: "Tabiat / Tog' / Sharshara", icon: FaMountain, formType: 'attraction', desc: "Petrogliflar darasi, tog' qishlog'i, sharshara", color: 'text-green-600 bg-green-50 dark:bg-green-950/40' },
      { key: 'istirohat_bogi', label: "Istirohat Bog'i / Ko'l", icon: FaWater, formType: 'attraction', desc: "Markaziy milliy bog', sun'iy ko'l, sayrgoh", color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40' },
    ]
  },
  {
    groupTitle: "Joylashtirish Maskanlari (Mehmonxonalar)",
    groupIcon: LuBuilding2,
    groupColor: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30",
    groupDesc: "Mehmonxonalar, resortlar, eko mehmon uylari va o'tovlar",
    items: [
      { key: 'hotel', label: 'Mehmonxona (Hotel)', icon: FaBuilding, formType: 'hotel', desc: "Shahar mehmonxonasi, biznes hotel", color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
      { key: 'resort', label: 'Dam Olish Maskani (Resort)', icon: FaUmbrellaBeach, formType: 'hotel', desc: "Ko'l bo'yi oromgohi, tog' resorti", color: 'text-teal-600 bg-teal-50 dark:bg-teal-950/40' },
      { key: 'guesthouse', label: "Mehmon Uyi / O'tov (Yurt)", icon: FaHome, formType: 'hotel', desc: "Tog' eko-uyi, milliy o'tov kemping", color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
      { key: 'boutique', label: 'Boutique Hotel', icon: FaGem, formType: 'hotel', desc: "Maxsus dizayndagi shinam maskan", color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40' },
    ]
  },
  {
    groupTitle: "Infratuzilma va Shoshilinch Xizmatlar",
    groupIcon: LuHospital,
    groupColor: "text-red-600 bg-red-50 dark:bg-red-950/30",
    groupDesc: "24/7 tez tibbiy yordam, xavfsiz turizm, hokimiyat va vokzallar",
    items: [
      { key: 'kasalxona', label: 'Shoshilinch Kasalxona', icon: LuHospital, formType: 'attraction', desc: "24/7 tez tibbiy yordam markazi, statsionar", color: 'text-red-600 bg-red-50 dark:bg-red-950/40' },
      { key: 'iib', label: 'IIB / Xavfsiz Turizm', icon: FiShield, formType: 'attraction', desc: "Sayyohlar xavfsizligi posti, politsiya", color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
      { key: 'hokimiyat', label: 'Hokimiyat / Boshqaruv', icon: FaLandmark, formType: 'attraction', desc: "Tuman va shahar hokimiyati, davlat xizmatlari", color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
      { key: 'transport', label: 'Vokzal / Aeroport', icon: LuPlane, formType: 'attraction', desc: "Temir yo'l vokzali, xalqaro aeroport", color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40' },
    ]
  },
  {
    groupTitle: "Savdo, Bozorlar va Supermarketlar",
    groupIcon: LuStore,
    groupColor: "text-purple-600 bg-purple-50 dark:bg-purple-950/30",
    groupDesc: "Dehqon bozorlari, supermarketlar va savdo majmualari",
    items: [
      { key: 'bozor', label: 'Markaziy Dehqon Bozori', icon: FaShoppingBasket, formType: 'attraction', desc: "Meva-sabzavot, milliy noz-ne'matlar bozori", color: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40' },
      { key: 'supermarket', label: 'Supermarket / Korzinka', icon: FaShoppingCart, formType: 'attraction', desc: "Korzinka, oziq-ovqat va 24/7 bankomatlar", color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40' },
      { key: 'mall', label: 'Savdo Majmuasi (Mega Mall)', icon: FaShoppingBag, formType: 'attraction', desc: "Ko'p qavatli savdo markazi, butiklar, fud-kort", color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
    ]
  }
];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [confirmState, setConfirmState] = useState(null);

  // Users state
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [addUser, setAddUser] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  // Hotels state
  const [addHotel, setAddHotel] = useState(false);
  const [addHotelForm, setAddHotelForm] = useState(emptyHotelTemplate);
  const [addHotelLoading, setAddHotelLoading] = useState(false);
  const [addHotelError, setAddHotelError] = useState('');
  const [editHotel, setEditHotel] = useState(null);
  const [editHotelForm, setEditHotelForm] = useState(emptyHotelTemplate);
  const [editHotelLoading, setEditHotelLoading] = useState(false);
  const [hotelDistrictFilter, setHotelDistrictFilter] = useState('all');
  const [hotelCategoryFilter, setHotelCategoryFilter] = useState('all');
  const [hotelSearch, setHotelSearch] = useState('');

  // Attractions state
  const [addAttraction, setAddAttraction] = useState(false);
  const [attractionForm, setAttractionForm] = useState(emptyAttractionTemplate);
  const [editAttraction, setEditAttraction] = useState(null);
  const [attractionLoading, setAttractionLoading] = useState(false);
  const [attractionError, setAttractionError] = useState('');
  const [attractionDistrictFilter, setAttractionDistrictFilter] = useState('all');
  const [attractionCategoryFilter, setAttractionCategoryFilter] = useState('all');
  const [attractionSearch, setAttractionSearch] = useState('');

  // Universal Create-Object Studio state
  const [selectedCategoryKey, setSelectedCategoryKey] = useState('tarixiy');
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'overview';
  const queryCategory = searchParams.get('category');

  // URL dagi category o'zgarsa avtomatik filtrni yangilash
  useEffect(() => {
    if (queryCategory) {
      setAttractionCategoryFilter(queryCategory);
    } else if (activeTab === 'attractions') {
      setAttractionCategoryFilter('all');
    }
  }, [activeTab, queryCategory]);

  // Obyekt yaratish turini aniqlash (formType: 'attraction' yoki 'hotel')
  const currentCategoryItem = OBJECT_TYPE_GROUPS.flatMap(g => g.items).find(i => i.key === selectedCategoryKey) || OBJECT_TYPE_GROUPS[0].items[0];
  const isHotelType = currentCategoryItem.formType === 'hotel';
  const CurrentIcon = currentCategoryItem.icon;

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, hotelsRes, attrRes] = await Promise.all([
          api.get('/admin/statistics'),
          api.get('/admin/users'),
          api.get('/admin/hotels'),
          fetchAttractions({ limit: 300, includeUtility: true }),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setHotels(hotelsRes.data);
        setAttractions(Array.isArray(attrRes) ? attrRes : (attrRes.data || []));
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const goTab = (key) => navigate(key === 'overview' ? '/admin' : `/admin?tab=${key}`);

  // Obyekt turini tanlaganda formani moslash
  const handleSelectCategory = (item) => {
    setSelectedCategoryKey(item.key);
    setSelectedTemplateIndex('');
    if (item.formType === 'hotel') {
      setAddHotelForm({
        ...emptyHotelTemplate,
        category: item.key === 'boutique' ? 'boutique' : item.key === 'resort' ? 'resort' : item.key === 'guesthouse' ? 'guesthouse' : 'hotel',
      });
    } else {
      setAttractionForm({
        ...emptyAttractionTemplate,
        category: item.key,
      });
    }
  };

  // ── ATTRACTION HANDLERS ──
  const handleAddAttraction = async () => {
    setAttractionLoading(true); setAttractionError('');
    try {
      const payload = {
        ...attractionForm,
        category: selectedCategoryKey,
        images: (attractionForm.images || []).filter(img => typeof img === 'string' && img.trim() !== ''),
        location: (attractionForm.location?.lat && attractionForm.location?.lng) ? {
          lat: Number(attractionForm.location.lat),
          lng: Number(attractionForm.location.lng)
        } : undefined,
        thingsToSeeAround: (attractionForm.thingsToSeeAround || []).filter(t => t && t.title && t.title.trim()),
      };
      const created = await createAttraction(payload);
      setAttractions((prev) => [created, ...prev]);
      setAddAttraction(false);
      setAttractionForm(emptyAttractionTemplate);
      showToast('Yangi obyekt muvaffaqiyatli saqlandi', 'success');
      if (activeTab === 'create-object') {
        goTab('attractions');
      }
    } catch (err) {
      setAttractionError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally { setAttractionLoading(false); }
  };

  const handleSaveAttraction = async () => {
    setAttractionLoading(true); setAttractionError('');
    try {
      const payload = {
        ...attractionForm,
        images: (attractionForm.images || []).filter(img => typeof img === 'string' && img.trim() !== ''),
        location: (attractionForm.location?.lat && attractionForm.location?.lng) ? {
          lat: Number(attractionForm.location.lat),
          lng: Number(attractionForm.location.lng)
        } : undefined,
        thingsToSeeAround: (attractionForm.thingsToSeeAround || []).filter(t => t && t.title && t.title.trim()),
      };
      const updated = await updateAttraction(editAttraction._id, payload);
      setAttractions((prev) => prev.map((a) => a._id === editAttraction._id ? updated : a));
      setEditAttraction(null);
      showToast('Obyekt ma\'lumotlari yangilandi', 'success');
    } catch (err) {
      setAttractionError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally { setAttractionLoading(false); }
  };

  const handleDeleteAttraction = async (attrId) => {
    setActionLoading(attrId + '_del');
    try {
      await apiDeleteAttraction(attrId);
      setAttractions((prev) => prev.filter((a) => a._id !== attrId));
      showToast('Obyekt o\'chirildi', 'success');
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally { setActionLoading(null); }
  };

  const openEditAttraction = (a) => {
    setEditAttraction(a);
    setAttractionError('');
    setAttractionForm({
      ...emptyAttractionTemplate,
      ...a,
      category: a.category || 'tarixiy',
      phone: a.phone || '',
      workingHours: a.workingHours || '',
      emergencyContact: a.emergencyContact || '',
      location: a.location || { lat: a.geo?.coordinates?.[1] || '', lng: a.geo?.coordinates?.[0] || '' },
      video360: a.video360 || emptyAttractionTemplate.video360,
      atmosphere: a.atmosphere || emptyAttractionTemplate.atmosphere,
      peakInfo: a.peakInfo || emptyAttractionTemplate.peakInfo,
      accessibility: a.accessibility || {},
      thingsToSeeAround: a.thingsToSeeAround || [],
      images: a.images || [],
    });
  };

  // ── HOTEL HANDLERS ──
  const handleAddHotel = async () => {
    setAddHotelLoading(true); setAddHotelError('');
    try {
      const payload = {
        ...addHotelForm,
        category: selectedCategoryKey === 'boutique' ? 'boutique' : selectedCategoryKey === 'resort' ? 'resort' : selectedCategoryKey === 'guesthouse' ? 'guesthouse' : 'hotel',
        images: (addHotelForm.images || []).filter(img => typeof img === 'string' && img.trim() !== ''),
        location: (addHotelForm.location?.lat && addHotelForm.location?.lng) ? {
          lat: Number(addHotelForm.location.lat),
          lng: Number(addHotelForm.location.lng)
        } : undefined,
        rooms: (addHotelForm.rooms || []).map(r => ({
          ...r,
          totalRooms: Number(r.totalRooms) || 1,
          roomsAvailable: Number(r.roomsAvailable !== undefined ? r.roomsAvailable : r.totalRooms) || 1
        }))
      };
      const res = await api.post('/hotels', payload);
      setHotels(prev => [res.data, ...prev]);
      setAddHotel(false);
      setAddHotelForm(emptyHotelTemplate);
      showToast('Mehmonxona muvaffaqiyatli qo\'shildi', 'success');
      if (activeTab === 'create-object') {
        goTab('hotels');
      }
    } catch (err) {
      setAddHotelError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally { setAddHotelLoading(false); }
  };

  const handleSaveHotel = async () => {
    setEditHotelLoading(true);
    try {
      const payload = {
        ...editHotelForm,
        images: (editHotelForm.images || []).filter(img => typeof img === 'string' && img.trim() !== ''),
        location: (editHotelForm.location?.lat && editHotelForm.location?.lng) ? {
          lat: Number(editHotelForm.location.lat),
          lng: Number(editHotelForm.location.lng)
        } : undefined,
        rooms: (editHotelForm.rooms || []).map(r => ({
          ...r,
          totalRooms: Number(r.totalRooms) || 1,
          roomsAvailable: Number(r.roomsAvailable !== undefined ? r.roomsAvailable : r.totalRooms) || 1
        }))
      };
      const res = await api.put(`/hotels/${editHotel._id}`, payload);
      setHotels(prev => prev.map(h => h._id === editHotel._id ? res.data : h));
      setEditHotel(null);
      showToast('Mehmonxona yangilandi', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || err.message || 'Xatolik yuz berdi', 'error');
    } finally { setEditHotelLoading(false); }
  };

  const handleDeleteHotel = async (hotelId) => {
    setActionLoading(hotelId + '_del');
    try {
      await api.delete(`/hotels/${hotelId}`);
      setHotels(prev => prev.filter(h => h._id !== hotelId));
      showToast('Mehmonxona o\'chirildi', 'success');
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally { setActionLoading(null); }
  };

  const handleApproveHotel = async (hotelId) => {
    setActionLoading(hotelId);
    try {
      const res = await api.patch(`/hotels/${hotelId}/approve`);
      setHotels(prev => prev.map(h => h._id === hotelId ? { ...h, approved: true } : h));
      showToast('Mehmonxona tasdiqlandi', 'success');
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally { setActionLoading(null); }
  };

  const openEditHotel = (h) => {
    setEditHotel(h);
    setEditHotelForm({
      ...emptyHotelTemplate,
      ...h,
      location: h.location || { lat: h.geo?.coordinates?.[1] || '', lng: h.geo?.coordinates?.[0] || '' },
      rooms: h.rooms && h.rooms.length > 0 ? h.rooms : emptyHotelTemplate.rooms,
      images: h.images || [],
    });
  };

  // ── USER HANDLERS ──
  const handleAddUser = async () => {
    setAddLoading(true); setAddError('');
    try {
      const res = await api.post('/auth/register', addForm);
      setUsers(prev => [res.data.user || res.data, ...prev]);
      setAddUser(false);
      setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '' });
      showToast('Foydalanuvchi muvaffaqiyatli qo\'shildi', 'success');
    } catch (err) {
      setAddError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally { setAddLoading(false); }
  };

  const handleSaveUser = async () => {
    try {
      const res = await api.put(`/admin/users/${editUser._id}`, editForm);
      setUsers(prev => prev.map(u => u._id === editUser._id ? res.data : u));
      setEditUser(null);
      showToast('Foydalanuvchi yangilandi', 'success');
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      showToast('Foydalanuvchi o\'chirildi', 'success');
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally { setActionLoading(null); }
  };

  // Template Quick-Fill Handler
  const handleApplyTemplate = (template) => {
    if (isHotelType) {
      setAddHotelForm(prev => ({
        ...prev,
        ...template,
        location: template.location || prev.location,
        rooms: prev.rooms,
        images: prev.images.length > 0 ? prev.images : (template.images || []),
      }));
    } else {
      setAttractionForm(prev => ({
        ...prev,
        ...template,
        category: selectedCategoryKey,
        location: template.location || prev.location,
        video360: template.video360 || prev.video360,
        atmosphere: template.atmosphere || prev.atmosphere,
        accessibility: template.accessibility || prev.accessibility,
        thingsToSeeAround: template.thingsToSeeAround || prev.thingsToSeeAround,
      }));
    }
    showToast(`"${template.name}" andozasi yuklandi`, 'success');
  };

  // Tanlangan toifaga mos andozalar ro'yxati
  const categoryTemplates = isHotelType
    ? HOTEL_TEMPLATES.filter(t => selectedCategoryKey === 'hotel' ? t.category === 'hotel' : t.category === selectedCategoryKey)
    : [...ATTRACTION_TEMPLATES, ...CIVIC_SERVICE_TEMPLATES].filter(t => t.category === selectedCategoryKey);

  // Filters
  const filteredHotels = hotels.filter(h => {
    const matchDistrict = hotelDistrictFilter === 'all' || (h.district && h.district.toLowerCase() === hotelDistrictFilter.toLowerCase());
    const matchCategory = hotelCategoryFilter === 'all' || (h.category && h.category.toLowerCase() === hotelCategoryFilter.toLowerCase());
    const matchSearch = !hotelSearch.trim() || (
      (h.name && h.name.toLowerCase().includes(hotelSearch.toLowerCase())) ||
      (h.address && h.address.toLowerCase().includes(hotelSearch.toLowerCase()))
    );
    return matchDistrict && matchCategory && matchSearch;
  });

  const filteredAttractions = attractions.filter(a => {
    const matchDistrict = attractionDistrictFilter === 'all' || (a.district && a.district.toLowerCase() === attractionDistrictFilter.toLowerCase());
    const matchCategory = attractionCategoryFilter === 'all' 
      ? true 
      : attractionCategoryFilter === 'savdo' 
        ? ['bozor', 'supermarket', 'mall'].includes(a.category) 
        : (a.category && a.category.toLowerCase() === attractionCategoryFilter.toLowerCase());
    const matchSearch = !attractionSearch.trim() || (
      (a.name && a.name.toLowerCase().includes(attractionSearch.toLowerCase())) ||
      (a.address && a.address.toLowerCase().includes(attractionSearch.toLowerCase())) ||
      (a.descriptionShort && a.descriptionShort.toLowerCase().includes(attractionSearch.toLowerCase()))
    );
    return matchDistrict && matchCategory && matchSearch;
  });

  if (loading) return (
    <div className="pb-28 pt-6 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-900 dark:text-white">Admin Boshqaruv Markazi</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="shimmer h-[120px] rounded-3xl" />)}
      </div>
      <div className="mt-8 flex flex-col md:flex-row gap-6">
         <div className="flex-1 shimmer h-[320px] rounded-3xl" />
         <div className="flex-1 shimmer h-[320px] rounded-3xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-[1400px] mx-auto">
      {/* Toast Notification */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-[250] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-up ${
          message.type === 'success' ? 'bg-emerald-600 text-white shadow-emerald-600/30' : 'bg-rose-600 text-white shadow-rose-600/30'
        }`}>
          {message.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiAlertTriangle className="w-5 h-5" />}
          <span className="font-bold text-sm">{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-2 hover:opacity-75 transition-opacity active:scale-95">
             <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmState && (
        <ConfirmDialog
          title={confirmState.title}
          message={confirmState.message}
          onConfirm={() => { confirmState.onConfirm(); setConfirmState(null); }}
          onCancel={() => setConfirmState(null)}
        />
      )}

      <div className="px-4 pt-4 pb-28 md:px-6 md:pt-6 md:pb-12">
        <main className="min-w-0">

          {/* Sarlavha & Boshqaruv Tepasi */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                  <FiShield className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Admin Boshqaruv Paneli</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Navoiy Viloyati Turizm & Obyektlar Boshqaruvi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tizim Faol</span>
                </div>
                <BackButton />
              </div>
            </div>

            {/* Sahifa ko'rsatkichi (Navigatsiya faqat side bar orqali) */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-slate-400">
              <span className="text-slate-500 dark:text-slate-400">Boshqaruv</span>
              <span>/</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-black">
                {activeTab === 'overview' ? 'Boshqaruv Hubi & Tahlil' :
                 activeTab === 'create-object' ? 'Obyekt Yaratish Studiyasi' :
                 activeTab === 'attractions' ? 'Barcha Obyektlar va Xizmatlar' :
                 activeTab === 'hotels' ? 'Mehmonxonalar va Turar Joylar' :
                 activeTab === 'users' ? 'Foydalanuvchilar Boshqaruvi' : 'Boshqaruv'}
              </span>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              TAB 1: OVERVIEW & ACTION HUB
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Foydalanuvchilar', value: stats?.totalUsers || users.length, gradient: 'from-blue-600 to-indigo-600', glow: 'shadow-blue-500/25', icon: <FiUsers className="w-6 h-6 text-white" /> },
                  { label: 'Mehmonxonalar', value: stats?.totalHotels || hotels.length, gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/25', icon: <FiHome className="w-6 h-6 text-white" /> },
                  { label: 'Barcha Obyektlar & Joylar', value: stats?.totalAttractions || attractions.length, gradient: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/25', icon: <LuLandmark className="w-6 h-6 text-white" /> },
                  { label: 'Umumiy Tashriflar', value: stats?.totalVisitors || 0, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/25', icon: <FiActivity className="w-6 h-6 text-white" /> },
                ].map((stat, i) => (
                  <div key={i} className="relative overflow-hidden bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all duration-200">
                    <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 blur-2xl pointer-events-none`} />
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md ${stat.glow} shrink-0`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.value}</h3>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 🌟 "OBYEKT YARATISH VA BOSHQARUV HUBI" 🌟 */}
              <div className="bg-gradient-to-br from-indigo-900/10 via-slate-900/5 to-purple-900/10 dark:from-indigo-950/40 dark:via-slate-900/60 dark:to-purple-950/40 rounded-3xl p-6 sm:p-8 border border-indigo-200/60 dark:border-indigo-900/50 shadow-sm relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/40 inline-block mb-2">Boshqaruv Markazi</span>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Obyekt Yaratish va Boshqaruv Hubi</h2>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-1">`datas.md` dagi barcha obyektlarni kiritish, tahrirlash va yangi maskanlarni boshqarish</p>
                  </div>
                  <button 
                    onClick={() => goTab('create-object')}
                    className="px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 self-start md:self-auto"
                  >
                    <FiPlus className="w-5 h-5" /> Obyekt Yaratish Studiyasiga O'tish
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Yangi Tarixiy Joy */}
                  <div 
                    onClick={() => { setSelectedCategoryKey('tarixiy'); goTab('create-object'); }}
                    className="cursor-pointer bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200 active:scale-[0.98] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                        <LuLandmark className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Tarixiy Obida / Qal'a</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Chashma, Qal'alar, Ziyoratgohlar va Sarmishsoy petrogliflari</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                      <span>Yaratish</span>
                      <FiPlus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 2: Yangi Mehmonxona */}
                  <div 
                    onClick={() => { setSelectedCategoryKey('hotel'); goTab('create-object'); }}
                    className="cursor-pointer bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all duration-200 active:scale-[0.98] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                        <LuBuilding2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Mehmonxona / Turar Joy</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Resort, Eko-uylar, Yurt kempinglar va shahar hotellari</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <span>Yaratish</span>
                      <FiPlus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 3: Infratuzilma va Kasalxona */}
                  <div 
                    onClick={() => { setSelectedCategoryKey('kasalxona'); goTab('create-object'); }}
                    className="cursor-pointer bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-200 active:scale-[0.98] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                        <LuHospital className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Shoshilinch & IIB Xizmati</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">24/7 tez yordam, IIB xavfsiz turizm, Hokimiyat va Vokzallar</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Yaratish</span>
                      <FiPlus className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Card 4: Supermarket & Mall */}
                  <div 
                    onClick={() => { setSelectedCategoryKey('supermarket'); goTab('create-object'); }}
                    className="cursor-pointer bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-200 active:scale-[0.98] shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                        <LuStore className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1">Supermarket & Bozor</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Korzinka, Savdo Mallari, Markaziy dehqon bozorlari</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400">
                      <span>Yaratish</span>
                      <FiPlus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Platform Activity & Top Hotels */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Top Hotels */}
                {stats?.topHotels && stats.topHotels.length > 0 && (
                  <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                    <h2 className="text-lg font-black mb-5 text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <FiAward className="text-amber-500 w-4 h-4" />
                      </div>
                      Top Mehmonxonalar
                    </h2>
                    <div className="space-y-3">
                      {stats.topHotels.map((h, i) => (
                        <div key={h._id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50">
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center">
                              #{i + 1}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{h.name}</p>
                              <p className="text-[11px] text-slate-400 font-medium">{h.city || 'Navoiy'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
                            <FiStar className="text-amber-500 fill-current w-3 h-3" />
                            <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">{h.rating?.toFixed(1) || '—'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Platform Metrics */}
                <div className={`${stats?.topHotels?.length ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm`}>
                  <h2 className="text-lg font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <FiActivity className="text-indigo-500 w-4 h-4" />
                    </div>
                    Platforma Faolligi va Obyektlar Ko'rsatkichi
                  </h2>
                  <div className="space-y-6">
                    {[
                      { label: 'Foydalanuvchilar', value: stats?.totalUsers || users.length, color: 'bg-blue-600' },
                      { label: 'Mehmonxonalar', value: stats?.totalHotels || hotels.length, color: 'bg-rose-500' },
                      { label: 'Barcha Obyektlar & Xizmatlar', value: stats?.totalAttractions || attractions.length, color: 'bg-amber-500' },
                      { label: 'Umumiy tashriflar', value: stats?.totalVisitors || 0, color: 'bg-emerald-500' },
                    ].map((item, idx) => {
                      const maxVal = Math.max(stats?.totalVisitors || 1, stats?.totalAttractions || 1, stats?.totalHotels || 1, stats?.totalUsers || 1);
                      const widthPercent = (item.value / maxVal) * 100;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wider uppercase">{item.label}</span>
                            <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                          </div>
                          <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.max(3, widthPercent)}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 2: UNIVERSAL CREATE-OBJECT STUDIO (IXCHAM & TUSHUNARLI)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'create-object' && (
            <div className="space-y-4 animate-fade-in">
              {/* Studio Boshqaruv Qatori */}
              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                    <CurrentIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-black text-slate-900 dark:text-white">Obyekt Yaratish:</h2>
                      <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40">
                        {currentCategoryItem.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">Turini tanlang va ma'lumotlarni kiriting</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={isHotelType ? handleAddHotel : handleAddAttraction}
                  disabled={isHotelType ? (addHotelLoading || !addHotelForm.name || !addHotelForm.district) : (attractionLoading || !attractionForm.name)}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 self-end md:self-auto shrink-0"
                >
                  <FiCheck className="w-4 h-4" />
                  {(isHotelType ? addHotelLoading : attractionLoading) ? 'Saqlanmoqda...' : 'Bazaga Saqlash'}
                </button>
              </div>

              {/* 🌟 1. IXCHAM TOIFALAR SELEKTORI 🌟 */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FiLayers className="text-indigo-500" /> Obyekt Yo'nalishini Tanlang:
                  </label>
                </div>

                {/* 5 Asosiy Guruh Tugmalari */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                  {OBJECT_TYPE_GROUPS.map((grp, gIdx) => {
                    const GroupIcon = grp.groupIcon;
                    const isGrpActive = grp.items.some(it => it.key === selectedCategoryKey);
                    return (
                      <button
                        key={gIdx}
                        type="button"
                        onClick={() => handleSelectCategory(grp.items[0])}
                        className={`p-2.5 rounded-xl text-left transition-all active:scale-95 flex items-center gap-2.5 border ${
                          isGrpActive
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <GroupIcon className={`w-4 h-4 shrink-0 ${isGrpActive ? 'text-white' : 'text-indigo-600 dark:text-indigo-400'}`} />
                        <span className="text-xs font-bold truncate">{grp.groupTitle}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tanlangan Guruh Ichidagi Aniq Turlar (Pills) */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Aniq tur:</span>
                  {(OBJECT_TYPE_GROUPS.find(g => g.items.some(it => it.key === selectedCategoryKey))?.items || []).map(item => {
                    const isSelected = selectedCategoryKey === item.key;
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => handleSelectCategory(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <ItemIcon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 🌟 2. datas.md TAYYOR ANDOZA (AUTO-FILL) INLINE SELECTOR 🌟 */}
                {categoryTemplates.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2">
                    <label className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      ⚡ `{currentCategoryItem.label}` tayyor andozalari ({categoryTemplates.length} ta):
                    </label>
                    <select
                      value={selectedTemplateIndex}
                      onChange={(e) => {
                        const idx = e.target.value;
                        setSelectedTemplateIndex(idx);
                        if (idx !== '') {
                          handleApplyTemplate(categoryTemplates[idx]);
                        }
                      }}
                      className="flex-1 px-3 py-1.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    >
                      <option value="">— Andozadan avto-to'ldirish uchun tanlang —</option>
                      {categoryTemplates.map((tmpl, idx) => (
                        <option key={idx} value={idx}>
                          [{tmpl.district}] {tmpl.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* 🌟 3. MOSLASHUVCHAN IXCHAM FORMA 🌟 */}
              <div>
                {!isHotelType ? (
                  <div className="space-y-4">
                    {attractionError && (
                      <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl px-4 py-2.5 text-xs font-bold border border-rose-100 dark:border-rose-800/50 flex items-center gap-2">
                        <FiAlertTriangle className="w-4 h-4 shrink-0" /> {attractionError}
                      </div>
                    )}
                    <AttractionForm form={attractionForm} setForm={setAttractionForm} />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {addHotelError && (
                      <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl px-4 py-2.5 text-xs font-bold border border-rose-100 dark:border-rose-800/50 flex items-center gap-2">
                        <FiAlertTriangle className="w-4 h-4 shrink-0" /> {addHotelError}
                      </div>
                    )}
                    <FullHotelForm form={addHotelForm} setForm={setAddHotelForm} users={users} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 3: BARCHA OBYEKTLAR VA XIZMATLAR (Tarixiy, Infratuzilma, Bozorlar)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'attractions' && !addAttraction && !editAttraction && (
            <div className="space-y-6 animate-fade-in">
              {/* Filter and Search Bar */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-64">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Obyekt yoki xizmat qidirish..."
                      value={attractionSearch}
                      onChange={(e) => setAttractionSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* District Filter */}
                  <select
                    value={attractionDistrictFilter}
                    onChange={(e) => setAttractionDistrictFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="all">Barcha Tumanlar</option>
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={attractionCategoryFilter}
                    onChange={(e) => setAttractionCategoryFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="all">Barcha Toifalar</option>
                    {ATTRACTION_CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>

                <button
                  onClick={() => { setSelectedCategoryKey('tarixiy'); goTab('create-object'); }}
                  className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-amber-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <FiPlus className="w-4 h-4" /> Yangi Obyekt Yaratish
                </button>
              </div>

              {/* Attraction Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAttractions.map((a) => {
                  const CategoryIcon = CATEGORY_ICON_MAP[a.category] || LuLandmark;
                  const categoryLabel = (ATTRACTION_CATEGORIES.find(c => c.key === a.category)?.label || a.category || 'Obyekt').split('/')[0];
                  return (
                    <div key={a._id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all duration-200 hover:border-amber-300 dark:hover:border-amber-700">
                      <div>
                        {/* Image Header */}
                        <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden relative">
                          <SafeImage
                            src={a.images?.[0]}
                            fallback={FALLBACK_ATTRACTION}
                            alt={a.name}
                            className="w-full h-full"
                            imgClassName="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md text-white border border-white/10">
                              {a.district}
                            </span>
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-amber-500/90 text-white flex items-center gap-1.5">
                              <CategoryIcon className="w-3 h-3" /> {categoryLabel}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="mb-4">
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-1.5">{a.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">{a.descriptionShort || a.description}</p>
                          
                          {/* Badges */}
                          <div className="flex flex-wrap gap-1.5">
                            {a.video360?.url && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 flex items-center gap-1">
                                <FiVideo className="w-3 h-3" /> 360° Video
                              </span>
                            )}
                            {a.phone && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 flex items-center gap-1">
                                <FiPhone className="w-3 h-3" /> {a.phone}
                              </span>
                            )}
                            {a.workingHours && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1">
                                <FiClock className="w-3 h-3" /> {a.workingHours}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <button onClick={() => navigate(`/attraction/${a._id}`)} className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95 flex items-center justify-center gap-1">
                          <FiEye className="w-3.5 h-3.5" /> Ko'rish
                        </button>
                        <button onClick={() => openEditAttraction(a)} className="w-10 py-2.5 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl hover:bg-amber-100 transition-colors active:scale-95">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmState({ title: 'Obyektni o\'chirish', message: "Ushbu obyekt tizimdan butunlay o'chiriladi. Rozimisiz?", onConfirm: () => handleDeleteAttraction(a._id) })} className="w-10 py-2.5 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors active:scale-95">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredAttractions.length === 0 && (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <LuLandmark className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">Hech qanday diqqatga sazovor joy yoki xizmat topilmadi.</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Attraction Inline View */}
          {activeTab === 'attractions' && (addAttraction || editAttraction) && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <button onClick={() => { setAddAttraction(false); setEditAttraction(null); }} className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold text-xs mb-3 transition-colors active:scale-95">
                    <FiArrowLeft className="w-4 h-4" /> Ortga ro'yxatga qaytish
                  </button>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center"><LuLandmark className="w-5 h-5" /></span>
                    {editAttraction ? 'Obyektni tahrirlash' : 'Yangi Obyekt Qo\'shish'}
                  </h2>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button onClick={() => { setAddAttraction(false); setEditAttraction(null); }} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors active:scale-95">
                    Bekor qilish
                  </button>
                  <button onClick={editAttraction ? handleSaveAttraction : handleAddAttraction}
                    disabled={attractionLoading || !attractionForm.name}
                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md shadow-amber-500/25 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50">
                    <FiCheck className="w-4 h-4" /> {attractionLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>

              {attractionError && (
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl px-6 py-4 text-sm font-bold border border-rose-100 dark:border-rose-800/50 flex items-center gap-3">
                  <FiAlertTriangle className="w-5 h-5" /> {attractionError}
                </div>
              )}

              <AttractionForm form={attractionForm} setForm={setAttractionForm} />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 4: HOTELS MANAGEMENT (CRUD + FILTERS)
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'hotels' && !addHotel && !editHotel && (
            <div className="space-y-6 animate-fade-in">
              {/* Filter and Search Bar */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-64">
                    <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Mehmonxona qidirish..."
                      value={hotelSearch}
                      onChange={(e) => setHotelSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* District Filter */}
                  <select
                    value={hotelDistrictFilter}
                    onChange={(e) => setHotelDistrictFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="all">Barcha Tumanlar</option>
                    {HOTEL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>

                  {/* Category Filter */}
                  <select
                    value={hotelCategoryFilter}
                    onChange={(e) => setHotelCategoryFilter(e.target.value)}
                    className="px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  >
                    <option value="all">Barcha Toifalar</option>
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="guesthouse">Guesthouse</option>
                    <option value="boutique">Boutique</option>
                  </select>
                </div>

                <button
                  onClick={() => { setSelectedCategoryKey('hotel'); goTab('create-object'); }}
                  className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 shrink-0"
                >
                  <FiPlus className="w-4 h-4" /> Yangi Mehmonxona Qo'shish
                </button>
              </div>

              {/* Hotel Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredHotels.map(h => (
                  <div key={h._id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-800">
                    <div>
                      {/* Image Header */}
                      <div className="w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden relative">
                        <SafeImage
                          src={h.images?.[0] || h.image}
                          fallback={FALLBACK_HOTEL}
                          alt={h.name}
                          className="w-full h-full"
                          imgClassName="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md text-white border border-white/10">
                            {h.district || h.city || 'Navoiy'}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-indigo-600/90 text-white">
                            {h.category || 'Hotel'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">{h.name}</h3>
                          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-lg shrink-0">
                            <FiStar className="text-amber-500 fill-current w-3 h-3" />
                            <span className="font-bold text-amber-600 text-xs">{h.stars || h.rating || 4}</span>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">{h.descriptionShort || h.description || h.address}</p>
                        
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1.5">
                          {h.address && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate max-w-full flex items-center gap-1">
                              <FiMapPin className="w-3 h-3" /> {h.address}
                            </span>
                          )}
                          {h.rooms?.length > 0 && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
                              {h.rooms.length} toifa xona
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/hotel/${h._id}`)} className="flex-1 py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors active:scale-95 flex items-center justify-center gap-1">
                          <FiEye className="w-3.5 h-3.5" /> Ko'rish
                        </button>
                        <button onClick={() => openEditHotel(h)} className="w-10 py-2.5 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-colors active:scale-95">
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setConfirmState({ title: 'Mehmonxonani o\'chirish', message: "Ushbu mehmonxona tizimdan butunlay o'chiriladi. Rozimisiz?", onConfirm: () => handleDeleteHotel(h._id) })} className="w-10 py-2.5 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-100 transition-colors active:scale-95">
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      {!h.approved && (
                        <button onClick={() => handleApproveHotel(h._id)} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors active:scale-95 flex items-center justify-center gap-1.5">
                          <FiCheck className="w-3.5 h-3.5" /> Tasdiqlash
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredHotels.length === 0 && (
                <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <FiHome className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-500">Hech qanday mehmonxona topilmadi.</p>
                </div>
              )}
            </div>
          )}

          {/* Edit Hotel Inline View */}
          {activeTab === 'hotels' && (addHotel || editHotel) && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <button onClick={() => { setAddHotel(false); setEditHotel(null); }} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs mb-3 transition-colors active:scale-95">
                    <FiArrowLeft className="w-4 h-4"/> Ortga ro'yxatga qaytish
                  </button>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><FiHome className="w-5 h-5" /></span>
                    {editHotel ? 'Mehmonxonani tahrirlash' : 'Yangi Mehmonxona Qo\'shish'}
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button onClick={() => { setAddHotel(false); setEditHotel(null); }} className="px-5 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-200 transition-colors active:scale-95">
                    Bekor qilish
                  </button>
                  <button
                    onClick={editHotel ? handleSaveHotel : handleAddHotel}
                    disabled={editHotel ? editHotelLoading : (addHotelLoading || !addHotelForm.name || !addHotelForm.district)}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-500/25 transition-all duration-200 active:scale-95 flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiCheck className="w-4 h-4" />
                    {(editHotel ? editHotelLoading : addHotelLoading) ? 'Saqlanmoqda...' : 'Saqlash'}
                  </button>
                </div>
              </div>

              {(addHotelError || '') && (
                <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl px-6 py-4 text-sm font-bold border border-rose-100 dark:border-rose-800/50 flex items-center gap-3">
                  <FiAlertTriangle className="w-5 h-5"/> {addHotelError}
                </div>
              )}
              
              <FullHotelForm 
                form={editHotel ? editHotelForm : addHotelForm} 
                setForm={editHotel ? setEditHotelForm : setAddHotelForm} 
                users={users} 
                isEdit={!!editHotel}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════
              TAB 5: USERS MANAGEMENT
          ══════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && (
            <div className="animate-fade-in space-y-4">
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">Foydalanuvchilar Ro'yxati</h3>
                  <p className="text-xs text-slate-400">Jami: {users.length} ta foydalanuvchi</p>
                </div>
                <button 
                  onClick={() => { setAddUser(true); setAddError(''); setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '' }); }}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" /> Yangi Foydalanuvchi
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {users.map(u => (
                  <div key={u._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition-colors gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg border border-slate-200 dark:border-slate-700 shrink-0">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{u.name}</h4>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            u.role === 'HOTEL_OWNER' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>
                            {u.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate">{u.email}</p>
                        {u.phone && <p className="text-xs text-slate-500 font-mono mt-0.5">{u.phone}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button 
                        onClick={() => { setEditUser(u); setEditForm({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', blocked: u.blocked }); }}
                        className="p-2.5 text-slate-500 hover:text-indigo-600 bg-slate-50 dark:bg-slate-800 rounded-xl transition-colors active:scale-95"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setConfirmState({ title: 'Foydalanuvchini o\'chirish', message: "Foydalanuvchi butunlay o'chiriladi. Davom etasizmi?", onConfirm: () => handleDeleteUser(u._id) })}
                        className="p-2.5 text-rose-500 hover:text-rose-700 bg-rose-50 dark:bg-rose-950/30 rounded-xl transition-colors active:scale-95"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add User Modal */}
          {addUser && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yangi foydalanuvchi</h2>
                  <button onClick={() => setAddUser(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors active:scale-95">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                {addError && <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl px-4 py-3 text-xs font-bold mb-6 border border-rose-100 dark:border-rose-800/50">{addError}</div>}
                <div className="space-y-4">
                  {[
                    { label: 'Ism', key: 'name', type: 'text', placeholder: 'Ism Familiya' },
                    { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                    { label: 'Telefon', key: 'phone', type: 'tel', placeholder: '+998 90 123 45 67' },
                    { label: 'Parol', key: 'password', type: 'password', placeholder: '••••••••' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{f.label}</label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        value={addForm[f.key]}
                        onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Rol</label>
                    <select
                      value={addForm.role}
                      onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="HOTEL_OWNER">HOTEL_OWNER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAddUser}
                  disabled={addLoading || !addForm.name || !addForm.email || !addForm.password}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm mt-8 shadow-sm active:scale-95 transition-all flex justify-center disabled:opacity-50"
                >
                  {addLoading ? 'Qo\'shilmoqda...' : 'Foydalanuvchi Qo\'shish'}
                </button>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {editUser && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Foydalanuvchini tahrirlash</h2>
                  <button onClick={() => setEditUser(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors active:scale-95">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Ism</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Telefon</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 px-4 py-3">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Bloklash holati</label>
                    <button 
                      onClick={() => setEditForm(p => ({ ...p, blocked: !p.blocked }))}
                      className={`w-11 h-6 rounded-full transition-all relative ${editForm.blocked ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editForm.blocked ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 mt-8">
                  <button onClick={() => setEditUser(null)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all active:scale-95">Bekor qilish</button>
                  <button onClick={handleSaveUser} className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-95">Saqlash</button>
                </div>
              </div>
            </div>
          )}

          {/* Universal Confirm Dialog */}
          <ConfirmDialog
            open={!!confirmState}
            title={confirmState?.title}
            message={confirmState?.message}
            loading={!!actionLoading}
            onConfirm={async () => {
              if (confirmState?.onConfirm) {
                await confirmState.onConfirm();
              }
              setConfirmState(null);
            }}
            onClose={() => setConfirmState(null)}
          />

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;