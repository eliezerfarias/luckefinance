/*
  # Fix RLS policies conflicts

  1. Changes
    - Drop conflicting policies on ai_suggestions table
    - Ensure only one set of policies exists
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can manage own suggestions" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ai_suggestions;

-- Create clean, non-conflicting policies
CREATE POLICY "Users can insert own suggestions"
  ON public.ai_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own suggestions"
  ON public.ai_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own suggestions"
  ON public.ai_suggestions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);