import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { User, Mail, Phone, Lock, Save, Calendar } from 'lucide-react';

const Profile = () => {
  const { student, user, updateProfile } = useAuth();
  
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setToastMessage('');

    if (password && password !== confirmPassword) {
      setToastMessage("Passwords do not match");
      setToastType("error");
      return;
    }

    setIsSubmitting(true);
    const updateData = { email, phone };
    if (password) {
      updateData.password = password;
    }

    const result = await updateProfile(updateData);
    setIsSubmitting(false);

    if (result.success) {
      setToastMessage("Profile updated successfully!", "success");
      setToastType("success");
      setPassword('');
      setConfirmPassword('');
    } else {
      setToastMessage(result.error || "Update failed", "error");
      setToastType("error");
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>Student Profile Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your personal details, updates, and account credentials.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Info Card */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: '50%',
              backgroundColor: 'var(--brand-primary)',
              color: 'white',
              fontSize: '1.5rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {student?.first_name?.substring(0,1).toUpperCase()}{student?.last_name?.substring(0,1).toUpperCase()}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white' }}>{student?.first_name} {student?.last_name}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--brand-primary)', fontWeight: 600 }}>{student?.registration_no}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Program:</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{student?.program_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Department:</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{student?.department_name}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Gender:</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{student?.gender || 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Birth Date:</span>
              <span style={{ color: 'white', fontWeight: 600 }}>{student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Update Form */}
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
            Account Update
          </h2>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Mail size={16} /></span>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Phone Number</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Phone size={16} /></span>
              <input
                type="tel"
                className="form-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '2.25rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">New Password (optional)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Lock size={16} /></span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
              <label className="form-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Lock size={16} /></span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{ paddingLeft: '2.25rem' }}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            disabled={isSubmitting}
          >
            <Save size={16} /> {isSubmitting ? 'Saving changes...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {toastMessage && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setToastMessage('')} 
        />
      )}
    </div>
  );
};

export default Profile;
