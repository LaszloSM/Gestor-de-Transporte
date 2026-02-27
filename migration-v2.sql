-- ============================================
-- MIGRACIÓN V2: Nuevos estados, tipos de pasajero, soporte superadmin
-- Ejecutar en Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================

-- 1. Actualizar CHECK constraint de estado en requests para incluir in_route y cancelled
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_state_check;
ALTER TABLE requests ADD CONSTRAINT requests_state_check
  CHECK (state IN ('pending', 'assigned', 'in_route', 'completed', 'cancelled'));

-- 3. Actualizar CHECK constraint de rol en users para incluir superadmin  
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('superadmin', 'admin', 'coordinator', 'operator'));

-- 4. Actualizar CHECK constraint de acción en audit_logs
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_check;
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_check
  CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'COMPLETE', 'REOPEN', 'ASSIGN', 'CANCEL', 'IN_ROUTE', 'ROLE_CHANGE', 'USER_CREATE', 'USER_DEACTIVATE'));

-- 5. Actualizar la función get_my_role para manejar superadmin
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 6. Actualizar políticas RLS para soportar superadmin
-- Requests: superadmin y admin pueden ver todo
DROP POLICY IF EXISTS "Coordinators and admins can view all requests" ON requests;
CREATE POLICY "Coordinators admins superadmins can view all requests" ON requests
  FOR SELECT USING (public.get_my_role() IN ('coordinator', 'admin', 'superadmin'));

DROP POLICY IF EXISTS "Coordinators can update requests" ON requests;
CREATE POLICY "Coordinators admins superadmins can update requests" ON requests
  FOR UPDATE USING (public.get_my_role() IN ('coordinator', 'admin', 'superadmin'));

DROP POLICY IF EXISTS "Admins can delete requests" ON requests;
CREATE POLICY "Admins and superadmins can delete requests" ON requests
  FOR DELETE USING (public.get_my_role() IN ('admin', 'superadmin'));

-- Users: superadmin puede ver y editar todo
DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Admin and superadmin can view all users" ON users
  FOR SELECT USING (public.get_my_role() IN ('admin', 'superadmin'));

DROP POLICY IF EXISTS "Admin can update any user" ON users;
CREATE POLICY "Admin and superadmin can update any user" ON users
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'superadmin'));

-- Audit logs: superadmin puede ver
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins and superadmins can view audit logs" ON audit_logs
  FOR SELECT USING (public.get_my_role() IN ('admin', 'superadmin'));

-- 7. Actualizar trigger de auditoría para nuevos estados
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
      IF (NEW.state = 'assigned') THEN
        v_action := 'ASSIGN';
      ELSIF (NEW.state = 'in_route') THEN
        v_action := 'IN_ROUTE';
      ELSIF (NEW.state = 'completed') THEN
        v_action := 'COMPLETE';
      ELSIF (NEW.state = 'cancelled') THEN
        v_action := 'CANCEL';
      ELSIF (NEW.state = 'pending' AND OLD.state = 'completed') THEN
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


-- ============================================
-- FIN DE MIGRACIÓN V2
-- ============================================
