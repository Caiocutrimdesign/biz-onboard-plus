-- =====================================================
-- SQL SEGURO PARA RLS - RASTRAMIX
-- NÃO APAGA DADOS EXISTENTES - APENAS ADICIONA RLS
-- Execute no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tecnicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tec_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLÍTICAS PERMISSIVAS (não quebram o front-end)
-- =====================================================

-- CUSTOMERS - Permite tudo (leitura, insert, update, delete)
DROP POLICY IF EXISTS "Permitir leitura customers" ON customers;
CREATE POLICY "Permitir leitura customers" ON customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insert customers" ON customers;
CREATE POLICY "Permitir insert customers" ON customers FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update customers" ON customers;
CREATE POLICY "Permitir update customers" ON customers FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir delete customers" ON customers;
CREATE POLICY "Permitir delete customers" ON customers FOR DELETE USING (true);

-- TECNICOS - Permite tudo
DROP POLICY IF EXISTS "Permitir leitura tecnicos" ON tecnicos;
CREATE POLICY "Permitir leitura tecnicos" ON tecnicos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insert tecnicos" ON tecnicos;
CREATE POLICY "Permitir insert tecnicos" ON tecnicos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update tecnicos" ON tecnicos;
CREATE POLICY "Permitir update tecnicos" ON tecnicos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir delete tecnicos" ON tecnicos;
CREATE POLICY "Permitir delete tecnicos" ON tecnicos FOR DELETE USING (true);

-- TEC_SERVICES - Permite tudo
DROP POLICY IF EXISTS "Permitir leitura services" ON tec_services;
CREATE POLICY "Permitir leitura services" ON tec_services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insert services" ON tec_services;
CREATE POLICY "Permitir insert services" ON tec_services FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update services" ON tec_services;
CREATE POLICY "Permitir update services" ON tec_services FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir delete services" ON tec_services;
CREATE POLICY "Permitir delete services" ON tec_services FOR DELETE USING (true);

-- LEADS - Permite tudo
DROP POLICY IF EXISTS "Permitir leitura leads" ON leads;
CREATE POLICY "Permitir leitura leads" ON leads FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insert leads" ON leads;
CREATE POLICY "Permitir insert leads" ON leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update leads" ON leads;
CREATE POLICY "Permitir update leads" ON leads FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir delete leads" ON leads;
CREATE POLICY "Permitir delete leads" ON leads FOR DELETE USING (true);

-- BIRTHDAYS - Permite tudo (se existir)
DROP POLICY IF EXISTS "Permitir leitura birthdays" ON birthdays;
CREATE POLICY "Permitir leitura birthdays" ON birthdays FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insert birthdays" ON birthdays;
CREATE POLICY "Permitir insert birthdays" ON birthdays FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update birthdays" ON birthdays;
CREATE POLICY "Permitir update birthdays" ON birthdays FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir delete birthdays" ON birthdays;
CREATE POLICY "Permitir delete birthdays" ON birthdays FOR DELETE USING (true);

-- SETTINGS - Permite tudo (se existir)
DROP POLICY IF EXISTS "Permitir leitura settings" ON settings;
CREATE POLICY "Permitir leitura settings" ON settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir insert settings" ON settings;
CREATE POLICY "Permitir insert settings" ON settings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir update settings" ON settings;
CREATE POLICY "Permitir update settings" ON settings FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Permitir delete settings" ON settings;
CREATE POLICY "Permitir delete settings" ON settings FOR DELETE USING (true);

-- =====================================================
-- 3. GARANTIR QUE AS COLUNAS EXISTAM
-- =====================================================

-- Adicionar coluna active na tecnicos se não existir
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
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);
CREATE INDEX IF NOT EXISTS idx_tecnicos_active ON tecnicos(active);
CREATE INDEX IF NOT EXISTS idx_services_status ON tec_services(status);
CREATE INDEX IF NOT EXISTS idx_services_technician ON tec_services(technician_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

-- =====================================================
-- 5. VERIFICAÇÃO
-- =====================================================
SELECT 
  'Tabela: ' || table_name || 
  ' - RLS: ' || rowsecurity ||
  ' - Políticas: ' || (
    SELECT COUNT(*) FROM pg_policies WHERE tablename = table_name
  ) as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;
