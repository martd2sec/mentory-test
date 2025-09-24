import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User, MessageSquare, CheckCircle, XCircle, Edit2, Save, X, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMentorContext } from '../context/MentorContext';
import { supabase } from '../lib/supabase';
import { Booking, MentorProfile, UserProfile } from '../lib/supabase';
import CalendarSyncManager from './CalendarSyncManager';
import { googleCalendarService } from '../lib/googleCalendar';
import { DEV_CONFIG, isSupabaseAvailable } from '../lib/devConfig';

interface UserBookingsProps {
  onNavigateHome: () => void;
}

interface BookingWithDetails extends Booking {
  mentors: MentorProfile & {
    user_profiles: UserProfile;
  };
}

const UserBookings: React.FC<UserBookingsProps> = ({ onNavigateHome }) => {
  const { user } = useAuth();
  const { refreshMentors } = useMentorContext();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching bookings for user:', user?.id);
      
      // Check if we should use offline mode
      if (DEV_CONFIG.FORCE_OFFLINE_MODE || !(await isSupabaseAvailable())) {
        console.log('🔧 Using offline mode - loading mock bookings');
        // Filter mock bookings for current user
        const userBookings = DEV_CONFIG.MOCK_SELECTIONS.filter(selection => 
          selection.selected_by === user?.id
        );
        setBookings(userBookings as BookingWithDetails[]);
        console.log('📋 Loaded mock bookings:', userBookings);
        console.log('📊 Number of bookings found:', userBookings.length);
        return;
      }
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          mentors (
            *,
            user_profiles (*)
          )
        `)
        .eq('booked_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching bookings:', error);
        // Fallback to mock data on error
        if (DEV_CONFIG.ENABLE_MOCK_MODE) {
          console.log('📋 Database failed, using mock bookings');
          const userBookings = DEV_CONFIG.MOCK_BOOKINGS.filter(booking => 
            booking.booked_by === user?.id
          );
          setBookings(userBookings as BookingWithDetails[]);
          return;
        }
        throw error;
      }

      console.log('📋 Fetched bookings:', data);
      console.log('📊 Number of bookings found:', data?.length || 0);
      
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      // Final fallback to mock data
      if (DEV_CONFIG.ENABLE_MOCK_MODE) {
        console.log('📋 All methods failed, using mock bookings');
        const userBookings = DEV_CONFIG.MOCK_BOOKINGS.filter(booking => 
          booking.booked_by === user?.id
        );
        setBookings(userBookings as BookingWithDetails[]);
      }
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string, mentorId: string) => {
    try {
      setCancellingId(bookingId);

      // Get the booking details to get the Google Calendar event IDs
      const booking = bookings.find(b => b.id === bookingId);
      
      console.log('🔄 Cancelling booking:', bookingId);
      console.log('📅 Booking details:', booking);

      // Update booking status to 'cancelled'
      const { error: bookingError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId);

      if (bookingError) throw bookingError;

      // Cancel/delete the Google Calendar event if it exists
      if (booking?.google_calendar_mentor_event_id) {
        try {
          console.log('🗑️ Deleting Google Calendar event:', booking.google_calendar_mentor_event_id);
          await googleCalendarService.deleteEvent(booking.google_calendar_mentor_event_id);
          console.log('✅ Google Calendar event deleted successfully');
        } catch (calendarError) {
          console.warn('⚠️ Failed to delete Google Calendar event (booking still cancelled):', calendarError);
          // Don't throw error - booking cancellation should succeed even if calendar deletion fails
        }
      } else {
        console.log('📅 No Google Calendar event ID found, skipping calendar deletion');
      }

      // Note: We no longer automatically make mentor available when booking is cancelled
      // Mentors control their availability manually

      // Refresh bookings and mentor list
      await fetchUserBookings();
      await refreshMentors();
      
      console.log('✅ Booking cancelled successfully');
    } catch (error) {
      console.error('❌ Error cancelling booking:', error);
      alert('Error cancelling booking. Please try again.');
    } finally {
      setCancellingId(null);
    }
  };

  const startEditingDate = (bookingId: string, currentScheduledAt?: string) => {
    setEditingId(bookingId);
    if (currentScheduledAt) {
      const date = new Date(currentScheduledAt);
      setSessionDate(date.toISOString().split('T')[0]);
      setSessionTime(date.toTimeString().slice(0, 5));
    } else {
      setSessionDate('');
      setSessionTime('');
    }
  };

  const cancelEditingDate = () => {
    setEditingId(null);
    setSessionDate('');
    setSessionTime('');
  };

  const updateSessionDate = async (bookingId: string) => {
    if (!sessionDate || !sessionTime) return;

    try {
      setUpdatingId(bookingId);

      // Get the booking details to get the Google Calendar event ID
      const booking = bookings.find(b => b.id === bookingId);
      
      // Create the scheduled datetime
      const scheduledDateTime = new Date(`${sessionDate}T${sessionTime}`);
      
      console.log('🔄 Updating session date for booking:', bookingId);
      console.log('📅 New scheduled time:', scheduledDateTime.toISOString());
      console.log('📅 Booking details:', booking);

      // Update booking with confirmed date
      const { error } = await supabase
        .from('bookings')
        .update({ scheduled_at: scheduledDateTime.toISOString() })
        .eq('id', bookingId);

      if (error) throw error;

      // Update the Google Calendar event if it exists
      if (booking?.google_calendar_mentor_event_id) {
        try {
          console.log('📅 Updating Google Calendar event:', booking.google_calendar_mentor_event_id);
          
          // Calculate end time (1 hour after start time)
          const endDateTime = new Date(scheduledDateTime.getTime() + 60 * 60 * 1000);
          
          await googleCalendarService.updateEvent(booking.google_calendar_mentor_event_id, {
            start: {
              dateTime: scheduledDateTime.toISOString(),
              timeZone: 'America/Mexico_City',
            },
            end: {
              dateTime: endDateTime.toISOString(),
              timeZone: 'America/Mexico_City',
            },
          });
          
          console.log('✅ Google Calendar event updated successfully');
        } catch (calendarError) {
          console.warn('⚠️ Failed to update Google Calendar event (booking time still updated):', calendarError);
          // Don't throw error - booking update should succeed even if calendar update fails
        }
      } else {
        console.log('📅 No Google Calendar event ID found, skipping calendar update');
      }

      // Refresh bookings
      await fetchUserBookings();

      // Reset editing state
      setEditingId(null);
      setSessionDate('');
      setSessionTime('');
      
      console.log('✅ Session date updated successfully');
    } catch (error) {
      console.error('❌ Error updating session date:', error);
      alert('Error updating session date. Please try again.');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDateDDMMYYYY = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTimeDDMMYYYY = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day}/${month}/${year}, ${hours}:${minutes}`;
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          icon: <Clock className="h-4 w-4" />,
          text: 'Active',
          className: 'bg-blue-900/60 text-blue-200 border-blue-700/50',
        };
      case 'completed':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          text: 'Completed',
          className: 'bg-green-900/60 text-green-200 border-green-700/50',
        };
      case 'cancelled':
        return {
          icon: <XCircle className="h-4 w-4" />,
          text: 'Cancelled',
          className: 'bg-red-900/60 text-red-200 border-red-700/50',
        };
      default:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          text: 'Unknown',
          className: 'bg-gray-900/60 text-gray-200 border-gray-700/50',
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
      </div>
    );
  }

  return (
    <section id="my-booked-sessions" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-400 mb-4">
            My Booked Sessions
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Manage your mentorship sessions. You can cancel active sessions if needed.
          </p>
        </motion.div>

        <CalendarSyncManager onSyncComplete={fetchUserBookings} />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {!loading && bookings.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700"
          >
            <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Sessions Booked Yet</h3>
            <p className="text-gray-400 mb-6">
              You haven't booked any mentorship sessions yet. Browse available mentors to get started!
            </p>
            <button
              onClick={onNavigateHome}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Find Mentors
            </button>
          </motion.div>
        )}

        {bookings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center py-12"
          >
            <Calendar className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">No sessions booked yet</h3>
            <p className="text-gray-400">
              Browse our mentors and book your first session to get started!
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => {
              const statusInfo = getStatusInfo(booking.status);
              const mentorName = `${booking.mentors.user_profiles.first_name || ''} ${booking.mentors.user_profiles.last_name || ''}`.trim() 
                || booking.mentors.user_profiles.email;

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-400 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{mentorName}</h3>
                        <p className="text-sm text-gray-400">
                          {booking.mentors.user_profiles.email}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${statusInfo.className}`}>
                      {statusInfo.icon}
                      <span>{statusInfo.text}</span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="h-4 w-4" />
                      <span>Booked on: {formatDateDDMMYYYY(booking.created_at)}</span>
                    </div>
                    
                    {editingId === booking.id ? (
                      <div className="space-y-3 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                        <div className="text-sm text-gray-300 font-medium">
                          Confirm session date and time:
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={sessionDate}
                            onChange={(e) => setSessionDate(e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            style={{
                              backgroundColor: 'white',
                              color: '#1f2937',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              padding: '8px',
                              fontSize: '14px',
                              minHeight: '36px',
                              cursor: 'pointer'
                            }}
                          />
                          <input
                            type="time"
                            value={sessionTime}
                            onChange={(e) => setSessionTime(e.target.value)}
                            style={{
                              backgroundColor: 'white',
                              color: '#1f2937',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              padding: '8px',
                              fontSize: '14px',
                              minHeight: '36px',
                              cursor: 'pointer'
                            }}
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateSessionDate(booking.id)}
                            disabled={!sessionDate || !sessionTime || updatingId === booking.id}
                            className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Check className="h-3 w-3" />
                            {updatingId === booking.id ? 'Saving...' : 'Confirm'}
                          </button>
                          <button
                            onClick={cancelEditingDate}
                            disabled={updatingId === booking.id}
                            className="flex items-center gap-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors disabled:opacity-50"
                          >
                            <X className="h-3 w-3" />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : booking.scheduled_at ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-emerald-300">
                          <Clock className="h-4 w-4" />
                          <span>Session scheduled: {formatDateTimeDDMMYYYY(booking.scheduled_at)}</span>
                        </div>
                        {booking.status === 'active' && (
                          <button
                            onClick={() => startEditingDate(booking.id, booking.scheduled_at)}
                            className="flex items-center gap-1 px-2 py-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
                          >
                            <Edit2 className="h-3 w-3" />
                            Edit
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-amber-300">
                          <Clock className="h-4 w-4" />
                          <span>Session time: To be confirmed</span>
                        </div>
                        {booking.status === 'active' && (
                          <button
                            onClick={() => startEditingDate(booking.id)}
                            className="flex items-center gap-1 px-2 py-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 rounded text-xs transition-colors border border-amber-600/50"
                          >
                            <Edit2 className="h-3 w-3" />
                            Confirm Date
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {booking.mentors.strengths && booking.mentors.strengths.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">Mentor Strengths:</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.mentors.strengths.slice(0, 3).map((strength: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                          >
                            {strength}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.selected_skills && booking.selected_skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2">Skills you want to work on:</p>
                      <div className="flex flex-wrap gap-1">
                        {booking.selected_skills.map((skill: string, i: number) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-emerald-700/70 text-emerald-200 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {booking.message && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-400 mb-2 font-medium">💬 Your message to mentor:</p>
                      <div className="p-3 bg-gray-700/50 border border-gray-600 rounded-lg">
                        <p className="text-sm text-gray-300 italic">"{booking.message}"</p>
                      </div>
                    </div>
                  )}

                  {booking.status === 'active' && (
                    <div className="pt-4 border-t border-gray-700">
                      {/* Updated Notice */}
                      <div className="mb-3 p-3 bg-blue-900/20 border border-blue-500/50 rounded-lg">
                        <p className="text-xs text-blue-200 text-center">
                          📅 <strong>Automatic Sync:</strong> Cancelling here will automatically remove the event from your Google Calendar!
                        </p>
                      </div>
                      
                      <button
                        onClick={() => cancelBooking(booking.id, booking.mentor_id)}
                        disabled={cancellingId === booking.id}
                        className="w-full flex items-center justify-center gap-2 bg-red-700/60 hover:bg-red-700/80 text-red-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>
                          {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Session'}
                        </span>
                      </button>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        This will make the mentor available again and sync with Google Calendar
                      </p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default UserBookings; 