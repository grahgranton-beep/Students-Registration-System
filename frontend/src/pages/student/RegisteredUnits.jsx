import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { Printer, Calendar, FileText, Download } from 'lucide-react';

const RegisteredUnits = () => {
  const { student, token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const fetchData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch session
      const sessionRes = await fetch('http://localhost:5000/api/sessions');
      const sessionsData = await sessionRes.json();
      const active = sessionsData.find(s => s.is_active);
      setActiveSession(active);

      if (active) {
        // Fetch current session registrations
        const regsRes = await fetch(`http://localhost:5000/api/registrations?session_id=${active.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const regsData = await regsRes.json();
        setRegistrations(regsData);
      }
    } catch (err) {
      console.error("Error loading student registrations", err);
      setToastMessage("Failed to load registration details.");
      setToastType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleDownloadSlip = () => {
    if (!student) return;
    
    // Download the PDF from the backend endpoint
    const url = `http://localhost:5000/api/reports/registration-slip/${student.id}`;
    
    setToastMessage("Generating PDF Registration Slip...");
    setToastType("info");

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to generate PDF slip');
        }
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
        setToastMessage("PDF Slip downloaded successfully!", "success");
        setToastType("success");
      })
      .catch(error => {
        console.error(error);
        setToastMessage("Error generating slip. Contact support.", "error");
        setToastType("error");
      });
  };

  const handleDropUnit = async (regId) => {
    if (!window.confirm("Are you sure you want to drop this unit registration?")) return;
    
    try {
      const res = await fetch(`http://localhost:5000/api/registrations/${regId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setToastMessage("Unit dropped successfully", "success");
        setToastType("success");
        fetchData();
      } else {
        const data = await res.json();
        setToastMessage(data.error || "Failed to drop unit", "error");
        setToastType("error");
      }
    } catch (err) {
      console.error("Error dropping unit", err);
      setToastMessage("Server error dropping unit", "error");
      setToastType("error");
    }
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading course card...</div>;
  }

  // Calculate course load
  const currentSemesterCredits = registrations
    .filter(r => r.status === 'approved' || r.status === 'pending')
    .reduce((sum, r) => sum + (r.unit_credits || 0), 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Print action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>Registered Academic Units</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Review unit approval state and print your official registration slip.</p>
        </div>
        <button 
          onClick={handleDownloadSlip} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          disabled={registrations.length === 0}
        >
          <Download size={16} /> Download PDF Slip
        </button>
      </div>

      {/* Main List */}
      <div className="glass-panel" style={{ padding: '1.75rem', border: '1px solid var(--border-light)' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} className="text-secondary" />
          Unit List for {activeSession?.name}
        </h2>

        {registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <Calendar size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3 style={{ color: 'white', fontSize: '1rem', marginBottom: '0.5rem' }}>No Registered Units</h3>
            <p style={{ color: 'var(--text-secondary)' }}>You haven't registered any courses for the active session.</p>
          </div>
        ) : (
          <>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Unit Code</th>
                    <th>Unit Title</th>
                    <th>Credits</th>
                    <th>Date Registered</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map(reg => (
                    <tr key={reg.id}>
                      <td style={{ fontWeight: 600, color: 'white' }}>{reg.unit_code}</td>
                      <td>{reg.unit_name}</td>
                      <td style={{ fontWeight: 600 }}>{reg.unit_credits}</td>
                      <td>{new Date(reg.registered_at).toLocaleDateString()}</td>
                      <td>
                        <span className={`badge badge-${reg.status}`}>{reg.status}</span>
                      </td>
                      <td>
                        {reg.status === 'pending' ? (
                          <button 
                            onClick={() => handleDropUnit(reg.id)}
                            className="btn"
                            style={{
                              padding: '0.25rem 0.625rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              color: 'var(--color-error)',
                              border: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--color-error-bg)'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                          >
                            Drop
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Locked</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Slip Summary Info */}
            <div style={{
              marginTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Total Active Course Load:
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>
                {currentSemesterCredits} / 18 Credits
              </span>
            </div>
          </>
        )}
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

export default RegisteredUnits;
