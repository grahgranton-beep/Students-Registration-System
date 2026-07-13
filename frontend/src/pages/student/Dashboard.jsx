import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap, Calendar, Bell, AlertCircle, CheckCircle2,
  AlertTriangle, Plus, ChevronRight, Clock,
} from 'lucide-react';

const StudentDashboard = () => {
  const { student, token } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('http://localhost:5000/api/sessions', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('http://localhost:5000/api/registrations', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([sess, regs]) => {
        setSessions(Array.isArray(sess) ? sess : []);
        setRegistrations(Array.isArray(regs) ? regs : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const activeSession = sessions.find(s => s.is_active) || sessions[0];
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;
  const totalTarget = 6;

  const registrationStatus = pendingCount > 0 ? 'pending' : approvedCount > 0 ? 'active' : 'not-started';

  const deadlines = [
    { month: 'AUG', day: '15', title: 'Course Add/Drop Period Ends', desc: '11:59 PM Eastern Time', color: '#ef4444' },
    { month: 'SEP', day: '02', title: 'Tuition Payment Due', desc: 'Final Installment', color: '#f97316' },
    { month: 'OCT', day: '10', title: 'Mid-Term Exams Start', desc: 'Full Campus Schedule', color: '#6366f1' },
  ];

  const notifications = [
    {
      icon: <CheckCircle2 size={18} color="#059669" />,
      bg: '#d1fae5',
      title: 'Transcript Request Fulfilled',
      time: '2 hours ago',
      desc: 'Your request for the Official Digital Transcript (Order #TX-8821) has been processed and sent to the recipient.',
    },
    {
      icon: <CheckCircle2 size={18} color="#059669" />,
      bg: '#d1fae5',
      title: 'Housing Application Approved',
      time: 'Yesterday',
      desc: "Congratulations! Your application for Semester 2 on-campus housing has been approved for Building B, Room 412.",
    },
    {
      icon: <AlertTriangle size={18} color="#d97706" />,
      bg: '#fef3c7',
      title: 'Incomplete Profile Information',
      time: '3 days ago',
      desc: 'Please update your emergency contact details in the profile section to maintain eligibility for off-site academic trips.',
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
        <div style={{
          width: 28, height: 28, border: '3px solid var(--border)',
          borderTop: '3px solid var(--brand-primary)',
          borderRadius: '50%', animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1rem' }}>
      {/* Welcome */}
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Welcome back, {student?.full_name?.split(' ')[0] || 'Student'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Your current academic status and upcoming registration tasks.
        </p>
      </div>

      {/* Status badge */}
      <div>
        {registrationStatus === 'pending' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: '#fef3c7', color: '#92400e', borderRadius: 20,
            padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid #fde68a',
          }}>
            <Clock size={13} />
            Registration Status: Pending
          </span>
        )}
        {registrationStatus === 'active' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: '#d1fae5', color: '#065f46', borderRadius: 20,
            padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid #a7f3d0',
          }}>
            <CheckCircle2 size={13} />
            Registration Status: Active
          </span>
        )}
        {registrationStatus === 'not-started' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: '#f3f4f6', color: '#6b7280', borderRadius: 20,
            padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid #e5e7eb',
          }}>
            <AlertCircle size={13} />
            Registration Not Started
          </span>
        )}
      </div>

      {/* Hero Registration Card */}
      <div
        style={{
          background: '#111827',
          borderRadius: 16,
          padding: '1.5rem',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ghost icon background */}
        <div style={{
          position: 'absolute', right: -10, top: -10,
          opacity: 0.07, pointerEvents: 'none',
        }}>
          <GraduationCap size={120} color="white" />
        </div>

        <h2 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.5rem' }}>
          {activeSession ? `Start ${activeSession.name} Registration` : 'Final Semester Registration'}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.25rem', maxWidth: 260 }}>
          Finalize your curriculum and core units before the deadline to secure your graduation path.
        </p>
        <button
          onClick={() => navigate('/student/register')}
          style={{
            background: 'white', color: '#111827', border: 'none',
            borderRadius: 8, padding: '0.625rem 1.25rem',
            fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.06em',
            cursor: 'pointer', textTransform: 'uppercase', fontFamily: 'var(--font-primary)',
          }}
        >
          Begin Registration
        </button>

        {/* Progress */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginTop: '1.25rem', paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <GraduationCap size={18} color="#9ca3af" />
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Progress</span>
          <span style={{ color: 'white', fontWeight: 700, marginLeft: 'auto', fontSize: '0.95rem' }}>
            {approvedCount} / {totalTarget} Units
          </span>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Upcoming Deadlines</h3>
          <Calendar size={18} color="var(--text-secondary)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {deadlines.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                minWidth: 44, height: 48, borderRadius: 8,
                background: d.color, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                padding: '0.25rem',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase' }}>
                  {d.month}
                </span>
                <span style={{ color: 'white', fontSize: '1rem', fontWeight: 800, lineHeight: 1 }}>
                  {d.day}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {d.title}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>{d.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6366f1', fontSize: '0.82rem', fontWeight: 600,
            fontFamily: 'var(--font-primary)', display: 'flex', alignItems: 'center',
            gap: '0.25rem', marginTop: '1rem', padding: 0,
          }}
        >
          View Full Calendar <ChevronRight size={14} />
        </button>
      </div>

      {/* Recent Notifications */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Recent Notifications</h3>
          <span style={{
            background: '#111827', color: 'white', fontSize: '0.65rem',
            fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 999,
          }}>
            3 NEW
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.75rem' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: n.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {n.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {n.title}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                    {n.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>{n.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <button
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6366f1', fontSize: '0.82rem', fontWeight: 600,
            fontFamily: 'var(--font-primary)', marginTop: '1rem', padding: 0,
          }}
        >
          See all activity
        </button>
      </div>

      {/* FAB */}
      <button
        onClick={() => navigate('/student/register')}
        style={{
          position: 'fixed', bottom: 'calc(var(--bottom-nav-height) + 16px)', right: 20,
          width: 48, height: 48, borderRadius: '50%',
          background: '#111827', color: 'white', border: 'none',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          zIndex: 50,
        }}
      >
        <Plus size={22} />
      </button>
    </div>
  );
};

export default StudentDashboard;
