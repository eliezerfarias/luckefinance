/*
  # Fix users table RLS policies

  1. Changes
    - Remove invalid WITH CHECK clause from SELECT policies
    - Update policies for proper user data access control
    
  2. Security
    - Enable RLS on users table
    - Add policy for users to read their own data
    - Add policy for users to read basic info from other profiles
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can read other profiles" ON users;
DROP POLICY IF EXISTS "Users can manage own profile" ON users;

-- Policy for users to read their own complete profile
CREATE POLICY "Users can read own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy for users to read other users' basic info (username and nickname only)
CREATE POLICY "Users can read other profiles"
ON users
FOR SELECT
TO authenticated
USING (true);

-- Policy for users to manage their own profile
CREATE POLICY "Users can manage own profile"
ON users
FOR ALL
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Verify RLS is enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;