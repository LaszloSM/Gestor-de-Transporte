# 🎨 Guía de Diseño - Gestor de Transporte Electoral

## 📐 Sistema de Diseño

### Paleta de Colores

#### Colores Primarios
```
Azul Principal:     #2563eb (rgb(37, 99, 235))
Azul Claro:        #93c5fd (rgb(147, 197, 253))
Azul Oscuro:       #1e40af (rgb(30, 64, 175))
```

#### Colores de Estado
```
✓ Completado (Verde):   #10b981 (rgb(16, 185, 129))
⏳ Pendiente (Amarillo): #f59e0b (rgb(245, 158, 11))
→ Asignado (Azul):      #3b82f6 (rgb(59, 130, 246))
✗ Error (Rojo):         #ef4444 (rgb(239, 68, 68))
```

#### Escala de Grises
```
Muy Claro:  #f8fafc (Fondo)
Claro:      #e2e8f0 (Bordes)
Medio:      #64748b (Texto secundario)
Oscuro:     #1e293b (Texto principal)
```

### Tipografía

```
Font Family: Inter, system-ui, sans-serif

Tamaños:
- Encabezado H1: 32px, Bold (800)
- Encabezado H2: 24px, Bold (700)
- Encabezado H3: 20px, Semibold (600)
- Body:           16px, Regular (400)
- Pequeño:        14px, Regular (400)
- Muy pequeño:    12px, Regular (400)

Line-height:
- Encabezados: 1.2
- Body: 1.5
- Pequeño: 1.4
```

### Espaciado (Sistema de 4px)

```
xs:  4px    (1 unidad)
sm:  8px    (2 unidades)
md:  16px   (4 unidades)
lg:  24px   (6 unidades)
xl:  32px   (8 unidades)
2xl: 48px   (12 unidades)
```

### Sombras

```
Sombra pequeña:
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

Sombra media:
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

Sombra grande:
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
```

### Bordes Redondeados

```
Pequeño:   4px
Medio:     8px
Grande:    12px
Circular:  50%
```

## 🖼️ Componentes

### Botones

#### Primario (CTA)
```
Estado: Normal
- Color: bg-primary-600 text-white
- Padding: px-4 py-2
- Border Radius: rounded-lg
- Font: font-medium
- Hover: bg-primary-700

Estado: Disabled
- Color: opacity-50
- Cursor: not-allowed
```

#### Secundario
```
- Color: bg-slate-200 text-slate-900
- Padding: px-4 py-2
- Border Radius: rounded-lg
- Hover: bg-slate-300
```

#### Peligro (Destructivo)
```
- Color: bg-red-600 text-white
- Hover: bg-red-700
- Confirmación: Requiere confirmación
```

### Tarjetas (Cards)

```
- Background: bg-white
- Border: border border-slate-200
- Border Radius: rounded-lg
- Sombra: shadow-sm
- Padding: p-6
- Hover: shadow-md transition-shadow

Estructura:
├─ Header (opcional)
│  ├─ Título
│  └─ Acciones
├─ Content
└─ Footer (opcional)
```

### Formularios

#### Campo de Entrada
```
- Border: border border-slate-300
- Padding: px-4 py-2
- Border Radius: rounded-lg
- Focus: ring-2 ring-primary-500
- Font: text-sm
- Error: border-danger

Etiqueta:
- Font: text-sm font-medium text-slate-700
- Margin-bottom: mb-1
```

#### Validación
```
Error: 
- Border rojo
- Icono de error
- Mensaje debajo en rojo

Requerido:
- Asterisco rojo después de etiqueta
- Campo remarcado
```

### Badges

```
Pendiente:
- bg-yellow-100 text-yellow-800

Asignado:
- bg-blue-100 text-blue-800

Completado:
- bg-green-100 text-green-800

Admin:
- bg-purple-100 text-purple-800
```

### Tabla

```
Encabezado:
- Background: bg-slate-50
- Border bottom: border-b border-slate-200
- Font: font-semibold text-slate-900
- Padding: px-6 py-3

Celdas:
- Border bottom: border-b border-slate-200
- Padding: px-6 py-4
- Font: text-sm text-slate-900
- Hover: hover:bg-slate-50

Última fila: sin border-bottom
```

## 🎯 Wireframes

### Pantalla de Login

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                                                     │
│          ┌───────────────────────────────────┐     │
│          │      [LOGO]                       │     │
│          │   Electoral Transport Manager     │     │
│          │   Gestiona el transporte         │     │
│          │                                   │     │
│          │  ┌────────────────────────────┐  │     │
│          │  │  Email: _______________   │  │     │
│          │  ├────────────────────────────┤  │     │
│          │  │  Password: _______________│  │     │
│          │  ├────────────────────────────┤  │     │
│          │  │   [SIGN IN BUTTON]        │  │     │
│          │  ├────────────────────────────┤  │     │
│          │  │ ¿No tienes cuenta?        │  │     │
│          │  │ Crear cuenta              │  │     │
│          │  └────────────────────────────┘  │     │
│          │                                   │     │
│          └───────────────────────────────────┘     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│ ≡ ELECTORAL        │ 🔔  👤 [User Menu]                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Panel de Control                                    [Badge] │
│                                                              │
│  ┌──────────────┬──────────────┬──────────────┬────────────┐ │
│  │ Total: 24    │ Pendientes: 8 │ Asignadas: 12 │Completo: 4│ │
│  │ 📋           │ ⏳             │ ✓             │ 🎉        │ │
│  └──────────────┴──────────────┴──────────────┴────────────┘ │
│                                                              │
│  ┌────────────────────────────────┬──────────────────────┐  │
│  │ Solicitudes Recientes          │ Actividad Reciente   │  │
│  ├────────────────────────────────┤──────────────────────┤  │
│  │ Juan Pérez - C → P             │ 📝 Juan creó request │  │
│  │ Hace 5 min [PENDIENTE]         │ Hace 5 min          │  │
│  ├────────────────────────────────┤──────────────────────┤  │
│  │ María García - D → V           │ ✓ María asignó      │  │
│  │ Hace 15 min [ASIGNADO]         │ Hace 15 min        │  │
│  ├────────────────────────────────┤──────────────────────┤  │
│  │ Carlos López - Z → P           │ ✓ Carlos completó   │  │
│  │ Hace 30 min [COMPLETADO]       │ Hace 30 min        │  │
│  └────────────────────────────────┴──────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Lista de Solicitudes

```
┌──────────────────────────────────────────────────────────────┐
│ Solicitudes de Transporte                   [+ NUEVA]        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Filtros:                                                     │
│ [Buscar...] [Estado ▼] [Limpiar]                           │
│                                                              │
├──────┬──────┬─────┬──────┬──────┬──────┬──────┬──────────┤ │
│Pasaj.│Cant. │Vehi.│Origen│Desti│Hora │Estado│Acciones  │ │
├──────┼──────┼─────┼──────┼──────┼──────┼──────┼──────────┤ │
│Juan  │  3   │ Car │  Z   │  P  │08:00│[P]  │ ⋮       │ │
├──────┼──────┼─────┼──────┼──────┼──────┼──────┼──────────┤ │
│María │  2   │ Car │  A   │  P  │09:30│[A]  │ ⋮       │ │
├──────┼──────┼─────┼──────┼──────┼──────┼──────┼──────────┤ │
│Carlos│  1   │Moto │  B   │  P  │10:15│[C]  │ ⋮       │ │
└──────┴──────┴─────┴──────┴──────┴──────┴──────┴──────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Formulario Nueva Solicitud

```
┌──────────────────────────────────────────────────────────────┐
│ Nueva Solicitud de Transporte                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ INFORMACIÓN DEL PASAJERO                                    │
│ ┌─────────────────────────┬─────────────────────────┐       │
│ │ Nombre *                │ Teléfono *              │       │
│ │ [________________]       │ [________________]       │       │
│ └─────────────────────────┴─────────────────────────┘       │
│ ┌─────────────────────────┬─────────────────────────┐       │
│ │ Cantidad *              │ Tipo de Vehículo *      │       │
│ │ [_] ↑↓                  │ [Carro ▼]              │       │
│ └─────────────────────────┴─────────────────────────┘       │
│                                                              │
│ UBICACIONES Y HORARIO                                       │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Origen *                                            │    │
│ │ [________________________]                          │    │
│ └──────────────────────────────────────────────────────┘    │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Destino *                                           │    │
│ │ [________________________]                          │    │
│ └──────────────────────────────────────────────────────┘    │
│ ┌─────────────────────────┬─────────────────────────┐       │
│ │ Hora *                  │                         │       │
│ │ [__:__]                 │                         │       │
│ └─────────────────────────┴─────────────────────────┘       │
│                                                              │
│ INFORMACIÓN ADICIONAL                                       │
│ ┌──────────────────────────────────────────────────────┐    │
│ │ Notas (Opcional)                                    │    │
│ │ [____________________________                        │    │
│ │  ____________________________]                       │    │
│ └──────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌──────────────────────────┬──────────────────────────┐     │
│ │ [CANCELAR]               │ [CREAR SOLICITUD]       │     │
│ └──────────────────────────┴──────────────────────────┘     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## 🎬 Flujos de Usuario

### Flujo: Crear Solicitud (Operador)

```
1. Login
   ↓
2. Dashboard
   ↓
3. Click "Nueva Solicitud"
   ↓
4. Completar Formulario
   ├─ Validación en tiempo real
   └─ Error messages claros
   ↓
5. Submit
   ├─ Loading state
   └─ Toast: "Solicitud creada"
   ↓
6. Redireccionar a Lista
```

### Flujo: Asignar Transporte (Coordinador)

```
1. Dashboard
   ↓
2. Ver solicitud [PENDIENTE]
   ↓
3. Click Acciones → Asignar
   ↓
4. Modal: Seleccionar transportador
   ├─ Búsqueda
   └─ Listar disponibles
   ↓
5. Seleccionar y Confirmar
   ├─ Optimistic update
   └─ Toast: "Asignado a..."
   ↓
6. Estado actualizado [ASIGNADO]
```

### Flujo: Enviar WhatsApp (Coordinador)

```
1. Click Acciones → Enviar WhatsApp
   ↓
2. Modal WhatsApp:
   ├─ Seleccionar contacto
   ├─ Ver preview del mensaje
   └─ Botón "Enviar"
   ↓
3. Redirigir a WhatsApp Web
   ├─ Mensaje precompletado
   └─ Usuario confirma
   ↓
4. Registrar en historial
   └─ Toast: "Mensaje enviado"
```

### Flujo: Ver Auditoría (Admin)

```
1. Click Auditoría
   ↓
2. Tabla con:
   ├─ Fecha/Hora
   ├─ Usuario
   ├─ Acción
   ├─ Recurso
   └─ Cambios
   ↓
3. Filtrar por:
   ├─ Usuario
   ├─ Acción
   ├─ Rango de fechas
   └─ Recurso
```

## 🖌️ Estados Visuales

### Estados Vacíos

```
Cuando no hay solicitudes:

      📭
   
   No hay solicitudes
   
   Crea tu primera solicitud de transporte
   para comenzar
```

### Estados de Carga

```
Spinner con animación:

  ⟳ Cargando...
  
Pulse animation para placeholders
```

### Estados de Error

```
⚠️ Error

Algo salió mal. Por favor intenta de nuevo.

[REINTENTAR]
```

### Estados Offline

```
🚫 Sin Conexión

La aplicación está funcionando en modo offline.
Los cambios se sincronizarán cuando se restaure
la conexión.
```

## 📱 Responsive Design

### Breakpoints

```
Mobile:    320px - 767px
Tablet:    768px - 1024px
Desktop:   1025px - 1920px
Large:     1921px+

Grid Layout:
- Mobile:   1 column
- Tablet:   2 columns
- Desktop:  3+ columns
```

### Adaptaciones

```
MOBILE:
- Sidebar colapsado
- Tablas scrolleables
- Botones más grandes
- Espaciado reducido

TABLET:
- Sidebar visible con texto
- Tablas parcialmente scrolleables
- Botones normales

DESKTOP:
- Sidebar completo
- Tablas completas
- Layout óptimo
```

## ♿ Accesibilidad

```
WCAG 2.1 Level AA:
- Contraste mínimo 4.5:1
- Labels para inputs
- Alt text para imágenes
- Keyboard navigation
- Focus visible
- ARIA attributes
```

## 🎨 Variantes de Componentes

### Botones

```
Normal:     bg-primary-600 → hover: bg-primary-700
Secondary: bg-slate-200 → hover: bg-slate-300
Danger:    bg-red-600 → hover: bg-red-700
Disabled:  opacity-50 cursor-not-allowed
Large:    px-6 py-3
Small:    px-2 py-1
```

### Tarjetas

```
Default:   bg-white border-slate-200
Hover:     shadow-md
Active:    border-primary-500
Error:     border-red-300 bg-red-50
Success:   border-green-300 bg-green-50
```

---

**Nota**: Esta guía debe actualizarse conforme evoluciona el diseño del producto.
