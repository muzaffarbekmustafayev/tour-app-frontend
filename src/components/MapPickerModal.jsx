import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AuthContext } from '../context/AuthContext';
import { FiMapPin, FiX, FiCheck, FiCrosshair, FiLoader, FiSearch, FiLink } from 'react-icons/fi';
import { parseLocationInput, geocodeSearch } from '../utils/geo';

const NAVOIY_CENTER = [65.3791, 40.0842]; // [lng, lat]

// O'z ichiga olgan OpenStreetMap (raster) uslubi — tashqi style JSON yoki API kalit shart emas
const OSM_STYLE = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap hissadorlari',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

const makePinEl = () => {
  const el = document.createElement('div');
  el.style.cssText = 'width:30px;height:40px;cursor:grab;';
  el.innerHTML = `
    <div style="position:relative;width:30px;height:40px;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.35));">
      <div style="width:30px;height:30px;background:linear-gradient(145deg,#4F46E5,#8B5CF6);border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid #fff;"></div>
      <div style="position:absolute;left:50%;top:11px;width:9px;height:9px;background:#fff;border-radius:50%;transform:translate(-50%,-50%);"></div>
    </div>`;
  return el;
};

/**
 * MapPickerModal — koordinata tanlash uchun yagona, qayta ishlatiladigan modal.
 * OpenStreetMap (MapLibre GL) asosida — Leaflet ishlatilmaydi.
 *
 * Tanlash usullari:
 *   1) Xaritaga bosish yoki markerni torting
 *   2) Joy nomini qidirish (OSM Nominatim)
 *   3) Google/Yandex/OSM xarita havolasini yoki "lat, lng" matnini joylash
 *   4) GPS — mening joylashuvim
 *
 * Props: open, onClose, value({lat,lng}), onChange({lat,lng}), title
 */
const MapPickerModal = ({ open, onClose, value, onChange, title = 'Joylashuvni belgilang' }) => {
  const { darkMode } = useContext(AuthContext);
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [gpsLoading, setGpsLoading] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [linkError, setLinkError] = useState('');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const lat = Number(value?.lat);
  const lng = Number(value?.lng);
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng);

  const emit = useCallback((la, ln) => {
    onChangeRef.current?.({ lat: (+la).toFixed(6), lng: (+ln).toFixed(6) });
  }, []);

  const placeMarker = useCallback((la, ln, fly = true) => {
    const map = mapRef.current;
    if (!map) return;
    if (!markerRef.current) {
      markerRef.current = new maplibregl.Marker({ element: makePinEl(), anchor: 'bottom', draggable: true })
        .setLngLat([ln, la])
        .addTo(map);
      markerRef.current.on('dragend', () => {
        const p = markerRef.current.getLngLat();
        emit(p.lat, p.lng);
      });
    } else {
      markerRef.current.setLngLat([ln, la]);
    }
    if (fly) map.easeTo({ center: [ln, la], zoom: Math.max(map.getZoom() || 0, 14), duration: 600 });
  }, [emit]);

  // ── Xaritani ishga tushirish (modal ochilganda) ──
  useEffect(() => {
    if (!open || mapRef.current || !containerRef.current) return;
    const start = hasCoords ? [lng, lat] : NAVOIY_CENTER;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: OSM_STYLE,
      center: start,
      zoom: hasCoords ? 14 : 8,
      attributionControl: false,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    map.on('click', (e) => emit(e.lngLat.lat, e.lngLat.lng));
    map.on('load', () => {
      map.resize();
      if (Number.isFinite(lat) && Number.isFinite(lng)) placeMarker(lat, lng, false);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // value tashqaridan o'zgarsa — markerni moslashtirish
  useEffect(() => {
    if (!open || !mapRef.current) return;
    if (hasCoords) placeMarker(lat, lng, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng, open]);

  // Escape bilan yopish
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Qidiruv (debounced — OSM Nominatim)
  useEffect(() => {
    if (!open) return;
    const q = search.trim();
    if (q.length < 3) { setResults([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        setResults(await geocodeSearch(q, { signal: ctrl.signal }));
      } catch { /* abort yoki tarmoq xatosi — e'tiborsiz */ } finally { setSearching(false); }
    }, 450);
    return () => { ctrl.abort(); clearTimeout(t); };
  }, [search, open]);

  if (!open) return null;

  const applyLink = () => {
    const parsed = parseLocationInput(linkInput);
    if (!parsed) {
      setLinkError('Koordinata topilmadi. "41.31, 69.24" yoki Google/Yandex xarita havolasini joylang.');
      return;
    }
    setLinkError('');
    setLinkInput('');
    emit(parsed.lat, parsed.lng);
  };

  const locateMe = () => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { emit(coords.latitude, coords.longitude); setGpsLoading(false); },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const chooseResult = (r) => {
    setSearch(r.label.split(',').slice(0, 2).join(',').trim());
    setResults([]);
    emit(r.lat, r.lng);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200/70 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-4 flex items-center gap-3 text-white overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg,#4F46E5 0%,#7C3AED 55%,#8B5CF6 100%)' }}>
          <div className="absolute -top-8 -right-4 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)', filter: 'blur(8px)' }} />
          <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 backdrop-blur-sm">
            <FiMapPin className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 z-10">
            <h3 className="text-base font-black tracking-tight leading-tight">{title}</h3>
            <p className="text-[11px] font-medium text-white/75">Qidiring, havola joylang yoki xaritaga bosing</p>
          </div>
          <button onClick={onClose} aria-label="Yopish"
            className="z-10 w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-colors">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Qidiruv + havola */}
        <div className="px-4 pt-4 pb-3 space-y-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          {/* Joy nomini qidirish */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Joy nomini qidiring (masalan: Nurota Chashma)"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
            />
            {searching && <FiLoader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500 animate-spin" />}
            {results.length > 0 && (
              <div className="absolute z-20 left-0 right-0 mt-1 max-h-56 overflow-y-auto rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
                {results.map((r, i) => (
                  <button key={i} type="button" onClick={() => chooseResult(r)}
                    className="w-full text-left px-3.5 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700/60 border-b border-slate-100 dark:border-slate-700/60 last:border-0 flex items-start gap-2">
                    <FiMapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{r.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Havola yoki koordinata joylash */}
          <div className="flex items-stretch gap-2">
            <div className="relative flex-1">
              <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={linkInput}
                onChange={(e) => { setLinkInput(e.target.value); setLinkError(''); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink(); } }}
                placeholder="Xarita havolasi yoki 41.31, 69.24"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-sm font-semibold outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>
            <button type="button" onClick={applyLink}
              className="px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors active:scale-95 shrink-0">
              Qo'yish
            </button>
          </div>
          {linkError && <p className="text-[11px] font-bold text-rose-500 ml-1">{linkError}</p>}
        </div>

        {/* Map */}
        <div className="flex-1 min-h-[360px] relative bg-slate-100 dark:bg-slate-950">
          <div ref={containerRef} className={darkMode ? 'map-dark' : ''} style={{ position: 'absolute', inset: 0 }} />

          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[5] pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full text-[11px] font-bold bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 shadow-lg backdrop-blur-md border border-white/60 dark:border-slate-700/60 flex items-center gap-1.5">
              <FiMapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Joyni tanlash uchun xaritaga bosing
            </span>
          </div>

          <button onClick={locateMe} aria-label="Mening joylashuvim" disabled={gpsLoading}
            className="absolute bottom-4 left-4 z-[5] w-11 h-11 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200/70 dark:border-slate-700 flex items-center justify-center text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors active:scale-95">
            {gpsLoading ? <FiLoader className="w-5 h-5 animate-spin" /> : <FiCrosshair className="w-5 h-5" />}
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            {[
              { label: 'Kenglik', val: value?.lat },
              { label: 'Uzunlik', val: value?.lng },
            ].map((c) => (
              <div key={c.label} className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{c.label}</p>
                <p className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 truncate">{c.val || '—'}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Bekor
            </button>
            <button onClick={onClose} disabled={!hasCoords}
              className="px-6 py-2.5 rounded-xl text-white text-sm font-bold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              style={{ background: hasCoords ? 'linear-gradient(135deg,#4F46E5,#8B5CF6)' : '#94a3b8' }}>
              <FiCheck className="w-4 h-4" /> Tasdiqlash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
