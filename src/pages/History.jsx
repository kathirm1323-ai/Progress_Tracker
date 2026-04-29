import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProgress, deleteProgress } from '../firebase/firestore';

const categories = ['All', 'Work', 'Health', 'Learning', 'Personal'];
const statuses = ['All', 'Completed', 'In Progress', 'Pending'];

export default function History() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getProgress(user.uid);
      setEntries(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await deleteProgress(user.uid, id);
    await fetchEntries();
  };

  const filtered = entries.filter(e => {
    if (filterCat !== 'All' && e.category !== filterCat) return false;
    if (filterStatus !== 'All' && e.status !== filterStatus) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    return true;
  });

  const statusClass = (s) => ({
    'Completed': 'badge-completed',
    'In Progress': 'badge-inprogress',
    'Pending': 'badge-pending',
  }[s] || '');

  const catClass = (c) => ({
    'Work': 'tag-work',
    'Health': 'tag-health',
    'Learning': 'tag-learning',
    'Personal': 'tag-personal',
  }[c] || '');

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
          <span className="gradient-text">History</span>
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Browse and filter all your progress entries</p>
      </div>

      {/* Filters */}
      <div className="glass animate-fade-in" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="input-field" style={{ cursor: 'pointer', padding: '0.6rem 0.75rem' }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</label>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field" style={{ cursor: 'pointer', padding: '0.6rem 0.75rem' }}>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="input-field" style={{ colorScheme: 'dark', padding: '0.6rem 0.75rem' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 500, color: 'var(--color-text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="input-field" style={{ colorScheme: 'dark', padding: '0.6rem 0.75rem' }} />
          </div>
        </div>
        {(filterCat !== 'All' || filterStatus !== 'All' || dateFrom || dateTo) && (
          <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            <button onClick={() => { setFilterCat('All'); setFilterStatus('All'); setDateFrom(''); setDateTo(''); }} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.78rem' }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="glass animate-fade-in" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔍</div>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500 }}>No entries found</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="glass animate-fade-in" style={{ overflow: 'hidden' }}>
          {/* Desktop table */}
          <div className="hide-on-mobile" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Date', 'Goal', 'Category', 'Status', 'Notes', ''].map(h => (
                    <th key={h} style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id} className="animate-fade-in" style={{ borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', transition: 'background 0.2s' }}
                    onMouseEnter={ev => ev.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={ev => ev.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>{e.date}</td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 500, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.goal}</td>
                    <td style={{ padding: '0.85rem 1rem' }}><span className={`badge ${catClass(e.category)}`} style={{ fontSize: '0.7rem' }}>{e.category}</span></td>
                    <td style={{ padding: '0.85rem 1rem' }}><span className={`badge ${statusClass(e.status)}`}>{e.status}</span></td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--color-text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.notes || '—'}</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button onClick={() => handleDelete(e.id)} className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="show-on-mobile" style={{ display: 'none', padding: '0.5rem' }}>
            {filtered.map(e => (
              <div key={e.id} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 4 }}>{e.goal}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>{e.date}</p>
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="btn-danger" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Delete</button>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className={`badge ${catClass(e.category)}`} style={{ fontSize: '0.68rem' }}>{e.category}</span>
                  <span className={`badge ${statusClass(e.status)}`} style={{ fontSize: '0.68rem' }}>{e.status}</span>
                </div>
                {e.notes && <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 6 }}>{e.notes}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
}
