import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { API_BASE } from '../../config';
import {
  GraduationCap, Calendar, Bell, AlertCircle, CheckCircle2,
  AlertTriangle, Plus, ChevronRight, Clock, BookOpen, Download, User, X, FileText
} from 'lucide-react';

const StudentDashboard = () => {
  const { student, token } = useAuth();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch(`${API_BASE}/sessions`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(`${API_BASE}/registrations`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([sess, regs]) => {
        setSessions(Array.isArray(sess) ? sess : []);
        setRegistrations(Array.isArray(regs) ? regs : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleDownloadSlip = () => {
    if (!student) return;
    const url = `${API_BASE}/reports/registration-slip/${student.id}`;
    showToast("Generating PDF Registration Slip...", "info");

    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(response => {
        if (!response.ok) throw new Error('Failed to generate PDF slip');
        return response.blob();
      })
      .then(blob => {
        const fileURL = window.URL.createObjectURL(blob);
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', `Registration_Slip_${student.registration_no.replace('/', '_')}.pdf`);
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        showToast("PDF Slip downloaded successfully!", "success");
      })
      .catch(error => {
        console.error(error);
        showToast("Error generating slip. Contact support.", "error");
      });
  };

  const activeSession = sessions.find(s => s.is_active) || sessions[0];
  const approvedCount = registrations.filter(r => r.status === 'approved').length;
  const pendingCount = registrations.filter(r => r.status === 'pending').length;

  const registrationStatus = pendingCount > 0 ? 'pending' : approvedCount > 0 ? 'active' : 'not-started';

  const deadlines = [
    { month: 'AUG', day: '15', title: 'Course Add/Drop Period Ends', desc: '11:59 PM Eastern Time', color: '#ef4444' },
    { month: 'SEP', day: '02', title: 'Tuition Payment Due', desc: 'Final Installment', color: '#f97316' },
    { month: 'OCT', day: '10', title: 'Mid-Term Exams Start', desc: 'Full Campus Schedule', color: '#6366f1' },
    { month: 'NOV', day: '25', title: 'End of Semester Examinations', desc: 'Academic Main Hall', color: '#10b981' }
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
      icon: <AlertTriangle size={18} color="#94a3b8" />,
      bg: 'var(--bg-tertiary)',
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
          Welcome back, {student?.first_name || 'Student'}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Your current academic status and quick portal actions.
        </p>
      </div>

      {/* Status badge */}
      <div>
        {registrationStatus === 'pending' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
            background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', borderRadius: 20,
            padding: '0.3rem 0.75rem', fontSize: '0.8rem', fontWeight: 600,
            border: '1px solid #fde68a',
          }}>
            <Clock size={13} />
            Registration Status: Pending Approval
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
            Registration Status: Approved & Active
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
        <div style={{
          position: 'absolute', right: -10, top: -10,
          opacity: 0.07, pointerEvents: 'none',
        }}>
          <GraduationCap size={120} color="white" />
        </div>

        <h2 style={{ color: 'white', fontSize: '1.35rem', fontWeight: 800, lineHeight: 1.3, marginBottom: '0.5rem' }}>
          {activeSession ? `Start ${activeSession.name} Registration` : 'Academic Unit Registration'}
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '1.25rem', maxWidth: 280 }}>
          Finalize your curriculum and core units before the deadline to secure your graduation path.
        </p>
        
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => navigate('/student/register')}
            style={{
              background: 'white', color: '#111827', border: 'none',
              borderRadius: 8, padding: '0.625rem 1.25rem',
              fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
              cursor: 'pointer', textTransform: 'uppercase', fontFamily: 'var(--font-primary)',
            }}
          >
            Begin Registration
          </button>

          {registrations.length > 0 && (
            <button
              type="button"
              onClick={handleDownloadSlip}
              style={{
                background: 'rgba(255, 255, 255, 0.12)', color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: 8, padding: '0.625rem 1.25rem',
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontFamily: 'var(--font-primary)',
              }}
            >
              <Download size={15} /> PDF Slip
            </button>
          )}
        </div>

        {/* Progress */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginTop: '1.25rem', paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <GraduationCap size={18} color="#9ca3af" />
          <span style={{ color: '#9ca3af', fontSize: '0.8rem' }}>Unit Enrollment Progress</span>
          <span style={{ color: 'white', fontWeight: 700, marginLeft: 'auto', fontSize: '0.95rem' }}>
            {approvedCount} Approved / {registrations.length} Total
          </span>
        </div>
      </div>

      {/* ── QUICK ACTION HUB (ACTIVE BUTTONS) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
        <button
          type="button"
          onClick={() => navigate('/student/units')}
          className="card"
          style={{
            padding: '1.1rem', textAlign: 'left', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={18} color="#6366f1" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>My Units & Notes</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>View course study materials</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate('/student/profile')}
          className="card"
          style={{
            padding: '1.1rem', textAlign: 'left', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={18} color="#059669" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Student Profile</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>View & edit record details</div>
          </div>
        </button>

        <button
          type="button"
          onClick={handleDownloadSlip}
          className="card"
          style={{
            padding: '1.1rem', textAlign: 'left', border: '1px solid var(--border)',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '0.5rem',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} color="#94a3b8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Registration Slip</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Download official PDF document</div>
          </div>
        </button>
      </div>

      {/* Upcoming Deadlines */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Upcoming Deadlines</h3>
          <Calendar size={18} color="var(--text-secondary)" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {deadlines.slice(0, 3).map((d, i) => (
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
          type="button"
          onClick={() => setShowCalendarModal(true)}
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
          type="button"
          onClick={() => setShowNotificationsModal(true)}
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
        title="Register Units"
      >
        <Plus size={22} />
      </button>

      {/* ── ACADEMIC CALENDAR MODAL ── */}
      {showCalendarModal && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 520,
            padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={20} color="#111827" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#111827' }}>Official Academic Calendar</h2>
              </div>
              <button onClick={() => setShowCalendarModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {deadlines.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                  <div style={{
                    minWidth: 46, height: 48, borderRadius: 8,
                    background: d.color, display: 'flex',
                    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.62rem', fontWeight: 700 }}>{d.month}</span>
                    <span style={{ color: 'white', fontSize: '1.1rem', fontWeight: 800, lineHeight: 1 }}>{d.day}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{d.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280' }}>{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setShowCalendarModal(false)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: '0.85rem' }}>
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATIONS & ACTIVITY MODAL ── */}
      {showNotificationsModal && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(17, 24, 39, 0.75)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, padding: '1.5rem'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 520,
            padding: '1.75rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            maxHeight: '85vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bell size={20} color="#111827" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#111827' }}>Student Activity & Notifications</h2>
              </div>
              <button onClick={() => setShowNotificationsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={18} color="#6b7280" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notifications.map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: '0.85rem', padding: '0.875rem', background: '#f9fafb', borderRadius: 10, border: '1px solid #f3f4f6' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, background: n.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#111827' }}>{n.title}</span>
                      <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{n.time}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#4b5563', margin: 0, lineHeight: 1.5 }}>{n.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setShowNotificationsModal(false)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: '0.85rem' }}>
                Close Notifications
              </button>
            </div>
          </div>
        </div>
      )}

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default StudentDashboard;
