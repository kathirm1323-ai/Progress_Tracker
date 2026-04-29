import { useState } from 'react';

const categories = ['Work', 'Health', 'Learning', 'Personal'];
const statuses = ['Completed', 'In Progress', 'Pending'];

export default function AddProgressModal({ onClose, onSubmit, editData }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    goal: editData?.goal || '',
    category: editData?.category || categories[0],
    status: editData?.status || statuses[2],
    notes: editData?.notes || '',
    date: editData?.date || today,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.goal.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(form);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="glass-strong animate-fade-in-scale" style={{
        width: '100%', maxWidth: 480, padding: '2rem',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="gradient-text" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {editData ? 'Edit Progress' : 'Add Progress'}
          </h2>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, width: 32, height: 32, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-muted)', transition: 'all 0.2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
              Goal / Task *
            </label>
            <input name="goal" value={form.goal} onChange={handleChange} className="input-field" placeholder="e.g., Complete React module" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Category</label>
              <select name="category" value={form.category} onChange={handleChange} className="input-field" style={{ cursor: 'pointer' }}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input-field" style={{ cursor: 'pointer' }}>
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} className="input-field" style={{ colorScheme: 'dark' }} />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 6 }}>Notes</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} className="input-field" placeholder="Any additional notes..." rows={3} style={{ resize: 'vertical', minHeight: 80 }} />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting} style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Saving...' : editData ? 'Update' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
