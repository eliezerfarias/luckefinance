/*
  # Create AI suggestions table

  1. New Tables
    - `ai_suggestions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `category` (text)
      - `created_at` (timestamp)
      - `is_helpful` (boolean)

  2. Security
    - Enable RLS on `ai_suggestions` table
    - Add policy for authenticated users to manage their own suggestions
*/

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  is_helpful boolean DEFAULT false
);

ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own suggestions"
  ON public.ai_suggestions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);