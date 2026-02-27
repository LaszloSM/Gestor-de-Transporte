-- 006: Auditoría de requests con acciones (CREATE/ASSIGN/COMPLETE/REOPEN/UPDATE/DELETE)
-- Ejecutar en Supabase SQL Editor.

-- Asegurar check de acciones
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
  CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'COMPLETE', 'REOPEN', 'ASSIGN'));

CREATE OR REPLACE FUNCTION log_request_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_action VARCHAR(50);
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM create_audit_log(
      auth.uid(),
      'CREATE',
      'request',
      NEW.id,
      NULL,
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'UPDATE';

    IF (OLD.state IS DISTINCT FROM NEW.state) THEN
      IF (OLD.state = 'pending' AND NEW.state = 'assigned') THEN
        v_action := 'ASSIGN';
      ELSIF (OLD.state = 'assigned' AND NEW.state = 'completed') THEN
        v_action := 'COMPLETE';
      ELSIF (OLD.state = 'completed' AND NEW.state = 'pending') THEN
        v_action := 'REOPEN';
      END IF;
    END IF;

    PERFORM create_audit_log(
      auth.uid(),
      v_action,
      'request',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      auth.uid(),
      'DELETE',
      'request',
      OLD.id,
      to_jsonb(OLD),
      NULL
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS requests_audit_trigger ON requests;
CREATE TRIGGER requests_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON requests
  FOR EACH ROW EXECUTE FUNCTION log_request_changes();

