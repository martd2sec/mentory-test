import React from 'react';
import { motion } from 'framer-motion';
import { LogIn, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BitsoLogo from './BitsoLogo';

const LoginPage: React.FC = () => {
  const { signInWithDemo, loading, connectionError } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithDemo();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full mx-4"
      >
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <BitsoLogo size={80} className="text-emerald-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Growth at Bitso
            </h1>
            <p className="text-gray-300">
              Elevate 2.0: The New Mentorship Experience
            </p>
          </div>

          {connectionError && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                <div>
                  <p className="text-red-200 text-sm font-medium">Connection Error</p>
                  <p className="text-red-300 text-xs mt-1">{connectionError}</p>
                </div>
              </div>
              <button
                onClick={handleRetry}
                className="mt-3 flex items-center gap-2 text-red-200 hover:text-red-100 text-sm transition-colors"
              >
                <RefreshCw size={14} />
                <span>Retry Connection</span>
              </button>
            </div>
          )}

          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-300 text-sm mb-6">
                Sign in with your Bitso Google account to access the mentorship platform
              </p>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading || !!connectionError}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 font-medium py-3 px-4 rounded-lg transition duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>



            <div className="text-center">
              <p className="text-xs text-gray-400">
                Only @bitso.com email addresses are allowed
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm mb-4">
            Connect with expert mentors in tech and leadership
          </p>
          
          <div className="text-xs text-gray-500 bg-gray-800/50 rounded-lg p-3 border border-gray-700">
            <p className="mb-2"><strong>Access Requirements:</strong></p>
            <p className="mb-1">• <strong>Domain Restriction:</strong> Only @bitso.com email addresses</p>
            <p className="mb-1">• <strong>Authentication:</strong> Google OAuth required</p>
            <p>• <strong>Admin Access:</strong> maria.achaga@bitso.com has admin privileges</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;