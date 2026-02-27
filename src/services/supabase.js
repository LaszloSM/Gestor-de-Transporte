import { createClient } from '@supabase/supabase-js'

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

export const isSupabaseConfigured = () =>
  Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl !== 'YOUR_SUPABASE_URL' && supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY')

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── Auth ────────────────────────────────────────────
export const auth = {
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message || 'Error al iniciar sesión')
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser()
    if (error) throw error
    return data.user
  },

  getSession: async () => {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    return data.session
  },
}

// ─── Request Queries ─────────────────────────────────
// Use named FK constraints to disambiguate (the table has both inline and named FKs)
const REQUEST_SELECT = `
  *,
  created_by_user:users!fk_created_by(id, full_name, email),
  assigned_to_user:users!fk_assigned_to(id, full_name, email),
  completed_by_user:users!fk_completed_by(id, full_name, email)
`

// Simpler select without joins for mutations
const REQUEST_SELECT_SIMPLE = '*'

// ─── Database ────────────────────────────────────────
export const db = {
  // ── Solicitudes ──
  createRequest: async (request, userId) => {
    const { data, error } = await supabase
      .from('requests')
      .insert([{
        ...request,
        created_by: userId,
        state: 'pending',
      }])
      .select(REQUEST_SELECT_SIMPLE)
    if (error) throw error
    return data?.[0]
  },

  getRequests: async (filters = {}, userId = null, userRole = 'operator') => {
    let query = supabase.from('requests').select(REQUEST_SELECT)

    // Filtrar según el rol del usuario
    if (userRole === 'operator') {
      query = query.eq('created_by', userId)
    }
    // Admin, superadmin y coordinator ven todas

    if (filters.state) {
      query = query.eq('state', filters.state)
    }

    if (filters.search) {
      query = query.or(`passenger_name.ilike.%${filters.search}%,origin.ilike.%${filters.search}%,destination.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  getRequestById: async (id) => {
    const { data, error } = await supabase
      .from('requests')
      .select(REQUEST_SELECT_SIMPLE)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  updateRequest: async (id, updates) => {
    const { data, error } = await supabase
      .from('requests')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(REQUEST_SELECT_SIMPLE)
    if (error) throw error
    return data?.[0]
  },

  // Asignar solicitud (pending → assigned)
  assignRequest: async (requestId, coordinatorId, driver = {}) => {
    const current = await db.getRequestById(requestId)
    if (current.state !== 'pending') {
      throw new Error(`No se puede asignar una solicitud en estado "${current.state}"`)
    }
    const updates = {
      state: 'assigned',
      assigned_to: coordinatorId,
    }
    const driverPhone = driver?.driver_phone ?? driver?.phone ?? null
    const driverName = driver?.driver_name ?? driver?.name ?? null
    if (driverName != null && String(driverName).trim() !== '') {
      updates.driver_name = String(driverName).trim()
    }
    if (driverPhone != null && String(driverPhone).trim() !== '') {
      updates.driver_phone = String(driverPhone).trim().replace(/\s/g, '')
    }
    return await db.updateRequest(requestId, updates)
  },

  // Poner en ruta (assigned → in_route)
  setInRouteRequest: async (requestId) => {
    const current = await db.getRequestById(requestId)
    if (current.state !== 'assigned') {
      throw new Error(`Solo se puede poner en ruta una solicitud asignada. Estado actual: "${current.state}"`)
    }
    return await db.updateRequest(requestId, { state: 'in_route' })
  },

  // Completar (assigned | in_route → completed)
  completeRequest: async (requestId, userId) => {
    const current = await db.getRequestById(requestId)
    if (!['assigned', 'in_route'].includes(current.state)) {
      throw new Error(`No se puede completar una solicitud en estado "${current.state}"`)
    }
    return await db.updateRequest(requestId, {
      state: 'completed',
      completed_by: userId,
      completed_at: new Date().toISOString(),
    })
  },

  // Cancelar (cualquier estado no completado → cancelled)
  cancelRequest: async (requestId) => {
    const current = await db.getRequestById(requestId)
    if (current.state === 'completed') {
      throw new Error('No se puede cancelar una solicitud completada')
    }
    if (current.state === 'cancelled') {
      throw new Error('La solicitud ya está cancelada')
    }
    return await db.updateRequest(requestId, { state: 'cancelled' })
  },

  // Reabrir (completed → pending) — solo admin/superadmin
  reopenRequest: async (requestId, userRole) => {
    const current = await db.getRequestById(requestId)
    if (!['admin', 'superadmin'].includes(userRole)) {
      throw new Error('Solo administradores pueden reabrir solicitudes')
    }
    if (current.state !== 'completed' && current.state !== 'cancelled') {
      throw new Error(`No se puede reabrir una solicitud en estado "${current.state}"`)
    }
    return await db.updateRequest(requestId, {
      state: 'pending',
      assigned_to: null,
      completed_by: null,
      completed_at: null,
      driver_name: null,
      driver_phone: null,
    })
  },

  deleteRequest: async (id) => {
    const { error } = await supabase.from('requests').delete().eq('id', id)
    if (error) throw error
  },

  // ── Usuarios ──
  getUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, active, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  getUserProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) throw error
    return data
  },

  updateUserProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
    if (error) throw error
    return data?.[0]
  },

  createUser: async (email, password, full_name, role) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    })
    if (error) throw error
    if (!data?.user?.id) throw new Error('No se pudo crear el usuario')
    const userId = data.user.id
    const updates = { full_name: (full_name && full_name.trim()) || null, role: role || 'operator' }
    // Esperar a que el trigger cree el registro en public.users
    await new Promise((r) => setTimeout(r, 800))
    const { data: updated, error: err2 } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()
    if (err2) throw err2

    // Registrar en auditoría
    try {
      await db.logAudit({
        action: 'USER_CREATE',
        resource_type: 'user',
        resource_id: userId,
        new_values: { email: email.trim(), full_name, role },
      })
    } catch (_) { /* no bloquear si falla el log */ }

    return updated
  },

  // ── Auditoría ──
  logAudit: async (auditData) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.id) return null
    const { details, old_values, new_values, ...rest } = auditData
    const resolvedNewValues = new_values ?? details ?? null

    const { data, error } = await supabase
      .from('audit_logs')
      .insert([{
        user_id: user.id,
        old_values: old_values ?? null,
        new_values: resolvedNewValues,
        ...rest,
      }])
      .select()
    if (error && import.meta.env.DEV) {
      console.error('Error logging audit:', error)
    }
    return data?.[0]
  },

  getAuditLog: async (filters = {}) => {
    let query = supabase.from('audit_logs').select(`
      *,
      user:users(id, full_name, email, role)
    `)

    if (filters.resourceId) query = query.eq('resource_id', filters.resourceId)
    if (filters.action) query = query.eq('action', filters.action)
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom)
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo)

    const { data, error } = await query.order('created_at', { ascending: false }).limit(200)
    if (error) throw error
    return data || []
  },

  // ── WhatsApp ──
  getWhatsAppHistory: async (requestId) => {
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('request_id', requestId)
      .order('sent_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  addWhatsAppMessage: async (message) => {
    const { data: { user } } = await supabase.auth.getUser()
    const payload = { ...message, sent_by: message?.sent_by || user?.id }
    const { data, error } = await supabase
      .from('whatsapp_messages')
      .insert([payload])
      .select()
    if (error) throw error
    return data?.[0]
  },
}

// ─── Realtime ────────────────────────────────────────
export const realtime = {
  subscribeToRequests: (callback) => {
    return supabase
      .channel('requests-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, callback)
      .subscribe()
  },

  subscribeToAuditLogs: (callback) => {
    return supabase
      .channel('audit-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'audit_logs' }, callback)
      .subscribe()
  },

  unsubscribe: (subscription) => {
    return supabase.removeChannel(subscription)
  },
}
