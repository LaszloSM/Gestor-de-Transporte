# 🗄️ Esquema de Base de Datos - Gestor de Transporte Electoral

## Inicialización de Supabase

### 1. Crear Proyecto en Supabase

1. Ir a https://app.supabase.com
2. Crear nuevo proyecto
3. Copiar URL y Anon Key
4. Guardar en `.env.local`

### 2. SQL para Crear Tablas

Ejecuta el siguiente SQL en el editor SQL de Supabase:

```sql
-- ============================================
-- TABLA: users (Perfil de usuario)
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('admin', 'coordinator', 'operator')),
  phone VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

-- ============================================
-- TABLA: requests (Solicitudes de transporte)
-- ============================================
CREATE TABLE requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  
  passenger_name VARCHAR(255) NOT NULL,
  passenger_phone VARCHAR(20) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  
  vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('car', 'motorcycle', 'van', 'bus')),
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  time TIME NOT NULL,
  
  state VARCHAR(50) DEFAULT 'pending' CHECK (state IN ('pending', 'assigned', 'completed', 'reopened')),
  notes TEXT,
  
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
  CONSTRAINT fk_completed_by FOREIGN KEY (completed_by) REFERENCES users(id)
);

-- Índices
CREATE INDEX idx_requests_state ON requests(state);
CREATE INDEX idx_requests_created_by ON requests(created_by);
CREATE INDEX idx_requests_assigned_to ON requests(assigned_to);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);
CREATE INDEX idx_requests_vehicle_type ON requests(vehicle_type);

-- ============================================
-- TABLA: audit_logs (Registro de auditoría)
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'COMPLETE', 'REOPEN')),
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource_id ON audit_logs(resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================
-- TABLA: whatsapp_messages (Historial WhatsApp)
-- ============================================
CREATE TABLE whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  
  sent_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  recipient VARCHAR(20) NOT NULL,
  
  message_type VARCHAR(50) DEFAULT 'assignment' CHECK (message_type IN ('assignment', 'reminder', 'completion', 'other')),
  message_content TEXT NOT NULL,
  
  status VARCHAR(50) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  sent_at TIMESTAMP DEFAULT NOW(),
  delivered_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_whatsapp_messages_request_id ON whatsapp_messages(request_id);
CREATE INDEX idx_whatsapp_messages_sent_by ON whatsapp_messages(sent_by);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);

-- ============================================
-- TABLA: transport_cards (Tarjetas de transporte generadas)
-- ============================================
CREATE TABLE transport_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  
  generated_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  qr_code TEXT,
  card_data JSONB,
  
  file_url VARCHAR(500),
  file_format VARCHAR(10) DEFAULT 'pdf' CHECK (file_format IN ('pdf', 'png', 'jpg')),
  
  downloaded_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  downloaded_at TIMESTAMP
);

-- Índices
CREATE INDEX idx_transport_cards_request_id ON transport_cards(request_id);
CREATE INDEX idx_transport_cards_generated_by ON transport_cards(generated_by);
```

### 3. Habilitar Realtime

```sql
-- Habilitar Realtime para tabla requests
ALTER PUBLICATION supabase_realtime ADD TABLE requests;

-- Opcionalmente para otras tablas
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;
```

### 4. Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_cards ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS para users
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- POLÍTICAS para requests
CREATE POLICY "Users can view requests they created" ON requests
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Coordinators and admins can view all requests" ON requests
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('coordinator', 'admin'))
  );

CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Coordinators can update requests" ON requests
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('coordinator', 'admin'))
  );

CREATE POLICY "Admins can delete requests" ON requests
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

-- POLÍTICAS para audit_logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'admin')
  );

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- POLÍTICAS para whatsapp_messages
CREATE POLICY "Users can view messages for their requests" ON whatsapp_messages
  FOR SELECT USING (
    auth.uid() IN (
      SELECT created_by FROM requests WHERE id = request_id
    ) OR
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('coordinator', 'admin')
    )
  );

CREATE POLICY "Coordinators can insert messages" ON whatsapp_messages
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE role IN ('coordinator', 'admin'))
  );
```

### 5. Funciones y Triggers

```sql
-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear audit log
CREATE OR REPLACE FUNCTION create_audit_log(
  p_user_id UUID,
  p_action VARCHAR(50),
  p_resource_type VARCHAR(50),
  p_resource_id UUID,
  p_old_values JSONB,
  p_new_values JSONB
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_old_values,
    p_new_values
  )
  RETURNING id INTO v_id;
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger para crear audit log cuando se actualiza request
CREATE OR REPLACE FUNCTION log_request_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    PERFORM create_audit_log(
      auth.uid(),
      'UPDATE',
      'request',
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM create_audit_log(
      auth.uid(),
      'DELETE',
      'request',
      OLD.id,
      to_jsonb(OLD),
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER requests_audit_trigger AFTER UPDATE OR DELETE ON requests
  FOR EACH ROW EXECUTE FUNCTION log_request_changes();
```

### 6. Datos de Prueba

```sql
-- Crear usuarios de prueba
INSERT INTO users (id, email, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@electoral.com', 'Administrador', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'coordinator@electoral.com', 'Coordinador', 'coordinator'),
  ('00000000-0000-0000-0000-000000000003', 'operator@electoral.com', 'Operador', 'operator')
ON CONFLICT DO NOTHING;

-- Crear solicitudes de prueba
INSERT INTO requests (
  created_by, passenger_name, passenger_phone, quantity, 
  vehicle_type, origin, destination, time, state
) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Juan García', '3001234567', 2, 'car', 'Zona A', 'Puesto 1', '08:00', 'pending'),
  ('00000000-0000-0000-0000-000000000003', 'María López', '3007654321', 1, 'motorcycle', 'Zona B', 'Puesto 2', '09:30', 'assigned'),
  ('00000000-0000-0000-0000-000000000003', 'Carlos Rodríguez', '3009876543', 3, 'car', 'Zona C', 'Puesto 3', '10:15', 'completed');
```

## Migraciones Futuras

```sql
-- Agregar campos para offline sync
ALTER TABLE requests ADD COLUMN local_id VARCHAR(50);
ALTER TABLE requests ADD COLUMN synced_at TIMESTAMP;

-- Agregar campos para notificaciones
ALTER TABLE users ADD COLUMN push_token TEXT;
ALTER TABLE users ADD COLUMN notifications_enabled BOOLEAN DEFAULT true;

-- Tabla para conflictos de concurrencia
CREATE TABLE conflict_resolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES requests(id),
  local_version INTEGER,
  server_version INTEGER,
  resolution_type VARCHAR(50),
  resolved_at TIMESTAMP DEFAULT NOW()
);
```

## Backups y Mantenimiento

```bash
# Exportar datos
pg_dump -h db.YOUR_SUPABASE_URL -U postgres -d postgres > backup.sql

# Verificar integridad
VACUUM ANALYZE;

# Limpiar logs antiguos
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

---

**Nota**: Asegúrate de ejecutar todos los scripts en orden y verificar los permisos de RLS antes de ir a producción.
