-- Add Google Calendar event ID columns to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS google_calendar_mentor_event_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS google_calendar_mentee_event_id TEXT;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_event_id ON public.bookings(google_calendar_mentor_event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_mentee_event_id ON public.bookings(google_calendar_mentee_event_id); 