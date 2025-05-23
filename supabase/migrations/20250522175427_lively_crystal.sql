/*
  # Add status and recurring fields to transactions table
  
  1. Changes
    - Add status field if it doesn't exist
    - Add recurring field if it doesn't exist
    - Add appropriate constraints for both fields
  
  2. Security
    - Ensure data integrity with CHECK constraints
*/

DO $$ 
BEGIN
  -- Add status field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'status'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN status text NOT NULL DEFAULT 'pending';
    
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_status_check CHECK (
      CASE
        WHEN (type = 'income') THEN (status = ANY (ARRAY['pending'::text, 'completed'::text]))
        ELSE (status = ANY (ARRAY['pending'::text, 'completed'::text, 'late'::text]))
      END
    );
  END IF;

  -- Add recurring field if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transactions' AND column_name = 'recurring'
  ) THEN
    ALTER TABLE transactions 
    ADD COLUMN recurring text NOT NULL DEFAULT 'one-time';
    
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_recurring_check CHECK (
      recurring = ANY (ARRAY['one-time'::text, 'recurring'::text])
    );
  END IF;
END $$;