import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, User, Mail, Lock, Phone, UserCheck, Hash, ShieldCheck, KeyRound } from 'lucide-react';

import { API_BASE } from '../config';

const Register = () => {
  const { registerStudent, registerAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Role toggle: 'student' or 'admin'
  const [role, setRole] = useState('student');

  // Student Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    registration_no: '',
    first_name: '',
    last_name: '',
    gender: 'Male',
    date_of_birth: '',
    phone: '',
    program_id: ''
  });

  // Admin Form State
  const [adminData, setAdminData] = useState({
    username: '',
    email: '',
    password: '',
    admin_key: 'ADMIN2026'
  });

  const [programs, setPrograms] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    }
  }, [user, navigate]);

  // Fetch programs list on mount
  useEffect(() => {
    fetch(`${API_BASE}/programs`)
      .then(res => res.json())
      .then(data => {
        setPrograms(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, program_id: data[0].id.toString() }));
        }
      })
      .catch(err => {
        console.error("Error loading programs", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (role === 'student') {
      if (!formData.username || !formData.email || !formData.password || !formData.registration_no || !formData.first_name || !formData.last_name || !formData.program_id) {
        setError("Please fill out all required fields.");
        return;
      }

      setIsSubmitting(true);
      const result = await registerStudent(formData);
      setIsSubmitting(false);

      if (result.success) {
        setSuccess("Student account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      } else {
        setError(result.error || "Failed to create student account.");
      }
    } else {
      if (!adminData.username || !adminData.email || !adminData.password) {
        setError("Please fill out all required fields for Administrator creation.");
        return;
      }

      setIsSubmitting(true);
      const result = await registerAdmin(adminData);
      setIsSubmitting(false);

      if (result.success) {
        setSuccess("Administrator account created successfully! Redirecting to login...");
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      } else {
        setError(result.error || "Failed to create administrator account.");
      }
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 70%)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: 600,
        padding: '2.5rem 2rem'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            background: role === 'admin' 
              ? 'linear-gradient(135deg, #10b981, #059669)'
              : 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
            borderRadius: '12px',
            padding: '0.75rem',
            color: 'white',
            display: 'inline-flex',
            marginBottom: '1rem',
            transition: 'all 0.3s ease'
          }}>
            {role === 'admin' ? <ShieldCheck size={32} /> : <GraduationCap size={32} />}
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>
            {role === 'admin' ? 'Administrator Account Registration' : 'Student Self-Service Registration'}
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {role === 'admin' ? 'Create an admin account to manage registrations and student requests' : 'Create your student portal account to enroll for academic courses'}
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
          padding: 4,
          marginBottom: '1.75rem',
          border: '1px solid var(--border-light)'
        }}>
          <button
            type="button"
            onClick={() => { setRole('student'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.825rem',
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease',
              background: role === 'student' ? 'var(--brand-primary)' : 'transparent',
              color: role === 'student' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: role === 'student' ? '0 2px 8px rgba(99, 102, 241, 0.4)' : 'none'
            }}
          >
            Student Account
          </button>
          <button
            type="button"
            onClick={() => { setRole('admin'); setError(''); setSuccess(''); }}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.825rem',
              letterSpacing: '0.04em',
              transition: 'all 0.2s ease',
              background: role === 'admin' ? '#10b981' : 'transparent',
              color: role === 'admin' ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: role === 'admin' ? '0 2px 8px rgba(16, 185, 129, 0.4)' : 'none'
            }}
          >
            Administrator Account
          </button>
        </div>

        {/* Notices */}
        {error && (
          <div className="glass-panel" style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}
        {success && (
          <div className="glass-panel" style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--color-success-bg)',
            color: 'var(--color-success)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '0.85rem',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {role === 'admin' ? (
            /* Administrator Registration Fields */
            <>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Administrator Username *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><User size={16} /></span>
                  <input
                    name="username"
                    type="text"
                    className="form-input"
                    placeholder="e.g. admin_john"
                    value={adminData.username}
                    onChange={handleAdminChange}
                    style={{ paddingLeft: '2.25rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Official Email Address *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Mail size={16} /></span>
                  <input
                    name="email"
                    type="email"
                    className="form-input"
                    placeholder="admin@university.edu"
                    value={adminData.email}
                    onChange={handleAdminChange}
                    style={{ paddingLeft: '2.25rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Password *</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Lock size={16} /></span>
                  <input
                    name="password"
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={adminData.password}
                    onChange={handleAdminChange}
                    style={{ paddingLeft: '2.25rem' }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Admin Security Authorization Passcode</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><KeyRound size={16} /></span>
                  <input
                    name="admin_key"
                    type="text"
                    className="form-input"
                    placeholder="ADMIN2026"
                    value={adminData.admin_key}
                    onChange={handleAdminChange}
                    style={{ paddingLeft: '2.25rem' }}
                  />
                </div>
                <small style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '4px', display: 'block' }}>
                  Default passcode: <code>ADMIN2026</code>
                </small>
              </div>
            </>
          ) : (
            /* Student Registration Fields */
            <>
              {/* Group 1: Account Login Details */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
                  <label className="form-label">Username *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><User size={16} /></span>
                    <input
                      name="username"
                      type="text"
                      className="form-input"
                      placeholder="e.g. johndoe"
                      value={formData.username}
                      onChange={handleChange}
                      style={{ paddingLeft: '2.25rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
                  <label className="form-label">Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Mail size={16} /></span>
                    <input
                      name="email"
                      type="email"
                      className="form-input"
                      placeholder="johndoe@university.edu"
                      value={formData.email}
                      onChange={handleChange}
                      style={{ paddingLeft: '2.25rem' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
                  <label className="form-label">Password *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Lock size={16} /></span>
                    <input
                      name="password"
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      style={{ paddingLeft: '2.25rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
                  <label className="form-label">Registration No. *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Hash size={16} /></span>
                    <input
                      name="registration_no"
                      type="text"
                      className="form-input"
                      placeholder="REG/2026/0002"
                      value={formData.registration_no}
                      onChange={handleChange}
                      style={{ paddingLeft: '2.25rem' }}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Group 2: Personal Details */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <div className="form-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
                  <label className="form-label">First Name *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><UserCheck size={16} /></span>
                    <input
                      name="first_name"
                      type="text"
                      className="form-input"
                      placeholder="John"
                      value={formData.first_name}
                      onChange={handleChange}
                      style={{ paddingLeft: '2.25rem' }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: '1 1 250px', marginBottom: 0 }}>
                  <label className="form-label">Last Name *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><UserCheck size={16} /></span>
                    <input
                      name="last_name"
                      type="text"
                      className="form-input"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      style={{ paddingLeft: '2.25rem' }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
                  <label className="form-label">Gender</label>
                  <select
                    name="gender"
                    className="form-input"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
                  <label className="form-label">Date of Birth</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="date_of_birth"
                      type="date"
                      className="form-input"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ flex: '1 1 180px', marginBottom: 0 }}>
                  <label className="form-label">Telephone</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Phone size={16} /></span>
                    <input
                      name="phone"
                      type="tel"
                      className="form-input"
                      placeholder="global+1234567890"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{ paddingLeft: '2.25rem' }}
                    />
                  </div>
                </div>
              </div>

              {/* Group 3: Course Selection */}
              <div className="form-group" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
                <label className="form-label">Academic Program *</label>
                <select
                  name="program_id"
                  className="form-input"
                  value={formData.program_id}
                  onChange={handleChange}
                  required
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              marginTop: '0.5rem',
              background: role === 'admin' ? '#10b981' : undefined,
              borderColor: role === 'admin' ? '#059669' : undefined
            }}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? 'Creating Account...' 
              : role === 'admin' ? 'Create Administrator Account' : 'Create Student Account'
            }
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Already have an account? </span>
          <Link to="/login" style={{ color: role === 'admin' ? '#10b981' : 'var(--brand-primary)', textDecoration: 'none', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
