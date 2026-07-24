import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { Building2, Calendar, Plus, Edit2, Trash2, ShieldCheck } from 'lucide-react';

const ManageDepartments = () => {
  const { token } = useAuth();
  
  const [departments, setDepartments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptModalMode, setDeptModalMode] = useState('create');
  const [selectedDeptId, setSelectedDeptId] = useState(null);
  const [deptForm, setDeptForm] = useState({ code: '', name: '' });

  const [showSessModal, setShowSessModal] = useState(false);
  const [sessForm, setSessForm] = useState({ name: '', is_active: false });

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Depts
      const deptRes = await fetch('http://localhost:5000/api/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deptData = await deptRes.json();
      setDepartments(deptData);

      // Sessions
      const sessRes = await fetch('http://localhost:5000/api/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const sessData = await sessRes.json();
      setSessions(sessData);
    } catch (err) {
      console.error(err);
      setToastMessage("Error loading portal configurations");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const showToast = (msg, type = 'info') => {
    setToastMessage(msg);
    setToastType(type);
  };

  // ==========================================
  // DEPARTMENTS CRUD
  // ==========================================
  const openCreateDept = () => {
    setDeptModalMode('create');
    setDeptForm({ code: '', name: '' });
    setShowDeptModal(true);
  };

  const openEditDept = (dept) => {
    setDeptModalMode('edit');
    setSelectedDeptId(dept.id);
    setDeptForm({ code: dept.code, name: dept.name });
    setShowDeptModal(true);
  };

  const handleDeptSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = deptModalMode === 'create' 
        ? 'http://localhost:5000/api/departments'
        : `http://localhost:5000/api/departments/${selectedDeptId}`;
      const method = deptModalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(deptForm)
      });
      if (res.ok) {
        showToast("Department saved successfully!", "success");
        setShowDeptModal(false);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Save department failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during save", "error");
    }
  };

  const handleDeleteDept = async (deptId) => {
    if (!window.confirm("Delete this department? This will delete all linked programs and units!")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/departments/${deptId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Department deleted", "success");
        fetchData();
      } else {
        showToast("Deletion failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during delete", "error");
    }
  };

  // ==========================================
  // SEMESTERS / SESSIONS CRUD
  // ==========================================
  const handleSessSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sessForm)
      });
      if (res.ok) {
        showToast("Academic session created successfully!", "success");
        setShowSessModal(false);
        setSessForm({ name: '', is_active: false });
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to create session", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    }
  };

  const handleActivateSession = async (sessId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${sessId}/activate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        showToast("Academic session activated!", "success");
        fetchData();
      } else {
        showToast("Failed to activate session", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server connection error", "error");
    }
  };

  const handleDeleteSession = async (sessId) => {
    if (!window.confirm("Delete this academic semester?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sessions/${sessId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Academic session deleted", "success");
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Delete failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "error");
    }
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading departmental configurations...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* DEPARTMENTS CARD */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={18} className="text-secondary" />
            University Departments
          </h2>
          <button onClick={openCreateDept} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> Add Department
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Department Name</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 600, color: 'white' }}>{d.code}</td>
                  <td>{d.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditDept(d)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteDept(d.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACADEMIC SESSIONS CARD */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} className="text-secondary" />
            Academic Semesters / Sessions
          </h2>
          <button onClick={() => setShowSessModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> Add Semester
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Semester Name</th>
                <th>Status</th>
                <th style={{ width: 180 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600, color: 'white' }}>{s.name}</td>
                  <td>
                    <span className={`badge badge-${s.is_active ? 'approved' : 'pending'}`}>
                      {s.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {!s.is_active ? (
                        <>
                          <button 
                            onClick={() => handleActivateSession(s.id)} 
                            className="btn"
                            style={{
                              padding: '0.25rem 0.5rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'rgba(16, 185, 129, 0.1)',
                              color: 'var(--color-success)',
                              border: '1px solid rgba(16, 185, 129, 0.2)'
                            }}
                          >
                            Activate
                          </button>
                          <button onClick={() => handleDeleteSession(s.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 4 }}><Trash2 size={16} /></button>
                        </>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <ShieldCheck size={14} style={{ color: 'var(--color-success)' }} /> Active Registry
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEPARTMENT CRUD MODAL */}
      {showDeptModal && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1.5rem'
        }}>
          <form onSubmit={handleDeptSubmit} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 450, padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              {deptModalMode === 'create' ? 'Create New Department' : 'Edit Department Details'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department Code *</label>
                <input
                  type="text"
                  className="form-input"
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="e.g. CS"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Computer Science"
                  required
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowDeptModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Department</button>
            </div>
          </form>
        </div>
      )}

      {/* SESSION CREATION MODAL */}
      {showSessModal && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1.5rem'
        }}>
          <form onSubmit={handleSessSubmit} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 450, padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              Create New Semester Session
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Semester Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={sessForm.name}
                  onChange={(e) => setSessForm({ ...sessForm, name: e.target.value })}
                  placeholder="e.g. 2026/2027 Semester 1"
                  required
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                <input
                  type="checkbox"
                  checked={sessForm.is_active}
                  onChange={(e) => setSessForm({ ...sessForm, is_active: e.target.checked })}
                />
                <span>Set as current active academic session</span>
              </label>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowSessModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Create Semester</button>
            </div>
          </form>
        </div>
      )}

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

export default ManageDepartments;
