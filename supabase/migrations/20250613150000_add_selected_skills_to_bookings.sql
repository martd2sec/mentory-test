-- Add selected_skills column to bookings table
ALTER TABLE public.bookings 
ADD COLUMN selected_skills TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Add index for better performance when querying by skills
CREATE INDEX idx_bookings_selected_skills ON public.bookings USING GIN (selected_skills);

-- Update existing bookings to have empty array instead of NULL
UPDATE public.bookings 
SET selected_skills = ARRAY[]::TEXT[] 
WHERE selected_skills IS NULL; 