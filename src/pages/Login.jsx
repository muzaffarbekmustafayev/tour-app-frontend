import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { FiLock, FiMail, FiMapPin, FiAlertTriangle, FiEye, FiEyeOff } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const inputStyle = {
    width: '100%',
    paddingLeft: '3rem',
    paddingRight: '3rem',
    paddingTop: '0.875rem',
    paddingBottom: '0.875rem',
    background: 'rgba(99,102,241,0.05)',
    border: '1.5px solid var(--border)',
    borderRadius: '1rem',
    outline: 'none',
    color: 'var(--text-main)',
    fontWeight: 600,
    fontSize: '0.9375rem',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden lg:pl-32"

      style={{ background: 'var(--gradient-bg)' }}>
      {/* Background decorative blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent)', filter: 'blur(80px)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.4), transparent)', filter: 'blur(80px)', transform: 'translate(-30%, 30%)' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-5"><BackButton /></div>

        {/* Card */}
        <div className="glass-panel p-8" style={{ borderRadius: '2rem' }}>
          {/* Logo / Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
              style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}>
              <FiMapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black mb-1.5" style={{ color: 'var(--text-main)' }}>
              Xush kelibsiz!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
              Bronlar va sevimlilarni boshqarish uchun kiring.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              <FiAlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '8px' }}>
                Email manzil
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = 'rgba(99,102,241,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(99,102,241,0.05)'; }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                  Parol
                </label>
                <Link to="#" style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1', textDecoration: 'none' }}>
                  Parolni unutdingizmi?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = 'rgba(99,102,241,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(99,102,241,0.05)'; }}
                  required
                />
                {/* Show/Hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80 active:scale-90"
                  tabIndex={-1}
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label={showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2"
              style={{ marginTop: '8px', opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Kirilmoqda...' : 'Kirish →'}
            </button>
          </form>

          <p className="mt-8 text-center font-medium" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" style={{ color: '#6366F1', fontWeight: 800, textDecoration: 'none' }}>
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>

        <div className="mt-6 flex items-center justify-center gap-5">
          <Link to="/" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
            ← Bosh sahifaga
          </Link>
          <span style={{ width: '4px', height: '4px', background: 'var(--border)', borderRadius: '50%', display: 'inline-block' }} />
          <Link to="#" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
            Yordam
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;