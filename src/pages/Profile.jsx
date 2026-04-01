import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { 
  FiCalendar, FiHeart, FiHome, FiSettings, 
  FiSun, FiMoon, FiLogOut, FiChevronRight,
  FiCheckCircle, FiLock
} from 'react-icons/fi';

const Profile = () => {
  const { user, logout, darkMode, setDarkMode } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me').then(res => { setProfileData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader message="Profil yuklanmoqda" /></div>;

  const profile = profileData || user;
  const roleColors = {
    ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    HOTEL_OWNER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    CUSTOMER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    GUEST: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };
  const roleLabels = { ADMIN: 'Administrator', HOTEL_OWNER: 'Mehmonxona egasi', CUSTOMER: 'Mijoz', GUEST: 'Mehmon' };

  const menuItems = [
    { icon: <FiHeart className="text-red-500 w-5 h-5" />, label: 'Sevimlilar', path: '/favorites', roles: ['CUSTOMER', 'ADMIN'] },
    { icon: <FiHome className="text-emerald-500 w-5 h-5" />, label: 'Mehmonxonalarim', path: '/owner', roles: ['HOTEL_OWNER'] },
    { icon: <FiSettings className="text-gray-500 dark:text-gray-400 w-5 h-5" />, label: 'Admin panel', path: '/admin', roles: ['ADMIN'] },
  ].filter(item => !item.roles || item.roles.includes(profile?.role));

  return (
    <div className="pb-28 pt-4 px-4 max-w-md mx-auto min-h-screen">
      <div className="mb-4"><BackButton /></div>
      <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2rem] p-6 mb-6 overflow-hidden shadow-xl shadow-blue-200 dark:shadow-none">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full translate-x-10 -translate-y-10" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -translate-x-6 translate-y-6" />
        <div className="relative z-10 flex items-center space-x-4 mb-5">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-2xl font-black text-white shadow-lg flex-shrink-0">
            {profile?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-black text-white truncate">{profile?.name || 'Foydalanuvchi'}</h1>
            <p className="text-blue-100 text-sm truncate">{profile?.email}</p>
            <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${roleColors[profile?.role] || roleColors.GUEST}`}>
              {roleLabels[profile?.role] || 'Mehmon'}
            </span>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-3">
          {[
            { label: "A'zo bo'lgan", value: profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '—' },
            { label: 'Holat', value: <span className="flex items-center justify-center gap-1">{profile?.blocked ? <><FiLock className="text-red-400 w-3 h-3"/> Bloklangan</> : <><FiCheckCircle className="text-green-400 w-3 h-3"/> Faol</>}</span> },
            { label: 'Rol', value: roleLabels[profile?.role] || 'Mehmon' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/10 p-3 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-white font-black text-sm">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {menuItems.length > 0 && (
        <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden mb-4 shadow-sm">
          {menuItems.map((item, idx) => (
            <Link key={item.path} to={item.path} className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors ${idx > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}`}>
              <div className="flex items-center space-x-4">
                <span className="text-xl">{item.icon}</span>
                <span className="font-bold text-gray-900 dark:text-white">{item.label}</span>
              </div>
              <FiChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          ))}
        </div>
      )}

      <div className="bg-white dark:bg-[#1e293b] rounded-[2rem] border border-gray-100 dark:border-gray-800 overflow-hidden mb-4 shadow-sm">
        <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <div className="flex items-center space-x-4">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800">
              {darkMode ? <FiSun className="w-4 h-4 text-yellow-500" /> : <FiMoon className="w-4 h-4 text-indigo-500" />}
            </span>
            <span className="font-bold text-gray-900 dark:text-white">{darkMode ? 'Kunduzgi rejim' : 'Tungi rejim'}</span>
          </div>
          <div className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-blue-600' : 'bg-gray-200'} relative`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${darkMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
        </button>
      </div>

      <button onClick={handleLogout} className="w-full bg-white dark:bg-[#1e293b] text-red-500 font-bold py-4 rounded-[2rem] border border-red-100 dark:border-red-900/30 flex items-center justify-center space-x-3 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors shadow-sm">
        <FiLogOut className="w-5 h-5" />
        <span>Chiqish</span>
      </button>

      <p className="text-center text-xs text-gray-400 mt-6 font-medium">NavaiTour v1.0.0</p>
    </div>
  );
};

export default Profile;
