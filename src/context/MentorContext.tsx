import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, MentorProfile, UserProfile } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { googleCalendarService } from '../lib/googleCalendar';
import { DEV_CONFIG, isSupabaseAvailable, clearMariaMentorProfile } from '../lib/devConfig';

interface MentorWithProfile extends MentorProfile {
  user_profiles?: UserProfile;
}

interface MentorContextType {
  mentors: MentorWithProfile[];
  loading: boolean;
  addMentor: (mentor: {
    picture_url: string;
    location?: string;
    strengths: string[];
    availability_preferences?: string;
    why_choose_me: string;
    booking_link: string;
    first_name?: string;
    last_name?: string;
  }) => Promise<void>;
  updateMentor: (mentorId: string, mentorData: {
    picture_url: string;
    location?: string;
    strengths: string[];
    availability_preferences?: string;
    why_choose_me: string;
    booking_link: string;
  }) => Promise<void>;
  bookMentor: (id: string, scheduledAt?: string, selectedSkills?: string[], message?: string) => Promise<void>;
  unlockMentor: (id: string) => Promise<void>;
  refreshMentors: () => Promise<void>;
  getCurrentUserMentor: () => MentorWithProfile | null;
  getMentorBookings: (mentorId: string) => Promise<any[]>;
}

const MentorContext = createContext<MentorContextType | undefined>(undefined);

export const useMentorContext = () => {
  const context = useContext(MentorContext);
  if (!context) {
    throw new Error('useMentorContext must be used within a MentorProvider');
  }
  return context;
};

interface MentorProviderProps {
  children: ReactNode;
}

export const MentorProvider: React.FC<MentorProviderProps> = ({ children }) => {
  const [mentors, setMentors] = useState<MentorWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, userProfile, isAdmin } = useAuth();

  const fetchMentors = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching mentors...');
      
      // Check if we're using mock mode and data is available
      console.log('📊 Current MOCK_MENTORS length:', DEV_CONFIG.MOCK_MENTORS.length);
      console.log('👥 Current MOCK_MENTORS data:', DEV_CONFIG.MOCK_MENTORS);
      
      // Always use mock data in our current setup
      console.log('📝 Using mock mentors data');
      setMentors(DEV_CONFIG.MOCK_MENTORS as MentorWithProfile[]);
      console.log('✅ Mentors set:', DEV_CONFIG.MOCK_MENTORS.length, 'mentors loaded');
      
      return;
      
      // Keeping the Supabase code for future use but not executing it
      /* 
      // Check if Supabase is available and use mock data if not
      if (DEV_CONFIG.ENABLE_MOCK_MODE && !(await isSupabaseAvailable())) {
        console.warn('Supabase not available, using mock mentors');
        setMentors(DEV_CONFIG.MOCK_MENTORS as MentorWithProfile[]);
        return;
      }

      const { data, error } = await supabase
        .from('mentors')
        .select(`
          *,
          user_profiles (
            id,
            email,
            first_name,
            last_name,
            role
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentors:', error);
        // Fallback to mock data if database query fails
        if (DEV_CONFIG.ENABLE_MOCK_MODE) {
          console.warn('Database query failed, using mock mentors');
          setMentors(DEV_CONFIG.MOCK_MENTORS as MentorWithProfile[]);
          return;
        }
        throw error;
      }
      
      setMentors(data || []);
      */
    } catch (error) {
      console.error('❌ Error fetching mentors:', error);
      // Always fallback to mock data
      console.log('🔄 Falling back to mock mentors');
      setMentors(DEV_CONFIG.MOCK_MENTORS as MentorWithProfile[]);
    } finally {
      setLoading(false);
    }
  };

  const addMentor = async (mentorData: {
    picture_url: string;
    location?: string;
    strengths: string[];
    availability_preferences?: string;
    why_choose_me: string;
    booking_link: string;
    first_name?: string;
    last_name?: string;
  }) => {
    if (!user || !userProfile) throw new Error('User not authenticated');

    try {
      console.log('📝 Adding mentor for user:', user.email);
      
      // Generate a unique ID for the mentor
      const mentorId = `mentor-${Date.now()}-${user.id}`;
      
      // Create the mentor object
      const newMentor = {
        id: mentorId,
        user_id: user.id,
        picture_url: mentorData.picture_url,
        location: mentorData.location || '',
        strengths: mentorData.strengths,
        availability_preferences: mentorData.availability_preferences || '',
        why_choose_me: mentorData.why_choose_me,
        booking_link: '', // No longer used
        is_available: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_profiles: {
          id: user.id,
          email: userProfile.email,
          first_name: mentorData.first_name || userProfile.first_name || '',
          last_name: mentorData.last_name || userProfile.last_name || '',
          role: 'mentor' as const,
          created_at: userProfile.created_at,
          updated_at: new Date().toISOString()
        }
      };
      
      // Add to mock data
      DEV_CONFIG.MOCK_MENTORS.push(newMentor);
      console.log('✅ Mentor added to MOCK_MENTORS');
      console.log('📊 Total mentors now:', DEV_CONFIG.MOCK_MENTORS.length);
      
      // Refresh the mentors list
      await fetchMentors();
      console.log('✅ Mentors list refreshed');
      
    } catch (error) {
      console.error('❌ Error adding mentor:', error);
      throw error;
    }
  };

  const bookMentor = async (id: string, scheduledAt?: string, selectedSkills?: string[], message?: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('📝 Creating booking record...');
      console.log('👤 User ID:', user.id);
      console.log('🎯 Mentor ID:', id);
      console.log('📅 Scheduled At:', scheduledAt);
      console.log('🎯 Selected Skills:', selectedSkills);
      console.log('💬 Message:', message);
      console.log('✅ Selected skills and message will now be saved to database');

      // Create booking record with proper typing
      const bookingData: {
        mentor_id: string;
        booked_by: string;
        scheduled_at?: string;
        selected_skills: string[];
        message?: string;
      } = {
        mentor_id: id,
        booked_by: user.id,
        selected_skills: selectedSkills || [],
      };

      // Add scheduled_at if provided
      if (scheduledAt) {
        bookingData.scheduled_at = scheduledAt;
      }

      // Add message if provided
      if (message && message.trim()) {
        bookingData.message = message.trim();
      }

      console.log('💾 Booking data to insert:', bookingData);

      const { data: insertedBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select();

      if (bookingError) {
        console.error('❌ Error inserting booking:', bookingError);
        throw bookingError;
      }

      console.log('✅ Booking created successfully:', insertedBooking);

      // Try to sync with Google Calendar
      if (insertedBooking && insertedBooking.length > 0) {
        const booking = insertedBooking[0];
        console.log('📅 Attempting to sync with Google Calendar...');
        
        try {
          // Get mentor and mentee details
          const mentor = mentors.find(m => m.id === id);
          const mentorProfile = mentor?.user_profiles;
          const menteeProfile = userProfile;
          
          if (mentor && mentorProfile && menteeProfile && scheduledAt) {
            const mentorName = `${mentorProfile.first_name || ''} ${mentorProfile.last_name || ''}`.trim() || mentorProfile.email || 'Mentor';
            const menteeName = `${menteeProfile.first_name || ''} ${menteeProfile.last_name || ''}`.trim() || menteeProfile.email || 'Mentee';
            
            await googleCalendarService.syncBookingToCalendar(
              booking.id,
              mentorProfile.email,
              menteeProfile.email,
              mentorName,
              menteeName,
              scheduledAt,
              selectedSkills || [],
              message
            );
            console.log('✅ Google Calendar sync successful');
          } else {
            console.warn('⚠️ Missing required data for calendar sync:', { 
              mentor: !!mentor, 
              mentorProfile: !!mentorProfile, 
              menteeProfile: !!menteeProfile,
              scheduledAt: !!scheduledAt
            });
          }
        } catch (calendarError) {
          console.warn('⚠️ Google Calendar sync failed (booking still created):', calendarError);
          // Don't throw error - booking was successful even if calendar sync failed
        }
      }

      // Note: We no longer mark mentor as unavailable automatically
      // Mentors remain available by default and can mark themselves unavailable voluntarily
      console.log('🔄 Refreshing mentors list...');
      await fetchMentors();
      console.log('✅ All done!');
    } catch (error) {
      console.error('Error booking mentor:', error);
      throw error;
    }
  };

  const unlockMentor = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      console.log('🔓 Unlocking mentor (setting available):', id);
      
      // Find mentor in mock data
      const mentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex((m: any) => m.id === id);
      if (mentorIndex === -1) {
        throw new Error('Mentor not found');
      }

      const mentor = DEV_CONFIG.MOCK_MENTORS[mentorIndex];
      
      // Check permissions: admin or mentor themselves
      if (!isAdmin && mentor.user_id !== user.id) {
        throw new Error('Insufficient permissions');
      }

      // Update availability in mock data
      DEV_CONFIG.MOCK_MENTORS[mentorIndex] = {
        ...mentor,
        is_available: true,
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Mentor availability updated to available');
      await fetchMentors();
      
    } catch (error) {
      console.error('❌ Error unlocking mentor:', error);
      throw error;
    }
  };

  const updateMentor = async (mentorId: string, mentorData: {
    picture_url: string;
    location?: string;
    strengths: string[];
    availability_preferences?: string;
    why_choose_me: string;
    booking_link: string;
  }) => {
    if (!user || !userProfile) throw new Error('User not authenticated');

    try {
      console.log('📝 Updating mentor profile:', mentorId);
      console.log('📊 Update data:', mentorData);
      
      // Find the mentor in mock data
      const mentorIndex = DEV_CONFIG.MOCK_MENTORS.findIndex(
        (m: any) => m.id === mentorId && m.user_id === user.id
      );
      
      if (mentorIndex === -1) {
        throw new Error('Mentor not found or you do not have permission to update this profile');
      }
      
      // Update the mentor in mock data
      DEV_CONFIG.MOCK_MENTORS[mentorIndex] = {
        ...DEV_CONFIG.MOCK_MENTORS[mentorIndex],
        picture_url: mentorData.picture_url,
        location: mentorData.location || '',
        strengths: mentorData.strengths,
        availability_preferences: mentorData.availability_preferences || '',
        why_choose_me: mentorData.why_choose_me,
        booking_link: '', // Not used anymore but keep for compatibility
        updated_at: new Date().toISOString()
      };
      
      console.log('✅ Mentor profile updated in MOCK_MENTORS');
      console.log('📊 Updated mentor:', DEV_CONFIG.MOCK_MENTORS[mentorIndex]);
      
      // Refresh the mentors list
      await fetchMentors();
      console.log('✅ Mentors list refreshed');
      
    } catch (error) {
      console.error('❌ Error updating mentor:', error);
      throw error;
    }
  };

  const getCurrentUserMentor = (): MentorWithProfile | null => {
    if (!user) return null;
    return mentors.find(mentor => mentor.user_id === user.id) || null;
  };

  const getMentorBookings = async (mentorId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user_profiles!bookings_booked_by_fkey (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching mentor bookings:', error);
      return [];
    }
  };



  const refreshMentors = async () => {
    await fetchMentors();
  };

  useEffect(() => {
    if (user) {
      // Clean up any duplicate mentor profiles for Maria to ensure fresh start
      clearMariaMentorProfile();
      fetchMentors();
    }
  }, [user]);

  return (
    <MentorContext.Provider
      value={{
        mentors,
        loading,
        addMentor,
        updateMentor,
        bookMentor,
        unlockMentor,
        refreshMentors,
        getCurrentUserMentor,
        getMentorBookings,
      }}
    >
      {children}
    </MentorContext.Provider>
  );
};