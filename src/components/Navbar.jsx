import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, LogOut, ClipboardList, 
  UserCog, Headphones, Bell, User, Gauge
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logoutUser, getNewCount } from '../api/problems';

export default function Navbar() {
  const [auth, setAuth] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const prevCountRef = useRef(0);
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

  // ── Polling for new problems notification (#1) ───────────
  useEffect(() => {
    if (!auth) return;

    let isMounted = true;
    const checkNotification = async () => {
      try {
        const res = await getNewCount();
        const count = res.data.count || 0;
        if (isMounted) {
          if (count > prevCountRef.current && prevCountRef.current !== 0) {
            toast(`🔔 Yangi murojaat kelib tushdi! (Jami yangi: ${count})`, {
              duration: 5000,
              icon: '📩',
              style: {
                background: '#1e1b4b',
                color: '#e0e7ff',
                border: '1px solid #6366f1'
              }
            });
          }
          prevCountRef.current = count;
          setNewCount(count);
        }
      } catch {
        /* ignore network/auth drops */
      }
    };

    checkNotification();
    const interval = setInterval(checkNotification, 20000); // 20 sec polling
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [auth]);

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
        <NavLink to="/dashboard" className="navbar-brand">
          <div className="brand-icon">
            {isManager ? <UserCog size={18} color="#8b5cf6" /> : <Headphones size={18} color="#3b82f6" />}
          </div>
          <span>{isManager ? 'Rahbar Paneli' : 'IT Support'}</span>
        </NavLink>

        {/* Nav links */}
        <div className="navbar-nav" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          
          {/* Dashboard link (#2) */}
          <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <Gauge size={15} />
            Dashboard
          </NavLink>

          {/* Admin Panel Link */}
          <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} style={{ position: 'relative' }}>
            <LayoutDashboard size={15} />
            Murojaatlar
            {newCount > 0 && (
              <span style={{
                background: '#ef4444',
                color: 'white',
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: 10,
                marginLeft: 4
              }}>
                {newCount}
              </span>
            )}
          </NavLink>

          {/* Manager linklari */}
          {isManager && (
            <NavLink to="/manager" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <UserCog size={15} />
              Xodimlar & Topshiriq
            </NavLink>
          )}

          {/* IT Support linklari */}
          {isITSupport && (
            <NavLink to="/tasks" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <ClipboardList size={15} />
              Topshiriqlar
            </NavLink>
          )}

          {/* Hisobotlar */}
          <NavLink to="/reports" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <BarChart3 size={15} />
            Hisobotlar
          </NavLink>

          {/* Notification Bell Badge (#1) */}
          <button 
            onClick={() => navigate('/admin')} 
            className="btn btn-ghost btn-sm"
            title={`${newCount} ta yangi murojaat`}
            style={{ position: 'relative', padding: '6px 10px', color: newCount > 0 ? '#f59e0b' : 'var(--text-muted)' }}
          >
            <Bell size={16} />
            {newCount > 0 && (
              <span style={{
                position: 'absolute',
                top: 2,
                right: 2,
                background: '#ef4444',
                color: 'white',
                fontSize: '0.65rem',
                fontWeight: 700,
                width: 16,
                height: 16,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {newCount}
              </span>
            )}
          </button>

          {/* Profil havolasi (#6) */}
          {auth && (
            <NavLink to="/profile" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} style={{ borderLeft: '1px solid var(--border)', paddingLeft: 12 }}>
              <User size={15} color="#8b5cf6" />
              <span>{auth.fullName.split(' ')[0]}</span>
            </NavLink>
          )}

          {/* Chiqish */}
          {auth && (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm"
              title="Tizimdan chiqish"
              style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#f87171', marginLeft: 4 }}>
              <LogOut size={14} />
              Chiqish
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}