-- ============================================
-- MIGRACIÓN: Unificar roles coordinator + operator → usuario
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 1. Eliminar constraint de rol antiguo PRIMERO (el viejo solo permite admin/coordinator/operator)
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- 2. Actualizar usuarios existentes con roles antiguos
UPDATE public.users SET role = 'usuario' WHERE role IN ('coordinator', 'operator');

-- 3. Crear nuevo constraint con los roles válidos
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'usuario', 'superadmin'));

-- 3. Actualizar función get_my_role (no cambia, pero la recreamos por seguridad)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- ============================================
-- ACTUALIZAR POLÍTICAS RLS
-- ============================================

-- USERS: Admin puede ver todos
DROP POLICY IF EXISTS "Admin can view all users" ON users;
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (public.get_my_role() IN ('admin', 'superadmin'));

-- USERS: Eliminar política vieja de coordinadores y crear una nueva
DROP POLICY IF EXISTS "Coordinators and admins can view coordinators" ON users;

-- USERS: Admin puede actualizar cualquier usuario
DROP POLICY IF EXISTS "Admin can update any user" ON users;
CREATE POLICY "Admin can update any user" ON users
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'superadmin'));

-- REQUESTS: Admins pueden ver todas las solicitudes
DROP POLICY IF EXISTS "Coordinators and admins can view all requests" ON requests;
CREATE POLICY "Admins can view all requests" ON requests
  FOR SELECT USING (public.get_my_role() IN ('admin', 'superadmin'));

-- REQUESTS: Admins pueden actualizar solicitudes
DROP POLICY IF EXISTS "Coordinators can update requests" ON requests;
CREATE POLICY "Admins can update requests" ON requests
  FOR UPDATE USING (public.get_my_role() IN ('admin', 'superadmin'));

-- WHATSAPP: Actualizar políticas
DROP POLICY IF EXISTS "Users can view messages for their requests" ON whatsapp_messages;
CREATE POLICY "Users can view messages for their requests" ON whatsapp_messages
  FOR SELECT USING (
    auth.uid() IN (SELECT created_by FROM requests WHERE id = request_id)
    OR public.get_my_role() IN ('admin', 'superadmin')
  );

DROP POLICY IF EXISTS "Coordinators can insert messages" ON whatsapp_messages;
CREATE POLICY "Admins can insert messages" ON whatsapp_messages
  FOR INSERT WITH CHECK (public.get_my_role() IN ('admin', 'superadmin'));

-- AUDIT LOGS: Admins y superadmins
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (public.get_my_role() IN ('admin', 'superadmin'));
