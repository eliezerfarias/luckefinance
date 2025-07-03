/*
  # Add insert and update policies for AI suggestions

  1. Security Changes
    - Add separate INSERT and UPDATE policies for ai_suggestions
    - Add separate INSERT and UPDATE policies for authenticated users
*/

-- Enable insert for authenticated users
CREATE POLICY "Enable insert for authenticated users"
  ON public.ai_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Enable read access for authenticated users
CREATE POLICY "Enable read access for authenticated users"
  ON public.ai_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Enable update for authenticated users
CREATE POLICY "Enable update for authenticated users"
  ON public.ai_suggestions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);