import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { Calendar, FileText, Download, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { COURSE_MATERIALS } from '../../data/courseMaterials';
import { API_BASE } from '../../config';

const RegisteredUnits = () => {
  const { student, token } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Study View States
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const fetchData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      // Fetch session
      const sessionRes = await fetch(`${API_BASE}/sessions`);
      const sessionsData = await sessionRes.json();
      const active = sessionsData.find(s => s.is_active);
      setActiveSession(active);

      if (active) {
        // Fetch current session registrations
        const regsRes = await fetch(`${API_BASE}/registrations?session_id=${active.id}`, {
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
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDownloadSlip = () => {
    if (!student) return;
    
    // Download the PDF from the backend endpoint
    const url = `${API_BASE}/reports/registration-slip/${student.id}`;
    
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
      const res = await fetch(`${API_BASE}/registrations/${regId}`, {
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

  const renderMarkdown = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    let inList = false;
    let inCode = false;
    let codeLines = [];
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Code block check
      if (line.trim().startsWith('```')) {
        if (inCode) {
          // End of code block
          elements.push(
            <pre key={`code-${i}`} style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderLeft: '4px solid var(--brand-primary, #10b981)',
              padding: '1rem',
              borderRadius: 'var(--radius-sm)',
              overflowX: 'auto',
              fontFamily: 'Consolas, monospace',
              fontSize: '0.85rem',
              color: '#a7f3d0',
              lineHeight: 1.5,
              margin: '1rem 0'
            }}>
              <code>{codeLines.join('\n')}</code>
            </pre>
          );
          codeLines = [];
          inCode = false;
        } else {
          inCode = true;
        }
        continue;
      }

      if (inCode) {
        codeLines.push(line);
        continue;
      }

      // List rendering
      if (line.trim().startsWith('*') || line.trim().startsWith('-')) {
        if (!inList) {
          inList = true;
        }
        const cleanLine = line.trim().replace(/^[* -]\s+/, '');
        
        // Inline styling for bold in list items
        const parts = cleanLine.split('**');
        const renderedParts = parts.map((part, idx) => 
          idx % 2 === 1 ? <strong key={idx} style={{ color: 'white' }}>{part}</strong> : part
        );

        elements.push(
          <li key={i} style={{ marginLeft: '1.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            {renderedParts}
          </li>
        );
        continue;
      } else {
        if (inList) {
          inList = false;
        }
      }

      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} style={{ color: 'white', fontSize: '1.2rem', fontWeight: 700, marginTop: '1.5rem', marginBottom: '0.75rem' }}>
            {line.substring(4)}
          </h3>
        );
      } else if (line.startsWith('#### ')) {
        elements.push(
          <h4 key={i} style={{ color: 'white', fontSize: '1.05rem', fontWeight: 600, marginTop: '1.25rem', marginBottom: '0.5rem' }}>
            {line.substring(5)}
          </h4>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} style={{
            borderLeft: '4px solid var(--brand-secondary, #6366f1)',
            paddingLeft: '1rem',
            color: 'var(--text-muted, #9ca3af)',
            fontStyle: 'italic',
            margin: '1rem 0',
            backgroundColor: 'rgba(99, 102, 241, 0.05)',
            padding: '0.75rem 1rem',
            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0'
          }}>
            {line.substring(2)}
          </blockquote>
        );
      } else if (line.trim() === '') {
        continue;
      } else {
        // Normal paragraph with inline formatting
        const parts = line.split('**');
        const boldRendered = parts.map((part, idx) => {
          if (idx % 2 === 1) {
            return <strong key={`b-${idx}`} style={{ color: 'white' }}>{part}</strong>;
          }
          const codeParts = part.split('`');
          return codeParts.map((cPart, cIdx) => 
            cIdx % 2 === 1 
              ? <code key={`c-${cIdx}`} style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  padding: '0.1rem 0.3rem',
                  borderRadius: 4,
                  fontFamily: 'Consolas, monospace',
                  fontSize: '0.85rem',
                  color: 'var(--brand-primary, #10b981)'
                }}>{cPart}</code>
              : cPart
          );
        });

        elements.push(
          <p key={i} style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
            {boldRendered}
          </p>
        );
      }
    }

    return <div>{elements}</div>;
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading course card...</div>;
  }

  // Calculate course load
  const currentSemesterCredits = registrations
    .filter(r => r.status === 'approved' || r.status === 'pending')
    .reduce((sum, r) => sum + (r.unit_credits || 0), 0);

  // STUDY MODE
  if (selectedUnit) {
    const courseMaterial = COURSE_MATERIALS[selectedUnit] || {
      title: selectedUnit,
      chapters: [
        {
          id: "syllabus",
          title: "1. Course Syllabus & Outline",
          content: `### Welcome to ${selectedUnit}
This course material is currently being compiled by the department registrar. 

#### Course Objectives:
*   Understand core theoretical foundations of the subject.
*   Apply practical skills to coursework and projects.
*   Prepare for mid-term and final examinations.

Please check back soon for the full lecture slides and textbook materials!`
        }
      ]
    };

    const activeChapter = courseMaterial.chapters[activeChapterIndex] || courseMaterial.chapters[0];

    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Study Mode Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem' }}>
          <button 
            onClick={() => setSelectedUnit(null)} 
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
          >
            <ArrowLeft size={14} /> Back to List
          </button>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {selectedUnit} Study Portal
            </span>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0 }}>
              {courseMaterial.title}
            </h1>
          </div>
        </div>

        {/* Study Portal Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Left Chapter Nav Sidebar */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <h3 style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', paddingLeft: '0.5rem', marginBottom: '0.5rem' }}>
              Course Chapters
            </h3>
            {courseMaterial.chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setActiveChapterIndex(idx)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.625rem 0.85rem',
                  fontSize: '0.825rem',
                  fontWeight: activeChapterIndex === idx ? 600 : 500,
                  backgroundColor: activeChapterIndex === idx ? 'var(--brand-primary-glow)' : 'transparent',
                  color: activeChapterIndex === idx ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (activeChapterIndex !== idx) {
                    e.target.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    e.target.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeChapterIndex !== idx) {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {ch.title}
              </button>
            ))}
          </div>

          {/* Right Content Viewer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '2rem', minHeight: '400px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
                {activeChapter.title}
              </h2>
              <div className="course-text-content">
                {renderMarkdown(activeChapter.content)}
              </div>
            </div>

            {/* Previous / Next buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => setActiveChapterIndex(prev => Math.max(0, prev - 1))}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                disabled={activeChapterIndex === 0}
              >
                <ChevronLeft size={16} /> Previous
              </button>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Chapter {activeChapterIndex + 1} of {courseMaterial.chapters.length}
              </span>
              <button
                onClick={() => setActiveChapterIndex(prev => Math.min(courseMaterial.chapters.length - 1, prev + 1))}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                disabled={activeChapterIndex === courseMaterial.chapters.length - 1}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                        ) : reg.status === 'approved' ? (
                          <button 
                            onClick={() => {
                              setSelectedUnit(reg.unit_code);
                              setActiveChapterIndex(0);
                            }}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.25rem 0.625rem',
                              fontSize: '0.75rem',
                              backgroundColor: 'var(--brand-primary-glow)',
                              color: 'white',
                              border: '1px solid var(--brand-primary)'
                            }}
                          >
                            Study Course
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
