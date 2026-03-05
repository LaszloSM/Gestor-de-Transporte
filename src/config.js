// Configuración de Supabase
export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY',
}

// Super admin: este usuario no puede cambiar de rol ni ser desactivado/eliminado
export const SUPER_ADMIN_EMAIL = 'laszlosierra2@gmail.com'

export const isSuperAdminEmail = (email) =>
  Boolean(email && SUPER_ADMIN_EMAIL && String(email).toLowerCase().trim() === String(SUPER_ADMIN_EMAIL).toLowerCase().trim())

// Roles disponibles
export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  USUARIO: 'usuario',
}

export const ROLE_LABELS = {
  [ROLES.SUPERADMIN]: 'Superusuario',
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.USUARIO]: 'Usuario',
}

// Estados de solicitud
export const REQUEST_STATES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_ROUTE: 'in_route',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

export const STATE_LABELS = {
  [REQUEST_STATES.PENDING]: 'Pendiente',
  [REQUEST_STATES.ASSIGNED]: 'Asignada',
  [REQUEST_STATES.IN_ROUTE]: 'En Ruta',
  [REQUEST_STATES.COMPLETED]: 'Completada',
  [REQUEST_STATES.CANCELLED]: 'Cancelada',
}

// Colores por estado
export const STATE_COLORS = {
  [REQUEST_STATES.PENDING]: { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' },
  [REQUEST_STATES.ASSIGNED]: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' },
  [REQUEST_STATES.IN_ROUTE]: { bg: 'bg-violet-100', text: 'text-violet-800', dot: 'bg-violet-500' },
  [REQUEST_STATES.COMPLETED]: { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' },
  [REQUEST_STATES.CANCELLED]: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' },
}



// Tipos de vehículos
export const VEHICLE_TYPES = {
  CAR: 'car',
  MOTORCYCLE: 'motorcycle',
  VAN: 'van',
  BUS: 'bus',
}

export const VEHICLE_TYPE_LABELS = {
  [VEHICLE_TYPES.CAR]: 'Carro',
  [VEHICLE_TYPES.MOTORCYCLE]: 'Moto',
  [VEHICLE_TYPES.VAN]: 'Furgoneta',
  [VEHICLE_TYPES.BUS]: 'Bus',
}

// Permisos por rol
export const ROLE_PERMISSIONS = {
  [ROLES.SUPERADMIN]: {
    create_request: true,
    view_all_requests: true,
    view_own_requests: true,
    assign_transport: true,
    set_in_route: true,
    complete_request: true,
    cancel_request: true,
    send_whatsapp: true,
    delete_request: true,
    view_audit: true,
    manage_users: true,
    create_admin: true,
  },
  [ROLES.ADMIN]: {
    create_request: true,
    view_all_requests: true,
    view_own_requests: true,
    assign_transport: true,
    set_in_route: true,
    complete_request: true,
    cancel_request: true,
    send_whatsapp: true,
    delete_request: true,
    view_audit: true,
    manage_users: true,
    create_admin: false,
  },
  [ROLES.USUARIO]: {
    create_request: true,
    view_all_requests: false,
    view_own_requests: true,
    assign_transport: false,
    set_in_route: false,
    complete_request: false,
    cancel_request: false,
    send_whatsapp: false,
    delete_request: false,
    view_audit: false,
    manage_users: false,
    create_admin: false,
  },
}

// Helper para verificar permisos
export const hasPermission = (role, permission) => {
  if (!role || !permission) return false
  const effectiveRole = ROLE_PERMISSIONS[role]
  return effectiveRole?.[permission] ?? false
}

// Mensajes de WhatsApp
export const buildWhatsAppMessage = (request) => {
  const lines = [
    '📍 *Asignación de Transporte Electoral*',
    '',
    `👤 *Votante:* ${request?.passenger_name || '—'}`,
    `📞 *Teléfono:* ${request?.passenger_phone || '—'}`,
    `📍 *Recogida:* ${request?.origin || '—'}`,
    `🗳️ *Destino:* ${request?.destination || '—'}`,
    `🚗 *Vehículo:* ${VEHICLE_TYPE_LABELS[request?.vehicle_type] || '—'}`,
    `🕐 *Hora:* ${request?.time || '—'}`,
    `👥 *Pasajeros:* ${request?.quantity ?? 1}`,
  ]
  if (request?.notes) lines.push(`📝 *Notas:* ${request.notes}`)
  lines.push('', '¡Gracias por apoyar el transporte electoral! 🇨🇴')
  return lines.join('\n')
}
