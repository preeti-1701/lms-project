import React from 'react';

// ---- Button ----
export function Button({ children, onClick, variant = 'primary', size = 'md', disabled, style }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    border: 'none', borderRadius: 8, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 500, fontFamily: "'Inter', sans-serif", transition: 'all 0.15s',
    opacity: disabled ? 0.6 : 1,
    fontSize: size === 'sm' ? '0.8rem' : '0.875rem',
    padding: size === 'sm' ? '6px 12px' : '10px 18px',
  };
  const variants = {
    primary: { background: '#6366f1', color: '#fff' },
    danger: { background: '#ef4444', color: '#fff' },
    success: { background: '#10b981', color: '#fff' },
    secondary: { background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' },
    ghost: { background: 'transparent', color: '#6366f1', border: '1px solid #6366f1' },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

// ---- Badge ----
export function Badge({ children, color = 'gray' }) {
  const colors = {
    green: { background: '#d1fae5', color: '#065f46' },
    red: { background: '#fee2e2', color: '#991b1b' },
    blue: { background: '#dbeafe', color: '#1e40af' },
    yellow: { background: '#fef3c7', color: '#92400e' },
    gray: { background: '#f3f4f6', color: '#374151' },
    purple: { background: '#ede9fe', color: '#5b21b6' },
  };
  return (
    <span style={{ ...colors[color], padding: '2px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 600, display: 'inline-block' }}>
      {children}
    </span>
  );
}

// ---- Card ----
export function Card({ children, style }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24, ...style }}>
      {children}
    </div>
  );
}

// ---- StatCard ----
export function StatCard({ label, value, icon, color = '#6366f1' }) {
  return (
    <Card style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 4 }}>{label}</div>
      </div>
    </Card>
  );
}

// ---- Modal ----
export function Modal({ open, onClose, title, children, width = 500 }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>{title}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: '#6b7280', lineHeight: 1 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

// ---- FormField ----
export function FormField({ label, children, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>}
      {children}
      {error && <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: 4 }}>{error}</p>}
    </div>
  );
}

// ---- Input ----
export function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
        borderRadius: 8, fontSize: '0.875rem', color: '#111827',
        background: '#fff', outline: 'none', fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box', ...props.style
      }}
    />
  );
}

// ---- Select ----
export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
        borderRadius: 8, fontSize: '0.875rem', color: '#111827',
        background: '#fff', outline: 'none', fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box', ...props.style
      }}
    >
      {children}
    </select>
  );
}

// ---- Textarea ----
export function Textarea({ ...props }) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%', padding: '9px 12px', border: '1px solid #d1d5db',
        borderRadius: 8, fontSize: '0.875rem', color: '#111827',
        background: '#fff', outline: 'none', fontFamily: "'Inter', sans-serif",
        boxSizing: 'border-box', resize: 'vertical', minHeight: 80, ...props.style
      }}
    />
  );
}

// ---- Table ----
export function Table({ columns, data, emptyMessage = 'No data found' }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid #e5e7eb' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
            {columns.map((col) => (
              <th key={col.key} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#374151', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: '#9ca3af' }}>{emptyMessage}</td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: '12px 16px', color: '#374151', verticalAlign: 'middle' }}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ---- Alert ----
export function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  const colors = {
    error: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
    success: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
    info: { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  };
  const c = colors[type];
  return (
    <div style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}`, borderRadius: 8, padding: '10px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
      <span>{message}</span>
      {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.color, fontWeight: 700, marginLeft: 8 }}>✕</button>}
    </div>
  );
}

// ---- Spinner ----
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e5e7eb', borderTop: '3px solid #6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
