import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getITWorkers, deleteITWorker, getTasks, createTask, deleteTask } from '../api/problems';
import toast from 'react-hot-toast';
import {
  UserCog, ClipboardList, Plus, Trash2, RefreshCw,
  User, Phone, Calendar, AlertTriangle, Inbox,
  CheckCircle2, Clock, PlayCircle, X, Send, ChevronDown
} from 'lucide-react';

const PRIORITY_CONFIG = {
  URGENT: { label: 'Shoshilinch 🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  HIGH:   { label: 'Yuqori 🟡',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  NORMAL: { label: 'Normal 🔵',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  LOW:    { label: 'Past 🟢',        color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const STATUS_CONFIG = {
  PENDING:     { label: 'Kutilmoqda',   color: '#94a3b8', icon: <Clock size={13} /> },
  IN_PROGRESS: { label: 'Jarayonda',   color: '#f59e0b', icon: <PlayCircle size={13} /> },
  DONE:        { label: 'Bajarildi',   color: '#10b981', icon: <CheckCircle2 size={13} /> },
};

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const emptyTask = {
  title: '', description: '', priority: 'NORMAL',
  deadline: '', assignedTo: '',
};

export default function ManagerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'workers'
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [taskForm, setTaskForm]   = useState(emptyTask);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingWorkerId, setDeletingWorkerId] = useState(null);
  const [filterWorker, setFilterWorker] = useState('ALL');

  // ── Fetch ──────────────────────────────────────────────────────────
  const fetchAll = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const [wRes, tRes] = await Promise.all([getITWorkers(), getTasks()]);
      setWorkers(wRes.data.users || []);
      setTasks(tRes.data.tasks || []);
      if (showToast) toast.success("Ma'lumotlar yangilandi!");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('it_auth');
        navigate('/login');
        return;
      }
      toast.error("Yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Create task ────────────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim())       { toast.error("Sarlavha kiritilmagan");  return; }
    if (!taskForm.description.trim()) { toast.error("Tavsif kiritilmagan");    return; }
    if (!taskForm.assignedTo)         { toast.error("Xodim tanlanmagan");      return; }

    setSubmitting(true);
    try {
      const payload = {
        title:       taskForm.title.trim(),
        description: taskForm.description.trim(),
        priority:    taskForm.priority,
        deadline:    taskForm.deadline || null,
        assignedTo:  parseInt(taskForm.assignedTo, 10),
      };
      const res = await createTask(payload);
      setTasks(prev => [res.data.task, ...prev]);
      toast.success("Topshiriq muvaffaqiyatli yaratildi! 📋");
      setShowModal(false);
      setTaskForm(emptyTask);
    } catch (err) {
      toast.error(err.response?.data?.message || "Topshiriq yaratishda xatolik.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete task ────────────────────────────────────────────────────
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Ushbu topshiriqni o'chirib tashlamoqchimisiz?")) return;
    setDeletingId(id);
    try {
      await deleteTask(id);
      setTasks(prev => prev.filter(t => t.id !== id));
      toast.success("Topshiriq o'chirildi.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi.");
    } finally {
      setDeletingId(null);
    }
  };

  // ── Delete worker account ──────────────────────────────────────────
  const handleDeleteWorker = async (id, name) => {
    if (!window.confirm(`Haqiqatan ham "${name}" xodimining hisobini o'chirmoqchimisiz?`)) return;
    setDeletingWorkerId(id);
    try {
      await deleteITWorker(id);
      setWorkers(prev => prev.filter(w => w.id !== id));
      setTasks(prev => prev.filter(t => t.assignedTo !== id));
      toast.success(`"${name}" xodim hisobi muvaffaqiyatli o'chirildi! 🗑️`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Xodimni o'chirishda xatolik yuz berdi.");
    } finally {
      setDeletingWorkerId(null);
    }
  };

  // ── Filtered tasks ─────────────────────────────────────────────────
  const filteredTasks = filterWorker === 'ALL'
    ? tasks
    : tasks.filter(t => t.assignedTo === parseInt(filterWorker, 10));

  const auth = (() => { try { return JSON.parse(localStorage.getItem('it_auth') || '{}'); } catch { return {}; } })();

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <UserCog size={24} color="#8b5cf6" />
              <h1>Rahbar Paneli</h1>
            </div>
            <p className="subtitle">
              Xush kelibsiz, <strong style={{ color: '#8b5cf6' }}>{auth.fullName || 'Manager'}</strong> — Topshiriqlar va xodimlar boshqaruvi
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => fetchAll(true)} disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: 'var(--border-subtle)' }}>
              <RefreshCw size={15} className={loading ? 'spin' : ''} /> Yangilash
            </button>
            <button className="btn btn-primary" onClick={() => { setShowModal(true); setTaskForm(emptyTask); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
              <Plus size={16} /> Yangi topshiriq
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'IT Xodimlar',   value: workers.length,                              color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
            { label: 'Jami topshiriq', value: tasks.length,                               color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
            { label: 'Kutilmoqda',    value: tasks.filter(t => t.status === 'PENDING').length,     color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
            { label: 'Jarayonda',     value: tasks.filter(t => t.status === 'IN_PROGRESS').length, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { label: 'Bajarildi',     value: tasks.filter(t => t.status === 'DONE').length,        color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="stat-chip">
              <div className="stat-icon" style={{ background: bg }}>
                <ClipboardList size={16} color={color} />
              </div>
              <div>
                <div className="stat-value" style={{ color }}>{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
          {[
            { key: 'tasks',   label: 'Topshiriqlar', icon: ClipboardList },
            { key: 'workers', label: 'IT Xodimlar',  icon: User },
          ].map(({ key, label, icon: Icon }) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s',
                background: activeTab === key ? '#8b5cf6' : 'transparent',
                color: activeTab === key ? 'white' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
              <Icon size={15} /> {label}
            </button>
          ))}
        </div>

        {/* ════ TASKS TAB ════ */}
        {activeTab === 'tasks' && (
          <>
            {/* Worker filter */}
            {workers.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, alignSelf: 'center' }}>XODIM:</span>
                <button
                  onClick={() => setFilterWorker('ALL')}
                  style={{
                    padding: '4px 14px', borderRadius: 20, border: `1px solid ${filterWorker === 'ALL' ? '#8b5cf6' : 'var(--border)'}`,
                    background: filterWorker === 'ALL' ? 'rgba(139,92,246,0.15)' : 'transparent',
                    color: filterWorker === 'ALL' ? '#8b5cf6' : 'var(--text-muted)',
                    cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  }}>
                  Barchasi
                </button>
                {workers.map(w => (
                  <button key={w.id}
                    onClick={() => setFilterWorker(String(w.id))}
                    style={{
                      padding: '4px 14px', borderRadius: 20,
                      border: `1px solid ${filterWorker === String(w.id) ? '#8b5cf6' : 'var(--border)'}`,
                      background: filterWorker === String(w.id) ? 'rgba(139,92,246,0.15)' : 'transparent',
                      color: filterWorker === String(w.id) ? '#8b5cf6' : 'var(--text-muted)',
                      cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    }}>
                    {w.fullName}
                  </button>
                ))}
              </div>
            )}

            {loading ? (
              <div className="loading-wrapper" style={{ padding: '60px 0' }}><div className="spinner" /></div>
            ) : filteredTasks.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <Inbox size={48} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                <h3>Topshiriq topilmadi</h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>Yangi topshiriq yarating.</p>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                  <Plus size={15} /> Topshiriq yaratish
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-card)', borderBottom: '2px solid var(--border-subtle)' }}>
                      {['Sarlavha', 'Xodim', 'Muhimlik', 'Status', 'Muddat', 'Yaratildi', ''].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTasks.map(task => {
                      const prio = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL;
                      const stat = STATUS_CONFIG[task.status]     || STATUS_CONFIG.PENDING;
                      return (
                        <tr key={task.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '12px 14px', maxWidth: 220 }}>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.88rem' }}>{task.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
                              {task.description}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(139,92,246,0.15)', display: 'grid', placeItems: 'center' }}>
                                <User size={14} color="#8b5cf6" />
                              </div>
                              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{task.worker?.fullName}</span>
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: prio.bg, color: prio.color }}>
                              {prio.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, color: stat.color }}>
                              {stat.icon} {stat.label}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Calendar size={13} />
                              {formatDate(task.deadline)}
                            </div>
                          </td>
                          <td style={{ padding: '12px 14px', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                            {formatDate(task.createdAt)}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <button onClick={() => handleDeleteTask(task.id)} disabled={deletingId === task.id}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 6, borderRadius: 6, transition: 'all 0.2s' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; }}>
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* ════ WORKERS TAB ════ */}
        {activeTab === 'workers' && (
          <>
            {loading ? (
              <div className="loading-wrapper" style={{ padding: '60px 0' }}><div className="spinner" /></div>
            ) : workers.length === 0 ? (
              <div className="empty-state" style={{ padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                <User size={48} style={{ opacity: 0.3, margin: '0 auto 12px', display: 'block' }} />
                <h3>IT Support xodimlari yo'q</h3>
                <p style={{ color: 'var(--text-secondary)' }}>Xodimlar ro'yxatdan o'tgandan so'ng bu yerda ko'rinadi.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {workers.map(w => {
                  const workerTasks = tasks.filter(t => t.assignedTo === w.id);
                  const doneTasks   = workerTasks.filter(t => t.status === 'DONE').length;
                  return (
                    <div key={w.id} style={{
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                      borderRadius: 12, padding: 18, transition: 'transform 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <span style={{ color: 'white', fontWeight: 700, fontSize: '1rem' }}>
                              {w.fullName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.92rem' }}>{w.fullName}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                              <Phone size={11} /> {w.phone}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteWorker(w.id, w.fullName)}
                          disabled={deletingWorkerId === w.id}
                          title="Xodim hisobini o'chirish"
                          style={{
                            background: 'none',
                            border: '1px solid transparent',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            padding: 6,
                            borderRadius: 8,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <div style={{ flex: 1, background: 'rgba(139,92,246,0.1)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6' }}>{workerTasks.length}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jami</div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(16,185,129,0.1)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{doneTasks}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bajarildi</div>
                        </div>
                        <div style={{ flex: 1, background: 'rgba(245,158,11,0.1)', borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b' }}>{workerTasks.length - doneTasks}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Qolgan</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ════ CREATE TASK MODAL ════ */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'grid', placeItems: 'center', zIndex: 100, padding: 16, overflowY: 'auto' }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: 520, padding: 28, boxShadow: '0 24px 60px rgba(0,0,0,0.5)', position: 'relative', animation: 'scaleUp 0.2s ease' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 16, marginBottom: 22 }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: 9 }}>
                <Plus size={20} color="#8b5cf6" /> Yangi Topshiriq Yaratish
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTask} noValidate>

              {/* Xodim tanlash */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Xodim tanlang *</label>
                {workers.length === 0 ? (
                  <div style={{ padding: '12px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.83rem', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <AlertTriangle size={14} style={{ display: 'inline', marginRight: 6 }} />
                    Hali IT Support xodimi ro'yxatdan o'tmagan.
                  </div>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <select
                      className="form-input"
                      value={taskForm.assignedTo}
                      onChange={e => setTaskForm(p => ({ ...p, assignedTo: e.target.value }))}
                      style={{ background: 'var(--bg-input)', color: 'white', paddingLeft: 38, appearance: 'none' }}>
                      <option value="">— Xodimni tanlang —</option>
                      {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.fullName} ({w.phone})</option>
                      ))}
                    </select>
                    <ChevronDown size={15} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  </div>
                )}
              </div>

              {/* Sarlavha */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Sarlavha *</label>
                <input type="text" className="form-input" placeholder="Topshiriq sarlavhasi"
                  value={taskForm.title}
                  onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                  style={{ background: 'var(--bg-input)' }} />
              </div>

              {/* Tavsif */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Tavsif *</label>
                <textarea className="form-textarea" placeholder="Topshiriq batafsil tavsifi..."
                  value={taskForm.description}
                  onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))}
                  style={{ background: 'var(--bg-input)', minHeight: 90 }} />
              </div>

              {/* Priority + Deadline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
                <div className="form-group">
                  <label className="form-label">Muhimlik</label>
                  <select className="form-input" value={taskForm.priority}
                    onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}
                    style={{ background: 'var(--bg-input)', color: 'white' }}>
                    {Object.entries(PRIORITY_CONFIG).map(([val, cfg]) => (
                      <option key={val} value={val}>{cfg.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Muddat (ixtiyoriy)</label>
                  <input type="date" className="form-input" value={taskForm.deadline}
                    onChange={e => setTaskForm(p => ({ ...p, deadline: e.target.value }))}
                    style={{ background: 'var(--bg-input)', colorScheme: 'dark' }} />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 18 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Bekor qilish
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting || workers.length === 0}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
                  {submitting ? 'Saqlanmoqda...' : (<><Send size={15} /> Topshiriq yuborish</>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
