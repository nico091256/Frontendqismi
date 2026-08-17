import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, loginUser } from '../api/problems';
import toast from 'react-hot-toast';
import {
  Phone, Lock, User, Eye, EyeOff, ArrowRight,
  ShieldCheck, Headphones, KeyRound, Sparkles, UserCog
} from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showManagerCode, setShowManagerCode] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginForm, setLoginForm] = useState({ phone: '', password: '' });

  // Register form
  const [registerForm, setRegisterForm] = useState({
    fullName: '', phone: '', password: '', role: 'IT_SUPPORT', managerCode: ''
  });

  // ── Login ──────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.phone.trim() || !loginForm.password.trim()) {
      setError("Iltimos, barcha maydonlarni to'ldiring.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await loginUser({ phone: loginForm.phone.trim(), password: loginForm.password.trim() });
      const { user } = res.data;
      localStorage.setItem('it_auth', JSON.stringify(user));
      toast.success(`Xush kelibsiz, ${user.fullName}! 👋`);
      if (user.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Telefon raqam yoki parol noto'g'ri.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Register ───────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    const { fullName, phone, password, role, managerCode } = registerForm;
    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      setError("Iltimos, barcha majburiy maydonlarni to'ldiring.");
      return;
    }
    if (password.length < 4) {
      setError("Parol kamida 4 ta belgidan iborat bo'lishi kerak.");
      return;
    }
    if (role === 'MANAGER' && !managerCode.trim()) {
      setError("Manager roli uchun maxsus kod kiritilishi shart.");
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await registerUser({ fullName: fullName.trim(), phone: phone.trim(), password, role, managerCode: managerCode.trim() });
      const { user } = res.data;
      localStorage.setItem('it_auth', JSON.stringify(user));
      toast.success(`Ro'yxatdan muvaffaqiyatli o'tdingiz! 🎉`);
      if (user.role === 'MANAGER') {
        navigate('/manager');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      const msg = err.response?.data?.message || (err.message === 'Network Error' ? "Server bilan aloqa o'rnatilmadi. Iltimos 10 soniya kuting va qayta urinib ko'ring." : "Ro'yxatdan o'tishda xatolik yuz berdi.");
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '20px',
    }}>
      {/* Background gradient */}
      <div style={{
        position: 'fixed', inset: 0,
        background: 'radial-gradient(ellipse at 20% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 50%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: 440, position: 'relative' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '18px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            display: 'grid', placeItems: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(99,102,241,0.3)',
          }}>
            <Headphones size={30} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
            IT Yordam Tizimi
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            IT Support Panel — Xodimlar uchun
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>

          {/* Tabs */}
          <div style={{
            display: 'flex', gap: 4, marginBottom: 28,
            background: 'var(--bg-input)', borderRadius: 10, padding: 4,
          }}>
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
                transition: 'all 0.2s',
                background: tab === 'login' ? 'var(--accent)' : 'transparent',
                color: tab === 'login' ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <KeyRound size={15} /> Kirish
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setError(''); }}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 8, border: 'none',
                cursor: 'pointer', fontSize: '0.88rem', fontWeight: 600,
                transition: 'all 0.2s',
                background: tab === 'register' ? 'var(--accent)' : 'transparent',
                color: tab === 'register' ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Sparkles size={15} /> Ro'yxatdan o'tish
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* ── LOGIN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" htmlFor="login-phone">
                  Telefon raqam
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-phone"
                    type="tel"
                    className="form-input"
                    placeholder="+998 90 123 45 67"
                    value={loginForm.phone}
                    onChange={(e) => { setLoginForm(p => ({ ...p, phone: e.target.value })); setError(''); }}
                    style={{ paddingLeft: 40 }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <label className="form-label" htmlFor="login-password">Parol</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Parolni kiriting"
                    value={loginForm.password}
                    onChange={(e) => { setLoginForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                    style={{ paddingLeft: 40, paddingRight: 42 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                {loading ? 'Tekshirilmoqda...' : (
                  <><KeyRound size={16} /> Kirish <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}

          {/* ── REGISTER FORM ── */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} noValidate>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" htmlFor="reg-name">Ism, Familiya *</label>
                <div style={{ position: 'relative' }}>
                  <User size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-name"
                    type="text"
                    className="form-input"
                    placeholder="Ali Karimov"
                    value={registerForm.fullName}
                    onChange={(e) => { setRegisterForm(p => ({ ...p, fullName: e.target.value })); setError(''); }}
                    style={{ paddingLeft: 40 }}
                    autoFocus
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" htmlFor="reg-phone">Telefon raqam *</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-phone"
                    type="tel"
                    className="form-input"
                    placeholder="+998 90 123 45 67"
                    value={registerForm.phone}
                    onChange={(e) => { setRegisterForm(p => ({ ...p, phone: e.target.value })); setError(''); }}
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label" htmlFor="reg-password">Parol * (kamida 4 ta belgi)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Parol yarating"
                    value={registerForm.password}
                    onChange={(e) => { setRegisterForm(p => ({ ...p, password: e.target.value })); setError(''); }}
                    style={{ paddingLeft: 40, paddingRight: 42 }}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Rol tanlash */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Rol tanlang *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { value: 'IT_SUPPORT', label: 'IT Support', icon: Headphones, color: '#3b82f6' },
                    { value: 'MANAGER',    label: 'Manager',    icon: UserCog,    color: '#8b5cf6' },
                  ].map(({ value, label, icon: Icon, color }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => { setRegisterForm(p => ({ ...p, role: value, managerCode: '' })); setError(''); }}
                      style={{
                        padding: '12px 10px', borderRadius: 10,
                        border: `2px solid ${registerForm.role === value ? color : 'var(--border)'}`,
                        background: registerForm.role === value ? `${color}18` : 'transparent',
                        color: registerForm.role === value ? color : 'var(--text-secondary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        gap: 8, fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                      }}
                    >
                      <Icon size={16} /> {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manager maxsus kodi */}
              {registerForm.role === 'MANAGER' && (
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label className="form-label" htmlFor="reg-mgr-code">
                    🔑 Manager maxsus kodi *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={17} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                    <input
                      id="reg-mgr-code"
                      type={showManagerCode ? 'text' : 'password'}
                      className="form-input"
                      placeholder="Maxsus kodni kiriting"
                      value={registerForm.managerCode}
                      onChange={(e) => { setRegisterForm(p => ({ ...p, managerCode: e.target.value })); setError(''); }}
                      style={{ paddingLeft: 40, paddingRight: 42, borderColor: '#8b5cf6' }}
                    />
                    <button type="button" onClick={() => setShowManagerCode(!showManagerCode)}
                      style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                      {showManagerCode ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>
                    Manager roli uchun tashkilot tomonidan berilgan maxsus kodni kiriting.
                  </p>
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}
                style={{ marginTop: 8 }}>
                {loading ? "Ro'yxatdan o'tilmoqda..." : (
                  <><Sparkles size={16} /> Ro'yxatdan o'tish <ArrowRight size={16} /></>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Murojaat yuborish uchun →{' '}
          <a href="http://localhost:5175" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
            Murojaat portali
          </a>
        </p>
      </div>
    </div>
  );
}
