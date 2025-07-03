/*
  # Create transactions table

  1. New Tables
    - `transactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `description` (text)
      - `category` (text)
      - `date` (date)
      - `amount` (numeric)
      - `type` (text)
      - `status` (text)
      - `recurring` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `transactions` table
    - Add policy for authenticated users to manage their own transactions
*/

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'late')),
  recurring text NOT NULL CHECK (recurring IN ('one-time', 'recurring')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);