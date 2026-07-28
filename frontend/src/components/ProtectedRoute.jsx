/**
 * src/components/ProtectedRoute.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * A React Router v6 layout-route wrapper that guards private routes.
 *
 * Behaviour matrix:
 *  ┌─────────────────┬──────────────────────────────────────────────────────┐
 *  │ loading = true  │ Show a centered full-screen spinner while AuthContext │
 *  │                 │ checks localStorage for a valid JWT on first load.   │
 *  ├─────────────────┼──────────────────────────────────────────────────────┤
 *  │ user exists     │ Render <Outlet /> — allow access to the nested route. │
 *  ├─────────────────┼──────────────────────────────────────────────────────┤
 *  │ no user         │ <Navigate to="/login" replace /> — hard redirect,     │
 *  │                 │ replacing history so Back doesn't return to the guard.│
 *  └─────────────────┴──────────────────────────────────────────────────────┘
 *
 * Usage in App.jsx (React Router v6 nested route pattern):
 *
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *     <Route path="/onboarding"      element={<OnboardingWizard />} />
 *   </Route>
 */

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Full-Screen Loading Spinner ───────────────────────────────────────────────
// Shown during the brief moment AuthContext is reading & validating the token.
// Uses the .spinner component class defined in index.css.
function LoadingScreen() {
  return (
    <div
      role="status"
      aria-label="Loading, please wait"
      className="min-h-screen bg-background flex flex-col items-center justify-center gap-4"
    >
      {/* Animated ring spinner */}
      <div className="spinner" />

      {/* Accessible label beneath the spinner */}
      <p className="text-sm font-medium text-primary-400 animate-pulse-soft tracking-wide">
        Verifying your session…
      </p>
    </div>
  );
}

// ── ProtectedRoute ────────────────────────────────────────────────────────────
export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  // 1. Auth check in progress — don't flash a redirect, show spinner
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. Authenticated — render whatever nested <Route> matched
  if (user) {
    return <Outlet />;
  }

  // 3. No valid session — redirect to login
  //    `replace` prevents the user from pressing Back to re-enter the guard
  return <Navigate to="/login" replace />;
}
