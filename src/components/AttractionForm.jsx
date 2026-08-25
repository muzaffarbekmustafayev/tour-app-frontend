import React, { useState, useRef } from 'react';
import api from '../services/api';
import MapPickerModal from './MapPickerModal';
import { imgSrc, FALLBACK_ATTRACTION } from '../utils/media';
import SafeImage from './SafeImage';
import { parseLocationInput } from '../utils/geo';
import {
  FiEdit3, FiMapPin, FiImage, FiPlus, FiTrash2, FiX, FiVideo,
  FiNavigation, FiCheck, FiUpload, FiClock, FiFeather,
  FiLink, FiChevronDown, FiPhone, FiInfo, FiLayers, FiEye
} from 'react-icons/fi';
import { LuLandmark, LuHospital, LuStore, LuTrees } from 'react-icons/lu';

export const DISTRICTS = [
  'Navoiy shahri',
  'Nurota',
  'Xatirchi',
  'Qiziltepa'
];

export const ACCESSIBILITY_OPTS = [
  { key: 'wheelchairAccessible', label: 'Aravacha uchun qulay' },
  { key: 'accessibleParking', label: 'Maxsus parking' },
  { key: 'accessibleToilet', label: 'Inklyuziv hojatxona' },
  { key: 'brailleSigns', label: 'Brayl yozuvlari' },
  { key: 'audioGuides', label: "Ovozli yo'riqnoma" },
  { key: 'signLanguageStaff', label: 'Imo-ishora tili xodimi' },
  { key: 'quietZones', label: 'Shovqinsiz hudud' },
  { key: 'serviceAnimalFriendly', label: "Yo'l-yo'riq hayvonlari" },
];

export const ATTRACTION_CATEGORIES = [
  { key: 'tarixiy', label: "Tarixiy obida / Qal'a" },
  { key: 'ziyoratgoh', label: 'Muqaddas Ziyoratgoh / Qadamjo' },
  { key: 'madaniy', label: 'Madaniy markaz / Muzey / Teatr' },
  { key: 'tabiat', label: "Tabiat / Tog' / Sharshara / Dara" },
  { key: 'istirohat_bogi', label: "Istirohat bog'i / Sayrgoh" },
  { key: 'kasalxona', label: 'Shoshilinch tibbiy yordam / Kasalxona' },
  { key: 'iib', label: 'IIB / Xavfsiz turizm posti' },
  { key: 'hokimiyat', label: 'Hokimiyat / Davlat boshqaruvi' },
  { key: 'transport', label: 'Vokzal / Aeroport / Transport' },
  { key: 'bozor', label: 'Markaziy dehqon bozori' },
  { key: 'supermarket', label: 'Supermarket / Gipermarket' },
  { key: 'mall', label: "Savdo majmuasi (Mall / SEC)" },
  { key: 'boshqa', label: 'Boshqa xizmat / Obyekt' },
];

export const emptyAttractionTemplate = {
  name: '',
  district: 'Nurota',
  category: 'tarixiy',
  description: '',
  descriptionShort: '',
  location: { lat: '', lng: '' },
  address: '',
  phone: '',
  workingHours: '',
  emergencyContact: '',
  video360: { url: '', type: 'youtube', captioned: false },
  bestSeason: '',
  entryFee: '',
  atmosphere: { mood: '', soundscape: '', bestTimeOfDay: '', localTip: '' },
  peakInfo: { peak: '', quiet: '', note: '' },
  accessibility: {},
  thingsToSeeAround: [],
  images: [],
};

const THING_TYPES = ['tarix', 'diniy', 'ovqatlanish', 'bozor', 'tabiat', 'boshqa'];

const AttractionForm = ({ form, setForm }) => {
  const imgRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [locLink, setLocLink] = useState('');
  const [locLinkError, setLocLinkError] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('main'); // 'main' | 'media' | 'extra'

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const setNested = (parent, k, v) =>
    setForm((p) => ({ ...p, [parent]: { ...(p[parent] || {}), [k]: v } }));

  // Havola yoki "lat, lng" matnidan koordinata olish
  const applyLocLink = () => {
    setLocLinkError('');
    if (!locLink.trim()) return;
    const parsed = parseLocationInput(locLink);
    if (!parsed) {
      setLocLinkError("Koordinata yoki havola formatini aniqlab bo'lmadi. Masalan: 40.5640, 65.6895");
      return;
    }
    set('location', { lat: parsed.lat.toFixed(6), lng: parsed.lng.toFixed(6) });
    setLocLink('');
  };

  const handleImages = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const tooBig = files.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) return setUploadError(`"${tooBig.name}" 5MB dan katta. Kichikroq rasm tanlang.`);
    setUploadError('');
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append('images', f));
      const res = await api.post('/upload/multiple', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      const urls = res.data.urls || [];
      setForm((p) => ({ ...p, images: [...(p.images || []).filter(Boolean), ...urls] }));
    } catch (err) {
      setUploadError('Rasm yuklashda xatolik: ' + (err.response?.data?.message || err.message));
    } finally { setUploading(false); }
  };

  const handleVideoFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) return setUploadError('Faqat video fayl tanlang.');
    if (file.size > 100 * 1024 * 1024) return setUploadError('Video hajmi 100MB dan katta.');
    setUploadError('');
    setVideoUploading(true);
    try {
      const fd = new FormData();
      fd.append('video', file);
      const res = await api.post('/upload/video', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((p) => ({ ...p, video360: { ...p.video360, url: res.data.url, type: 'file' } }));
    } catch (err) {
      setUploadError('Video yuklashda xatolik: ' + (err.response?.data?.message || err.message));
    } finally { setVideoUploading(false); }
  };

  const removeImage = (idx) => setForm((p) => ({ ...p, images: (p.images || []).filter((_, i) => i !== idx) }));

  const addThing = () => setForm((p) => ({ ...p, thingsToSeeAround: [...(p.thingsToSeeAround || []), { title: '', description: '', type: 'boshqa', walkingMinutes: '' }] }));
  const updThing = (idx, field, val) => setForm((p) => {
    const arr = [...p.thingsToSeeAround]; arr[idx] = { ...arr[idx], [field]: val }; return { ...p, thingsToSeeAround: arr };
  });
  const rmThing = (idx) => setForm((p) => ({ ...p, thingsToSeeAround: p.thingsToSeeAround.filter((_, i) => i !== idx) }));

  const toggleAcc = (key) => setForm((p) => ({ ...p, accessibility: { ...p.accessibility, [key]: !p.accessibility?.[key] } }));

  return (
    <div className="space-y-4">
      {uploadError && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-bold">
          <span>{uploadError}</span>
          <FiX className="w-4 h-4 cursor-pointer" onClick={() => setUploadError('')} />
        </div>
      )}

      {/* Ixcham Sub-Tablar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('main')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
            activeSubTab === 'main'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FiEdit3 className="w-3.5 h-3.5" /> 1. Asosiy Ma'lumot & Joylashuv
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('media')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
            activeSubTab === 'media'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FiImage className="w-3.5 h-3.5" /> 2. Rasmlar & 360° Video
          {(form.images?.length > 0 || form.video360?.url) && (
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('extra')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-2 ${
            activeSubTab === 'extra'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FiFeather className="w-3.5 h-3.5" /> 3. Inklyuzivlik & Atrof
        </button>
      </div>

      {/* ── 1. ASOSIY MA'LUMOTLAR & JOYLASHUV ── */}
      {activeSubTab === 'main' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Asosiy forma qismi (2 ustun) */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FiInfo className="text-indigo-500" /> Obyekt Tavsifi
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Nomi *</label>
                <input
                  value={form.name || ''}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Masalan: Nurota Chashma majmuasi yoki Korzinka Navoiy"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Tuman / Shahar *</label>
                <select
                  value={form.district || 'Nurota'}
                  onChange={(e) => set('district', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                >
                  {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Toifasi *</label>
                <select
                  value={form.category || 'tarixiy'}
                  onChange={(e) => set('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                >
                  {ATTRACTION_CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Telefon / Aloqa</label>
                <input
                  value={form.phone || ''}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="103 / +998 79 224-03-03"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Ish tartibi</label>
                <input
                  value={form.workingHours || ''}
                  onChange={(e) => set('workingHours', e.target.value)}
                  placeholder="24/7 / 08:00–22:00"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Qisqa tavsif *</label>
                <input
                  value={form.descriptionShort || ''}
                  onChange={(e) => set('descriptionShort', e.target.value)}
                  placeholder="Bir jumlali asosiy tavsif (kartochkada chiqadi)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Batafsil tavsif</label>
                <textarea
                  value={form.description || ''}
                  onChange={(e) => set('description', e.target.value)}
                  rows={2}
                  placeholder="Obyekt tarixi, xizmatlari yoki ahamiyati..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Joylashuv va Koordinatalar qismi (1 ustun) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FiMapPin className="text-rose-500" /> Joylashuv & GPS
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Manzil</label>
              <input
                value={form.address || ''}
                onChange={(e) => set('address', e.target.value)}
                placeholder="Ko'cha, bino, mo'ljal"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">Xarita havolasi yoki koordinata</label>
              <div className="flex gap-1.5">
                <input
                  value={locLink}
                  onChange={(e) => { setLocLink(e.target.value); setLocLinkError(''); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLocLink(); } }}
                  placeholder="40.5640, 65.6895"
                  className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={applyLocLink}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold active:scale-95 shrink-0"
                >
                  Qo'yish
                </button>
              </div>
              {locLinkError && <p className="text-[10px] text-rose-500 font-bold mt-1">{locLinkError}</p>}
            </div>

            <button
              type="button"
              onClick={() => setShowMap(true)}
              className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors active:scale-95"
            >
              <FiNavigation className="w-3.5 h-3.5" /> Xaritadan Tanlash
            </button>

            {form.location?.lat && form.location?.lng && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <FiCheck className="w-4 h-4 shrink-0" />
                <span className="truncate font-mono">{form.location.lat}, {form.location.lng}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Lat (kenglik)</label>
                <input
                  type="number"
                  step="any"
                  value={form.location?.lat || ''}
                  onChange={(e) => set('location', { ...form.location, lat: e.target.value })}
                  placeholder="40.5640"
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Lng (uzunlik)</label>
                <input
                  type="number"
                  step="any"
                  value={form.location?.lng || ''}
                  onChange={(e) => set('location', { ...form.location, lng: e.target.value })}
                  placeholder="65.6895"
                  className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. RASMLAR & 360° VIDEO ── */}
      {activeSubTab === 'media' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Rasmlar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FiImage className="text-violet-500" /> Rasmlar ({form.images?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => imgRef.current?.click()}
                className="px-3 py-1.5 bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 rounded-xl text-xs font-bold hover:bg-violet-100 transition-colors active:scale-95 flex items-center gap-1"
              >
                <FiUpload className="w-3.5 h-3.5" /> {uploading ? 'Yuklanmoqda...' : 'Rasm Yuklash'}
              </button>
              <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
            </div>

            {(form.images || []).filter(Boolean).length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(form.images || []).filter(Boolean).map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                    <SafeImage
                      src={img}
                      fallback={FALLBACK_ATTRACTION}
                      alt={`rasm-${idx}`}
                      className="w-full h-full"
                      imgClassName="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
                    >
                      <FiX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={() => imgRef.current?.click()}
                className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center cursor-pointer hover:border-violet-400 transition-colors"
              >
                <FiImage className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-500">Rasm tanlash uchun bu yerga bosing</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG (maks 5MB)</p>
              </div>
            )}
          </div>

          {/* 360° Video */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FiVideo className="text-indigo-500" /> 360° Virtual Tur
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">YouTube 360° Havolasi</label>
              <input
                value={form.video360?.type === 'file' ? '' : (form.video360?.url || '')}
                onChange={(e) => setForm((p) => ({ ...p, video360: { ...p.video360, url: e.target.value, type: 'youtube' } }))}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-400 cursor-pointer text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors">
                <FiUpload className="w-3.5 h-3.5" />
                {videoUploading ? 'Yuklanmoqda...' : 'Video fayl yuklash'}
                <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(e.target.files?.[0])} />
              </label>
            </div>

            {form.video360?.type === 'file' && form.video360?.url && (
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 text-xs font-bold flex items-center gap-1.5">
                <FiCheck className="w-3.5 h-3.5" /> Video fayl biriktirildi
              </div>
            )}

            <label className="flex items-center gap-2 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!form.video360?.captioned}
                onChange={(e) => setNested('video360', 'captioned', e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600"
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Subtitr (CC) mavjud — inklyuziv</span>
            </label>
          </div>
        </div>
      )}

      {/* ── 3. INKLYUZIVLIK & ATROFDA NIMA BOR ── */}
      {activeSubTab === 'extra' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Inklyuziv qulayliklar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <FiCheck className="text-indigo-500" /> Inklyuziv Qulayliklar
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACCESSIBILITY_OPTS.map((opt) => (
                <label key={opt.key} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-colors">
                  <input
                    type="checkbox"
                    checked={!!form.accessibility?.[opt.key]}
                    onChange={() => toggleAcc(opt.key)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Atrofda nima bor */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FiNavigation className="text-emerald-500" /> Atrofdagi Joylar
              </h3>
              <button
                type="button"
                onClick={addThing}
                className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors active:scale-95 flex items-center gap-1"
              >
                <FiPlus className="w-3.5 h-3.5" /> Qo'shish
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto hide-scrollbar">
              {(form.thingsToSeeAround || []).map((t, idx) => (
                <div key={idx} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-2">
                  <input
                    value={t.title || ''}
                    onChange={(e) => updThing(idx, 'title', e.target.value)}
                    placeholder="Joy nomi"
                    className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold"
                  />
                  <input
                    type="number"
                    value={t.walkingMinutes || ''}
                    onChange={(e) => updThing(idx, 'walkingMinutes', e.target.value)}
                    placeholder="Daqiqa"
                    className="w-16 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center"
                  />
                  <button
                    type="button"
                    onClick={() => rmThing(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {(form.thingsToSeeAround || []).length === 0 && (
                <p className="text-xs text-slate-400 italic py-3 text-center">Atrofdagi obyektlar kiritilmagan</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Picker Modal */}
      <MapPickerModal
        open={showMap}
        onClose={() => setShowMap(false)}
        value={form.location}
        onChange={(loc) => set('location', loc)}
        title="Obyekt joylashuvi"
      />
    </div>
  );
};

export default AttractionForm;
