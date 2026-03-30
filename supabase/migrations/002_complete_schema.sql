-- ============================================
-- MIGRATION: Complete Schema for Sync
-- ============================================

-- ============================================
-- 1. Update customers table - add missing fields
-- ============================================

ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS satisfaction JSONB;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tec_service_id UUID;

-- ============================================
-- 2. Update tec_services table - fix status values
-- ============================================

ALTER TABLE tec_services DROP CONSTRAINT IF EXISTS tec_services_status_check;
ALTER TABLE tec_services ADD CONSTRAINT tec_services_status_check 
  CHECK (status IN ('pendente', 'designado', 'em_andamento', 'finalizado', 'cancelado'));

ALTER TABLE tec_services ALTER COLUMN status SET DEFAULT 'pendente';

-- Add missing columns
ALTER TABLE tec_services ADD COLUMN IF NOT EXISTS service_type TEXT;
ALTER TABLE tec_services ADD COLUMN IF NOT EXISTS observations TEXT;

-- ============================================
-- 3. Update tec_technicians table - add cpf field
-- ============================================

ALTER TABLE tec_technicians ADD COLUMN IF NOT EXISTS cpf TEXT;

-- ============================================
-- 4. Enable Realtime for all tables
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE customers;
ALTER PUBLICATION supabase_realtime ADD TABLE tec_technicians;
ALTER PUBLICATION supabase_realtime ADD TABLE tec_services;

-- ============================================
-- 5. Update RLS Policies for full access
-- ============================================

-- Customers table - allow all operations
DROP POLICY IF EXISTS "Allow public read customers" ON customers;
DROP POLICY IF EXISTS "Allow public insert customers" ON customers;
DROP POLICY IF EXISTS "Allow public update customers" ON customers;
DROP POLICY IF EXISTS "Allow public delete customers" ON customers;

CREATE POLICY "Allow public read customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow public insert customers" ON customers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update customers" ON customers FOR UPDATE USING (true);
CREATE POLICY "Allow public delete customers" ON customers FOR DELETE USING (true);

-- tec_technicians table - allow all operations
DROP POLICY IF EXISTS "Allow public read tecnicos" ON tec_technicians;
DROP POLICY IF EXISTS "Allow public insert tecnicos" ON tec_technicians;
DROP POLICY IF EXISTS "Allow public update tecnicos" ON tec_technicians;
DROP POLICY IF EXISTS "Allow public delete tecnicos" ON tec_technicians;

CREATE POLICY "Allow public read tecnicos" ON tec_technicians FOR SELECT USING (true);
CREATE POLICY "Allow public insert tecnicos" ON tec_technicians FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update tecnicos" ON tec_technicians FOR UPDATE USING (true);
CREATE POLICY "Allow public delete tecnicos" ON tec_technicians FOR DELETE USING (true);

-- tec_services table - allow all operations
DROP POLICY IF EXISTS "Allow public read services" ON tec_services;
DROP POLICY IF EXISTS "Allow public insert services" ON tec_services;
DROP POLICY IF EXISTS "Allow public update services" ON tec_services;
DROP POLICY IF EXISTS "Allow public delete services" ON tec_services;

CREATE POLICY "Allow public read services" ON tec_services FOR SELECT USING (true);
CREATE POLICY "Allow public insert services" ON tec_services FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update services" ON tec_services FOR UPDATE USING (true);
CREATE POLICY "Allow public delete services" ON tec_services FOR DELETE USING (true);

-- crm_users table - allow all operations
DROP POLICY IF EXISTS "Allow public read users" ON crm_users;
DROP POLICY IF EXISTS "Allow public insert users" ON crm_users;
DROP POLICY IF EXISTS "Allow public update users" ON crm_users;
DROP POLICY IF EXISTS "Allow public delete users" ON crm_users;

CREATE POLICY "Allow public read users" ON crm_users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON crm_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON crm_users FOR UPDATE USING (true);
CREATE POLICY "Allow public delete users" ON crm_users FOR DELETE USING (true);

-- ============================================
-- 6. Create indexes for better performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_created ON customers(created_at DESC);

-- ============================================
-- 7. Create a default admin user if none exists
-- ============================================

INSERT INTO crm_users (id, name, email, password, role, active, created_at)
SELECT 
  'admin-001',
  'Administrador',
  'admin@rastremix.com',
  'Rastremix2024!',
  'admin',
  true,
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM crm_users WHERE email = 'admin@rastremix.com');

-- ============================================
-- 8. Enable RLS on all tables
-- ============================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_technicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- DONE
-- ============================================
