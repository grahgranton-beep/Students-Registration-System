import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';

// ── Inline Bar Chart ──────────────────────────────────────────────────────
const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: 80, marginTop: '0.5rem' }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <div style={{
            width: '100%', background: '#111827',
            borderRadius: '4px 4px 0 0',
            height: `${Math.max((d.value / max) * 72, 4)}px`,
            transition: 'height 0.6s ease',
          }} />
          <span style={{ fontSize: '0.6rem', color: '#9ca3af', fontWeight: 600 }}>{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    total_students: 0,
    pending_registrations: 0,
    total_programs: 0,
    total_departments: 0,
    total_units: 0,
  });
  const [logs, setLogs] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('monthly');
  const [searchId, setSearchId] = useState('');

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('http://localhost:5000/api/dashboard/stats', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch('http://localhost:5000/api/students', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([dashData, stuData]) => {
        if (dashData.stats) setStats(dashData.stats);
        if (dashData.recent_logs) setLogs(dashData.recent_logs);
        if (Array.isArray(stuData)) setStudents(stuData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const approvalRate = stats.total_students > 0
    ? Math.round(((stats.total_students - stats.pending_registrations) / stats.total_students) * 100)
    : 92;

  // Mock department chart data
  const deptChart = [
    { label: 'CS', value: 85 },
    { label: 'ENG', value: 62 },
    { label: 'BIOL', value: 40 },
    { label: 'MATH', value: 55 },
    { label: 'HIST', value: 28 },
    { label: 'ART', value: 18 },
  ];

  // Activity icon helper
  const logIcon = action => {
    if (!action) return <Mail size={15} color="#6b7280" />;
    const a = action.toLowerCase();
    if (a.includes('register') || a.includes('enrol')) return <CheckCircle2 size={15} color="#059669" />;
    if (a.includes('grade') || a.includes('approv')) return <ShieldCheck size={15} color="#2563eb" />;
    if (a.includes('conflict') || a.includes('flag') || a.includes('exceed')) return <AlertTriangle size={15} color="#d97706" />;
    if (a.includes('transcript') || a.includes('request')) return <Mail size={15} color="#6b7280" />;
    return <Clock size={15} color="#9ca3af" />;
  };

  const logBg = action => {
    if (!action) return '#f3f4f6';
    const a = action.toLowerCase();
    if (a.includes('register') || a.includes('enrol') || a.includes('approv')) return '#d1fae5';
    if (a.includes('grade')) return '#dbeafe';
    if (a.includes('conflict') || a.includes('flag') || a.includes('exceed')) return '#fef3c7';
    if (a.includes('transcript') || a.includes('request')) return '#f3f4f6';
    return '#f3f4f6';
  };

  const filteredStudents = students.filter(s => {
    if (!searchId) return true;
    const q = searchId.toLowerCase();
    return (
      s.student_id?.toLowerCase().includes(q) ||
      s.full_name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '1rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>
          Registrar Overview
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Institutional performance and real-time registration metrics.
        </p>
      </div>

      {/* ── Stat: Total Students ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
              Total Students
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1 }}>
              {stats.total_students.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.4rem', fontWeight: 500 }}>
              ↑ +4% from last term
            </div>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users size={20} color="#6b7280" />
          </div>
        </div>
      </div>

      {/* ── Stat: Pending Registrations ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
              Pending Registrations
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1 }}>
              {stats.pending_registrations}
            </div>
            <span style={{
              display: 'inline-block', marginTop: '0.4rem',
              background: '#fee2e2', color: '#dc2626',
              fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
              borderRadius: 999, letterSpacing: '0.04em',
            }}>
              Requires Action
            </span>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Clock size={20} color="#dc2626" />
          </div>
        </div>
      </div>

      {/* ── Stat: Approval Rate ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
              Approval Rate
            </div>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1 }}>
              {approvalRate}%
            </div>
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckCircle2 size={20} color="#2563eb" />
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 6, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 999,
            background: '#2563eb',
            width: `${approvalRate}%`,
            transition: 'width 0.8s ease',
          }} />
        </div>
      </div>

      {/* ── Bar Chart ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Registration Progress<br />by Department
          </h3>
          <div style={{
            display: 'flex', background: '#f3f4f6',
            borderRadius: 8, padding: 3,
          }}>
            {['weekly', 'monthly'].map(v => (
              <button
                key={v}
                onClick={() => setChartView(v)}
                style={{
                  padding: '0.25rem 0.6rem', borderRadius: 6, border: 'none',
                  cursor: 'pointer', fontFamily: 'var(--font-primary)',
                  fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize',
                  background: chartView === v ? '#111827' : 'transparent',
                  color: chartView === v ? '#ffffff' : '#6b7280',
                  transition: 'all 0.15s',
                }}
              >
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <BarChart data={deptChart} />
      </div>

      {/* ── Recent Activity ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Recent Activity</h3>
        {logs.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '0.75rem',
          }}>
            {[
              { action: 'register', text: 'New registration from Student ID 2024-001', time: '2 minutes ago' },
              { action: 'grade approv', text: 'Grade approved for Course CS-402', time: '5 minutes ago' },
              { action: 'conflict flag exceed', text: 'Flagged conflict: Enrolment limit exceeded', time: '1 hour ago' },
              { action: 'transcript request', text: 'Transcript request from Alumna J. Doe', time: '3 hours ago' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: logBg(item.action),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {logIcon(item.action)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>{item.text}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {logs.slice(0, 6).map((log, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: logBg(log.action),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {logIcon(log.action)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, margin: 0 }}>
                    {log.action} — {log.details || ''}
                  </p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.15rem 0 0' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#6366f1', fontSize: '0.8rem', fontWeight: 600,
          fontFamily: 'var(--font-primary)', marginTop: '1rem', padding: 0,
        }}>
          View All Activity
        </button>
      </div>

      {/* ── Pending Verifications ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.875rem' }}>Pending Verifications</h3>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '0.875rem' }}>
          <input
            className="form-input"
            placeholder="Search ID…"
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.875rem' }}
          />
        </div>
        {/* Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Student ID</th>
                <th>Major</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 5).map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{s.full_name || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.student_id || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.program_name || '—'}</td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    No results found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
