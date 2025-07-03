/*
  # Create Stripe tables for payment processing

  1. New Tables
    - `stripe_customers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `customer_id` (text, Stripe customer ID)
      - `created_at` (timestamp)
      - `deleted_at` (timestamp)

    - `stripe_subscriptions`
      - `id` (uuid, primary key)
      - `customer_id` (text, references stripe_customers)
      - `subscription_id` (text, Stripe subscription ID)
      - `price_id` (text)
      - `status` (text)
      - `current_period_start` (integer)
      - `current_period_end` (integer)
      - `cancel_at_period_end` (boolean)
      - `payment_method_brand` (text)
      - `payment_method_last4` (text)
      - `created_at` (timestamp)

    - `stripe_orders`
      - `id` (uuid, primary key)
      - `customer_id` (text, references stripe_customers)
      - `checkout_session_id` (text)
      - `payment_intent_id` (text)
      - `amount_subtotal` (integer)
      - `amount_total` (integer)
      - `currency` (text)
      - `payment_status` (text)
      - `status` (text)
      - `order_date` (timestamp)

  2. Security
    - Enable RLS on all Stripe tables
    - Add policies for authenticated users to access their own data
*/

-- Stripe Customers Table
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  customer_id text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);

ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stripe customer data"
  ON public.stripe_customers FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Stripe Subscriptions Table
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text REFERENCES public.stripe_customers(customer_id) ON DELETE CASCADE NOT NULL,
  subscription_id text UNIQUE,
  price_id text,
  status text NOT NULL DEFAULT 'not_started',
  current_period_start integer,
  current_period_end integer,
  cancel_at_period_end boolean DEFAULT false,
  payment_method_brand text,
  payment_method_last4 text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription data"
  ON public.stripe_subscriptions FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers WHERE user_id = auth.uid()
    )
  );

-- Stripe Orders Table
CREATE TABLE IF NOT EXISTS public.stripe_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id text REFERENCES public.stripe_customers(customer_id) ON DELETE CASCADE NOT NULL,
  checkout_session_id text UNIQUE NOT NULL,
  payment_intent_id text,
  amount_subtotal integer,
  amount_total integer,
  currency text,
  payment_status text,
  status text,
  order_date timestamptz DEFAULT now()
);

ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own order data"
  ON public.stripe_orders FOR SELECT
  TO authenticated
  USING (
    customer_id IN (
      SELECT customer_id FROM public.stripe_customers WHERE user_id = auth.uid()
    )
  );