/**
 * src/context/AuthContext.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Global authentication state for BizWiz.
 *
 * Strategy:
 *  - On mount, reads any stored JWT from localStorage and uses jwt-decode to
 *    verify it has not expired before restoring the user session silently.
 *  - loginWithGoogle(credential): exchanges the raw Google credential (issued
 *    by @react-oauth/google) for a custom app JWT via the backend.
 *  - logout(): clears storage and resets state.
 *  - Exposes: { user, loading, loginWithGoogle, logout, isAuthenticated }
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import client from '../api/client';

// ── Context creation ──────────────────────────────────────────────────────────
const AuthContext = createContext(null);

// ── Helper: validate a stored JWT ────────────────────────────────────────────
/**
 * Decodes the token and checks the `exp` claim.
 * Returns the decoded payload if valid, or null if missing / expired.
 */
function getValidUser(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // `exp` is in seconds — compare against current time in seconds
    const isExpired = decoded.exp * 1000 < Date.now();
    if (isExpired) {
      console.warn('[AuthContext] Stored token has expired — logging out.');
      return null;
    }
    return decoded; // { id, name, email, picture, iat, exp }
  } catch (err) {
    console.error('[AuthContext] Failed to decode stored token:', err.message);
    return null;
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until session check is done

  const navigate = useNavigate();

  // ── Session Restoration (runs once on mount) ──────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('bizwiz_token');
    const validUser = getValidUser(token);

    if (validUser) {
      setUser(validUser);
    } else {
      // Token missing or expired — clean up stale storage
      localStorage.removeItem('bizwiz_token');
      localStorage.removeItem('bizwiz_user');
    }

    // Either way, auth check is done — stop blocking the UI
    setLoading(false);
  }, []);

  // ── loginWithGoogle ───────────────────────────────────────────────────────
  /**
   * Called by the LoginPage after Google issues a credential.
   * Sends the credential to the backend, receives a custom JWT, stores it,
   * decodes the payload, and updates user state.
   *
   * @param {string} credential — Raw Google OAuth ID token string
   * @returns {object} The decoded user payload
   */
  const loginWithGoogle = useCallback(async (credential) => {
    // POST credential → backend verifies with Google, returns app JWT
    const { data } = await client.post('/auth/google', { credential });

    // Persist the app JWT for future page loads / API calls
    localStorage.setItem('bizwiz_token', data.token);
    localStorage.setItem('bizwiz_user', JSON.stringify(data.user));

    // Decode the JWT to extract user info (id, name, email, picture)
    const decoded = jwtDecode(data.token);
    setUser(decoded);

    return decoded;
  }, []);

  // ── loginTest (Bypass Google) ───────────────────────────────────────────────
  const loginTest = useCallback(async () => {
    const { data } = await client.post('/auth/test');
    localStorage.setItem('bizwiz_token', data.token);
    localStorage.setItem('bizwiz_user', JSON.stringify(data.user));
    const decoded = jwtDecode(data.token);
    setUser(decoded);
    return decoded;
  }, []);

  // ── logout ────────────────────────────────────────────────────────────────
  /**
   * Clears all stored credentials and resets state.
   * Navigates back to /login so protected routes can't be accessed.
   */
  const logout = useCallback(() => {
    localStorage.removeItem('bizwiz_token');
    localStorage.removeItem('bizwiz_user');
    setUser(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  // ── Context Value ─────────────────────────────────────────────────────────
  const value = {
    user,            // Decoded JWT payload (or null)
    loading,         // True until the initial token check completes
    loginWithGoogle,
    loginTest,
    logout,
    isAuthenticated: !!user, // Convenience boolean
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Consumer hook ──────────────────────────────────────────────────────────────
/**
 * useAuth — must be used inside a component wrapped by <AuthProvider>.
 * Throws a descriptive error if called outside the provider tree.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error(
      '[BizWiz] useAuth() must be called inside an <AuthProvider>. ' +
      'Ensure your component tree includes <AuthProvider>.'
    );
  }
  return context;
}

export default AuthContext;
