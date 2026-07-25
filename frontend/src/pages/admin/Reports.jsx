import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';
import { FileText, FileSpreadsheet, Download } from 'lucide-react';
import { API_BASE } from '../../config';

const Reports = () => {
  const { token } = useAuth();
  
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [loading, setLoading] = useState(true);

  // Toasts
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  useEffect(() => {
    if (!token) return;
    
    // Fetch units for selector
    fetch(`${API_BASE}/units`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setUnits(data);
        if (data.length > 0) {
          setSelectedUnitId(data[0].id.toString());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading units for reports selector", err);
        setToastMessage("Failed to load units selector.");
        setToastType("error");
        setLoading(false);
      });
  }, [token]);

  const handleDownload = (endpoint, defaultFilename) => {
    setToastMessage("Generating requested export report...");
    setToastType("info");

    fetch(`${API_BASE}/reports/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) throw new Error("Report generation failed");
        return response.blob();
      })
      .then(blob => {
        const fileURL = window.URL.createObjectURL(blob);
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;
        fileLink.setAttribute('download', defaultFilename);
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        setToastMessage("Report generated and downloaded!", "success");
        setToastType("success");
      })
      .catch(err => {
        console.error(err);
        setToastMessage("Error generating report. Check session validity.", "error");
        setToastType("error");
      });
  };

  if (loading) {
    return <div style={{ color: 'white', textAlign: 'center', marginTop: '4rem' }}>Loading Report Center...</div>;
  }

  const selectedUnitCode = units.find(u => u.id.toString() === selectedUnitId)?.code || 'Unit';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', marginBottom: '0.25rem' }}>Report Export Center</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Download academic student class listings and register dashboards as spreadsheet CSVs or PDF documents.</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Class register reports */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} className="text-secondary" />
            Class Registers List
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Select a syllabus unit code to pull all currently registered students in the active semester.
          </p>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Syllabus Academic Unit</label>
            <select
              className="form-input"
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
            >
              {units.map(u => (
                <option key={u.id} value={u.id}>{u.code} - {u.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
            <button 
              onClick={() => handleDownload(`class-list/${selectedUnitId}/pdf`, `ClassRegister_${selectedUnitCode}.pdf`)}
              className="btn btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              disabled={!selectedUnitId}
            >
              <Download size={14} /> PDF List
            </button>
            <button 
              onClick={() => handleDownload(`class-list/${selectedUnitId}/csv`, `ClassRegister_${selectedUnitCode}.csv`)}
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
              disabled={!selectedUnitId}
            >
              <FileSpreadsheet size={14} /> CSV List
            </button>
          </div>
        </div>

        {/* Global Summary reports */}
        <div className="glass-panel" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileSpreadsheet size={18} className="text-secondary" />
            General Registration Summary
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Export comprehensive student unit registration summaries across the whole university database for the active semester.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
            <button 
              onClick={() => handleDownload('summary/pdf', 'SystemRegistrationSummary.pdf')}
              className="btn btn-secondary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <Download size={14} /> PDF Summary
            </button>
            <button 
              onClick={() => handleDownload('summary/csv', 'SystemRegistrationSummary.csv')}
              className="btn btn-primary"
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
            >
              <FileSpreadsheet size={14} /> CSV Summary
            </button>
          </div>
        </div>
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

export default Reports;
