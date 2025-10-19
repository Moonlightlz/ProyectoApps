#### Estructura Principal de la Aplicación
#### Para una navegación intuitiva, la aplicación debería implementar una barra de pestañas inferior con acceso a las secciones clave del servicio:

Inicio: La pantalla de bienvenida y el punto de partida para el usuario.

- Menú/Tienda: El catálogo completo de los productos disponibles.

- Pedidos: Una sección dedicada a la solicitud de productos personalizados.

- Chat: Sistema de mensajería para comunicación directa con la pastelería.

- Carrito: El resumen de los productos que el usuario ha seleccionado para comprar.

- Perfil: El área personal del usuario, donde puede gestionar su cuenta, ver su historial y acceder a la configuración.

#### 0. Sistema de Autenticación y Roles 🔐
El sistema debe implementar un control de acceso robusto que distinga entre diferentes tipos de usuarios y sus permisos correspondientes.

*Tipos de Usuario:*

**Cliente/Usuario Normal:**
- Acceso completo a funcionalidades de compra
- Navegación por catálogo y realización de pedidos
- Chat con la pastelería
- Gestión de perfil personal y historial

**Administrador/Personal de Pastelería:**
- Acceso completo del cliente MÁS funcionalidades administrativas
- **Gestión completa de comunicaciones**:
  - Responder mensajes de chat con texto, fotos y archivos
  - Enviar fotos de productos desde galería o cámara
  - Crear respuestas con formato enriquecido
  - Gestionar múltiples conversaciones simultáneas
- **Control total de productos**:
  - Agregar, editar y eliminar fotos de productos
  - Cambiar precios individuales o masivos
  - Gestionar inventario y disponibilidad
  - Crear y programar ofertas especiales
- **Panel de administración** con métricas y reportes
- **Gestión de pedidos** y seguimiento de estados
- **Análisis y reportes** de ventas y performance

#### 0.1. Pantalla de Bienvenida y Acceso 🚪

*Interfaces y Contenido:*

- **Splash Screen**: Logo de la pastelería con animación de carga
- **Pantalla de Bienvenida**: 
  - Descripción breve del servicio
  - Imágenes atractivas de productos destacados
  - Opciones de acceso claramente diferenciadas

*Opciones de Acceso:*

- **"Continuar como Invitado"**: Acceso limitado sin registro
  - Puede navegar el catálogo
  - No puede realizar pedidos ni usar chat
  - Popup periódico invitando a registrarse

- **"Iniciar Sesión"**: Para usuarios registrados
- **"Registrarse"**: Para nuevos usuarios
- **"Acceso Administrativo"**: Enlace discreto para personal autorizado

#### 0.2. Registro de Usuario 📝

*Interfaces y Contenido:*

- **Información Personal**:
  - Nombre completo
  - Email (validación obligatoria)
  - Número de teléfono
  - Fecha de nacimiento (opcional, para promociones)

- **Credenciales de Acceso**:
  - Contraseña (mínimo 8 caracteres, al menos 1 mayúscula, 1 número)
  - Confirmación de contraseña
  - Opción de mostrar/ocultar contraseña

- **Preferencias Iniciales**:
  - Acepta notificaciones push
  - Acepta marketing por email
  - Términos y condiciones (obligatorio)
  - Política de privacidad (obligatorio)

*Validaciones y Seguridad:*

- Verificación de email con código de 6 dígitos
- Verificación opcional de teléfono vía SMS
- Captcha para prevenir registro automatizado
- Detección de emails duplicados

#### 0.3. Inicio de Sesión 🔑

*Interfaces y Contenido:*

- **Campos de Acceso**:
  - Email o número de teléfono
  - Contraseña con opción de mostrar/ocultar
  - Checkbox "Recordarme" para sesiones persistentes

- **Opciones de Recuperación**:
  - Enlace "¿Olvidaste tu contraseña?"
  - Opción de login con huella dactilar/FaceID (dispositivos compatibles)

- **Accesos Alternativos**:
  - Login con Google
  - Login con Facebook (opcional)

*Seguridad:*

- Límite de intentos fallidos (3 intentos)
- Bloqueo temporal tras intentos excesivos
- Notificación de acceso desde nuevo dispositivo

#### 0.4. Acceso Administrativo 👑

*Interfaces y Contenido:*

- **Pantalla de Login Administrativo**:
  - Campo de email corporativo
  - Contraseña administrativa
  - Código de empleado (opcional)
  - Captcha obligatorio

- **Autenticación de Dos Factores**:
  - Código SMS al teléfono registrado
  - App autenticadora (Google Authenticator)
  - Código de respaldo en caso de emergencia

*Roles Administrativos:*

- **Super Administrador**: Acceso total al sistema
- **Gerente**: Gestión de productos, pedidos y personal
- **Operador**: Gestión de pedidos y chat con clientes
- **Contador**: Acceso a reportes y análisis financiero

#### 0.5. Gestión de Sesiones y Seguridad 🛡️

*Funcionalidades de Seguridad:*

- **Sesiones Activas**: Lista de dispositivos con sesión iniciada
- **Cerrar Sesión Remota**: Capacidad de cerrar otras sesiones
- **Historial de Accesos**: Log de inicios de sesión con fecha/hora/dispositivo
- **Alertas de Seguridad**: Notificaciones de accesos sospechosos

*Configuraciones de Cuenta:*

- Cambio de contraseña con verificación actual
- Configuración de autenticación de dos factores
- Gestión de dispositivos de confianza
- Eliminación de cuenta con confirmación múltiple

#### 0.6. Recuperación de Contraseña 🔄

*Proceso de Recuperación:*

- Solicitud vía email con validación de existencia
- Envío de enlace temporal (válido 15 minutos)
- Creación de nueva contraseña con validaciones
- Confirmación exitosa con opción de login inmediato
- Invalidación automática de sesiones activas

#### 0.7. Flujos Diferenciados por Rol 🎭

*Usuario Normal - Flujo Principal:*
```
Splash → Bienvenida → Login/Registro → Inicio → Navegación Normal
```

*Usuario Invitado - Flujo Limitado:*
```
Splash → Bienvenida → Continuar Invitado → Inicio (funcionalidad limitada)
```

*Administrador - Flujo Administrativo:*
```
Splash → Login Admin → 2FA → Dashboard Admin → Panel de Control
```

*Acciones y Botones:*

- Botón "Iniciar Sesión" con validación en tiempo real
- Botón "Crear Cuenta" con verificación paso a paso
- Botón "Continuar sin registrarse" para acceso de invitado
- Enlace discreto "Personal autorizado" para acceso administrativo
- Botones de redes sociales para login alternativo
- Botón "Cerrar Sesión" visible en todas las pantallas una vez autenticado

*Notificaciones y Alertas:*

- Welcome message personalizado tras primer login
- Recordatorios de verificación de email pendiente
- Alertas de seguridad para accesos desde nuevos dispositivos
- Notificaciones de cambios en la cuenta (email, contraseña, etc.)

#### 1. Pantalla de Inicio (Home) 🏠
Esta es la primera interfaz que el usuario visualiza. Su diseño debe ser atractivo y funcional para captar el interés.

*Interfaces y Contenido:*

- Banner Principal: Un carrusel de imágenes destacando promociones, productos de temporada o los más populares.

- Barra de Búsqueda: Un campo visible que invite al usuario a buscar pasteles o postres específicos.

- Categorías Principales: Botones o tarjetas visuales (ej. "Pasteles", "Bocaditos", "Galletas") para una navegación rápida.

- Sección "Los más pedidos": Una lista horizontal con los productos estrella, facilitando una compra ágil.

- Sección "Novedades": Un espacio para mostrar las últimas adiciones al catálogo.

*Acciones y Botones:*

- Cada producto en exhibición debe contar con un botón de "+" o "Agregar al carrito" para una acción inmediata.

- Al seleccionar una categoría, la aplicación redirigirá al usuario a la pantalla de Menú, aplicando el filtro correspondiente.

- El banner promocional debe ser interactivo, llevando al usuario al producto o la oferta en cuestión.

#### 2. Catálogo de Productos (Menú/Tienda) 🍰
En esta sección, el usuario explora la oferta completa de la pastelería.

*Interfaces y Contenido:*

- Vista de Cuadrícula (Grid): Los productos se mostrarán con una fotografía de alta calidad, su nombre y precio.

- Filtros: Se debe incluir un botón que permita filtrar los productos por categoría, rango de precios, popularidad, entre otros.

- Ordenamiento: Permitirá al usuario organizar los resultados según sus preferencias.

*Acciones y Botones:*

- Un botón de Filtro desplegará un menú con las opciones disponibles.

- Al tocar un producto, el usuario será dirigido a la pantalla de "Detalle del Producto".

- Cada producto tendrá un botón rápido de "Agregar al Carrito".

#### 3. Detalle del Producto
Esta pantalla se enfoca en un único producto para proporcionar toda la información necesaria para la compra.

*Interfaces y Contenido:*

- Galería de Imágenes: Múltiples fotografías del producto.

- Información Clave: Nombre, precio y una descripción detallada.

- Selector de Opciones: Si el producto tiene variantes (ej. tamaño, sabor), se presentarán selectores para que el usuario elija.

- Selector de Cantidad: Un campo numérico con botones + y - para ajustar la cantidad.

*Acciones y Botones:*

- El botón principal será "Agregar al Carrito", diseñado para destacar visualmente.

- Opcionalmente, un ícono de corazón puede funcionar como botón de "Añadir a Favoritos".

#### 4. Pedidos Personalizados 🎨
Esta sección está diseñada para gestionar pedidos especiales a través de un formulario guiado.

*Interfaces y Contenido:*

- Un formulario estructurado por pasos: descripción de la idea, subida de imagen de referencia, selección de tamaño, sabor y datos de contacto.

*Acciones y Botones:*

- Botón "Subir Imagen" para que el usuario adjunte referencias visuales.

- El botón final será "Solicitar Cotización", el cual enviará la información recopilada al negocio para su gestión.

#### 5. Carrito de Compras 🛒
Interfaz que resume el pedido del usuario antes de proceder al pago.

*Interfaces y Contenido:*

- Una lista detallada de los productos seleccionados, mostrando foto, nombre, cantidad y precio.

- Un resumen del costo total, desglosando subtotal y gastos de envío.

- Un campo para ingresar un "Código de Descuento".

*Acciones y Botones:*

- Opciones para editar la cantidad o eliminar productos del carrito.

- Un botón de "Aplicar" para el código de descuento.

- El botón principal será "Continuar con la Compra".

##### 6. Proceso de Checkout (Pago y Envío)
Los pasos finales para completar la transacción deben ser claros y sencillos.

*Interfaces y Contenido:*

Selector de Método de Entrega:

    - "Recojo en Tienda": Mostrará las direcciones de las 2 sucursales disponibles para la selección del usuario.

    - "Delivery": Solicitará la dirección de envío.

    - Selección de Método de Pago: Presentará los métodos aceptados (ej. Yape, Plin, Tarjeta de crédito/débito) de forma visual.

    - Resumen Final: Una última vista de todo el pedido antes de la confirmación.

*Acciones y Botones:*

- Un botón de "Confirmar Pedido" que, al ser presionado, finalizará la transacción y mostrará una pantalla de confirmación.

#### 7. Perfil de Usuario 👤
El espacio personal del cliente dentro de la aplicación.

*Interfaces y Contenido:*

- Datos Personales: Información de la cuenta del usuario.

- Historial de Pedidos: Una lista de las compras previas y su estado actual (ej. "En preparación", "Entregado").

- Direcciones Guardadas: Para agilizar futuras compras.

- Ayuda y Configuración.

*Acciones y Botones:*

- Botón "Editar" para modificar los datos personales.

- Botón "Volver a pedir" en el historial para repetir un pedido fácilmente.

- Botón "Cerrar Sesión".

#### 8. Sistema de Chat y Comunicación 💬
Un canal de comunicación directo entre clientes y la pastelería para consultas, pedidos personalizados y soporte.

*Interfaces y Contenido:*

- Lista de Conversaciones: Pantalla principal que muestra todas las conversaciones activas del usuario con timestamps del último mensaje.

- Chat Individual: Interfaz de mensajería en tiempo real con:
  - Historial de mensajes con fecha y hora
  - Estado de lectura de mensajes (enviado, entregado, leído)
  - Indicador de "escribiendo..." cuando la pastelería está respondiendo
  - Burbujas diferenciadas para mensajes del cliente y respuestas del negocio

- Galería de Fotos Integrada: 
  - Vista previa de imágenes enviadas en el chat
  - Capacidad de zoom y visualización en pantalla completa
  - Descarga opcional de imágenes recibidas

*Funcionalidades de Mensajería:*

- Envío de Texto: Mensajes escritos con soporte para emojis
- Compartir Fotos: 
  - Tomar foto directamente desde la cámara
  - Seleccionar desde galería del dispositivo
  - Envío múltiple de imágenes (hasta 5 por mensaje)
  - Compresión automática para optimizar el envío
  - Vista previa antes del envío

- Mensajes de Voz: Grabación y reproducción de notas de audio (opcional)
- Compartir Ubicación: Para facilitar entregas a domicilio
- Mensajes Predefinidos: Respuestas rápidas como "Gracias", "Perfecto", "¿Cuánto cuesta?"

*Casos de Uso Específicos:*

- Consultas sobre Productos: El cliente puede enviar fotos de referencia para pasteles personalizados
- Confirmación Visual: La pastelería puede enviar fotos del progreso del pedido
- Soporte Técnico: Resolución de problemas con la aplicación
- Negociación de Precios: Para pedidos especiales o grandes volúmenes
- Coordinación de Entrega: Comunicación en tiempo real durante el delivery

*Acciones y Botones:*

- Botón "+" para acceder a opciones de archivo (cámara, galería)
- Botón de cámara rápida para tomar foto directamente
- Botón de envío con confirmación para mensajes importantes
- Botón "Nuevo Chat" para iniciar conversación
- Opciones de "Eliminar conversación" con confirmación
- Botón "Reportar" para contenido inapropiado

*Notificaciones y Alertas:*

- Notificaciones push para nuevos mensajes
- Badge con contador de mensajes no leídos
- Sonidos diferenciados para mensajes de texto vs. fotos
- Notificación especial para respuestas urgentes del negocio

*Configuraciones de Chat:*

- Activar/desactivar notificaciones
- Configurar horarios de disponibilidad
- Opción de chat anónimo para consultas generales
- Historial de conversaciones con opción de eliminación

#### 9. Panel Administrativo 👑
Interfaz exclusiva para el personal de la pastelería con herramientas de gestión y control del negocio.

#### 9.1. Dashboard Principal de Administración 📊

*Interfaces y Contenido:*

- **Resumen del Día**:
  - Ventas totales del día actual
  - Número de pedidos completados/pendientes
  - Productos más vendidos
  - Ingresos por método de pago

- **Métricas en Tiempo Real**:
  - Pedidos activos con tiempo estimado
  - Chat conversations pendientes de respuesta
  - Alertas de inventario bajo
  - Notificaciones de nuevos registros de usuarios

- **Gráficos y Análisis**:
  - Gráfico de ventas por día/semana/mes
  - Distribución de pedidos por categoría
  - Horarios pico de actividad
  - Comparativa con períodos anteriores

#### 9.2. Gestión de Productos 🍰

*Interfaces y Contenido:*

- **Lista de Productos**:
  - Vista tabla con foto, nombre, precio, stock, estado
  - Filtros por categoría, estado (activo/inactivo), precio
  - Ordenamiento por ventas, fecha de creación, alfabético
  - Búsqueda por nombre o SKU

- **Crear/Editar Producto**:
  - **Información básica** (nombre, descripción, precio con validaciones)
  - **Gestión avanzada de precios**:
    - Precio base del producto
    - Precios por tamaño/variante
    - Descuentos por volumen
    - Precios especiales por temporada
    - Configuración de ofertas con fechas de vigencia
    - Historial de cambios de precio con auditoría
  - **Gestión completa de fotografías**:
    - **Subir múltiples fotos** (hasta 10 por producto)
    - **Tomar fotos directamente** desde la cámara del dispositivo
    - **Editor de imágenes integrado**:
      - Recortar y redimensionar
      - Ajustar brillo, contraste y saturación
      - Agregar filtros y efectos
      - Marcas de agua automáticas
    - **Organización de fotos**:
      - Establecer foto principal del producto
      - Reordenar fotos mediante drag & drop
      - Etiquetar fotos (ej: "vista frontal", "detalle", "ingredientes")
      - Comprimir automáticamente para web
    - **Galería administrativa**:
      - Banco de imágenes reutilizables
      - Categorización por tipo de producto
      - Búsqueda por etiquetas y metadatos
  - Categorización y etiquetas
  - Configuración de inventario y disponibilidad
  - Opciones de personalización disponibles

*Acciones y Botones Específicos:*

- **Para Precios**:
  - Botón "Edición rápida de precio" desde lista de productos
  - "Aplicar descuento masivo" para múltiples productos
  - "Copiar precios" de producto similar
  - "Programar cambio de precio" con fecha específica
  - "Historial de precios" con gráfico de evolución

- **Para Fotografías**:
  - Botón "Agregar fotos" con opciones cámara/galería
  - "Reemplazar foto principal" con confirmación
  - "Editar imagen" que abre editor integrado
  - "Eliminar foto" con vista previa de confirmación
  - "Galería de producto" para gestión visual
  - "Optimizar todas las imágenes" para performance

*Acciones y Botones Generales:*

- Botón "Nuevo Producto" con formulario completo
- Toggle para activar/desactivar productos
- Botón "Duplicar" para productos similares
- Opción de eliminación con confirmación
- Exportar catálogo en PDF/Excel

*Funcionalidades Avanzadas de Gestión:*

- **Vista previa en tiempo real** de cómo se ve el producto en la app
- **Gestión por lotes**:
  - Seleccionar múltiples productos
  - Cambio de precio masivo con porcentajes o valores fijos
  - Activar/desactivar productos en masa
  - Aplicar descuentos a categorías completas
- **Notificaciones automáticas**:
  - Alertas cuando el stock está bajo
  - Notificación de productos sin fotos
  - Recordatorios de actualización de precios estacionales

#### 9.3. Gestión de Pedidos 📋

*Interfaces y Contenido:*

- **Lista de Pedidos**:
  - Estados: Nuevo, En preparación, Listo, Entregado, Cancelado
  - Información del cliente y productos
  - Método de pago y entrega
  - Tiempo transcurrido desde el pedido

- **Detalle de Pedido**:
  - Información completa del cliente
  - Lista detallada de productos
  - Historial de cambios de estado
  - Notas especiales del cliente
  - Información de entrega (dirección/sucursal)

- **Flujo de Estados**:
  - Nuevo → En preparación → Listo → Entregado
  - Opción de cancelación en cualquier estado
  - Notificaciones automáticas al cliente

*Acciones y Botones:*

- Botones para cambiar estado del pedido
- Opción de agregar notas internas
- Botón "Contactar Cliente" (abrir chat directo)
- Imprimir orden de producción
- Generar comprobante de entrega

#### 9.4. Gestión de Chats y Atención al Cliente 💬

*Interfaces y Contenido:*

- **Panel de Conversaciones**:
  - Lista de chats activos ordenados por prioridad
  - Indicadores de mensajes no respondidos
  - Tiempo de espera del cliente
  - Etiquetas de tipo de consulta (producto, pedido, reclamo)

- **Interfaz de Chat Administrativo**:
  - Vista del historial completo de conversación
  - Información del cliente en panel lateral
  - **Editor de respuestas avanzado** con:
    - Formato de texto (negrita, cursiva, listas)
    - Inserción de emojis y stickers
    - Adjuntar múltiples fotos de productos
    - Envío de enlaces a productos específicos
    - Vista previa antes de enviar
  - Respuestas predefinidas para consultas frecuentes
  - Capacidad de transferir chat a otro operador
  - Marcadores de seguimiento (resuelto, pendiente, escalado)
  - **Indicadores de estado en tiempo real**:
    - Cliente escribiendo...
    - Mensaje entregado/leído
    - Cliente en línea/desconectado

*Funcionalidades Especiales de Respuesta:*

- **Gestión de Mensajes**:
  - Responder con texto enriquecido
  - Enviar fotos de productos desde galería administrativa
  - Tomar fotos nuevas directamente desde la cámara del dispositivo
  - Enviar múltiples imágenes simultáneamente (hasta 10)
  - Grabar y enviar mensajes de voz explicativos
  - Compartir ubicación de sucursales

- **Plantillas Inteligentes**:
  - Respuestas automáticas para horarios no laborales
  - Plantillas personalizables por tipo de consulta
  - Macros con información variable (nombre cliente, producto consultado)
  - Respuestas secuenciales para procesos complejos

- **Integración con Catálogo**:
  - Buscar y enviar productos directamente desde el chat
  - Crear cotizaciones personalizadas in-situ
  - Aplicar descuentos especiales desde la conversación
  - Generar enlaces de pago directo
- Estadísticas de tiempo de respuesta

#### 9.5. Gestión de Usuarios y Clientes 👥

*Interfaces y Contenido:*

- **Lista de Usuarios**:
  - Información personal y de contacto
  - Fecha de registro y último acceso
  - Historial de pedidos y gastos totales
  - Estado de la cuenta (activa, suspendida, bloqueada)

- **Perfil de Cliente**:
  - Datos personales completos
  - Historial de pedidos detallado
  - Comunicaciones previas (chats, emails)
  - Preferencias y notas especiales

*Acciones y Botones:*

- Buscar cliente por nombre, email o teléfono
- Suspender/reactivar cuentas
- Enviar mensajes promocionales personalizados
- Exportar base de datos de clientes
- Crear grupos de clientes para marketing

#### 9.6. Reportes y Análisis 📈

*Interfaces y Contenido:*

- **Reportes de Ventas**:
  - Ventas por período (día, semana, mes, año)
  - Productos más/menos vendidos
  - Análisis de rentabilidad por producto
  - Métodos de pago preferidos

- **Reportes de Clientes**:
  - Nuevos registros por período
  - Clientes más frecuentes
  - Análisis de retención de clientes
  - Geografía de pedidos (para delivery)

- **Reportes Operativos**:
  - Tiempos promedio de preparación
  - Eficiencia del personal
  - Análisis de horarios pico
  - Métricas de satisfacción (si hay encuestas)

*Acciones y Botones:*

- Generar reportes personalizados por fechas
- Exportar reportes en PDF/Excel
- Programar envío automático de reportes
- Comparar períodos específicos

#### 9.7. Configuración del Sistema ⚙️

*Interfaces y Contenido:*

- **Configuración de la Tienda**:
  - Información de contacto y sucursales
  - Horarios de atención y delivery
  - Políticas de entrega y devoluciones
  - Configuración de métodos de pago

- **Gestión de Personal**:
  - Lista de administradores y operadores
  - Asignación de roles y permisos
  - Configuración de turnos y disponibilidad
  - Logs de actividad del personal

- **Configuración de Notificaciones**:
  - Plantillas de mensajes automáticos
  - Configuración de push notifications
  - Emails de confirmación y seguimiento
  - Alertas internas del sistema

*Acciones y Botones:*

- Crear/editar roles de usuario
- Configurar integraciones (pagos, delivery)
- Respaldar/restaurar configuraciones
- Logs de auditoría del sistema

#### 9.8. Seguridad y Accesos 🔒

*Funcionalidades de Seguridad:*

- **Control de Acceso**:
  - Autenticación de dos factores obligatoria
  - Sesiones con timeout automático
  - IP whitelisting para accesos críticos
  - Rotación obligatoria de contraseñas

- **Auditoría y Logs**:
  - Registro de todas las acciones administrativas
  - Alertas de accesos sospechosos
  - Respaldos automáticos de datos críticos
  - Monitoreo de performance del sistema

*Acciones y Botones:*

- Revisar logs de actividad
- Configurar alertas de seguridad
- Gestionar tokens de API
- Exportar logs para auditoría externa