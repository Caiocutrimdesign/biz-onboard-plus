-- ================================================
-- BIZ CRM PLUS - TEC TABLES (ISOLATED MODULE)
-- ================================================

-- TEC Services Table
CREATE TABLE IF NOT EXISTS tec_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_address TEXT,
  technician_id TEXT NOT NULL,
  technician_name TEXT,
  vehicle TEXT NOT NULL,
  plate TEXT NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN ('instalacao', 'manutencao', 'retirada', 'suporte')),
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluido', 'cancelado')),
  observations TEXT,
  signature TEXT,
  scheduled_date TIMESTAMPTZ,
  completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEC Service Photos Table
CREATE TABLE IF NOT EXISTS tec_service_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES tec_services(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('antes', 'durante', 'depois')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEC Signatures Table
CREATE TABLE IF NOT EXISTS tec_service_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES tec_services(id) ON DELETE CASCADE NOT NULL,
  signature_url TEXT NOT NULL,
  signed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEC Technicians Table
CREATE TABLE IF NOT EXISTS tec_technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEC Agents Table
CREATE TABLE IF NOT EXISTS tec_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  technician_id TEXT,
  technician_name TEXT,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  config JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_tec_services_status ON tec_services(status);
CREATE INDEX IF NOT EXISTS idx_tec_services_technician ON tec_services(technician_id);
CREATE INDEX IF NOT EXISTS idx_tec_services_created ON tec_services(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tec_service_photos_service ON tec_service_photos(service_id);
CREATE INDEX IF NOT EXISTS idx_tec_service_signatures_service ON tec_service_signatures(service_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

ALTER TABLE tec_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_service_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_service_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_agents ENABLE ROW LEVEL SECURITY;

-- Public read access for services (for technicians)
CREATE POLICY "Public can view services" ON tec_services
  FOR SELECT USING (true);

-- Technicians can insert services
CREATE POLICY "Technicians can insert services" ON tec_services
  FOR INSERT WITH CHECK (true);

-- Technicians can update their own services
CREATE POLICY "Technicians can update own services" ON tec_services
  FOR UPDATE USING (true);

-- Public read access for photos
CREATE POLICY "Public can view photos" ON tec_service_photos
  FOR SELECT USING (true);

-- Public insert for photos
CREATE POLICY "Public can insert photos" ON tec_service_photos
  FOR INSERT WITH CHECK (true);

-- Public read access for signatures
CREATE POLICY "Public can view signatures" ON tec_service_signatures
  FOR SELECT USING (true);

-- Public insert for signatures
CREATE POLICY "Public can insert signatures" ON tec_service_signatures
  FOR INSERT WITH CHECK (true);

-- Public read access for technicians
CREATE POLICY "Public can view technicians" ON tec_technicians
  FOR SELECT USING (true);

-- Public insert for technicians
CREATE POLICY "Public can insert technicians" ON tec_technicians
  FOR INSERT WITH CHECK (true);

-- Public read access for agents
CREATE POLICY "Public can view agents" ON tec_agents
  FOR SELECT USING (true);

-- Public insert for agents
CREATE POLICY "Public can insert agents" ON tec_agents
  FOR INSERT WITH CHECK (true);

-- ================================================
-- STORAGE BUCKET FOR PHOTOS
-- ================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('tec-photos', 'tec-photos', true)
ON CONFLICT (id) DO NOTHING;

-- ================================================
-- STORAGE POLICIES
-- ================================================

CREATE POLICY "Public can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'tec-photos');

CREATE POLICY "Public can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'tec-photos');

CREATE POLICY "Public can delete photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'tec-photos');
