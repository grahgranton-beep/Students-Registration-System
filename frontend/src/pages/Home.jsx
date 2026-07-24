import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ArrowRight, ShieldCheck, Database, FileSpreadsheet } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '2rem',
      background: 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 70%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative floating blurred blobs */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '20%',
        width: 300,
        height: 300,
        backgroundColor: 'var(--brand-primary)',
        filter: 'blur(120px)',
        opacity: 0.15,
        borderRadius: '50%',
        zIndex: -1
      }} />
      <div style={{
        position: 'absolute',
        bottom: '15%',
        right: '20%',
        width: 300,
        height: 300,
        backgroundColor: 'var(--brand-accent)',
        filter: 'blur(120px)',
        opacity: 0.1,
        borderRadius: '50%',
        zIndex: -1
      }} />

      {/* Main hero panel */}
      <div className="glass-panel animate-fade-in" style={{
        maxWidth: 800,
        padding: '3.5rem 2.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2rem'
      }}>
        {/* Brand Emblem */}
        <div style={{
          background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
          borderRadius: '16px',
          padding: '1.25rem',
          color: 'white',
          display: 'inline-flex',
          boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
        }}>
          <GraduationCap size={48} />
        </div>

        <div>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'white', lineHeight: 1.1, marginBottom: '1rem' }}>
            Student <span style={{ background: 'linear-gradient(to right, #a855f7, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Registration</span> Portal
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: 600 }}>
            Welcome to the University's secure online registration platform. Manage your semester courses, check registration requirements, edit your student profile, and download slips.
          </p>
        </div>

        {/* Features Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          width: '100%',
          marginTop: '1rem',
          textAlign: 'left'
        }}>
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ color: 'var(--brand-primary)', marginBottom: '0.5rem' }}><ShieldCheck size={24} /></div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>Prerequisite Logic</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Automated checks prevent registering without completing prerequisites.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ color: 'var(--brand-accent)', marginBottom: '0.5rem' }}><Database size={24} /></div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>Load Balancing</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Enforces strict limits of up to 18 credits max per semester session.</p>
          </div>
          <div className="glass-panel" style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.01)' }}>
            <div style={{ color: 'var(--color-success)', marginBottom: '0.5rem' }}><FileSpreadsheet size={24} /></div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>Report Exports</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Instantly download PDF registration slips and admin CSV class lists.</p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
          {user ? (
            <Link to={user.role === 'admin' ? "/admin/dashboard" : "/student/dashboard"} className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
              Go to Dashboard <ArrowRight size={18} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="btn btn-primary" style={{ padding: '0.875rem 2rem' }}>
                Portal Sign In <ArrowRight size={18} />
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ padding: '0.875rem 2rem' }}>
                Self-Service Signup
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
