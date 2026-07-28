/**
 * src/main.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Application entry point.
 *
 * Provider hierarchy (outermost → innermost):
 *
 *  GoogleOAuthProvider   — injects the Google OAuth script & client ID globally
 *    BrowserRouter       — enables React Router v6 client-side routing
 *      AuthProvider      — reads token from localStorage, manages user state
 *        App             — defines all <Route> declarations
 *
 * Note: AuthProvider MUST be inside BrowserRouter because it calls useNavigate()
 * internally for the logout redirect.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';

import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import './index.css';

// Google OAuth Client ID — set in frontend/.env as VITE_GOOGLE_CLIENT_ID
// Fallback string is intentionally descriptive so misconfiguration is obvious.
const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
     * GoogleOAuthProvider — must wrap the entire app so that the Google
     * Identity Services script is loaded once and available everywhere.
     */}
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      {/*
       * BrowserRouter — enables HTML5 history-based routing (no hash URLs).
       * Must wrap AuthProvider because AuthProvider uses useNavigate().
       */}
      <BrowserRouter>
        {/*
         * AuthProvider — maintains user/loading state and exposes
         * loginWithGoogle / logout via the useAuth() hook.
         */}
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
