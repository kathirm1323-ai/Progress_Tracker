import { useMemo } from 'react';

const HEX_COLORS = [
  { empty: 'rgba(236, 72, 153, 0.15)', filled: '#ec4899', border: 'rgba(236, 72, 153, 0.4)' },
  { empty: 'rgba(139, 92, 246, 0.15)', filled: '#8b5cf6', border: 'rgba(139, 92, 246, 0.4)' },
  { empty: 'rgba(6, 182, 212, 0.15)', filled: '#06b6d4', border: 'rgba(6, 182, 212, 0.4)' },
  { empty: 'rgba(34, 197, 94, 0.15)', filled: '#22c55e', border: 'rgba(34, 197, 94, 0.4)' },
  { empty: 'rgba(245, 158, 11, 0.15)', filled: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)' },
];

function Hexagon({ filled, color, size = 32, index }) {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      pts.push(`${size / 2 + (size / 2 - 2) * Math.cos(angle)},${size / 2 + (size / 2 - 2) * Math.sin(angle)}`);
    }
    return pts.join(' ');
  }, [size]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        transition: 'all 0.3s ease',
        cursor: 'default',
        filter: filled ? `drop-shadow(0 0 6px ${color.filled}40)` : 'none',
        animation: filled ? `fadeIn 0.3s ease ${index * 0.02}s both` : 'none',
      }}
    >
      <polygon
        points={points}
        fill={filled ? color.filled : color.empty}
        stroke={filled ? color.filled : color.border}
        strokeWidth="1.5"
      />
      {filled && (
        <text
          x={size / 2}
          y={size / 2 + 1}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size * 0.3}
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          ✓
        </text>
      )}
    </svg>
  );
}

export default function GoalTracker({ entries, goalName, totalDays, startDate }) {
  const today = new Date();
  const start = startDate ? new Date(startDate) : new Date(today.getFullYear(), 0, 1);

  // Calculate how many days have entries with "Completed" status
  const completedDates = new Set(
    entries.filter(e => e.status === 'Completed').map(e => e.date)
  );

  // Generate all days from start
  const days = [];
  for (let i = 0; i < totalDays; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      filled: completedDates.has(dateStr),
      isPast: d <= today,
    });
  }

  const filledCount = days.filter(d => d.filled).length;
  const percentage = totalDays > 0 ? Math.round((filledCount / totalDays) * 100) : 0;

  return (
    <div className="glass" style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 2 }}>
            {totalDays}-Day Goal Tracker
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
            {goalName || 'Track your daily consistency'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 800 }} className="gradient-text">{filledCount}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}> / {totalDays}</span>
          </div>
          {/* Progress ring */}
          <div style={{ position: 'relative', width: 48, height: 48 }}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
              <circle
                cx="24" cy="24" r="20" fill="none"
                stroke="url(#progressGrad)" strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 20}`}
                strokeDashoffset={`${2 * Math.PI * 20 * (1 - percentage / 100)}`}
                transform="rotate(-90 24 24)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              {percentage}%
            </div>
          </div>
        </div>
      </div>

      {/* Hexagon Grid */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: '4px',
        justifyContent: 'center', padding: '0.5rem 0',
      }}>
        {days.map((day, i) => {
          const colorIndex = Math.floor(i / (totalDays / HEX_COLORS.length)) % HEX_COLORS.length;
          const rowIndex = Math.floor(i / 10);
          const color = HEX_COLORS[rowIndex % HEX_COLORS.length];
          return (
            <div
              key={day.date}
              title={`${day.date}${day.filled ? ' ✓ Completed' : ''}`}
              style={{ opacity: day.isPast || day.filled ? 1 : 0.4 }}
            >
              <Hexagon filled={day.filled} color={color} size={30} index={i} />
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(139, 92, 246, 0.15)', border: '1px solid rgba(139, 92, 246, 0.4)' }} />
          Not completed
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: '#8b5cf6' }} />
          Completed
        </div>
      </div>
    </div>
  );
}
