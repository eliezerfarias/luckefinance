/*
  # Add AI suggestions table
  
  1. New Tables
    - `ai_suggestions`
      - `id` (uuid, primary key)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `is_helpful` (boolean)
  
  2. Security
    - Enable RLS on ai_suggestions table
    - Add policy for authenticated users to read and manage suggestions
*/

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_helpful boolean DEFAULT false
);

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

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