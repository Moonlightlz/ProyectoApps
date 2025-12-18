# Interfaces de Usuario - Pastelería D'Diego App

## Descripción General

**Pastelería D'Diego** es una aplicación móvil híbrida desarrollada con Ionic/Angular que permite a los usuarios explorar, comprar y realizar pedidos personalizados de productos de pastelería. La aplicación cuenta con funcionalidades para usuarios regulares y administradores, incluyendo catálogo de productos, carrito de compras, gestión de pedidos, chat en tiempo real y panel de administración.

---

## Interfaces Disponibles

### 1. Login (Inicio de Sesión)
**Archivo:** [src/app/login/login.page.ts](src/app/login/login.page.ts)

#### Funcionalidad
Pantalla de inicio de sesión donde los usuarios pueden acceder a la aplicación con sus credenciales.

#### Elementos Visuales
- Campo de texto para nombre de usuario/email
- Campo de contraseña
- Botón "Iniciar Sesión"
- Enlace "¿Olvidaste tu contraseña?"
- Enlace "Registrarse"

#### Métodos y Acciones
- **`login()`** (línea 61): Valida credenciales y realiza el inicio de sesión
  - Valida que los campos no estén vacíos
  - Muestra indicador de carga
  - Autentica al usuario con Firebase
  - Actualiza la última conexión del usuario
  - Navega a la pantalla principal (`/tabs`)
  - Muestra mensajes de éxito o error

- **`goToRegister()`** (línea 123): Navega a la pantalla de registro

- **`goToForgotPassword()`** (línea 136): Navega a la pantalla de recuperación de contraseña

#### Validaciones
- Verifica que username y password no estén vacíos (línea 62)
- Muestra toast con mensajes informativos según el resultado

---

### 2. Register (Registro)
**Archivo:** [src/app/register/register.page.ts](src/app/register/register.page.ts)

#### Funcionalidad
Permite a nuevos usuarios crear una cuenta en la aplicación.

#### Elementos Visuales
- Campo de nombre completo
- Campo de email
- Campo de teléfono
- Campo de contraseña
- Campo de confirmar contraseña
- Checkbox de aceptar términos y condiciones
- Botón para seleccionar foto de perfil (cámara/galería/avatar)
- Botón "Registrarse"

#### Métodos y Acciones
- **`selectPhoto()`** (línea 89): Abre opciones para seleccionar foto de perfil
  - Cámara
  - Galería
  - Avatar predeterminado

- **`takePhotoFromCamera()`** (línea 112): Captura foto con la cámara

- **`takePhotoFromGallery()`** (línea 121): Selecciona foto de la galería

- **`selectDefaultAvatar()`** (línea 130): Permite elegir un avatar predeterminado

- **`register()`** (línea 171): Procesa el registro del usuario
  - Valida todos los campos del formulario
  - Verifica formato de email
  - Confirma que las contraseñas coincidan
  - Verifica longitud mínima de contraseña (6 caracteres)
  - Verifica que el email no esté registrado
  - Crea cuenta en Firebase
  - Sube foto de perfil si fue seleccionada
  - Navega a la pantalla principal

#### Validaciones
- **`isFormValid()`** (línea 158): Valida que todos los campos estén completos
- **`isEmailValid()`** (línea 166): Valida formato de email con regex
- **`passwordsMatch()`** (línea 171): Verifica que las contraseñas coincidan

---

### 3. Forgot Password (Recuperar Contraseña)
**Archivo:** [src/app/forgot-password/forgot-password.page.ts](src/app/forgot-password/forgot-password.page.ts)

#### Funcionalidad
Permite a los usuarios recuperar su contraseña mediante correo electrónico.

#### Elementos Visuales
- Campo de email
- Botón "Enviar correo de recuperación"
- Mensaje de confirmación cuando se envía el correo
- Botón para volver al login

#### Métodos y Acciones
- **`sendResetEmail()`** (línea 67): Envía correo de recuperación de contraseña
  - Valida formato de email
  - Muestra indicador de carga
  - Envía correo mediante Firebase Auth
  - Muestra mensaje de éxito o error

- **`goToLogin()`** (línea 97): Navega de vuelta al login

- **`goToRegister()`** (línea 101): Navega a la pantalla de registro

#### Validaciones
- **`isEmailValid()`** (línea 61): Valida formato de email con regex

---

### 4. Home/Tab1 (Inicio - Productos Destacados)
**Archivo:** [src/app/tab1/tab1.page.ts](src/app/tab1/tab1.page.ts)

#### Funcionalidad
Página principal que muestra los productos destacados de la pastelería.

#### Elementos Visuales
- Grid de tarjetas con productos destacados
- Imagen del producto
- Nombre del producto
- Precio
- Botón "Ver detalles"
- Botón "Agregar al carrito"
- Indicador de carga mientras se obtienen productos

#### Métodos y Acciones
- **`ionViewWillEnter()`** (línea 65): Se ejecuta cada vez que se muestra la página
  - Recarga los productos destacados

- **`loadFeaturedProducts()`** (línea 71): Carga productos destacados desde Firebase
  - Muestra indicador de carga
  - Obtiene productos marcados como "destacados"
  - Actualiza la interfaz

- **`openProductDetails(product)`** (línea 85): Abre modal con detalles del producto
  - Muestra información completa del producto
  - Permite ver ingredientes, alérgenos, información nutricional

- **`addToCart(product)`** (línea 95): Agrega producto directamente al carrito
  - Añade el producto sin abrir detalles

---

### 5. Catalog (Catálogo de Productos)
**Archivo:** [src/app/catalog/catalog.page.ts](src/app/catalog/catalog.page.ts)

#### Funcionalidad
Catálogo completo de productos con filtros y búsqueda.

#### Elementos Visuales
- Barra de búsqueda
- Segmento de categorías (Todos, Pasteles, Galletas, etc.)
- Toggle de vista (Grid/Lista)
- Toggle de favoritos
- Grid/Lista de productos con:
  - Imagen
  - Nombre
  - Precio
  - Botón de favorito
  - Botón "Agregar al carrito"
- Botón flotante de administración (solo para admin)

#### Métodos y Acciones
- **`ngOnInit()`** (línea 122): Inicializa la página
  - Carga favoritos del usuario

- **`ionViewWillEnter()`** (línea 128): Se ejecuta al entrar a la página
  - Verifica parámetro de favoritos en URL
  - Recarga datos

- **`loadData()`** (línea 148): Carga categorías y productos
  - Obtiene categorías activas
  - Obtiene productos disponibles
  - Maneja errores de conexión

- **`checkAdminStatus()`** (línea 169): Verifica si el usuario es administrador
  - Verifica por email
  - Verifica por UID
  - Actualiza vista según rol

#### Filtros y Búsqueda
Los usuarios pueden:
- Buscar productos por nombre
- Filtrar por categoría
- Ver solo favoritos
- Cambiar entre vista de grid y lista

---

### 6. Cart (Carrito de Compras)
**Archivo:** [src/app/cart/cart.page.ts](src/app/cart/cart.page.ts)

#### Funcionalidad
Muestra los productos agregados al carrito y permite gestionar el pedido.

#### Elementos Visuales
- Lista de productos en el carrito con:
  - Imagen del producto
  - Nombre y precio
  - Botones +/- para ajustar cantidad
  - Botón eliminar producto
- Opciones de delivery:
  - Toggle para incluir delivery
  - Selector de distancia (cercano/medio/lejano)
- Resumen de compra:
  - Subtotal
  - Costo de delivery (si aplica)
  - Total
- Botón "Vaciar carrito"
- Botón "Realizar pedido"

#### Métodos y Acciones
- **`loadCart()`** (línea 137): Carga el carrito del usuario
  - Se suscribe a cambios en tiempo real

- **`increaseQuantity(item)`** (línea 147): Aumenta cantidad de un producto

- **`decreaseQuantity(item)`** (línea 156): Disminuye cantidad de un producto
  - Si cantidad llega a 0, elimina el producto

- **`removeItem(item)`** (línea 167): Elimina producto del carrito
  - Muestra confirmación antes de eliminar

- **`clearCart()`** (línea 201): Vacía todo el carrito
  - Muestra confirmación antes de vaciar

- **`proceedToCheckout()`** (línea 240): Procesa el checkout
  - Valida que haya productos
  - Solicita teléfono si no está registrado
  - Muestra resumen del pedido
  - Crea el pedido

- **`createOrder()`** (línea 340): Crea el pedido en Firebase
  - Crea documento de pedido
  - Limpia el carrito
  - Navega a página de pedidos

#### Opciones de Delivery
- **Cercano**: $20 MXN (líneas 415-420)
- **Medio**: $40 MXN 
- **Lejano**: $60 MXN

---

### 7. Orders (Mis Pedidos)
**Archivo:** [src/app/orders/orders.page.ts](src/app/orders/orders.page.ts)

#### Funcionalidad
Muestra los pedidos realizados por el usuario con su estado actual.

#### Elementos Visuales
- **Pedido Pendiente** (si existe):
  - Código del pedido
  - Temporizador de 1 minuto
  - Barra de progreso
  - Botón "Editar pedido"
  
- **Lista de Pedidos**:
  - Código del pedido
  - Fecha y hora
  - Estado del pedido (chip con color)
  - Total del pedido
  - Badge con mensajes no leídos
  - Botones:
    - Ver detalles
    - Chat
    - Actualizar estado (solo admin)

- **Filtros**:
  - Todos
  - Pendientes
  - Completados

#### Métodos y Acciones
- **`ngOnInit()`** (línea 124): Inicializa la página
  - Verifica si es admin
  - Carga pedidos
  - Se suscribe a pedido pendiente
  - Se suscribe a contador de mensajes no leídos

- **`loadOrders()`** (línea 206): Carga pedidos según el rol
  - Admin: carga todos los pedidos
  - Usuario: carga solo sus pedidos

- **`filterOrders()`** (línea 225): Filtra pedidos según el filtro seleccionado

- **`startCountdown(order)`** (línea 263): Inicia temporizador de 1 minuto
  - Cuenta regresiva desde la creación del pedido
  - Se actualiza cada segundo

- **`editOrder()`** (línea 297): Permite editar pedido pendiente
  - Restaura productos al carrito
  - Cancela el pedido actual
  - Navega al carrito

- **`viewOrderDetail(order)`** (línea 339): Muestra modal con detalles del pedido

- **`goToChat(order)`** (línea 352): Navega al chat del pedido
  - Pasa orderId y orderCode como parámetros

- **`updateStatus(order)`** (línea 373): Actualiza estado del pedido (solo admin)
  - Muestra opciones de siguiente estado posible
  - Actualiza en Firebase

#### Estados de Pedido
- **Pending Confirmation**: Esperando confirmación (1 minuto)
- **Confirmed**: Confirmado
- **Preparing**: En preparación
- **Ready**: Listo para recoger/entregar
- **In Delivery**: En camino
- **Completed**: Completado
- **Cancelled**: Cancelado

---

### 8. Profile (Perfil de Usuario)
**Archivo:** [src/app/profile/profile.page.ts](src/app/profile/profile.page.ts)

#### Funcionalidad
Muestra y permite editar la información del perfil del usuario.

#### Elementos Visuales
- Avatar/foto de perfil (editable)
- Nombre del usuario
- Email (no editable)
- Teléfono (editable)
- Dirección (editable):
  - Calle
  - Ciudad
  - Estado
  - Código postal
  - País
- **Estadísticas**:
  - Productos favoritos
  - Items en carrito
- **Preferencias**:
  - Toggle tema oscuro/claro
- Botón "Cerrar sesión"
- Botones "Editar" y "Guardar"

#### Métodos y Acciones
- **`loadUserProfile()`** (línea 150): Carga datos del perfil
  - Obtiene información del usuario de Firebase
  - Aplica tema guardado
  - Inicializa datos editables

- **`toggleTheme(event)`** (línea 195): Cambia entre tema claro/oscuro
  - Aplica cambios visuales
  - Guarda preferencia en Firebase

- **`loadUserStats()`** (línea 236): Carga estadísticas del usuario
  - Cuenta favoritos
  - Cuenta items en carrito
  - Se suscribe a cambios en tiempo real

- **`toggleEdit()`** (línea 260): Activa/desactiva modo edición

- **`saveProfile()`** (línea 273): Guarda cambios del perfil
  - Actualiza nombre, teléfono y dirección
  - Guarda en Firebase
  - Actualiza datos locales

- **`changePhoto()`** (línea 307): Cambia foto de perfil
  - Opciones: Cámara, Galería o Avatar
  - Sube foto a Firebase Storage
  - Actualiza URL en perfil

- **`logout()`**: Cierra sesión del usuario
  - Limpia datos locales
  - Navega al login

---

### 9. Chat (Mensajería)
**Archivo:** [src/app/chat/chat.page.ts](src/app/chat/chat.page.ts)

#### Funcionalidad
Punto de entrada para iniciar conversaciones con el administrador.

#### Elementos Visuales
- Tarjeta informativa
- Botón "Iniciar pedido personalizado"

#### Métodos y Acciones
- **`startCustomOrderChat()`** (línea 44): Inicia nueva conversación
  - Crea conversación con tipo "custom_order"
  - Envía mensaje inicial
  - Navega a la página de conversación

---

### 10. Conversation (Conversación de Chat)
**Archivo:** [src/app/chat/conversation.page.ts](src/app/chat/conversation.page.ts)

#### Funcionalidad
Ventana de chat en tiempo real asociada a un pedido específico.

#### Elementos Visuales
- **Encabezado**:
  - Código del pedido
  - Botón para ver detalles del pedido
  - Badge con estado del pedido
- **Área de mensajes**:
  - Mensajes propios (alineados a la derecha)
  - Mensajes del otro usuario (alineados a la izquierda)
  - Timestamp de cada mensaje
- **Área de entrada**:
  - Campo de texto para escribir mensaje
  - Botón "Enviar"

#### Métodos y Acciones
- **`ngOnInit()`** (línea 60): Inicializa la conversación
  - Obtiene orderId y orderCode de parámetros
  - Carga información del pedido
  - Se suscribe a mensajes en tiempo real
  - Marca mensajes como leídos

#### Funcionalidades
- Mensajes en tiempo real
- Notificación de mensajes no leídos
- Scroll automático a nuevos mensajes
- Asociación con pedido específico

---

### 11. Admin Panel (Panel de Administración)
**Archivo:** [src/app/admin/admin.page.ts](src/app/admin/admin.page.ts)

#### Funcionalidad
Panel completo de administración para gestionar productos, categorías e inventario.

#### Elementos Visuales
- **Barra de búsqueda**
- **Filtro por categoría**
- **Botón "Nuevo Producto"**
- **Botón "Gestionar Categorías"**
- **Botón "Google Drive"** (conexión a almacenamiento)

- **Lista de Productos**:
  - Imagen
  - Nombre
  - Categoría
  - Precio
  - Estado (Disponible/No disponible)
  - Botones:
    - Editar
    - Eliminar
    - Toggle disponibilidad

- **Formulario de Producto** (modal):
  - Nombre
  - Descripción corta
  - Descripción completa
  - Precio
  - Categoría
  - Ingredientes (multi-select)
  - Alérgenos (multi-select)
  - Información nutricional:
    - Calorías
    - Proteínas
    - Carbohidratos
    - Grasas
    - Azúcares
  - Tiempo de preparación
  - Tamaño de porción
  - Imagen (URL, Firebase o Google Drive)
  - Disponible (toggle)
  - Destacado (toggle)

#### Métodos y Acciones de Administración
- **`checkAdminAccess()`** (línea 109): Verifica permisos de administrador
  - Valida que el usuario esté autenticado
  - Verifica email de admin o rol de admin
  - Redirige si no tiene permisos

- **`loadData()`** (línea 147): Carga productos, categorías y datos maestros
  - Obtiene todos los productos
  - Obtiene categorías
  - Carga ingredientes y alérgenos disponibles

#### Gestión de Productos
- **`openProductForm(product?)`**: Abre formulario para crear/editar producto
  - Si recibe producto, modo edición
  - Si no, modo creación

- **`saveProduct()`**: Guarda producto nuevo o actualizado
  - Valida campos requeridos
  - Sube imagen si es necesaria
  - Crea o actualiza en Firebase

- **`deleteProduct(product)`**: Elimina producto
  - Muestra confirmación
  - Elimina de Firebase

- **`toggleAvailability(product)`**: Activa/desactiva disponibilidad de producto

#### Gestión de Categorías
- **`manageCategories()`**: Abre interfaz de gestión de categorías
  - Crear nueva categoría
  - Editar categoría existente
  - Eliminar categoría

#### Gestión de Imágenes
- **`selectImageSource()`**: Selecciona origen de imagen
  - URL directa
  - Firebase Storage
  - Google Drive

- **`takeProductPhoto()`**: Captura foto del producto con cámara

- **`selectFromGallery()`**: Selecciona imagen de galería

#### Integración con Google Drive
- **`initGoogleDrive()`** (línea 101): Inicializa conexión con Google Drive
  - Verifica estado de autenticación
  - Obtiene información de almacenamiento

- **`connectDrive()`**: Conecta con cuenta de Google Drive

- **`uploadToGoogleDrive()`**: Sube imágenes a Google Drive

#### Filtros y Búsqueda
- **`onSearchChange(event)`**: Filtra productos por nombre
- **`onCategoryChange(event)`**: Filtra productos por categoría

---

## Flujos de Usuario Principales

### Flujo de Compra Estándar
1. **Login** → Iniciar sesión
2. **Home/Catalog** → Explorar productos
3. **Product Details** → Ver detalles y agregar al carrito
4. **Cart** → Revisar carrito y configurar delivery
5. **Checkout** → Confirmar pedido
6. **Orders** → Ver estado del pedido
7. **Chat** → Comunicarse con el administrador sobre el pedido

### Flujo de Administrador
1. **Login** → Iniciar sesión como admin
2. **Admin Panel** → Gestionar productos y categorías
3. **Orders** → Ver todos los pedidos
4. **Update Status** → Actualizar estado de pedidos
5. **Chat** → Responder consultas de clientes

---

## Notas Técnicas

- **Framework**: Ionic 8 con Angular 20
- **Base de datos**: Firebase Firestore
- **Autenticación**: Firebase Authentication
- **Almacenamiento**: Firebase Storage y Google Drive
- **Plataformas**: Android e iOS mediante Capacitor

---

## Validaciones Comunes

### Campos de Texto
- No se permiten campos vacíos en formularios obligatorios
- Email debe tener formato válido (regex)
- Teléfono mínimo 9 caracteres

### Contraseñas
- Mínimo 6 caracteres
- Confirmación debe coincidir

### Carrito y Pedidos
- Mínimo 1 producto para checkout
- Si se selecciona delivery, debe elegir distancia
- Teléfono obligatorio para realizar pedido

### Administración
- Solo usuarios con rol admin pueden acceder
- Confirmación antes de eliminar productos o categorías
- Validación de campos requeridos en formularios

---

**Última actualización:** Diciembre 2024  
**Versión de la App:** 0.1.0
