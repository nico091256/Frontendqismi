import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getAllProblems, 
  resolveProblem, 
  deleteProblem, 
  updateProblem, 
  exportExcel,
  assignProblem,
  getITWorkers 
} from '../api/problems';
import ProblemCard from '../components/ProblemCard';
import toast from 'react-hot-toast';
import { 
  RefreshCw, LayoutDashboard, Inbox, CheckCheck, AlertTriangle, 
  Search, Download, X, Wrench, Package, Briefcase, Building2, Phone, Hash, Eye,
  CheckCircle, MessageSquare
} from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | "Texnik muammo" | "Jihoz so'rovi"
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | NEW | RESOLVED
  const [searchTerm, setSearchTerm] = useState('');
  
  const [resolvingId, setResolvingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [assigningId, setAssigningId] = useState(null);

  // Resolve Modal State (#3)
  const [resolvingProblem, setResolvingProblem] = useState(null);
  const [resolveNote, setResolveNote] = useState('');

  // Edit Modal State
  const [editingProblem, setEditingProblem] = useState(null);
  const [editForm, setEditForm] = useState({
    type: 'Texnik muammo',
    lastName: '', firstName: '', middleName: '',
    position: '', objectName: '', phone: '',
    room: '', computer: '', description: '',
    requestedItem: '', quantity: '1',
    status: 'NEW',
    resolveNote: ''
  });

  // ── Fetch all ─────────────────────────────────────────
  const fetchProblems = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const [resProb, resWorkers] = await Promise.allSettled([
        getAllProblems(),
        getITWorkers()
      ]);

      if (resProb.status === 'fulfilled') {
        setProblems(resProb.value.data.problems || []);
      } else {
        throw resProb.reason;
      }

      if (resWorkers.status === 'fulfilled') {
        setWorkers(resWorkers.value.data.users || []);
      }

      if (showToast) toast.success("Ma'lumotlar yangilandi! 🔄");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('it_auth');
        toast.error("Sessiya muddati tugadi. Qayta kiring.");
        setTimeout(() => navigate('/login'), 800);
        return;
      }
      toast.error(err.response?.data?.message || "Murojaatlarni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchProblems();
  }, [fetchProblems]);

  // ── Resolve Handlers (#3) ──────────────────────────────
  const handleOpenResolveModal = (problem) => {
    setResolvingProblem(problem);
    setResolveNote('');
  };

  const handleConfirmResolve = async (e) => {
    e?.preventDefault();
    if (!resolvingProblem) return;

    const id = resolvingProblem.id;
    setResolvingId(id);
    try {
      const res = await resolveProblem(id, resolveNote);
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? res.data.problem : p))
      );
      if (res.data?.inventorySynced) {
        toast.success("Murojaat hal qilindi va jihoz inventarga biriktirildi! 📦✅", { duration: 4500 });
      } else {
        toast.success('Murojaat hal qilindi! ✅');
      }
      setResolvingProblem(null);
      setResolveNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setResolvingId(null);
    }
  };

  // ── Assign Worker (#7) ─────────────────────────────────
  const handleAssignWorker = async (problemId, userId) => {
    setAssigningId(problemId);
    try {
      const res = await assignProblem(problemId, userId);
      setProblems((prev) =>
        prev.map((p) => (p.id === problemId ? res.data.problem : p))
      );
      toast.success(userId ? "Xodimga biriktirildi! 👤" : "Biriktirish bekor qilindi.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Biriktirishda xatolik.");
    } finally {
      setAssigningId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm("Ushbu murojaatni o'chirib tashlamoqchimisiz?")) return;
    setDeletingId(id);
    try {
      await deleteProblem(id);
      setProblems((prev) => prev.filter((p) => p.id !== id));
      toast.success("Murojaat o'chirildi.");
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setDeletingId(null);
    }
  };

  // ── Export Excel ──────────────────────────────────────
  const handleExportExcel = async () => {
    try {
      toast.loading("Excel fayli yuklab olinmoqda...", { id: 'excel-export' });
      const res = await exportExcel();
      const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `IT-Murojaatlar-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Excel muvaffaqiyatli yuklab olindi! 📊", { id: 'excel-export' });
    } catch (err) {
      toast.error("Excel eksport qilishda xatolik yuz berdi.", { id: 'excel-export' });
    }
  };

  // ── Edit Modal Handlers ────────────────────────────────
  const openEditModal = (problem) => {
    setEditingProblem(problem);
    setEditForm({
      type: problem.type || 'Texnik muammo',
      lastName: problem.lastName || '',
      firstName: problem.firstName || '',
      middleName: problem.middleName || '',
      position: problem.position || '',
      objectName: problem.objectName || '',
      phone: problem.phone || '',
      room: problem.room || '',
      computer: problem.computer || '',
      description: problem.description || '',
      requestedItem: problem.requestedItem || '',
      quantity: problem.quantity?.toString() || '1',
      status: problem.status || 'NEW',
      resolveNote: problem.resolveNote || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(p => ({ ...p, [name]: value }));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();

    if (!editForm.lastName.trim())   { toast.error("Familiyani kiriting");          return; }
    if (!editForm.firstName.trim())  { toast.error("Ismni kiriting");               return; }
    if (!editForm.middleName.trim()) { toast.error("Sharifni kiriting");            return; }
    if (!editForm.position.trim())   { toast.error("Lavozimni kiriting");           return; }
    if (!editForm.objectName.trim()) { toast.error("Obyekt nomini kiriting");       return; }
    if (!editForm.phone.trim())      { toast.error("Telefon raqamini kiriting");    return; }

    if (editForm.type === 'Texnik muammo') {
      if (!editForm.room.trim())     { toast.error("Xona raqamini kiriting");       return; }
      if (!editForm.computer.trim()) { toast.error("Kompyuter nomini kiriting");     return; }
      if (!editForm.description.trim()) { toast.error("Muammo tavsifini kiriting"); return; }
    } else {
      if (!editForm.requestedItem.trim()) { toast.error("So'ralgan jihoz nomini kiriting"); return; }
    }

    try {
      const payload = {
        ...editForm,
        quantity: editForm.type === "Jihoz so'rovi" ? (parseInt(editForm.quantity, 10) || 1) : null
      };

      const res = await updateProblem(editingProblem.id, payload);
      setProblems((prev) =>
        prev.map((p) => (p.id === editingProblem.id ? res.data.problem : p))
      );
      toast.success("Murojaat muvaffaqiyatli saqlandi! 💾");
      setEditingProblem(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Saqlashda xatolik yuz berdi.');
    }
  };

  // ── Computed Stats ────────────────────────────────────
  const totalCount    = problems.length;
  const newCount      = problems.filter((p) => p.status === 'NEW').length;
  const resolvedCount = problems.filter((p) => p.status === 'RESOLVED').length;
  const tmCount       = problems.filter((p) => p.type === 'Texnik muammo').length;
  const jsCount       = problems.filter((p) => p.type === "Jihoz so'rovi").length;

  // ── Local Filter and Search ───────────────────────────
  const filtered = problems.filter((p) => {
    if (typeFilter !== 'ALL' && p.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;

    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();

    return (
      p.ticketNumber?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.firstName?.toLowerCase().includes(q) ||
      p.middleName?.toLowerCase().includes(q) ||
      p.position?.toLowerCase().includes(q) ||
      p.objectName?.toLowerCase().includes(q) ||
      p.phone?.toLowerCase().includes(q) ||
      p.room?.toLowerCase().includes(q) ||
      p.computer?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.requestedItem?.toLowerCase().includes(q) ||
      p.resolveNote?.toLowerCase().includes(q) ||
      p.assignedUser?.fullName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page admin-page">
      <div className="container">
        
        {/* Page Header */}
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
          <div>
            <h1 style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '1.6rem', fontWeight: 700 }}>
              <LayoutDashboard size={24} color="#3b82f6" />
              IT Qo'llab-quvvatlash Paneli
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>
              Barcha kelib tushgan texnik muammolar va jihoz so'rovlarini boshqarish
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={() => fetchProblems(true)} disabled={loading}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              Yangilash
            </button>
            <button className="btn btn-primary" onClick={handleExportExcel}>
              <Download size={15} />
              Excel yuklab olish
            </button>
          </div>
        </div>

        {/* ── Stats Metric Cards Bar ── */}
        <div className="stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 24 }}>
          {/* Jami Murojaatlar */}
          <div 
            className="card" 
            onClick={() => { setTypeFilter('ALL'); setStatusFilter('ALL'); }}
            style={{ 
              padding: '16px 18px', 
              borderLeft: '4px solid #38bdf8', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              background: (typeFilter === 'ALL' && statusFilter === 'ALL') ? 'rgba(56, 189, 248, 0.08)' : 'var(--bg-card)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>JAMI MUROJAATLAR</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>{totalCount}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56, 189, 248, 0.12)', display: 'grid', placeItems: 'center' }}>
              <Inbox size={19} color="#38bdf8" />
            </div>
          </div>

          {/* Yangi (Kutilmoqda) */}
          <div 
            className="card" 
            onClick={() => setStatusFilter('NEW')}
            style={{ 
              padding: '16px 18px', 
              borderLeft: '4px solid #f59e0b', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              background: statusFilter === 'NEW' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-card)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>YANGI (KUTILMOQDA)</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>{newCount}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.12)', display: 'grid', placeItems: 'center' }}>
              <AlertTriangle size={19} color="#f59e0b" />
            </div>
          </div>

          {/* Hal Qilindi */}
          <div 
            className="card" 
            onClick={() => setStatusFilter('RESOLVED')}
            style={{ 
              padding: '16px 18px', 
              borderLeft: '4px solid #10b981', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              background: statusFilter === 'RESOLVED' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>HAL QILINDI</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>{resolvedCount}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(16, 185, 129, 0.12)', display: 'grid', placeItems: 'center' }}>
              <CheckCircle size={19} color="#10b981" />
            </div>
          </div>

          {/* Texnik Muammo */}
          <div 
            className="card" 
            onClick={() => setTypeFilter('Texnik muammo')}
            style={{ 
              padding: '16px 18px', 
              borderLeft: '4px solid #818cf8', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              background: typeFilter === 'Texnik muammo' ? 'rgba(129, 140, 248, 0.1)' : 'var(--bg-card)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>TEXNIK MUAMMO</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8', marginTop: 2 }}>{tmCount}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(129, 140, 248, 0.12)', display: 'grid', placeItems: 'center' }}>
              <Wrench size={19} color="#818cf8" />
            </div>
          </div>

          {/* Jihoz So'rovi */}
          <div 
            className="card" 
            onClick={() => setTypeFilter("Jihoz so'rovi")}
            style={{ 
              padding: '16px 18px', 
              borderLeft: '4px solid #34d399', 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              background: typeFilter === "Jihoz so'rovi" ? 'rgba(52, 211, 153, 0.1)' : 'var(--bg-card)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>JIHOZ SO'ROVI</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: 2 }}>{jsCount}</div>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(52, 211, 153, 0.12)', display: 'grid', placeItems: 'center' }}>
              <Package size={19} color="#34d399" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="filter-controls card" style={{ padding: '16px 20px', marginBottom: 24 }}>
          {/* Search row */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Ticket raqami, xodim ismi, telefon, xona, jihoz yoki izoh bo'yicha qidiring..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 42, paddingRight: searchTerm ? 40 : 14, borderRadius: 10, background: 'var(--bg-input)' }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Tabs row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            {/* Type tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className={`btn btn-sm ${typeFilter === 'ALL' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTypeFilter('ALL')}>
                Barchasi
              </button>
              <button className={`btn btn-sm ${typeFilter === 'Texnik muammo' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTypeFilter('Texnik muammo')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Wrench size={13} />
                Texnik muammolar
              </button>
              <button className={`btn btn-sm ${typeFilter === "Jihoz so'rovi" ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTypeFilter("Jihoz so'rovi")} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Package size={13} />
                Jihoz so'rovlari
              </button>
            </div>

            {/* Status filters */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: 6 }}>STATUS:</span>
              <button className={`btn btn-sm ${statusFilter === 'ALL' ? 'btn-ghost' : 'btn-ghost'}`} onClick={() => setStatusFilter('ALL')} style={{ background: statusFilter === 'ALL' ? 'rgba(255,255,255,0.06)' : 'transparent', borderColor: 'var(--border-subtle)' }}>
                Barcha statuslar
              </button>
              <button className={`btn btn-sm ${statusFilter === 'NEW' ? 'btn-ghost' : 'btn-ghost'}`} onClick={() => setStatusFilter('NEW')} style={{ color: 'var(--warning)', background: statusFilter === 'NEW' ? 'var(--warning-bg)' : 'transparent', borderColor: 'var(--warning)' }}>
                🟡 Yangilar
              </button>
              <button className={`btn btn-sm ${statusFilter === 'RESOLVED' ? 'btn-ghost' : 'btn-ghost'}`} onClick={() => setStatusFilter('RESOLVED')} style={{ color: 'var(--success)', background: statusFilter === 'RESOLVED' ? 'var(--success-bg)' : 'transparent', borderColor: 'var(--success)' }}>
                ✅ Hal qilinganlar
              </button>
            </div>
          </div>
        </div>

        {/* Problems list */}
        {loading ? (
          <div className="loading-wrapper" style={{ padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
            <h3>Murojaat topilmadi</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              Qidiruv yoki filtrlash natijalariga mos keladigan murojaatlar topilmadi.
            </p>
          </div>
        ) : (
          <div className="problems-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 20 }}>
            {filtered.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                workers={workers}
                onResolve={handleOpenResolveModal}
                onAssign={handleAssignWorker}
                onDelete={handleDelete}
                onEdit={openEditModal}
                resolving={resolvingId === problem.id}
                deleting={deletingId === problem.id}
                assigning={assigningId}
              />
            ))}
          </div>
        )}
      </div>

      {/* ════ HAL QILISH MODAL OYNASI (#3 RESOLVE NOTE MODAL) ════ */}
      {resolvingProblem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', display: 'grid', placeItems: 'center', zIndex: 110, padding: 16 }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 480, padding: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14, marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={20} color="#10b981" />
                Murojaatni Hal Qilish: {resolvingProblem.ticketNumber}
              </h3>
              <button onClick={() => setResolvingProblem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleConfirmResolve}>
              <div style={{ marginBottom: 16, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <strong>{resolvingProblem.lastName} {resolvingProblem.firstName}</strong> ({resolvingProblem.objectName || resolvingProblem.room || '—'}) murojaati holatini <strong>"Hal qilindi"</strong>ga o'tkazmoqdasiz.
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MessageSquare size={14} color="#818cf8" />
                  Qanday hal qilindi? / Bajarilgan ishlar (ixtiyoriy)
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="Masalan: Monitor kabeli almashtirildi, drayver o'rnatildi..."
                  value={resolveNote}
                  onChange={(e) => setResolveNote(e.target.value)}
                  style={{ background: 'var(--bg-input)', borderRadius: 8, minHeight: 90 }}
                  autoFocus
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setResolvingProblem(null)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-success" disabled={resolvingId === resolvingProblem.id}>
                  <CheckCircle size={15} />
                  {resolvingId === resolvingProblem.id ? 'Saqlanmoqda...' : 'Hal etildi deb belgilash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════ TAHRIRLASH MODAL OYNASI (EDIT MODAL) ════ */}
      {editingProblem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 16, overflowY: 'auto' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 560, padding: 24, boxShadow: '0 20px 50px rgba(0,0,0,0.5)', position: 'relative', animation: 'scaleUp 0.2s ease' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 14, marginBottom: 20 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
                Murojaatni Tahrirlash: {editingProblem.ticketNumber}
              </h2>
              <button onClick={() => setEditingProblem(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveEdit} noValidate>
              
              {/* Type Switcher */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Murojaat Turi</label>
                <select name="type" className="form-input" value={editForm.type} onChange={handleEditChange} style={{ background: 'var(--bg-input)', color: 'white', borderRadius: 8 }}>
                  <option value="Texnik muammo">Texnik muammo 🛠️</option>
                  <option value="Jihoz so'rovi">Jihoz so'rovi 📦</option>
                </select>
              </div>

              {/* Personal info fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Familiya</label>
                  <input name="lastName" className="form-input" value={editForm.lastName} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Ism</label>
                  <input name="firstName" className="form-input" value={editForm.firstName} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sharif</label>
                  <input name="middleName" className="form-input" value={editForm.middleName} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Telefon</label>
                  <input name="phone" className="form-input" value={editForm.phone} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div className="form-group">
                  <label className="form-label">Lavozimi</label>
                  <input name="position" className="form-input" value={editForm.position} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Obyekt nomi</label>
                  <input name="objectName" className="form-input" value={editForm.objectName} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                </div>
              </div>

              {/* Type-Specific Fields */}
              {editForm.type === 'Texnik muammo' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">Xona</label>
                    <input name="room" className="form-input" value={editForm.room} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kompyuter nomi</label>
                    <input name="computer" className="form-input" value={editForm.computer} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 14 }}>
                  <div className="form-group">
                    <label className="form-label">So'ralgan jihoz</label>
                    <input name="requestedItem" className="form-input" value={editForm.requestedItem} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Miqdor</label>
                    <input type="number" name="quantity" className="form-input" value={editForm.quantity} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8 }} />
                  </div>
                </div>
              )}

              {/* Common description */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">{editForm.type === 'Texnik muammo' ? 'Muammo tavsifi' : 'Izoh'}</label>
                <textarea name="description" className="form-textarea" value={editForm.description} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8, minHeight: 70 }} />
              </div>

              {/* Resolve note (edit) */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Hal qilish izohi (Resolve Note)</label>
                <textarea name="resolveNote" className="form-textarea" placeholder="Bajarilgan ishlar..." value={editForm.resolveNote} onChange={handleEditChange} style={{ background: 'var(--bg-input)', borderRadius: 8, minHeight: 60 }} />
              </div>

              {/* Status */}
              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Murojaat Holati (Status)</label>
                <select name="status" className="form-input" value={editForm.status} onChange={handleEditChange} style={{ background: 'var(--bg-input)', color: 'white', borderRadius: 8 }}>
                  <option value="NEW">🟡 Kutilmoqda (NEW)</option>
                  <option value="RESOLVED">✅ Hal etildi (RESOLVED)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 16 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setEditingProblem(null)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary">
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}