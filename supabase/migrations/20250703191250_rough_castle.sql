/*
  # Create financial goals table

  1. New Tables
    - `financial_goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `target` (numeric)
      - `current` (numeric)
      - `period` (text)
      - `deadline` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `financial_goals` table
    - Add policy for authenticated users to manage their own goals
*/

CREATE TABLE IF NOT EXISTS public.financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target numeric NOT NULL DEFAULT 0,
  current numeric NOT NULL DEFAULT 0,
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  deadline date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON public.financial_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);