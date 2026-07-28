import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
  const { loginWithGoogle, loginTest } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setIsLoading(true);
    try {
      // 1. Send Google credential to backend, store JWT, update AuthContext
      await loginWithGoogle(credentialResponse.credential);

      // 2. Check if the user already has a tenant record
      try {
        await client.get('/tenant/my');
        // Tenant exists -> go to dashboard
        navigate('/admin/dashboard', { replace: true });
      } catch (err) {
        // 404 typically means no tenant -> go to onboarding
        if (err.response?.status === 404) {
          navigate('/onboarding', { replace: true });
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestLogin = async () => {
    setError('');
    setIsLoading(true);
    try {
      await loginTest();
      try {
        await client.get('/tenant/my');
        navigate('/admin/dashboard', { replace: true });
      } catch (err) {
        if (err.response?.status === 404) {
          navigate('/onboarding', { replace: true });
        } else {
          throw err;
        }
      }
    } catch (err) {
      console.error('Test Login error:', err);
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col items-center justify-center p-4 transition-colors relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary-900 dark:bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-900 dark:text-white">Welcome to BizWiz</h1>
          <p className="text-primary-500 dark:text-slate-400 mt-2">Sign in to build or manage your website</p>
        </div>

        {/* Login Card */}
        <div className="card p-8 bg-white dark:bg-slate-900 border border-primary-200 dark:border-slate-800 transition-colors">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="spinner mb-4" />
              <p className="text-sm font-medium text-primary-500">Signing you in...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google sign-in was cancelled or failed.')}
                theme="outline"
                size="large"
                width="100%"
                text="continue_with"
                shape="rectangular"
              />
              
              <div className="mt-6 w-full flex flex-col items-center border-t border-primary-100 dark:border-slate-800 pt-6">
                <p className="text-sm text-primary-500 dark:text-slate-400 mb-3">Or use development login</p>
                <button
                  onClick={handleTestLogin}
                  className="btn-secondary w-full justify-center dark:bg-slate-800 dark:border-slate-700 dark:text-white dark:hover:bg-slate-700"
                >
                  Test Login (Bypass Google)
                </button>
              </div>
            </div>
          )}

          <div className="mt-8 text-center border-t border-primary-100 dark:border-slate-800 pt-6">
            <p className="text-xs text-primary-400 dark:text-slate-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
