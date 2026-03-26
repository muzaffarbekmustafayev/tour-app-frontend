import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { FiUser, FiMail, FiLock, FiChevronDown, FiMapPin } from 'react-icons/fi';

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

  const inputStyle = {
    width: '100%',
    paddingLeft: '3rem',
    paddingRight: '1rem',
    paddingTop: '0.825rem',
    paddingBottom: '0.825rem',
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

  const focusStyle = (e) => {
    e.target.style.borderColor = '#6366F1';
    e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.12)';
    e.target.style.background = 'rgba(99,102,241,0.08)';
  };
  const blurStyle = (e) => {
    e.target.style.borderColor = 'var(--border)';
    e.target.style.boxShadow = 'none';
    e.target.style.background = 'rgba(99,102,241,0.05)';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{ background: 'var(--gradient-bg)' }}>
      {/* Background blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-25 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.4), transparent)', filter: 'blur(80px)', transform: 'translate(-30%, -30%)' }} />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.4), transparent)', filter: 'blur(80px)', transform: 'translate(30%, 30%)' }} />

      <div className="w-full max-w-sm relative z-10">
        <div className="mb-5"><BackButton /></div>

        <div className="glass-panel p-8" style={{ borderRadius: '2rem' }}>
          {/* Brand */}
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{ background: 'var(--gradient-main)', boxShadow: 'var(--shadow-colored)' }}>
              <FiMapPin className="w-7 h-7 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black mb-1.5" style={{ color: 'var(--text-main)' }}>
              NavaiTour'ga qo'shiling 🚀
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
              Eng yaxshi mehmonxonalarni band qilish uchun ro'yxatdan o'ting.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-2xl text-sm font-semibold flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '7px' }}>
                To'liq ism
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input type="text" name="name" placeholder="Ism Familiya"
                  value={formData.name} onChange={handleChange}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} required />
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '7px' }}>
                Email manzil
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input type="email" name="email" placeholder="email@example.com"
                  value={formData.email} onChange={handleChange}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} required />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '7px' }}>
                Parol
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                <input type="password" name="password" placeholder="Kuchli parol yarating"
                  value={formData.password} onChange={handleChange}
                  style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} required />
              </div>
            </div>

            {/* Role */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '7px' }}>
                Men...
              </label>
              <div className="relative">
                <select name="role" value={formData.role} onChange={handleChange}
                  style={{ ...inputStyle, paddingLeft: '1rem', appearance: 'none' }}
                  onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="CUSTOMER">Sayohatchi / Mijoz</option>
                  <option value="HOTEL_OWNER">Mehmonxona egasi</option>
                </select>
                <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2"
              style={{ marginTop: '4px', opacity: loading ? 0.75 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish →"}
            </button>
          </form>

          <p className="mt-7 text-center font-medium" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Hisobingiz bormi?{' '}
            <Link to="/login" style={{ color: '#6366F1', fontWeight: 800, textDecoration: 'none' }}>Kirish</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
