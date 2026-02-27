# 🏗️ Arquitectura - Gestor de Transporte Electoral

## Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Componentes UI                        │ │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐  │ │
│  │  │ Header  │ │ Sidebar  │ │ Forms   │ │   Tables   │  │ │
│  │  └─────────┘ └──────────┘ └─────────┘ └────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Estado Global (Zustand)                    │ │
│  │  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐  │ │
│  │  │Auth Store│ │RequestSt │ │ UI Store│ │ Sync Store│  │ │
│  │  └──────────┘ └──────────┘ └─────────┘ └────────────┘  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                  Servicios                              │ │
│  │  ┌────────────────────────────────────────────────────┐ │ │
│  │  │  Supabase Service                                  │ │ │
│  │  │  ├─ Auth                                           │ │ │
│  │  │  ├─ Database (CRUD)                               │ │ │
│  │  │  └─ Realtime                                       │ │ │
│  │  └────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ▲
                          │ HTTPS/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Supabase)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Authentication (PostgreSQL)                │ │
│  │  auth.users, auth.sessions                             │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   Base de Datos                         │ │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐ │ │
│  │  │ users   │ │ requests │ │audit_logs│ │ whatsapp   │ │ │
│  │  └─────────┘ └──────────┘ └──────────┘ └────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Realtime Subscriptions                     │ │
│  │  ├─ Cambios en requests                               │ │
│  │  ├─ Cambios en audit_logs                             │ │
│  │  └─ Cambios en whatsapp_messages                      │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           Row Level Security (RLS)                      │ │
│  │  ├─ Por rol (admin, coordinator, operator)            │ │
│  │  ├─ Por usuario (solo su contenido)                   │ │
│  │  └─ Por contexto (requests creadas, asignadas)        │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │          Triggers y Funciones                           │ │
│  │  ├─ Auto-timestamp (updated_at)                        │ │
│  │  ├─ Audit logging                                      │ │
│  │  └─ Validaciones                                       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Flujo de Datos

### 1. Flujo: Crear Solicitud

```
Usuario (Operador)
    │
    ├─► Completa Formulario
    │
    ├─► Cliente valida (frontend)
    │
    ├─► Envía JSON a Supabase
    │      {
    │        passenger_name: "Juan",
    │        quantity: 2,
    │        vehicle_type: "car",
    │        origin: "Zona A",
    │        destination: "Puesto 1",
    │        time: "08:00",
    │        state: "pending",
    │        created_by: uuid
    │      }
    │
    ├─► Supabase recibe (RLS valida)
    │
    ├─► Inserta en tabla requests
    │
    ├─► Trigger: create_audit_log()
    │
    ├─► Broadcast realtime
    │      event: 'INSERT'
    │      table: 'requests'
    │      payload: {nueva solicitud}
    │
    └─► Todos los clientes reciben update
        - Zustand: requestsStore.addRequest()
        - UI: tabla se actualiza
        - Toast: "Solicitud creada"
```

### 2. Flujo: Actualización Multiusuario

```
Usuario A (Coordinador)          Usuario B (Operador)
    │                                    │
    ├─► Asigna transporte               │
    │                                    │
    ├─► Optimistic update local         │
    │   state: 'assigned'                │
    │                                    │
    ├─► Envía a Supabase                │
    │   UPDATE requests                  │
    │   WHERE id = X                     │
    │   SET assigned_to = Y              │
    │                                    │
    ├─► Supabase confirma               │
    │                                    │
    ├─► Trigger: audit_log              │
    │                                    │
    ├─► Realtime broadcast              │
    │                                    │
    │                                    ├─► Recibe cambio
    │                                    │
    │                                    ├─► Verifica versión
    │                                    │
    │                                    ├─► Actualiza local
    │                                    │
    │                                    └─► Muestra indicador
    │                                        "Modificado por..."
    │
    └─► Toast: "Asignado"
```

### 3. Flujo: Conflicto de Concurrencia

```
Usuario A                        Usuario B
    │                                │
    ├─ Lee: version = 1              │
    │                                ├─ Lee: version = 1
    │                                │
    ├─ Intenta cambiar estado        │
    │ state: 'completed'             │
    │                                ├─ Intenta cambiar estado
    │ version: 2                     │ state: 'reopened'
    │                                │ version: 2
    ├─► Supabase acepta              │
    │   version actualizada a 2       │
    │                                ├─► Supabase rechaza
    │                                │   Conflict detected
    │ Toast: "Completado"            │
    │                                ├─► Cliente resuelve
    │ UI: estado actualizado         │   Mostrar opciones
    │                                │
    │                                └─► Usuario elige:
    │                                    - Mantener mi cambio
    │                                    - Aceptar cambio remoto
    │                                    - Ver diferencias
```

## Patrones de Diseño

### 1. Observer Pattern (Realtime)

```javascript
// Suscribirse a cambios
const subscription = realtime.subscribeToRequests((payload) => {
  const { eventType, new: newData, old: oldData } = payload
  
  if (eventType === 'INSERT') {
    requestsStore.addRequest(newData)
  } else if (eventType === 'UPDATE') {
    requestsStore.updateRequest(newData.id, newData)
  } else if (eventType === 'DELETE') {
    requestsStore.deleteRequest(oldData.id)
  }
})

// Desuscribirse
realtime.unsubscribe(subscription)
```

### 2. Store Pattern (Zustand)

```javascript
// Estado centralizado
const useRequestsStore = create((set, get) => ({
  requests: [],
  addRequest: (request) => set(state => ({
    requests: [request, ...state.requests]
  })),
  updateRequest: (id, updates) => set(state => ({
    requests: state.requests.map(r =>
      r.id === id ? { ...r, ...updates } : r
    )
  })),
  // Computadas
  getStats: () => {
    const { requests } = get()
    return {
      total: requests.length,
      pending: requests.filter(r => r.state === 'pending').length
    }
  }
}))
```

### 3. Service Layer

```javascript
// Abstracción de Supabase
export const db = {
  createRequest: async (request) => {
    const { data, error } = await supabase
      .from('requests')
      .insert([request])
      .select()
    if (error) throw error
    return data
  }
}

// Uso en componentes
const { addRequest } = useRequestsStore()
const result = await db.createRequest(formData)
addRequest(result[0])
```

### 4. Protected Route Pattern

```javascript
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore()
  
  if (loading) return <Loading />
  return user ? children : <Navigate to="/login" />
}

// Uso
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

## Gestión de Estado

```javascript
// Auth Store
{
  user: User | null,
  session: Session | null,
  userProfile: UserProfile | null,
  loading: boolean,
  error: string | null,
  setUser, setSession, setUserProfile,
  logout, hasRole, hasPermission
}

// Requests Store
{
  requests: Request[],
  selectedRequest: Request | null,
  loading: boolean,
  filters: { state, search, date },
  
  setRequests, addRequest, updateRequest, deleteRequest,
  setFilters, getFilteredRequests, getStats
}

// UI Store
{
  sidebarOpen: boolean,
  darkMode: boolean,
  notificationsOpen: boolean,
  userMenuOpen: boolean,
  
  toggleSidebar, toggleDarkMode, etc.
}

// Sync Store
{
  isOnline: boolean,
  lastSync: Date | null,
  syncing: boolean,
  conflictedRequests: Request[],
  
  setOnline, addConflict, resolveConflict
}
```

## Componentes Principales

### Jerarquía de Componentes

```
App
├── Layout
│   ├── Sidebar
│   ├── Header
│   └── Main Content
│       ├── DashboardPage
│       ├── RequestsListPage
│       │   ├── RequestFilters
│       │   └── RequestTable
│       │       └── RequestActions
│       ├── NewRequestPage
│       ├── AuditPage
│       └── ProfilePage
├── LoginPage
└── RegisterPage
```

### Props Flow

```
Layout (sidebarOpen, userProfile)
  ├── Sidebar (userProfile)
  ├── Header (isOnline, userProfile)
  └── Route
      ├── DashboardPage (userProfile, requests)
      │   ├── StatCard (title, value, icon)
      │   ├── RecentRequests (requests)
      │   └── ActivityFeed (activities)
      └── RequestsListPage (requests, filters)
          ├── RequestFilters (filters, setFilters)
          └── RequestTable (requests, permissions)
              └── RequestActions (request, permissions)
```

## Flujos de Autenticación

### Signup Flow

```
1. RegisterPage → auth.signUp()
2. Supabase crea user en auth.users
3. Email de confirmación enviado
4. Usuario confirma email
5. Crear perfil en users table
6. Usuario redirigido a login
7. Verificación en login
```

### Login Flow

```
1. LoginPage → auth.signIn(email, password)
2. Supabase valida credenciales
3. Retorna session + user
4. useAuthStore.setSession()
5. Cargar userProfile desde users table
6. useAuthStore.setUserProfile()
7. Redirigir a /dashboard
8. RLS protege datos según rol
```

### Protected Route Flow

```
1. Usuario accede a /dashboard
2. ProtectedRoute verifica user
3. Si user === null → redirigir a /login
4. Si loading === true → mostrar Loading
5. Si user → renderizar componente
6. Componente puede acceder a userProfile.role
```

## Optimistic Locking

```javascript
// Versión antes: 1
const request = { id: X, state: 'pending', version: 1 }

// Usuario intenta cambiar a 'assigned'
// Optimistic update inmediato
updateUI({ state: 'assigned' })

// Enviar a BD
const response = await supabase
  .from('requests')
  .update({ state: 'assigned', version: 2 })
  .eq('id', X)
  .eq('version', 1)
  .select()

// Si response vacío → conflicto
if (response.length === 0) {
  // Mostrar conflicto
  // Opción: Reload, merge, o ask user
}
```

## Sync en Tiempo Real

```
Evento de Cambio
      ↓
Trigger en BD
      ↓
Supabase Realtime
      ↓
Broadcast a clientes
      ↓
Zustand Store
      ↓
React re-render
      ↓
UI actualizada
```

## Performance

### Optimizaciones

1. **Lazy Loading**
   - Componentes lazy loaded
   - Rutas con React.lazy

2. **Memoization**
   - useCallback para handlers
   - useMemo para computaciones

3. **Bundle Size**
   - Tree shaking
   - Code splitting
   - Dynamic imports

4. **Caché Local**
   - LocalStorage para estado
   - IndexedDB para datos

5. **Queries Optimizadas**
   - Índices en BD
   - Paginación
   - Filtros en servidor

## Seguridad

```
Niveles de seguridad:

1. FRONTEND
   ├─ Validación de input
   ├─ Sanitización
   └─ HTTPS only

2. AUTENTICACIÓN
   ├─ JWT tokens
   ├─ Refresh tokens
   └─ Secure storage

3. AUTORIZACIÓN
   ├─ RBAC
   ├─ RLS en BD
   └─ API authorization

4. DATOS
   ├─ Encriptación en tránsito
   ├─ Encriptación en reposo
   └─ Backups regulares

5. AUDITORÍA
   ├─ Todos los cambios registrados
   ├─ Trazabilidad completa
   └─ Retención de logs
```

## Error Handling

```
Error Flow:

1. Error ocurre (network, validation, server)
   ↓
2. Catch en try-catch o Suspense
   ↓
3. useErrorStore.setError()
   ↓
4. Mostrar UI de error
   ├─ Toast notification
   ├─ Error boundary
   ├─ Fallback component
   └─ Retry option
   ↓
5. Log error (en producción)
```

---

**Nota**: Esta arquitectura está diseñada para escalabilidad, mantenibilidad y colaboración en tiempo real.
