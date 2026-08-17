import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllProblems, resolveProblem, deleteProblem, updateProblem, exportExcel } from '../api/problems';
import ProblemCard from '../components/ProblemCard';
import toast from 'react-hot-toast';
import { 
  RefreshCw, LayoutDashboard, Inbox, CheckCheck, AlertTriangle, 
  Search, Download, X, Wrench, Package, Briefcase, Building2, Phone, Hash, Eye
} from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL | "Texnik muammo" | "Jihoz so'rovi"
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | NEW | RESOLVED
  const [searchTerm, setSearchTerm] = useState('');
  
  const [resolvingId, setResolvingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Edit Modal State
  const [editingProblem, setEditingProblem] = useState(null);
  const [editForm, setEditForm] = useState({
    type: 'Texnik muammo',
    lastName: '', firstName: '', middleName: '',
    position: '', objectName: '', phone: '',
    room: '', computer: '', description: '',
    requestedItem: '', quantity: '1',
    status: 'NEW'
  });

  // ── Fetch all ─────────────────────────────────────────
  const fetchProblems = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const res = await getAllProblems();
      setProblems(res.data.problems);
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

  // ── Resolve ───────────────────────────────────────────
  const handleResolve = async (id) => {
    setResolvingId(id);
    try {
      const res = await resolveProblem(id);
      setProblems((prev) =>
        prev.map((p) => (p.id === id ? res.data.problem : p))
      );
      toast.success('Murojaat hal qilindi ✅');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi.');
    } finally {
      setResolvingId(null);
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
      status: problem.status || 'NEW'
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
    // 1. Type
    if (typeFilter !== 'ALL' && p.type !== typeFilter) return false;
    // 2. Status
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    // 3. Search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const fullName = `${p.lastName} ${p.firstName} ${p.middleName}`.toLowerCase();
      const ticket = (p.ticketNumber || '').toLowerCase();
      const obj = (p.objectName || '').toLowerCase();
      const pos = (p.position || '').toLowerCase();
      const ph = (p.phone || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const item = (p.requestedItem || '').toLowerCase();
      const room = (p.room || '').toLowerCase();
      const comp = (p.computer || '').toLowerCase();

      return (
        fullName.includes(term) ||
        ticket.includes(term) ||
        obj.includes(term) ||
        pos.includes(term) ||
        ph.includes(term) ||
        desc.includes(term) ||
        item.includes(term) ||
        room.includes(term) ||
        comp.includes(term)
      );
    }
    return true;
  });

  return (
    <div className="page">
      <div className="container">
        
        {/* Page header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <LayoutDashboard size={24} color="var(--accent-light)" />
              <h1>IT Yordam CRM Panel</h1>
            </div>
            <p className="subtitle">Murojaatlarni boshqarish va tahrirlash markazi</p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-success" onClick={handleExportExcel} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Download size={16} />
              Excel yuklab olish
            </button>
            <button className="btn btn-ghost" onClick={() => fetchProblems(true)} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: 'var(--border-subtle)' }}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              Yangilash
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="stats-bar" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.12)' }}>
              <Inbox size={18} color="var(--accent-light)" />
            </div>
            <div>
              <div className="stat-value">{totalCount}</div>
              <div className="stat-label">Jami murojaatlar</div>
            </div>
          </div>
          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'var(--warning-bg)' }}>
              <AlertTriangle size={18} color="var(--warning)" />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{newCount}</div>
              <div className="stat-label">Yangilar (Kutilmoqda)</div>
            </div>
          </div>
          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'var(--success-bg)' }}>
              <CheckCheck size={18} color="var(--success)" />
            </div>
            <div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{resolvedCount}</div>
              <div className="stat-label">Hal qilinganlar</div>
            </div>
          </div>
          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
              <Wrench size={18} color="#818cf8" />
            </div>
            <div>
              <div className="stat-value" style={{ color: '#818cf8' }}>{tmCount}</div>
              <div className="stat-label">Texnik muammolar</div>
            </div>
          </div>
          <div className="stat-chip">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
              <Package size={18} color="#34d399" />
            </div>
            <div>
              <div className="stat-value" style={{ color: '#34d399' }}>{jsCount}</div>
              <div className="stat-label">Jihoz so'rovlari</div>
            </div>
          </div>
        </div>

        {/* CRM Search & Filters */}
        <div className="crm-filters" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', padding: 18, borderRadius: 'var(--radius-lg)', marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          
          {/* Search row */}
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              className="form-input"
              placeholder="Qidiruv (Ism, telefon, chipta raqami, xona, muammo yoki jihoz)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 42, background: 'var(--bg-input)', borderColor: 'var(--border-subtle)', borderRadius: 10 }}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
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
                onResolve={handleResolve}
                onDelete={handleDelete}
                onEdit={openEditModal}
                resolving={resolvingId === problem.id}
                deleting={deletingId === problem.id}
              />
            ))}
          </div>
        )}
      </div>

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
