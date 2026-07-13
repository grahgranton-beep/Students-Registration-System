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
        backgroundColor: '#f0f2f7',
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
          borderBottom: '1px solid #e5e7eb',
          background: '#ffffff',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <GraduationCap size={15} color="#ffffff" />
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#111827' }}>
          Academic Registrar
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
            background: '#ffffff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
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
                color: '#111827',
                marginBottom: '0.4rem',
              }}
            >
              Institution Portal
            </h1>
            <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>
              Sign in to manage your academic records
            </p>
          </div>

          {/* Role Toggle */}
          <div
            style={{
              display: 'flex',
              background: '#f3f4f6',
              borderRadius: 10,
              padding: 4,
              marginBottom: '1.5rem',
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
                  background: role === r ? '#dbeafe' : 'transparent',
                  color: role === r ? '#1d4ed8' : '#6b7280',
                  boxShadow: role === r ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {r === 'student' ? 'Student' : 'Administrator'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Identifier */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-identifier">
                {role === 'student' ? 'Student ID or Email' : 'Username or Email'}
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{
                    position: 'absolute', left: 12, top: '50%',
                    transform: 'translateY(-50%)', color: '#9ca3af',
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
                <label className="form-label" htmlFor="login-password">Password</label>
                <button
                  type="button"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6366f1', fontSize: '0.8rem', fontWeight: 500,
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
                    transform: 'translateY(-50%)', color: '#9ca3af',
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
                    color: '#9ca3af', display: 'flex',
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
                color: '#374151',
              }}
            >
              <input
                type="checkbox"
                checked={keepSignedIn}
                onChange={e => setKeepSignedIn(e.target.checked)}
                style={{ width: 14, height: 14, accentColor: '#111827' }}
              />
              Keep me signed in
            </label>

            {/* Error */}
            {error && (
              <div
                style={{
                  padding: '0.75rem',
                  borderRadius: 8,
                  background: '#fee2e2',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                  border: '1px solid #fca5a5',
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
              color: '#6b7280',
            }}
          >
            New student?{' '}
            <Link
              to="/register"
              style={{ color: '#6366f1', fontWeight: 600, textDecoration: 'none' }}
            >
              Complete Onboarding
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
            color: '#6b7280',
          }}
        >
          <span
            style={{
              width: 7, height: 7, borderRadius: '50%',
              background: '#10b981', display: 'inline-block',
              boxShadow: '0 0 0 2px #d1fae5',
            }}
          />
          System Online
          <span style={{ color: '#d1d5db' }}>•</span>
          v2.4.0-Stable
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          textAlign: 'center',
          padding: '1.25rem',
          fontSize: '0.75rem',
          color: '#9ca3af',
          borderTop: '1px solid #e5e7eb',
          background: '#ffffff',
        }}
      >
        © 2024 Academic Registrar Registration Management System. All rights reserved.
      </footer>
    </div>
  );
};

export default Login;
