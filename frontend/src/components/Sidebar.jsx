import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  GraduationCap, 
  BookOpen, 
  Building2, 
  FileText, 
  UserCircle, 
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const adminLinks = [
    { to: "/admin/dashboard", label: "Stats Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/admin/students", label: "Manage Students", icon: <GraduationCap size={20} /> },
    { to: "/admin/courses", label: "Programs & Units", icon: <BookOpen size={20} /> },
    { to: "/admin/departments", label: "Depts & Semesters", icon: <Building2 size={20} /> },
    { to: "/admin/reports", label: "Report Center", icon: <FileText size={20} /> },
  ];

  const studentLinks = [
    { to: "/student/dashboard", label: "My Dashboard", icon: <LayoutDashboard size={20} /> },
    { to: "/student/register", label: "Unit Registration", icon: <BookOpen size={20} /> },
    { to: "/student/units", label: "Registered Units", icon: <GraduationCap size={20} /> },
    { to: "/student/profile", label: "My Profile", icon: <UserCircle size={20} /> },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <aside className={`glass-panel sidebar animate-fade-in ${isOpen ? 'open' : ''}`} style={{
      display: 'flex',
      flexDirection: 'column',
      padding: '1.5rem',
      justifyContent: 'space-between',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Brand Logo Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))',
            borderRadius: '8px',
            padding: '8px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' }}>ACADREG</h2>
            <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '0.1em' }}>Portal</span>
          </div>
        </div>

        {/* User Badge Info */}
        <div className="glass-panel" style={{
          padding: '0.875rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            backgroundColor: user.role === 'admin' ? 'var(--brand-accent)' : 'var(--brand-primary)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {user.username.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <p style={{ color: 'white', fontSize: '0.85rem', fontWeight: 600, margin: 0, textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.username}</p>
            <span style={{ 
              fontSize: '0.7rem', 
              color: user.role === 'admin' ? 'var(--brand-accent)' : 'var(--brand-primary)', 
              fontWeight: 700,
              textTransform: 'uppercase'
            }}>{user.role}</span>
          </div>
        </div>

        {/* Links Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.875rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--brand-primary)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px var(--brand-primary-glow)' : 'none',
                textDecoration: 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                transition: 'all var(--transition-fast)'
              })}
              className="nav-link-hover"
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Button */}
      <button 
        onClick={() => { logout(); onClose(); }}
        className="btn btn-secondary"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '0.75rem',
          border: '1px solid var(--border)',
          background: 'var(--bg-tertiary)',
          color: 'var(--text-secondary)'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = 'var(--border)';
          e.target.style.borderColor = 'var(--text-secondary)';
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'var(--bg-tertiary)';
          e.target.style.borderColor = 'var(--border)';
        }}
      >
        <LogOut size={18} />
        Log Out
      </button>
    </aside>
  );
};

export default Sidebar;
