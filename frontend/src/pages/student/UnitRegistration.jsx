import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { Search, User, CreditCard, GraduationCap, ChevronRight } from 'lucide-react';

// ── Step indicator ──────────────────────────────────────────────────────
const Stepper = ({ step }) => {
  const steps = ['Unit Selection', 'Timetable', 'Review'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '1.5rem' }}>
      {steps.map((label, i) => (
        <React.Fragment key={i}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i === step ? '#111827' : i < step ? '#10b981' : '#e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 700,
              color: i <= step ? 'white' : '#9ca3af',
              transition: 'all 0.2s',
            }}>
              {i < step ? '✓' : i + 1}
            </div>
            <span style={{
              fontSize: '0.62rem', fontWeight: i === step ? 700 : 500,
              color: i === step ? '#111827' : '#9ca3af',
              whiteSpace: 'nowrap',
            }}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: 2, background: i < step ? '#10b981' : '#e5e7eb',
              margin: '0 6px', marginBottom: 18, transition: 'background 0.2s',
            }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// ── Tag chip ─────────────────────────────────────────────────────────────
const Tag = ({ label }) => {
  const colors = {
    Core: { bg: '#eff6ff', color: '#1d4ed8' },
    Elective: { bg: '#f0fdf4', color: '#166534' },
    General: { bg: '#f3f4f6', color: '#374151' },
  };
  const c = colors[label] || colors.General;
  return (
    <span style={{
      fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem',
      borderRadius: 999, background: c.bg, color: c.color,
      letterSpacing: '0.03em',
    }}>
      {label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────
const UnitRegistration = () => {
  const { student, token } = useAuth();

  const [step, setStep] = useState(0);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [registeredUnits, setRegisteredUnits] = useState([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const showToast = (msg, type = 'info') => { setToastMessage(msg); setToastType(type); };

  useEffect(() => {
    if (!token || !student) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/units?program_id=${student.program_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
      fetch(`${API_BASE}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.json()),
    ])
      .then(([units, regs]) => {
        setAvailableUnits(Array.isArray(units) ? units : []);
        setRegisteredUnits(Array.isArray(regs) ? regs : []);
      })
      .catch(() => showToast('Error loading units', 'error'))
      .finally(() => setLoading(false));
  }, [token, student]);

  const getRegistrationStatus = unitId => {
    const reg = registeredUnits.find(r => r.unit_id === unitId);
    return reg ? reg.status : null;
  };

  const isPrerequisiteMet = prereqId =>
    registeredUnits.some(r => r.unit_id === prereqId && r.status === 'approved');

  const currentSemesterCredits = registeredUnits
    .filter(r => r.status === 'approved' || r.status === 'pending')
    .reduce((sum, r) => sum + (r.unit_credits || 0), 0);

  const selectedCredits = availableUnits
    .filter(u => selectedUnitIds.includes(u.id))
    .reduce((sum, u) => sum + u.credits, 0);

  const projectedCredits = currentSemesterCredits + selectedCredits;
  const MAX_CREDITS = 18;

  const handleToggleSelect = unit => {
    const isSelected = selectedUnitIds.includes(unit.id);
    const status = getRegistrationStatus(unit.id);
    if (status === 'approved' || status === 'pending') {
      showToast(`Already ${status} for this unit`, 'warning');
      return;
    }
    // unit.prerequisites is an array of { id, code, name } objects from the API
    if (unit.prerequisites && unit.prerequisites.length > 0) {
      const unmetPrereq = unit.prerequisites.find(p => !isPrerequisiteMet(p.id));
      if (unmetPrereq) {
        showToast(`Prerequisite not met: "${unmetPrereq.code} - ${unmetPrereq.name}"`, 'warning');
        return;
      }
    }
    if (!isSelected && projectedCredits + unit.credits > MAX_CREDITS) {
      showToast(`Exceeds maximum credit load (${MAX_CREDITS} credits)`, 'warning');
      return;
    }
    setSelectedUnitIds(prev =>
      isSelected ? prev.filter(id => id !== unit.id) : [...prev, unit.id]
    );
  };

  const handleSubmit = async () => {
    if (selectedUnitIds.length === 0) {
      showToast('Select at least one unit', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      // Backend expects { unit_ids: [...] } as an array in a single POST
      const res = await fetch(`${API_BASE}/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ unit_ids: selectedUnitIds }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Show specific error from backend (prereq, credit limit, etc.)
        const details = data.details ? `\n• ${data.details.join('\n• ')}` : '';
        showToast((data.error || 'Registration failed') + details, 'error');
        return;
      }

      const count = Array.isArray(data) ? data.length : 1;
      showToast(`${count} unit(s) registered successfully! Awaiting approval.`, 'success');
      setSelectedUnitIds([]);
      setStep(0);

      // Refresh registered units list
      const regsRes = await fetch(`${API_BASE}/registrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRegisteredUnits(await regsRes.json());
    } catch {
      showToast('Registration failed. Check your connection and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = availableUnits.filter(u => {
    const q = search.toLowerCase();
    return u.name?.toLowerCase().includes(q) || u.code?.toLowerCase().includes(q);
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
    <div style={{ paddingBottom: '100px' }}>
      <Stepper step={step} />

      {/* Title */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.35rem' }}>
          Final Semester Registration
        </h1>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Select the units you wish to enrol in for the upcoming semester. Ensure your total
          credits fall within the recommended range (12–18 credits).
        </p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <Search size={16} style={{
          position: 'absolute', left: 12, top: '50%',
          transform: 'translateY(-50%)', color: '#9ca3af',
        }} />
        <input
          className="form-input"
          placeholder="Search units by name or code…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '2.25rem', borderRadius: 10 }}
        />
      </div>

      {/* Unit list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No units found.
          </div>
        )}
        {filtered.map(unit => {
          const status = getRegistrationStatus(unit.id);
          const isSelected = selectedUnitIds.includes(unit.id);
          const isDisabled = status === 'approved' || status === 'pending';
          const tag = unit.is_elective ? 'Elective' : unit.is_general ? 'General' : 'Core';

          return (
            <div
              key={unit.id}
              onClick={() => !isDisabled && handleToggleSelect(unit)}
              style={{
                background: isSelected ? 'rgba(99, 102, 241, 0.15)' : '#1e293b',
                border: `1.5px solid ${isSelected ? '#818cf8' : '#334155'}`,
                borderRadius: 12,
                padding: '1rem',
                cursor: isDisabled ? 'default' : 'pointer',
                transition: 'all 0.15s',
                opacity: isDisabled ? 0.65 : 1,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1 }}>
                  {/* Checkbox */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 2,
                    border: `2px solid ${isSelected ? '#111827' : '#d1d5db'}`,
                    background: isSelected ? '#111827' : '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}>
                    {isSelected && <span style={{ color: 'white', fontSize: '0.6rem', fontWeight: 900 }}>✓</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.35rem', lineHeight: 1.3 }}>
                      {unit.name}
                    </h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <GraduationCap size={12} /> {unit.code}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <CreditCard size={12} /> {unit.credits} Credit Hours
                      </span>
                    </div>
                    {unit.lecturer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        <User size={12} /> {unit.lecturer}
                      </div>
                    )}
                    {unit.prerequisites && unit.prerequisites.length > 0 && (
                      <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {unit.prerequisites.map(p => {
                          const pMet = isPrerequisiteMet(p.id);
                          return (
                            <span
                              key={p.id}
                              style={{
                                fontSize: '0.68rem', fontWeight: 600,
                                padding: '0.1rem 0.45rem', borderRadius: 6,
                                background: pMet ? '#d1fae5' : 'var(--bg-tertiary)',
                                color: pMet ? '#065f46' : 'var(--text-secondary)',
                                border: `1px solid ${pMet ? '#6ee7b7' : 'var(--border)'}`,
                                display: 'inline-flex', alignItems: 'center', gap: '0.2rem'
                              }}
                            >
                              {pMet ? '✓ Prereq:' : '🔒 Prereq:'} {p.code}
                            </span>
                          );
                        })}
                      </div>
                    )}
                    {status && (
                      <span className={`badge badge-${status}`} style={{ marginTop: '0.5rem', display: 'inline-flex' }}>
                        {status}
                      </span>
                    )}
                  </div>
                </div>
                <Tag label={tag} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom summary bar */}
      <div style={{
        position: 'fixed',
        bottom: 'var(--bottom-nav-height)',
        left: 0, right: 0,
        background: '#1e293b',
        borderTop: '1px solid #334155',
        padding: '0.875rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        zIndex: 50,
        maxWidth: 640,
        margin: '0 auto',
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Selected Units
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800 }}>
            {selectedUnitIds.length} of {filtered.length}
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Credits
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 800 }}>
            {selectedCredits.toFixed(1)}{' '}
            <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>/ {MAX_CREDITS}.0</span>
          </div>
        </div>
        <button
          onClick={step < 2 ? () => setStep(s => s + 1) : handleSubmit}
          disabled={submitting || selectedUnitIds.length === 0}
          style={{
            background: '#111827', color: 'white', border: 'none',
            borderRadius: 10, padding: '0.75rem 1.25rem',
            fontWeight: 700, fontSize: '0.875rem',
            fontFamily: 'var(--font-primary)', cursor: selectedUnitIds.length === 0 ? 'not-allowed' : 'pointer',
            opacity: submitting || selectedUnitIds.length === 0 ? 0.5 : 1,
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            whiteSpace: 'nowrap',
          }}
        >
          {step < 2 ? (
            <>Next Step <ChevronRight size={16} /></>
          ) : submitting ? (
            'Registering…'
          ) : (
            'Register'
          )}
        </button>
      </div>

      {toastMessage && (
        <Toast message={toastMessage} type={toastType} onClose={() => setToastMessage('')} />
      )}
    </div>
  );
};

export default UnitRegistration;
