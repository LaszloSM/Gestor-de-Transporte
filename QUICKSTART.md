# ⚡ Guía Rápida de Inicio

## 🚀 Primeros Pasos (5 minutos)

### 1. Clonar y Setup
```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env.local

# Editar .env.local con tus credenciales de Supabase
```

### 2. Configurar Supabase
1. Ir a https://app.supabase.com
2. Crear nuevo proyecto
3. Obtener URL y Anon Key
4. Pegar en `.env.local`:
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJx...xxx
   ```
5. Ejecutar SQL del archivo `DATABASE.md` en el editor SQL de Supabase

### 3. Iniciar servidor
```bash
npm run dev
```

Abre http://localhost:5173 en tu navegador.

---

## 📝 Crear Nueva Solicitud

1. Login con credenciales de Operador o Administrador
2. Click en "Nueva Solicitud" (o navega a `/new-request`)
3. Completar formulario:
   - Nombre pasajero (requerido)
   - Teléfono (requerido)
   - Cantidad (requerido)
   - Tipo de vehículo
   - Origen (requerido)
   - Destino (requerido)
   - Hora (requerido)
   - Notas (opcional)
4. Click en "Crear Solicitud"
5. Verás confirmación y serás redirigido a la lista

---

## 📋 Gestionar Solicitudes

### Ver todas las solicitudes
- Navigate a `/requests`
- Aparece tabla con todas las solicitudes

### Filtrar solicitudes
```
Búsqueda: Escribe nombre, origen o destino
Estado: Selecciona Pendiente/Asignado/Completado
Limpiar: Resets todos los filtros
```

### Acciones según rol

**OPERADOR:**
- ✅ Crear solicitudes
- ✅ Ver solicitudes

**COORDINADOR:**
- ✅ Ver solicitudes
- ✅ Asignar transporte
- ✅ Marcar como completado
- ✅ Enviar por WhatsApp

**ADMINISTRADOR:**
- ✅ Todo
- ✅ Ver auditoría
- ✅ Eliminar solicitudes

---

## 📲 Enviar WhatsApp

1. En lista de solicitudes, click en el menú de acciones (⋮)
2. Click en "Enviar WhatsApp"
3. Se abre modal con:
   - Preview del mensaje
   - Botón "Enviar por WhatsApp"
4. Se abre WhatsApp Web con mensaje precompletado
5. Confirma y envía
6. Historial se actualiza

---

## 📊 Dashboard

- **Total Solicitudes**: Contador de todas
- **Pendientes**: Aún sin asignar
- **Asignadas**: Transporte asignado
- **Completadas**: Viaje realizado
- **Actividad Reciente**: Feed de cambios

---

## 🔍 Auditoría (Admin Only)

1. Click en "Auditoría" en sidebar
2. Ver tabla con:
   - Quién hizo qué
   - Cuándo lo hizo
   - Qué cambios se hicieron

---

## 👤 Mi Perfil

1. Click en avatar en header (arriba derecha)
2. Click en "Ver Perfil"
3. Ver información de usuario
4. Click "Cerrar Sesión" para logout

---

## 🎨 Tema y Preferencias

```javascript
// En Header, futuro: Dark mode toggle
useUIStore(state => state.toggleDarkMode())
```

---

## 🚨 Troubleshooting

### Error: "VITE_SUPABASE_URL no definido"
```bash
# Solución: Revisa que .env.local exista y tenga:
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

### Error: "Conexión rechazada"
```bash
# Solución: Verifica que:
1. Supabase URL y Key sean correctas
2. Proyecto esté online en Supabase
3. RLS policies estén correctas
```

### Error: "No autorizado"
```bash
# Solución: Verifica:
1. Login correcto
2. Rol del usuario
3. RLS policies en BD
```

### Datos no se sincroniza
```bash
# Solución:
1. Refresh la página
2. Verifica conexión internet
3. Abre consola y busca errores
```

---

## 📚 Estructura de Carpetas Explicada

```
src/
├── components/       ← Componentes reutilizables
│   ├── Layout        ← Estructura principal
│   ├── Header        ← Barra superior
│   └── ...
├── pages/           ← Páginas completas
│   ├── LoginPage
│   ├── DashboardPage
│   └── ...
├── services/        ← Integración con APIs
│   └── supabase.js  ← Funciones de BD
├── stores/          ← Estado global
│   └── index.js     ← Zustand stores
├── config.js        ← Configuración
├── index.css        ← Estilos globales
└── App.jsx          ← App principal
```

---

## 🔑 Variables de Entorno

```
VITE_SUPABASE_URL       = URL de tu proyecto Supabase
VITE_SUPABASE_ANON_KEY  = Clave anónima de Supabase
VITE_WHATSAPP_API_KEY   = (Opcional) Para WhatsApp business
VITE_ENV                = development | production
```

---

## ⌨️ Comandos Útiles

```bash
# Desarrollo
npm run dev           # Iniciar servidor

# Build
npm run build         # Compilar para producción
npm run preview       # Preview del build

# Linting
npm run lint          # Verificar código

# Database
# Ver DATABASE.md para inicializar BD
```

---

## 🎯 Flujos Comunes

### Flujo: Día de Elecciones

```
Mañana:
1. Operadores crean solicitudes según demanda
2. Coordinadores asignan transportes disponibles
3. Notificaciones por WhatsApp a pasajeros

Durante el día:
1. Seguimiento en tiempo real del dashboard
2. Cambios de estado (pendiente → asignado → completado)
3. Actividad visible para todos

Final:
1. Admin revisa auditoría
2. Exporta reportes
3. Verifica números totales
```

### Flujo: Resolver Conflicto

```
Situación: Dos coordinadores asignan mismo transporte

1. Usuario A asigna a "Carlos"
2. Usuario B intenta asignar a "María"
3. Sistema detecta conflicto
4. Usuario B ve opción de:
   - Mantener su asignación (sobrescribir)
   - Ver cambio de otro usuario
   - Elegir otro vehículo
```

---

## 📱 Mobile

- Sidebar automáticamente colapsado
- Tablas scrolleables horizontalmente
- Botones más grandes para toque
- Todavía totalmente funcional

---

## 🔒 Seguridad

- ✅ Autenticación obligatoria
- ✅ Encriptación de contraseñas
- ✅ HTTPS solo
- ✅ Tokens JWT seguros
- ✅ RLS en base de datos
- ✅ Auditoría completa

---

## 📞 Soporte Rápido

**Problema**: Página en blanco
**Solución**: Abre consola (F12) y busca errores

**Problema**: Botón no funciona
**Solución**: Revisa permisos del rol

**Problema**: Datos no se actualizan
**Solución**: Espera 1-2s o refresh la página

---

## ✅ Checklist Antes de Producción

- [ ] Supabase configurado correctamente
- [ ] RLS policies aplicadas
- [ ] Database inicial poblada
- [ ] .env.local configurado (no .env!)
- [ ] npm run build sin errores
- [ ] Testing manual completado
- [ ] Botones y textos funcionales
- [ ] Responsive en móvil
- [ ] Auditoría configurada
- [ ] WhatsApp templates listos
- [ ] Backup de BD configurado

---

**¿Preguntas?** Ver README.md, ARCHITECTURE.md o DATABASE.md para más detalles.
