/*
  # Add debt agreements table
  
  1. New Tables
    - `debt_agreements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `name` (text)
      - `total_amount` (numeric)
      - `installments` (integer)
      - `start_date` (timestamp with time zone)
      - `notes` (text)
      - `created_at` (timestamp with time zone)
      - `status` (text)
  
  2. Security
    - Enable RLS on debt_agreements table
    - Add policy for users to manage their own agreements
*/

CREATE TABLE IF NOT EXISTS public.debt_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) NOT NULL,
  name text NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  installments integer NOT NULL CHECK (installments > 0),
  start_date timestamptz NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled'))
);

ALTER TABLE public.debt_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own agreements"
  ON public.debt_agreements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);