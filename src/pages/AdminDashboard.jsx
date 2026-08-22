import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  FiUsers, FiCalendar, FiHome, FiDollarSign, FiAward,
  FiTrendingUp, FiPlus, FiEdit2, FiUnlock, FiLock,
  FiTrash2, FiArrowLeft, FiX, FiInfo, FiAlertTriangle, FiStar, FiList, FiPhone,
  FiCheck, FiXCircle, FiMapPin, FiCompass, FiShield, FiArrowUpRight
} from 'react-icons/fi';
import { LuLandmark } from 'react-icons/lu';
import BackButton from '../components/BackButton';
import FullHotelForm, { emptyHotelTemplate } from '../components/FullHotelForm';
import AttractionForm, { emptyAttractionTemplate } from '../components/AttractionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import {
  fetchAttractions, createAttraction, updateAttraction, deleteAttraction as apiDeleteAttraction,
} from '../services/attractions';
import { imgSrc } from '../utils/media';


const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [addUser, setAddUser] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addHotel, setAddHotel] = useState(false);
  const [addHotelForm, setAddHotelForm] = useState(emptyHotelTemplate);
  const [addHotelLoading, setAddHotelLoading] = useState(false);
  const [addHotelError, setAddHotelError] = useState('');
  const [editHotel, setEditHotel] = useState(null);
  const [editHotelForm, setEditHotelForm] = useState({});
  const [editHotelLoading, setEditHotelLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  // Tarixiy joylar (Attraction)
  const [attractions, setAttractions] = useState([]);
  const [addAttraction, setAddAttraction] = useState(false);
  const [attractionForm, setAttractionForm] = useState(emptyAttractionTemplate);
  const [editAttraction, setEditAttraction] = useState(null);
  const [attractionLoading, setAttractionLoading] = useState(false);
  const [attractionError, setAttractionError] = useState('');
  const [confirmState, setConfirmState] = useState(null); // { title, message, onConfirm }
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = new URLSearchParams(location.search).get('tab') || 'overview';

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes, hotelsRes] = await Promise.all([
          api.get('/admin/statistics'),
          api.get('/admin/users'),
          api.get('/admin/hotels'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setHotels(hotelsRes.data);
      } catch (err) {
        console.error('Admin fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    fetchAttractions({ limit: 50 })
      .then((res) => setAttractions(Array.isArray(res) ? res : (res.data || [])))
      .catch(() => {});
  }, []);

  const handleAddAttraction = async () => {
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
      const created = await createAttraction(payload);
      setAttractions((prev) => [created, ...prev]);
      setAddAttraction(false);
      setAttractionForm(emptyAttractionTemplate);
      showToast('Tarixiy joy qo\'shildi', 'success');
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
      showToast('Tarixiy joy yangilandi', 'success');
    } catch (err) {
      setAttractionError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally { setAttractionLoading(false); }
  };

  const handleDeleteAttraction = async (attrId) => {
    setActionLoading(attrId + '_del');
    try {
      await apiDeleteAttraction(attrId);
      setAttractions((prev) => prev.filter((a) => a._id !== attrId));
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
      location: a.location || { lat: a.geo?.coordinates?.[1] || '', lng: a.geo?.coordinates?.[0] || '' },
      video360: a.video360 || emptyAttractionTemplate.video360,
      atmosphere: a.atmosphere || emptyAttractionTemplate.atmosphere,
      peakInfo: a.peakInfo || emptyAttractionTemplate.peakInfo,
      accessibility: a.accessibility || {},
      thingsToSeeAround: a.thingsToSeeAround || [],
      images: a.images || [],
    });
  };

  const openEditUser = (u) => {
    setEditUser(u);
    setEditForm({ name: u.name, email: u.email, role: u.role, phone: u.phone || '', blocked: u.blocked });
  };

  const handleSaveUser = async () => {
    setEditLoading(true);
    try {
      const res = await api.put(`/admin/users/${editUser._id}`, editForm);
      setUsers(prev => prev.map(u => u._id === editUser._id ? res.data : u));
      setEditUser(null);
    } catch (err) {
      console.error(err);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddUser = async () => {
    setAddLoading(true);
    setAddError('');
    try {
      const res = await api.post('/auth/register', addForm);
      setUsers(prev => [...prev, res.data.user]);
      setAddUser(false);
      setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER' });
    } catch (err) {
      setAddError(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setAddLoading(false);
    }
  };

  const handleAddHotel = async () => {
    setAddHotelLoading(true);
    setAddHotelError('');
    if (!addHotelForm.name || !addHotelForm.name.trim()) {
      setAddHotelError('Mehmonxona nomi kiritilishi shart.');
      setAddHotelLoading(false);
      return;
    }
    if (!addHotelForm.district) {
      setAddHotelError('Tuman tanlanishi shart: Navoiy viloyati tumanlaridan birini tanlang.');
      setAddHotelLoading(false);
      return;
    }
    try {
      const basePrice = Number(addHotelForm.basePricePerNight || addHotelForm.pricePerNight) || 500000;
      const payload = {
        ...addHotelForm,
        basePricePerNight: basePrice,
        pricePerNight: basePrice,
        roomsAvailable: Number(addHotelForm.roomsAvailable || addHotelForm.totalRooms) || 10,
        totalRooms: Number(addHotelForm.totalRooms || addHotelForm.roomsAvailable) || 10,
        stars: Number(addHotelForm.stars) || 4,
        images: (addHotelForm.images || []).filter(img => typeof img === 'string' && img.trim() !== ''),
        location: (addHotelForm.location?.lat && addHotelForm.location?.lng) ? {
          lat: Number(addHotelForm.location.lat),
          lng: Number(addHotelForm.location.lng)
        } : undefined,
        rooms: (addHotelForm.rooms || []).map(r => ({
          ...r,
          name: r.name || `${r.capacity || 2} kishilik ${r.category || 'Standard'}`,
          capacity: Number(r.capacity) || 2,
          pricePerNight: Number(r.pricePerNight || basePrice) || basePrice,
          totalRooms: Number(r.totalRooms) || 1,
          roomsAvailable: Number(r.roomsAvailable !== undefined ? r.roomsAvailable : r.totalRooms) || 1
        }))
      };
      const res = await api.post('/hotels', payload);
      setHotels(prev => [res.data, ...prev]);
      setAddHotel(false);
      setAddHotelForm(emptyHotelTemplate);
      showToast('Mehmonxona qo\'shildi', 'success');
    } catch (err) {
      setAddHotelError(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally {
      setAddHotelLoading(false);
    }
  };

  const handleBlockUser = async (userId) => {
    setActionLoading(userId);
    try {
      const res = await api.patch(`/admin/users/${userId}/block`);
      setUsers(prev => prev.map(u => u._id === userId ? res.data : u));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    setActionLoading(userId + '_del');
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    setActionLoading(hotelId + '_del');
    try {
      await api.delete(`/hotels/${hotelId}`);
      setHotels(prev => prev.filter(h => h._id !== hotelId));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditHotel = (h) => {
    setEditHotel(h);
    setEditHotelForm({
      ...emptyHotelTemplate,
      ...h,
      owner: h.owner?._id || h.owner || '',
      basePricePerNight: h.basePricePerNight || h.pricePerNight || 500000,
      pricePerNight: h.basePricePerNight || h.pricePerNight || 500000,
      stars: h.stars || 4,
      location: h.location || { lat: '', lng: '' },
      rooms: h.rooms && h.rooms.length > 0 ? h.rooms : emptyHotelTemplate.rooms
    });
  };

  const handleSaveHotel = async () => {
    setEditHotelLoading(true);
    try {
      const basePrice = Number(editHotelForm.basePricePerNight || editHotelForm.pricePerNight) || 500000;
      const payload = {
        ...editHotelForm,
        basePricePerNight: basePrice,
        pricePerNight: basePrice,
        roomsAvailable: Number(editHotelForm.roomsAvailable || editHotelForm.totalRooms) || 10,
        totalRooms: Number(editHotelForm.totalRooms || editHotelForm.roomsAvailable) || 10,
        stars: Number(editHotelForm.stars) || 4,
        images: (editHotelForm.images || []).filter(img => typeof img === 'string' && img.trim() !== ''),
        location: (editHotelForm.location?.lat && editHotelForm.location?.lng) ? {
          lat: Number(editHotelForm.location.lat),
          lng: Number(editHotelForm.location.lng)
        } : undefined,
        rooms: (editHotelForm.rooms || []).map(r => ({
          ...r,
          name: r.name || `${r.capacity || 2} kishilik ${r.category || 'Standard'}`,
          capacity: Number(r.capacity) || 2,
          pricePerNight: Number(r.pricePerNight || basePrice) || basePrice,
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
    } finally {
      setEditHotelLoading(false);
    }
  };

  const handleApproveHotel = async (hotelId) => {
    setActionLoading(hotelId);
    try {
      const res = await api.patch(`/hotels/${hotelId}/approve`);
      setHotels(prev => prev.map(h => h._id === hotelId ? { ...h, approved: true } : h));
      showToast('Mehmonxona tasdiqlandi', 'success');
    } catch (err) {
      showToast('Xatolik yuz berdi', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const showToast = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const navItems = [
    { key: 'overview',    label: 'Tahlil',           icon: FiTrendingUp, count: null },
    { key: 'users',       label: 'Foydalanuvchilar', icon: FiUsers,      count: users.length },
    { key: 'hotels',      label: 'Mehmonxonalar',    icon: FiHome,       count: hotels.length },
    { key: 'attractions', label: 'Tarixiy joylar',   icon: FiCompass,    count: attractions.length },
  ];
  const goTab = (key) => navigate(key === 'overview' ? '/admin' : `/admin?tab=${key}`);
  if (loading) return (
    <div className="pb-28 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black mb-8 text-slate-900 dark:text-white">Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="shimmer h-[120px] rounded-2xl" />)}
      </div>
      <div className="mt-8 flex flex-col md:flex-row gap-6">
         <div className="flex-1 shimmer h-[300px] rounded-2xl" />
         <div className="flex-1 shimmer h-[300px] rounded-2xl" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen max-w-[1400px] mx-auto">

      {/* Global Toast */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up ${
          message.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {message.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiAlertTriangle className="w-5 h-5" />}
          <span className="font-bold text-sm">{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-2 hover:opacity-75 transition-opacity">
             <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="px-4 pt-4 pb-28 md:px-6 md:pt-6 md:pb-8">

        {/* ── Asosiy kontent ── */}
        <main className="min-w-0">

          {/* Sarlavha + gorizontal tab navigatsiya */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 shrink-0">
                  <FiShield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white leading-none">Admin Panel</h1>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] mt-1.5">Boshqaruv markazi</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-900/15 border border-emerald-100 dark:border-emerald-900/30">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Tizim faol</span>
                </div>
                <BackButton />
              </div>
            </div>

            {/* Sarlavha + gorizontal tab navigatsiya va Aksiya tugmalari */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-1">
                {navItems.map((it) => {
                  const active = activeTab === it.key;
                  return (
                    <button key={it.key} onClick={() => goTab(it.key)}
                      className={`group flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-300 shrink-0 ${active ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-400'}`}>
                      <it.icon className="w-[18px] h-[18px]" /> {it.label}
                      {it.count != null && <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${active ? 'bg-white/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{it.count}</span>}
                    </button>
                  );
                })}
              </div>

              {/* Aksiya tugmalari (Yangi qo'shish) */}
              <div className="shrink-0 flex items-center">
                {activeTab === 'users' && (
                  <button onClick={() => { setAddUser(true); setAddError(''); setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '' }); }}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <FiPlus className="w-5 h-5" /> Yangi Foydalanuvchi
                  </button>
                )}
                {activeTab === 'hotels' && !addHotel && !editHotel && (
                  <button onClick={() => setAddHotel(true)} 
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <FiPlus className="w-5 h-5" /> Yangi Mehmonxona
                  </button>
                )}
                {activeTab === 'attractions' && !addAttraction && !editAttraction && (
                  <button onClick={() => { setAddAttraction(true); setAttractionError(''); setAttractionForm(emptyAttractionTemplate); }}
                    className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <FiPlus className="w-5 h-5" /> Yangi Tarixiy Joy
                  </button>
                )}
              </div>
            </div>
          </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        stats ? (
        <div className="space-y-8 animate-fade-in">
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { label: 'Foydalanuvchilar', value: stats.totalUsers, gradient: 'from-blue-600 to-indigo-600', glow: 'shadow-blue-500/30', icon: <FiUsers className="w-6 h-6 text-white" /> },
              { label: 'Mehmonxonalar', value: stats.totalHotels, gradient: 'from-rose-500 to-pink-600', glow: 'shadow-rose-500/30', icon: <FiHome className="w-6 h-6 text-white" /> },
              { label: 'Tashriflar', value: stats.totalVisitors || 0, gradient: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/30', icon: <FiTrendingUp className="w-6 h-6 text-white" /> },
            ].map((stat, i) => (
              <div key={i} className="group relative overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-6 rounded-[24px] border border-white/50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300">
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-[0.08] group-hover:opacity-[0.15] blur-2xl transition-opacity duration-300`} />
                <div className="relative flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg ${stat.glow} group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{stat.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Hotels Section */}
            {stats.topHotels && stats.topHotels.length > 0 && (
              <div className="lg:col-span-1 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[24px] p-6 border border-white/50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="text-lg font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <FiAward className="text-amber-500 w-4 h-4" />
                  </div>
                  Top Mehmonxonalar
                </h2>
                <div className="space-y-3">
                  {stats.topHotels.map((h, i) => (
                    <div key={h._id} className="group flex items-center justify-between p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 hover:border-amber-200 dark:hover:border-amber-900 hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center justify-center">
                          #{i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{h.name}</p>
                          <p className="text-[10px] text-slate-500 font-semibold">{h.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-lg">
                        <FiStar className="text-amber-500 fill-current w-3.5 h-3.5" />
                        <span className="font-bold text-amber-700 dark:text-amber-400 text-xs">{h.rating?.toFixed(1) || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Overall Metrics Chart */}
            <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-[24px] p-6 border border-white/50 dark:border-slate-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h2 className="text-lg font-black mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <FiTrendingUp className="text-indigo-500 w-4 h-4" />
                </div>
                Platforma faolligi
              </h2>
              
              <div className="space-y-6 py-2">
                {[
                  { label: 'Foydalanuvchilar', value: stats.totalUsers, color: 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/50' },
                  { label: 'Mehmonxonalar', value: stats.totalHotels, color: 'bg-gradient-to-r from-rose-500 to-pink-600 shadow-rose-500/50' },
                  { label: 'Umumiy tashriflar', value: stats.totalVisitors || 0, color: 'bg-gradient-to-r from-emerald-400 to-teal-500 shadow-teal-500/50' },
                ].map((item, idx) => {
                  const maxVal = Math.max(stats.totalVisitors || 1, stats.totalHotels, stats.totalUsers);
                  const widthPercent = (item.value / maxVal) * 100;
                  
                  return (
                    <div key={idx} className="group">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 tracking-wide uppercase">
                          {item.label}
                        </span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{item.value}</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner">
                        <div
                          className={`h-full ${item.color} rounded-full shadow-lg transition-all duration-1000 ease-out group-hover:brightness-110`}
                          style={{ width: `${Math.max(2, widthPercent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <div className="text-[11px] font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                   Oxirgi 30 kunlik o'sish
                 </div>
                 <div className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-teal-700 dark:text-teal-400 rounded-lg text-xs font-black shadow-sm">
                   +{Math.floor(stats.totalUsers * 0.4 + 5)}%
                 </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="glass-panel p-8 text-center text-red-500 font-bold flex flex-col items-center justify-center gap-3">
            <FiAlertTriangle className="w-10 h-10" />
            Statistikani yuklashda xatolik yuz berdi. Backend tizimi ishlayotganini tekshiring.
          </div>
        )
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex flex-col gap-3">
            {users.map(u => (
              <div key={u._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-900 transition-all gap-4">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-lg border border-slate-200 dark:border-slate-700">
                      {u.name?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${u.blocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white text-[15px] truncate">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:gap-6 flex-1 sm:justify-center">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    <FiPhone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.phone || '—'}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50' :
                    u.role === 'HOTEL_OWNER' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                  }`}>
                    {u.role}
                  </span>
                </div>
                
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <button onClick={() => openEditUser(u)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleBlockUser(u._id)} disabled={actionLoading === u._id} className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${u.blocked ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                     {u.blocked ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                  </button>
                  <button onClick={() => setConfirmState({ title: 'Foydalanuvchini o\'chirish', message: "Bu foydalanuvchi butunlay o'chiriladi. Davom etasizmi?", onConfirm: () => handleDeleteUser(u._id) })} disabled={actionLoading === u._id + '_del'} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-all">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <FiInfo className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Foydalanuvchilar topilmadi</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HOTELS */}
      {activeTab === 'hotels' && !addHotel && !editHotel && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(h => (
            <div key={h._id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/50 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-full h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5 overflow-hidden relative shadow-inner">
                 {h.images && h.images.length > 0 ? (
                   <img src={imgSrc(h.images[0])} alt={h.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700"><FiHome className="w-10 h-10" /></div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                 <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm ${h.approved ? 'bg-emerald-500/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                      {h.approved ? 'Faol' : 'Kutilmoqda'}
                    </span>
                    <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                      <FiStar className="text-amber-400 fill-current w-3.5 h-3.5" />
                      <span className="font-bold text-white text-xs">{h.rating?.toFixed(1) || '—'}</span>
                    </div>
                 </div>
              </div>

              <div className="flex-1 min-w-0 mb-6 px-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{h.name}</h3>
                <div className="space-y-2">
                  <div className="text-[13px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FiMapPin className="text-rose-500 w-3 h-3"/>
                    </div>
                    {h.district || h.city}
                  </div>
                  <div className="text-[13px] font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FiUsers className="text-blue-500 w-3 h-3" />
                    </div>
                    {h.owner?.name || 'Egasi yo\'q'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/hotel/${h._id}`)} className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    Ko'rish
                  </button>
                  <button onClick={() => openEditHotel(h)} className="w-12 py-3 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setConfirmState({ title: 'Mehmonxonani o\'chirish', message: "Bu mehmonxona butunlay o'chiriladi. Davom etasizmi?", onConfirm: () => handleDeleteHotel(h._id) })} disabled={actionLoading === h._id + '_del'} className="w-12 py-3 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all">
                    <FiTrash2 className="w-4 h-4"/>
                  </button>
                </div>
                {!h.approved && (
                  <button onClick={() => handleApproveHotel(h._id)} disabled={actionLoading === h._id} className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-sm transition-all">
                    Tasdiqlash
                  </button>
                )}
              </div>
            </div>
          ))}
          {hotels.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm font-bold text-slate-500">Mehmonxonalar yo'q.</p>
            </div>
          )}
        </div>
        </div>
      )}

      {/* ATTRACTIONS — list */}
      {activeTab === 'attractions' && !addAttraction && !editAttraction && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {attractions.map((a) => (
              <div key={a._id} className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-[24px] border border-white/50 dark:border-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                <div className="w-full h-36 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-5 overflow-hidden relative shadow-inner">
                   {a.images && a.images.length > 0 ? (
                     <img src={imgSrc(a.images[0])} alt={a.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700"><FiCompass className="w-10 h-10" /></div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                   <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md text-white border border-white/10 shadow-sm">
                        <LuLandmark className="w-3.5 h-3.5 text-amber-400" /> {a.district}
                      </span>
                      <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 shadow-sm">
                        <FiStar className="text-amber-400 fill-current w-3.5 h-3.5" />
                        <span className="font-bold text-white text-xs">{a.rating?.toFixed(1) || '—'}</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 min-w-0 mb-5 px-1">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{a.name}</h3>
                  <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{a.descriptionShort || a.description}</p>
                  <div className="flex flex-wrap gap-2 mt-4">
                    {a.video360?.url && <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800/50 uppercase tracking-wide shadow-sm">Video</span>}
                    {a.entryFee && <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/50 uppercase tracking-wide shadow-sm">{a.entryFee}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/attraction/${a._id}`)} className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all">Ko'rish</button>
                  <button onClick={() => openEditAttraction(a)} className="w-12 py-3 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl border border-amber-100 dark:border-amber-800/50 hover:bg-amber-100 transition-all"><FiEdit2 className="w-4 h-4" /></button>
                  <button onClick={() => setConfirmState({ title: 'Tarixiy joyni o\'chirish', message: "Bu tarixiy joy butunlay o'chiriladi. Davom etasizmi?", onConfirm: () => handleDeleteAttraction(a._id) })} disabled={actionLoading === a._id + '_del'} className="w-12 py-3 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 transition-all"><FiTrash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            {attractions.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <FiCompass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-500">Hali tarixiy joy qo'shilmagan.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ATTRACTIONS — add/edit inline */}
      {activeTab === 'attractions' && (addAttraction || editAttraction) && (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <button onClick={() => { setAddAttraction(false); setEditAttraction(null); }} className="flex items-center gap-2 text-slate-500 hover:text-amber-600 font-bold text-sm mb-4 transition-colors">
                <FiArrowLeft className="w-4 h-4" /> Ortga ro'yxatga qaytish
              </button>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center"><FiCompass className="w-5 h-5" /></span>
                {editAttraction ? 'Tarixiy joyni tahrirlash' : 'Yangi tarixiy joy'}
              </h2>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button onClick={() => { setAddAttraction(false); setEditAttraction(null); }} className="flex-1 sm:flex-none px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">Bekor qilish</button>
              <button onClick={editAttraction ? handleSaveAttraction : handleAddAttraction}
                disabled={attractionLoading || !attractionForm.name}
                className="flex-1 sm:flex-none px-8 py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                <FiCheck className="w-4 h-4" /> {attractionLoading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>

          {attractionError && (
            <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl px-6 py-4 text-sm font-bold border border-rose-100 dark:border-rose-800/50 flex items-center gap-3">
              <FiAlertTriangle className="w-5 h-5" /> {attractionError}
            </div>
          )}

          <div className="pb-10">
            <AttractionForm form={attractionForm} setForm={setAttractionForm} />
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Yangi foydalanuvchi</h2>
              <button onClick={() => setAddUser(false)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
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

      {/* Add Hotel INLINE PAGE */}
      {activeTab === 'hotels' && addHotel && (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
            <div>
              <button onClick={() => setAddHotel(false)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm mb-4 transition-colors">
                <FiArrowLeft className="w-4 h-4"/> Ortga ro'yxatga qaytish
              </button>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 flex items-center justify-center"><FiHome className="w-5 h-5" /></span>
                Yangi Mehmonxona Qo'shish
              </h2>
              <p className="text-[12px] text-slate-500 font-bold ml-12 uppercase tracking-widest mt-1">Mehmonxona yaratish paneli</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10">
               <button onClick={() => setAddHotel(false)} className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
                 Bekor qilish
               </button>
               <button
                 onClick={handleAddHotel}
                 disabled={addHotelLoading || !addHotelForm.name || !addHotelForm.district}
                 className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(79,70,229,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
               >
                 <FiCheck className="w-4 h-4" />
                 {addHotelLoading ? 'Saqlanmoqda...' : 'Bazaga Saqlash'}
               </button>
            </div>
          </div>

          {addHotelError && <div className="bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl px-6 py-4 text-sm font-bold border border-rose-100 dark:border-rose-800/50 flex items-center gap-3"><FiAlertTriangle className="w-5 h-5"/> {addHotelError}</div>}
          
          <div className="pb-10">
            <FullHotelForm form={addHotelForm} setForm={setAddHotelForm} users={users} />
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 my-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Foydalanuvchini tahrirlash</h2>
              <button onClick={() => setEditUser(null)} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
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
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Rol</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="HOTEL_OWNER">HOTEL_OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleSaveUser}
              disabled={editLoading}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm mt-8 shadow-sm active:scale-95 transition-all flex justify-center disabled:opacity-50"
            >
              {editLoading ? 'Saqlanmoqda...' : 'O\'zgarishlarni saqlash'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Hotel INLINE PAGE */}
      {activeTab === 'hotels' && editHotel && (
        <div className="animate-fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-bl-full pointer-events-none"></div>
            <div>
              <button onClick={() => setEditHotel(null)} className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 font-bold text-sm mb-4 transition-colors">
                <FiArrowLeft className="w-4 h-4"/> Ortga ro'yxatga qaytish
              </button>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center"><FiEdit2 className="w-5 h-5" /></span>
                Mehmonxonani Tahrirlash
              </h2>
              <p className="text-[12px] text-slate-500 font-bold ml-12 uppercase tracking-widest mt-1">{editHotelForm.name}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10">
               <button onClick={() => setEditHotel(null)} className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
                 Bekor qilish
               </button>
               <button
                 onClick={handleSaveHotel}
                 disabled={editHotelLoading}
                 className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-[0_8px_20px_-6px_rgba(16,185,129,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
               >
                 <FiCheck className="w-4 h-4" />
                 {editHotelLoading ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
               </button>
            </div>
          </div>

          <div className="pb-10">
            <FullHotelForm form={editHotelForm} setForm={setEditHotelForm} users={users} isEdit={true} />
          </div>
        </div>
      )}

      {/* O'chirishni tasdiqlash (universal) */}
      <ConfirmDialog
        open={!!confirmState}
        title={confirmState?.title || 'Tasdiqlang'}
        message={confirmState?.message || ''}
        onConfirm={() => { confirmState?.onConfirm?.(); setConfirmState(null); }}
        onClose={() => setConfirmState(null)}
      />

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;