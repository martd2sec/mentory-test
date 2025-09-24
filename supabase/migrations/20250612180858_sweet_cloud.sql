/*
  # Fix User Creation Database Error

  1. Issues Fixed
    - Handle potential conflicts in user profile creation
    - Improve error handling in the trigger function
    - Add better validation for email domains
    - Fix potential race conditions

  2. Changes
    - Update handle_new_user function with better error handling
    - Add upsert logic to prevent conflicts
    - Improve email validation
    - Add logging for debugging
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Improved function to handle user signup with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_role_value user_role;
  first_name_value text;
  last_name_value text;
BEGIN
  -- Validate email domain (only allow @bitso.com)
  IF NEW.email IS NULL OR NOT NEW.email LIKE '%@bitso.com' THEN
    RAISE EXCEPTION 'Access restricted to @bitso.com email addresses only';
  END IF;

  -- Determine role based on email
  IF NEW.email = 'maria.achaga@bitso.com' THEN
    user_role_value := 'admin'::user_role;
  ELSE
    user_role_value := 'user'::user_role;
  END IF;

  -- Extract first and last name from raw_user_meta_data if available
  IF NEW.raw_user_meta_data IS NOT NULL THEN
    first_name_value := COALESCE(NEW.raw_user_meta_data->>'given_name', NEW.raw_user_meta_data->>'first_name');
    last_name_value := COALESCE(NEW.raw_user_meta_data->>'family_name', NEW.raw_user_meta_data->>'last_name');
  END IF;

  -- Insert or update user profile (upsert to handle potential conflicts)
  INSERT INTO user_profiles (id, email, first_name, last_name, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    first_name_value,
    last_name_value,
    user_role_value,
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, user_profiles.first_name),
    last_name = COALESCE(EXCLUDED.last_name, user_profiles.last_name),
    role = EXCLUDED.role,
    updated_at = now();

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
    -- Re-raise the exception to prevent user creation if profile creation fails
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Ensure RLS policies are properly set
DROP POLICY IF EXISTS "Allow user profile creation during signup" ON user_profiles;
CREATE POLICY "Allow user profile creation during signup"
  ON user_profiles
  FOR INSERT
  WITH CHECK (true);

-- Add a policy to allow reading user profiles for authentication
DROP POLICY IF EXISTS "Allow reading profiles for auth" ON user_profiles;
CREATE POLICY "Allow reading profiles for auth"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Add policy for users to update their own bookings (for cancellation)
CREATE POLICY "Users can update own bookings"
  ON bookings
  FOR UPDATE
  TO authenticated
  USING (booked_by = auth.uid())
  WITH CHECK (booked_by = auth.uid());