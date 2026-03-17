import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'CUSTOMER' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(formData);
      navigate('/');
    } catch {
      setError("Ro'yxatdan o'tishda xatolik. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0f172a] relative overflow-hidden">
      <div className="absolute top-0 left-0 -translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-4"><BackButton /></div>
        <div className="bg-white dark:bg-[#1e293b] p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">NavaiTour'ga qo'shiling</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Eng yaxshi mehmonxonalarni band qilish uchun ro'yxatdan o'ting.</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl px-4 py-3 text-sm font-semibold mb-5">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">To'liq ism</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input type="text" name="name" placeholder="Ism Familiya" value={formData.name} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-gray-900 dark:text-white font-medium transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Email manzil</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </div>
                <input type="email" name="email" placeholder="email@example.com" value={formData.email} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-gray-900 dark:text-white font-medium transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Parol</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input type="password" name="password" placeholder="Kuchli parol yarating" value={formData.password} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-gray-900 dark:text-white font-medium transition-all" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Men...</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-gray-900 dark:text-white font-medium transition-all appearance-none">
                  <option value="CUSTOMER">Sayohatchi / Mijoz</option>
                  <option value="HOTEL_OWNER">Mehmonxona egasi</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className={`w-full bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-2 flex items-center justify-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Ro\'yxatdan o\'tilmoqda...' : 'Ro\'yxatdan o\'tish'}</span>
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 dark:text-gray-400 font-medium">
            Hisobingiz bormi?{' '}
            <Link to="/login" className="text-blue-600 dark:text-blue-400 font-black hover:underline">Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
