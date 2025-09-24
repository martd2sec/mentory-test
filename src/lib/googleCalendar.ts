import { supabase } from './supabase';

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  extendedProperties?: {
    private?: {
      [key: string]: string;
    };
    shared?: {
      [key: string]: string;
    };
  };
}

class GoogleCalendarService {
  // Get current user's Google access token from Supabase Auth
  async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.provider_token) {
        console.warn('No Google access token found in session');
        return null;
      }
      return session.provider_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Check if user is connected to Google Calendar
  async isUserConnected(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  // Create a calendar event
  async createEvent(eventData: CalendarEvent): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('User not authenticated with Google Calendar');
      }

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...eventData,
          extendedProperties: {
            private: {
              source: 'mentorship-platform',
            },
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendar event creation failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('✅ Calendar event created:', data.id);
      return data.id || null;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update a calendar event
  async updateEvent(eventId: string, eventData: Partial<CalendarEvent>): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('User not authenticated with Google Calendar');
      }

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendar event update failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      console.log('✅ Calendar event updated:', eventId);
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete a calendar event
  async deleteEvent(eventId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('User not authenticated with Google Calendar');
      }

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendar event deletion failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      console.log('✅ Calendar event deleted:', eventId);
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Get events from calendar
  async getEvents(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('User not authenticated with Google Calendar');
      }

      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '50',
        q: 'mentorship-platform', // Filter events created by our platform
      });

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendar events fetch failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Get ALL events from calendar (including appointment schedule events)
  async getAllEvents(startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('User not authenticated with Google Calendar');
      }

      const params = new URLSearchParams({
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: 'true',
        orderBy: 'startTime',
        maxResults: '100',
        // Remove the query filter to get ALL events
      });

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendar events fetch failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  // Get event details by ID
  async getEventById(eventId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        throw new Error('User not authenticated with Google Calendar');
      }

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Calendar event fetch failed: ${response.statusText} - ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching calendar event:', error);
      throw error;
    }
  }

  // Detect new mentorship events created through appointment schedule
  async detectNewMentorshipEvents(mentorEmail: string, menteeEmail: string, lastChecked: Date): Promise<any[]> {
    try {
      console.log('🔍 Detecting new mentorship events...');
      
      // Get all events since last check
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2); // Look 2 months ahead
      
      const allEvents = await this.getAllEvents(lastChecked, endDate);
      
      // Filter for events that could be mentorship sessions
      const mentorshipEvents = allEvents.filter(event => {
        // Check if the event involves both mentor and mentee
        const attendees = event.attendees || [];
        const hasmentorshipParticipants = attendees.some((a: any) => 
          a.email === mentorEmail || a.email === menteeEmail
        );
        
        // Check if it's a new event (created after last check)
        const eventCreated = new Date(event.created);
        const isNewEvent = eventCreated > lastChecked;
        
        // Don't include events we already created (have our source marker)
        const notOurEvent = !(event.extendedProperties?.private?.source === 'mentorship-platform');
        
        return hasmentorshipParticipants && isNewEvent && notOurEvent && event.status !== 'cancelled';
      });
      
      console.log(`🔍 Found ${mentorshipEvents.length} potential new mentorship events`);
      return mentorshipEvents;
    } catch (error) {
      console.error('Error detecting new mentorship events:', error);
      return [];
    }
  }

  // Sync an appointment schedule event with our database
  async syncAppointmentScheduleEvent(
    eventId: string,
    mentorId: string,
    menteeId: string,
    selectedSkills: string[],
    message?: string
  ): Promise<string | null> {
    try {
      console.log('🔄 Syncing appointment schedule event:', eventId);
      
      // Get the event details from Google Calendar
      const event = await this.getEventById(eventId);
      
      if (!event || event.status === 'cancelled') {
        console.log('❌ Event not found or cancelled');
        return null;
      }
      
      // Extract the scheduled time from the event
      const scheduledAt = event.start.dateTime || event.start.date;
      
      // Create booking record in database
      const bookingData = {
        mentor_id: mentorId,
        booked_by: menteeId,
        scheduled_at: scheduledAt,
        selected_skills: selectedSkills,
        message: message,
        google_calendar_mentor_event_id: eventId,
        google_calendar_mentee_event_id: eventId, // Same event for both
      };
      
      const { data: insertedBooking, error: bookingError } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single();
      
      if (bookingError) {
        console.error('❌ Error creating booking:', bookingError);
        throw bookingError;
      }
      
      console.log('✅ Booking created from appointment schedule:', insertedBooking.id);
      
      // Update the Google Calendar event to include mentorship platform info
      const mentorName = event.attendees?.find((a: any) => a.email !== menteeId)?.displayName || 'Mentor';
      const menteeName = event.attendees?.find((a: any) => a.email === menteeId)?.displayName || 'Mentee';
      
      const updatedDescription = `
📚 Mentorship Session (Synced from Appointment Schedule)

👨‍🏫 Mentor: ${mentorName}
👨‍🎓 Mentee: ${menteeName}

🎯 Skills to work on:
${selectedSkills.map(skill => `• ${skill}`).join('\n')}

${message ? `💬 Message from mentee:\n${message}` : ''}

📝 This session was scheduled through the Bitso Mentorship Platform.
      `.trim();
      
      await this.updateEvent(eventId, {
        description: updatedDescription,
        extendedProperties: {
          private: {
            source: 'mentorship-platform',
            booking_id: insertedBooking.id,
          },
        },
      });
      
      console.log('✅ Google Calendar event updated with mentorship info');
      return insertedBooking.id;
    } catch (error) {
      console.error('❌ Error syncing appointment schedule event:', error);
      throw error;
    }
  }

  // Check for changes in existing Google Calendar events
  async syncCalendarChanges(bookingId: string, eventId: string): Promise<void> {
    try {
      console.log('🔄 Syncing calendar changes for booking:', bookingId);
      
      const event = await this.getEventById(eventId);
      
      if (!event) {
        console.log('❌ Event not found, marking booking as cancelled');
        // Event was deleted, mark booking as cancelled
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
        return;
      }
      
      if (event.status === 'cancelled') {
        console.log('❌ Event cancelled, updating booking status');
        // Event was cancelled, update booking status
        await supabase
          .from('bookings')
          .update({ status: 'cancelled' })
          .eq('id', bookingId);
        return;
      }
      
      // Check if the event time changed
      const newScheduledAt = event.start.dateTime || event.start.date;
      
      // Update booking with new scheduled time
      await supabase
        .from('bookings')
        .update({ scheduled_at: newScheduledAt })
        .eq('id', bookingId);
      
      console.log('✅ Booking updated with calendar changes');
    } catch (error) {
      console.error('❌ Error syncing calendar changes:', error);
      throw error;
    }
  }

  // Sync all bookings with their corresponding Google Calendar events
  async syncAllBookingsWithCalendar(): Promise<void> {
    try {
      console.log('🔄 Starting full calendar sync...');
      
      // Get all active bookings with Google Calendar event IDs
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('status', 'active')
        .not('google_calendar_mentor_event_id', 'is', null);
      
      if (error) {
        console.error('❌ Error fetching bookings:', error);
        return;
      }
      
      console.log(`🔄 Found ${bookings?.length || 0} bookings to sync`);
      
      // Sync each booking with its calendar event
      for (const booking of bookings || []) {
        if (booking.google_calendar_mentor_event_id) {
          try {
            await this.syncCalendarChanges(booking.id, booking.google_calendar_mentor_event_id);
          } catch (error) {
            console.error(`❌ Error syncing booking ${booking.id}:`, error);
          }
        }
      }
      
      console.log('✅ Full calendar sync completed');
    } catch (error) {
      console.error('❌ Error in full calendar sync:', error);
      throw error;
    }
  }

  // Create calendar event for a mentorship booking
  async createBookingEvent(
    mentorEmail: string,
    menteeEmail: string,
    mentorName: string,
    menteeName: string,
    scheduledAt: string,
    selectedSkills: string[],
    message?: string
  ): Promise<string | null> {
    try {
      const startTime = new Date(scheduledAt);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour session

      const eventData: CalendarEvent = {
        summary: `🎯 Mentorship Session: ${menteeName} & ${mentorName}`,
        description: `
📚 Mentorship Session

👨‍🏫 Mentor: ${mentorName} (${mentorEmail})
👨‍🎓 Mentee: ${menteeName} (${menteeEmail})

🎯 Skills to work on:
${selectedSkills.map(skill => `• ${skill}`).join('\n')}

${message ? `💬 Message from mentee:\n${message}` : ''}

📝 This session was scheduled through the Bitso Mentorship Platform.
        `.trim(),
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/Mexico_City',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/Mexico_City',
        },
        attendees: [
          {
            email: mentorEmail,
            displayName: mentorName,
          },
          {
            email: menteeEmail,
            displayName: menteeName,
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            {
              method: 'email',
              minutes: 24 * 60, // 24 hours before
            },
            {
              method: 'popup',
              minutes: 15, // 15 minutes before
            },
          ],
        },
      };

      return await this.createEvent(eventData);
    } catch (error) {
      console.error('Error creating booking event:', error);
      throw error;
    }
  }

  // Sync booking to Google Calendar for both mentor and mentee
  async syncBookingToCalendar(
    bookingId: string,
    mentorEmail: string,
    menteeEmail: string,
    mentorName: string,
    menteeName: string,
    scheduledAt: string,
    selectedSkills: string[],
    message?: string
  ): Promise<{ mentorEventId: string | null, menteeEventId: string | null }> {
    try {
      console.log('🔄 Starting calendar sync for booking:', bookingId);
      
      // Create event in mentor's calendar
      let mentorEventId: string | null = null;
      try {
        mentorEventId = await this.createBookingEvent(
          mentorEmail,
          menteeEmail,
          mentorName,
          menteeName,
          scheduledAt,
          selectedSkills,
          message
        );
        console.log('✅ Mentor calendar event created:', mentorEventId);
      } catch (error) {
        console.error('❌ Failed to create mentor calendar event:', error);
      }

      // For now, we'll assume the same event covers both people
      // In a full implementation, you might want to create separate events
      const menteeEventId = mentorEventId;

      // Update booking with Google Calendar event IDs
      if (mentorEventId) {
        const { error } = await supabase
          .from('bookings')
          .update({
            google_calendar_mentor_event_id: mentorEventId,
            google_calendar_mentee_event_id: menteeEventId,
          })
          .eq('id', bookingId);

        if (error) {
          console.error('❌ Failed to update booking with calendar event IDs:', error);
        } else {
          console.log('✅ Booking updated with calendar event IDs');
        }
      }

      return { mentorEventId, menteeEventId };
    } catch (error) {
      console.error('❌ Error syncing booking to calendar:', error);
      throw error;
    }
  }
}

export const googleCalendarService = new GoogleCalendarService(); 