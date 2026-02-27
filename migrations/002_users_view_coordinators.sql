-- Permitir a coordinadores y admin ver usuarios con rol coordinator (para el modal de asignación)
-- Ejecutar en Supabase SQL Editor si ya tienes el proyecto creado.

CREATE POLICY "Coordinators and admins can view coordinators" ON users
  FOR SELECT USING (
    role = 'coordinator' AND
    auth.uid() IN (SELECT id FROM users WHERE role IN ('admin', 'coordinator'))
  );
