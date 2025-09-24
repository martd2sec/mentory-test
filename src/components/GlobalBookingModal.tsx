import React, { useState, useEffect } from 'react';
import { useBookingModal } from '../context/BookingModalContext';
import { useMentorContext } from '../context/MentorContext';
import { googleCalendarService } from '../lib/googleCalendar';
import { useAuth } from '../context/AuthContext';

const GlobalBookingModal: React.FC = () => {
  const { isOpen, mentorId, mentorName, closeModal } = useBookingModal();
  const { bookMentor, mentors } = useMentorContext();
  const { user, userProfile } = useAuth();
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [syncMode, setSyncMode] = useState<'manual' | 'detect'>('manual');
  const [detectedEvents, setDetectedEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');

  // Get mentor data
  const currentMentor = mentors.find(m => m.id === mentorId);
  const mentorSkills = currentMentor?.strengths || [];

  React.useEffect(() => {
    console.log('🌍 GlobalBookingModal state changed - isOpen:', isOpen, 'mentorId:', mentorId);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Reset form when modal opens
      setSessionDate('');
      setSessionTime('');
      setSelectedSkills([]);
      setMessage('');
      setLoading(false);
      setLoadingMessage('');
      setSyncMode('manual');
      setDetectedEvents([]);
      setSelectedEventId('');
      
      // Check for recent events that might be from appointment schedule
      if (user && userProfile && currentMentor) {
        checkForRecentEvents();
      }
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, user, userProfile, currentMentor]);

  const checkForRecentEvents = async () => {
    try {
      console.log('🔍 Checking for recent appointment schedule events...');
      
      if (!user || !userProfile || !currentMentor) return;
      
      const mentorProfile = currentMentor.user_profiles;
      if (!mentorProfile) return;
      
      // Look for events created in the last 10 minutes
      const lastChecked = new Date();
      lastChecked.setMinutes(lastChecked.getMinutes() - 10);
      
      const recentEvents = await googleCalendarService.detectNewMentorshipEvents(
        mentorProfile.email,
        userProfile.email,
        lastChecked
      );
      
      if (recentEvents.length > 0) {
        console.log(`🔍 Found ${recentEvents.length} recent events`);
        setDetectedEvents(recentEvents);
        setSyncMode('detect');
      }
    } catch (error) {
      console.error('Error checking for recent events:', error);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => {
      if (prev.includes(skill)) {
        return prev.filter(s => s !== skill);
      } else {
        return [...prev, skill];
      }
    });
  };

  const handleConfirmManual = async () => {
    // Validate required fields
    if (!mentorId) {
      console.error('❌ No mentor ID provided');
      alert('Error: No mentor selected. Please try again.');
      return;
    }

    // Validate skills selection
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill you want to work on with this mentor.');
      return;
    }
    
    try {
      setLoading(true);
      setLoadingMessage('Coordinating with Google Calendar...');
      
      console.log('💾 Saving booking for mentor:', mentorId);
      console.log('🎯 Selected Skills:', selectedSkills);
      console.log('💬 Message:', message);
      
      // Create a default scheduled time for the next available slot
      const now = new Date();
      const scheduledDateTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow at same time
      scheduledDateTime.setMinutes(0, 0, 0); // Round to the nearest hour
      
      console.log('📆 Scheduled DateTime (auto-coordinated):', scheduledDateTime.toISOString());
      
      setLoadingMessage('Saving booking with selected skills...');
      
      // Mark mentor as booked with the auto-coordinated date, selected skills, and message
      await bookMentor(mentorId, scheduledDateTime.toISOString(), selectedSkills, message);
      
      setLoadingMessage('Adding to calendars...');
      
      // Small delay to simulate calendar integration
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setLoadingMessage('Booking completed successfully!');
      console.log('✅ Booking saved successfully with Google Calendar integration!');
      
      // Small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      closeModal();
      
      // Show enhanced success message
      const messageText = message ? `\n\nYour message: "${message}"` : '';
      const scheduledTimeText = scheduledDateTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
      
      alert(`🎉 Session scheduled successfully!\n\n📅 Coordinated time: ${scheduledTimeText}\n🎯 Selected skills: ${selectedSkills.join(', ')}${messageText}\n\n✅ Session added to both calendars\n📧 You'll receive calendar reminders\n📝 Your mentor can see your skills and message in advance\n\nCheck "My Booked Sessions" for details.`);
    } catch (error) {
      console.error('❌ Error confirming booking:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated')) {
          alert('Please sign in to book a session.');
        } else {
          alert(`Error saving booking: ${error.message}`);
        }
      } else {
        alert('Error saving booking. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleConfirmDetected = async () => {
    // Validate required fields
    if (!mentorId || !selectedEventId) {
      alert('Please select an event to sync.');
      return;
    }

    // Validate skills selection
    if (selectedSkills.length === 0) {
      alert('Please select at least one skill you want to work on with this mentor.');
      return;
    }
    
    try {
      setLoading(true);
      setLoadingMessage('Syncing with appointment schedule event...');
      
      console.log('🔄 Syncing appointment schedule event:', selectedEventId);
      console.log('🎯 Selected Skills:', selectedSkills);
      console.log('💬 Message:', message);
      
      if (!user || !userProfile) {
        throw new Error('User not authenticated');
      }
      
      // Sync the detected event with our database
      const bookingId = await googleCalendarService.syncAppointmentScheduleEvent(
        selectedEventId,
        mentorId,
        user.id,
        selectedSkills,
        message
      );
      
      if (!bookingId) {
        throw new Error('Failed to sync appointment schedule event');
      }
      
      setLoadingMessage('Booking synced successfully!');
      console.log('✅ Appointment schedule event synced successfully!');
      
      // Small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      closeModal();
      
      // Show enhanced success message
      const selectedEvent = detectedEvents.find(e => e.id === selectedEventId);
      const eventTime = selectedEvent ? new Date(selectedEvent.start.dateTime || selectedEvent.start.date) : null;
      const messageText = message ? `\n\nYour message: "${message}"` : '';
      const scheduledTimeText = eventTime ? eventTime.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }) : 'See calendar for details';
      
      alert(`🎉 Session synced successfully!\n\n📅 Scheduled time: ${scheduledTimeText}\n🎯 Selected skills: ${selectedSkills.join(', ')}${messageText}\n\n✅ Event updated in Google Calendar\n📧 You'll receive calendar reminders\n📝 Your mentor can see your skills and message\n\nCheck "My Booked Sessions" for details.`);
    } catch (error) {
      console.error('❌ Error syncing appointment schedule event:', error);
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('User not authenticated')) {
          alert('Please sign in to sync the event.');
        } else {
          alert(`Error syncing event: ${error.message}`);
        }
      } else {
        alert('Error syncing event. Please try again.');
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleConfirm = () => {
    if (syncMode === 'detect') {
      handleConfirmDetected();
    } else {
      handleConfirmManual();
    }
  };

  const handleCancel = () => {
    console.log('🚫 Modal cancelled by user');
    closeModal();
  };

  const formatEventTime = (event: any) => {
    const startTime = new Date(event.start.dateTime || event.start.date);
    return startTime.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-700">
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              Set Up Your Mentorship Session
            </h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
          </div>

          <div className="space-y-6">
            {/* Mentor Info */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <p className="text-gray-300">
                <span className="text-emerald-400 font-semibold">Mentor:</span> {mentorName}
              </p>
            </div>

            {/* Detected Events Section */}
            {detectedEvents.length > 0 && (
              <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📅</span>
                  <h3 className="text-lg font-semibold text-blue-300">
                    Recent Calendar Events Detected
                  </h3>
                </div>
                <p className="text-sm text-blue-200 mb-4">
                  We found recent events in your calendar that might be related to this mentorship session. 
                  Would you like to sync one of these events or create a new one?
                </p>
                
                {/* Mode Selection Buttons */}
                <div className="flex gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setSyncMode('detect')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      syncMode === 'detect' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Sync Existing Event
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyncMode('manual')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      syncMode === 'manual' 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Create New Session
                  </button>
                </div>

                {/* Event Selection */}
                {syncMode === 'detect' && (
                  <div className="space-y-3">
                    <p className="text-sm text-blue-200 font-medium">Select the event you want to sync:</p>
                    {detectedEvents.map((event) => (
                      <label key={event.id} className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="selectedEvent"
                          value={event.id}
                          checked={selectedEventId === event.id}
                          onChange={(e) => setSelectedEventId(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                        />
                        <div className="flex-1 bg-gray-700 hover:bg-gray-600 p-3 rounded-lg transition-colors">
                          <div className="text-white font-medium">{event.summary}</div>
                          <div className="text-sm text-gray-400">
                            {formatEventTime(event)}
                          </div>
                          {event.description && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              {event.description.substring(0, 100)}...
                            </div>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Skills Selection */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">🎯</span>
                <h3 className="text-lg font-semibold text-white">
                  What skills would you like to work on?
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {mentorSkills.map((skill) => (
                  <label key={skill} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedSkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      className="mr-3 w-4 h-4 text-emerald-600 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors">
                      {skill}
                    </span>
                  </label>
                ))}
              </div>
              {selectedSkills.length === 0 && (
                <p className="text-orange-400 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  Please select at least one skill to work on.
                </p>
              )}
            </div>

            {/* Message Section */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">💬</span>
                <h3 className="text-lg font-semibold text-white">
                  Additional Message <span className="text-red-400">*</span>
                </h3>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell your mentor about your specific goals, challenges, or anything else you'd like them to know... (Required)"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all"
                rows={4}
                maxLength={500}
                required
              />
              <div className="text-xs text-gray-500 mt-1 text-right">
                {message.length}/500 characters
              </div>
              {message.trim().length === 0 && (
                <p className="text-orange-400 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  Please provide a message for your mentor.
                </p>
              )}
            </div>

            {/* Information Panel */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">📋</span>
                <h3 className="text-lg font-semibold text-white">
                  Session Details
                </h3>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                {syncMode === 'detect' && selectedEventId ? (
                  <>
                    <p>✅ Using existing calendar event</p>
                    <p>📅 Time: As scheduled in your calendar</p>
                  </>
                ) : (
                  <>
                    <p>🤖 Smart scheduling will coordinate the best time</p>
                    <p>📅 Sessions are automatically added to both calendars</p>
                  </>
                )}
                <p>🎯 Selected skills: {selectedSkills.length > 0 ? selectedSkills.join(', ') : 'None selected'}</p>
                <p>📧 Both participants will receive calendar reminders</p>
                <p>📝 Your mentor will see your message and skill selection in advance</p>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-yellow-900/30 border border-yellow-500/50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-yellow-400 border-t-transparent"></div>
                  <span className="text-yellow-300 font-medium">{loadingMessage || 'Processing...'}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading || selectedSkills.length === 0 || message.trim().length === 0 || (syncMode === 'detect' && !selectedEventId)}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {loadingMessage || 'Processing...'}
                  </>
                ) : (
                  <>
                    {syncMode === 'detect' ? '🔄 Sync Session' : '📅 Schedule Session'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBookingModal; 