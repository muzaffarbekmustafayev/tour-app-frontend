import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  FiHome, FiSearch, FiHeart, FiUser, FiMap,
  FiBriefcase, FiBarChart2, FiUsers, FiSettings, FiLogIn
} from 'react-icons/fi';

const NAV_ITEMS = {
  GUEST: [
    { path: '/',       label: 'Asosiy',   icon: FiHome },
    { path: '/search', label: 'Qidirish', icon: FiSearch },
    { path: '/routes', label: 'Xarita',   icon: FiMap },
    { path: '/login',  label: 'Kirish',   icon: FiLogIn },
  ],
  CUSTOMER: [
    { path: '/',          label: 'Asosiy',   icon: FiHome },
    { path: '/search',    label: 'Qidirish', icon: FiSearch },
    { path: '/favorites', label: 'Sevimli',  icon: FiHeart },
    { path: '/profile',   label: 'Profil',   icon: FiUser },
  ],
  HOTEL_OWNER: [
    { path: '/owner',   label: 'Hotellarim', icon: FiBriefcase },
    { path: '/search',  label: 'Qidirish',   icon: FiSearch },
    { path: '/profile', label: 'Profil',     icon: FiUser },
  ],
  ADMIN: [
    { path: '/admin', tab: 'overview', label: 'Statistika',       icon: FiBarChart2 },
    { path: '/admin', tab: 'hotels',   label: 'Hotellar',         icon: FiBriefcase },
    { path: '/admin', tab: 'users',    label: 'Foydalanuvchilar', icon: FiUsers },
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
          background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
          boxShadow: active ? '0 4px 14px -4px rgba(99,102,241,0.5)' : 'none',
          transform: active ? 'translateY(-2px)' : 'none',
        }}
      >
        <Icon style={{ width: 20, height: 20, color: active ? 'white' : inactiveColor }} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.03em', color: active ? 'white' : inactiveColor, whiteSpace: 'nowrap', lineHeight: 1 }}>
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
        background: active ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'transparent',
        boxShadow: active ? '0 6px 18px -6px rgba(99,102,241,0.55)' : 'none',
        color: active ? 'white' : inactiveColor,
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
  const { user, darkMode } = useContext(AuthContext);
  const location = useLocation();
  const role     = user?.role || 'GUEST';
  const items    = NAV_ITEMS[role] || NAV_ITEMS.GUEST;
  const [tooltip, setTooltip] = useState(null);

  const navBg         = darkMode ? 'rgba(13,19,38,0.85)'          : 'rgba(255,255,255,0.85)';
  const navBorder     = darkMode ? 'rgba(255,255,255,0.07)'        : 'rgba(255,255,255,0.5)';
  const navShadow     = darkMode
    ? '0 20px 50px -12px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)'
    : '0 16px 48px -12px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.6)';
  const inactiveColor = darkMode ? 'rgba(148,163,184,0.9)' : 'rgba(100,116,139,0.9)';
  const tooltipBg     = darkMode ? '#1e293b'               : '#ffffff';
  const tooltipBorder = darkMode ? 'rgba(51,65,85,0.8)'    : 'rgba(226,232,240,0.9)';
  const tooltipColor  = darkMode ? '#f1f5f9'               : '#1e293b';
  const hoverBg       = darkMode ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.07)';

  const isActive = (item) => {
    if (item.tab !== undefined) {
      const tab = new URLSearchParams(location.search).get('tab');
      return item.tab === 'overview'
        ? location.pathname === item.path && (!tab || tab === 'overview')
        : location.pathname === item.path && tab === item.tab;
    }
    return location.pathname === item.path;
  };

  const navStyle = { background: navBg, backdropFilter: 'blur(28px) saturate(200%)', WebkitBackdropFilter: 'blur(28px) saturate(200%)', border: `1px solid ${navBorder}`, boxShadow: navShadow };

  return (
    <>
      {/* ── Mobile (< md) ── */}
      <nav
        className="md:hidden fixed bottom-4 left-1/2 z-[200]"
        style={{ transform: 'translateX(-50%)', width: 'calc(100% - 2rem)', maxWidth: 400, paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Asosiy navigatsiya"
      >
        <div className="flex items-center justify-around px-2 py-2 rounded-[2rem]" style={navStyle}>
          {items.map((item, i) => (
            <NavItem key={i} item={item} active={isActive(item)} inactiveColor={inactiveColor} hoverBg={hoverBg} mobile />
          ))}
        </div>
      </nav>

      {/* ── Tablet (md → lg) ── */}
      <nav
        className="hidden md:flex lg:hidden fixed left-3 top-1/2 z-[200] flex-col items-center gap-2 py-4 px-2 rounded-[2rem]"
        style={{ transform: 'translateY(-50%)', ...navStyle }}
        aria-label="Asosiy navigatsiya"
      >
        {items.map((item, i) => (
          <div key={i} className="relative" onMouseEnter={() => setTooltip(i)} onMouseLeave={() => setTooltip(null)}>
            <NavItem item={item} active={isActive(item)} inactiveColor={inactiveColor} hoverBg={hoverBg} />
            {tooltip === i && (
              <div className="absolute left-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap pointer-events-none"
                style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor, boxShadow: navShadow, zIndex: 300 }}>
                {item.label}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* ── Desktop (≥ lg) ── */}
      <nav
        className="hidden lg:flex fixed left-4 top-1/2 z-[200] flex-col items-center gap-1.5 py-5 px-3 rounded-[2.5rem]"
        style={{ transform: 'translateY(-50%)', minWidth: 72, ...navStyle }}
        aria-label="Asosiy navigatsiya"
      >
        <div className="w-8 h-8 rounded-full mb-3 shrink-0"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 4px 12px -4px rgba(99,102,241,0.6)' }} />

        {items.map((item, i) => (
          <div key={i} className="relative group w-full flex justify-center">
            <NavItem item={item} active={isActive(item)} inactiveColor={inactiveColor} hoverBg={hoverBg} />
            <div
              className="absolute left-[58px] top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: tooltipBg, border: `1px solid ${tooltipBorder}`, color: tooltipColor, boxShadow: navShadow, zIndex: 300 }}
            >
              {item.label}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
};

export default BottomNav;
