import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { BookOpen, FolderOpen, Plus, Edit2, Trash2 } from 'lucide-react';

const ManageCourses = () => {
  const { token } = useAuth();
  
  const [programs, setPrograms] = useState([]);
  const [units, setUnits] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showProgModal, setShowProgModal] = useState(false);
  const [progModalMode, setProgModalMode] = useState('create');
  const [selectedProgId, setSelectedProgId] = useState(null);
  const [progForm, setProgForm] = useState({ code: '', name: '', department_id: '' });

  const [showUnitModal, setShowUnitModal] = useState(false);
  const [unitModalMode, setUnitModalMode] = useState('create');
  const [selectedUnitId, setSelectedUnitId] = useState(null);
  const [unitForm, setUnitForm] = useState({
    code: '', name: '', program_id: '', credits: 3, description: '', prerequisite_ids: []
  });

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Programs
      const progRes = await fetch('http://localhost:5000/api/programs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const progData = await progRes.json();
      setPrograms(progData);

      // Units
      const unitsRes = await fetch('http://localhost:5000/api/units', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const unitsData = await unitsRes.json();
      setUnits(unitsData);

      // Departments
      const deptRes = await fetch('http://localhost:5000/api/departments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const deptData = await deptRes.json();
      setDepartments(deptData);
    } catch (err) {
      console.error(err);
      setToastMessage("Error loading course schemas");
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
  // PROGRAM CRUD
  // ==========================================
  const openCreateProg = () => {
    setProgModalMode('create');
    setProgForm({ code: '', name: '', department_id: departments.length > 0 ? departments[0].id.toString() : '' });
    setShowProgModal(true);
  };

  const openEditProg = (prog) => {
    setProgModalMode('edit');
    setSelectedProgId(prog.id);
    setProgForm({ code: prog.code, name: prog.name, department_id: prog.department_id.toString() });
    setShowProgModal(true);
  };

  const handleProgSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = progModalMode === 'create' 
        ? 'http://localhost:5000/api/programs'
        : `http://localhost:5000/api/programs/${selectedProgId}`;
      const method = progModalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(progForm)
      });
      if (res.ok) {
        showToast(`Program ${progForm.code} saved successfully!`, "success");
        setShowProgModal(false);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Save program failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server connection error", "error");
    }
  };

  const handleDeleteProg = async (progId) => {
    if (!window.confirm("Delete this program? This will delete all associated student courses!")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/programs/${progId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Program deleted", "success");
        fetchData();
      } else {
        showToast("Deletion failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during program delete", "error");
    }
  };

  // ==========================================
  // UNIT CRUD
  // ==========================================
  const openCreateUnit = () => {
    setUnitModalMode('create');
    setUnitForm({
      code: '', name: '', program_id: programs.length > 0 ? programs[0].id.toString() : '',
      credits: 3, description: '', prerequisite_ids: []
    });
    setShowUnitModal(true);
  };

  const openEditUnit = (unit) => {
    setUnitModalMode('edit');
    setSelectedUnitId(unit.id);
    setUnitForm({
      code: unit.code,
      name: unit.name,
      program_id: unit.program_id.toString(),
      credits: unit.credits,
      description: unit.description || '',
      prerequisite_ids: unit.prerequisites ? unit.prerequisites.map(p => p.id) : []
    });
    setShowUnitModal(true);
  };

  const handlePrereqToggle = (unitId) => {
    const isSelected = unitForm.prerequisite_ids.includes(unitId);
    if (isSelected) {
      setUnitForm({
        ...unitForm,
        prerequisite_ids: unitForm.prerequisite_ids.filter(id => id !== unitId)
      });
    } else {
      setUnitForm({
        ...unitForm,
        prerequisite_ids: [...unitForm.prerequisite_ids, unitId]
      });
    }
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = unitModalMode === 'create' 
        ? 'http://localhost:5000/api/units'
        : `http://localhost:5000/api/units/${selectedUnitId}`;
      const method = unitModalMode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(unitForm)
      });
      if (res.ok) {
        showToast(`Unit ${unitForm.code} saved successfully!`, "success");
        setShowUnitModal(false);
        fetchData();
      } else {
        const data = await res.json();
        showToast(data.error || "Save unit failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server connection error", "error");
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm("Are you sure you want to delete this academic unit?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/units/${unitId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast("Unit deleted successfully", "success");
        fetchData();
      } else {
        showToast("Deletion failed", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error during unit delete", "error");
    }
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading course registers...</div>;
  }

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* SECTION 1: PROGRAMS */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FolderOpen size={18} className="text-secondary" />
            Degree Programs (Courses)
          </h2>
          <button onClick={openCreateProg} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> Add Program
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Program Name</th>
                <th>Department</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {programs.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600, color: 'white' }}>{p.code}</td>
                  <td>{p.name}</td>
                  <td>{p.department_name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditProg(p)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteProg(p.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: UNITS */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={18} className="text-secondary" />
            Academic Units (Subjects)
          </h2>
          <button onClick={openCreateUnit} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <Plus size={14} /> Add Unit
          </button>
        </div>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Unit Title</th>
                <th>Program</th>
                <th>Credits</th>
                <th>Prerequisites</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {units.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600, color: 'white' }}>{u.code}</td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 500, color: 'white' }}>{u.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{u.description}</span>
                    </div>
                  </td>
                  <td>{u.program_code}</td>
                  <td style={{ fontWeight: 600 }}>{u.credits} cr</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                      {u.prerequisites.length > 0 ? (
                        u.prerequisites.map(pr => (
                          <span key={pr.id} style={{ fontSize: '0.75rem', padding: '1px 5px', borderRadius: 4, backgroundColor: 'var(--brand-primary-glow)', color: 'white' }}>
                            {pr.code}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => openEditUnit(u)} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteUnit(u.id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROGRAM CRUD MODAL */}
      {showProgModal && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1.5rem'
        }}>
          <form onSubmit={handleProgSubmit} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 450, padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              {progModalMode === 'create' ? 'Create New Program' : 'Edit Program Details'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Program Code *</label>
                <input
                  type="text"
                  className="form-input"
                  value={progForm.code}
                  onChange={(e) => setProgForm({ ...progForm, code: e.target.value })}
                  placeholder="e.g. BSE"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Program Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={progForm.name}
                  onChange={(e) => setProgForm({ ...progForm, name: e.target.value })}
                  placeholder="e.g. B.Sc. Software Engineering"
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Department *</label>
                <select
                  className="form-input"
                  value={progForm.department_id}
                  onChange={(e) => setProgForm({ ...progForm, department_id: e.target.value })}
                  required
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowProgModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Program</button>
            </div>
          </form>
        </div>
      )}

      {/* UNIT CRUD MODAL */}
      {showUnitModal && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
          backgroundColor: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1.5rem'
        }}>
          <form onSubmit={handleUnitSubmit} className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: 500, padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.5rem', marginBottom: '1.25rem' }}>
              {unitModalMode === 'create' ? 'Create New Academic Unit' : 'Edit Unit Details'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label">Unit Code *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={unitForm.code}
                    onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })}
                    placeholder="e.g. SE311"
                    required
                  />
                </div>
                <div className="form-group" style={{ width: 100, marginBottom: 0 }}>
                  <label className="form-label">Credits *</label>
                  <input
                    type="number"
                    min="1" max="10"
                    className="form-input"
                    value={unitForm.credits}
                    onChange={(e) => setUnitForm({ ...unitForm, credits: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Unit Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={unitForm.name}
                  onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })}
                  placeholder="e.g. Web Development"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Program *</label>
                <select
                  className="form-input"
                  value={unitForm.program_id}
                  onChange={(e) => setUnitForm({ ...unitForm, program_id: e.target.value })}
                  required
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: 60, resize: 'vertical' }}
                  value={unitForm.description}
                  onChange={(e) => setUnitForm({ ...unitForm, description: e.target.value })}
                />
              </div>

              {/* Prerequisites check list */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Set Prerequisites (Check all that apply)</label>
                <div style={{
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-light)',
                  padding: '0.75rem',
                  maxHeight: 120,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  {units
                    .filter(u => u.id !== selectedUnitId) // Cannot set self as prerequisite
                    .map(u => (
                      <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={unitForm.prerequisite_ids.includes(u.id)}
                          onChange={() => handlePrereqToggle(u.id)}
                        />
                        <span>{u.code} - {u.name}</span>
                      </label>
                    ))}
                  {units.filter(u => u.id !== selectedUnitId).length === 0 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No other units available</span>
                  )}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
              <button type="button" onClick={() => setShowUnitModal(false)} className="btn btn-secondary">Cancel</button>
              <button type="submit" className="btn btn-primary">Save Unit</button>
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

export default ManageCourses;
