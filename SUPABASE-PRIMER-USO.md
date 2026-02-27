# Configurar Supabase para que funcione el login

El mensaje **"Email o contraseña incorrectos"** suele significar que **aún no hay ningún usuario** en la base de datos (normal si el proyecto estaba pausado o es nuevo).

## Pasos

### 1. Crear las tablas en Supabase

1. Entra a [Supabase Dashboard](https://supabase.com/dashboard) → tu proyecto.
2. Abre **SQL Editor**.
3. Ejecuta **en este orden**:
   - Primero: el contenido de **`setup-database.sql`** (tablas `users`, `requests`, `audit_logs`, etc.).
   - Después: el contenido de **`fix-auth.sql`** (trigger para crear el perfil al registrarse y confirmar email automático).

### 2. Crear tu primer usuario desde la app

1. En la app, en la pantalla de login, pulsa **"Crear cuenta"**.
2. Regístrate con un email y contraseña (por ejemplo tu email real).
3. Te llevará de vuelta al login. Inicia sesión con ese mismo email y contraseña.

Si al registrarte sale error, revisa en Supabase:

- **Authentication → Providers**: Email debe estar habilitado.
- Que hayas ejecutado **fix-auth.sql** (sin él no se crea la fila en `users` y el login puede fallar después).

### 3. Crear un usuario admin (opcional)

Para ver **Auditoría** y poder reabrir/eliminar solicitudes:

1. En Supabase → **SQL Editor** ejecuta (cambia el email por el que usaste al registrarte):

```sql
UPDATE public.users
SET role = 'admin'
WHERE email = 'tu@email.com';
```

### 4. Super Admin y teléfono del conductor

Si usas **laszlosierra2@gmail.com** como Super Admin o ya tienes el sistema en marcha:

1. En Supabase → **SQL Editor** ejecuta el script **`migrations/004_super_admin_and_driver_phone.sql`**.
2. Eso hace que:
   - **laszlosierra2@gmail.com** tenga `role = 'admin'` en la BD (menú Usuarios/Auditoría y RLS correctos).
   - La tabla **requests** tenga la columna **driver_phone** para enviar WhatsApp al conductor al asignar.

### Resumen

| Mensaje                         | Qué hacer                                              |
|---------------------------------|--------------------------------------------------------|
| Email o contraseña incorrectos  | No hay usuarios: **Crear cuenta** en la app.          |
| Error al crear la cuenta        | Ejecutar **setup-database.sql** y **fix-auth.sql**.    |
| Login OK pero sin menú/permisos | Ejecutar el `UPDATE` de arriba para ponerte `admin`.  |
| Super Admin se ve como coordinador | Ejecutar **migrations/004_super_admin_and_driver_phone.sql**. |
