import { useState } from 'react';
import { 
  CheckCircle, Trash2, Monitor, DoorOpen, Clock, CalendarCheck, 
  User, Briefcase, Building2, Phone, Edit2, Package, Wrench, 
  Hash, UserCheck, MessageSquare, AlertTriangle 
} from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function getWaitingTime(createdAt, resolvedAt) {
  const start = new Date(createdAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const diffMs = end - start;
  const diffHours = diffMs / (1000 * 60 * 60);

  let text = '';
  if (diffHours < 1) {
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    text = `${mins} daq`;
  } else if (diffHours < 24) {
    text = `${Math.floor(diffHours)} soat`;
  } else {
    const days = Math.floor(diffHours / 24);
    const remainHours = Math.floor(diffHours % 24);
    text = `${days}k ${remainHours}s`;
  }

  // SLA Color & Label
  let badgeStyle = {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.25)',
    label: `🟢 ${text}`
  };

  if (!resolvedAt) {
    if (diffHours >= 8 && diffHours < 24) {
      badgeStyle = {
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.12)',
        border: '1px solid rgba(245,158,11,0.3)',
        label: `🟡 ${text} kutilmoqda`
      };
    } else if (diffHours >= 24) {
      badgeStyle = {
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.14)',
        border: '1px solid rgba(239,68,68,0.4)',
        label: `🔴 ${text} (Kechikmoqda)`
      };
    } else {
      badgeStyle = {
        color: '#38bdf8',
        bg: 'rgba(56,189,248,0.12)',
        border: '1px solid rgba(56,189,248,0.25)',
        label: `⏱️ ${text}`
      };
    }
  } else {
    badgeStyle.label = `✅ Hal: ${text}da`;
  }

  return badgeStyle;
}

export default function ProblemCard({ 
  problem, 
  onResolve, 
  onDelete, 
  onEdit, 
  onAssign, 
  workers = [], 
  resolving, 
  deleting,
  assigning
}) {
  const isResolved = problem.status === 'RESOLVED';
  const isTM = problem.type === 'Texnik muammo';
  const sla = getWaitingTime(problem.createdAt, problem.resolvedAt);

  return (
    <div className={`problem-card ${isResolved ? 'resolved' : ''}`}>
      {/* Header row */}
      <div className="problem-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span className="ticket-number" style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
              {problem.ticketNumber}
            </span>
            {/* SLA badge (#5) */}
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: 6,
              background: sla.bg,
              color: sla.color,
              border: sla.border,
              display: 'inline-flex',
              alignItems: 'center',
            }}>
              {sla.label}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span className={`badge ${isResolved ? 'badge-resolved' : 'badge-new'}`}>
              <span className="badge-dot" />
              {isResolved ? 'Hal qilindi' : 'Yangi'}
            </span>
            <span className={`badge ${isTM ? 'badge-tm' : 'badge-js'}`} style={{
              background: isTM ? 'rgba(99,102,241,0.12)' : 'rgba(16,185,129,0.12)',
              color: isTM ? '#818cf8' : '#34d399',
              border: isTM ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(16,185,129,0.3)',
              display: 'inline-flex',
              alignItems: 'center'
            }}>
              {isTM ? <Wrench size={12} style={{ marginRight: 4 }} /> : <Package size={12} style={{ marginRight: 4 }} />}
              {problem.type || 'Texnik muammo'}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Info Grid */}
      <div className="crm-person-info" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, gridColumn: 'span 2' }}>
          <User size={14} color="var(--accent-light)" />
          <strong style={{ color: 'var(--text-primary)' }}>{problem.lastName} {problem.firstName} {problem.middleName}</strong>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Briefcase size={14} />
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{problem.position || '—'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Building2 size={14} />
          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{problem.objectName || '—'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, gridColumn: 'span 2' }}>
          <Phone size={14} />
          <a href={`tel:${problem.phone}`} style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>{problem.phone || '—'}</a>
        </div>
      </div>

      {/* Details (room/comp vs requestedItem) */}
      <div className="problem-meta" style={{ marginBottom: 12 }}>
        {isTM ? (
          <>
            <span className="meta-item">
              <DoorOpen size={13} />
              Xona: <strong style={{ color: 'var(--text-primary)' }}>{problem.room || '—'}</strong>
            </span>
            <span className="meta-item">
              <Monitor size={13} />
              Kompyuter: <strong style={{ color: 'var(--text-primary)' }}>{problem.computer || '—'}</strong>
            </span>
          </>
        ) : (
          <>
            <span className="meta-item" style={{ gridColumn: 'span 2' }}>
              <Package size={13} />
              Jihoz: <strong style={{ color: 'var(--text-primary)' }}>{problem.requestedItem || '—'}</strong>
            </span>
            <span className="meta-item">
              <Hash size={13} />
              Miqdor: <strong style={{ color: 'var(--text-primary)' }}>{problem.quantity || 1} ta</strong>
            </span>
          </>
        )}
      </div>

      {/* Description */}
      {problem.description && (
        <p className="problem-description" style={{ minHeight: '44px', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.85rem', marginBottom: 12 }}>
          {problem.description}
        </p>
      )}

      {/* Resolve Note Display (#3) */}
      {problem.resolveNote && (
        <div style={{
          background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)',
          borderRadius: 8,
          padding: '8px 12px',
          marginBottom: 12,
          fontSize: '0.82rem',
          color: '#34d399'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, marginBottom: 2 }}>
            <MessageSquare size={13} /> Yechim / Izoh:
          </div>
          <div style={{ color: 'var(--text-primary)' }}>
            {problem.resolveNote}
          </div>
        </div>
      )}

      {/* Assigned Worker Section (#7) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 8,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '6px 10px',
        marginBottom: 12,
        fontSize: '0.8rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
          <UserCheck size={14} color="#8b5cf6" />
          <span>Biriktirilgan:</span>
          <strong style={{ color: problem.assignedUser ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {problem.assignedUser?.fullName || 'Biriktirilmagan'}
          </strong>
        </div>

        {workers && workers.length > 0 && !isResolved && (
          <select
            value={problem.assignedUserId || ''}
            onChange={(e) => onAssign(problem.id, e.target.value ? Number(e.target.value) : null)}
            disabled={assigning === problem.id}
            style={{
              background: 'var(--input-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: '0.76rem',
              cursor: 'pointer'
            }}
          >
            <option value="">Biriktirish...</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.fullName}</option>
            ))}
          </select>
        )}
      </div>

      {/* Footer */}
      <div className="problem-card-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="problem-time">
            <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
            Yuborildi: {formatDate(problem.createdAt)}
          </span>
          {isResolved && problem.resolvedAt && (
            <span className="problem-time" style={{ color: 'var(--success)' }}>
              <CalendarCheck size={11} style={{ display: 'inline', marginRight: 4 }} />
              Hal qilindi: {formatDate(problem.resolvedAt)}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="card-actions" style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {!isResolved && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onResolve(problem)}
              disabled={resolving === problem.id}
            >
              <CheckCircle size={14} />
              Hal qilindi
            </button>
          )}
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => onEdit(problem)}
            style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'var(--text-secondary)' }}
          >
            <Edit2 size={14} />
            Tahrir
          </button>
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(problem.id)}
            disabled={deleting === problem.id}
          >
            <Trash2 size={14} />
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}