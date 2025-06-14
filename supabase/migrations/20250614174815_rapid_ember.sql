/*
  # Fix User Profile Creation

  1. Database Function
    - Create `handle_new_user` function to automatically create user profiles
    - Function runs with elevated privileges to bypass RLS
    - Extracts username and nickname from user metadata

  2. Trigger
    - Create trigger on `auth.users` table
    - Automatically creates profile when new user signs up
    - Eliminates client-side RLS policy violations

  3. Security
    - Function runs as SECURITY DEFINER (elevated privileges)
    - Only triggered by database events, not client calls
    - Maintains data integrity and security
*/

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'nickname'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();