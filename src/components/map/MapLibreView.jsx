import React, { useRef, useEffect, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { CATEGORY_COLORS } from './mapUtils';

/**
 * MapLibreView — MapLibre GL asosidagi 3D xarita.
 *
 * Google Maps uslubida: aylantirish (drag-rotate), pitch/tilt, 3D binolar,
 * markerlarni bosib tanlash, marshrut chizish (OSRM koordinatalari).
 *
 * Props:
 *   hotels      — ko'rsatiladigan maskanlar (location.lat/lng bilan)
 *   selectedId  — tanlangan maskan _id
 *   onSelect    — marker bosilganda chaqiriladi (hotel)
 *   userPos     — [lat, lng] foydalanuvchi joylashuvi yoki null
 *   routeCoords — [[lat, lng], ...] marshrut nuqtalari
 *   flyTarget   — [lat,lng] yoki [[lat,lng],[lat,lng]] — kamera maqsadi
 *   view3D      — true bo'lsa pitch (3D), false bo'lsa tekis (2D)
 *   darkMode    — qorong'i rejim
 */

// Bepul, API kalit talab qilmaydigan vektorli uslublar
// Light: OpenFreeMap Liberty (3D binolar bilan)
// Dark:  OpenFreeMap Fiord — ko'kish-kulrang professional ohang
const STYLE_LIGHT = 'https://tiles.openfreemap.org/styles/liberty';
const STYLE_DARK = 'https://tiles.openfreemap.org/styles/fiord';

const NAVOIY = [65.3791, 40.0842]; // [lng, lat]

const MapLibreView = ({
  hotels = [],
  selectedId,
  onSelect,
  userPos,
  routeCoords = [],
  flyTarget,
  view3D = true,
  darkMode = false,
}) => {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const userMarkerRef = useRef(null);
  const loadedRef = useRef(false);

  // ── Xaritani bir marta ishga tushirish ──────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: darkMode ? STYLE_DARK : STYLE_LIGHT,
      center: NAVOIY,
      zoom: 12,
      pitch: view3D ? 55 : 0,
      bearing: view3D ? -18 : 0,
      attributionControl: false,
      maxPitch: 75,
    });
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.on('load', () => {
      loadedRef.current = true;
      addRouteLayer(map);
      syncMarkers();
      syncRoute();
      syncUser();
    });
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; loadedRef.current = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Uslub almashtirish (dark/light) ─────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    map.setStyle(darkMode ? STYLE_DARK : STYLE_LIGHT);
    map.once('styledata', () => { addRouteLayer(map); syncRoute(); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [darkMode]);

  // ── 2D / 3D almashtirish ────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.easeTo({ pitch: view3D ? 55 : 0, bearing: view3D ? -18 : 0, duration: 600 });
  }, [view3D]);

  const addRouteLayer = (map) => {
    if (map.getSource('route')) return;
    map.addSource('route', { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: [] } } });
    map.addLayer({ id: 'route-outline', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#312e81', 'line-width': 9, 'line-opacity': 0.7 } });
    map.addLayer({ id: 'route-line', type: 'line', source: 'route',
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#4f46e5', 'line-width': 5 } });
  };

  // ── Markerlarni sinxronlash ─────────────────────────────────────────
  const buildMarkerEl = useCallback((hotel, selected) => {
    const color = CATEGORY_COLORS[hotel.category] || '#4f46e5';
    const head = selected ? '#f43f5e' : color;
    const size = selected ? 40 : 30;
    const glyph = hotel.category === 'resort' ? '🌿' : hotel.category === 'hostel' ? '🎒' : '🏨';
    const el = document.createElement('div');
    el.style.cssText = `width:${size}px;height:${size * 1.32}px;cursor:pointer;`;
    el.innerHTML = `
      <div style="position:relative;width:${size}px;height:${size * 1.32}px;">
        ${selected ? `<div style="position:absolute;left:50%;top:${size * 0.5}px;width:${size * 1.6}px;height:${size * 1.6}px;transform:translate(-50%,-50%);border-radius:50%;background:${head}33;animation:pulse-ring 1.8s infinite cubic-bezier(0.215,0.61,0.355,1);"></div>` : ''}
        <div style="position:absolute;left:0;top:0;width:${size}px;height:${size}px;filter:drop-shadow(0 5px 7px rgba(0,0,0,0.32));">
          <div style="width:${size}px;height:${size}px;background:linear-gradient(145deg,${head},${head}cc);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;box-shadow:inset 0 1px 2px rgba(255,255,255,0.4);"></div>
          <span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:${selected ? 15 : 12}px;line-height:1;">${glyph}</span>
        </div>
      </div>`;
    return el;
  }, []);

  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const seen = new Set();
    hotels.forEach((hotel) => {
      if (!hotel.location?.lat || !hotel.location?.lng) return;
      seen.add(hotel._id);
      const selected = selectedId === hotel._id;
      const el = buildMarkerEl(hotel, selected);
      el.addEventListener('click', (e) => { e.stopPropagation(); onSelect?.(hotel); });
      if (markersRef.current[hotel._id]) {
        markersRef.current[hotel._id].getElement().replaceWith(el);
        markersRef.current[hotel._id]._element = el;
        markersRef.current[hotel._id].setLngLat([hotel.location.lng, hotel.location.lat]);
        // marker element almashtirilgani uchun yangidan yaratamiz
        markersRef.current[hotel._id].remove();
      }
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([hotel.location.lng, hotel.location.lat])
        .addTo(map);
      markersRef.current[hotel._id] = marker;
    });
    // o'chirilgan markerlarni tozalash
    Object.keys(markersRef.current).forEach((id) => {
      if (!seen.has(id)) { markersRef.current[id].remove(); delete markersRef.current[id]; }
    });
  }, [hotels, selectedId, onSelect, buildMarkerEl]);

  useEffect(() => { syncMarkers(); }, [syncMarkers]);

  // ── Marshrutni sinxronlash ──────────────────────────────────────────
  const syncRoute = useCallback(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const src = map.getSource('route');
    if (!src) return;
    const coords = routeCoords.map(([lat, lng]) => [lng, lat]);
    src.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: coords } });
  }, [routeCoords]);

  useEffect(() => { syncRoute(); }, [syncRoute]);

  // ── Foydalanuvchi markeri ───────────────────────────────────────────
  const syncUser = useCallback(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    if (!userPos) {
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      return;
    }
    if (!userMarkerRef.current) {
      const el = document.createElement('div');
      el.innerHTML = `<div style="position:relative;width:20px;height:20px;">
        <div style="position:absolute;inset:0;background:#10b981;border-radius:50%;border:3px solid #fff;box-shadow:0 0 10px rgba(16,185,129,0.7);"></div>
      </div>`;
      userMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat([userPos[1], userPos[0]]).addTo(map);
    } else {
      userMarkerRef.current.setLngLat([userPos[1], userPos[0]]);
    }
  }, [userPos]);

  useEffect(() => { syncUser(); }, [syncUser]);

  // ── Kamera (flyTarget) ──────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !flyTarget) return;
    const isPair = Array.isArray(flyTarget[0]);
    if (isPair) {
      const b = new maplibregl.LngLatBounds();
      flyTarget.forEach(([lat, lng]) => b.extend([lng, lat]));
      map.fitBounds(b, { padding: 90, pitch: view3D ? 50 : 0, duration: 900, maxZoom: 16 });
    } else {
      map.flyTo({ center: [flyTarget[1], flyTarget[0]], zoom: 15, pitch: view3D ? 55 : 0, duration: 900 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyTarget]);

  return <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
};

export default MapLibreView;
