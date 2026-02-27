-- Setup de datos de prueba (SIN crear usuarios directamente)
-- Los usuarios se crean al registrarse en la app

-- 1. OBTENER EL ID DEL USUARIO ACTUAL (reemplazar manualmente con tu user ID)
-- Para encontrar tu user ID: ve a Supabase > SQL Editor > SELECT auth.uid()

-- 2. CREAR SOLICITUDES DE PRUEBA
-- Nota: Reemplaza 'YOUR_USER_ID' con el ID real de tu usuario operador

INSERT INTO requests (
  id, created_by, passenger_name, passenger_phone, quantity, 
  vehicle_type, origin, destination, time, state, notes
)
VALUES
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'f931e6fe-785a-4664-9613-618cd243e0d4',
    'Juan García López',
    '3001234567',
    2,
    'car',
    'Zona Centro - Calle 5',
    'Puesto de votación 1',
    '08:00:00',
    'pending',
    'Necesita transporte urgente'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '228d456d-9ac8-41a8-af42-e9151eab07c5',
    'María López Pérez',
    '3007654321',
    1,
    'motorcycle',
    'Zona Norte - Carrera 10',
    'Puesto de votación 2',
    '09:30:00',
    'assigned',
    'Cliente senior, tratamiento especial'
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'f931e6fe-785a-4664-9613-618cd243e0d4',
    'Carlos Rodríguez Gómez',
    '3009876543',
    3,
    'van',
    'Zona Sur - Avenida 20',
    'Puesto de votación 3',
    '10:15:00',
    'completed',
    'Grupo de ancianos'
  )
ON CONFLICT DO NOTHING;

-- 3. HABILITAR REALTIME (si no está habilitado)
-- ALTER PUBLICATION supabase_realtime ADD TABLE requests;
-- ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
