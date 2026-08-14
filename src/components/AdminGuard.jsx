import { useState, useEffect } from 'react';
import { verifyAdminPassword } from '../api/problems';
import toast from 'react-hot-toast';
import { Lock, KeyRound, ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function AdminGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('it_admin_key');
    if (savedKey) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Iltimos, admin parolini kiriting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await verifyAdminPassword(password.trim());
      localStorage.setItem('it_admin_key', password.trim());
      setIsAuthenticated(true);
      toast.success('IT Support ruxsati tasdiqlandi! 🔓');
    } catch (err) {
      const msg = err.response?.data?.message || "Noto'g'ri parol! Qayta urinib ko'ring.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)' }}>
        <div className="container" style={{ maxWidth: 460 }}>
          <div className="card" style={{ textAlign: 'center', padding: '36px 32px' }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(59,130,246,0.12)',
                border: '1px solid rgba(59,130,246,0.3)',
                display: 'grid',
                placeItems: 'center',
                margin: '0 auto 20px',
                color: 'var(--accent-light)',
              }}
            >
              <Lock size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', marginBottom: 8 }}>Faqat IT Support uchun</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 24 }}>
              Admin panel va hisobotlarni ko'rish uchun maxsus PIN-kod yoki parolni kiriting.
            </p>

            {error && (
              <div className="alert alert-error" style={{ textAlign: 'left', marginBottom: 20 }}>
                <ShieldAlert size={16} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} noValidate>
              <div className="form-group" style={{ textAlign: 'left', marginBottom: 20 }}>
                <label className="form-label" htmlFor="admin-password">
                  Admin Paroli / PIN-kod
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    className="form-input"
                    placeholder="Parolni kiriting"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    autoFocus
                    style={{ paddingRight: 42 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full btn-lg"
                disabled={loading}
              >
                {loading ? (
                  'Tekshirilmoqda...'
                ) : (
                  <>
                    <KeyRound size={16} />
                    Panelga kirish
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--border)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Oddiy xodimlar uchun{' '}
              <a href="/" style={{ color: 'var(--accent-light)', textDecoration: 'none', fontWeight: 600 }}>
                Muammo yuborish sahifasi
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
