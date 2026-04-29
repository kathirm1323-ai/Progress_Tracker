import { useLocation } from 'react-router-dom';

export default function Navbar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard': return 'Dashboard';
      case '/history': return 'History';
      case '/account': return 'Account';
      default: return 'TrackPro';
    }
  };

  return (
    <nav className="glass hide-desktop" style={{ position: 'sticky', top: 0, zIndex: 40, borderRadius: 0, borderLeft: 'none', borderRight: 'none', borderTop: 'none', padding: '0 1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <button 
          onClick={() => setMobileOpen(!mobileOpen)} 
          style={{ background: 'none', border: 'none', color: 'var(--color-text-primary)', cursor: 'pointer', padding: 8 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d={mobileOpen ? 'M18 6L6 18M6 6l12 12' : 'M3 12h18M3 6h18M3 18h18'}/></svg>
        </button>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{getPageTitle()}</span>
        <div style={{ width: 40 }} /> {/* spacer for center alignment */}
      </div>
      <style>{`
        @media (min-width: 1024px) {
          .hide-desktop { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
