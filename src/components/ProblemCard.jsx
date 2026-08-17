import { CheckCircle, Trash2, Monitor, DoorOpen, Clock, CalendarCheck, User, Briefcase, Building2, Phone, Edit2, Package, Wrench, Hash } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ProblemCard({ problem, onResolve, onDelete, onEdit, resolving, deleting }) {
  const isResolved = problem.status === 'RESOLVED';
  const isTM = problem.type === 'Texnik muammo';

  return (
    <div className={`problem-card ${isResolved ? 'resolved' : ''}`}>
      {/* Header row */}
      <div className="problem-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, borderBottom: '1px solid var(--border)', paddingBottom: 12, marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <span className="ticket-number" style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{problem.ticketNumber}</span>
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

      {/* Footer */}
      <div className="problem-card-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 12 }}>
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
              onClick={() => onResolve(problem.id)}
              disabled={resolving}
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
            disabled={deleting}
          >
            <Trash2 size={14} />
            O'chirish
          </button>
        </div>
      </div>
    </div>
  );
}
