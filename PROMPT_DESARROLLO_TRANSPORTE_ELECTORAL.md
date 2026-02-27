# Prompt de desarrollo: Sistema de gestión de transporte electoral

Documento de especificación para el equipo de desarrollo (Cursor). Objetivo: entregar un producto profesional, pulido y listo para producción para la gestión del transporte de votantes durante elecciones.

---

## 1. Diseño del sistema

### 1.1 Rediseño completo de la interfaz

- **Estética:** Diseño profesional, minimalista y elegante. Paleta de colores moderna y coherente en toda la aplicación (evitar mezclas de estilos o colores inconsistentes).
- **Animaciones:** Animaciones fluidas y sutiles (transiciones de página, modales, hover, carga). Evitar animaciones bruscas o que distraigan.
- **Contenido:** Todo el contenido debe estar centrado y bien alineado. Sin recortes feos, elementos borrosos innecesarios ni desbordes de texto (usar `truncate`, `line-clamp`, `overflow-hidden` donde corresponda).
- **Lógica visual:** La interfaz debe reflejar la lógica del sistema: cada rol ve solo lo que le corresponde; los estados (pendiente, asignado, completado) deben ser claros; las acciones disponibles deben ser obvias según el contexto.
- **Limpieza:** No mostrar credenciales de prueba, URLs de API ni texto de depuración en producción. No incluir mensajes largos de “primera vez” o instrucciones de setup en la UI de producción. Mantener un look limpio y eficiente.

### 1.2 Recomendaciones de diseño

- Usar un sistema de diseño consistente: variables CSS o Tailwind para colores, espaciado, bordes y tipografía.
- Modales y cards con bordes redondeados coherentes (ej. `rounded-2xl`), sombras suaves y backdrop semitransparente con blur.
- Tablas responsivas con scroll horizontal en móvil y celdas que no desborden (truncar con tooltip o modal de detalle).
- Estados de carga (skeleton o spinner) y feedback claro al guardar (toast o mensaje inline).

---

## 2. Persistencia de datos

### 2.1 Base de datos (Supabase)

- Todas las **solicitudes** se guardan en tiempo real en Supabase. Al recargar la página, los datos deben cargarse desde la base de datos y mostrarse correctamente (nunca depender solo de estado local en memoria).
- Al iniciar la aplicación (o al entrar en la sección de solicitudes), se debe ejecutar una carga inicial desde `requests` y, si está implementado, suscribirse a cambios en tiempo real (Realtime de Supabase) para actualizar la lista ante inserciones, actualizaciones o eliminaciones.
- Garantizar que no haya pérdida de datos: cada creación, asignación, completado o eliminación debe persistirse en Supabase antes de actualizar la UI. En caso de error de red, mostrar un mensaje claro y no dar por guardado el cambio.

### 2.2 Auditoría

- La auditoría debe capturar **cada cambio** relevante en el sistema, con persistencia en una tabla `audit_logs` (o equivalente) en Supabase.
- Registrar al menos:
  - **Creación de solicitud:** fecha, hora, usuario que crea, datos del pasajero (nombre, teléfono, origen, destino, hora, tipo de vehículo, etc.).
  - **Asignación:** fecha, hora, usuario que asigna, solicitud, conductor asignado (nombre y/o teléfono WhatsApp).
  - **Completado:** fecha, hora, usuario que marca completado, solicitud.
  - **Reapertura:** fecha, hora, usuario, solicitud.
  - **Eliminación:** fecha, hora, usuario, datos de la solicitud eliminada.
- Los registros de auditoría deben ser inmutables (solo inserción, sin edición ni borrado desde la app) y visibles solo para roles con permiso de auditoría (p. ej. administrador y superusuario).

---

## 3. Roles y responsabilidades

Definición estricta de roles y permisos. Evitar redundancia en la visualización del rol (mostrar el rol una sola vez, por ejemplo en el header o en el menú de usuario, sin duplicar badges o etiquetas).

| Rol            | Descripción breve                                                                 | Permisos principales                                                                 |
|----------------|------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| **Superusuario** | Único en el sistema; puede asignar rol de administrador a otros usuarios.          | Todo lo del administrador; no puede ser desasignado ni desactivado; rol fijo por email. |
| **Administrador** | Gestiona usuarios, solicitudes, auditoría y panel de control.                       | CRUD usuarios, ver todas las solicitudes, asignar/completar/reabrir/eliminar, ver auditoría, panel. |
| **Coordinador** | Asigna solicitudes a conductores (nombre + WhatsApp).                              | Ver todas las solicitudes; asignar a conductor; marcar completado; enviar WhatsApp al conductor. No crea solicitudes. |
| **Operador**   | Crea solicitudes de transporte.                                                    | Crear solicitudes y ver solo las que él ha creado. No asigna ni ve auditoría.          |

- **Operador:** Solo ve la opción “Nueva solicitud” y la lista de sus propias solicitudes. No debe ver botones de asignar, completar ni enviar WhatsApp en solicitudes de otros.
- **Coordinador:** No debe ver “Nueva solicitud”. Debe ver la lista de todas las solicitudes y poder asignar cada una a un conductor (nombre + número WhatsApp), y después enviar el mensaje por WhatsApp a ese número.
- **Administrador / Superusuario:** Acceso a usuarios (CRUD), auditoría, panel de control y, si se desea, también a crear/editar solicitudes y reabrir completadas.

La UI (menú lateral, header, páginas) debe ocultar o mostrar opciones según el rol, sin mostrar acciones que el rol no pueda ejecutar.

---

## 4. Flujo de asignación y WhatsApp

1. El **operador** crea la solicitud (pasajero, teléfono, origen, destino, hora, tipo de vehículo, etc.). La solicitud queda en estado “Pendiente” y se guarda en Supabase.
2. El **coordinador** ve las solicitudes pendientes y, para cada una, puede **asignar** indicando:
   - **Conductor:** nombre del conductor y número de WhatsApp (obligatorio para el flujo).
   - Opcionalmente, el sistema puede guardar un “coordinador responsable” si aplica.
3. Al confirmar la asignación:
   - La solicitud pasa a estado “Asignado” y se persiste en Supabase (incluyendo nombre y teléfono del conductor).
   - Se debe **enviar automáticamente** (o con un solo clic post-asignación) un mensaje por WhatsApp al número del conductor. El mensaje debe confirmar la asignación e incluir datos útiles: pasajero, teléfono del pasajero, hora, origen, destino, etc., para que el conductor pueda recoger al votante.
4. Implementación de WhatsApp: dado que WhatsApp Business API requiere configuración externa, la opción más práctica es abrir el enlace `https://wa.me/<número>?text=<mensaje_codificado>` con el texto prellenado, de modo que el coordinador solo tenga que pulsar “Enviar” en WhatsApp Web o en la app. Alternativamente, si el cliente tiene API de WhatsApp, se puede enviar el mensaje desde backend.

Recomendación: después de asignar, mostrar un botón tipo “Enviar WhatsApp al conductor” que abra `wa.me` con el mensaje ya preparado, o ejecutar el envío automático si existe integración por API.

---

## 5. Sincronización y robustez con Supabase

- **Conexión:** Usar el cliente oficial de Supabase (JS/TS) con las variables de entorno correctas (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). No hardcodear credenciales.
- **Tiempo real:** Donde aplique, usar Supabase Realtime para suscribirse a cambios en `requests` (y si aplica, en `audit_logs` solo para admins) y actualizar la UI sin recargar.
- **Manejo de errores:** Ante fallos de red o de Supabase, mostrar mensajes claros al usuario (“No se pudo guardar. Revisa tu conexión.”) y no marcar como guardado hasta tener confirmación del servidor.
- **RLS (Row Level Security):** Configurar políticas RLS en Supabase para que cada rol solo acceda a los datos que le corresponden (operadores solo sus solicitudes; coordinadores y admins todas; auditoría solo admins/superusuario).
- **Carga inicial:** Al cargar la app o la vista de solicitudes, siempre cargar la lista desde la base de datos; no depender de estado previo en memoria para mostrar la lista después de un refresh.

---

## 6. Entregables y criterios de aceptación

- **Interfaz:** Rediseño completo, minimalista, con paleta moderna y animaciones fluidas. Sin recortes, desbordes ni elementos borrosos innecesarios. Sin credenciales ni texto de depuración visibles.
- **Persistencia:** Las solicitudes se guardan en Supabase y se muestran correctamente tras recargar. La auditoría registra creación, asignación, completado, reapertura y eliminación con fecha, hora y datos relevantes.
- **Roles:** Comportamiento correcto para superusuario, administrador, coordinador y operador, sin redundancia en la visualización del rol.
- **Flujo asignación:** El coordinador asigna cada solicitud a un conductor (nombre + WhatsApp). Tras asignar, se facilita o se ejecuta el envío del mensaje de confirmación por WhatsApp al conductor.
- **Sincronización:** Uso correcto de Supabase (persistencia + opcionalmente Realtime), manejo de errores de red y RLS configurado. Producto estable y listo para producción.

---

## 7. Sugerencias abiertas del equipo

El cliente está abierto a recomendaciones del equipo de desarrollo para:

- Mejorar la experiencia de usuario (UX) y la claridad del flujo (operador → coordinador → conductor).
- Aumentar la eficiencia del sistema (caché, optimistic updates con rollback, etc.).
- Mejorar la interacción en tiempo real con la base de datos (Realtime, reconexión, indicador de “en línea” / “sin conexión”).
- Cualquier mejora técnica o de producto que haga el sistema más ágil, seguro y listo para producción.

Documentar brevemente en el código o en un README las decisiones relevantes (por ejemplo: “WhatsApp vía enlace wa.me” o “Realtime solo en lista de solicitudes”).

---

*Documento de especificación para el equipo de desarrollo. Versión 1.0.*
