import React, { useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { ChatContext } from '../context/ChatContext';
import { APP_NAME } from '../config/app';
import {
  FiHome, FiSearch, FiHeart, FiUser, FiMap,
  FiBriefcase, FiBarChart2, FiLogIn, FiLogOut,
  FiMessageCircle, FiCompass, FiPlusCircle, FiUsers,
} from 'react-icons/fi';
import { LuLandmark, LuBuilding2 } from 'react-icons/lu';

// Mobil pastki navigatsiya uchun elementlar
const NAV_ITEMS = {
  GUEST: [
    { path: '/',            label: 'Asosiy',   icon: FiHome },
    { path: '/attractions', label: 'Joylar',   icon: FiCompass },
    { path: '/search',      label: 'Qidirish', icon: FiSearch },
    { path: '/map',         label: 'Xarita',   icon: FiMap },
    { path: '/login',       label: 'Kirish',   icon: FiLogIn },
  ],
  CUSTOMER: [
    { path: '/',            label: 'Asosiy',   icon: FiHome },
    { path: '/attractions', label: 'Joylar',   icon: FiCompass },
    { path: '/search',      label: 'Qidirish', icon: FiSearch },
    { path: '/favorites',   label: 'Sevimli',  icon: FiHeart },
    { path: '/chat',        label: 'Xabarlar', icon: FiMessageCircle, chat: true },
    { path: '/profile',     label: 'Profil',   icon: FiUser },
  ],
  HOTEL_OWNER: [
    { path: '/owner',   label: 'Hotellarim', icon: FiBriefcase },
    { path: '/chat',    label: 'Xabarlar',   icon: FiMessageCircle, chat: true },
    { path: '/search',  label: 'Qidirish',   icon: FiSearch },
    { path: '/map',     label: 'Xarita',     icon: FiMap },
    { path: '/profile', label: 'Profil',     icon: FiUser },
  ],
  ADMIN: [
    { path: '/admin', tab: 'overview',      label: 'Boshqaruv',    icon: FiBarChart2 },
    { path: '/admin', tab: 'create-object', label: 'Yaratish',     icon: FiPlusCircle },
    { path: '/admin', tab: 'attractions',   label: 'Obyektlar',    icon: LuLandmark },
    { path: '/admin', tab: 'hotels',        label: 'Hotellar',     icon: LuBuilding2 },
    { path: '/admin', tab: 'users',         label: 'Foydalanuvchilar', icon: FiUsers },
  ],
};

// 🌟 DESKTOP ADMIN IXCHAM VA TO'LIQ SIG'UVCHI SIDEBAR MENYUSI (SCROLL BO'LMAYDI) 🌟
const ADMIN_DESKTOP_ITEMS = [
  { path: '/admin', tab: 'overview',      label: 'Boshqaruv Hubi',       icon: FiBarChart2 },
  { path: '/admin', tab: 'create-object', label: 'Obyekt Yaratish',      icon: FiPlusCircle, isHighlight: true, badge: 'Yangi' },
  { path: '/admin', tab: 'attractions',   label: 'Barcha Obyektlar',     icon: LuLandmark },
  { path: '/admin', tab: 'hotels',        label: 'Mehmonxonalar',        icon: LuBuilding2 },
  { path: '/admin', tab: 'users',         label: 'Foydalanuvchilar',     icon: FiUsers },
  { path: '/map',                         label: 'Interaktiv Xarita',    icon: FiMap },
  { path: '/profile',                     label: 'Admin Profili',        icon: FiUser },
];

/* ── Shared NavItem for Mobile ── */
const NavItem = ({ item, active, mobile = false, unread = 0 }) => {
  const Icon = item.icon;
  const to = item.tab ? `${item.path}?tab=${item.tab}` : item.path;
  const badge = item.chat && unread > 0;

  if (mobile) {
    return (
      <Link
        to={to}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className="flex flex-col items-center justify-center gap-1 rounded-[1rem] transition-all active:scale-90 press-effect"
        style={{
          minWidth: 56, padding: '7px 8px 6px',
          background: active ? 'var(--gradient-main)' : 'transparent',
          boxShadow: active ? 'var(--shadow-colored)' : 'none',
          transform: active ? 'translateY(-1px)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Icon style={{ width: 20, height: 20, color: active ? 'white' : 'var(--text-muted)', transition: 'color 0.2s ease' }} />
          {badge && (
            <span style={{
              position: 'absolute', top: -5, right: -7,
              background: '#ef4444', color: '#fff',
              borderRadius: '50%', minWidth: 16, height: 16,
              fontSize: '0.58rem', fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px', border: '1.5px solid var(--bg-card,#fff)',
            }}>
              {unread > 99 ? '99+' : unread}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 9, fontWeight: 700, letterSpacing: '0.01em',
          color: active ? 'white' : 'var(--text-muted)',
          whiteSpace: 'nowrap', lineHeight: 1.2, transition: 'color 0.2s ease',
        }}>
          {item.label}
        </span>
      </Link>
    );
  }
  return null;
};

const BottomNav = () => {
  const { user, logout } = useContext(AuthContext);
  const { unreadTotal } = useContext(ChatContext);
  const location = useLocation();
  const navigate = useNavigate();
  const role     = user?.role || 'GUEST';
  const mobileItems = NAV_ITEMS[role] || NAV_ITEMS.GUEST;
  const desktopItems = role === 'ADMIN' ? ADMIN_DESKTOP_ITEMS : mobileItems;

  const isActive = (item) => {
    if (item.tab !== undefined) {
      const searchParams = new URLSearchParams(location.search);
      const tab = searchParams.get('tab');
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
        className="md:hidden fixed bottom-0 left-0 w-full z-[200] border-t border-slate-200/40 dark:border-slate-800/60"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        aria-label="Mobil navigatsiya"
      >
        <div className="flex items-center justify-around px-1 py-1.5 bg-white/97 dark:bg-[#0B1120]/97 backdrop-blur-2xl"
          style={{ boxShadow: '0 -4px 24px -6px rgba(0,0,0,0.1)' }}>
          {mobileItems.map((item, i) => (
            <NavItem key={i} item={item} active={isActive(item)} mobile unread={unreadTotal} />
          ))}
        </div>
      </nav>

      {/* ── Desktop Classic Sidebar (≥ md) — Ixcham & Scrollsiz ── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[260px] lg:w-[280px] z-[200] flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-colors duration-500 overflow-hidden">
        {/* Top Branding */}
        <div>
          <div className="p-5 lg:p-6 border-b border-slate-100 dark:border-slate-800/80">
            <Link to="/" className="flex items-center gap-3 no-underline">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md shrink-0"
                   style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}>
                <FiMap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-lg font-black tracking-tight block leading-tight truncate"
                  style={{ background: 'var(--gradient-main)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {APP_NAME}
                </span>
                <span className="text-[9.5px] font-black uppercase tracking-widest text-slate-400 block mt-0.5">
                  {role === 'ADMIN' ? 'Boshqaruv Markazi' : 'Turizm Platformasi'}
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 py-3 space-y-1">
            <p className="px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400 mb-2">Menyu</p>
            {desktopItems.map((item, i) => {
              const Icon = item.icon;
              const active = isActive(item);
              const to = item.tab ? `${item.path}?tab=${item.tab}` : item.path;
              const showBadge = item.chat && unreadTotal > 0;

              return (
                <Link
                  key={i}
                  to={to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs lg:text-sm transition-all duration-200 active:scale-[0.98] ${
                    active
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                      : item.isHighlight
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40 hover:bg-amber-100'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="shrink-0 flex items-center justify-center">
                    <Icon className={`w-4 h-4 lg:w-4.5 lg:h-4.5 ${active ? 'text-white' : item.isHighlight ? 'text-amber-600' : 'text-slate-400'}`} />
                  </div>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      active ? 'bg-white/20 text-white' : 'bg-amber-500 text-white'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                  {showBadge && !active && (
                    <span className="ml-auto text-[10px] font-black text-rose-500">
                      {unreadTotal > 99 ? '99+' : unreadTotal}
                    </span>
                  )}
                  {active && !item.badge && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="p-3 lg:p-4 border-t border-slate-100 dark:border-slate-800 space-y-1 shrink-0">
          {user && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-all active:scale-[0.98]"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Chiqish</span>
            </button>
          )}
          
          <div className="px-3 pt-1">
             <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-widest">v1.2 · {APP_NAME}</p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default BottomNav;
