# Gestor de Transporte Electoral

Una aplicación web profesional para gestionar el transporte de votantes durante el día de elecciones, con soporte para múltiples usuarios trabajando en tiempo real.

## 📋 Descripción del Proyecto

El **Gestor de Transporte Electoral** es una solución completa diseñada para coordinar y gestionar solicitudes de transporte para llevar votantes a sus lugares de votación. Incluye autenticación, control de roles, auditoría, integración con WhatsApp y actualizaciones en tiempo real.

## 🎯 Características Principales

### Autenticación y Roles
- ✅ Sistema de autenticación con Supabase Auth
- ✅ 3 roles de usuario: Operador, Coordinador, Administrador
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Indicador visual del usuario activo

### Gestión de Solicitudes
- ✅ Crear solicitudes de transporte
- ✅ Filtrar por estado (Pendiente, Asignado, Completado)
- ✅ Búsqueda en tiempo real
- ✅ Actualización multiusuario en tiempo real
- ✅ Indicador visual de cambios simultáneos

### Acciones Disponibles
- ✅ Asignar transportes
- ✅ Marcar como completado
- ✅ Reabrir solicitudes
- ✅ Enviar información por WhatsApp
- ✅ Generar tarjetas de transporte
- ✅ Eliminar registros (solo admin)

### Panel de Auditoría
- ✅ Registro completo de cambios
- ✅ Historial de acciones por usuario
- ✅ Trazabilidad total
- ✅ Disponible solo para administradores

### Dashboard
- ✅ Estadísticas en tiempo real
- ✅ Feed de actividad
- ✅ Solicitudes recientes
- ✅ Indicador de conexión

## 🛠️ Stack Tecnológico

### Frontend
- **React 18**: Librería de UI
- **Vite**: Bundler y servidor de desarrollo
- **React Router DOM**: Enrutamiento
- **TailwindCSS**: Estilos
- **Zustand**: Gestión de estado

### Backend & Base de Datos
- **Supabase**: Auth, Database, Realtime
- **PostgreSQL**: Base de datos

### Integraciones
- **WhatsApp API**: Envío de mensajes
- **QR Code**: Generación de códigos QR
- **HTML2Canvas**: Captura de pantalla de tarjetas
- **jsPDF**: Descarga de tarjetas como PDF

## 📁 Estructura del Proyecto

```
gestor-transporte-electoral/
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── StatCard.jsx
│   │   ├── RequestTable.jsx
│   │   ├── RequestActions.jsx
│   │   ├── RequestFilters.jsx
│   │   ├── RecentRequests.jsx
│   │   └── ActivityFeed.jsx
│   ├── pages/                # Páginas de la aplicación
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── RequestsListPage.jsx
│   │   ├── NewRequestPage.jsx
│   │   ├── AuditPage.jsx
│   │   └── ProfilePage.jsx
│   ├── services/             # Servicios e integraciones
│   │   └── supabase.js
│   ├── stores/               # Estado global (Zustand)
│   │   └── index.js
│   ├── App.jsx              # Componente principal
│   ├── main.jsx             # Punto de entrada
│   ├── config.js            # Configuración
│   └── index.css            # Estilos globales
├── index.html               # HTML raíz
├── package.json             # Dependencias
├── vite.config.js           # Configuración de Vite
├── tailwind.config.js       # Configuración de TailwindCSS
├── postcss.config.js        # Configuración de PostCSS
└── .env.example             # Variables de entorno (ejemplo)
```

## 👥 Roles y Permisos

### Operador
| Acción | Permiso |
|--------|---------|
| Crear solicitudes | ✅ |
| Ver solicitudes | ✅ |
| Asignar transporte | ❌ |
| Completar solicitud | ❌ |
| Enviar WhatsApp | ❌ |
| Eliminar solicitud | ❌ |
| Ver auditoría | ❌ |

### Coordinador
| Acción | Permiso |
|--------|---------|
| Crear solicitudes | ❌ |
| Ver solicitudes | ✅ |
| Asignar transporte | ✅ |
| Completar solicitud | ✅ |
| Enviar WhatsApp | ✅ |
| Eliminar solicitud | ❌ |
| Ver auditoría | ❌ |

### Administrador
| Acción | Permiso |
|--------|---------|
| Crear solicitudes | ✅ |
| Ver solicitudes | ✅ |
| Asignar transporte | ✅ |
| Completar solicitud | ✅ |
| Enviar WhatsApp | ✅ |
| Eliminar solicitud | ✅ |
| Ver auditoría | ✅ |

## 🚀 Instalación y Configuración

### Requisitos Previos
- Node.js 16+
- npm o yarn
- Cuenta en Supabase

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd gestor-transporte-electoral
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env.local
```

Edita `.env.local` con tus credenciales de Supabase:
```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_anon_key
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

5. **Construir para producción**
```bash
npm run build
```

## 📊 Estados de Solicitud

```
PENDIENTE → ASIGNADO → COMPLETADO
     ↑                      ↓
     └─── REABIERTO ←───────┘
```

- **Pendiente**: Solicitud creada, aguardando asignación
- **Asignado**: Transporte asignado al pasajero
- **Completado**: Solicitud finalizada
- **Reabierto**: Solicitud reabierta (si fue completada erróneamente)

## 🔐 Seguridad

### Autenticación
- Supabase Auth con contraseñas hasheadas
- Sesiones seguras
- Token JWT para API calls

### Autorización
- RBAC (Role-Based Access Control)
- Validación en frontend y backend
- Permisos por acción

### Auditoría
- Registro de todas las acciones
- Trazabilidad completa
- Timestamp exacto

## 🌐 Diseño Visual

### Paleta de Colores
- **Primario**: Azul (#2563eb)
- **Éxito**: Verde (#10b981)
- **Advertencia**: Amarillo (#f59e0b)
- **Peligro**: Rojo (#ef4444)

### Tipografía
- **Fuente**: Inter (sin serifs)
- **Clara y legible**
- **Responsive**

### Componentes
- Tarjetas (Cards)
- Botones accesibles
- Tablas responsive
- Formularios validados
- Modales

## 📱 Responsividad

- ✅ Adaptado para desktop (1920px+)
- ✅ Adaptado para tablet (768px - 1024px)
- ✅ Adaptado para móvil (320px - 767px)
- ✅ Interfaz táctil optimizada

## ⚡ Rendimiento

- Carga inicial < 3s
- Componentes lazy loaded
- Caché local
- Optimized bundle size
- Modo offline temporal

## 🔄 Actualizaciones en Tiempo Real

Usando Supabase Realtime:
- Cambios de estado sincronizados
- Notificaciones de nuevas solicitudes
- Indicadores de usuarios activos
- Conflicto detection

## 📲 Integración WhatsApp

- Selección de contacto
- Vista previa de mensaje
- Historial de envíos
- Plantillas de mensajes

## 📄 Especificaciones Técnicas

### Base de Datos

#### Tabla: requests
```sql
- id (UUID, PK)
- created_by (UUID, FK)
- passenger_name (VARCHAR)
- passenger_phone (VARCHAR)
- quantity (INTEGER)
- vehicle_type (ENUM)
- origin (VARCHAR)
- destination (VARCHAR)
- time (TIME)
- state (ENUM)
- notes (TEXT)
- assigned_to (UUID, FK)
- completed_by (UUID, FK)
- version (INTEGER) -- Para optimistic locking
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- completed_at (TIMESTAMP)
```

#### Tabla: users
```sql
- id (UUID, PK)
- email (VARCHAR, UNIQUE)
- full_name (VARCHAR)
- role (ENUM: admin, coordinator, operator)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### Tabla: audit_logs
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- action (VARCHAR)
- resource_type (VARCHAR)
- resource_id (UUID)
- changes (JSONB)
- created_at (TIMESTAMP)
```

#### Tabla: whatsapp_messages
```sql
- id (UUID, PK)
- request_id (UUID, FK)
- recipient (VARCHAR)
- message (TEXT)
- sent_by (UUID, FK)
- sent_at (TIMESTAMP)
```

## 🚨 Manejo de Errores

- Try-catch blocks
- Error messages legibles
- Toast notifications
- Fallback UI
- Modo offline

## 📝 Logging

- Console logs en desarrollo
- Error tracking en producción
- Audit trail completo

## 🧪 Testing (Futuro)

- Unit tests con Jest
- Integration tests
- E2E tests con Cypress
- Coverage > 80%

## 📖 Documentación API

[Ver archivo API.md]

## 🤝 Contribuciones

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.

## 📞 Soporte

Para soporte o reportar bugs, crear un issue en el repositorio.

## 🗓️ Roadmap

- [ ] Integración con Twilio para SMS
- [ ] Exportación de reportes (Excel, PDF)
- [ ] Notificaciones push
- [ ] Modo offline completo
- [ ] Mapas interactivos
- [ ] Estadísticas avanzadas
- [ ] Dashboard de coordinador
- [ ] Integración con WhatsApp Business API

## 👨‍💼 Autor

Desarrollado para gestionar eficientemente el transporte electoral.

---

**Nota**: Esta es una aplicación de demostración. Para uso en producción, asegúrate de implementar medidas de seguridad adicionales y pruebas exhaustivas.
