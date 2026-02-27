-- ==========================================
-- SETUP AUDITORÍA Y TRANSACCIONES
-- ==========================================

-- 1. Crear tabla audit_logs si no existe
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR NOT NULL,
  resource_type VARCHAR NOT NULL,
  resource_id UUID NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla messages (para WhatsApp y otros mensajes)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message_type VARCHAR NOT NULL DEFAULT 'whatsapp',
  recipient VARCHAR NOT NULL,
  content TEXT NOT NULL,
  sent_at TIMESTAMP DEFAULT NOW()
);

-- 3. Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_id ON public.audit_logs(resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON public.messages(request_id);

-- 4. Habilitar RLS en audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies para audit_logs - Solo admin puede ver
DROP POLICY IF EXISTS "Only admin can view audit logs" ON public.audit_logs;
CREATE POLICY "Only admin can view audit logs" ON public.audit_logs
  FOR SELECT USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- 6. RLS Policies para messages - Solo propietario y admin
DROP POLICY IF EXISTS "Users can view own messages" ON public.messages;
CREATE POLICY "Users can view own messages" ON public.messages
  FOR SELECT USING (
    user_id = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- 7. Habilitar Realtime para audit_logs (si no está habilitado)
-- ALTER PUBLICATION supabase_realtime ADD TABLE audit_logs;
-- ALTER PUBLICATION supabase_realtime ADD TABLE messages;
