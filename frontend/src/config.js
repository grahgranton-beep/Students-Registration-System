/**
 * API Base URL Configuration
 *
 * In production (Vercel): set VITE_API_URL in Vercel Environment Variables
 *   e.g. VITE_API_URL=https://your-backend.onrender.com/api
 *
 * In local development: the Vite proxy handles /api → http://localhost:5000
 *   so API_BASE = '/api' works for both dev and production automatically.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
