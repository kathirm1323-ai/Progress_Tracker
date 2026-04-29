import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProgress, addProgress, updateProgress, deleteProgress } from '../firebase/firestore';
import ProgressCard from '../components/ProgressCard';
import ProgressChart from '../components/ProgressChart';
import DailyChecklist from '../components/DailyChecklist';
import AddProgressModal from '../components/AddProgressModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [activeTab, setActiveTab] = useState('routine');

  const today = new Date().toISOString().split('T')[0];
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const fetchEntries = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getProgress(user.uid);
      setEntries(data);
    } catch (err) {
      console.error('Failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const todayEntries = entries.filter(e => e.date === today);

  const handleAddOrUpdate = async (formData) => {
    if (editEntry) {
      await updateProgress(user.uid, editEntry.id, formData);
    } else {
      await addProgress(user.uid, formData);
    }
    setEditEntry(null);
    await fetchEntries();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await deleteProgress(user.uid, id);
    await fetchEntries();
  };

  const handleEdit = (entry) => {
    setEditEntry(entry);
    setShowModal(true);
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const tabs = [
    { key: 'routine', label: 'Daily Routine', icon: '📋' },
    { key: 'progress', label: 'Progress Log', icon: '📊' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Header */}
      <div className="animate-fade-in" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4 }}>
              {greeting}, <span className="gradient-text">{user?.displayName || 'User'}</span>
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{formattedDate}</p>
          </div>
          {activeTab === 'progress' && (
            <button className="btn-primary" onClick={() => { setEditEntry(null); setShowModal(true); }} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Add Progress
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="animate-fade-in" style={{ display: 'flex', gap: 6, marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '10px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              fontSize: '0.88rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.25s ease',
              background: activeTab === t.key ? 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-violet))' : 'rgba(236,72,153,0.06)',
              color: activeTab === t.key ? 'white' : 'var(--color-text-muted)',
              border: activeTab === t.key ? '1px solid transparent' : '1px solid rgba(236,72,153,0.15)',
              boxShadow: activeTab === t.key ? '0 4px 15px rgba(236,72,153,0.3)' : 'none',
            }}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* DAILY ROUTINE TAB */}
      {activeTab === 'routine' && (
        <div className="animate-fade-in">
          <DailyChecklist />
        </div>
      )}

      {/* PROGRESS LOG TAB */}
      {activeTab === 'progress' && (
        <div className="animate-fade-in">
          {/* Chart */}
          <div style={{ marginBottom: '1.5rem' }}>
            <ProgressChart entries={entries} />
          </div>

          {/* Today's Entries */}
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            Today's Progress
            <span style={{ fontSize: '0.82rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
              ({todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'})
            </span>
          </h2>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>
          ) : todayEntries.length === 0 ? (
            <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📝</div>
              <p style={{ color: 'var(--color-text-secondary)', fontWeight: 500, marginBottom: 4 }}>No progress logged today</p>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Click "Add Progress" to start tracking</p>
            </div>
          ) : (
            <div className="stagger-children" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
              {todayEntries.map(e => (
                <ProgressCard key={e.id} entry={e} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <AddProgressModal
          onClose={() => { setShowModal(false); setEditEntry(null); }}
          onSubmit={handleAddOrUpdate}
          editData={editEntry}
        />
      )}
    </div>
  );
}
