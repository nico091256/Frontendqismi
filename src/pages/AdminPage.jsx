import { useState, useEffect, useCallback } from 'react';
import { getAllProblems, resolveProblem, deleteProblem } from '../api/problems';
import ProblemCard from '../components/ProblemCard';
import toast from 'react-hot-toast';
import { RefreshCw, LayoutDashboard, Inbox, CheckCheck, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');   // ALL | NEW | RESOLVED
  const [resolvingId, setResolvingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ── Fetch all ─────────────────────────────────────────
  const fetchProblems = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const res = await getAllProblems();
      setProblems(res.data.problems);
      if (showToast) toast.success("Yangilandi!");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('it_admin_key');
        toast.error("Sessiya muddati tugadi yoki parol noto'g'ri. Qayta kiring.");
        setTimeout(() => window.location.reload(), 1000);
        return;
      }
      toast.error("Ma'lumotlarni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProblems(); }, [fetchProblems]);

  // ── Resolve ───────────────────────────────────────────
  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      const res = await resolveProblem(id);
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? res.data.problem : p))
      );
      toast.success('Muammo hal qilindi ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setResolvingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Bu muammoni o'chirib tashlamoqchimisiz?")) return;
    setDeletingId(id);
    try {
      await deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Muammo o'chirildi.");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Computed ──────────────────────────────────────────
  const totalCount    = problems.length;
  const newCount      = problems.filter((p) => p.status === 'NEW').length;
  const resolvedCount = problems.filter((p) => p.status === 'RESOLVED').length;

  const filtered = filter === 'ALL'
    ? problems
    : problems.filter((p) => p.status === filter);

  // ── Render ────────────────────────────────────────────
  return (
    <div className="page">
      <div className="container">
        {/* Page header */}
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <LayoutDashboard size={24} color="var(--accent-light)" />
            <h1>Admin Panel</h1>
          </div>
          <p className="subtitle">
            Barcha muammolarni ko'rish, hal qilish va boshqarish
          </p>
        </div>

        {/* Stats bar */}
        <div className="stats-bar">
          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Inbox size={18} color="var(--accent-light)" />
            </div>
            <div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Jami</div>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'var(--warning-bg)' }}>
              <AlertTriangle size={18} color="var(--warning)" />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{newCount}</div>
              <div className="stat-label">Yangi</div>
            </div>
          </div>

          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'var(--success-bg)' }}>
              <CheckCheck size={18} color="var(--success)" />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{resolvedCount}</div>
              <div className="stat-label">Hal qilindi</div>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="filter-bar">
          {['ALL', 'NEW', 'RESOLVED'].map((val) => (
            <button
              key={val}
              className={`btn btn-sm ${filter === val ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(val)}
            >
              {val === 'ALL' ? 'Barchasi' : val === 'NEW' ? '🟡 Yangilar' : '✅ Hal qilinganlar'}
            </button>
          ))}
          <div className="filter-spacer" />
          <button
            className="btn btn-ghost btn-sm refresh-btn"
            onClick={() => fetchProblems(true)}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            Yangilash
          </button>
        </div>

        {/* Problems list */}
        {loading ? (
          <div className="loading-wrapper">
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>Muammo topilmadi</h3>
            <p>
              {filter === 'ALL'
                ? 'Hozircha hech qanday muammo yuborilmagan.'
                : filter === 'NEW'
                ? 'Yangi muammolar yo\'q.'
                : 'Hal qilingan muammolar yo\'q.'}
            </p>
          </div>
        ) : (
          <div className="problems-grid">
            {filtered.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                onResolve={handleResolve}
                onDelete={handleDelete}
                resolving={resolvingId === problem.id}
                deleting={deletingId === problem.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
