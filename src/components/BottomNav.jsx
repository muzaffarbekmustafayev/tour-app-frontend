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
      { path: '/', label: 'Asosiy', icon: <FiHome /> },
      { path: '/search', label: 'Qidirish', icon: <FiSearch /> },
      { path: '/login', label: 'Kirish', icon: <FiUser /> },
    ],
    CUSTOMER: [
      { path: '/search', label: 'Qidirish', icon: <FiSearch /> },
      { path: '/bookings', label: 'Bronlar', icon: <FiFileText /> },
      { path: '/favorites', label: 'Sevimli', icon: <FiHeart /> },
      { path: '/profile', label: 'Profil', icon: <FiUser /> },
    ],
    HOTEL_OWNER: [
      { path: '/owner', label: 'Mehmonxonalarim', icon: <FiBriefcase /> },
      { path: '/search', label: 'Qidirish', icon: <FiSearch /> },
      { path: '/bookings', label: 'Bronlar', icon: <FiFileText /> },
      { path: '/profile', label: 'Profil', icon: <FiUser /> },
    ],
    ADMIN: [
      { path: '/admin', tab: 'overview', label: 'Statistika', icon: <FiBarChart2 /> },
      { path: '/admin', tab: 'hotels', label: 'Hotellar', icon: <FiBriefcase /> },
      { path: '/admin', tab: 'users', label: 'Userlar', icon: <FiUsers /> },
      { path: '/admin', tab: 'bookings', label: 'Tranzak.', icon: <FiFileText /> },
      { path: '/profile', label: 'Admin', icon: <FiSettings /> },
    ],
  };

  const navItems = NAV_ITEMS[role] || NAV_ITEMS.GUEST;

  return (
    <nav className="bottom-nav">
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
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{item.icon}</span>
            <span style={{
              fontSize: '9px',
              fontWeight: 700,
              marginTop: '3px',
              letterSpacing: '0.02em',
              opacity: isActive ? 1 : 0.75,
              whiteSpace: 'nowrap',
            }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
