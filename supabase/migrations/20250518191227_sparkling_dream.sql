/*
  # Add profile fields to users table
  
  1. Changes
    - Add username and nickname columns to users table
    - Update RLS policies
*/

ALTER TABLE public.users
ADD COLUMN username text UNIQUE,
ADD COLUMN nickname text;

-- Update the existing policy to include new fields
DROP POLICY IF EXISTS "Users can read own data" ON public.users;

CREATE POLICY "Users can manage own profile"
  ON public.users
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);