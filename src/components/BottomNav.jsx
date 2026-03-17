import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const SearchIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const BookingIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const FavIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;
const ProfileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const HotelIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 22V8l9-6 9 6v14"/><path d="M9 22v-4h6v4"/><path d="M9 12h.01M15 12h.01"/></svg>;
const StatsIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>;
const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const NAV_ITEMS = {
  GUEST: [
    { path: '/', label: 'Bosh sahifa', icon: <HomeIcon /> },
    { path: '/search', label: 'Qidirish', icon: <SearchIcon /> },
    { path: '/login', label: 'Kirish', icon: <ProfileIcon /> },
  ],
  CUSTOMER: [
    { path: '/', label: 'Bosh sahifa', icon: <HomeIcon /> },
    { path: '/search', label: 'Qidirish', icon: <SearchIcon /> },
    { path: '/bookings', label: 'Bronlar', icon: <BookingIcon /> },
    { path: '/favorites', label: 'Sevimli', icon: <FavIcon /> },
    { path: '/profile', label: 'Profil', icon: <ProfileIcon /> },
  ],
  HOTEL_OWNER: [
    { path: '/', label: 'Bosh sahifa', icon: <HomeIcon /> },
    { path: '/owner', label: 'Mehmonxona', icon: <HotelIcon /> },
    { path: '/search', label: 'Qidirish', icon: <SearchIcon /> },
    { path: '/profile', label: 'Profil', icon: <ProfileIcon /> },
  ],
  ADMIN: [
    { path: '/admin', label: 'Statistika', icon: <StatsIcon /> },
    { path: '/admin', label: 'Hotellar', icon: <HotelIcon />, tab: 'hotels' },
    { path: '/admin', label: 'Foydalanuvchi', icon: <UsersIcon />, tab: 'users' },
    { path: '/admin', label: 'Bronlar', icon: <BookingIcon />, tab: 'bookings' },
    { path: '/profile', label: 'Profil', icon: <ProfileIcon /> },
  ],
};

const BottomNav = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const role = user?.role || 'GUEST';
  const navItems = NAV_ITEMS[role] || NAV_ITEMS.GUEST;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1e293b] border-t border-gray-200 dark:border-gray-700 flex justify-around items-center h-16 z-50">
      {navItems.map((item, i) => {
        const isActive = location.pathname === item.path &&
          (!item.tab || new URLSearchParams(location.search).get('tab') === item.tab) &&
          (!item.tab && item.path === '/admin' ? !new URLSearchParams(location.search).get('tab') : true);
        return (
          <Link
            key={i}
            to={item.tab ? `${item.path}?tab=${item.tab}` : item.path}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
              isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[10px] font-medium mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
