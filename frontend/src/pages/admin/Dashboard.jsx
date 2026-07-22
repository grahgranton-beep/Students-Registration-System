import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { Users, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Mail, Check, X, ShieldAlert, RotateCcw, Filter } from 'lucide-react';

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
  const [allRegs, setAllRegs] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(true);
  const [chartView, setChartView] = useState('monthly');
  const [searchId, setSearchId] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [dashRes, stuRes, regsRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        fetch('http://localhost:5000/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
        fetch('http://localhost:5000/api/registrations', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => r.json()),
      ]);

      if (dashRes.stats) setStats(dashRes.stats);
      if (dashRes.recent_logs) setLogs(dashRes.recent_logs);
      if (Array.isArray(stuRes)) setStudents(stuRes);
      if (Array.isArray(regsRes)) {
        setAllRegs(regsRes);
      }
    } catch (err) {
      console.error(err);
      showToast('Error loading registrar data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const handleUpdateStatus = async (regId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/registrations/${regId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showToast(`Registration request updated to ${newStatus.toUpperCase()}!`, 'success');
        fetchDashboardData();
      } else {
        const errData = await res.json();
        showToast(errData.error || 'Failed to update registration status', 'error');
      }
    } catch {
      showToast('Connection error while updating status', 'error');
    }
  };

  const handleBulkApprove = async () => {
    const pendingList = allRegs.filter(r => r.status === 'pending');
    if (pendingList.length === 0) return;
    try {
      const ids = pendingList.map(r => r.id);
      const res = await fetch('http://localhost:5000/api/registrations/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids, status: 'approved' }),
      });
      if (res.ok) {
        showToast(`Approved all ${ids.length} pending registration(s)!`, 'success');
        fetchDashboardData();
      } else {
        showToast('Bulk approval failed', 'error');
      }
    } catch {
      showToast('Connection error during bulk approval', 'error');
    }
  };

  const handleResetToPending = async () => {
    if (allRegs.length === 0) return;
    try {
      const ids = allRegs.map(r => r.id);
      const res = await fetch('http://localhost:5000/api/registrations/bulk-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids, status: 'pending' }),
      });
      if (res.ok) {
        showToast(`Reset ${ids.length} registration(s) to PENDING for testing!`, 'info');
        fetchDashboardData();
      }
    } catch {
      showToast('Connection error during status reset', 'error');
    }
  };

  const pendingRegs = allRegs.filter(r => r.status === 'pending');
  const displayedRegs = filterStatus === 'all'
    ? allRegs
    : allRegs.filter(r => r.status === filterStatus);

  const approvalRate = stats.total_students > 0
    ? Math.round(((stats.total_students - pendingRegs.length) / stats.total_students) * 100)
    : 92;

  const deptChart = [
    { label: 'CS', value: 85 },
    { label: 'ENG', value: 62 },
    { label: 'BIOL', value: 40 },
    { label: 'MATH', value: 55 },
    { label: 'HIST', value: 28 },
    { label: 'ART', value: 18 },
  ];

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
      s.registration_no?.toLowerCase().includes(q) ||
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.2rem' }}>
          Registrar Overview
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Institutional performance and real-time unit registration approvals.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Students */}
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
                ↑ Active Enrolments
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

        {/* Pending Registrations */}
        <div className="card" style={{ padding: '1.25rem', border: pendingRegs.length > 0 ? '1.5px solid #fca5a5' : '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.5rem' }}>
                Pending Registrations
              </div>
              <div style={{ fontSize: '2.25rem', fontWeight: 800, lineHeight: 1, color: pendingRegs.length > 0 ? '#dc2626' : 'inherit' }}>
                {pendingRegs.length}
              </div>
              <span style={{
                display: 'inline-block', marginTop: '0.4rem',
                background: pendingRegs.length > 0 ? '#fee2e2' : '#f3f4f6',
                color: pendingRegs.length > 0 ? '#dc2626' : '#6b7280',
                fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem',
                borderRadius: 999, letterSpacing: '0.04em',
              }}>
                {pendingRegs.length > 0 ? 'Requires Action' : 'All Clear'}
              </span>
            </div>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: pendingRegs.length > 0 ? '#fee2e2' : '#f3f4f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={20} color={pendingRegs.length > 0 ? '#dc2626' : '#6b7280'} />
            </div>
          </div>
        </div>

        {/* Approval Rate */}
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
          <div style={{ height: 6, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 999,
              background: '#2563eb',
              width: `${approvalRate}%`,
              transition: 'width 0.8s ease',
            }} />
          </div>
        </div>
      </div>

      {/* ── 1. REGISTRATION APPROVAL CONTROL PANEL (ADMIN FUNCTIONALITY) ── */}
      <div className="card" style={{ padding: '1.25rem', border: '1.5px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontWeight: 800, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
              <ShieldAlert size={20} color="#d97706" />
              Student Unit Registrations Management ({allRegs.length})
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0' }}>
              Accept, reject, or modify status for any student unit registration request.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {pendingRegs.length > 0 && (
              <button
                type="button"
                onClick={handleBulkApprove}
                style={{
                  background: '#059669', color: 'white', border: 'none',
                  borderRadius: 8, padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
              >
                <Check size={15} /> Approve All Pending ({pendingRegs.length})
              </button>
            )}

            {allRegs.length > 0 && (
              <button
                type="button"
                onClick={handleResetToPending}
                style={{
                  background: '#f59e0b', color: 'white', border: 'none',
                  borderRadius: 8, padding: '0.45rem 0.85rem',
                  fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.35rem',
                }}
                title="Reset status of all registrations back to Pending"
              >
                <RotateCcw size={15} /> Reset All to Pending
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', background: '#f8fafc', padding: '0.5rem', borderRadius: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={14} /> Filter Status:
          </span>
          {['all', 'pending', 'approved', 'rejected'].map(st => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 6,
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                background: filterStatus === st ? '#111827' : '#ffffff',
                color: filterStatus === st ? '#ffffff' : '#6b7280',
                boxShadow: filterStatus === st ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                border: '1px solid #e5e7eb'
              }}
            >
              {st} ({st === 'all' ? allRegs.length : allRegs.filter(r => r.status === st).length})
            </button>
          ))}
        </div>

        {displayedRegs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#f9fafb', borderRadius: 8, border: '1px dashed #e5e7eb' }}>
            <CheckCircle2 size={32} color="#10b981" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>No unit registrations match status filter '{filterStatus}'.</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0' }}>When students register for units, their requests will appear here for your approval.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Reg No</th>
                  <th>Student Name</th>
                  <th>Unit Code</th>
                  <th>Unit Name</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center', width: 240 }}>Action Controls</th>
                </tr>
              </thead>
              <tbody>
                {displayedRegs.map(reg => (
                  <tr key={reg.id}>
                    <td style={{ fontWeight: 700 }}>{reg.student_reg_no || 'N/A'}</td>
                    <td style={{ fontWeight: 600 }}>{reg.student_name || 'Student'}</td>
                    <td>
                      <span style={{ fontWeight: 700, background: '#eff6ff', color: '#1d4ed8', padding: '0.15rem 0.45rem', borderRadius: 6, fontSize: '0.75rem' }}>
                        {reg.unit_code}
                      </span>
                    </td>
                    <td>{reg.unit_name}</td>
                    <td>
                      <span className={`badge badge-${reg.status === 'approved' ? 'approved' : reg.status === 'rejected' ? 'rejected' : 'pending'}`}>
                        {reg.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(reg.id, 'approved')}
                          style={{
                            background: reg.status === 'approved' ? '#059669' : '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            opacity: reg.status === 'approved' ? 0.7 : 1,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          title="Approve Unit Registration"
                        >
                          <Check size={14} /> Accept
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(reg.id, 'rejected')}
                          style={{
                            background: reg.status === 'rejected' ? '#dc2626' : '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: 6,
                            padding: '0.4rem 0.75rem',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            opacity: reg.status === 'rejected' ? 0.7 : 1,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                          title="Reject Unit Registration"
                        >
                          <X size={14} /> Reject
                        </button>

                        {reg.status !== 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(reg.id, 'pending')}
                            style={{
                              background: '#6b7280',
                              color: 'white',
                              border: 'none',
                              borderRadius: 6,
                              padding: '0.4rem 0.65rem',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                            title="Reset to Pending"
                          >
                            <RotateCcw size={14} /> Pending
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Bar Chart ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Registration Progress by Department
          </h3>
          <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: 8, padding: 3 }}>
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

      {/* ── Recent Activity Logs ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem' }}>Recent System Audit Activity</h3>
        {logs.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { action: 'register', text: 'New unit registration submitted by John Doe', time: 'Just now' },
              { action: 'approv', text: 'Registration approved for SE201', time: '10 minutes ago' },
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
      </div>

      {/* ── Student Master Records List ── */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.875rem' }}>Registered Students List</h3>
        <div style={{ position: 'relative', marginBottom: '0.875rem' }}>
          <input
            className="form-input"
            placeholder="Search student by name, reg number, or email..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            style={{ fontSize: '0.85rem', padding: '0.6rem 0.875rem' }}
          />
        </div>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Student Name</th>
                <th>Email</th>
                <th>Program</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 10).map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700 }}>{s.registration_no || '—'}</td>
                  <td style={{ fontWeight: 500 }}>{s.first_name} {s.last_name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.email || '—'}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{s.program_code || s.program_name || '—'}</td>
                  <td>
                    <span className={`badge badge-${s.status === 'active' ? 'approved' : 'rejected'}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                    No student records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default AdminDashboard;
