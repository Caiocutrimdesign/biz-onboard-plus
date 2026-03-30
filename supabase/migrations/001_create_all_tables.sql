-- ============================================
-- MIGRATION: Create ALL Tables for Sync
-- ============================================

-- ============================================
-- 1. Create crm_users table (if not exists)
-- ============================================

CREATE TABLE IF NOT EXISTS crm_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'technician')),
  phone TEXT,
  avatar TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  online BOOLEAN DEFAULT false,
  must_change_password BOOLEAN DEFAULT false
);

-- ============================================
-- 2. Create customers table
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
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
  renavam TEXT,
  chassis TEXT,
  plan TEXT,
  payment_method TEXT,
  status TEXT DEFAULT 'novo_cadastro',
  notes TEXT,
  satisfaction JSONB,
  tec_service_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. Create tec_technicians table
-- ============================================

CREATE TABLE IF NOT EXISTS tec_technicians (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  cpf TEXT,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. Create tec_services table
-- ============================================

CREATE TABLE IF NOT EXISTS tec_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  technician_id TEXT NOT NULL,
  technician_name TEXT,
  vehicle TEXT NOT NULL,
  plate TEXT NOT NULL,
  service_type TEXT NOT NULL DEFAULT 'instalacao',
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'designado', 'em_andamento', 'finalizado', 'cancelado')),
  observations TEXT,
  signature TEXT,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. Create tec_service_photos table
-- ============================================

CREATE TABLE IF NOT EXISTS tec_service_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES tec_services(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('antes', 'durante', 'depois')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. Create tec_service_signatures table
-- ============================================

CREATE TABLE IF NOT EXISTS tec_service_signatures (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID REFERENCES tec_services(id) ON DELETE CASCADE NOT NULL,
  signature_url TEXT NOT NULL,
  signed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 7. Create leads table
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
  value DECIMAL(12, 2) DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  notes TEXT DEFAULT '',
  owner_id UUID REFERENCES crm_users(id),
  pipeline_id TEXT DEFAULT 'default',
  stage_id TEXT DEFAULT 'stage-1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact_at TIMESTAMP WITH TIME ZONE,
  next_contact_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 8. Create pipelines and stages
-- ============================================

CREATE TABLE IF NOT EXISTS pipelines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_stages (
  id TEXT PRIMARY KEY,
  pipeline_id TEXT REFERENCES pipelines(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  order_index INTEGER DEFAULT 0,
  probability INTEGER DEFAULT 0,
  is_final BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pipeline
INSERT INTO pipelines (id, name, description, is_default)
VALUES ('default', 'Pipeline de Vendas', 'Pipeline padrão', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO pipeline_stages (id, pipeline_id, name, color, order_index, probability, is_final) VALUES
('stage-1', 'default', 'Novo Lead', '#3B82F6', 0, 10, false),
('stage-2', 'default', 'Contatado', '#8B5CF6', 1, 20, false),
('stage-3', 'default', 'Qualificado', '#06B6D4', 2, 40, false),
('stage-4', 'default', 'Proposta', '#F59E0B', 3, 60, false),
('stage-5', 'default', 'Negociação', '#F97316', 4, 80, false),
('stage-6', 'default', 'Ganho', '#22C55E', 5, 100, true),
('stage-7', 'default', 'Perdido', '#EF4444', 6, 0, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO tags (name, color) VALUES
('Quente', '#EF4444'),
('Frio', '#3B82F6'),
('VIP', '#F59E0B'),
('Em negócio', '#22C55E'),
('Aguardando', '#8B5CF6')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 9. Create indexes
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_tec_services_status ON tec_services(status);
CREATE INDEX IF NOT EXISTS idx_tec_services_technician ON tec_services(technician_id);
CREATE INDEX IF NOT EXISTS idx_tec_services_created ON tec_services(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_owner ON leads(owner_id);

-- ============================================
-- 10. Enable Realtime
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE tec_technicians;
ALTER PUBLICATION supabase_realtime ADD TABLE tec_services;
ALTER PUBLICATION supabase_realtime ADD TABLE crm_users;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- ============================================
-- 11. Enable RLS on all tables
-- ============================================

ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_service_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_service_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 12. Create RLS Policies - FULL ACCESS
-- ============================================

-- crm_users
CREATE POLICY "Allow public read crm_users" ON crm_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert crm_users" ON crm_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update crm_users" ON crm_users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete crm_users" ON crm_users FOR DELETE USING (true);

-- customers
CREATE POLICY "Allow public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete customers" ON customers FOR DELETE USING (true);

-- tec_technicians
CREATE POLICY "Allow public read tec_technicians" ON tec_technicians FOR SELECT USING (true);
CREATE POLICY "Allow public insert tec_technicians" ON tec_technicians FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tec_technicians" ON tec_technicians FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tec_technicians" ON tec_technicians FOR DELETE USING (true);

-- tec_services
CREATE POLICY "Allow public read tec_services" ON tec_services FOR SELECT USING (true);
CREATE POLICY "Allow public insert tec_services" ON tec_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tec_services" ON tec_services FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tec_services" ON tec_services FOR DELETE USING (true);

-- tec_service_photos
CREATE POLICY "Allow public read tec_service_photos" ON tec_service_photos FOR SELECT USING (true);
CREATE POLICY "Allow public insert tec_service_photos" ON tec_service_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tec_service_photos" ON tec_service_photos FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tec_service_photos" ON tec_service_photos FOR DELETE USING (true);

-- tec_service_signatures
CREATE POLICY "Allow public read tec_service_signatures" ON tec_service_signatures FOR SELECT USING (true);
CREATE POLICY "Allow public insert tec_service_signatures" ON tec_service_signatures FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tec_service_signatures" ON tec_service_signatures FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tec_service_signatures" ON tec_service_signatures FOR DELETE USING (true);

-- leads
CREATE POLICY "Allow public read leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow public insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update leads" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete leads" ON leads FOR DELETE USING (true);

-- pipelines
CREATE POLICY "Allow public read pipelines" ON pipelines FOR SELECT USING (true);
CREATE POLICY "Allow public insert pipelines" ON pipelines FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update pipelines" ON pipelines FOR UPDATE USING (true);
CREATE POLICY "Allow public delete pipelines" ON pipelines FOR DELETE USING (true);

-- pipeline_stages
CREATE POLICY "Allow public read pipeline_stages" ON pipeline_stages FOR SELECT USING (true);
CREATE POLICY "Allow public insert pipeline_stages" ON pipeline_stages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update pipeline_stages" ON pipeline_stages FOR UPDATE USING (true);
CREATE POLICY "Allow public delete pipeline_stages" ON pipeline_stages FOR DELETE USING (true);

-- tags
CREATE POLICY "Allow public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Allow public insert tags" ON tags FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tags" ON tags FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tags" ON tags FOR DELETE USING (true);

-- ============================================
-- 13. Create default admin user
-- ============================================

INSERT INTO crm_users (id, name, email, password, role, active, created_at)
SELECT 'admin-001', 'Administrador', 'admin@rastremix.com', 'Rastremix2024!', 'admin', true, NOW()
WHERE NOT EXISTS (SELECT 1 FROM crm_users WHERE email = 'admin@rastremix.com');

-- ============================================
-- DONE!
-- ============================================
