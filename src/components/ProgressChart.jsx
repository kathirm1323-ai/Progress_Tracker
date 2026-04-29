import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PERIODS = [
  { key: 'weekly', label: 'Weekly', days: 7 },
  { key: 'monthly', label: 'Monthly', days: 30 },
  { key: 'yearly', label: 'Yearly', days: 365 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)',
      border: '1px solid rgba(236,72,153,0.12)', borderRadius: 12,
      padding: '12px 16px', fontSize: '0.82rem', boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 8, color: '#1e293b' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
          <span style={{ color: '#64748b' }}>{p.name}:</span>
          <span style={{ fontWeight: 600, color: '#1e293b' }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
}

function getWeeklyData(entries) {
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayEntries = entries.filter(e => e.date === dateStr);
    days.push({
      name: dayNames[d.getDay()],
      Completed: dayEntries.filter(e => e.status === 'Completed').length,
      'In Progress': dayEntries.filter(e => e.status === 'In Progress').length,
      Pending: dayEntries.filter(e => e.status === 'Pending').length,
    });
  }
  return days;
}

function getMonthlyData(entries) {
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - (w * 7 + 6));
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - w * 7);
    const startStr = weekStart.toISOString().split('T')[0];
    const endStr = weekEnd.toISOString().split('T')[0];
    const weekEntries = entries.filter(e => e.date >= startStr && e.date <= endStr);
    const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
    weeks.push({
      name: `Week ${4 - w}`,
      fullLabel: label,
      Completed: weekEntries.filter(e => e.status === 'Completed').length,
      'In Progress': weekEntries.filter(e => e.status === 'In Progress').length,
      Pending: weekEntries.filter(e => e.status === 'Pending').length,
    });
  }
  return weeks;
}

function getYearlyData(entries) {
  const months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  for (let m = 11; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthEntries = entries.filter(e => e.date?.startsWith(prefix));
    months.push({
      name: monthNames[month],
      Completed: monthEntries.filter(e => e.status === 'Completed').length,
      'In Progress': monthEntries.filter(e => e.status === 'In Progress').length,
      Pending: monthEntries.filter(e => e.status === 'Pending').length,
    });
  }
  return months;
}

export default function ProgressChart({ entries }) {
  const [period, setPeriod] = useState('weekly');

  const data = useMemo(() => {
    switch (period) {
      case 'monthly': return getMonthlyData(entries);
      case 'yearly': return getYearlyData(entries);
      default: return getWeeklyData(entries);
    }
  }, [entries, period]);

  const totalCompleted = data.reduce((s, d) => s + d.Completed, 0);
  const totalInProgress = data.reduce((s, d) => s + d['In Progress'], 0);
  const totalPending = data.reduce((s, d) => s + d.Pending, 0);
  const total = totalCompleted + totalInProgress + totalPending;

  return (
    <div className="glass" style={{ padding: '1.5rem' }}>
      {/* Header with period tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
          Progress Overview
        </h3>
        <div style={{ display: 'flex', gap: '4px', background: 'rgba(236,72,153,0.06)', borderRadius: 10, padding: 3 }}>
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              style={{
                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-sans)',
                transition: 'all 0.25s ease',
                background: period === p.key ? 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-violet))' : 'transparent',
                color: period === p.key ? 'white' : 'var(--color-text-muted)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary stats row */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: total, color: 'var(--color-text-primary)' },
          { label: 'Completed', value: totalCompleted, color: '#10b981' },
          { label: 'In Progress', value: totalInProgress, color: '#f59e0b' },
          { label: 'Pending', value: totalPending, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, color: s.color }}>{s.value}</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={2} barSize={period === 'yearly' ? 12 : 16}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(236,72,153,0.06)" />
          <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(236,72,153,0.1)' }} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: 'rgba(236,72,153,0.1)' }} tickLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(236,72,153,0.04)' }} />
          <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#94a3b8', paddingTop: 8 }} />
          <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="In Progress" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Pending" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
