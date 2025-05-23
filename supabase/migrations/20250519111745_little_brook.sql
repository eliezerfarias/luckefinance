/*
  # Add AI suggestions table
  
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
    - Add policy for users to manage their own suggestions
*/

CREATE TABLE public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
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