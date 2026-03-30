-- ============================================
-- BIZ CRM PLUS - SUPABASE SCHEMA
-- Updated: 30/03/2026
-- ============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STORAGE BUCKETS
-- ============================================

-- Create storage bucket for TEC photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tec-photos',
  'tec-photos',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- Create storage bucket for customer documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-docs',
  'customer-docs',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can upload to tec-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can view tec-photos" ON storage.objects;
DROP POLICY IF EXISTS "Public can upload to customer-docs" ON storage.objects;
DROP POLICY IF EXISTS "Public can view customer-docs" ON storage.objects;

-- TEC Photos policies
CREATE POLICY "Public can upload to tec-photos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'tec-photos');

CREATE POLICY "Public can view tec-photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'tec-photos');

CREATE POLICY "Public can update tec-photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'tec-photos')
WITH CHECK (bucket_id = 'tec-photos');

CREATE POLICY "Public can delete tec-photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'tec-photos');

-- Customer Docs policies
CREATE POLICY "Public can upload to customer-docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'customer-docs');

CREATE POLICY "Public can view customer-docs"
ON storage.objects FOR SELECT
USING (bucket_id = 'customer-docs');

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS crm_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  phone TEXT,
  avatar TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TEC SERVICES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS tec_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  technician_id TEXT,
  technician_name TEXT,
  type TEXT DEFAULT 'suporte' CHECK (type IN ('instalacao', 'manutencao', 'retirada', 'suporte', 'suporte_tecnico')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'designado', 'em_andamento', 'concluido', 'finalizado', 'cancelado')),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  vehicle TEXT,
  plate TEXT,
  observations TEXT,
  signature TEXT,
  photos JSONB DEFAULT '[]',
  localizacao_inicio TEXT,
  localizacao_fim TEXT,
  finalizado_por TEXT,
  checklist JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_tec_services_technician ON tec_services(technician_id);
CREATE INDEX IF NOT EXISTS idx_tec_services_status ON tec_services(status);
CREATE INDEX IF NOT EXISTS idx_tec_services_client ON tec_services(client_id);
CREATE INDEX IF NOT EXISTS idx_tec_services_scheduled ON tec_services(scheduled_date);

-- Enable RLS
ALTER TABLE tec_services ENABLE ROW LEVEL SECURITY;

-- Policies for tec_services (allow all operations for authenticated users)
CREATE POLICY "Enable read for authenticated users" ON tec_services
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON tec_services
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users" ON tec_services
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users" ON tec_services
  FOR DELETE USING (true);
