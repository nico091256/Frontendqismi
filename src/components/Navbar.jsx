import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Monitor, LayoutDashboard, BarChart3, LogOut, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAdmin = () => {
      setIsAdmin(!!localStorage.getItem('it_admin_key'));
    };
    checkAdmin();
    window.addEventListener('storage', checkAdmin);
    return () => window.removeEventListener('storage', checkAdmin);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('it_admin_key');
    setIsAdmin(false);
    toast.success("Admin paneldan chiqildi (qulflondi) 🔒");
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <NavLink to="/" className="navbar-brand">
          <div className="brand-icon">🖥️</div>
          <span>IT Support</span>
        </NavLink>

        {/* Nav links */}
        <div className="navbar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <Monitor size={15} />
            Muammo yuborish
          </NavLink>

          <NavLink
            to="/admin"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <LayoutDashboard size={15} />
            Admin Panel
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          >
            <BarChart3 size={15} />
            Hisobotlar
          </NavLink>

          {isAdmin && (
            <button
              onClick={handleLogout}
              className="btn btn-ghost btn-sm"
              title="Admin paneldan chiqish"
              style={{ marginLeft: 8, borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
            >
              <LogOut size={14} />
              Chiqish
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
