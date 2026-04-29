import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuth, updateProfile } from 'firebase/auth';

export default function Account() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setLoading(true);
    setMessage('');
    try {
      const auth = getAuth();
      await updateProfile(auth.currentUser, { displayName: displayName.trim() });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      // Force reload to reflect changes in UI
      window.location.reload();
    } catch (error) {
      console.error(error);
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: 4, color: 'var(--color-text-primary)' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Manage your profile and preferences.</p>
      </div>

      <div className="glass animate-fade-in" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: 20, 
            background: 'linear-gradient(135deg, var(--color-accent-indigo), var(--color-accent-violet))', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2rem', fontWeight: 800, color: 'white', overflow: 'hidden',
            boxShadow: '0 8px 25px rgba(236,72,153,0.3)'
          }}>
            {user?.photoURL ? <img src={user.photoURL} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : getInitials(user?.displayName)}
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{user?.displayName || 'User'}</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 8 }}>{user?.email}</p>
            <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>Active Account</span>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(236,72,153,0.1)' }} />

        {/* Edit Form */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Profile Details</h3>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)} className="btn-secondary" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#059669', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 500 }}>
              {message}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdate} className="animate-fade-in">
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>Display Name</label>
                <input 
                  type="text" 
                  value={displayName} 
                  onChange={(e) => setDisplayName(e.target.value)} 
                  className="input-field" 
                  style={{ maxWidth: 400 }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setDisplayName(user?.displayName || ''); }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Display Name</label>
                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{user?.displayName || 'Not set'}</p>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>Email Address</label>
                <p style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{user?.email}</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
