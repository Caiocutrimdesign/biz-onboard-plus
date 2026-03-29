-- ============================================
-- CRM USERS TABLE - SECURITY MIGRATION
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Create crm_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS crm_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user', 'viewer')),
  avatar_url TEXT,
  phone TEXT,
  department TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in_at TIMESTAMPTZ
);

-- 2. Enable Row Level Security
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;

-- 3. Create policies

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON crm_users FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON crm_users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON crm_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON crm_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Admins can insert new users
CREATE POLICY "Admins can insert users"
  ON crm_users FOR INSERT
  WITH CHECK (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete users
CREATE POLICY "Admins can delete users"
  ON crm_users FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.crm_users (id, email, name, role, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger to auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Create index for better performance
CREATE INDEX IF NOT EXISTS idx_crm_users_email ON crm_users(email);
CREATE INDEX IF NOT EXISTS idx_crm_users_role ON crm_users(role);
CREATE INDEX IF NOT EXISTS idx_crm_users_active ON crm_users(active);

-- ============================================
-- CUSTOMERS TABLE - SECURITY MIGRATION
-- ============================================

-- 1. Enable RLS on customers table if exists
ALTER TABLE IF EXISTS customers ENABLE ROW LEVEL SECURITY;

-- 2. Create policies for customers

-- Policy: All authenticated users can view customers (for demo)
CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

-- Policy: All authenticated users can insert customers
CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: All authenticated users can update customers
CREATE POLICY "Authenticated users can update customers"
  ON customers FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- LEADS TABLE - SECURITY MIGRATION
-- ============================================

-- 1. Create leads table if it doesn't exist
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  company TEXT,
  document TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'qualificado', 'proposta', 'negociacao', 'ganho', 'perdido')),
  source TEXT DEFAULT 'website' CHECK (source IN ('website', 'facebook', 'instagram', 'google_ads', 'indicacao', 'telefone', 'feira', 'outro')),
  priority TEXT DEFAULT 'media' CHECK (priority IN ('baixa', 'media', 'alta', 'urgente')),
  value NUMERIC(12,2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  owner_id UUID REFERENCES auth.users(id),
  pipeline_id UUID,
  stage_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_contact_at TIMESTAMPTZ,
  next_contact_at TIMESTAMPTZ
);

-- 2. Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 3. Create policies for leads

-- Policy: Users can view leads they own or are admins
CREATE POLICY "Users can view own leads"
  ON leads FOR SELECT
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Users can insert leads
CREATE POLICY "Users can insert leads"
  ON leads FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Policy: Users can update their own leads
CREATE POLICY "Users can update own leads"
  ON leads FOR UPDATE
  USING (
    owner_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Policy: Only admins can delete leads
CREATE POLICY "Admins can delete leads"
  ON leads FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Create indexes for leads
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- ============================================
-- WEBSALES SYNC LOGS TABLE - SECURITY
-- ============================================

CREATE TABLE IF NOT EXISTS wesales_sync_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  lead_id UUID REFERENCES leads(id),
  type TEXT NOT NULL CHECK (type IN ('customer', 'lead')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE wesales_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage sync logs"
  ON wesales_sync_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM crm_users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CLEANUP AND VERIFICATION
-- ============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
