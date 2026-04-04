-- =====================================================
-- CRIAÇÃO DA TABELA DE USUÁRIOS (usuarios)
-- Execute no Supabase SQL Editor
-- =====================================================

-- Função para atualizar o updated_at (caso não exista)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Aba PRINCIPAL
  status TEXT DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  login_email TEXT UNIQUE NOT NULL,
  group_name TEXT DEFAULT 'Usuário',
  device_limit INTEGER DEFAULT 0,
  expiration_date DATE,
  password TEXT, -- Senha (pode ser usada para sincronia legada)
  
  -- Aba CLIENTE
  document TEXT, -- CPF/CNPJ
  full_name TEXT NOT NULL,
  rg TEXT,
  birth_date DATE,
  zip_code TEXT,
  address TEXT,
  address_number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT,
  cellphone TEXT,
  monthly_value NUMERIC(10,2) DEFAULT 0,
  fixed_phone TEXT,
  due_day INTEGER,
  billing_email TEXT,
  income NUMERIC(15,2) DEFAULT 0,
  support_phone TEXT,
  admin_notes TEXT,
  
  -- Aba PERMISSÕES
  permissions JSONB DEFAULT '{
    "dispositivos": {"view": true, "edit": true, "delete": false},
    "alertas": {"view": true, "edit": true, "delete": true},
    "cercas": {"view": true, "edit": true, "delete": true},
    "relatorios": {"view": true, "edit": true, "delete": true},
    "comandos": {"view": true, "edit": false, "delete": false},
    "historico_api": {"view": true, "edit": false, "delete": true},
    "compartilhar_localizacao": {"view": true, "edit": true, "delete": true},
    "servicos": {"view": false, "edit": false, "delete": false},
    "imei": {"view": false, "edit": false, "delete": false}
  }'::JSONB,
  
  -- Controle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(login_email);
CREATE INDEX IF NOT EXISTS idx_usuarios_document ON usuarios(document);
CREATE INDEX IF NOT EXISTS idx_usuarios_full_name ON usuarios(full_name);

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política simples: Usuários autenticados podem ver e editar tudo (ajuste conforme necessário)
DROP POLICY IF EXISTS "Allow all actions for authenticated users" ON usuarios;
CREATE POLICY "Allow all actions for authenticated users" ON usuarios FOR ALL USING (auth.role() = 'authenticated');

-- Trigger para atualizar o updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
