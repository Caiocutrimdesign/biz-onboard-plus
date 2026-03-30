-- ============================================
-- MIGRATION: Add Technician Columns to Customers
-- ============================================

-- Add columns to link customers directly to technicians in the CRM
ALTER TABLE customers ADD COLUMN IF NOT EXISTS technician_id TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS technician_name TEXT;

-- Add index for performance in CRM filtering
CREATE INDEX IF NOT EXISTS idx_customers_technician ON customers(technician_id);

-- Update RLS (Policies already exist as "Allow public read/update customers", 
-- so no new policies are strictly required, but ensuring they are there)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'customers' AND policyname = 'Allow public update customers'
    ) THEN
        CREATE POLICY "Allow public update customers" ON customers FOR UPDATE USING (true);
    END IF;
END $$;
