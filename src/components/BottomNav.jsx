import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { APP_NAME } from '../config/app';
import {
  FiHome, FiSearch, FiHeart, FiUser, FiMap,
  FiBriefcase, FiBarChart2, FiSettings, FiLogIn, FiLogOut
} from 'react-icons/fi';

const NAV_ITEMS = {
  GUEST: [
    { path: '/',       label: 'Asosiy',   icon: FiHome },
    { path: '/search', label: 'Qidirish', icon: FiSearch },
    { path: '/map',    label: 'Xarita',   icon: FiMap },
    { path: '/login',  label: 'Kirish',   icon: FiLogIn },
  ],
  CUSTOMER: [
    { path: '/',          label: 'Asosiy',   icon: FiHome },
    { path: '/search',    label: 'Qidirish', icon: FiSearch },
    { path: '/map',       label: 'Xarita',   icon: FiMap },
    { path: '/favorites', label: 'Sevimli',  icon: FiHeart },
    { path: '/profile',   label: 'Profil',   icon: FiUser },
  ],
  HOTEL_OWNER: [
    { path: '/owner',   label: 'Hotellarim', icon: FiBriefcase },
    { path: '/search',  label: 'Qidirish',   icon: FiSearch },
    { path: '/map',     label: 'Xarita',     icon: FiMap },
    { path: '/profile', label: 'Profil',     icon: FiUser },
  ],
  ADMIN: [
    { path: '/admin', tab: 'overview', label: 'Statistika',       icon: FiBarChart2 },
    { path: '/admin', tab: 'hotels',   label: 'Hotellar',         icon: FiBriefcase },
    { path: '/map',                    label: 'Xarita',           icon: FiMap },
    { path: '/profile',                label: 'Admin',            icon: FiSettings },
  ],
};

/* ── Shared NavItem ── */
const NavItem = ({ item, active, inactiveColor, hoverBg, mobile = false }) => {
  const Icon = item.icon;
  const to   = item.tab ? `${item.path}?tab=${item.tab}` : item.path;

  if (mobile) {
    return (
      <Link
        to={to}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-[1.25rem] transition-all active:scale-90"
        style={{
          minWidth: 52,
          background: active ? 'var(--gradient-main)' : 'transparent',
          boxShadow: active ? 'var(--shadow-colored)' : 'none',
          transform: active ? 'translateY(-2px)' : 'none',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: active ? 'white' : 'var(--text-muted)' }} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.03em', color: active ? 'white' : 'var(--text-muted)', whiteSpace: 'nowrap', lineHeight: 1 }}>
          {item.label}
        </span>
      </Link>
    );
  }

  return (
    <Link
      to={to}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className="w-12 h-12 flex items-center justify-center rounded-2xl transition-all active:scale-90 hover:scale-105"
      style={{
        background: active ? 'var(--gradient-main)' : 'transparent',
        boxShadow: active ? 'var(--shadow-colored)' : 'none',
        color: active ? 'white' : 'var(--text-muted)',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <Icon style={{ width: 20, height: 20 }} />
    </Link>
  );
};

const BottomNav = () => {
  const { user, logout, darkMode } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const role     = user?.role || 'GUEST';
  const items    = NAV_ITEMS[role] || NAV_ITEMS.GUEST;

  const isActive = (item) => {
    if (item.tab !== undefined) {
      const tab = new URLSearchParams(location.search).get('tab');
      return item.tab === 'overview'
        ? location.pathname === item.path && (!tab || tab === 'overview')
        : location.pathname === item.path && tab === item.tab;
    }
    return location.pathname === item.path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* ── Mobile Bottom Nav (< md) ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 w-full z-[200] border-t border-slate-200/50 dark:border-slate-800/50"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Mobil navigatsiya"
      >
        <div className="flex items-center justify-around px-2 py-2 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-xl">
          {items.map((item, i) => (
            <NavItem key={i} item={item} active={isActive(item)} mobile />
          ))}
        </div>
      </nav>

      {/* ── Desktop Classic Sidebar (≥ md) ── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 lg:w-72 z-[200] flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-500">
        {/* Branding */}
        <div className="p-8">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg"
                 style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}>
              <FiMap className="w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tight"
              style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {APP_NAME}
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto hide-scrollbar">
          <p className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Menyu</p>
          {items.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item);
            const to = item.tab ? `${item.path}?tab=${item.tab}` : item.path;
            
            return (
              <Link
                key={i}
                to={to}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-300 group ${
                  active 
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span>{item.label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all"
            >
              <FiLogOut className="w-5 h-5" />
              <span>Chiqish</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl font-bold text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all"
            >
              <FiLogIn className="w-5 h-5" />
              <span>Kirish</span>
            </Link>
          )}
          
          <div className="pt-2 px-4">
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">v1.0.0 · {APP_NAME}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default BottomNav;
