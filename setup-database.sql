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
  driver_name VARCHAR(255),
  driver_phone VARCHAR(20),
  
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  
  CONSTRAINT fk_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  CONSTRAINT fk_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
  CONSTRAINT fk_completed_by FOREIGN KEY (completed_by) REFERENCES users(id)
);

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
  
  action VARCHAR(50) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'COMPLETE', 'REOPEN', 'ASSIGN')),
  resource_type VARCHAR(50) NOT NULL,
  resource_id UUID NOT NULL,
  
  old_values JSONB,
  new_values JSONB,
  
  ip_address VARCHAR(45),
  user_agent TEXT,
  
  created_at TIMESTAMP DEFAULT NOW()
);

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

CREATE INDEX idx_transport_cards_request_id ON transport_cards(request_id);
CREATE INDEX idx_transport_cards_generated_by ON transport_cards(generated_by);

-- ============================================
-- HABILITAR REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE requests;
ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE whatsapp_messages;

-- ============================================
-- HABILITAR ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_cards ENABLE ROW LEVEL SECURITY;

-- ============================================
-- FUNCIÓN PARA ROL (evita recursión en RLS)
-- ============================================
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
-- POLÍTICAS RLS - USERS
-- ============================================
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all users" ON users
  FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "Coordinators and admins can view coordinators" ON users
  FOR SELECT USING (
    role = 'coordinator' AND public.get_my_role() IN ('admin', 'coordinator')
  );

-- Admin puede actualizar rol de cualquier usuario (gestión de usuarios)
CREATE POLICY "Admin can update any user" ON users
  FOR UPDATE USING (public.get_my_role() = 'admin');

-- ============================================
-- POLÍTICAS RLS - REQUESTS
-- ============================================
CREATE POLICY "Users can view requests they created" ON requests
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Coordinators and admins can view all requests" ON requests
  FOR SELECT USING (public.get_my_role() IN ('coordinator', 'admin'));

CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Coordinators can update requests" ON requests
  FOR UPDATE USING (public.get_my_role() IN ('coordinator', 'admin'));

CREATE POLICY "Admins can delete requests" ON requests
  FOR DELETE USING (public.get_my_role() = 'admin');

-- ============================================
-- POLÍTICAS RLS - AUDIT LOGS
-- ============================================
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (public.get_my_role() = 'admin');

CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- ============================================
-- POLÍTICAS RLS - WHATSAPP MESSAGES
-- ============================================
CREATE POLICY "Users can view messages for their requests" ON whatsapp_messages
  FOR SELECT USING (
    auth.uid() IN (SELECT created_by FROM requests WHERE id = request_id)
    OR public.get_my_role() IN ('coordinator', 'admin')
  );

CREATE POLICY "Coordinators can insert messages" ON whatsapp_messages
  FOR INSERT WITH CHECK (public.get_my_role() IN ('coordinator', 'admin'));

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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

CREATE TRIGGER requests_audit_trigger AFTER INSERT OR UPDATE OR DELETE ON requests
  FOR EACH ROW EXECUTE FUNCTION log_request_changes();
