-- ============================================
-- FIX: Recursión infinita en políticas RLS + roles para usuarios
-- Ejecuta TODO este script en Supabase → SQL Editor
-- ============================================

-- 1. Función que devuelve el rol del usuario actual SIN disparar RLS (evita recursión)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid() LIMIT 1;
$$;

-- 2. Eliminar políticas que causan recursión (consultan users dentro de users/requests)
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Coordinators and admins can view coordinators" ON users;

DROP POLICY IF EXISTS "Coordinators and admins can view all requests" ON requests;
DROP POLICY IF EXISTS "Coordinators can update requests" ON requests;
DROP POLICY IF EXISTS "Admins can delete requests" ON requests;

DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;

DROP POLICY IF EXISTS "Users can view messages for their requests" ON whatsapp_messages;
DROP POLICY IF EXISTS "Coordinators can insert messages" ON whatsapp_messages;

-- 3. Políticas USERS usando get_my_role() (sin recursión)
CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "Coordinators and admins can view coordinators" ON users
  FOR SELECT USING (
    role = 'coordinator' AND public.get_my_role() IN ('admin', 'coordinator')
  );

-- Admin puede actualizar cualquier usuario (gestión de roles)
CREATE POLICY "Admin can update any user" ON users
  FOR UPDATE USING (public.get_my_role() = 'admin');

-- 4. Políticas REQUESTS usando get_my_role()
CREATE POLICY "Coordinators and admins can view all requests" ON requests
  FOR SELECT USING (public.get_my_role() IN ('coordinator', 'admin'));

CREATE POLICY "Coordinators can update requests" ON requests
  FOR UPDATE USING (public.get_my_role() IN ('coordinator', 'admin'));

CREATE POLICY "Admins can delete requests" ON requests
  FOR DELETE USING (public.get_my_role() = 'admin');

-- 5. Políticas AUDIT_LOGS
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (public.get_my_role() = 'admin');

-- 6. Políticas WHATSAPP usando get_my_role()
CREATE POLICY "Users can view messages for their requests" ON whatsapp_messages
  FOR SELECT USING (
    auth.uid() IN (SELECT created_by FROM requests WHERE id = request_id)
    OR public.get_my_role() IN ('coordinator', 'admin')
  );

CREATE POLICY "Coordinators can insert messages" ON whatsapp_messages
  FOR INSERT WITH CHECK (public.get_my_role() IN ('coordinator', 'admin'));

-- ============================================
-- 7. ASIGNAR ROLES A USUARIOS EXISTENTES
-- Edita los emails abajo con los de tus usuarios (Authentication → Users en Supabase)
-- ============================================

-- Asignar admin al primer usuario y coordinator al segundo (cambia los emails si son distintos)
UPDATE public.users SET role = 'admin', full_name = COALESCE(NULLIF(trim(full_name), ''), email) WHERE email = 'laszlosierra2@gmail.com';
UPDATE public.users SET role = 'coordinator', full_name = COALESCE(NULLIF(trim(full_name), ''), email) WHERE email = 'pedrolopez92@gmail.com';

-- Cualquier otro usuario sin rol queda como operador
UPDATE public.users SET role = 'operator' WHERE role IS NULL OR trim(role) = '';
