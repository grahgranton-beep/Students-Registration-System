import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

import { API_BASE } from '../config';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user details if token exists
  const fetchMe = async (currentToken) => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.student) {
          setStudent(data.student);
        } else {
          setStudent(null);
        }
      } else {
        // Token is invalid/expired
        logout();
      }
    } catch (err) {
      console.error("Error fetching user session", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      localStorage.setItem('token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      if (data.student) {
        setStudent(data.student);
      } else {
        setStudent(null);
      }
      return { success: true };
    } catch (err) {
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setStudent(null);
  };

  const registerStudent = async (studentData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const registerAdmin = async (adminData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register-admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Admin registration failed');
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (profileData) => {
    if (!token || !student) return { success: false, error: 'Not authenticated' };
    try {
      const res = await fetch(`${API_BASE}/students/${student.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Profile update failed');
      }
      // Re-fetch profile details
      await fetchMe(token);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    student,
    token,
    loading,
    login,
    logout,
    registerStudent,
    registerAdmin,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
