/**
 * src/api/client.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Centralized Axios instance for all BizWiz API calls.
 *
 * Features:
 *  - Base URL points to the Express backend (http://localhost:5000/api)
 *  - Request interceptor: reads JWT from localStorage and attaches it as a
 *    Bearer token in the Authorization header automatically on every request
 *  - Response interceptor: if a 401 Unauthorized is received, it clears stale
 *    auth data from localStorage so the user is cleanly logged out
 */

import axios from 'axios';

// ── Instance ──────────────────────────────────────────────────────────────────
const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 s — avoids hanging requests
});

// ── Request Interceptor ───────────────────────────────────────────────────────
// Runs before every outgoing request. Retrieves the stored JWT and injects it.
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizwiz_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ──────────────────────────────────────────────────────
// Runs after every response. Handles global 401 Unauthorized errors by
// clearing stale credentials so AuthContext can react appropriately.
client.interceptors.response.use(
  (response) => response, // Pass through successful responses unchanged
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired — wipe stored credentials
      localStorage.removeItem('bizwiz_token');
      localStorage.removeItem('bizwiz_user');
    }
    // Always propagate the error so individual callers can handle it
    return Promise.reject(error);
  }
);

export default client;
