-- Script para permitir login sin confirmación de email
-- Ejecuta esto en Supabase SQL Editor

-- 1. Crear trigger que confirme automaticamente el email al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Confirmar email automaticamente
  update auth.users set email_confirmed_at = now() where id = new.id;
  
  -- Crear perfil de usuario
  insert into public.users (id, email, full_name, role)
  values (new.id, new.email, '', 'operator');
  
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- 2. Crear trigger en auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Esto hace que:
-- 1. Cada nuevo usuario se registre con email confirmado
-- 2. Se cree automáticamente un perfil en la tabla users
-- 3. El rol por defecto sea 'operator'
