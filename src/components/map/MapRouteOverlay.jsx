import React from 'react';
import { FiNavigation, FiX, FiLoader, FiMapPin, FiClock, FiExternalLink, FiAlertTriangle } from 'react-icons/fi';
import { MdDirectionsCar, MdDirectionsWalk } from 'react-icons/md';
import { fmtDist, fmtTime } from './mapUtils';

const MapRouteOverlay = ({
  activeHotel,
  loading,
  clearGuidance,
  switchProfile,
  profile,
  isRouting,
  geoLoading,
  routeInfo,
  routeError,
  geoMsg,
}) => {
  if (!activeHotel || loading) return null;

  const googleUrl = (hotel, prof) =>
    `https://www.google.com/maps/dir/?api=1&destination=${hotel.location.lat},${hotel.location.lng}&travelmode=${prof === 'walking' ? 'walking' : 'driving'}`;

  return (
    <div
      className="absolute top-3 left-3 right-3 z-[400] flex flex-col gap-2"
      style={{ pointerEvents: 'none' }}
    >
      {/* Hotel name banner */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-2xl"
        style={{
          background: '#6366f1',
          color: 'white',
          boxShadow: '0 6px 24px rgba(99,102,241,0.45)',
          pointerEvents: 'auto',
        }}
      >
        <FiNavigation style={{ width: 14, height: 14, flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
        <span style={{ fontSize: 12, fontWeight: 800, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {activeHotel.name}
        </span>
        <button
          onClick={clearGuidance}
          style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', flexShrink: 0, minHeight: 'unset', minWidth: 'unset' }}
        >
          <FiX style={{ width: 13, height: 13 }} />
        </button>
      </div>

      {/* Route info chips row */}
      <div className="flex gap-1.5 flex-wrap" style={{ pointerEvents: 'auto' }}>
        {/* Profile toggle */}
        {[
          { key: 'driving', icon: MdDirectionsCar, label: 'Mashina', color: '#2563eb' },
          { key: 'walking', icon: MdDirectionsWalk, label: 'Piyoda', color: '#059669' },
        ].map(p => {
          const Icon = p.icon;
          return (
            <button key={p.key} onClick={() => switchProfile(p.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
                borderRadius: 20, fontSize: 11, fontWeight: 700, border: 'none', cursor: 'pointer',
                background: profile === p.key ? p.color : 'rgba(255,255,255,0.95)',
                color: profile === p.key ? 'white' : '#1e293b',
                boxShadow: profile === p.key ? `0 4px 12px ${p.color}55` : '0 1px 4px rgba(0,0,0,0.1)',
                minHeight: 'unset', minWidth: 'unset',
              }}>
              <Icon style={{ width: 13, height: 13 }} />
              {p.label}
            </button>
          );
        })}

        {/* Loading chip */}
        {isRouting && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, background: 'rgba(255,255,255,0.95)', color: '#1e293b', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
            <FiLoader style={{ width: 12, height: 12, color: '#6366f1' }} className="animate-spin" />
            {geoLoading ? 'Joylashuv...' : 'Hisoblanmoqda...'}
          </div>
        )}

        {/* Distance + time */}
        {!isRouting && routeInfo && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.95)', color: '#1e293b', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <FiMapPin style={{ width: 12, height: 12, color: '#2563eb' }} />
              {fmtDist(routeInfo.distance)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.95)', color: '#1e293b', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
              <FiClock style={{ width: 12, height: 12, color: '#059669' }} />
              {fmtTime(routeInfo.duration)}
            </div>
            <a href={googleUrl(activeHotel, profile)} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: 'rgba(255,255,255,0.95)', color: '#e11d48', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', textDecoration: 'none', minHeight: 'unset' }}>
              <FiExternalLink style={{ width: 12, height: 12 }} /> Google
            </a>
          </>
        )}

        {/* Error */}
        {(routeError || geoMsg) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: 'rgba(254,202,202,0.97)', color: '#b91c1c', boxShadow: '0 1px 4px rgba(0,0,0,0.1)', maxWidth: 220 }}>
            <FiAlertTriangle style={{ width: 11, height: 11, flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{routeError || geoMsg}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapRouteOverlay;
