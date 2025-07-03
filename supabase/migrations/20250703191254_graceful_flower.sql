/*
  # Create debt agreements table

  1. New Tables
    - `debt_agreements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `total_amount` (numeric)
      - `installments` (integer)
      - `start_date` (date)
      - `notes` (text)
      - `status` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `debt_agreements` table
    - Add policy for authenticated users to manage their own agreements
*/

CREATE TABLE IF NOT EXISTS public.debt_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  total_amount numeric NOT NULL,
  installments integer NOT NULL,
  start_date date NOT NULL,
  notes text,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.debt_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own agreements"
  ON public.debt_agreements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);