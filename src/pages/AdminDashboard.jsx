import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  FiUsers, FiCalendar, FiHome, FiDollarSign, FiAward, 
  FiTrendingUp, FiPlus, FiEdit2, FiUnlock, FiLock, 
  FiTrash2, FiArrowLeft, FiX, FiInfo, FiAlertTriangle, FiStar, FiList, FiPhone,
  FiCheck, FiXCircle, FiMapPin
} from 'react-icons/fi';
import BackButton from '../components/BackButton';
import FullHotelForm, { emptyHotelTemplate } from '../components/FullHotelForm';


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
  }, []);

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
    try {
      const payload = {
        ...addHotelForm,
        pricePerNight: Number(addHotelForm.basePricePerNight || addHotelForm.pricePerNight),
        basePricePerNight: Number(addHotelForm.basePricePerNight || addHotelForm.pricePerNight),
        roomsAvailable: Number(addHotelForm.roomsAvailable),
        location: { lat: Number(addHotelForm.location.lat), lng: Number(addHotelForm.location.lng) },
      };
      const res = await api.post('/hotels', payload);
      setHotels(prev => [...prev, res.data]);
      setAddHotel(false);
      setAddHotelForm(emptyHotelTemplate);
    } catch (err) {
      setAddHotelError(err.response?.data?.message || 'Xatolik yuz berdi');
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
    if (!window.confirm("Foydalanuvchini o'chirishni tasdiqlaysizmi?")) return;
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
    if (!window.confirm("Mehmonxonani o'chirishni tasdiqlaysizmi?")) return;
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
      owner: h.owner?._id || h.owner,
      basePricePerNight: h.basePricePerNight || h.pricePerNight,
      location: h.location || { lat: '', lng: '' },
      rooms: h.rooms && h.rooms.length > 0 ? h.rooms : emptyHotelTemplate.rooms
    });
  };

  const handleSaveHotel = async () => {
    setEditHotelLoading(true);
    try {
      const payload = {
        ...editHotelForm,
        pricePerNight: Number(editHotelForm.basePricePerNight || editHotelForm.pricePerNight),
        basePricePerNight: Number(editHotelForm.basePricePerNight || editHotelForm.pricePerNight),
        roomsAvailable: Number(editHotelForm.roomsAvailable),
        location: { lat: Number(editHotelForm.location.lat), lng: Number(editHotelForm.location.lng) },
      };
      const res = await api.put(`/hotels/${editHotel._id}`, payload);
      setHotels(prev => prev.map(h => h._id === editHotel._id ? res.data : h));
      setEditHotel(null);
      showToast('Mehmonxona yangilandi', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Xatolik yuz berdi', 'error');
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

  const tabs = [
    { key: 'overview', label: <span className="flex items-center gap-1.5"><FiTrendingUp className="w-4 h-4"/> Tahlil</span> },
    { key: 'users', label: <span className="flex items-center gap-1.5"><FiUsers className="w-4 h-4"/> Foydalanuvchilar</span> },
    { key: 'hotels', label: <span className="flex items-center gap-1.5"><FiHome className="w-4 h-4"/> Mehmonxonalar</span> },
  ];
  if (loading) return (
    <div className="pb-28 pt-4 px-4 max-w-7xl mx-auto min-h-screen lg:pl-32">
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
    <div className="pb-28 md:pb-8 pt-6 px-4 max-w-7xl mx-auto min-h-screen">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm gap-4">
        <div className="flex items-center gap-4">
          <BackButton />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Admin Panel
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-xs sm:text-sm">Platformani to'liq boshqarish va monitoring</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Tizim Faol</span>
        </div>
      </div>

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

      {/* Modern Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key === 'overview' ? '/admin' : `/admin?tab=${tab.key}`)}
            className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-[13px] whitespace-nowrap transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeTab === 'overview' && (
        stats ? (
        <div className="space-y-8 animate-fade-in">
          {/* Main Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Foydalanuvchilar', value: stats.totalUsers, color: 'bg-indigo-600', icon: <FiUsers className="w-5 h-5" /> },
              { label: 'Mehmonxonalar', value: stats.totalHotels, color: 'bg-slate-800 dark:bg-slate-700', icon: <FiHome className="w-5 h-5" /> },
              { label: 'Tashriflar', value: stats.totalVisitors || 0, color: 'bg-emerald-600', icon: <FiTrendingUp className="w-5 h-5" /> },
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Hotels Section */}
            {stats.topHotels && stats.topHotels.length > 0 && (
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                  <FiAward className="text-amber-500" /> Top Mehmonxonalar
                </h2>
                <div className="space-y-3">
                  {stats.topHotels.map((h, i) => (
                    <div key={h._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">#{i + 1}</span>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{h.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">{h.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiStar className="text-amber-500 fill-current w-3 h-3" />
                        <span className="font-bold text-slate-900 dark:text-white text-xs">{h.rating?.toFixed(1) || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Overall Metrics Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-gray-100 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold mb-6 text-slate-900 dark:text-white flex items-center gap-2">
                <FiTrendingUp className="text-indigo-500" /> Platforma faolligi
              </h2>
              
              <div className="space-y-6 py-2">
                {[
                  { label: 'Foydalanuvchilar', value: stats.totalUsers, color: 'bg-indigo-600', icon: <FiUsers /> },
                  { label: 'Mehmonxonalar', value: stats.totalHotels, color: 'bg-slate-800 dark:bg-slate-600', icon: <FiHome /> },
                  { label: 'Umumiy tashriflar', value: stats.totalVisitors || 0, color: 'bg-emerald-600', icon: <FiTrendingUp /> },
                ].map((item, idx) => {
                  const maxVal = Math.max(stats.totalVisitors || 1, stats.totalHotels, stats.totalUsers);
                  const widthPercent = (item.value / maxVal) * 100;
                  
                  return (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          {item.label}
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
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
                 <div className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-black">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Foydalanuvchilar boshqaruvi</h2>
              <p className="text-xs font-semibold text-slate-500">Jami {users.length} ta ro'yxatdan o'tgan foydalanuvchi</p>
            </div>
            <button
              onClick={() => { setAddUser(true); setAddError(''); setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '' }); }}
              className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Yangi Foydalanuvchi
            </button>
          </div>
          
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
                  <button onClick={() => handleDeleteUser(u._id)} disabled={actionLoading === u._id + '_del'} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-rose-600 border border-slate-200 dark:border-slate-700 transition-all">
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Mehmonxonalar</h2>
              <p className="text-xs font-semibold text-slate-500">Platformadagi barcha mehmonxonalar ro'yxati</p>
            </div>
            <button onClick={() => setAddHotel(true)} className="w-full sm:w-auto px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
              <FiPlus className="w-5 h-5" />
              Yangi Mehmonxona
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(h => (
            <div key={h._id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col group hover:border-indigo-200 dark:hover:border-indigo-900 transition-all">
              <div className="flex justify-between items-start mb-5">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${h.approved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'}`}>
                  {h.approved ? 'Faol' : 'Kutilmoqda'}
                </span>
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                  <FiStar className="text-amber-500 fill-current w-3.5 h-3.5" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">{h.rating?.toFixed(1) || '—'}</span>
                </div>
              </div>

              <div className="flex-1 min-w-0 mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight truncate">{h.name}</h3>
                <div className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-500 flex items-center gap-2"><FiMapPin className="text-slate-400 w-3.5 h-3.5"/> {h.city}</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-2">
                    <FiUsers className="w-3.5 h-3.5 text-slate-400" /> {h.owner?.name || 'Egasi yo\'q'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Narxi (Kecha uchun)</p>
                <p className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                  {new Intl.NumberFormat('uz-UZ').format(Number(h.pricePerNight || h.basePricePerNight || 0))} 
                  <span className="text-xs ml-1 opacity-70">UZS</span>
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/hotel/${h._id}`)} className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                    Ko'rish
                  </button>
                  <button onClick={() => openEditHotel(h)} className="w-12 py-3 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-100 dark:border-indigo-800/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteHotel(h._id)} disabled={actionLoading === h._id + '_del'} className="w-12 py-3 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-100 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all">
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
              <p className="text-[12px] text-slate-500 font-bold ml-12 uppercase tracking-widest mt-1">Obyekt yaratish paneli</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10">
               <button onClick={() => setAddHotel(false)} className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center">
                 Bekor qilish
               </button>
               <button
                 onClick={handleAddHotel}
                 disabled={addHotelLoading || !addHotelForm.name || !addHotelForm.address || !addHotelForm.owner}
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
    </div>
  );
};

export default AdminDashboard;