/*
  # Create user subscription views for easier access

  1. Views
    - `stripe_user_subscriptions` - Join user data with subscription info
    - `stripe_user_orders` - Join user data with order info

  2. Security
    - Enable RLS on views
    - Add policies for authenticated users to access their own data
*/

-- Create view for user subscriptions
CREATE OR REPLACE VIEW public.stripe_user_subscriptions AS
SELECT 
  sc.user_id,
  ss.subscription_id,
  ss.price_id,
  ss.status,
  ss.current_period_start,
  ss.current_period_end,
  ss.cancel_at_period_end,
  ss.payment_method_brand,
  ss.payment_method_last4,
  ss.created_at
FROM public.stripe_customers sc
JOIN public.stripe_subscriptions ss ON sc.customer_id = ss.customer_id
WHERE sc.deleted_at IS NULL;

-- Create view for user orders
CREATE OR REPLACE VIEW public.stripe_user_orders AS
SELECT 
  sc.user_id,
  so.checkout_session_id,
  so.payment_intent_id,
  so.amount_subtotal,
  so.amount_total,
  so.currency,
  so.payment_status,
  so.status,
  so.order_date
FROM public.stripe_customers sc
JOIN public.stripe_orders so ON sc.customer_id = so.customer_id
WHERE sc.deleted_at IS NULL;

-- Enable RLS on views
ALTER VIEW public.stripe_user_subscriptions SET (security_barrier = true);
ALTER VIEW public.stripe_user_orders SET (security_barrier = true);

-- Create policies for views
CREATE POLICY "Users can view own subscription data via view"
  ON public.stripe_user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own order data via view"
  ON public.stripe_user_orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);