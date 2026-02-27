-- ============================================
-- Ejecuta este script en Supabase → SQL Editor
-- ============================================

-- 1. Super Admin: que laszlosierra2 tenga role = admin en la BD
--    (si en la BD tiene coordinator, el menú y la app ya lo tratan como admin;
--     este UPDATE hace que RLS y las APIs también lo reconozcan como admin)
UPDATE public.users
SET role = 'admin'
WHERE LOWER(TRIM(email)) = 'laszlosierra2@gmail.com';

-- ============================================
-- 2. Teléfono del conductor (para enviar WhatsApp al asignar)
-- ============================================
ALTER TABLE requests
ADD COLUMN IF NOT EXISTS driver_phone VARCHAR(20);

COMMENT ON COLUMN requests.driver_phone IS 'Teléfono del conductor asignado para enviar WhatsApp con los datos de la solicitud';
