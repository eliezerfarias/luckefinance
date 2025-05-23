/*
  # Fix debt agreements table and policies

  1. Changes
    - Drop existing table and policies if they exist
    - Recreate debt_agreements table with proper schema
    - Add RLS policies for user data access
    
  2. Security
    - Enable RLS on debt_agreements table
    - Add policy for users to manage their own agreements
*/

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS public.debt_agreements CASCADE;

-- Create the debt_agreements table
CREATE TABLE public.debt_agreements (
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

-- Enable RLS
ALTER TABLE public.debt_agreements ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own agreements
CREATE POLICY "Users can manage own agreements"
  ON public.debt_agreements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);