import { CheckCircle, Trash2, Monitor, DoorOpen, Clock, CalendarCheck } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('uz-UZ', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function ProblemCard({ problem, onResolve, onDelete, resolving, deleting }) {
  const isResolved = problem.status === 'RESOLVED';

  return (
    <div className={`problem-card ${isResolved ? 'resolved' : ''}`}>
      {/* Header row */}
      <div className="problem-card-header">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span className="ticket-number">{problem.ticketNumber}</span>
          <span
            className={`badge ${isResolved ? 'badge-resolved' : 'badge-new'}`}
          >
            <span className="badge-dot" />
            {isResolved ? 'Hal qilindi' : 'Yangi'}
          </span>
        </div>
      </div>

      {/* Meta row */}
      <div className="problem-meta">
        <span className="meta-item">
          <DoorOpen size={13} />
          Xona: <strong style={{ color: 'var(--text-primary)' }}>{problem.room}</strong>
        </span>
        <span className="meta-item">
          <Monitor size={13} />
          Kompyuter: <strong style={{ color: 'var(--text-primary)' }}>{problem.computer}</strong>
        </span>
      </div>

      {/* Description */}
      <p className="problem-description">{problem.description}</p>

      {/* Footer */}
      <div className="problem-card-footer">
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
        <div className="card-actions">
          {!isResolved && (
            <button
              className="btn btn-success btn-sm"
              onClick={() => onResolve(problem.id)}
              disabled={resolving}
            >
              <CheckCircle size={14} />
              {resolving ? 'Saqlanmoqda...' : 'Hal qilindi'}
            </button>
          )}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(problem.id)}
            disabled={deleting}
          >
            <Trash2 size={14} />
            {deleting ? "O'chirilmoqda..." : "O'chirish"}
          </button>
        </div>
      </div>
    </div>
  );
}
