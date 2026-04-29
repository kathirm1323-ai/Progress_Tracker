import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ mobileOpen, setMobileOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error(err);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const links = [
    { path: '/dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z' },
    { path: '/history', label: 'History', icon: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 4v6l4 2' },
    { path: '/account', label: 'Account', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside 
        className="glass"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: 250,
          zIndex: 50,
          borderRadius: 0,
          borderLeft: 'none',
          borderTop: 'none',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid rgba(236,72,153,0.1)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>
            🚀
          </div>
          <span className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 800 }}>TrackPro</span>
        </div>

        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {links.map(l => {
            const active = location.pathname === l.path;
            return (
              <Link 
                key={l.path} 
                to={l.path} 
                onClick={() => setMobileOpen(false)}
                style={{ 
                  textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12, 
                  padding: '12px 16px', borderRadius: 12, fontSize: '0.95rem', 
                  fontWeight: active ? 600 : 500, 
                  color: active ? 'var(--color-accent-indigo)' : 'var(--color-text-secondary)', 
                  background: active ? 'rgba(236,72,153,0.08)' : 'transparent', 
                  transition: 'all 0.2s',
                  border: active ? '1px solid rgba(236,72,153,0.15)' : '1px solid transparent',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={l.icon}/></svg>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(236,72,153,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'white', overflow: 'hidden' }}>
              {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.displayName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.displayName || 'User'}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Logout
          </button>
        </div>
      </aside>

      <style>{`
        @media (min-width: 1024px) {
          aside {
            transform: translateX(0) !important;
          }
        }
      `}</style>
    </>
  );
}
