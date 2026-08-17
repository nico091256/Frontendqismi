import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, BarChart3, LogOut, ClipboardList, UserCog, Headphones } from 'lucide-react';
import toast from 'react-hot-toast';
import { logoutUser } from '../api/problems';

export default function Navbar() {
  const [auth, setAuth] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const readAuth = () => {
      try {
        const raw = localStorage.getItem('it_auth');
        setAuth(raw ? JSON.parse(raw) : null);
      } catch {
        setAuth(null);
      }
    };
    readAuth();
    window.addEventListener('storage', readAuth);
    return () => window.removeEventListener('storage', readAuth);
  }, [location]);

  const handleLogout = async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    localStorage.removeItem('it_auth');
    setAuth(null);
    toast.success("Tizimdan chiqildi 🔒");
    navigate('/login');
  };

  const isManager   = auth?.role === 'MANAGER';
  const isITSupport = auth?.role === 'IT_SUPPORT';

  // Login sahifasida navbar ko'rinmasin
  if (location.pathname === '/login') return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to={isManager ? '/manager' : '/admin'} className="navbar-brand">
          <div className="brand-icon">
            {isManager ? <UserCog size={18} color="#8b5cf6" /> : <Headphones size={18} color="#3b82f6" />}
          </div>
          <span>{isManager ? 'Rahbar Paneli' : 'IT Support'}</span>
        </NavLink>

        {/* Nav links */}
        <div className="navbar-nav">
          {/* Manager linklari */}
          {isManager && (
            <>
              <NavLink to="/manager" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <UserCog size={15} />
                Rahbar Paneli
              </NavLink>
              <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <LayoutDashboard size={15} />
                Admin Panel
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <BarChart3 size={15} />
                Hisobotlar
              </NavLink>
            </>
          )}

          {/* IT Support linklari */}
          {isITSupport && (
            <>
              <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <LayoutDashboard size={15} />
                Admin Panel
              </NavLink>
              <NavLink to="/reports" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <BarChart3 size={15} />
                Hisobotlar
              </NavLink>
              <NavLink to="/tasks" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
                <ClipboardList size={15} />
                Topshiriqlar
              </NavLink>
            </>
          )}

          {/* Foydalanuvchi ismi */}
          {auth && (
            <span style={{
              fontSize: '0.8rem', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '0 8px', borderLeft: '1px solid var(--border)',
            }}>
              👤 {auth.fullName}
            </span>
          )}

          {/* Chiqish */}
          {auth && (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm"
              title="Tizimdan chiqish"
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
              <LogOut size={14} />
              Chiqish
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
