import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, BarChart3, LogOut, ClipboardList, 
  UserCog, Headphones, Bell, User, Gauge, Menu, X, Laptop, MessageSquare
} from 'lucide-react';
import toast from 'react-hot-toast';
import { logoutUser, getNewCount } from '../api/problems';

import Logo from './Logo';

export default function Navbar() {
  const [auth, setAuth] = useState(null);
  const [newCount, setNewCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on page navigation
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // ── Polling for new problems notification (#1) ───────────
  useEffect(() => {
    if (!auth) return;

    let isMounted = true;
    const checkNotification = async () => {
      try {
        const res = await getNewCount();
        const count = res.data?.count || 0;
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
    setMobileMenuOpen(false);
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
        <NavLink to="/dashboard" className="navbar-brand" onClick={() => setMobileMenuOpen(false)}>
          <div className="brand-icon" style={{ background: 'rgba(247, 168, 56, 0.12)', border: '1px solid rgba(247, 168, 56, 0.3)' }}>
            <Logo size={22} color="#F7A838" />
          </div>
          <span className="brand-title">{isManager ? 'Rahbar Paneli' : 'IT Support'}</span>
        </NavLink>

        {/* Desktop Nav links */}
        <div className="navbar-nav desktop-nav">
          <NavLink to="/dashboard" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <Gauge size={15} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/admin" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} style={{ position: 'relative' }}>
            <LayoutDashboard size={15} />
            <span>Murojaatlar</span>
            {newCount > 0 && (
              <span className="nav-badge-count">
                {newCount}
              </span>
            )}
          </NavLink>

          {isManager && (
            <NavLink to="/manager" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <UserCog size={15} />
              <span>Boshqaruv</span>
            </NavLink>
          )}

          {isITSupport && (
            <NavLink to="/tasks" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
              <ClipboardList size={15} />
              <span>Topshiriqlar</span>
            </NavLink>
          )}

          <NavLink to="/inventory" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <Laptop size={15} color="#F7A838" />
            <span>Inventar</span>
          </NavLink>

          <NavLink to="/reports" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
            <BarChart3 size={15} />
            <span>Hisobotlar</span>
          </NavLink>

          {/* Notification Bell Badge */}
          <button 
            onClick={() => navigate('/admin')} 
            className="btn btn-ghost btn-sm nav-bell-btn"
            title={`${newCount} ta yangi murojaat`}
          >
            <Bell size={16} />
            {newCount > 0 && (
              <span className="bell-badge-bubble">
                {newCount}
              </span>
            )}
          </button>

          {/* Profile link */}
          {auth && (
            <NavLink to="/profile" className={({ isActive }) => 'nav-link nav-profile-link' + (isActive ? ' active' : '')}>
              <User size={15} color="#8b5cf6" />
              <span>{auth.fullName.split(' ')[0]}</span>
            </NavLink>
          )}

          {/* Logout */}
          {auth && (
            <button onClick={handleLogout} className="btn btn-ghost btn-sm nav-logout-btn" title="Tizimdan chiqish">
              <LogOut size={14} />
              <span>Chiqish</span>
            </button>
          )}
        </div>

        {/* Mobile Action Controls (Bell + Hamburger Toggle) */}
        <div className="navbar-mobile-controls">
          <button 
            onClick={() => navigate('/admin')} 
            className="btn btn-ghost btn-sm mobile-bell-btn"
            title={`${newCount} ta yangi murojaat`}
          >
            <Bell size={18} />
            {newCount > 0 && (
              <span className="bell-badge-bubble">
                {newCount}
              </span>
            )}
          </button>

          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-hamburger-btn"
            aria-label="Menyu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <div className="mobile-drawer-links">
            <NavLink 
              to="/dashboard" 
              className={({ isActive }) => 'mobile-drawer-item' + (isActive ? ' active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-drawer-icon"><Gauge size={18} /></div>
              <span className="mobile-drawer-label">Dashboard</span>
            </NavLink>

            <NavLink 
              to="/admin" 
              className={({ isActive }) => 'mobile-drawer-item' + (isActive ? ' active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-drawer-icon"><LayoutDashboard size={18} /></div>
              <span className="mobile-drawer-label">Murojaatlar</span>
              {newCount > 0 && (
                <span className="nav-badge-count ml-auto">
                  {newCount} yangi
                </span>
              )}
            </NavLink>

            {isManager && (
              <NavLink 
                to="/manager" 
                className={({ isActive }) => 'mobile-drawer-item' + (isActive ? ' active' : '')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-drawer-icon"><UserCog size={18} /></div>
                <span className="mobile-drawer-label">Xodimlar & Topshiriqlar</span>
              </NavLink>
            )}

            {isITSupport && (
              <NavLink 
                to="/tasks" 
                className={({ isActive }) => 'mobile-drawer-item' + (isActive ? ' active' : '')}
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="mobile-drawer-icon"><ClipboardList size={18} /></div>
                <span className="mobile-drawer-label">Topshiriqlarim</span>
              </NavLink>
            )}

            <NavLink 
              to="/inventory" 
              className={({ isActive }) => 'mobile-drawer-item' + (isActive ? ' active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-drawer-icon"><Laptop size={18} color="#F7A838" /></div>
              <span className="mobile-drawer-label">IT Inventarizatsiya</span>
            </NavLink>

            <NavLink 
              to="/reports" 
              className={({ isActive }) => 'mobile-drawer-item' + (isActive ? ' active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-drawer-icon"><BarChart3 size={18} /></div>
              <span className="mobile-drawer-label">Hisobot & Statistika</span>
            </NavLink>

            <NavLink 
              to="/profile" 
              className={({ isActive }) => 'mobile-drawer-item' + (isActive ? ' active' : '')}
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="mobile-drawer-icon"><User size={18} /></div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="mobile-drawer-label">{auth?.fullName || 'Profil'}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isManager ? 'Menejer' : 'IT Xodimi'}
                </span>
              </div>
            </NavLink>
          </div>

          <div className="mobile-drawer-footer">
            <button onClick={handleLogout} className="mobile-drawer-logout-btn">
              <LogOut size={16} />
              <span>Tizimdan Chiqish</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}