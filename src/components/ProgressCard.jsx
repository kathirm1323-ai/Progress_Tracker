export default function ProgressCard({ entry, onEdit, onDelete }) {
  const statusClass = {
    'Completed': 'badge-completed',
    'In Progress': 'badge-inprogress',
    'Pending': 'badge-pending',
  }[entry.status] || 'badge-pending';

  const categoryClass = {
    'Work': 'tag-work',
    'Health': 'tag-health',
    'Learning': 'tag-learning',
    'Personal': 'tag-personal',
  }[entry.category] || 'tag-work';

  const statusDot = {
    'Completed': '#10b981',
    'In Progress': '#f59e0b',
    'Pending': '#ef4444',
  }[entry.status] || '#ef4444';

  return (
    <div className="glass animate-fade-in" style={{
      padding: '1.25rem',
      transition: 'all 0.3s ease',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'rgba(236,72,153,0.3)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'rgba(236,72,153,0.1)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 6, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {entry.goal}
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span className={`badge ${categoryClass}`} style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 20 }}>
              {entry.category}
            </span>
            <span className={`badge ${statusClass}`}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: statusDot, display: 'inline-block' }} />
              {entry.status}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
          {onEdit && (
            <button onClick={() => onEdit(entry)} style={{
              background: 'rgba(236,72,153,0.08)', border: '1px solid rgba(236,72,153,0.15)',
              borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#ec4899', transition: 'all 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          )}
          {onDelete && (
            <button onClick={() => onDelete(entry.id)} style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          )}
        </div>
      </div>

      {entry.notes && (
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', lineHeight: 1.5, marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {entry.notes}
        </p>
      )}

      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        {entry.date}
      </div>
    </div>
  );
}
