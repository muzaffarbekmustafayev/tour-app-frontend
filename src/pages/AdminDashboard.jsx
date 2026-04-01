import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  FiUsers, FiCalendar, FiHome, FiDollarSign, FiAward, 
  FiTrendingUp, FiPlus, FiEdit2, FiUnlock, FiLock, 
  FiTrash2, FiArrowLeft, FiX, FiInfo, FiAlertTriangle, FiStar, FiList, FiPhone,
  FiCheck, FiXCircle
} from 'react-icons/fi';
import BackButton from '../components/BackButton';


const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
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
  const [addHotelForm, setAddHotelForm] = useState({
    name: '', description: '', city: '', country: 'Uzbekistan', address: '',
    category: 'hotel', pricePerNight: '', roomsAvailable: '', owner: ''
  });
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
        const [statsRes, usersRes, hotelsRes, bookingsRes] = await Promise.all([
          api.get('/admin/statistics'),
          api.get('/admin/users'),
          api.get('/admin/hotels'),
          api.get('/admin/bookings'),
        ]);
        setStats(statsRes.data);
        setUsers(usersRes.data);
        setHotels(hotelsRes.data);
        setBookings(bookingsRes.data);
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
      const res = await api.post('/hotels', addHotelForm);
      setHotels(prev => [...prev, res.data]);
      setAddHotel(false);
      setAddHotelForm({
        name: '', description: '', city: '', country: 'Uzbekistan', address: '',
        category: 'hotel', pricePerNight: '', roomsAvailable: '', owner: ''
      });
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
      name: h.name,
      description: h.description,
      city: h.city,
      address: h.address,
      category: h.category,
      basePricePerNight: h.basePricePerNight || h.pricePerNight,
      roomsAvailable: h.roomsAvailable,
      owner: h.owner?._id || h.owner
    });

  };

  const handleSaveHotel = async () => {
    setEditHotelLoading(true);
    try {
      const res = await api.put(`/hotels/${editHotel._id}`, editHotelForm);
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

  const handleBookingAction = async (bookingId, action) => {
    setActionLoading(bookingId + '_' + action);
    try {
      const endpoint = action === 'confirm' ? `/bookings/${bookingId}/confirm` : `/bookings/${bookingId}/cancel`;
      const res = await api.patch(endpoint);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: res.data.status } : b));
      showToast(`Bron ${action === 'confirm' ? 'tasdiqlandi' : 'bekor qilindi'}`, 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Xatolik yuz berdi', 'error');
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
    { key: 'bookings', label: <span className="flex items-center gap-1.5"><FiList className="w-4 h-4"/> Bronlar</span> },
  ];

  if (loading) return (
    <div className="pb-28 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black mb-8" style={{ color: 'var(--text-main)' }}>Admin Panel</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <div key={i} className="shimmer h-[160px] rounded-[2rem]" />)}
      </div>
      <div className="mt-8 flex gap-6">
         <div className="flex-1 shimmer h-[400px] rounded-[2rem]" />
         <div className="flex-1 shimmer h-[400px] rounded-[2rem]" />
      </div>
    </div>
  );

  return (
    <div className="pb-28 pt-6 px-4 max-w-7xl mx-auto min-h-screen lg:pl-32">

      <div className="flex items-center mb-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl p-4 rounded-3xl border border-white/20 dark:border-slate-800 shadow-sm gap-5">
        <BackButton />
        <div>

          <h1 className="text-3xl font-black mb-1 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            Admin Panel
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">Platformani to'liq boshqarish va monitoring qilish</p>
        </div>
      </div>

      {/* Global Toast */}
      {message.text && (
        <div className={`fixed top-6 right-6 z-[200] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-float ${
          message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
        }`}>
          {message.type === 'success' ? <FiCheck className="w-5 h-5" /> : <FiAlertTriangle className="w-5 h-5" />}
          <span className="font-bold text-sm">{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="ml-2 hover:opacity-75 transition-opacity">
             <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modern Tabs */}
      <div className="flex space-x-3 mb-10 overflow-x-auto hide-scrollbar pb-2 px-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key === 'overview' ? '/admin' : `/admin?tab=${tab.key}`)}
            className={`px-7 py-3.5 rounded-2xl font-black text-[13px] whitespace-nowrap transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-lg shadow-indigo-300 dark:shadow-none scale-105 transform'
                : 'glass-panel text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-slate-800 hover:-translate-y-0.5'
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
              { label: 'Foydalanuvchilar', value: stats.totalUsers, gradient: 'from-[#4F46E5] to-[#7C3AED]', icon: <FiUsers className="w-6 h-6" /> },
              { label: 'Mehmonxonalar', value: stats.totalHotels, gradient: 'from-[#F59E0B] to-[#EF4444]', icon: <FiHome className="w-6 h-6" /> },
              { label: 'Tashriflar', value: stats.totalVisitors || 0, gradient: 'from-[#10B981] to-[#047857]', icon: <FiTrendingUp className="w-6 h-6" /> },
            ].map((stat, i) => (



              <div key={i} className={`bg-gradient-to-br ${stat.gradient} p-7 rounded-[2rem] text-white shadow-xl relative overflow-hidden group hover:-translate-y-2 transition-transform duration-300`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/30">
                    {stat.icon}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black drop-shadow-md mb-1">{stat.value}</h3>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80 drop-shadow-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Hotels Section */}
            {stats.topHotels && stats.topHotels.length > 0 && (
              <div className="lg:col-span-1 glass-panel p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-yellow-400 to-orange-500" />
                <h2 className="text-2xl font-black mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 flex items-center justify-center drop-shadow-sm"><FiAward /></span>
                  Top Mehmonxonalar
                </h2>
                <div className="space-y-4">
                  {stats.topHotels.map((h, i) => (
                    <div key={h._id} className="group flex items-center justify-between p-4 rounded-2xl bg-white/40 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-white/50 dark:border-gray-700 hover:shadow-lg transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 flex shrink-0 items-center justify-center rounded-full font-black text-sm ${i === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-white shadow-md' : i === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-white shadow-md' : 'bg-gradient-to-br from-orange-300 to-orange-400 text-white shadow-md'}`}>
                          #{i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">{h.name}</p>
                          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">{h.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900 px-3 py-1.5 rounded-xl">
                        <FiStar className="text-yellow-500 fill-current w-3.5 h-3.5" />
                        <span className="font-black text-gray-900 dark:text-white text-[15px]">{h.rating?.toFixed(1) || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Overall Metrics Chart */}
            <div className="lg:col-span-2 glass-panel p-8 h-full flex flex-col relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
              <h2 className="text-2xl font-black mb-8 text-gray-900 dark:text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center drop-shadow-sm"><FiTrendingUp /></span>
                Platforma ko'rsatkichlari (Diagramma)
              </h2>
              
              <div className="flex-1 flex flex-col justify-center gap-10 py-4">
                {[
                  { label: 'Foydalanuvchilar', value: stats.totalUsers, color: 'from-blue-500 to-indigo-600', icon: <FiUsers /> },
                  { label: 'Mehmonxonalar', value: stats.totalHotels, color: 'from-yellow-400 to-orange-500', icon: <FiHome /> },
                  { label: 'Umumiy tashriflar', value: stats.totalVisitors || 0, color: 'from-emerald-500 to-teal-600', icon: <FiTrendingUp /> },
                ].map((item, idx) => {
                  const maxVal = Math.max(stats.totalVisitors || 1, stats.totalHotels, stats.totalUsers);
                  const widthPercent = (item.value / maxVal) * 100;

                  
                  return (
                    <div key={idx} className="relative">
                      <div className="flex justify-between items-center mb-2 px-1">
                        <span className="text-sm font-black text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          {item.icon} {item.label}
                        </span>
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">{item.value}</span>
                      </div>
                      <div className="h-6 w-full bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
                        <div 
                          className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-1000 ease-out shadow-lg relative group`}
                          style={{ width: `${Math.max(5, widthPercent)}%` }}
                        >
                           <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800/60 flex justify-between items-center bg-gray-50/50 dark:bg-slate-900/50 p-4 rounded-2xl">
                 <div className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                   <FiTrendingUp className="text-emerald-500"/> Oxirgi 30 kunlik faollik
                 </div>
                 <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
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
        <div className="animate-fade-in glass-panel overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-100 dark:border-gray-800 bg-white/40 dark:bg-slate-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative">
             <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500" />
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-1">Foydalanuvchilar Listi</h2>
              <p className="text-sm font-semibold text-gray-500">Jami {users.length} ta ro'yxatdan o'tgan mijoz va menejerlar</p>
            </div>
            <button
              onClick={() => { setAddUser(true); setAddError(''); setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER', phone: '' }); }}
              className="btn-primary px-6 py-3.5 rounded-2xl text-sm font-bold active:scale-95 flex items-center gap-2"
            >
              <FiPlus className="w-5 h-5" />
              Yangi Qo'shish
            </button>
          </div>
          
          <div className="flex-1 w-full overflow-x-auto p-4">
            <div className="min-w-[800px] w-full flex flex-col gap-3">
              {users.map(u => (
                <div key={u._id} className="group flex items-center justify-between p-5 rounded-2xl bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-white/60 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center w-1/3 gap-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-200 dark:from-indigo-900 dark:to-indigo-800 rounded-[1.25rem] flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-black text-xl shadow-inner border border-white dark:border-slate-700">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${u.blocked ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'}`} />
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 dark:text-white text-base leading-tight mb-0.5">{u.name}</p>
                      <p className="text-[13px] text-gray-500 font-medium">{u.email}</p>
                    </div>
                  </div>

                  <div className="w-1/4 flex items-center px-4 text-gray-500 font-medium">
                    <p className="text-[13px] flex items-center gap-1.5"><FiPhone className="w-3.5 h-3.5" /> {u.phone || '—'}</p>
                  </div>

                  <div className="w-1/4 flex items-center px-4">
                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50' :
                      u.role === 'HOTEL_OWNER' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50' :
                      'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  
                  <div className="w-1/4 px-4 flex justify-end">
                    <div className="flex items-center space-x-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                       <button onClick={() => openEditUser(u)} className="w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-gray-600 hover:text-blue-600 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-blue-200 transition-all active:scale-95">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleBlockUser(u._id)} disabled={actionLoading === u._id} className={`w-11 h-11 flex items-center justify-center rounded-xl shadow-sm border transition-all active:scale-95 ${u.blocked ? 'bg-red-50 border-red-100 text-red-600 hover:bg-green-50 hover:text-green-600 hover:border-green-200' : 'bg-green-50 border-green-100 text-green-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'} ${actionLoading === u._id ? 'opacity-50' : ''}`}>
                         {u.blocked ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteUser(u._id)} disabled={actionLoading === u._id + '_del'} className={`w-11 h-11 flex items-center justify-center rounded-xl bg-white dark:bg-slate-900 text-gray-500 hover:text-red-600 shadow-sm border border-gray-100 dark:border-gray-800 hover:border-red-200 transition-all active:scale-95 ${actionLoading === u._id + '_del' ? 'opacity-50' : ''}`}>
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="py-24 text-center glass-panel">
                  <FiInfo className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">Foydalanuvchilar topilmadi</h3>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HOTELS */}
      {activeTab === 'hotels' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mehmonxonalar</h2>
            <button onClick={() => setAddHotel(true)} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all active:scale-95">
              <FiPlus className="w-5 h-5" />
              Mehmonxona Qo'shish
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.map(h => (
            <div key={h._id} className="glass-panel p-6 flex flex-col justify-between group hover:-translate-y-1 transition-all">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${h.approved ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-yellow-100 text-yellow-700 border border-yellow-200'}`}>
                    {h.approved ? 'Faol' : 'Kutilmoqda'}
                  </span>
                  <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900 px-2 py-1 rounded-lg">
                    <FiStar className="text-yellow-500 fill-current w-3.5 h-3.5" />
                    <span className="font-bold text-gray-900 dark:text-white text-sm">{h.rating?.toFixed(1) || '—'}</span>
                  </div>
                </div>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-1 leading-tight">{h.name}</h3>
                <div className="flex flex-col gap-1 mb-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><FiHome className="text-indigo-500"/> {h.city}</p>
                  <p className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.1em] flex items-center gap-1.5">
                    <FiUsers className="w-3.5 h-3.5" /> {h.owner?.name || 'Egasi yo\'q'}
                  </p>
                  {h.owner?.phone && (
                    <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1.5">
                      <FiPhone className="w-3.5 h-3.5" /> {h.owner.phone}
                    </p>
                  )}
                </div>
                <div className="bg-white/40 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/50 dark:border-gray-700 mb-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Narxi / Kecha</p>
                  <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{new Intl.NumberFormat('uz-UZ').format(Number(h.pricePerNight || h.basePricePerNight || 0) || 0)} <span className="text-sm font-bold text-gray-500">UZS</span></p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-auto">
                <div className="flex gap-2">
                  <button onClick={() => navigate(`/hotel/${h._id}`)} className="flex-1 py-3 bg-white dark:bg-slate-800 rounded-xl text-sm font-bold shadow-sm border border-gray-100 dark:border-gray-700 hover:border-indigo-300 transition-all active:scale-95 text-gray-700 dark:text-gray-300">
                    Ko'rish
                  </button>
                  <button onClick={() => openEditHotel(h)} className="w-12 h-12 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all active:scale-95">
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteHotel(h._id)} disabled={actionLoading === h._id + '_del'} className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all active:scale-95">
                    <FiTrash2 className="w-4 h-4"/>
                  </button>
                </div>
                {!h.approved && (
                  <button onClick={() => handleApproveHotel(h._id)} disabled={actionLoading === h._id} className="w-full btn-primary py-3 rounded-xl text-sm font-bold mt-1 shadow-lg bg-emerald-600 hover:bg-emerald-700 text-white border-none">
                    Tasdiqlash
                  </button>
                )}
              </div>
            </div>
          ))}
          {hotels.length === 0 && (
            <div className="col-span-full py-24 text-center glass-panel">
              <p className="text-lg font-bold text-gray-500">Mehmonxonalar yo'q.</p>
            </div>
          )}
        </div>
        </>
      )}

      {/* BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b._id} className="glass-panel p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden group hover:shadow-lg transition-all">
              <div className={`absolute left-0 top-0 bottom-0 w-2 ${b.status === 'confirmed' ? 'bg-gradient-to-b from-green-400 to-green-600' : b.status === 'cancelled' ? 'bg-gradient-to-b from-red-400 to-red-600' : 'bg-gradient-to-b from-yellow-400 to-yellow-600'}`} />
              
              <div className="flex-1 pl-4 flex flex-col sm:flex-row gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <FiCalendar className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors">{b.hotel?.name || 'Noma\'lum Mehmonxona'}</h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><FiUsers className="w-4 h-4"/> {b.user?.name || 'Mijoz o\'chirilgan'}</span>
                    <span>•</span>
                    <span className="text-xs">{b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '—'} <span className="mx-1">→</span> {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '—'}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    b.status === 'confirmed' ? 'bg-green-100 text-green-700 border border-green-200' :
                    b.status === 'cancelled' ? 'bg-red-100 text-red-700 border border-red-200' :
                    'bg-yellow-100 text-yellow-700 border border-yellow-200'
                  }`}>
                    {b.status === 'pending' ? 'Kutilmoqda' : b.status}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4 shrink-0">
                <div className="bg-white/50 dark:bg-slate-900/50 p-5 rounded-2xl border border-white/60 dark:border-gray-700 md:text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">To'lov miqdori</p>
                  <p className="text-2xl font-black text-gray-900 dark:text-white">{new Intl.NumberFormat('uz-UZ').format(b.totalPrice || 0)} <span className="text-sm">UZS</span></p>
                </div>
                
                {b.status !== 'cancelled' && (
                  <div className="flex gap-2">
                    {b.status === 'pending' && (
                      <button 
                        onClick={() => handleBookingAction(b._id, 'confirm')}
                        disabled={actionLoading === b._id + '_confirm'}
                        className="w-12 h-12 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200 transition-all active:scale-90"
                        title="Tasdiqlash"
                      >
                        <FiCheck className="w-5 h-5" />
                      </button>
                    )}
                    <button 
                      onClick={() => handleBookingAction(b._id, 'cancel')}
                      disabled={actionLoading === b._id + '_cancel'}
                      className="w-12 h-12 flex items-center justify-center bg-rose-100 text-rose-600 rounded-xl hover:bg-rose-200 transition-all active:scale-90"
                      title="Bekor qilish"
                    >
                      <FiXCircle className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="py-24 text-center glass-panel">
              <p className="text-lg font-bold text-gray-500">Bronlar mavjud emas.</p>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {addUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="glass-panel p-8 w-full max-w-md shadow-2xl relative overflow-hidden" style={{ animation: 'float 0.4s ease-out' }}>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Yangi Qoshish</h2>
              <button onClick={() => setAddUser(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {addError && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm font-bold mb-6 border border-red-100 relative z-10">{addError}</div>}
            <div className="space-y-5 relative z-10">
              {[
                { label: 'Ism', key: 'name', type: 'text', placeholder: 'Ism Familiya' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Telefon', key: 'phone', type: 'tel', placeholder: '+998 90 123 45 67' },
                { label: 'Parol', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={addForm[f.key]}
                    onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
                  />
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Rol</label>
                <select
                  value={addForm.role}
                  onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
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
              className="w-full btn-primary py-4 rounded-2xl font-black text-base mt-8 shadow-lg active:scale-95 transition-all text-center flex justify-center"
            >
              {addLoading ? 'Qo\'shilmoqda...' : 'Foydalanuvchi Qo\'shish'}
            </button>
          </div>
        </div>
      )}

      {/* Add Hotel Modal */}
      {addHotel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="glass-panel p-8 w-full max-w-md shadow-2xl relative overflow-hidden" style={{ animation: 'float 0.4s ease-out' }}>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mehmonxona Qo'shish</h2>
              <button onClick={() => setAddHotel(false)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {addHotelError && <div className="bg-red-50 text-red-600 rounded-xl px-4 py-3 text-sm font-bold mb-6 border border-red-100 relative z-10">{addHotelError}</div>}
            <div className="space-y-5 relative z-10">
              {[
                { label: 'Mehmonxona nomi', key: 'name', type: 'text', placeholder: 'Registon Plaza' },
                { label: 'Tavsif', key: 'description', type: 'textarea', placeholder: 'Mehmonxona haqida...' },
                { label: 'Shahar', key: 'city', type: 'text', placeholder: 'Samarqand' },
                { label: 'Manzil', key: 'address', type: 'text', placeholder: 'Registon maydoni 1' },
                { label: 'Narx (UZS)', key: 'pricePerNight', type: 'number', placeholder: '500000' },
                { label: 'Xonalar soni', key: 'roomsAvailable', type: 'number', placeholder: '10' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">{f.label}</label>
                  {f.type === 'textarea' ? (
                    <textarea
                      placeholder={f.placeholder}
                      value={addHotelForm[f.key]}
                      onChange={e => setAddHotelForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all resize-none"
                      rows={3}
                    />
                  ) : (
                    <input
                      type={f.type}
                      placeholder={f.placeholder}
                      value={addHotelForm[f.key]}
                      onChange={e => setAddHotelForm(p => ({ ...p, [f.key]: e.target.value }))}
                      className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
                    />
                  )}
                </div>
              ))}
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Egasi</label>
                <select
                  value={addHotelForm.owner}
                  onChange={e => setAddHotelForm(p => ({ ...p, owner: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
                >
                  <option value="">Egani tanlang</option>
                  {users.filter(u => u.role === 'HOTEL_OWNER').map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleAddHotel}
              disabled={addHotelLoading || !addHotelForm.name || !addHotelForm.description || !addHotelForm.city || !addHotelForm.pricePerNight || !addHotelForm.roomsAvailable || !addHotelForm.owner}
              className="w-full btn-primary py-4 rounded-2xl font-black text-base mt-8 shadow-lg active:scale-95 transition-all text-center flex justify-center"
            >
              {addHotelLoading ? 'Qo\'shilmoqda...' : 'Mehmonxona Qo\'shish'}
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="glass-panel p-8 w-full max-w-md shadow-2xl relative overflow-hidden" style={{ animation: 'float 0.4s ease-out' }}>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Tahrirlash</h2>
              <button onClick={() => setEditUser(null)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Ism</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Telefon</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
                />
              </div>
              <div className="flex items-center justify-between p-1">
                <label className="text-[13px] font-bold text-gray-600 dark:text-gray-300">Bloklash holati</label>
                <button 
                  onClick={() => setEditForm(p => ({ ...p, blocked: !p.blocked }))}
                  className={`w-14 h-8 rounded-full transition-all relative ${editForm.blocked ? 'bg-rose-500' : 'bg-emerald-500'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${editForm.blocked ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Rol</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] transition-all"
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
              className="w-full btn-primary py-4 rounded-2xl font-black text-base mt-8 shadow-lg active:scale-95 transition-all text-center flex justify-center"
            >
              {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </div>
      )}

      {/* Edit Hotel Modal */}
      {editHotel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel p-8 w-full max-w-2xl my-8 shadow-2xl relative overflow-hidden" style={{ animation: 'float 0.4s ease-out' }}>
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Mehmonxonani Tahrirlash</h2>
              <button onClick={() => setEditHotel(null)} className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative z-10">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Nomi</label>
                <input
                  type="text"
                  value={editHotelForm.name}
                  onChange={e => setEditHotelForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Tavsif</label>
                <textarea
                  value={editHotelForm.description}
                  onChange={e => setEditHotelForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all resize-none text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Shahar</label>
                <input
                  type="text"
                  value={editHotelForm.city}
                  onChange={e => setEditHotelForm(p => ({ ...p, city: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Manzil</label>
                <input
                  type="text"
                  value={editHotelForm.address}
                  onChange={e => setEditHotelForm(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Narx (UZS)</label>
                <input
                  type="number"
                  value={editHotelForm.basePricePerNight}
                  onChange={e => setEditHotelForm(p => ({ ...p, basePricePerNight: e.target.value }))}

                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Kategoriya</label>
                <select
                  value={editHotelForm.category}
                  onChange={e => setEditHotelForm(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                >
                  <option value="hotel">Mehmonxona</option>
                  <option value="resort">Resort</option>
                  <option value="hostel">Hostel</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1.5 pl-1">Egasi</label>
                <select
                  value={editHotelForm.owner}
                  onChange={e => setEditHotelForm(p => ({ ...p, owner: e.target.value }))}
                  className="w-full px-5 py-3.5 bg-gray-50/80 dark:bg-slate-900/50 border border-gray-200 dark:border-gray-700 rounded-2xl font-bold outline-none focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                >
                  {users.filter(u => u.role === 'HOTEL_OWNER').map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSaveHotel}
              disabled={editHotelLoading}
              className="w-full btn-primary py-4 rounded-2xl font-black text-base mt-8 shadow-lg active:scale-95 transition-all text-center flex justify-center border-none text-white"
            >
              {editHotelLoading ? 'Saqlanmoqda...' : 'O\'zgarishlarni Saqlash'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;