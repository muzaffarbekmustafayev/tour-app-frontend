import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import Loader from '../components/Loader';
import { 
  FiHeart, FiHome, FiSettings, 
  FiSun, FiMoon, FiLogOut, FiChevronRight,
  FiUser, FiShield, FiCalendar
} from 'react-icons/fi';

const Profile = () => {
  const { user, logout, darkMode, setDarkMode } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then(res => { setProfileData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  if (loading) return <div className="h-[100dvh] flex items-center justify-center bg-slate-50 dark:bg-slate-900"><Loader message="Profil yuklanmoqda" /></div>;

  const profile = profileData || user;
  
  const roleColors = {
    ADMIN: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
    HOTEL_OWNER: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
    CUSTOMER: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
    GUEST: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400',
  };
  const roleLabels = { ADMIN: 'Administrator', HOTEL_OWNER: 'Mehmonxona egasi', CUSTOMER: 'Mijoz', GUEST: 'Mehmon' };

  const menuItems = [
    { icon: <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 text-rose-500"><FiHeart className="w-5 h-5"/></div>, label: 'Sevimlilar', path: '/favorites', roles: ['CUSTOMER', 'ADMIN'] },
    { icon: <div className="p-2 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-500"><FiHome className="w-5 h-5"/></div>, label: 'Mehmonxonalarim', path: '/owner', roles: ['HOTEL_OWNER'] },
    { icon: <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-500"><FiSettings className="w-5 h-5"/></div>, label: 'Admin Panel', path: '/admin', roles: ['ADMIN'] },
  ].filter(item => !item.roles || item.roles.includes(profile?.role));

  const stats = [
    { icon: <FiCalendar className="w-4 h-4 text-slate-400"/>, label: "A'zolik yili", value: profile?.createdAt ? new Date(profile.createdAt).getFullYear() : '—' },
    { icon: <FiShield className="w-4 h-4 text-slate-400"/>, label: 'Holat', value: profile?.blocked ? 'Bloklangan' : 'Faol' },
    { icon: <FiUser className="w-4 h-4 text-slate-400"/>, label: 'Rol', value: roleLabels[profile?.role] || 'Mehmon' },
  ];

  return (
    <div className="h-[100dvh] w-full bg-slate-50 dark:bg-[#0B1120] animate-fade-in flex justify-center overflow-hidden">
      
      <div className="w-full flex flex-col h-full px-5 py-4 pt-6 md:pt-8 bg-slate-50 dark:bg-[#0B1120] max-w-md">
        
        {/* Navigation / Header */}
        <div className="flex items-center flex-shrink-0 w-full mb-6 relative">
           <div className="absolute left-0"><BackButton /></div>
           <h1 className="w-full text-center text-lg md:text-xl font-bold text-slate-900 dark:text-white">Profil sozlamalari</h1>
        </div>

        {/* Profile Info Header */}
        <div className="flex flex-col items-center justify-center flex-shrink-0 mb-8">
           <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl font-black text-slate-700 dark:text-slate-300 mb-4 shadow-sm border-[4px] border-white dark:border-[#0f172a]">
             {profile?.name?.[0]?.toUpperCase() || '?'}
           </div>
           <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">{profile?.name || 'Foydalanuvchi'}</h2>
           <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{profile?.phone || profile?.email || "Aloqa ma'lumoti kiritilmagan"}</p>
           <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest ${roleColors[profile?.role] || roleColors.GUEST}`}>
             {roleLabels[profile?.role] || 'Mehmon'}
           </span>
        </div>

        {/* Stats Section (Classic row format) */}
        <div className="flex-shrink-0 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 flex divide-x divide-slate-100 dark:divide-slate-800 mb-6">
          {stats.map((stat, idx) => (
             <div key={idx} className="flex-1 py-3 md:py-4 flex flex-col items-center justify-center">
                <div className="flex items-center gap-1.5 mb-1.5">
                   {stat.icon}
                   <span className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{stat.label}</span>
                </div>
                <span className="text-sm md:text-base font-bold text-slate-900 dark:text-white">{stat.value}</span>
             </div>
          ))}
        </div>

        {/* Options / Settings List */}
        <div className="flex-1 flex flex-col overflow-y-auto hide-scrollbar pb-6 space-y-6">
           
           {/* Section 1: Menu Items */}
           {menuItems.length > 0 && (
             <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {menuItems.map((item, idx) => (
                  <Link key={idx} to={item.path} className="flex items-center px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100 dark:active:bg-slate-800">
                    {item.icon}
                    <span className="ml-3 flex-1 font-semibold text-sm md:text-base text-slate-900 dark:text-white">{item.label}</span>
                    <FiChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </Link>
                ))}
             </div>
           )}

           {/* Section 2: Preferences */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
              <button onClick={() => setDarkMode(!darkMode)} className="w-full flex items-center px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-100 dark:active:bg-slate-800">
                <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {darkMode ? <FiSun className="w-5 h-5" /> : <FiMoon className="w-5 h-5" />}
                </div>
                <span className="ml-3 flex-1 text-left font-semibold text-sm md:text-base text-slate-900 dark:text-white">
                  Tungi Rejim
                </span>
                <div className={`w-12 h-7 rounded-full p-[3px] transition-colors ${darkMode ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                   <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-[20px]' : 'translate-x-0'}`}></div>
                </div>
              </button>
           </div>
           
           {/* Section 3: Logout Action */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800 overflow-hidden">
              <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-4 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors active:bg-rose-100 dark:active:bg-rose-900/20 text-rose-500 font-bold text-sm md:text-base">
                 <FiLogOut className="w-5 h-5" />
                 Tizimdan chiqish
              </button>
           </div>
           
        </div>

      </div>
    </div>
  );
};

export default Profile;
