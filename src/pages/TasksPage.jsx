import { useState, useEffect, useCallback } from 'react';
import { getTasks, updateTaskStatus } from '../api/problems';
import toast from 'react-hot-toast';
import {
  ClipboardList, RefreshCw, CheckCircle2, Clock, PlayCircle,
  AlertTriangle, ChevronRight, Calendar, User, Filter,
  Sparkles, Inbox
} from 'lucide-react';

const PRIORITY_CONFIG = {
  URGENT:  { label: 'Shoshilinch', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',    icon: '🔴' },
  HIGH:    { label: 'Yuqori',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',   icon: '🟡' },
  NORMAL:  { label: 'Normal',      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   icon: '🔵' },
  LOW:     { label: 'Past',        color: '#10b981', bg: 'rgba(16,185,129,0.12)',   icon: '🟢' },
};

const STATUS_CONFIG = {
  PENDING:     { label: "Kutilmoqda",  color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', icon: <Clock size={14} /> },
  IN_PROGRESS: { label: "Bajarilmoqda", color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <PlayCircle size={14} /> },
  DONE:        { label: "Bajarildi",   color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <CheckCircle2 size={14} /> },
};

const STATUS_ORDER = ['PENDING', 'IN_PROGRESS', 'DONE'];

function formatDeadline(deadline) {
  if (!deadline) return null;
  const d = new Date(deadline);
  const now = new Date();
  const diff = d - now;
  const days = Math.ceil(diff / 86400000);
  const str = d.toLocaleDateString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric' });
  return { str, overdue: diff < 0, soon: diff >= 0 && days <= 2 };
}

export default function TasksPage() {
  const [tasks, setTasks]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus, setFilter]   = useState('ALL');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchTasks = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const res = await getTasks();
      setTasks(res.data.tasks);
      if (showToast) toast.success("Topshiriqlar yangilandi!");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('it_auth');
        window.location.href = '/login';
        return;
      }
      toast.error("Topshiriqlarni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleStatusChange = async (task, newStatus) => {
    setUpdatingId(task.id);
    try {
      const res = await updateTaskStatus(task.id, newStatus);
      setTasks(prev => prev.map(t => t.id === task.id ? res.data.task : t));
      toast.success(newStatus === 'DONE' ? "Topshiriq bajarildi! ✅" : "Status yangilandi!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi.");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = filterStatus === 'ALL'
    ? tasks
    : tasks.filter(t => t.status === filterStatus);

  const counts = {
    ALL:         tasks.length,
    PENDING:     tasks.filter(t => t.status === 'PENDING').length,
    IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    DONE:        tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className="page">
      <div className="container">

        {/* Header */}
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
              <ClipboardList size={24} color="var(--accent-light)" />
              <h1>Mening Topshiriqlarim</h1>
            </div>
            <p className="subtitle">Manager tomonidan biriktirilgan topshiriqlar</p>
          </div>
          <button className="btn btn-ghost" onClick={() => fetchTasks(true)} disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: 6, borderColor: 'var(--border-subtle)' }}>
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Yangilash
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { key: 'ALL',         label: 'Jami',         color: 'var(--accent-light)', bg: 'rgba(59,130,246,0.1)' },
            { key: 'PENDING',     label: 'Kutilmoqda',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
            { key: 'IN_PROGRESS', label: 'Jarayonda',    color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
            { key: 'DONE',        label: 'Bajarildi',    color: '#10b981', bg: 'rgba(16,185,129,0.1)'  },
          ].map(({ key, label, color, bg }) => (
            <div key={key} className="stat-chip" style={{ cursor: 'pointer', outline: filterStatus === key ? `2px solid ${color}` : 'none' }}
              onClick={() => setFilter(key)}>
              <div className="stat-icon" style={{ background: bg }}>
                <Filter size={16} color={color} />
              </div>
              <div>
                <div className="stat-value" style={{ color }}>{counts[key]}</div>
                <div className="stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tasks */}
        {loading ? (
          <div className="loading-wrapper" style={{ padding: '60px 0' }}>
            <div className="spinner" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
            <div className="empty-icon" style={{ fontSize: '2.5rem', marginBottom: 12 }}><Inbox size={48} style={{ opacity: 0.3 }} /></div>
            <h3>Topshiriq topilmadi</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filterStatus === 'ALL' ? 'Hozircha sizga topshiriq biriktirilmagan.' : `"${STATUS_CONFIG[filterStatus]?.label}" statusidagi topshiriqlar yo'q.`}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map(task => {
              const priority = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.NORMAL;
              const status   = STATUS_CONFIG[task.status]   || STATUS_CONFIG.PENDING;
              const dl       = formatDeadline(task.deadline);
              const currentIdx = STATUS_ORDER.indexOf(task.status);
              const nextStatus = STATUS_ORDER[currentIdx + 1] || null;

              return (
                <div key={task.id} style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Priority bar */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: priority.color, borderRadius: '12px 12px 0 0' }} />

                  {/* Header badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: priority.bg, color: priority.color, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      {priority.icon} {priority.label}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                      background: status.bg, color: status.color, display: 'flex', alignItems: 'center', gap: 5,
                    }}>
                      {status.icon} {status.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, lineHeight: 1.4 }}>
                    {task.title}
                  </h3>

                  {/* Description */}
                  <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6 }}>
                    {task.description}
                  </p>

                  {/* Meta */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <User size={13} color="var(--accent-light)" />
                      <span>{task.worker?.fullName}</span>
                    </div>
                    {dl && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: dl.overdue ? '#ef4444' : dl.soon ? '#f59e0b' : 'var(--text-muted)' }}>
                        <Calendar size={13} />
                        <span>Muddat: {dl.str} {dl.overdue ? '⚠️ Muddati o\'tgan' : dl.soon ? '⏰ Tez kunda' : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Action button */}
                  {nextStatus && task.status !== 'DONE' && (
                    <button
                      onClick={() => handleStatusChange(task, nextStatus)}
                      disabled={updatingId === task.id}
                      className="btn btn-primary btn-full"
                      style={{
                        fontSize: '0.83rem',
                        background: nextStatus === 'DONE' ? 'var(--success)' : 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}
                    >
                      {updatingId === task.id ? (
                        'Saqlanmoqda...'
                      ) : nextStatus === 'IN_PROGRESS' ? (
                        <><PlayCircle size={15} /> Boshlash <ChevronRight size={15} /></>
                      ) : (
                        <><CheckCircle2 size={15} /> Bajarildi deb belgilash <ChevronRight size={15} /></>
                      )}
                    </button>
                  )}

                  {task.status === 'DONE' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', padding: '8px 0', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
                      <Sparkles size={15} /> Muvaffaqiyatli bajarildi!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
