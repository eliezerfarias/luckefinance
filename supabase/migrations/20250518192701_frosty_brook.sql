/*
  # Fix users table RLS policies

  1. Security Changes
    - Drop existing policies to avoid conflicts
    - Add policy for users to manage their own profile
    - Add policy for users to read other profiles
    - Ensure RLS is enabled
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can read other profiles" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;

-- Policy for users to manage their own profile (CRUD operations)
CREATE POLICY "Users can manage own profile"
ON users
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for users to read other users' basic info
CREATE POLICY "Users can read other profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;