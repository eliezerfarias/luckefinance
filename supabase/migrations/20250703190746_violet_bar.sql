/*
  # Create and Add profile fields to public.profiles table

  1. Changes
    - Create the public.profiles table if it doesn't exist, linked to auth.users.
    - Add username and nickname columns to public.profiles table.
    - Enable Row Level Security (RLS) on public.profiles.
    - Set up RLS policies for public.profiles to allow users to manage their own data.
    - Create trigger to automatically create profile when user signs up.
*/

-- 1. Create the 'profiles' table if it doesn't exist
-- This table will store additional user profile information.
-- It links directly to the 'auth.users' table via the 'id' column.
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY, -- Links to auth.users and deletes profile if user is deleted
  username text UNIQUE, -- Username for the user, must be unique
  nickname text, -- Nickname for the user
  email text, -- Email from auth.users for easier access
  updated_at timestamp with time zone DEFAULT now() -- Timestamp for when the profile was last updated
);

-- 2. Add username and nickname columns (if they don't already exist)
-- This ensures the columns are added even if the table was pre-existing but lacked these specific fields.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='username') THEN
    ALTER TABLE public.profiles ADD COLUMN username text UNIQUE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='nickname') THEN
    ALTER TABLE public.profiles ADD COLUMN nickname text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
    ALTER TABLE public.profiles ADD COLUMN email text;
  END IF;
END $$;

-- 3. Enable Row Level Security (RLS) on the 'profiles' table
-- RLS is crucial for data security, ensuring users only access their own data.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing RLS policies (if any) to avoid conflicts before creating new ones
-- This ensures a clean slate for the new policies.
DROP POLICY IF EXISTS "Users can read own data" ON public.profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- 5. Create new RLS policies for the 'profiles' table

-- Policy for SELECT (Read): Allows authenticated users to read their own profile.
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Policy for INSERT (Create): Allows authenticated users to create their own profile.
-- The WITH CHECK clause ensures they can only insert a profile for their own user ID.
CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy for UPDATE (Update): Allows authenticated users to update their own profile.
-- The USING clause checks existing rows, WITH CHECK checks new rows.
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy for DELETE (Delete): Allows authenticated users to delete their own profile.
CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- 6. Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, nickname)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', ''),
    COALESCE(new.raw_user_meta_data->>'nickname', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();