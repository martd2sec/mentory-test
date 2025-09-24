import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Calendar, CheckCircle, AlertCircle, Clock, Users } from 'lucide-react';
import { googleCalendarService } from '../lib/googleCalendar';
import { useAuth } from '../context/AuthContext';
import { useMentorContext } from '../context/MentorContext';

interface CalendarSyncManagerProps {
  onSyncComplete?: () => void;
}

const CalendarSyncManager: React.FC<CalendarSyncManagerProps> = ({ onSyncComplete }) => {
  const { user } = useAuth();
  const { refreshMentors } = useMentorContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState<string>('');
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  useEffect(() => {
    // Load last sync time from localStorage
    const lastSync = localStorage.getItem('lastCalendarSync');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }

    // Check if auto-sync is enabled
    const autoSync = localStorage.getItem('autoCalendarSync');
    setAutoSyncEnabled(autoSync === 'true');

    // Start auto-sync if enabled
    if (autoSync === 'true') {
      startAutoSync();
    }
  }, []);

  const startAutoSync = () => {
    // Sync every 5 minutes
    const interval = setInterval(async () => {
      if (user && !isSyncing) {
        await performSync(true);
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  };

  const performSync = async (isAutoSync: boolean = false) => {
    if (!user) return;

    setIsSyncing(true);
    setSyncStatus('syncing');
    setSyncMessage(isAutoSync ? 'Auto-syncing calendar...' : 'Syncing calendar...');

    try {
      console.log('🔄 Starting calendar sync...');
      
      // Perform full sync with Google Calendar
      await googleCalendarService.syncAllBookingsWithCalendar();
      
      // Update last sync time
      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem('lastCalendarSync', now.toISOString());
      
      // Refresh mentors data
      await refreshMentors();
      
      setSyncStatus('success');
      setSyncMessage('Calendar sync completed successfully!');
      
      // Auto-clear success message after 3 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 3000);
      
      onSyncComplete?.();
      
    } catch (error) {
      console.error('❌ Calendar sync failed:', error);
      setSyncStatus('error');
      setSyncMessage('Calendar sync failed. Please try again.');
      
      // Auto-clear error message after 5 seconds
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncMessage('');
      }, 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleManualSync = () => {
    performSync(false);
  };

  const toggleAutoSync = () => {
    const newAutoSync = !autoSyncEnabled;
    setAutoSyncEnabled(newAutoSync);
    localStorage.setItem('autoCalendarSync', newAutoSync.toString());
    
    if (newAutoSync) {
      startAutoSync();
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="h-5 w-5 text-blue-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />;
      default:
        return <Calendar className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'border-blue-500 bg-blue-500/20';
      case 'success':
        return 'border-green-500 bg-green-500/20';
      case 'error':
        return 'border-red-500 bg-red-500/20';
      default:
        return 'border-gray-700 bg-gray-800';
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minutes ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-lg p-4 border transition-all duration-300 ${getStatusColor()}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gray-700">
            {getStatusIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Calendar Sync</h3>
            <p className="text-sm text-gray-400">
              Last sync: {formatLastSync()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="mb-3 p-2 rounded-lg bg-gray-900 border border-gray-600">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm text-gray-300">{syncMessage}</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-300">Auto-sync every 5 minutes</span>
          </div>
          <button
            onClick={toggleAutoSync}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              autoSyncEnabled 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {autoSyncEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        <div className="text-sm text-gray-400">
          <div className="flex items-center gap-2 mb-1">
            <Users className="h-4 w-4" />
            <span>Bidirectional sync with Google Calendar</span>
          </div>
          <ul className="ml-6 space-y-1 text-xs">
            <li>• Detects cancelled or rescheduled events</li>
            <li>• Updates booking times automatically</li>
            <li>• Syncs with appointment schedule events</li>
            <li>• Maintains consistency across platforms</li>
          </ul>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <CheckCircle className="h-3 w-3" />
            <span>Automatic sync keeps your bookings up to date</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CalendarSyncManager; 