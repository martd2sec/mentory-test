/*
  # Add scheduled_at field to bookings table

  1. Changes
    - Add scheduled_at timestamptz field to bookings table
    - This will store the actual date/time of the scheduled session
    - Allows tracking difference between booking date and session date
*/

-- Add scheduled_at field to bookings table
ALTER TABLE bookings 
ADD COLUMN scheduled_at timestamptz;

-- Add index for better performance when querying by scheduled date
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_at ON bookings(scheduled_at); 