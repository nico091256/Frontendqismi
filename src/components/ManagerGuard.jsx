import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

// Faqat Manager sahifasini himoya qiladi
export default function ManagerGuard({ children }) {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const authRaw = localStorage.getItem('it_auth');
    if (authRaw) {
      try {
        const auth = JSON.parse(authRaw);
        if (auth?.token && auth.role === 'MANAGER') {
          setAllowed(true);
          setChecked(true);
          return;
        }
      } catch { /* ignore */ }
    }

    setChecked(true);
    navigate('/login', { replace: true });
    toast.error("Bu sahifaga faqat Manager kira oladi.");
  }, [navigate]);

  if (!checked) return null;
  if (!allowed)  return null;
  return children;
}
