-- Permitir la acción ASSIGN en audit_logs (bases ya creadas con setup-database.sql)
-- Ejecutar en Supabase SQL Editor si ya tenías la tabla creada.

ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
  CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'COMPLETE', 'REOPEN', 'ASSIGN'));
