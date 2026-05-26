import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { FiLock, FiMail, FiMapPin, FiAlertTriangle, FiEye, FiEyeOff } from 'react-icons/fi';

/* Google "G" logotipi */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Login = () => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showPassword, setShowPass] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [gLoading, setGLoading]     = useState(false);
  const [error, setError]           = useState('');

  const { login, loginWithGoogle } = useContext(AuthContext);
  const navigate   = useNavigate();
  const location   = useLocation();
  const redirectTo = new URLSearchParams(location.search).get('redirect') || null;
  const goNext     = () => navigate(redirectTo || '/', { replace: true });

  /* ── Email / parol login ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login(email, password);
      goNext();
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Email yoki parol noto'g'ri.");
    } finally {
      setLoading(false);
    }
  };

  /* ── Google login (implicit flow → access_token) ── */
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGLoading(true); setError('');
      try {
        await loginWithGoogle(tokenResponse.access_token);
        goNext();
      } catch (err) {
        setError(err.response?.data?.message || 'Google orqali kirishda xatolik.');
      } finally {
        setGLoading(false);
      }
    },
    onError: () => setError('Google kirish bekor qilindi yoki xato yuz berdi.'),
    flow: 'implicit',
  });

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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
      style={{ background: 'var(--gradient-bg)' }}>

      {/* Bezak bloblar */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent)', filter: 'blur(80px)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.4), transparent)', filter: 'blur(80px)', transform: 'translate(-30%, 30%)' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-5"><BackButton /></div>

        {/* Karta */}
        <div className="glass-panel p-6 sm:p-8" style={{ borderRadius: '2rem' }}>

          {/* Brend */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}>
              <FiMapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black mb-1.5" style={{ color: 'var(--text-main)' }}>
              Xush kelibsiz!
            </h1>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
              Sevimlilar va profilni boshqarish uchun kiring.
            </p>
          </div>

          {/* Xato xabari */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              <FiAlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* ── Google tugmasi ── */}
          <button
            type="button"
            onClick={() => googleLogin()}
            disabled={gLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 press-effect mb-5"
            style={{
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border)',
              color: 'var(--text-main)',
              boxShadow: 'var(--shadow-sm)',
              opacity: gLoading ? 0.75 : 1,
              cursor: gLoading ? 'not-allowed' : 'pointer',
              minHeight: 48,
            }}
          >
            {gLoading
              ? <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              : <GoogleIcon />
            }
            {gLoading ? 'Kirilmoqda...' : 'Google bilan kirish'}
          </button>

          {/* Ajratuvchi */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>yoki</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* ── Email / Parol formasi ── */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '8px' }}>
                Email manzil
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
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

            {/* Parol */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em' }}>
                  Parol
                </label>
                <Link to="#" style={{ fontSize: '12px', fontWeight: 700, color: '#6366F1', textDecoration: 'none' }}>
                  Unutdingizmi?
                </Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#6366F1'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)'; e.target.style.background = 'rgba(99,102,241,0.08)'; }}
                  onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(99,102,241,0.05)'; }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-80 active:scale-90"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  aria-label={showPassword ? 'Parolni yashirish' : "Parolni ko'rsatish"}
                >
                  {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Yuborish */}
            <button
              type="submit"
              id="login-submit"
              disabled={loading || gLoading}
              className="btn-primary w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2"
              style={{ opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
            >
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Kirilmoqda...' : 'Kirish →'}
            </button>
          </form>

          <p className="mt-7 text-center font-medium text-sm" style={{ color: 'var(--text-muted)' }}>
            Hisobingiz yo'qmi?{' '}
            <Link to="/register" style={{ color: '#6366F1', fontWeight: 800, textDecoration: 'none' }}>
              Ro'yxatdan o'tish
            </Link>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-center gap-5">
          <Link to="/" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
            ← Bosh sahifa
          </Link>
          <span style={{ width: 4, height: 4, background: 'var(--border)', borderRadius: '50%', display: 'inline-block' }} />
          <Link to="#" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', textDecoration: 'none' }}>
            Yordam
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
