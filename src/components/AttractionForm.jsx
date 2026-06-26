import React, { useState, useRef } from 'react';
import api from '../services/api';
import MapPickerModal from './MapPickerModal';
import { imgSrc } from '../utils/media';
import { parseLocationInput } from '../utils/geo';
import {
  FiEdit3, FiMapPin, FiImage, FiPlus, FiTrash2, FiX, FiVideo,
  FiNavigation, FiCheck, FiCommand, FiUpload, FiClock, FiFeather,
  FiLink, FiChevronDown,
} from 'react-icons/fi';

export const DISTRICTS = ['Nurota', 'Xatirchi', 'Qiziltepa'];

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

const THING_TYPES = ['tabiat', 'tarix', 'bozor', 'ovqat', 'diniy', 'boshqa'];

export const emptyAttractionTemplate = {
  name: '', district: 'Nurota', description: '', descriptionShort: '',
  images: [],
  video360: { url: '', type: 'youtube', captioned: false },
  thingsToSeeAround: [],
  location: { lat: '', lng: '' },
  address: '',
  accessibility: {},
  atmosphere: { mood: '', soundscape: '', bestTimeOfDay: '', localTip: '' },
  peakInfo: { peak: '', quiet: '', note: '' },
  bestSeason: '', entryFee: '',
};

const Input = (props) => (
  <input {...props} className={"w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-all text-slate-900 dark:text-white " + (props.className || '')} />
);
const Label = ({ children }) => (
  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">{children}</label>
);
const Card = ({ children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200/60 dark:border-slate-800 shadow-sm mb-6">{children}</div>
);

// Ixtiyoriy bo'limlar — yopiq holatda boshlanadi, forma yengilroq ko'rinadi
const Collapsible = ({ title, icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm mb-6 overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-6 md:px-8 py-5 text-left">
        <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">{icon} {title}</span>
        <span className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
          {!open && 'Ixtiyoriy'}
          <FiChevronDown className={`w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      {open && <div className="px-6 md:px-8 pb-6 md:pb-8">{children}</div>}
    </div>
  );
};

const AttractionForm = ({ form, setForm }) => {
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [locLink, setLocLink] = useState('');
  const [locLinkError, setLocLinkError] = useState('');
  const imgRef = useRef(null);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setNested = (group, key, val) => setForm((p) => ({ ...p, [group]: { ...p[group], [key]: val } }));

  // Google/Yandex/OSM xarita havolasi yoki "lat, lng" matnidan koordinata olish
  const applyLocLink = () => {
    const parsed = parseLocationInput(locLink);
    if (!parsed) {
      setLocLinkError('Koordinata topilmadi. "40.56, 65.68" yoki xarita havolasini joylang.');
      return;
    }
    setLocLinkError('');
    setLocLink('');
    set('location', { lat: String(parsed.lat), lng: String(parsed.lng) });
  };

  const handleImages = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const tooBig = files.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) return setUploadError(`"${tooBig.name}" 5MB dan katta. Kichikroq rasm tanlang.`);
    setUploadError('');
    setUploading(true);
    try {
      // Barcha tanlangan rasmlarni bitta so'rovda yuklaymiz
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
    <div className="animate-fade-in">
      {uploadError && (
        <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400">
          <FiX className="w-5 h-5 shrink-0 mt-0.5 cursor-pointer" onClick={() => setUploadError('')} />
          <p className="text-sm font-semibold">{uploadError}</p>
        </div>
      )}
      <Card>
        <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiEdit3 className="text-amber-500" /> Umumiy ma'lumot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Nomi *</Label>
            <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Masalan: Nurota Chashma majmuasi" />
          </div>
          <div>
            <Label>Tuman *</Label>
            <select value={form.district} onChange={(e) => set('district', e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-900 dark:text-white">
              {DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <Label>Kirish narxi</Label>
            <Input value={form.entryFee} onChange={(e) => set('entryFee', e.target.value)} placeholder="Bepul / 20 000 so'm" />
          </div>
          <div className="md:col-span-2">
            <Label>Qisqa tavsif</Label>
            <Input value={form.descriptionShort} onChange={(e) => set('descriptionShort', e.target.value)} placeholder="Bir jumlali tavsif (kartochkada chiqadi)" />
          </div>
          <div className="md:col-span-2">
            <Label>To'liq tavsif</Label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={4}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 text-slate-900 dark:text-white" />
          </div>
          <div>
            <Label>Eng yaxshi mavsum</Label>
            <Input value={form.bestSeason} onChange={(e) => set('bestSeason', e.target.value)} placeholder="Bahor va kuz" />
          </div>
          <div>
            <Label>Manzil</Label>
            <Input value={form.address} onChange={(e) => set('address', e.target.value)} placeholder="Ko'cha, qishloq" />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiVideo className="text-indigo-500" /> 360° Video</h2>
        <Label>YouTube link</Label>
        <Input value={form.video360?.type === 'file' ? '' : (form.video360?.url || '')}
          onChange={(e) => setForm((p) => ({ ...p, video360: { ...p.video360, url: e.target.value, type: 'youtube' } }))}
          placeholder="https://youtube.com/watch?v=..." />
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          <span className="text-[11px] font-bold text-slate-400 uppercase">yoki fayl yuklang</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
        </div>
        <label className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 cursor-pointer hover:border-indigo-400 transition-all text-sm font-bold text-slate-600 dark:text-slate-300">
          <FiUpload className="w-4 h-4" />
          {videoUploading ? 'Yuklanmoqda...' : 'Video fayl tanlash (maks 100MB)'}
          <input type="file" accept="video/*" className="hidden" onChange={(e) => handleVideoFile(e.target.files?.[0])} />
        </label>
        {form.video360?.type === 'file' && form.video360?.url && (
          <p className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-1"><FiCheck className="w-3.5 h-3.5" /> Video fayl yuklandi</p>
        )}
        <label className="flex items-center gap-2 mt-4 cursor-pointer">
          <input type="checkbox" checked={!!form.video360?.captioned} onChange={(e) => setNested('video360', 'captioned', e.target.checked)} className="w-4 h-4 rounded text-indigo-600" />
          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Subtitr (CC) mavjud — inklyuziv</span>
        </label>
      </Card>

      <Collapsible title="Atrofda nima bor" icon={<FiNavigation className="text-emerald-500" />}>
        <div className="flex justify-end mb-4">
          <button type="button" onClick={addThing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 transition-all">
            <FiPlus className="w-4 h-4" /> Qo'shish
          </button>
        </div>
        {(form.thingsToSeeAround || []).length === 0 && <p className="text-xs text-slate-400 italic">Hali element qo'shilmagan.</p>}
        <div className="space-y-4">
          {(form.thingsToSeeAround || []).map((t, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/50 relative">
              <button type="button" onClick={() => rmThing(idx)} className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-white hover:bg-rose-500 rounded-lg transition-all"><FiTrash2 className="w-4 h-4" /></button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                <Input value={t.title} onChange={(e) => updThing(idx, 'title', e.target.value)} placeholder="Sarlavha" />
                <select value={t.type} onChange={(e) => updThing(idx, 'type', e.target.value)}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-sm outline-none text-slate-900 dark:text-white">
                  {THING_TYPES.map((tt) => <option key={tt} value={tt}>{tt}</option>)}
                </select>
                <Input value={t.description} onChange={(e) => updThing(idx, 'description', e.target.value)} placeholder="Qisqa tavsif" className="sm:col-span-2" />
                <Input type="number" value={t.walkingMinutes} onChange={(e) => updThing(idx, 'walkingMinutes', e.target.value)} placeholder="Piyoda daqiqa" />
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      <Card>
        <h2 className="text-sm font-bold mb-1 text-slate-900 dark:text-white flex items-center gap-2"><FiMapPin className="text-rose-500" /> Lokatsiya</h2>
        <p className="text-[11px] text-slate-400 mb-4">Yaqin mehmonxonalarni avtomatik aniqlash uchun zarur. Eng osoni — xarita havolasini joylash.</p>

        {/* Eng oson usul — havola yoki koordinata */}
        <Label>Xarita havolasi yoki koordinata</Label>
        <div className="flex items-stretch gap-2 mb-3">
          <div className="relative flex-1">
            <FiLink className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input value={locLink}
              onChange={(e) => { setLocLink(e.target.value); setLocLinkError(''); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLocLink(); } }}
              placeholder="40.5640, 65.6895 yoki Google Maps havolasi" className="!pl-9" />
          </div>
          <button type="button" onClick={applyLocLink}
            className="px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors active:scale-95 shrink-0">
            Qo'yish
          </button>
        </div>
        {locLinkError && <p className="text-[11px] font-bold text-rose-500 mb-3 ml-1">{locLinkError}</p>}

        <button type="button" onClick={() => setShowMap(true)}
          className="w-full mb-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition-all">
          <FiNavigation className="w-4 h-4" /> Yoki xaritadan belgilash
        </button>

        {form.location?.lat && form.location?.lng && (
          <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400">
            <FiCheck className="w-4 h-4 shrink-0" />
            <p className="text-[11px] font-bold font-mono truncate">Tanlandi: {form.location.lat}, {form.location.lng}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div><Label>Kenglik (lat)</Label><Input type="number" step="any" value={form.location?.lat || ''} onChange={(e) => set('location', { ...form.location, lat: e.target.value })} placeholder="40.5640" /></div>
          <div><Label>Uzunlik (lng)</Label><Input type="number" step="any" value={form.location?.lng || ''} onChange={(e) => set('location', { ...form.location, lng: e.target.value })} placeholder="65.6895" /></div>
        </div>
      </Card>

      <Collapsible title="Joy atmosferasi" icon={<FiFeather className="text-emerald-500" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Kayfiyat</Label><Input value={form.atmosphere?.mood} onChange={(e) => setNested('atmosphere', 'mood', e.target.value)} placeholder="Tinch va ziyoratbop" /></div>
          <div><Label>Eng yaxshi vaqt</Label><Input value={form.atmosphere?.bestTimeOfDay} onChange={(e) => setNested('atmosphere', 'bestTimeOfDay', e.target.value)} placeholder="Erta tong" /></div>
          <div className="md:col-span-2"><Label>Ovoz manzarasi</Label><Input value={form.atmosphere?.soundscape} onChange={(e) => setNested('atmosphere', 'soundscape', e.target.value)} placeholder="Buloq suvining shildirashi..." /></div>
          <div className="md:col-span-2"><Label>Mahalliy maslahat</Label><Input value={form.atmosphere?.localTip} onChange={(e) => setNested('atmosphere', 'localTip', e.target.value)} placeholder="Foydali maslahat" /></div>
        </div>
      </Collapsible>

      <Collapsible title="Pik va tinch vaqtlar" icon={<FiClock className="text-rose-500" />}>
        <p className="text-[11px] text-slate-400 mb-5">Bo'sh qoldirsangiz, AI yordamchi "eng yaxshi vaqt" va mavsumdan avtomatik aniqlaydi.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Pik (gavjum) vaqt</Label><Input value={form.peakInfo?.peak || ''} onChange={(e) => setNested('peakInfo', 'peak', e.target.value)} placeholder="Hafta oxiri 11:00–16:00, bayramlar" /></div>
          <div><Label>Tinch vaqt</Label><Input value={form.peakInfo?.quiet || ''} onChange={(e) => setNested('peakInfo', 'quiet', e.target.value)} placeholder="Erta tong va ish kunlari" /></div>
          <div className="md:col-span-2"><Label>Qo'shimcha izoh</Label><Input value={form.peakInfo?.note || ''} onChange={(e) => setNested('peakInfo', 'note', e.target.value)} placeholder="Masalan: Juma kuni ziyoratchilar ko'p bo'ladi" /></div>
        </div>
      </Collapsible>

      <Collapsible title="Inklyuziv qulayliklar" icon={<FiCommand className="text-indigo-500" />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACCESSIBILITY_OPTS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all">
              <input type="checkbox" checked={!!form.accessibility?.[opt.key]} onChange={() => toggleAcc(opt.key)} className="w-5 h-5 rounded text-indigo-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </Collapsible>

      <Card>
        <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiImage className="text-violet-500" /> Rasmlar</h2>
        <div onClick={() => imgRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-8 text-center hover:border-indigo-400 transition-all mb-4">
          <FiUpload className="w-7 h-7 mx-auto mb-2 text-slate-400" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{uploading ? 'Yuklanmoqda...' : 'Rasm tanlash uchun bosing'}</p>
          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG — har biri maks 5MB.</p>
          <input ref={imgRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleImages(e.target.files)} />
        </div>
        {(form.images || []).filter(Boolean).length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {(form.images || []).filter(Boolean).map((img, idx) => (
              <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={imgSrc(img)} alt={`rasm-${idx}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center"><FiX className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <MapPickerModal
        open={showMap}
        onClose={() => setShowMap(false)}
        value={form.location}
        onChange={(loc) => set('location', loc)}
        title="Tarixiy joy joylashuvi"
      />
    </div>
  );
};

export default AttractionForm;
