-- Add message column to bookings table
ALTER TABLE bookings 
ADD COLUMN message TEXT;

-- Create index for message searching if needed
CREATE INDEX IF NOT EXISTS idx_bookings_message ON bookings USING gin(to_tsvector('english', message));

-- Add comment for documentation
COMMENT ON COLUMN bookings.message IS 'Optional message from mentee to mentor describing their specific goals and context'; 