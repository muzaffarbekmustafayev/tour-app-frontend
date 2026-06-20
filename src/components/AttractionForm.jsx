import React, { useState, useRef, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import {
  FiEdit3, FiMapPin, FiImage, FiPlus, FiTrash2, FiX, FiVideo,
  FiNavigation, FiCheck, FiCommand, FiUpload,
} from 'react-icons/fi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapClick = ({ onClick }) => { useMapEvents({ click: (e) => onClick(e.latlng) }); return null; };
const Recenter = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => { if (lat && lng && !isNaN(lat) && !isNaN(lng)) map.setView([lat, lng], map.getZoom() || 13); }, [lat, lng, map]);
  return null;
};
const Resizer = () => {
  const map = useMap();
  useEffect(() => { map.invalidateSize(); const t = setTimeout(() => map.invalidateSize(), 350); return () => clearTimeout(t); }, [map]);
  return null;
};

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

const AttractionForm = ({ form, setForm }) => {
  const { darkMode } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const imgRef = useRef(null);

  const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));
  const setNested = (group, key, val) => setForm((p) => ({ ...p, [group]: { ...p[group], [key]: val } }));

  const handleImages = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    if (!files.length) return;
    const tooBig = files.find((f) => f.size > 5 * 1024 * 1024);
    if (tooBig) return setUploadError(`"${tooBig.name}" 5MB dan katta. Kichikroq rasm tanlang.`);
    setUploadError('');
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('image', file);
        const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        urls.push(res.data.url);
      }
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

  const mapClick = (latlng) => set('location', { lat: latlng.lat.toFixed(6), lng: latlng.lng.toFixed(6) });

  const hasCoords = form.location?.lat && form.location?.lng && !isNaN(Number(form.location.lat)) && !isNaN(Number(form.location.lng));

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

      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><FiNavigation className="text-emerald-500" /> Atrofda nima bor</h2>
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
      </Card>

      <Card>
        <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiMapPin className="text-rose-500" /> Lokatsiya (yaqin maskanlar uchun zarur)</h2>
        <button type="button" onClick={() => setShowMap(true)}
          className="w-full mb-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
          <FiNavigation className="w-4 h-4" /> Xaritadan belgilash
        </button>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Kenglik (lat)</Label><Input type="number" step="any" value={form.location?.lat || ''} onChange={(e) => set('location', { ...form.location, lat: e.target.value })} placeholder="40.5640" /></div>
          <div><Label>Uzunlik (lng)</Label><Input type="number" step="any" value={form.location?.lng || ''} onChange={(e) => set('location', { ...form.location, lng: e.target.value })} placeholder="65.6895" /></div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2">🌿 Joy atmosferasi</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><Label>Kayfiyat</Label><Input value={form.atmosphere?.mood} onChange={(e) => setNested('atmosphere', 'mood', e.target.value)} placeholder="Tinch va ziyoratbop" /></div>
          <div><Label>Eng yaxshi vaqt</Label><Input value={form.atmosphere?.bestTimeOfDay} onChange={(e) => setNested('atmosphere', 'bestTimeOfDay', e.target.value)} placeholder="Erta tong" /></div>
          <div className="md:col-span-2"><Label>Ovoz manzarasi</Label><Input value={form.atmosphere?.soundscape} onChange={(e) => setNested('atmosphere', 'soundscape', e.target.value)} placeholder="Buloq suvining shildirashi..." /></div>
          <div className="md:col-span-2"><Label>Mahalliy maslahat</Label><Input value={form.atmosphere?.localTip} onChange={(e) => setNested('atmosphere', 'localTip', e.target.value)} placeholder="Foydali maslahat" /></div>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-bold mb-5 text-slate-900 dark:text-white flex items-center gap-2"><FiCommand className="text-indigo-500" /> Inklyuziv qulayliklar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ACCESSIBILITY_OPTS.map((opt) => (
            <label key={opt.key} className="flex items-center gap-3 cursor-pointer p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-all">
              <input type="checkbox" checked={!!form.accessibility?.[opt.key]} onChange={() => toggleAcc(opt.key)} className="w-5 h-5 rounded text-indigo-600" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{opt.label}</span>
            </label>
          ))}
        </div>
      </Card>

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
                <img src={img} alt={`rasm-${idx}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(idx)} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-slate-900/80 hover:bg-rose-600 text-white flex items-center justify-center"><FiX className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showMap && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Xaritadan joylashuvni belgilang</h3>
              <button onClick={() => setShowMap(false)} className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="flex-1 min-h-[380px] relative">
              <MapContainer
                center={hasCoords ? [Number(form.location.lat), Number(form.location.lng)] : [40.0842, 65.3791]}
                zoom={hasCoords ? 13 : 8} style={{ height: '100%', width: '100%', minHeight: 380 }}>
                <TileLayer url={darkMode ? 'https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'} />
                <MapClick onClick={mapClick} />
                <Resizer />
                {hasCoords && (<><Marker position={[Number(form.location.lat), Number(form.location.lng)]} /><Recenter lat={Number(form.location.lat)} lng={Number(form.location.lng)} /></>)}
              </MapContainer>
            </div>
            <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-900/40">
              <span className="text-xs font-mono text-slate-500">LAT: {form.location?.lat || '—'} | LNG: {form.location?.lng || '—'}</span>
              <button onClick={() => setShowMap(false)} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2"><FiCheck className="w-4 h-4" /> Tasdiqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttractionForm;
