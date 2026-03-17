import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

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
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, color: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-200', icon: '👥' },
              { label: 'Total Bookings', value: stats.totalBookings, color: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-200', icon: '📋' },
              { label: 'Active Hotels', value: stats.totalHotels, color: 'from-orange-500 to-orange-700', shadow: 'shadow-orange-200', icon: '🏨' },
              { label: 'Revenue (UZS)', value: new Intl.NumberFormat('uz-UZ', { notation: 'compact' }).format(stats.totalRevenue || 0), color: 'from-emerald-500 to-emerald-700', shadow: 'shadow-emerald-200', icon: '💰' },
            ].map(stat => (
              <div key={stat.label} className={`bg-gradient-to-br ${stat.color} p-6 rounded-3xl text-white shadow-xl ${stat.shadow} dark:shadow-none relative overflow-hidden group`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-6 translate-x-6 group-hover:bg-white/20 transition-all" />
                <p className="text-3xl mb-1">{stat.icon}</p>
                <p className="text-3xl font-black mb-1">{stat.value}</p>
                <p className="text-sm font-bold opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>

          {stats.topHotels && stats.topHotels.length > 0 && (
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800 mb-6">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">🏆 Top Rated Hotels</h2>
              <div className="space-y-3">
                {stats.topHotels.map((h, i) => (
                  <div key={h._id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-black text-gray-300 dark:text-gray-600 w-6">#{i + 1}</span>
                      <span className="font-bold text-gray-900 dark:text-white">{h.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-yellow-500">★</span>
                      <span className="font-black text-gray-900 dark:text-white">{h.rating?.toFixed(1) || '—'}</span>
                      <span className="text-xs text-gray-400 ml-2">({h.reviewsCount || 0} reviews)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.monthlyBookings && stats.monthlyBookings.length > 0 && (
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">📅 Oylik bronlar</h2>
              <div className="flex items-end gap-2 h-32">
                {stats.monthlyBookings.map((m) => {
                  const max = Math.max(...stats.monthlyBookings.map(x => x.count), 1);
                  return (
                    <div key={m.label} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-[10px] font-bold text-gray-500">{m.count}</span>
                      <div
                        className="w-full bg-blue-500 rounded-t-lg"
                        style={{ height: `${(m.count / max) * 96}px` }}
                      />
                      <span className="text-[9px] text-gray-400 font-bold">{m.label.slice(5)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl p-5 text-sm font-semibold">
            Statistikani yuklashda xatolik. Backend ishlayotganini tekshiring.
          </div>
        )
      )}

      {/* USERS */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <h2 className="font-bold text-gray-900 dark:text-white">{users.length} ta foydalanuvchi</h2>
            <button
              onClick={() => { setAddUser(true); setAddError(''); setAddForm({ name: '', email: '', password: '', role: 'CUSTOMER' }); }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition active:scale-95"
            >
              + Yangi foydalanuvchi
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {users.map(u => (
              <div key={u._id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-black">
                    {u.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
                    {u.role}
                  </span>
                  <button
                    onClick={() => openEditUser(u)}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleBlockUser(u._id)}
                    disabled={actionLoading === u._id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      u.blocked
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'
                    } ${actionLoading === u._id ? 'opacity-50' : ''}`}
                  >
                    {u.blocked ? 'Faollashtirish' : 'Bloklash'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    disabled={actionLoading === u._id + '_del'}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-600 transition-colors ${actionLoading === u._id + '_del' ? 'opacity-50' : ''}`}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
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