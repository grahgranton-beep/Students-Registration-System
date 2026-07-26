import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { Users, Check, X, Search, Plus, Edit2, Trash2, ShieldAlert } from 'lucide-react';
import { API_BASE } from '../../config';

const ManageStudents = () => {
  const { token } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [pendingRegs, setPendingRegs] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  
  // Form state
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
    program_id: '',
    status: 'active'
  });
  
  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch students
      const studentsRes = await fetch(`${API_BASE}/students`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const studentsData = await studentsRes.json();
      setStudents(studentsData);

      // Fetch pending registrations
      const regsRes = await fetch(`${API_BASE}/registrations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const regsData = await regsRes.json();
      setPendingRegs(regsData.filter(r => r.status === 'pending'));

      // Fetch programs list
      const programsRes = await fetch(`${API_BASE}/programs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const programsData = await programsRes.json();
      setPrograms(programsData);
      
    } catch (err) {
      console.error(err);
      setToastMessage("Error loading registrar data");
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

  // Approval queue actions
  const handleApprovalStatus = async (regId, status) => {
    try {
      const res = await fetch(`${API_BASE}/registrations/${regId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        showToast(`Registration request ${status.toUpperCase()}!`, "success");
        fetchData();
      } else {
        showToast("Failed to process approval status", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server connection error", "error");
    }
  };

  // Student CRUD actions
  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to permanently delete this student account? This cannot be undone.")) return;
    try {
      const res = await fetch(`${API_BASE}/students/${studentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Student profile deleted successfully", "success");
        fetchData();
      } else {
        showToast("Failed to delete student profile", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error deleting student", "error");
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      username: '',
      email: '',
      password: '',
      registration_no: '',
      first_name: '',
      last_name: '',
      gender: 'Male',
      date_of_birth: '',
      phone: '',
      program_id: programs.length > 0 ? programs[0].id.toString() : '',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditModal = (studentObj) => {
    setModalMode('edit');
    setSelectedStudentId(studentObj.id);
    setFormData({
      username: studentObj.username || '',
      email: studentObj.email || '',
      password: '', // blank by default unless changed
      registration_no: studentObj.registration_no || '',
      first_name: studentObj.first_name || '',
      last_name: studentObj.last_name || '',
      gender: studentObj.gender || 'Male',
      date_of_birth: studentObj.date_of_birth || '',
      phone: studentObj.phone || '',
      program_id: studentObj.program_id ? studentObj.program_id.toString() : '',
      status: studentObj.status || 'active'
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = modalMode === 'create' 
        ? `${API_BASE}/students`
        : `${API_BASE}/students/${selectedStudentId}`;
        
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const payload = { ...formData };
      if (modalMode === 'edit' && !payload.password) {
        delete payload.password; // Do not send blank password to edit
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        showToast(`Student profile ${modalMode === 'create' ? 'created' : 'updated'} successfully!`, "success");
        setShowModal(false);
        fetchData();
      } else {
        showToast(data.error || "Save operation failed.", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during save", "error");
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter(studentObj => {
    const query = searchQuery.toLowerCase();
    return (
      studentObj.first_name.toLowerCase().includes(query) ||
      studentObj.last_name.toLowerCase().includes(query) ||
      studentObj.registration_no.toLowerCase().includes(query) ||
      (studentObj.program_code && studentObj.program_code.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading Students Records...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* 1. REGISTRATION APPROVAL QUEUE */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldAlert size={18} style={{ color: 'var(--color-warning)' }} />
          Unit Enrollment Approval Queue ({pendingRegs.length} Requests)
        </h2>

        {pendingRegs.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No pending unit registrations requiring approval.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Student Name</th>
                  <th>Unit Code</th>
                  <th>Unit Title</th>
                  <th>Credits</th>
                  <th style={{ width: 140 }}>Review Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRegs.map(reg => (
                  <tr key={reg.id}>
                    <td style={{ fontWeight: 600, color: 'white' }}>{reg.student_reg_no}</td>
                    <td>{reg.student_name}</td>
                    <td style={{ fontWeight: 600, color: 'white' }}>{reg.unit_code}</td>
                    <td>{reg.unit_name}</td>
                    <td>{reg.unit_credits}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => handleApprovalStatus(reg.id, 'approved')}
                          className="btn"
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            color: 'var(--color-success)',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button 
                          onClick={() => handleApprovalStatus(reg.id, 'rejected')}
                          className="btn"
                          style={{
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)',
                            border: '1px solid var(--border)'
                          }}
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. STUDENT PORTAL USER CRUD */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} className="text-secondary" />
            Student Master Records
          </h2>
          
          <button onClick={openCreateModal} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add Student Account
          </button>
        </div>

        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-muted)' }}><Search size={16} /></span>
          <input
            type="text"
            className="form-input"
            placeholder="Search students by name, reg number, or program code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {filteredStudents.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '2rem' }}>No student records found.</p>
        ) : (
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Reg No</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th style={{ width: 120 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'white' }}>{s.registration_no}</td>
                    <td>{s.first_name} {s.last_name}</td>
                    <td>{s.email}</td>
                    <td>{s.phone || 'N/A'}</td>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: 'white' }}>{s.program_code}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{s.department_name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${s.status === 'active' ? 'approved' : 'rejected'}`}>
                        {s.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => openEditModal(s)}
                          style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', padding: 4 }}
                          title="Edit Student Profile"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteStudent(s.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', padding: 4 }}
                          title="Delete Student Profile"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CRUD MODAL CONTAINER */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1.5rem'
        }}>
          <form onSubmit={handleFormSubmit} className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: 550,
            padding: '2rem',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              {modalMode === 'create' ? 'Create Student Account' : 'Edit Student Profile'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Account Credentials */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <label className="form-label">Username *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                    disabled={modalMode === 'edit'}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <label className="form-label">{modalMode === 'create' ? 'Password *' : 'Password (leave blank to keep)'}</label>
                  <input
                    type="password"
                    className="form-input"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required={modalMode === 'create'}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <label className="form-label">Registration No. *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.registration_no}
                    onChange={(e) => setFormData({...formData, registration_no: e.target.value})}
                    required
                  />
                </div>
              </div>

              {/* Personal Details */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <label className="form-label">First Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 200px', marginBottom: 0 }}>
                  <label className="form-label">Last Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1 1 130px', marginBottom: 0 }}>
                  <label className="form-label">Gender</label>
                  <select
                    className="form-input"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 130px', marginBottom: 0 }}>
                  <label className="form-label">Date of Birth</label>
                  <input
                    type="date"
                    className="form-input"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: '1 1 130px', marginBottom: 0 }}>
                  <label className="form-label">Telephone</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              {/* Course Selection & Status */}
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '2 1 250px', marginBottom: 0 }}>
                  <label className="form-label">Degree Program *</label>
                  <select
                    className="form-input"
                    value={formData.program_id}
                    onChange={(e) => setFormData({...formData, program_id: e.target.value})}
                    required
                  >
                    {programs.map(p => (
                      <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 130px', marginBottom: 0 }}>
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save Account
              </button>
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

export default ManageStudents;
