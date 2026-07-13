import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Bell } from 'lucide-react';

const Navbar = () => {
  const { user, token } = useAuth();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!token || !user || user.role !== 'admin') return;
    fetch('http://localhost:5000/api/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => {
        if (d.stats) setPendingCount(d.stats.pending_registrations || 0);
      })
      .catch(() => {});
  }, [token, user]);

  if (!user) return null;

  const initials = user.username
    ? user.username.substring(0, 2).toUpperCase()
    : 'AR';

  return (
    <header className="app-header">
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <GraduationCap size={16} color="#ffffff" />
        </div>
        <span
          style={{
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          Academic Registrar
        </span>
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ position: 'relative' }}>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              borderRadius: 8,
              color: 'var(--text-secondary)',
              transition: 'background var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <Bell size={20} />
          </button>
          {pendingCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#ef4444',
                border: '1.5px solid white',
              }}
            />
          )}
        </div>

        {user.role === 'admin' && (
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: '#111827',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.68rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
