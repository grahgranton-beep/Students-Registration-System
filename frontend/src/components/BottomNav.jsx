import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, BookOpen, FileText, User } from 'lucide-react';

const BottomNav = () => {
  const { user } = useAuth();
  if (!user) return null;

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Register', icon: BookOpen },
    { to: '/admin/reports', label: 'History', icon: FileText },
    { to: '/admin/departments', label: 'Account', icon: User },
  ];

  const studentLinks = [
    { to: '/student/dashboard', label: 'Home', icon: LayoutDashboard },
    { to: '/student/register', label: 'Register', icon: BookOpen },
    { to: '/student/units', label: 'History', icon: FileText },
    { to: '/student/profile', label: 'Account', icon: User },
  ];

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  return (
    <nav className="bottom-nav">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
        >
          <Icon size={22} strokeWidth={1.75} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
