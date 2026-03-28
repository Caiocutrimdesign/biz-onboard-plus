-- ============================================
-- WESALES CRM SYNC TABLES
-- ============================================

-- Tabela de clientes sincronizados com WeSales
CREATE TABLE IF NOT EXISTS wesales_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE NOT NULL,
  we_sales_lead_id VARCHAR(255),
  we_sales_deal_id VARCHAR(255),
  synced_at TIMESTAMP WITH TIME ZONE,
  sync_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de sincronização
CREATE TABLE IF NOT EXISTS wesales_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  we_sales_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  last_attempt TIMESTAMP WITH TIME ZONE,
  error TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de webhooks recebidos
CREATE TABLE IF NOT EXISTS wesales_webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event VARCHAR(100) NOT NULL,
  data JSONB,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE
);

-- Tabela de configuração
CREATE TABLE IF NOT EXISTS wesales_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para buscar clientes pendentes
CREATE INDEX IF NOT EXISTS idx_wesales_customers_sync_status ON wesales_customers(sync_status);
CREATE INDEX IF NOT EXISTS idx_wesales_sync_logs_status ON wesales_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_wesales_sync_logs_attempts ON wesales_sync_logs(attempts) WHERE status = 'failed';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_wesales_customers_updated_at
  BEFORE UPDATE ON wesales_customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Adicionar coluna wesales_synced na tabela customers (se não existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'customers' AND column_name = 'wesales_synced'
  ) THEN
    ALTER TABLE customers ADD COLUMN wesales_synced BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================
-- GPS TRACKING TABLES
-- ============================================

-- Tabela de dispositivos GPS
CREATE TABLE IF NOT EXISTS gps_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imei VARCHAR(50) UNIQUE NOT NULL,
  model VARCHAR(100),
  protocol VARCHAR(50),
  vehicle_id UUID REFERENCES vehicles(id),
  status VARCHAR(50) DEFAULT 'online',
  last_position JSONB,
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de posições GPS
CREATE TABLE IF NOT EXISTS gps_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES gps_devices(id),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  speed DECIMAL(6, 2),
  heading DECIMAL(5, 2),
  ignition BOOLEAN DEFAULT FALSE,
  battery DECIMAL(5, 2),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de veículos (com rastreador)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  plate VARCHAR(20),
  brand VARCHAR(100),
  model VARCHAR(100),
  year VARCHAR(10),
  color VARCHAR(50),
  type VARCHAR(50),
  renavam VARCHAR(50),
  chassis VARCHAR(100),
  device_imei VARCHAR(50) REFERENCES gps_devices(imei),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de geofences
CREATE TABLE IF NOT EXISTS geofences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'circle',
  center_lat DECIMAL(10, 8),
  center_lng DECIMAL(11, 8),
  radius INTEGER,
  polygon JSONB,
  color VARCHAR(20),
  alert_entry BOOLEAN DEFAULT TRUE,
  alert_exit BOOLEAN DEFAULT TRUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de eventos de geofence
CREATE TABLE IF NOT EXISTS geofence_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  geofence_id UUID REFERENCES geofences(id),
  event_type VARCHAR(50) NOT NULL,
  location JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de alertas GPS
CREATE TABLE IF NOT EXISTS gps_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  device_id UUID REFERENCES gps_devices(id),
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  message TEXT,
  location JSONB,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de comandos para dispositivos
CREATE TABLE IF NOT EXISTS device_commands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES gps_devices(id),
  vehicle_id UUID REFERENCES vehicles(id),
  command VARCHAR(100) NOT NULL,
  params JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de bloqueio de veículos
CREATE TABLE IF NOT EXISTS vehicle_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  device_id UUID REFERENCES gps_devices(id),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  requested_by UUID,
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  executed_at TIMESTAMP WITH TIME ZONE,
  reason TEXT,
  safety_check JSONB
);

-- Tabela de rotas
CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  distance DECIMAL(10, 2),
  duration INTEGER,
  max_speed DECIMAL(6, 2),
  avg_speed DECIMAL(6, 2),
  idle_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_gps_positions_device ON gps_positions(device_id);
CREATE INDEX IF NOT EXISTS idx_gps_positions_timestamp ON gps_positions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_gps_alerts_vehicle ON gps_alerts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_gps_alerts_created ON gps_alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vehicle_blocks_status ON vehicle_blocks(status);

-- ============================================
-- GPS ANALYTICS TABLES
-- ============================================

-- Tabela de analytics diários
CREATE TABLE IF NOT EXISTS gps_daily_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES vehicles(id),
  date DATE NOT NULL,
  total_distance DECIMAL(10, 2) DEFAULT 0,
  total_time INTEGER DEFAULT 0,
  moving_time INTEGER DEFAULT 0,
  idle_time INTEGER DEFAULT 0,
  max_speed DECIMAL(6, 2),
  avg_speed DECIMAL(6, 2),
  fuel_estimate DECIMAL(10, 2),
  speeding_events INTEGER DEFAULT 0,
  harsh_braking INTEGER DEFAULT 0,
  idle_events INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(vehicle_id, date)
);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE wesales_customers IS 'Clientes sincronizados com WeSales CRM';
COMMENT ON TABLE wesales_sync_logs IS 'Logs de sincronização com WeSales';
COMMENT ON TABLE gps_devices IS 'Dispositivos GPS rastreadores';
COMMENT ON TABLE gps_positions IS 'Posições GPS dos dispositivos';
COMMENT ON TABLE vehicles IS 'Veículos com rastreador';
COMMENT ON TABLE geofences IS 'Cercas virtuais';
