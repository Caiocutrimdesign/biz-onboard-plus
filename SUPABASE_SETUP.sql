-- =====================================================
-- SCRIPT SQL CORRIGIDO PARA RASTRAMIX CRM
-- Execute no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. TABELA DE CLIENTES (customers)
-- =====================================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  phone TEXT,
  cpf_cnpj TEXT,
  email TEXT,
  cep TEXT,
  street TEXT,
  number TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  vehicle_type TEXT,
  plate TEXT,
  brand TEXT,
  model TEXT,
  year TEXT,
  color TEXT,
  plan TEXT,
  payment_method TEXT,
  technician_id UUID,
  technician_name TEXT,
  status TEXT DEFAULT 'novo_cadastro',
  notes TEXT,
  preferred_contact_time TEXT,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABELA DE TÉCNICOS (tecnicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS tecnicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tipo TEXT DEFAULT 'tecnico',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE SERVIÇOS (servicos)
-- =====================================================
CREATE TABLE IF NOT EXISTS tec_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES tecnicos(id) ON DELETE SET NULL,
  technician_name TEXT,
  customer_name TEXT,
  customer_phone TEXT,
  customer_address TEXT,
  vehicle_plate TEXT,
  vehicle_model TEXT,
  service_type TEXT,
  status TEXT DEFAULT 'pendente',
  scheduled_date DATE,
  scheduled_time TIME,
  notes TEXT,
  photos_inicio JSONB DEFAULT '[]',
  photos_fim JSONB DEFAULT '[]',
  signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ
);

-- =====================================================
-- 4. TABELA DE LEADS (CRM)
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  document TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  status TEXT DEFAULT 'novo',
  source TEXT DEFAULT 'website',
  priority TEXT DEFAULT 'media',
  value NUMERIC DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  owner_id UUID,
  pipeline_id TEXT DEFAULT 'default',
  stage_id TEXT DEFAULT 'stage-1',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TABELA DE ANIVERSARIANTES (birthdays)
-- =====================================================
CREATE TABLE IF NOT EXISTS birthdays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  customer_name TEXT,
  birth_date DATE,
  phone TEXT,
  email TEXT,
  message_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. TABELA DE CONFIGURAÇÕES (settings)
-- =====================================================
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. ADICIONAR COLUNA 'active' SE NÃO EXISTIR
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tecnicos' AND column_name = 'active'
  ) THEN
    ALTER TABLE tecnicos ADD COLUMN active BOOLEAN DEFAULT true;
  END IF;
END $$;

-- =====================================================
-- 8. CRIAÇÃO DE ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_plate ON customers(plate);
CREATE INDEX IF NOT EXISTS idx_tecnicos_active ON tecnicos(active);
CREATE INDEX IF NOT EXISTS idx_services_status ON tec_services(status);
CREATE INDEX IF NOT EXISTS idx_services_technician ON tec_services(technician_id);
CREATE INDEX IF NOT EXISTS idx_services_customer ON tec_services(customer_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_birthdays_date ON birthdays(birth_date);

-- =====================================================
-- 9. POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Políticas para customers
DROP POLICY IF EXISTS "allow_all_customers_select" ON customers;
CREATE POLICY "allow_all_customers_select" ON customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "allow_all_customers_insert" ON customers;
CREATE POLICY "allow_all_customers_insert" ON customers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_customers_update" ON customers;
CREATE POLICY "allow_all_customers_update" ON customers FOR UPDATE USING (true);
DROP POLICY IF EXISTS "allow_all_customers_delete" ON customers;
CREATE POLICY "allow_all_customers_delete" ON customers FOR DELETE USING (true);

-- Políticas para tecnicos
DROP POLICY IF EXISTS "allow_all_tecnicos_select" ON tecnicos;
CREATE POLICY "allow_all_tecnicos_select" ON tecnicos FOR SELECT USING (true);
DROP POLICY IF EXISTS "allow_all_tecnicos_insert" ON tecnicos;
CREATE POLICY "allow_all_tecnicos_insert" ON tecnicos FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_tecnicos_update" ON tecnicos;
CREATE POLICY "allow_all_tecnicos_update" ON tecnicos FOR UPDATE USING (true);
DROP POLICY IF EXISTS "allow_all_tecnicos_delete" ON tecnicos;
CREATE POLICY "allow_all_tecnicos_delete" ON tecnicos FOR DELETE USING (true);

-- Políticas para services
DROP POLICY IF EXISTS "allow_all_services_select" ON tec_services;
CREATE POLICY "allow_all_services_select" ON tec_services FOR SELECT USING (true);
DROP POLICY IF EXISTS "allow_all_services_insert" ON tec_services;
CREATE POLICY "allow_all_services_insert" ON tec_services FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_services_update" ON tec_services;
CREATE POLICY "allow_all_services_update" ON tec_services FOR UPDATE USING (true);
DROP POLICY IF EXISTS "allow_all_services_delete" ON tec_services;
CREATE POLICY "allow_all_services_delete" ON tec_services FOR DELETE USING (true);

-- Políticas para leads
DROP POLICY IF EXISTS "allow_all_leads_select" ON leads;
CREATE POLICY "allow_all_leads_select" ON leads FOR SELECT USING (true);
DROP POLICY IF EXISTS "allow_all_leads_insert" ON leads;
CREATE POLICY "allow_all_leads_insert" ON leads FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_leads_update" ON leads;
CREATE POLICY "allow_all_leads_update" ON leads FOR UPDATE USING (true);
DROP POLICY IF EXISTS "allow_all_leads_delete" ON leads;
CREATE POLICY "allow_all_leads_delete" ON leads FOR DELETE USING (true);

-- =====================================================
-- 10. FUNÇÕES E TRIGGERS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS update_customers_updated_at ON customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tecnicos_updated_at ON tecnicos;
CREATE TRIGGER update_tecnicos_updated_at
  BEFORE UPDATE ON tecnicos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON tec_services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON tec_services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 11. VERIFICAÇÃO
-- =====================================================
SELECT '✅ Setup completo!' as status;

SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
