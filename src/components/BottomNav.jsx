import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FiHome, FiSearch, FiFileText, FiHeart, FiUser,
  FiBriefcase, FiBarChart2, FiUsers, FiSettings
} from 'react-icons/fi';

const BottomNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const role = user?.role || 'GUEST';

  const NAV_ITEMS = {
    GUEST: [
      { path: '/', label: 'Bosh sahifa', icon: <FiHome className="w-6 h-6" /> },
      { path: '/search', label: 'Barcha Joylar', icon: <FiSearch className="w-6 h-6" /> },
      { path: '/login', label: 'Tizimga Kirish', icon: <FiUser className="w-6 h-6" /> },
    ],
    CUSTOMER: [
      // { path: '/', label: 'Asosiy', icon: <FiHome className="w-6 h-6" /> },
      { path: '/search', label: 'Joy Qidirish', icon: <FiSearch className="w-6 h-6" /> },
      { path: '/bookings', label: 'Mening Bronlarim', icon: <FiFileText className="w-6 h-6" /> },
      { path: '/favorites', label: 'Sevimlilarim', icon: <FiHeart className="w-6 h-6" /> },
      { path: '/profile', label: 'Shaxsiy Profil', icon: <FiUser className="w-6 h-6" /> },
    ],
    HOTEL_OWNER: [
      // { path: '/', label: 'Sayt Bosh Sahifasi', icon: <FiHome className="w-6 h-6" /> },
      { path: '/owner', label: 'Mening Mehmonxonalarim', icon: <FiBriefcase className="w-6 h-6" /> },
      { path: '/search', label: 'Qidirish', icon: <FiSearch className="w-6 h-6" /> },
      { path: '/bookings', label: 'Mijozlar Bronlari', icon: <FiFileText className="w-6 h-6" /> },
      { path: '/profile', label: 'Boshqaruv Profili', icon: <FiUser className="w-6 h-6" /> },
    ],
    ADMIN: [
      { path: '/admin', tab: 'overview', label: 'Statistika', icon: <FiBarChart2 className="w-6 h-6" /> },
      { path: '/admin', tab: 'hotels', label: 'Barcha Hotellar', icon: <FiBriefcase className="w-6 h-6" /> },
      { path: '/admin', tab: 'users', label: 'Foydalanuvchilar', icon: <FiUsers className="w-6 h-6" /> },
      { path: '/admin', tab: 'bookings', label: 'Tranzaksiyalar', icon: <FiFileText className="w-6 h-6" /> },
      { path: '/profile', label: 'Admin Profili', icon: <FiSettings className="w-6 h-6" /> },
    ],
  };

  const navItems = NAV_ITEMS[role] || NAV_ITEMS.GUEST;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-800 flex justify-around items-center h-[72px] z-[100] pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-none">
      {navItems.map((item, i) => {
        let isActive = false;
        if (item.tab !== undefined) {
          const currentTab = new URLSearchParams(location.search).get('tab');
          if (item.tab === 'overview') isActive = location.pathname === item.path && (!currentTab || currentTab === 'overview');
          else isActive = location.pathname === item.path && currentTab === item.tab;
        } else {
          isActive = location.pathname === item.path;
        }

        return (
          <Link
            key={i}
            to={item.tab ? `${item.path}?tab=${item.tab}` : item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
          >
            <div className={`transition-transform duration-300 relative ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
              {item.icon}
              {isActive && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />}
            </div>
            <span className={`text-[9px] mt-1 transition-all text-center leading-tight px-1 ${isActive ? 'opacity-100' : 'opacity-80'}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
