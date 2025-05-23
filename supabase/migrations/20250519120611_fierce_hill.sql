/*
  # Add AI suggestions table with user association
  
  1. New Tables
    - `ai_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `is_helpful` (boolean)
  
  2. Security
    - Enable RLS on ai_suggestions table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_helpful boolean DEFAULT false
);

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ai_suggestions;
DROP POLICY IF EXISTS "Users can manage own suggestions" ON public.ai_suggestions;

CREATE POLICY "Users can manage own suggestions"
  ON public.ai_suggestions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for authenticated users"
  ON public.ai_suggestions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.ai_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON public.ai_suggestions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);