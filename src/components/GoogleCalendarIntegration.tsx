import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, AlertCircle, ExternalLink, RefreshCw, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { googleCalendarService } from '../lib/googleCalendar';

interface GoogleCalendarIntegrationProps {
  onConnectionChange?: (connected: boolean) => void;
}

const GoogleCalendarIntegration: React.FC<GoogleCalendarIntegrationProps> = ({ onConnectionChange }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnectionStatus();
  }, [user]);

  const checkConnectionStatus = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const connected = await googleCalendarService.isUserConnected();
      setIsConnected(connected);
      onConnectionChange?.(connected);
    } catch (error) {
      console.error('Error checking connection status:', error);
      setError('Error checking connection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) return;

    try {
      setIsConnecting(true);
      setError(null);
      
      // With the new integration, users are automatically connected when they log in
      // This button now just refreshes the connection status
      await checkConnectionStatus();
      setIsConnecting(false);
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setError('Error connecting to Google Calendar');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    const confirmed = window.confirm(
      'Are you sure you want to disconnect Google Calendar? This will stop syncing your mentorship sessions.'
    );

    if (!confirmed) return;

    try {
      setIsDisconnecting(true);
      setError(null);
      
      // With the new integration, users need to revoke access through Google Account settings
      alert('To disconnect Google Calendar, please revoke access in your Google Account settings:\n\n1. Go to myaccount.google.com\n2. Select "Security"\n3. Under "Third-party apps with account access", find and remove this app');
      
      setIsDisconnecting(false);
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Error disconnecting Google Calendar');
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleRefresh = async () => {
    await checkConnectionStatus();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isConnected ? 'bg-green-500/20' : 'bg-gray-700'}`}>
            <Calendar className={`h-6 w-6 ${isConnected ? 'text-green-400' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Google Calendar</h3>
            <p className="text-sm text-gray-400">
              {isConnected ? 'Connected and syncing' : 'Not connected'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isConnected && (
            <button
              onClick={handleRefresh}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              title="Refresh connection status"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="h-5 w-5 text-green-400" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-400" />
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg">
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="text-sm text-gray-300">
          {isConnected ? (
            <>
              <p className="mb-2">✅ Your mentorship sessions are automatically synced to Google Calendar</p>
              <p className="mb-2">✅ Changes in Google Calendar will be reflected in the platform</p>
              <p>✅ You'll receive calendar reminders for your sessions</p>
            </>
          ) : (
            <>
              <p className="mb-2">Google Calendar integration will provide:</p>
              <ul className="ml-4 space-y-1">
                <li>• Automatic session creation in your calendar</li>
                <li>• Sync between platform and Google Calendar</li>
                <li>• Calendar notifications and reminders</li>
                <li>• Detection of cancelled sessions</li>
              </ul>
              <div className="mt-3 p-2 bg-gray-900 rounded border border-gray-600">
                <p className="text-xs text-gray-400">
                  <strong>Status:</strong> Integration framework ready. Backend implementation required for production use.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex gap-3">
          {isConnected ? (
            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDisconnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <X className="h-4 w-4" />
              )}
              <span>{isDisconnecting ? 'Disconnecting...' : 'Disconnect'}</span>
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              <span>{isConnecting ? 'Connecting...' : 'Connect Google Calendar'}</span>
            </button>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-400">
              <p className="font-medium">Development Notice</p>
              <p>Google Calendar integration is configured but requires backend setup for secure token exchange. Check the documentation for full implementation.</p>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default GoogleCalendarIntegration; 