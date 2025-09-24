import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { DEV_CONFIG, isSupabaseAvailable } from '../lib/devConfig';

const ConnectionStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkConnection = async () => {
    setConnectionStatus('checking');
    setErrorMessage('');

    // Check if we're in offline/mock mode
    if (DEV_CONFIG.FORCE_OFFLINE_MODE || !(await isSupabaseAvailable())) {
      console.log('🔧 Offline mode detected - skipping connection check');
      setConnectionStatus('connected'); // Pretend we're connected in offline mode
      return;
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .select('count', { count: 'exact', head: true });

      if (error) {
        setConnectionStatus('error');
        setErrorMessage(error.message);
      } else {
        setConnectionStatus('connected');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown connection error');
    }
  };

  useEffect(() => {
    // Only check connection if not in force offline mode
    if (!DEV_CONFIG.FORCE_OFFLINE_MODE) {
      checkConnection();
    } else {
      console.log('🔧 Force offline mode - skipping initial connection check');
      setConnectionStatus('connected');
    }
  }, []);

  if (connectionStatus === 'connected') {
    return null; // Don't show anything when connected
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className={`p-4 rounded-lg border ${
        connectionStatus === 'error' 
          ? 'bg-red-900/40 border-red-700 text-red-200' 
          : 'bg-yellow-900/40 border-yellow-700 text-yellow-200'
      }`}>
        <div className="flex items-start gap-3">
          {connectionStatus === 'checking' ? (
            <RefreshCw size={20} className="animate-spin flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          )}
          
          <div className="flex-1">
            <h3 className="font-medium mb-1">
              {connectionStatus === 'checking' ? 'Checking Connection...' : 'Connection Error'}
            </h3>
            
            {connectionStatus === 'error' && (
              <>
                <p className="text-sm mb-3">{errorMessage}</p>
                
                <div className="space-y-2 text-xs">
                  <p className="font-medium">Possible solutions:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Check if your Supabase project is active</li>
                    <li>Verify your project URL in the Supabase dashboard</li>
                    <li>Ensure your project isn't paused</li>
                    <li>Check your internet connection</li>
                  </ul>
                </div>
                
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={checkConnection}
                    className="flex items-center gap-1 px-3 py-1 bg-red-700/60 hover:bg-red-700/80 rounded text-xs transition-colors"
                  >
                    <RefreshCw size={12} />
                    Retry
                  </button>
                  
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 bg-red-700/60 hover:bg-red-700/80 rounded text-xs transition-colors"
                  >
                    <ExternalLink size={12} />
                    Dashboard
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;