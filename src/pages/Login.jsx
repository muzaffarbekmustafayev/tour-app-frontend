import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { FiLock, FiMail } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = new URLSearchParams(location.search).get('redirect') || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (redirectTo) {
        navigate(redirectTo, { replace: true });
      } else if (user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (user?.role === 'HOTEL_OWNER') {
        navigate('/owner', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError("Email yoki parol noto'g'ri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-[#0f172a] relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md relative z-10 transition-all duration-500 animate-in fade-in zoom-in-95 duration-700">
        <div className="mb-4"><BackButton /></div>
        <div className="bg-white dark:bg-[#1e293b] p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800">
          <div className="text-center mb-10">
            <div className="inline-block bg-blue-600 p-4 rounded-3xl shadow-lg shadow-blue-200 dark:shadow-none mb-6 group hover:scale-110 transition-transform cursor-pointer">
              <FiLock className="w-8 h-8 text-white mx-auto" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Xush kelibsiz!</h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">Bronlar va sevimlilarni boshqarish uchun kiring.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl px-4 py-3 text-sm font-semibold">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] mb-2 ml-1">Email manzil</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <FiMail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-gray-900 dark:text-white font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em]">Parol</label>
                <Link to="#" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">Parolni unutdingizmi?</Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400 group-focus-within:text-blue-600 transition-colors">
                  <FiLock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl focus:ring-4 focus:ring-blue-600/10 focus:border-blue-600 outline-none text-gray-900 dark:text-white font-medium transition-all"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-xl transition-all active:scale-[0.98] mt-4 flex items-center justify-center space-x-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
              <span>{loading ? 'Kirilmoqda...' : 'Kirish'}</span>
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500 dark:text-gray-400 font-medium">
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-black hover:underline">Ro'yxatdan o'tish</Link>
          </p>
        </div>
        
        <div className="mt-8 flex items-center justify-center space-x-6 text-gray-400">
           <Link to="/" className="text-xs font-bold uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">← Bosh sahifaga</Link>
           <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
           <Link to="#" className="text-xs font-bold uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors">Yordam</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;