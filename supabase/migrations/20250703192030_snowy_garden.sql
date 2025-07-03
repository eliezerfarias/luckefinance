/*
  # Configuração Inicial do Banco de Dados - Lucke Finance
  
  Esta migração cria toda a estrutura inicial do banco de dados para o Lucke Finance.
  
  ## Tabelas Criadas:
  1. **profiles** - Perfis de usuário (ligada a auth.users)
  2. **transactions** - Transações financeiras
  3. **financial_goals** - Metas financeiras
  4. **debt_agreements** - Acordos de dívida
  5. **categories** - Categorias personalizadas
  6. **ai_suggestions** - Sugestões da IA
  7. **stripe_customers** - Dados de clientes Stripe
  8. **stripe_subscriptions** - Assinaturas Stripe
  9. **stripe_orders** - Pedidos Stripe
  
  ## Segurança:
  - RLS habilitado em todas as tabelas
  - Políticas de segurança para cada usuário acessar apenas seus dados
  - Trigger automático para criação de perfil
*/

-- =====================================================
-- 1. TABELA DE PERFIS (DEVE SER A PRIMEIRA)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text,
  username text UNIQUE,
  nickname text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- =====================================================
-- 2. FUNÇÃO E TRIGGER PARA CRIAÇÃO AUTOMÁTICA DE PERFIL
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, nickname)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', ''),
    COALESCE(new.raw_user_meta_data->>'nickname', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- 3. TABELA DE TRANSAÇÕES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  date date NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'late')),
  recurring text NOT NULL CHECK (recurring IN ('one-time', 'recurring')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own transactions"
  ON public.transactions
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 4. TABELA DE METAS FINANCEIRAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text,
  target numeric NOT NULL DEFAULT 0 CHECK (target >= 0),
  current numeric NOT NULL DEFAULT 0 CHECK (current >= 0),
  period text NOT NULL CHECK (period IN ('weekly', 'monthly', 'yearly')),
  deadline date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals"
  ON public.financial_goals
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 5. TABELA DE ACORDOS DE DÍVIDA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.debt_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  total_amount numeric NOT NULL CHECK (total_amount > 0),
  installments integer NOT NULL CHECK (installments > 0),
  start_date date NOT NULL,
  notes text,
  status text NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')) DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.debt_agreements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own agreements"
  ON public.debt_agreements
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 6. TABELA DE CATEGORIAS PERSONALIZADAS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('income', 'expense')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, name, type)
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own categories"
  ON public.categories
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- 7. TABELA DE SUGESTÕES DA IA
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- =====================================================
-- 8. TABELAS DO STRIPE
-- =====================================================

-- Clientes Stripe
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

-- Assinaturas Stripe
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

-- Pedidos Stripe
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

-- =====================================================
-- 9. VIEWS PARA FACILITAR CONSULTAS DO STRIPE
-- =====================================================

-- View para assinaturas do usuário
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

-- View para pedidos do usuário
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

-- =====================================================
-- 10. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON public.transactions(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_debt_agreements_user_status ON public.debt_agreements(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_created ON public.ai_suggestions(user_id, created_at DESC);

-- =====================================================
-- 11. COMENTÁRIOS FINAIS
-- =====================================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuário com dados adicionais';
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários';
COMMENT ON TABLE public.financial_goals IS 'Metas financeiras dos usuários';
COMMENT ON TABLE public.debt_agreements IS 'Acordos de dívida e parcelamentos';
COMMENT ON TABLE public.categories IS 'Categorias personalizadas por usuário';
COMMENT ON TABLE public.ai_suggestions IS 'Sugestões geradas pela IA financeira';