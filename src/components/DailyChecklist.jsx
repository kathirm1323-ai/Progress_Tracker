import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getRoutines, addRoutine, deleteRoutine,
  getCheckins, saveCheckins, getCheckinRange,
} from '../firebase/firestore';


export default function DailyChecklist() {
  const { user } = useAuth();
  const [routines, setRoutines] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('08:00');
  const [newIcon, setNewIcon] = useState('✅');
  const [view, setView] = useState('daily');
  const seededRef = useRef(false);

  const today = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let items = await getRoutines(user.uid);
      // Removed auto-seeding logic as requested
      setRoutines(items);
      const checkin = await getCheckins(user.uid, today);
      setCompleted(checkin.completed || []);

      // Fetch history data (last 30 days)
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - 29);
      const startStr = periodStart.toISOString().split('T')[0];
      const range = await getCheckinRange(user.uid, startStr, today);
      setHistoryData(range);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user, today]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleItem = async (routineId) => {
    const newCompleted = completed.includes(routineId)
      ? completed.filter(id => id !== routineId)
      : [...completed, routineId];
    setCompleted(newCompleted);
    await saveCheckins(user.uid, today, newCompleted);
    // Update history data
    setHistoryData(prev => ({ ...prev, [today]: { completed: newCompleted } }));
  };

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    await addRoutine(user.uid, {
      name: newName.trim(),
      time: newTime,
      icon: newIcon,
      order: routines.length + 1,
    });
    setNewName('');
    setNewTime('08:00');
    setNewIcon('✅');
    setShowAdd(false);
    fetchData();
  };

  const handleDeleteRoutine = async (id) => {
    if (!window.confirm('Remove this routine?')) return;
    await deleteRoutine(user.uid, id);
    fetchData();
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete ALL routines? This cannot be undone.')) return;
    setLoading(true);
    try {
      for (const r of routines) {
        await deleteRoutine(user.uid, r.id);
      }
      setRoutines([]);
      setCompleted([]);
      await saveCheckins(user.uid, today, []);
      // Update history data to be empty for today at least
      setHistoryData(prev => ({ ...prev, [today]: { completed: [] } }));
    } catch (err) {
      console.error('Failed to clear routines:', err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = completed.length;
  const totalCount = routines.length;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Last 7 days
  const weekDays = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    weekDays.push({
      date: d.toISOString().split('T')[0],
      label: dayLabels[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }

  // Last 30 days
  const monthDays = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    monthDays.push({
      date: d.toISOString().split('T')[0],
      dayNum: d.getDate(),
      isToday: i === 0,
    });
  }

  const iconOptions = ['✅', '🌅', '🏋️', '🍳', '💻', '🍱', '📋', '🚶', '🍽️', '📖', '😴', '🧘', '💊', '🎯', '📝', '🎵', '🚿', '🧹'];

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="spinner" /></div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Daily Routine</h2>
          {/* View toggle */}
          <div style={{ display: 'flex', gap: 3, background: 'rgba(236,72,153,0.06)', borderRadius: 8, padding: 2 }}>
            {['daily', 'weekly', 'monthly'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '4px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
                textTransform: 'capitalize',
                background: view === v ? 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-violet))' : 'transparent',
                color: view === v ? 'white' : 'var(--color-text-muted)',
                transition: 'all 0.2s',
              }}>{v}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {/* Progress */}
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
            <span style={{ fontWeight: 700, color: percentage === 100 ? '#059669' : 'var(--color-accent-indigo)' }}>{completedCount}</span>
            /{totalCount}
          </span>
          {/* Progress bar */}
          <div style={{ width: 100, height: 6, borderRadius: 3, background: 'rgba(236,72,153,0.1)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3, transition: 'width 0.5s ease',
              width: `${percentage}%`,
              background: percentage === 100 ? '#059669' : 'linear-gradient(90deg, var(--color-accent-indigo), var(--color-accent-violet))',
            }} />
          </div>
          <button onClick={() => setShowAdd(!showAdd)} style={{
            width: 28, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'rgba(236,72,153,0.1)', color: '#ec4899', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem',
            transition: 'all 0.2s',
          }}>+</button>
          {routines.length > 0 && (
            <button onClick={handleClearAll} style={{
              padding: '0.5rem 1rem', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: '#ef4444', color: 'white', display: 'flex', fontWeight: 'bold',
              alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s',
            }} title="Clear All Routines">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              DELETE ALL ROUTINES
            </button>
          )}
        </div>
      </div>

      {/* Add Routine Form */}
      {showAdd && (
        <form onSubmit={handleAddRoutine} className="glass animate-slide-down" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'end' }}>
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Icon</label>
            <select value={newIcon} onChange={e => setNewIcon(e.target.value)} className="input-field" style={{ width: 60, padding: '0.5rem', textAlign: 'center', fontSize: '1rem' }}>
              {iconOptions.map(ic => <option key={ic} value={ic}>{ic}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: 150 }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Routine Name</label>
            <input value={newName} onChange={e => setNewName(e.target.value)} className="input-field" placeholder="e.g., Meditation" style={{ padding: '0.5rem 0.75rem' }} required />
          </div>
          <div style={{ flex: '0 0 auto' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Time</label>
            <input type="time" value={newTime} onChange={e => setNewTime(e.target.value)} className="input-field" style={{ padding: '0.5rem 0.75rem', colorScheme: 'dark' }} />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Add</button>
        </form>
      )}

      {/* DAILY VIEW */}
      {view === 'daily' && (
        <div className="stagger-children" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {routines.map(r => {
            const done = completed.includes(r.id);
            return (
              <div
                key={r.id}
                onClick={() => toggleItem(r.id)}
                className="glass"
                style={{
                  padding: '0.85rem 1rem',
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  cursor: 'pointer', transition: 'all 0.25s ease',
                  borderColor: done ? 'rgba(16,185,129,0.25)' : undefined,
                  background: done ? 'rgba(16,185,129,0.05)' : undefined,
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)'; }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                  border: done ? '2px solid #059669' : '2px solid rgba(236,72,153,0.2)',
                  background: done ? '#059669' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.25s ease',
                }}>
                  {done && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>

                {/* Icon */}
                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{r.icon}</span>

                {/* Name & Time */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    fontSize: '0.9rem', fontWeight: 500,
                    textDecoration: done ? 'line-through' : 'none',
                    color: done ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                    transition: 'all 0.25s',
                  }}>
                    {r.name}
                  </span>
                </div>

                {/* Time badge */}
                <span style={{
                  fontSize: '0.72rem', fontWeight: 600, padding: '3px 10px',
                  borderRadius: 6, flexShrink: 0,
                  background: done ? 'rgba(5,150,105,0.1)' : 'rgba(236,72,153,0.08)',
                  color: done ? '#059669' : '#ec4899',
                  border: `1px solid ${done ? 'rgba(5,150,105,0.2)' : 'rgba(236,72,153,0.2)'}`,
                }}>
                  {r.time}
                </span>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); handleDeleteRoutine(r.id); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--color-text-muted)', padding: 4, opacity: 0.4,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0.4}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* WEEKLY VIEW */}
      {view === 'weekly' && (
        <div className="glass animate-fade-in" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid rgba(236,72,153,0.1)' }}>
                  Routine
                </th>
                {weekDays.map(d => (
                  <th key={d.date} style={{
                    padding: '8px 6px', textAlign: 'center', fontSize: '0.7rem',
                    color: d.isToday ? 'var(--color-accent-indigo)' : 'var(--color-text-muted)',
                    fontWeight: 600, borderBottom: '1px solid rgba(236,72,153,0.1)',
                    background: d.isToday ? 'rgba(236,72,153,0.05)' : 'transparent',
                  }}>
                    <div>{d.label}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, marginTop: 2 }}>{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routines.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(236,72,153,0.05)' }}>
                  <td style={{ padding: '10px 12px', fontSize: '0.82rem', fontWeight: 500 }}>
                    <span style={{ marginRight: 8 }}>{r.icon}</span>
                    {r.name}
                  </td>
                  {weekDays.map(d => {
                    const dayData = d.isToday ? { completed } : (historyData[d.date] || { completed: [] });
                    const isDone = (dayData.completed || []).includes(r.id);
                    return (
                      <td key={d.date} style={{
                        padding: '6px', textAlign: 'center',
                        background: d.isToday ? 'rgba(236,72,153,0.05)' : 'transparent',
                      }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 8, margin: '0 auto',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDone ? 'rgba(5,150,105,0.15)' : 'rgba(236,72,153,0.05)',
                          border: `1px solid ${isDone ? 'rgba(5,150,105,0.3)' : 'rgba(236,72,153,0.1)'}`,
                          transition: 'all 0.2s',
                        }}>
                          {isDone ? (
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(236,72,153,0.15)' }} />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Weekly summary row */}
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(236,72,153,0.1)' }}>
            {weekDays.map(d => {
              const dayData = d.isToday ? { completed } : (weekData[d.date] || { completed: [] });
              const count = (dayData.completed || []).length;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={d.date} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: pct === 100 ? '#059669' : pct > 0 ? '#d97706' : 'var(--color-text-muted)' }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MONTHLY VIEW */}
      {view === 'monthly' && (
        <div className="glass animate-fade-in" style={{ padding: '1rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
            <thead>
              <tr>
                <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid rgba(236,72,153,0.1)' }}>
                  Routine
                </th>
                {monthDays.map(d => (
                  <th key={d.date} style={{
                    padding: '8px 4px', textAlign: 'center', fontSize: '0.7rem',
                    color: d.isToday ? 'var(--color-accent-indigo)' : 'var(--color-text-muted)',
                    fontWeight: 600, borderBottom: '1px solid rgba(236,72,153,0.1)',
                    background: d.isToday ? 'rgba(236,72,153,0.05)' : 'transparent',
                  }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700 }}>{d.dayNum}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {routines.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid rgba(236,72,153,0.05)' }}>
                  <td style={{ padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap' }}>
                    <span style={{ marginRight: 6 }}>{r.icon}</span>
                    {r.name}
                  </td>
                  {monthDays.map(d => {
                    const dayData = d.isToday ? { completed } : (historyData[d.date] || { completed: [] });
                    const isDone = (dayData.completed || []).includes(r.id);
                    return (
                      <td key={d.date} style={{
                        padding: '4px', textAlign: 'center',
                        background: d.isToday ? 'rgba(236,72,153,0.05)' : 'transparent',
                      }}>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6, margin: '0 auto',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: isDone ? 'rgba(5,150,105,0.15)' : 'rgba(236,72,153,0.05)',
                          border: `1px solid ${isDone ? 'rgba(5,150,105,0.3)' : 'rgba(236,72,153,0.1)'}`,
                          transition: 'all 0.2s',
                        }}>
                          {isDone ? (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                          ) : null}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {/* Monthly summary row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 120, marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(236,72,153,0.1)' }}>
            {monthDays.map(d => {
              const dayData = d.isToday ? { completed } : (historyData[d.date] || { completed: [] });
              const count = (dayData.completed || []).length;
              const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              return (
                <div key={d.date} style={{ textAlign: 'center', flex: 1 }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: pct === 100 ? '#059669' : pct > 0 ? '#d97706' : 'var(--color-text-muted)' }}>
                    {pct > 0 ? `${pct}%` : '-'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completion message */}
      {percentage === 100 && view === 'daily' && (
        <div className="glass animate-fade-in-scale" style={{
          marginTop: '1rem', padding: '1.25rem', textAlign: 'center',
          borderColor: 'rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.05)',
        }}>
          <span style={{ fontSize: '2rem' }}>🎉</span>
          <p style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem', marginTop: 4 }}>All routines completed!</p>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Amazing work today!</p>
        </div>
      )}
    </div>
  );
}
