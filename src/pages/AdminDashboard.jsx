import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { 
  FiUsers, FiCalendar, FiHome, FiDollarSign, FiAward, 
  FiTrendingUp, FiPlus, FiEdit2, FiUnlock, FiLock, 
  FiTrash2, FiArrowLeft, FiX, FiInfo
} from 'react-icons/fi';

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
  const [addForm, setAddForm] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
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
    setEditForm({ name: u.name, email: u.email, role: u.role });
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

  const handleApproveHotel = async (hotelId) => {
    setActionLoading(hotelId);
    try {
      const res = await api.patch(`/hotels/${hotelId}/approve`);
      setHotels(prev => prev.map(h => h._id === hotelId ? { ...h, approved: true } : h));
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'users', label: '👥 Users' },
    { key: 'hotels', label: '🏨 Hotels' },
    { key: 'bookings', label: '📋 Bookings' },
  ];

  if (loading) return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <div key={i} className="h-36 bg-gray-200 dark:bg-slate-800 animate-pulse rounded-3xl" />)}
      </div>
    </div>
  );

  return (
    <div className="pb-24 pt-4 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center mb-6">
        <button onClick={() => navigate(-1)} className="mr-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 dark:hover:bg-slate-700 transition">
          <FiArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Admin Dashboard</h1>
          <p className="text-gray-500 font-medium">Platform management & monitoring</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto hide-scrollbar pb-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => navigate(tab.key === 'overview' ? '/admin' : `/admin?tab=${tab.key}`)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300'
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
              { label: 'Umumiy Foydalanuvchilar', value: stats.totalUsers, color: 'from-blue-600 to-indigo-800', lightColor: 'text-blue-200', icon: <FiUsers className="w-full h-full p-2.5" /> },
              { label: 'Barcha Bronlar', value: stats.totalBookings, color: 'from-purple-600 to-fuchsia-800', lightColor: 'text-purple-200', icon: <FiCalendar className="w-full h-full p-2.5" /> },
              { label: 'Aktiv Mehmonxonalar', value: stats.totalHotels, color: 'from-orange-500 to-red-700', lightColor: 'text-orange-200', icon: <FiHome className="w-full h-full p-2.5" /> },
              { label: 'Jami Daromad', value: new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(stats.totalRevenue || 0) + ' UZS', color: 'from-emerald-500 to-teal-800', lightColor: 'text-emerald-200', icon: <FiDollarSign className="w-full h-full p-2.5" /> },
            ].map((stat, i) => (
              <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-[2rem] text-white shadow-xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-white/20">
                      {stat.icon}
                    </div>
                  </div>
                  <div>
                    <p className={`text-[11px] font-black uppercase tracking-widest ${stat.lightColor} mb-1 drop-shadow-sm`}>{stat.label}</p>
                    <h3 className="text-4xl font-black drop-shadow-md">{stat.value}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Hotels Section */}
            {stats.topHotels && stats.topHotels.length > 0 && (
              <div className="lg:col-span-1 bg-white dark:bg-[#1e293b] rounded-[2rem] p-7 border border-gray-100 dark:border-gray-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                <h2 className="text-xl font-black mb-6 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm"><FiAward className="w-4 h-4" /></span>
                  Eng zo'r mehmonxonalar
                </h2>
                <div className="space-y-4">
                  {stats.topHotels.map((h, i) => (
                    <div key={h._id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/50 transition hover:border-blue-200 dark:hover:border-blue-800">
                      <div className="flex items-center space-x-4 mb-2 sm:mb-0">
                        <div className={`w-8 h-8 flex flex-shrink-0 items-center justify-center rounded-full font-black text-xs ${i === 0 ? 'bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-200 dark:shadow-none' : i === 1 ? 'bg-gray-300 text-gray-800' : 'bg-orange-100 text-orange-800'}`}>
                          #{i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white leading-tight">{h.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase font-black">{h.city}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:ml-4 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm">
                        <span className="text-yellow-400 text-xs">★</span>
                        <span className="font-black text-gray-900 dark:text-white text-sm">{h.rating?.toFixed(1) || '—'}</span>
                        <span className="text-[10px] text-gray-400 whitespace-nowrap">({h.reviewsCount || 0} sharh)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Bookings Chart Placeholder */}
            {stats.monthlyBookings && stats.monthlyBookings.length > 0 && (
              <div className="lg:col-span-2 bg-white dark:bg-[#1e293b] rounded-[2rem] p-7 border border-gray-100 dark:border-gray-800 shadow-sm h-full flex flex-col">
                <h2 className="text-xl font-black mb-6 text-gray-900 dark:text-white flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 w-8 h-8 rounded-full flex items-center justify-center mr-3 text-sm"><FiTrendingUp className="w-4 h-4" /></span>
                  Oylik bronlar sathi
                </h2>
                <div className="flex-1 flex items-end gap-3 px-2 pb-2 h-48 border-b-2 border-gray-100 dark:border-gray-800 relative">
                  {stats.monthlyBookings.map((m, idx) => {
                    const max = Math.max(...stats.monthlyBookings.map(x => x.count), 1);
                    const heightPercent = (m.count / max) * 100;
                    return (
                      <div key={m.label} className="group flex-1 flex flex-col items-center justify-end relative h-full">
                        <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-black px-2 py-1 rounded-md z-10">
                          {m.count} ta
                        </div>
                        <div
                          className={`w-full max-w-[40px] rounded-t-xl transition-all duration-700 ${idx === stats.monthlyBookings.length - 1 ? 'bg-gradient-to-t from-blue-600 to-indigo-400 shadow-lg shadow-blue-200 dark:shadow-none' : 'bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600'}`}
                          style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                        />
                        <span className="absolute -bottom-6 text-[10px] text-gray-500 font-bold tracking-widest uppercase">{m.label.slice(5)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-3xl p-6 text-sm font-semibold flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            Statistikani yuklashda xatolik yuz berdi. Backend tizimi ishlayotganini tekshiring.
          </div>
        )
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="animate-fade-in bg-white dark:bg-[#1e293b] rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white">Foydalanuvchilarni Boshqarish</h2>
              <p className="text-sm font-medium text-gray-500 mt-1">Jami {users.length} ta ro'yxatdan o'tgan foydalanuvchilar mavjud</p>
            </div>
            <button
              onClick={() => { setAddUser(true); setAddError(''); setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER' }); }}
              className="flex items-center space-x-2 bg-blue-600 text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95"
            >
              <FiPlus className="w-5 h-5" />
              <span>Yangi Qoshish</span>
            </button>
          </div>
          
          <div className="flex-1 w-full overflow-x-auto">
            <div className="min-w-[800px] w-full divide-y divide-gray-100 dark:divide-gray-800">
              {users.map(u => (
                <div key={u._id} className="group flex items-center justify-between p-5 md:px-8 hover:bg-blue-50/50 dark:hover:bg-slate-800/40 transition-colors duration-300">
                  <div className="flex items-center w-1/3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-sm border-2 border-white dark:border-slate-800 z-10 relative">
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 z-20 ${u.blocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                    </div>
                    <div className="ml-4">
                      <p className="font-bold text-gray-900 dark:text-white text-[15px]">{u.name}</p>
                      <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{u.email}</p>
                    </div>
                  </div>

                  <div className="w-1/4 flex items-center px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                      u.role === 'HOTEL_OWNER' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                      'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'
                    }`}>
                      {u.role}
                    </span>
                  </div>
                  
                  <div className="w-1/4 px-4 flex justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2">
                       <button
                        onClick={() => openEditUser(u)}
                        title="Tahrirlash"
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleBlockUser(u._id)}
                        disabled={actionLoading === u._id}
                        title={u.blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                          u.blocked
                            ? 'bg-red-50 text-red-600 hover:bg-green-50 hover:text-green-600 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-green-900/20 dark:hover:text-green-400'
                            : 'bg-green-50 text-green-600 hover:bg-red-50 hover:text-red-600 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-red-900/20 dark:hover:text-red-400'
                        } ${actionLoading === u._id ? 'opacity-50 cursor-wait' : ''}`}
                      >
                         {u.blocked ? <FiUnlock className="w-4 h-4" /> : <FiLock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u._id)}
                        disabled={actionLoading === u._id + '_del'}
                        title="O'chirish"
                        className={`w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-600 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors ${actionLoading === u._id + '_del' ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <FiInfo className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Foydalanuvchilar yo'q</h3>
                  <p className="text-gray-500 text-sm mt-1">Hozircha tizimda foydalanuvchilar mavjud emas.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HOTELS */}
      {activeTab === 'hotels' && (
        <div className="space-y-4">
          {hotels.map(h => (
            <div key={h._id} className="bg-white dark:bg-[#1e293b] rounded-3xl p-5 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">{h.name}</h3>
                <p className="text-sm text-gray-500">{h.city} · {h.stars}★ · {new Intl.NumberFormat('uz-UZ').format(h.pricePerNight)} UZS/night</p>
                <p className="text-xs text-gray-400">Owner: {h.owner?.name || '—'} ({h.owner?.email || '—'})</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${h.approved ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                  {h.approved ? 'Approved' : 'Pending'}
                </span>
                {!h.approved && (
                  <button
                    onClick={() => handleApproveHotel(h._id)}
                    disabled={actionLoading === h._id}
                    className={`bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform ${actionLoading === h._id ? 'opacity-50' : ''}`}
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => navigate(`/hotel/${h._id}`)}
                  className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition"
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteHotel(h._id)}
                  disabled={actionLoading === h._id + '_del'}
                  className={`bg-red-50 dark:bg-red-900/20 text-red-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition ${actionLoading === h._id + '_del' ? 'opacity-50' : ''}`}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {hotels.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500">No hotels in the system.</p>
            </div>
          )}
        </div>
      )}

      {/* BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b._id} className="bg-white dark:bg-[#1e293b] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">{b.hotel?.name || 'Hotel'} — {b.hotel?.city || ''}</p>
                <p className="text-xs text-gray-500">
                  Guest: {b.user?.name || '—'} · {b.user?.email || '—'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {b.checkInDate ? new Date(b.checkInDate).toLocaleDateString() : '—'} → {b.checkOutDate ? new Date(b.checkOutDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                  {new Intl.NumberFormat('uz-UZ').format(b.totalPrice || 0)} UZS
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800">
              <p className="text-gray-500">No bookings in the system.</p>
            </div>
          )}
        </div>
      )}

      {/* Yangi foydalanuvchi modali */}
      {addUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Yangi foydalanuvchi</h2>
              <button onClick={() => setAddUser(false)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 transition">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            {addError && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl px-4 py-2 text-sm font-semibold mb-4">{addError}</div>}
            <div className="space-y-4">
              {[
                { label: 'Ism', key: 'name', type: 'text', placeholder: 'Ism Familiya' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                { label: 'Parol', key: 'password', type: 'password', placeholder: '••••••••' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={addForm[f.key]}
                    onChange={e => setAddForm(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rol</label>
                <select
                  value={addForm.role}
                  onChange={e => setAddForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="HOTEL_OWNER">HOTEL_OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setAddUser(false)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition">
                Bekor qilish
              </button>
              <button
                onClick={handleAddUser}
                disabled={addLoading || !addForm.name || !addForm.email || !addForm.password}
                className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60 flex items-center justify-center"
              >
                {addLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tahrirlash modali */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Foydalanuvchini tahrirlash</h2>
              <button onClick={() => setEditUser(null)} className="p-2 bg-gray-100 dark:bg-slate-800 rounded-full hover:bg-gray-200 transition">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ism</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Rol</label>
                <select
                  value={editForm.role}
                  onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="HOTEL_OWNER">HOTEL_OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditUser(null)} className="flex-1 py-3 rounded-xl font-bold bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition">
                Bekor qilish
              </button>
              <button
                onClick={handleSaveUser}
                disabled={editLoading}
                className="flex-1 py-3 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white transition disabled:opacity-60 flex items-center justify-center"
              >
                {editLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />}
                Saqlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;