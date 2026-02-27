-- 005: Conductor (nombre) + auditoría más rica
-- Ejecutar en Supabase SQL Editor.

-- 1) Agregar nombre del conductor en solicitudes
ALTER TABLE requests
  ADD COLUMN IF NOT EXISTS driver_name VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_requests_driver_phone ON requests(driver_phone);

-- 2) (Opcional) Asegurar que audit_logs acepta acciones esperadas
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
  CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'COMPLETE', 'REOPEN', 'ASSIGN'));

