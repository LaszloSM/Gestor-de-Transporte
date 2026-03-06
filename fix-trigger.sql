-- ==============================================================================
-- CORRECCIÓN DEL TRIGGER DE CREACIÓN DE USUARIO
-- Este script soluciona el error 500 al crear usuarios desde el panel de Admin
-- ==============================================================================

-- El problema era que el trigger anterior intentaba insertar por defecto el rol 'operator', 
-- el cual ya no es válido tras la migración de roles (solo admin, usuario, superadmin).
-- Ahora el trigger leerá el nombre y rol directamente desde los metadatos de auth.signUp()

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role text;
  v_full_name text;
BEGIN
  -- Confirmar email automáticamente para que puedan loguearse enseguida
  UPDATE auth.users SET email_confirmed_at = now() WHERE id = new.id;
  
  -- Extraer el rol de los metadatos, si no existe o no es válido, usar 'usuario' por defecto
  v_role := new.raw_user_meta_data->>'role';
  IF v_role IS NULL OR v_role NOT IN ('admin', 'usuario', 'superadmin') THEN
    v_role := 'usuario';
  END IF;

  -- Extraer el full_name de los metadatos
  v_full_name := new.raw_user_meta_data->>'full_name';
  IF v_full_name IS NULL THEN
    v_full_name := '';
  END IF;

  -- Crear el perfil en la tabla public.users
  INSERT INTO public.users (id, email, full_name, role, active)
  VALUES (new.id, new.email, v_full_name, v_role, true)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Asegurarnos de que el trigger esté asignado a la tabla
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
