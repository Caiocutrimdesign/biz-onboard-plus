-- =====================================================
-- ADIÇÃO DE CAMPOS PARA GOOGLE MAPS PLATFORM (GMP)
-- =====================================================

ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS distance_to_base NUMERIC(10, 2);

COMMENT ON COLUMN usuarios.latitude IS 'Latitude obtida via Google Geocoding/Address Validation';
COMMENT ON COLUMN usuarios.longitude IS 'Longitude obtida via Google Geocoding/Address Validation';
COMMENT ON COLUMN usuarios.distance_to_base IS 'Distância em km até a base operacional (Logística Vale/Equatorial)';
