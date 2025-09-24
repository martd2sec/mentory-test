import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const GoogleCalendarCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Get parameters from URL
      const error = searchParams.get('error');

      if (error) {
        throw new Error(`Google OAuth error: ${error}`);
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      // With the new integration, tokens are automatically handled by Supabase Auth
      // So we just need to confirm the user is logged in and redirect
      setStatus('success');
      
      // Redirect to profile after a short delay
      setTimeout(() => {
        navigate('/profile');
      }, 2000);

    } catch (error) {
      console.error('OAuth callback error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setStatus('error');
      
      // Redirect to profile after error display
      setTimeout(() => {
        navigate('/profile');
      }, 5000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-12 w-12 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-12 w-12 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-12 w-12 text-red-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'loading':
        return {
          title: 'Setting up Google Calendar...',
          description: 'Please wait while we configure your calendar integration.',
        };
      case 'success':
        return {
          title: 'Google Calendar Ready!',
          description: 'Your mentorship sessions will now be automatically synced to your Google Calendar. You will be redirected shortly.',
        };
      case 'error':
        return {
          title: 'Setup Failed',
          description: error || 'There was an error setting up your Google Calendar. Please try again.',
        };
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center border border-gray-700"
      >
        <div className="mb-6 flex justify-center">
          {getStatusIcon()}
        </div>

        <h1 className="text-2xl font-bold text-white mb-4">
          {statusMessage.title}
        </h1>

        <p className="text-gray-300 mb-6">
          {statusMessage.description}
        </p>

        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="animate-pulse text-sm text-gray-400">
              Processing your request...
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-3">
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-3">
              <p className="text-green-400 text-sm">
                ✅ Calendar integration active
              </p>
            </div>
            <div className="text-sm text-gray-400">
              Redirecting you back to your profile...
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">
                ❌ Integration failed
              </p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Return to Profile
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default GoogleCalendarCallback; 