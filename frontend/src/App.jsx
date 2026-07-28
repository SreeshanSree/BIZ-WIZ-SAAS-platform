/**
 * src/App.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Root routing configuration using React Router v6.
 *
 * Route structure:
 *
 *  Public routes (no auth required):
 *    /              → LandingPage
 *    /login         → LoginPage
 *
 *  Protected routes (wrapped by ProtectedRoute which uses <Outlet />):
 *    /onboarding        → OnboardingWizard
 *    /admin/dashboard   → AdminDashboard
 *
 *  Public dynamic route (always last to avoid matching other paths):
 *    /:businessSlug → SiteRenderer
 */

import { Routes, Route } from 'react-router-dom';

import ProtectedRoute     from './components/ProtectedRoute';
import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import OnboardingWizard   from './pages/OnboardingWizard';
import AdminDashboard     from './pages/AdminDashboard';
import SiteRenderer       from './pages/SiteRenderer';

export default function App() {
  return (
    <Routes>
      {/* ── Public Routes ─────────────────────────────────────────────────── */}
      <Route path="/"      element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ── Protected Routes (React Router v6 layout-route pattern) ────────
          ProtectedRoute renders <Outlet /> when authenticated, or redirects
          to /login. All nested routes automatically inherit this guard.     */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding"      element={<OnboardingWizard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Route>

      {/* ── Public Slug Route ──────────────────────────────────────────────
          Must be declared LAST so it doesn't shadow /login, /onboarding etc.
          Matches any /:businessSlug and renders the appropriate template.   */}
      <Route path="/:businessSlug" element={<SiteRenderer />} />
    </Routes>
  );
}
