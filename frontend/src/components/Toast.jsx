import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const config = {
    success: { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', icon: <CheckCircle2 size={17} /> },
    warning: { color: '#d97706', bg: '#fffbeb', border: '#fde68a', icon: <AlertTriangle size={17} /> },
    error:   { color: '#dc2626', bg: '#fef2f2', border: '#fca5a5', icon: <XCircle size={17} /> },
    info:    { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', icon: <Info size={17} /> },
  };
  const { color, bg, border, icon } = config[type] || config.info;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-height) + 16px)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem',
        padding: '0.75rem 1rem',
        borderRadius: 10,
        background: bg,
        border: `1px solid ${border}`,
        color: color,
        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        zIndex: 9999,
        minWidth: 260,
        maxWidth: 360,
        fontSize: '0.85rem',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      <span style={{ flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color, padding: 2, display: 'flex', flexShrink: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
};

export default Toast;
