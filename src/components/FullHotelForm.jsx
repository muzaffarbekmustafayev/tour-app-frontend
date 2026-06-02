import React, { useRef, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { FiEdit3, FiMapPin, FiNavigation, FiMap, FiClock, FiImage, FiFile, FiRotateCw, FiBell, FiCheck, FiCommand, FiLock, FiHome, FiPlus, FiTrash2, FiEye, FiX } from 'react-icons/fi';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

// Fix default marker icon url issue in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapEventsHandler = ({ onMapClick }) => {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], map.getZoom() || 13);
    }
  }, [lat, lng, map]);
  return null;
};

const MapResizer = () => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 350);
    return () => clearTimeout(timer);
  }, [map]);
  return null;
};

const amenitiesList = ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Parking', 'Air Conditioning', 'Airport Shuttle', 'Bar', 'Meeting Rooms', 'Laundry', 'Room Service', '24h Reception'];
const accessibilityList = [
  { key: 'wheelchairAccessible', label: 'Arava (Kolyaska) bilan kirish' },
  { key: 'elevator', label: 'Lift mavjud' },
  { key: 'brailleSigns', label: 'Brayl shrifti (Ko\'zi ojizlar uchun)' },
  { key: 'tactileFlooring', label: 'Taktil pol qoplamalari' },
  { key: 'hearingAssistance', label: 'Eshitish moslamalari' },
  { key: 'voiceAssistant', label: 'Ovozli boshqaruv / Yordam' },
  { key: 'signLanguage', label: 'Imo-ishora tili xizmati' },
  { key: 'emergencyButtons', label: 'Favqulodda yordam tugmalari' },
  { key: 'wideDoors', label: 'Keng eshiklar' },
  { key: 'showerSeat', label: 'Dush o\'rindig\'i' },
];
const nearbyPlacesList = [
  'Navoiy bog\'i', 'Alisher Navoiy haykali', 'Markaziy xiyobon', 'Poytaxt savdo markazi',
  'Hazrati Mir Said Bahrom maqbarasi', 'Qosim Shayx xonaqohi', 'Sarmishsoy qoyatoshlari',
  'Nurata Chashma majmuasi', 'Aydarko\'l', 'G\'ozg\'on koshonasi', 'Navoiy markaziy stadioni'
];
const securityList = [
  'CCTV (Kameratizm)', '24/7 Qo\'riqlash', 'Seyf', 'Yong\'in o\'chirish tizimi',
  'Signalizatsiya', 'Kodli qulf', 'Elektron kalit', 'Video domofon'
];

export const emptyHotelTemplate = {
  name: '', description: '', shortDescription: '',
  city: 'Navoiy', country: 'Uzbekistan', address: '',
  category: 'hotel', basePricePerNight: 500000, pricePerNight: 500000, roomsAvailable: 10, totalRooms: '', maxGuests: '',
  checkInTime: '14:00', checkOutTime: '12:00',
  amenities: [],
  images: [''],
  videoTour: { url: '', captioned: false, durationSec: '' },
  panoramas: [],
  atmosphere: { mood: '', soundscape: '', bestTimeOfDay: '', localTip: '' },
  nearbyPlaces: [], security: [], owner: '',
  accessibility: {},
  location: { lat: '', lng: '' },
  rooms: [{ name: 'Standart Xona', roomType: 'Double Room', category: 'Standard', capacity: 2, pricePerNight: 500000, totalRooms: 5, roomsAvailable: 5 }]
};

const FullHotelForm = ({ form, setForm, onSubmit, loading, users, isEdit }) => {
  const { darkMode } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('umumiy');
  const [uploading, setUploading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const galleryInputRef = useRef(null);

  const handleFormChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleRoomFieldChange = (idx, field, value) => {
    setForm(prev => {
      const newRooms = [...prev.rooms];
      newRooms[idx] = { ...newRooms[idx], [field]: value };
      const capacity = newRooms[idx].capacity || 2;
      const category = newRooms[idx].category || 'Standard';
      newRooms[idx].name = `${capacity} kishilik ${category}`;
      return { ...prev, rooms: newRooms };
    });
  };

  const addRoomType = () => {
    setForm(prev => ({
      ...prev, rooms: [...prev.rooms, { name: '', roomType: 'Double Room', category: 'Standard', capacity: 2, pricePerNight: 500000, totalRooms: 1, roomsAvailable: 1 }]
    }));
  };

  const removeRoomType = (idx) => {
    if (form.rooms.length > 1) {
      setForm(prev => ({ ...prev, rooms: prev.rooms.filter((_, i) => i !== idx) }));
    }
  };

  // Tanlangan fayllarni ketma-ket serverga yuklab, mavjud rasmlarga qo'shadi
  const handleFilesSelected = async (fileList) => {
    const files = Array.from(fileList || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;

    const tooBig = files.find(f => f.size > 5 * 1024 * 1024);
    if (tooBig) {
      alert(`"${tooBig.name}" hajmi 5MB dan katta. Kichikroq rasm tanlang.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);
        const res = await api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploaded.push(res.data.url);
      }
      setForm(prev => ({
        ...prev,
        images: [...(prev.images || []).filter(Boolean), ...uploaded],
      }));
    } catch (err) {
      alert('Rasm yuklashda xatolik: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  // Bo'sh bo'lmagan ro'yxat indeksi bo'yicha rasmni o'chiradi
  const removeImage = (targetIdx) => {
    setForm(prev => ({
      ...prev,
      images: (prev.images || []).filter(Boolean).filter((_, i) => i !== targetIdx),
    }));
  };

  // Tanlangan rasmni ro'yxat boshiga olib chiqib, muqova (asosiy) rasmga aylantiradi
  const setCoverImage = (targetIdx) => {
    setForm(prev => {
      const imgs = (prev.images || []).filter(Boolean);
      if (targetIdx <= 0 || targetIdx >= imgs.length) return prev;
      const next = [...imgs];
      const [picked] = next.splice(targetIdx, 1);
      return { ...prev, images: [picked, ...next] };
    });
  };

  const handleGetGPS = async () => {
    setGpsLoading(true);
    if (!navigator.geolocation) return setGpsLoading(false);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setForm(prev => ({ ...prev, location: { lat: coords.latitude.toFixed(6), lng: coords.longitude.toFixed(6) } }));
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const handleMapClick = (latlng) => {
    setForm(prev => ({
      ...prev,
      location: {
        lat: latlng.lat.toFixed(6),
        lng: latlng.lng.toFixed(6)
      }
    }));
  };

  const toggleArray = (field, item) => {
    setForm(prev => ({
      ...prev, [field]: (prev[field] || []).includes(item) ? prev[field].filter(i => i !== item) : [...(prev[field] || []), item]
    }));
  };

  const toggleAccessibility = (key) => {
    setForm(prev => ({ ...prev, accessibility: { ...prev.accessibility, [key]: !prev.accessibility[key] } }));
  };

  const tabs = [
    { id: 'umumiy', label: 'Umumiy Ma\'lumot', icon: FiEdit3 },
    { id: 'manzil', label: 'Lokatsiya', icon: FiMapPin },
    { id: 'xonalar', label: 'Xonalar', icon: FiHome },
    { id: 'qulayliklar', label: 'Qulaylik & Xavfsizlik', icon: FiBell },
    { id: 'galereya', label: 'Galereya', icon: FiImage }
  ];

  const InputClass = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all text-slate-900 dark:text-white";
  const LabelClass = "block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1";
  const CardClass = "bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm transition-all animate-fade-in";

  return (
    <div className="space-y-6">
      {/* Admin Owner Selection - ALWAYS VISIBLE ALONG WITH TABS */}
      {users && (
        <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/30">
          <label className="block text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-2 ml-1 flex items-center gap-2">
            <FiCheck className="w-4 h-4" /> Mehmonxona Egasi (Owner) ni tanlang
          </label>
          <select required value={form.owner || ''} onChange={e => handleFormChange('owner', e.target.value)}
            className="w-full px-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/50 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all shadow-sm">
            <option value="">Ro'yxatdan ega tanlang...</option>
            {users.filter(u => u.role === 'HOTEL_OWNER').map(u => (
              <option key={u._id} value={u._id}>{u.name} ( {u.email} )</option>
            ))}
          </select>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {/* TAB 1: UMUMIY */}
        {activeTab === 'umumiy' && (
          <div className={CardClass}>
            <div className="space-y-5">
              <div>
                <label className={LabelClass}>Mehmonxona Nomi *</label>
                <input type="text" required value={form.name} onChange={e => handleFormChange('name', e.target.value)} className={InputClass} placeholder="Masalan: Registon Plaza" />
              </div>
              <div>
                <label className={LabelClass}>Tavsif (Description) *</label>
                <textarea required rows={5} value={form.description} onChange={e => handleFormChange('description', e.target.value)} className={`${InputClass} resize-none`} placeholder="Mehmonxona haqida batafsil ma'lumot..." />
              </div>
              {/* ── Atmosfera ── */}
              <div className="pt-2 pb-1">
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  🌿 Joy atmosferasi <span className="font-medium text-slate-400 normal-case tracking-normal">(foydalanuvchi bormay turib his etsin)</span>
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={LabelClass}>Umumiy kayfiyat</label>
                    <input type="text"
                      value={form.atmosphere?.mood || ''}
                      onChange={e => setForm(p => ({ ...p, atmosphere: { ...p.atmosphere, mood: e.target.value } }))}
                      className={InputClass}
                      placeholder="Masalan: Tinch va sakin, tog' havosi" />
                  </div>
                  <div>
                    <label className={LabelClass}>Eng yaxshi vaqt</label>
                    <input type="text"
                      value={form.atmosphere?.bestTimeOfDay || ''}
                      onChange={e => setForm(p => ({ ...p, atmosphere: { ...p.atmosphere, bestTimeOfDay: e.target.value } }))}
                      className={InputClass}
                      placeholder="Masalan: Kechqurun 18-20 — quyosh botishi paytida" />
                  </div>
                  <div>
                    <label className={LabelClass}>Ovoz manzarasi</label>
                    <textarea rows={2}
                      value={form.atmosphere?.soundscape || ''}
                      onChange={e => setForm(p => ({ ...p, atmosphere: { ...p.atmosphere, soundscape: e.target.value } }))}
                      className={`${InputClass} resize-none`}
                      placeholder="Masalan: Tong pallasida qushlar sayrashi, yaqinda daryo shitirlashi..." />
                  </div>
                  <div>
                    <label className={LabelClass}>Mahalliy maslahat</label>
                    <textarea rows={2}
                      value={form.atmosphere?.localTip || ''}
                      onChange={e => setForm(p => ({ ...p, atmosphere: { ...p.atmosphere, localTip: e.target.value } }))}
                      className={`${InputClass} resize-none`}
                      placeholder="Masalan: Ertalab 7da yaqin tandirdan issiq non hidi tarqaladi..." />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LabelClass}>Kategoriya</label>
                  <select value={form.category} onChange={e => handleFormChange('category', e.target.value)} className={InputClass}>
                    {['hotel', 'resort', 'hostel', 'boutique', 'motel', 'guesthouse'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LabelClass}>Xonalar soni (Jami) *</label>
                  <input type="number" required value={form.roomsAvailable} onChange={e => handleFormChange('roomsAvailable', e.target.value)} className={InputClass} placeholder="10" />
                </div>
                <div className="md:col-span-2">
                  <label className={LabelClass}>Boshlang'ich Narx (Bir kecha uchun UZS) *</label>
                  <input type="number" required value={form.pricePerNight || form.basePricePerNight} onChange={e => { handleFormChange('pricePerNight', e.target.value); handleFormChange('basePricePerNight', e.target.value); }} className={`${InputClass} text-indigo-600 dark:text-indigo-400 font-black text-lg`} placeholder="Masalan: 500000" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANZIL */}
        {activeTab === 'manzil' && (
          <div className={CardClass}>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className={LabelClass}>Shahar *</label>
                  <input 
                    type="text" 
                    required 
                    readOnly 
                    value={form.city || 'Navoiy'} 
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/20 border border-slate-200 dark:border-slate-700/60 rounded-xl font-bold text-sm outline-none opacity-75 cursor-not-allowed text-slate-900 dark:text-white" 
                  />
                </div>
                <div>
                  <label className={LabelClass}>Manzil *</label>
                  <input type="text" required value={form.address} onChange={e => handleFormChange('address', e.target.value)} className={InputClass} placeholder="Registon maydoni 1" />
                </div>
              </div>
              
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 mt-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 w-40 h-40 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-bl-full pointer-events-none"></div>
                
                {/* Visual Status Indicator for Location Selection */}
                <div className="mb-6 relative z-10">
                  <label className={LabelClass + " !mb-2"}>GPS Lokatsiya Holati</label>
                  {form.location?.lat && form.location?.lng ? (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 animate-scale-in">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                        <FiCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black">Lokatsiya muvaffaqiyatli tanlandi!</p>
                        <p className="text-[11px] font-mono opacity-85 mt-0.5">Kenglik: {form.location.lat} | Uzunlik: {form.location.lng}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30 text-amber-800 dark:text-amber-400">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
                        <span className="text-sm">⚠️</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-black">Lokatsiya hali tanlanmagan!</p>
                        <p className="text-[11px] opacity-85 mt-0.5">Iltimos, xaritadan joylashuvni tanlang yoki GPS orqali toping.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 relative z-10 mb-6">
                  <button 
                    type="button" 
                    onClick={() => setShowMapModal(true)} 
                    className="w-full sm:flex-1 py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(79,70,229,0.25)] flex items-center justify-center gap-2 active:scale-95"
                  >
                    <FiMap className="w-4 h-4" />
                    Xaritadan tanlash
                  </button>
                  
                  <button 
                    type="button" 
                    onClick={handleGetGPS} 
                    disabled={gpsLoading} 
                    className="w-full sm:flex-1 py-3 px-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 active:scale-95"
                  >
                    {gpsLoading ? <FiRotateCw className="animate-spin w-4 h-4" /> : <FiNavigation className="w-4 h-4" />}
                    {gpsLoading ? 'Izlanmoqda...' : 'GPS orqali topish'}
                  </button>
                </div>

                {/* Latitude/Longitude Fields for Manual Input */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10 border-t border-slate-200/40 dark:border-slate-800/40 pt-5">
                  <div>
                    <label className={LabelClass}>Kenglik (Latitude)</label>
                    <input type="number" step="any" required placeholder="Masalan: 40.084200" value={form.location?.lat || ''} onChange={e => setForm(p => ({ ...p, location: { ...p.location, lat: e.target.value } }))} className={InputClass} />
                  </div>
                  <div>
                    <label className={LabelClass}>Uzunlik (Longitude)</label>
                    <input type="number" step="any" required placeholder="Masalan: 65.379100" value={form.location?.lng || ''} onChange={e => setForm(p => ({ ...p, location: { ...p.location, lng: e.target.value } }))} className={InputClass} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* INTERACTIVE LEAFLET MAP MODAL */}
        {showMapModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh] animate-scale-in">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <FiMap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Xaritadan joylashuvni belgilang</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors text-slate-500"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Map Body */}
              <div className="flex-1 min-h-[380px] relative bg-slate-100 dark:bg-slate-950">
                  <MapContainer
                    center={form.location?.lat && form.location?.lng && !isNaN(Number(form.location.lat)) && !isNaN(Number(form.location.lng)) ? [Number(form.location.lat), Number(form.location.lng)] : [40.0842, 65.3791]}
                    zoom={13}
                    style={{ width: '100%', height: '380px' }}
                    zoomControl={true}
                  >
                    <MapResizer />
                    <TileLayer
                      attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                      url={darkMode ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"}
                    />
                  <MapEventsHandler onMapClick={handleMapClick} />
                  {form.location?.lat && form.location?.lng && !isNaN(Number(form.location.lat)) && !isNaN(Number(form.location.lng)) && (
                    <>
                      <Marker 
                        position={[Number(form.location.lat), Number(form.location.lng)]} 
                        draggable={true}
                        eventHandlers={{
                          dragend: (e) => {
                            const pos = e.target.getLatLng();
                            setForm(p => ({ ...p, location: { lat: pos.lat.toFixed(6), lng: pos.lng.toFixed(6) } }));
                          }
                        }}
                      />
                      <RecenterMap lat={Number(form.location.lat)} lng={Number(form.location.lng)} />
                    </>
                  )}
                </MapContainer>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-50 dark:bg-slate-900/40 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                    LAT: {form.location?.lat || 'Tanlanmagan'}
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/30 text-xs font-mono font-black text-indigo-600 dark:text-indigo-400">
                    LNG: {form.location?.lng || 'Tanlanmagan'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  Tanlovni Tasdiqlash
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: XONALAR */}
        {activeTab === 'xonalar' && (
          <div className={CardClass}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <p className="text-xs text-slate-500 font-medium">Mehmonxonadagi mavjud xona turlari va ularning sonini belgilang.</p>
              <button type="button" onClick={addRoomType} className="flex items-center gap-2 px-5 py-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all">
                <FiPlus className="w-4 h-4" /> Yangi Xona Turi
              </button>
            </div>
            
            <div className="space-y-4">
              {form.rooms.map((room, idx) => (
                <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700/50 relative group transition-all hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md animate-fade-in">
                  {form.rooms.length > 1 && (
                    <button type="button" onClick={() => removeRoomType(idx)} className="absolute top-4 right-4 p-2.5 text-slate-400 hover:text-white hover:bg-rose-500 rounded-xl transition-all shadow-sm">
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-5 pr-10 border-b border-slate-200 dark:border-slate-700/50 pb-3">#{idx + 1} - {room.category || 'Xona'} ({room.capacity} kishilik)</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className={LabelClass}>Xona Kategoriyasi</label>
                      <select value={room.category || 'Standard'} onChange={e => handleRoomFieldChange(idx, 'category', e.target.value)} className={InputClass}>
                        {['Standard', 'Comfort', 'Deluxe', 'Suite', 'Luxury / VIP'].map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={LabelClass}>Sig'imi (Kishi)</label>
                        <select value={room.capacity} onChange={e => handleRoomFieldChange(idx, 'capacity', e.target.value)} className={InputClass}>
                          {[1, 2, 3, 4, 5, 6, 8, 10].map(n => <option key={n} value={n}>{n} kishilik</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={LabelClass}>Soni (Mavjud)</label>
                        <input type="number" min={1} value={room.totalRooms} required onChange={e => handleFormChange(idx, 'totalRooms', e.target.value)} className={InputClass} placeholder="5" />
                      </div>
                    </div>
                    <div>
                      <label className={LabelClass}>Xona narxi (Bir kecha uchun UZS)</label>
                      <input type="number" min={0} value={room.pricePerNight} required onChange={e => handleRoomFieldChange(idx, 'pricePerNight', e.target.value)} className={`${InputClass} text-emerald-600 dark:text-emerald-400 font-bold`} placeholder="500000" />
                    </div>
                    <div>
                      <label className={LabelClass}>Xona turi vizuali</label>
                      <select value={room.roomType} onChange={e => handleRoomFieldChange(idx, 'roomType', e.target.value)} className={InputClass}>
                        {['Single Room', 'Double Room', 'Triple Room', 'Quad Room', 'Family Room'].map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: QULAYLIKLAR */}
        {activeTab === 'qulayliklar' && (
          <div className="space-y-6">
            <div className={CardClass}>
              <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiBell className="text-amber-500" /> Standart Qulayliklar</h2>
              <div className="flex flex-wrap gap-2.5">
                {amenitiesList.map(a => (
                  <button key={a} type="button" onClick={() => toggleArray('amenities', a)}
                    className={`px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all active:scale-95 ${form.amenities.includes(a) ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-white dark:hover:bg-slate-900'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            
            <div className={CardClass}>
              <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiLock className="text-slate-500" /> Xavfsizlik</h2>
              <div className="flex flex-wrap gap-2.5">
                {securityList.map(s => (
                  <button key={s} type="button" onClick={() => toggleArray('security', s)}
                    className={`px-4 py-2.5 rounded-xl text-[13px] font-bold border transition-all active:scale-95 ${form.security.includes(s) ? 'bg-slate-800 dark:bg-white dark:text-slate-900 text-white border-slate-800 dark:border-white shadow-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className={CardClass}>
              <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiCommand className="text-indigo-500" /> Inklyuziv Qulayliklar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessibilityList.map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm transition-all">
                    <input type="checkbox" checked={!!form.accessibility[opt.key]} onChange={() => toggleAccessibility(opt.key)} className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 bg-white dark:bg-slate-900" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: GALEREYA */}
        {activeTab === 'galereya' && (
          <div className="space-y-6">

            {/* ── Rasmlar ── */}
            <div className={CardClass}>
              <h2 className="text-sm font-bold mb-1 text-slate-900 dark:text-white flex items-center gap-2">
                <FiImage className="text-indigo-500" /> Mehmonxona Rasmlari
              </h2>
              <p className="text-xs text-slate-500 font-medium mb-5">
                Kompyuteringizdan rasm fayllarini yuklang. Birinchi rasm asosiy (muqova) rasm bo'ladi.
              </p>

              {/* Yuklash maydoni (drag & drop + bosish) */}
              <div
                onClick={() => !uploading && galleryInputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={e => { e.preventDefault(); setDragActive(false); }}
                onDrop={e => { e.preventDefault(); setDragActive(false); handleFilesSelected(e.dataTransfer.files); }}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'} ${uploading ? 'opacity-70 pointer-events-none' : ''}`}
              >
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={e => { handleFilesSelected(e.target.files); e.target.value = ''; }}
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    {uploading
                      ? <FiRotateCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
                      : <FiImage className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                      {uploading ? 'Rasmlar yuklanmoqda...' : 'Rasm tanlash uchun bosing yoki bu yerga tashlang'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP — har biri maksimal 5MB. Bir nechta tanlash mumkin.</p>
                  </div>
                </div>
              </div>

              {/* Yuklangan rasmlar to'plami */}
              {(form.images || []).filter(Boolean).length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                  {(form.images || []).filter(Boolean).map((img, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 animate-fade-in">
                      <img src={img} alt={`Rasm ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-black shadow">MUQOVA</span>
                      )}
                      <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => setCoverImage(idx)}
                            title="Muqova qilish"
                            className="w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-indigo-600 text-white flex items-center justify-center shadow-md"
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          title="O'chirish"
                          className="w-7 h-7 rounded-lg bg-rose-500/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-md"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                !uploading && <p className="text-center text-xs text-slate-400 mt-6">Hali rasm yuklanmagan.</p>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl transition-all text-sm"
              >
                {loading ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : "Qo'shish"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullHotelForm;
