import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login, user, loading: authLoading } = useAuth();

  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const result = await login(identifier.trim(), password, role);
    if (!result.success) {
      setError(result.message || 'Invalid credentials. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 70%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          borderBottom: '1px solid #334155',
          background: '#1e293b',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GraduationCap size={15} color="#ffffff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f8fafc' }}>
          Apex University
        </span>
      </div>

      {/* Main */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        {/* Card */}
        <div
          style={{
            background: '#1e293b',
            borderRadius: 16,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid #334155',
            padding: '2rem 1.75rem',
            width: '100%',
            maxWidth: 400,
          }}
        >
          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <h1
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: '#f8fafc',
                marginBottom: '0.4rem',
              }}
            >
              Apex University Portal
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Sign in to manage your academic records
            </p>
          </div>

          {/* Role Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#0f172a',
              borderRadius: 10,
              padding: 4,
              marginBottom: '1.5rem',
              border: '1px solid #334155',
            }}
          >
            {['student', 'admin'].map(r => (
              <button
                key={r}
                onClick={() => { setRole(r); setError(''); }}
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-primary)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease',
                  background: role === r ? '#6366f1' : 'transparent',
                  color: role === r ? '#ffffff' : '#94a3b8',
                  boxShadow: role === r ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none',
                }}
              >
                {r === 'student' ? 'Student' : 'Administrator'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Identifier */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-identifier" style={{ color: '#cbd5e1' }}>
                {role === 'student' ? 'Student ID or Email' : 'Username or Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: '#94a3b8',
                  }}
                />
                <input
                  id="login-identifier"
                  className="form-input"
                  type="text"
                  placeholder={role === 'student' ? 'e.g. 2024-001' : 'admin'}
                  value={identifier}
                  onChange={e => setIdentifier(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="login-password" style={{ color: '#cbd5e1' }}>Password</label>
                <button
                  type="button"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#818cf8', fontSize: '0.8rem', fontWeight: 500,
                    fontFamily: 'var(--font-primary)',
                  }}
                >
                  Forgot Password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: '#94a3b8',
                  }}
                />
                <input
                  id="login-password"
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#94a3b8', display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Keep signed in */}
            <label
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                cursor: 'pointer', marginBottom: '1.25rem', fontSize: '0.875rem',
                color: '#cbd5e1',
              }}
            >
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={e => setKeepSignedIn(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: '#6366f1' }}
              />
              Keep me signed in
            </label>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 8,
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              id="login-submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.875rem',
                fontSize: '1rem',
                borderRadius: 10,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          {/* Register link */}
          <p
            style={{
              textAlign: 'center',
              marginTop: '1.25rem',
              fontSize: '0.875rem',
              color: '#94a3b8',
            }}
          >
            {role === 'admin' ? 'New administrator? ' : 'New user? '}
            <Link
              to="/register"
              style={{ color: '#818cf8', fontWeight: 600, textDecoration: 'none' }}
            >
              {role === 'admin' ? 'Create Admin Account' : 'Create Account / Register'}
            </Link>
          </p>
        </div>

        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '1.5rem',
            fontSize: '0.78rem',
            color: '#94a3b8',
          }}
        >
          <span
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#10b981', display: 'inline-block',
              boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)',
            }}
          />
          System Online
          <span style={{ color: '#475569' }}>•</span>
          v2.4.0-Stable
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1.25rem',
          fontSize: '0.75rem',
          color: '#94a3b8',
          borderTop: '1px solid #334155',
          background: '#1e293b',
        }}
      >
        © 2026 Apex University Student Registration Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
