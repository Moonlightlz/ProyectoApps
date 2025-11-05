{
  "project_overview": {
    "technologies": {
      "language": "TypeScript",
      "framework": "Angular",
      "ui_kit": "Ionic",
      "mobile_runtime": "Capacitor",
      "database": "Firebase Firestore",
      "authentication": "Firebase Authentication",
      "storage": "Firebase Storage, Google Drive",
      "styling": "SCSS"
    },
    "root_files": [
      {
        "file": ".browserslistrc",
        "description": "Configuración para compartir la lista de navegadores y versiones compatibles entre diferentes herramientas de frontend, como autoprefixer y Babel."
      },
      {
        "file": ".editorconfig",
        "description": "Ayuda a mantener estilos de codificación consistentes (como indentación y finales de línea) para múltiples desarrolladores que trabajan en el mismo proyecto en varios editores e IDEs."
      },
      {
        "file": ".eslintrc.json",
        "description": "Archivo de configuración para ESLint, una herramienta de análisis de código estático para identificar y reportar patrones problemáticos encontrados en el código JavaScript/TypeScript."
      },
      {
        "file": ".gitignore",
        "description": "Especifica los archivos y carpetas que Git debe ignorar y no incluir en el control de versiones, como `node_modules` o archivos de compilación."
      },
      {
        "file": ".nvmrc",
        "description": "Archivo de configuración para NVM (Node Version Manager), que especifica la versión de Node.js que se debe usar para este proyecto."
      },
      {
        "file": "angular.json",
        "description": "Archivo de configuración principal de la CLI de Angular. Define la estructura del proyecto, las opciones de compilación, ejecución de pruebas y otras configuraciones del workspace."
      },
      {
        "file": "capacitor.config.ts",
        "description": "Archivo de configuración para Capacitor, el runtime nativo que permite que la aplicación web se ejecute en iOS, Android y la web como una aplicación nativa."
      },
      {
        "file": "ionic.config.json",
        "description": "Archivo de configuración específico de Ionic que contiene metadatos sobre el proyecto, como el nombre y el tipo de integración (Angular, Capacitor)."
      },
      {
        "file": "package.json",
        "description": "Define los metadatos del proyecto, las dependencias de Node.js (bibliotecas) y los scripts de línea de comandos (ej. `npm start`, `npm run build`)."
      },
      {
        "file": "package-lock.json",
        "description": "Registra la versión exacta de cada dependencia instalada, garantizando que las instalaciones sean consistentes en diferentes máquinas."
      },
      {
        "file": "post-install.js",
        "description": "Un script que se ejecuta automáticamente después de que se completan las instalaciones de `npm install`. Probablemente se usa para alguna tarea de configuración o parcheo."
      },
      {
        "file": "tsconfig.json",
        "description": "Archivo de configuración raíz para el compilador de TypeScript. Establece las opciones del compilador y los archivos que se incluirán en la compilación."
      },
      {
        "file": "tsconfig.app.json",
        "description": "Extiende la configuración de `tsconfig.json` con opciones específicas para la compilación de la aplicación Angular."
      }
    ]
  },
  
  "application_functionality": [
    {
      "interface": "Login",
      "path": "src/app/login",
      "description": "Interfaz de inicio de sesión para que los usuarios accedan a la aplicación.",
      "files": [
        {
          "path": "src/app/login/login.page.html",
          "type": "HTML",
          "description": "Define la estructura visual y los elementos de la página de inicio de sesión utilizando componentes de Ionic.",
          "important_sections": [
            {
              "section": "Formulario de Login",
              "description": "Contiene dos componentes `ion-input` para el nombre de usuario y la contraseña. Los datos se vinculan a las variables `username` y `password` en el archivo .ts mediante `[(ngModel)]`."
            },
            {
              "section": "Botón de Inicio de Sesión",
              "description": "Un `ion-button` que ejecuta la función `login()` al ser presionado. Está deshabilitado (`[disabled]`) si los campos de usuario o contraseña están vacíos para evitar envíos incompletos."
            },
            {
              "section": "Opciones Adicionales",
              "description": "Incluye dos botones (`ion-button`) que llaman a las funciones `goToRegister()` y `goToForgotPassword()` para navegar a las páginas de registro y recuperación de contraseña, respectivamente."
            }
          ]
        },
        {
          "path": "src/app/login/login.page.scss",
          "type": "SCSS",
          "description": "Proporciona los estilos visuales para la página de login, asegurando una presentación limpia y centrada.",
          "important_sections": [
            {
              "section": ".login-container",
              "description": "Clase principal que utiliza Flexbox para centrar vertical y horizontalmente todo el contenido en la pantalla."
            },
            {
              "section": ".logo-section",
              "description": "Define los estilos para el área del logo y el texto de bienvenida, incluyendo tamaño de fuente y márgenes."
            },
            {
              "section": ".login-button",
              "description": "Añade un margen superior al botón de login para separarlo de los campos de entrada."
            }
          ]
        },
        {
          "path": "src/app/login/login.page.ts",
          "type": "TypeScript",
          "description": "Controla toda la lógica de negocio de la página de inicio de sesión, interactuando con servicios para la autenticación y la navegación.",
          "dependencies": ["AuthService", "UserService", "Router", "ToastController", "LoadingController"],
          "methods": [
            {
              "name": "login()",
              "description": "Método principal que gestiona el proceso de autenticación.",
              "logic": [
                "**Validación:** Comprueba que los campos `username` y `password` no estén vacíos. Si lo están, muestra un mensaje de advertencia.",
                "**Feedback al Usuario:** Muestra un `LoadingController` para indicar que el inicio de sesión está en proceso.",
                "**Llamada al Servicio:** Invoca `this.authService.login(this.username, this.password)`. Este servicio encapsula la lógica de comunicación con la API de Firebase Authentication.",
                "**Condición (Éxito):** Si el servicio de autenticación devuelve una respuesta exitosa (`result.success`), el método procede a:",
                "  - Llamar a `this.userService.updateLastLogin(result.user.uid)` para actualizar la fecha del último inicio de sesión en el documento del usuario en la base de datos (Firestore).",
                "  - Mostrar un mensaje de bienvenida con `ToastController`.",
                "  - Usar el `Router` para navegar a la página principal de la aplicación (`/tabs`).",
                "**Condición (Error):** Si la autenticación falla, se muestra un mensaje de error detallado proporcionado por el `AuthService`."
              ],
              "database_interaction": "Indirecta. A través de `UserService`, actualiza el campo `lastLogin` en el documento del usuario en la colección `users` de Firestore para registrar la actividad."
            },
            {
              "name": "goToRegister()",
              "description": "Navega a la página de registro.",
              "logic": "Utiliza `this.router.navigate(['/register'])` para redirigir al usuario."
            },
            {
              "name": "goToForgotPassword()",
              "description": "Navega a la página de recuperación de contraseña.",
              "logic": "Utiliza `this.router.navigate(['/forgot-password'])` para redirigir al usuario."
            }
          ],
          "apis_and_microservices": "Utiliza la API de **Firebase Authentication** a través del `AuthService` para verificar las credenciales del usuario. No consume microservicios directamente."
        }
      ]
    },
    {
      "interface": "Register",
      "path": "src/app/register",
      "description": "Interfaz para que nuevos usuarios creen una cuenta en la aplicación.",
      "files": [
        {
          "path": "src/app/register/register.page.html",
          "type": "HTML",
          "description": "Define la estructura del formulario de registro.",
          "important_sections": [
            {
              "section": "Foto de Perfil",
              "description": "Permite al usuario seleccionar una foto. Muestra la imagen seleccionada o un placeholder. Al hacer clic, ejecuta `selectPhoto()`."
            },
            {
              "section": "Campos de Información",
              "description": "Inputs para nombre, email, teléfono y contraseñas, vinculados al objeto `registerForm` en el .ts."
            },
            {
              "section": "Términos y Condiciones",
              "description": "Un `ion-checkbox` que debe ser aceptado para habilitar el botón de registro."
            },
            {
              "section": "Botón de Registro",
              "description": "Botón que llama a la función `register()`. Está deshabilitado si el formulario no es válido (`!isFormValid()`)."
            }
          ]
        },
        {
          "path": "src/app/register/register.page.scss",
          "type": "SCSS",
          "description": "Estilos para la página de registro.",
          "important_sections": [
            {
              "section": ".profile-photo-section",
              "description": "Centra la sección de la foto de perfil y le da un estilo circular."
            }
          ]
        },
        {
          "path": "src/app/register/register.page.ts",
          "type": "TypeScript",
          "description": "Maneja la lógica para crear una nueva cuenta de usuario.",
          "dependencies": ["AuthService", "UserService", "PhotoService", "Router", "ToastController", "LoadingController", "AlertController"],
          "methods": [
            {
              "name": "register()",
              "description": "Procesa el registro del usuario.",
              "logic": [
                "**Validaciones:** Llama a `isFormValid()` para verificar que todos los campos estén completos, el email sea válido, las contraseñas coincidan y los términos sean aceptados.",
                "**Verificación de Email:** Llama a `this.userService.emailExists()` para consultar en Firestore si el correo ya está registrado y evitar duplicados.",
                "**Llamada al Servicio de Auth:** Invoca `this.authService.register()` con los datos del formulario. Este servicio se comunica con Firebase Authentication para crear el nuevo usuario.",
                "**Condición (Éxito en Auth):** Si el usuario se crea correctamente en Firebase (`result.success`), procede a:",
                "  - Llamar a `this.userService.createUserProfile()` para crear un nuevo documento en la colección `users` de Firestore, guardando información adicional como el nombre, teléfono y la URL de la foto.",
                "  - Si la foto de perfil fue subida, la URL de la imagen (de Firebase Storage) se incluye en el perfil.",
                "  - Muestra un mensaje de éxito y redirige al usuario a la página de Login.",
                "**Condición (Error):** Si `authService.register()` falla (ej. email ya en uso en Firebase Auth), muestra un error específico."
              ],
              "database_interaction": "Directa. Llama a `UserService` que crea un nuevo documento en la colección `users` de Firestore con el `uid` del usuario como identificador."
            },
            {
              "name": "selectPhoto() / takePhotoFromCamera() / takePhotoFromGallery()",
              "description": "Gestionan la selección y captura de la foto de perfil.",
              "logic": "Utilizan el servicio `PhotoService`, que a su vez usa el plugin `@capacitor/camera` para acceder a la cámara o galería del dispositivo. La foto seleccionada se guarda como una URL de datos (Data URL) en la variable `selectedPhoto`."
            }
          ],
          "apis_and_microservices": [
            "**Firebase Authentication:** Usado a través de `AuthService` para crear la cuenta (email/contraseña).",
            "**Firebase Storage:** Usado a través de `PhotoService` y `AuthService` para subir la foto de perfil y obtener una URL pública.",
            "**Capacitor Camera API:** Usado a través de `PhotoService` para interactuar con el hardware del dispositivo."
          ]
        }
      ]
    },
    {
      "interface": "Forgot Password",
      "path": "src/app/forgot-password",
      "description": "Permite a los usuarios restablecer su contraseña a través de un enlace enviado a su correo electrónico.",
      "files": [
        {
          "path": "src/app/forgot-password/forgot-password.page.html",
          "type": "HTML",
          "description": "Define la estructura de la página de recuperación de contraseña.",
          "important_sections": [
            {
              "section": "Input de Email",
              "description": "Un `ion-input` para que el usuario ingrese su correo electrónico."
            },
            {
              "section": "Botón de Envío",
              "description": "Botón que ejecuta `sendResetEmail()` y está deshabilitado si el email no es válido."
            }
          ]
        },
        {
          "path": "src/app/forgot-password/forgot-password.page.scss",
          "type": "SCSS",
          "description": "Estilos para centrar y dar formato a la página de recuperación."
        },
        {
          "path": "src/app/forgot-password/forgot-password.page.ts",
          "type": "TypeScript",
          "description": "Lógica para enviar el correo de restablecimiento de contraseña.",
          "dependencies": ["AuthService", "Router", "ToastController", "LoadingController"],
          "methods": [
            {
              "name": "sendResetEmail()",
              "description": "Envía el correo para restablecer la contraseña.",
              "logic": [
                "Valida que el formato del email sea correcto.",
                "Muestra un `LoadingController`.",
                "Llama a `this.authService.sendPasswordReset(this.email)`.",
                "**Condición (Éxito):** Si el envío es exitoso, muestra un mensaje de confirmación.",
                "**Condición (Error):** Si falla, muestra un mensaje de error."
              ]
            }
          ],
          "apis_and_microservices": "Utiliza la API de **Firebase Authentication** a través de `AuthService` para solicitar el envío del correo de restablecimiento."
        }
      ]
    },
    {
      "interface": "Tabs",
      "path": "src/app/tabs",
      "description": "Componente principal que contiene la barra de navegación inferior y gestiona las rutas de las secciones principales de la aplicación.",
      "files": [
        {
          "path": "src/app/tabs/tabs.page.html",
          "type": "HTML",
          "description": "Define la barra de pestañas de navegación.",
          "important_sections": [
            {
              "section": "ion-tab-bar",
              "description": "Contiene varios `ion-tab-button`, cada uno asociado a una ruta (ej. 'catalog', 'cart') y con un ícono representativo."
            }
          ]
        },
        {
          "path": "src/app/tabs/tabs.routes.ts",
          "type": "TypeScript",
          "description": "Define las rutas hijas que se cargan dentro del componente de Tabs.",
          "important_sections": [
            {
              "section": "children array",
              "description": "Mapea una ruta (ej. 'catalog') a la carga perezosa (lazy loading) del componente de la página correspondiente (ej. `CatalogPage`)."
            }
          ]
        }
      ]
    },
    {
      "interface": "Catalog",
      "path": "src/app/catalog",
      "description": "Muestra todos los productos disponibles, permitiendo a los usuarios buscar, filtrar y agregar productos al carrito.",
      "files": [
        {
          "path": "src/app/catalog/catalog.page.html",
          "type": "HTML",
          "description": "Define la estructura de la vista del catálogo.",
          "important_sections": [
            {
              "section": "Búsqueda y Filtros",
              "description": "Contiene una `ion-searchbar` para la búsqueda de texto y un `ion-segment` para filtrar productos por categoría."
            },
            {
              "section": "Vista de Productos",
              "description": "Utiliza un `*ngFor` para iterar sobre `filteredProducts` y renderizar cada producto en una `ion-card`. La vista puede cambiar entre `grid` y `list` basado en la variable `viewMode`."
            },
            {
              "section": "Botones de Acción por Producto",
              "description": "Cada tarjeta de producto tiene botones para 'Ver detalles', 'Agregar al carrito' y marcar como 'Favorito'. El estado de estos botones (ej. color o texto) cambia dinámicamente si el producto ya está en el carrito o es un favorito."
            },
            {
              "section": "Botón de Admin (FAB)",
              "description": "Un `ion-fab-button` que solo se muestra si la variable `isAdmin` es `true`, permitiendo el acceso rápido al panel de administración."
            }
          ]
        },
        {
          "path": "src/app/catalog/catalog.page.scss",
          "type": "SCSS",
          "description": "Estilos para las tarjetas de producto, la cuadrícula y la lista.",
          "important_sections": [
            {
              "section": ".products-grid / .products-list",
              "description": "Define los estilos para las dos modalidades de vista, controlando el layout y la apariencia de las tarjetas."
            },
            {
              "section": ".favorite-btn",
              "description": "Posiciona el botón de favorito en la esquina superior derecha de la imagen del producto."
            }
          ]
        },
        {
          "path": "src/app/catalog/catalog.page.ts",
          "type": "TypeScript",
          "description": "Orquesta la lógica del catálogo, incluyendo la carga de datos, filtrado y las interacciones del usuario.",
          "dependencies": ["ProductService", "AuthService", "UserService", "FavoritesService", "CartService", "Router", "ModalController"],
          "methods": [
            {
              "name": "loadData()",
              "description": "Carga los datos iniciales del catálogo.",
              "logic": "Llama a `productService.getAvailableProducts()` y `productService.getActiveCategories()` para obtener los productos y categorías desde Firestore. Muestra un estado de carga (`isLoading`) mientras los datos se recuperan.",
              "database_interaction": "Lectura. Obtiene todos los documentos de las colecciones `products` (con `isAvailable == true`) y `categories` de Firestore."
            },
            {
              "name": "filterProducts()",
              "description": "Filtra la lista de productos basándose en los criterios de búsqueda, categoría y favoritos.",
              "logic": [
                "Crea una copia del array de productos.",
                "**Condición (Favoritos):** Si `showOnlyFavorites` es `true`, filtra el array para incluir solo los productos cuyo ID está en la lista de favoritos (`favoritesService.isFavorite()`).",
                "**Condición (Categoría):** Si se ha seleccionado una categoría, filtra el array por `product.category.id`.",
                "**Condición (Búsqueda):** Si hay un término de búsqueda, filtra el array buscando coincidencias en `product.name`, `product.description` y `product.ingredients`."
              ]
            },
            {
              "name": "addToCart(product)",
              "description": "Agrega un producto al carrito.",
              "logic": "Llama a `this.cartService.addToCart(product, 1)`. Este servicio gestiona el estado del carrito, que puede estar en memoria o sincronizado con Firestore si el usuario está logueado.",
              "database_interaction": "Escritura (indirecta). `CartService` puede actualizar el subdocumento `cart` en el perfil del usuario en Firestore."
            },
            {
              "name": "toggleFavorite(product)",
              "description": "Añade o quita un producto de la lista de favoritos.",
              "logic": "Llama a `this.favoritesService.toggleFavorite(product)`. Este servicio actualiza la lista de favoritos del usuario en Firestore.",
              "database_interaction": "Escritura. `FavoritesService` actualiza un array de IDs de productos en el documento del usuario en la colección `favorites` de Firestore."
            },
            {
              "name": "viewProductDetails(product)",
              "description": "Muestra un modal con información detallada del producto.",
              "logic": "Utiliza `ModalController` para presentar el `ProductDetailsModalComponent`, pasándole el objeto `product` completo."
            }
          ],
          "apis_and_microservices": "No consume APIs externas directamente, pero interactúa intensamente con **Firestore** como su base de datos principal para obtener la información de productos y categorías."
        }
      ]
    },
    {
      "interface": "Cart",
      "path": "src/app/cart",
      "description": "Permite al usuario revisar los productos agregados, modificar cantidades y proceder al pago.",
      "files": [
        {
          "path": "src/app/cart/cart.page.html",
          "type": "HTML",
          "description": "Estructura de la página del carrito.",
          "important_sections": [
            {
              "section": "Lista de Productos",
              "description": "Itera sobre `cart.items` y muestra cada producto con su imagen, nombre, precio y controles para aumentar/disminuir cantidad."
            },
            {
              "section": "Opciones de Entrega",
              "description": "Un `ion-checkbox` para incluir delivery y un `ion-select` para elegir la distancia, lo que afecta el costo total."
            },
            {
              "section": "Resumen del Pedido",
              "description": "Muestra un desglose del subtotal, IGV, costo de delivery y el total a pagar."
            },
            {
              "section": "Botón Realizar Pedido",
              "description": "Botón principal que ejecuta `proceedToCheckout()`."
            }
          ]
        },
        {
          "path": "src/app/cart/cart.page.ts",
          "type": "TypeScript",
          "description": "Lógica para la gestión del carrito y la creación de pedidos.",
          "dependencies": ["CartService", "OrderService", "AuthService", "UserService", "Router"],
          "methods": [
            {
              "name": "proceedToCheckout()",
              "description": "Inicia el proceso de finalización de compra.",
              "logic": [
                "**Validación:** Verifica que el carrito no esté vacío y que se haya seleccionado una distancia si se incluyó el delivery.",
                "**Verificación de Teléfono:** Llama a `authService.getCurrentUser()` y `userService.getUserProfile()` para comprobar si el usuario tiene un número de teléfono guardado.",
                "**Condición (Sin Teléfono):** Si no hay teléfono, muestra un `AlertController` para que el usuario ingrese su número. Este número se guarda en el perfil de usuario en Firestore para futuros pedidos.",
                "**Confirmación de Pedido:** Muestra un `AlertController` con el resumen final del pedido para que el usuario confirme la compra."
              ],
              "database_interaction": "Lectura/Escritura. Lee el perfil del usuario para obtener el teléfono y puede escribir el nuevo número de teléfono en el documento del usuario en la colección `users`."
            },
            {
              "name": "createOrder()",
              "description": "Crea el pedido en la base de datos.",
              "logic": [
                "Llama a `this.orderService.createOrderFromCart()` pasando los datos del carrito y la información de delivery.",
                "Una vez creado el pedido, llama a `this.cartService.clearCart()` para vaciar el carrito.",
                "Navega a la página de 'Pedidos' (`/tabs/orders`)."
              ],
              "database_interaction": "Escritura. `OrderService` crea un nuevo documento en la colección `orders` de Firestore. `CartService` elimina los datos del carrito del usuario."
            }
          ]
        }
      ]
    },
    {
      "interface": "Orders",
      "path": "src/app/orders",
      "description": "Muestra el historial de pedidos del usuario o permite la gestión de todos los pedidos para el administrador.",
      "files": [
        {
          "path": "src/app/orders/orders.page.html",
          "type": "HTML",
          "description": "Vista para mostrar la lista de pedidos.",
          "important_sections": [
            {
              "section": "Filtros de Estado",
              "description": "Un `ion-segment` (solo para usuarios) para filtrar pedidos por 'todos', 'pendientes' o 'completados'."
            },
            {
              "section": "Tarjeta de Pedido Pendiente",
              "description": "Una tarjeta especial (`*ngIf='pendingOrder'`) que se muestra solo si hay un pedido recién creado, con un temporizador de 1 minuto para permitir su edición."
            },
            {
              "section": "Lista de Pedidos",
              "description": "Itera sobre `filteredOrders` y muestra cada pedido en una `ion-card` con su estado, total y botones de acción."
            },
            {
              "section": "Botones de Acción (Admin)",
              "description": "Si el usuario es admin, se muestra un botón adicional para 'Actualizar Estado' del pedido."
            }
          ]
        },
        {
          "path": "src/app/orders/orders.page.ts",
          "type": "TypeScript",
          "description": "Lógica para cargar, filtrar y gestionar pedidos.",
          "dependencies": ["OrderService", "AuthService", "ChatService", "Router", "ModalController"],
          "methods": [
            {
              "name": "loadOrders()",
              "description": "Carga los pedidos desde Firestore.",
              "logic": [
                "**Condición (Admin):** Si `isAdmin` es `true`, llama a `this.orderService.loadAllOrders()` para obtener todos los pedidos.",
                "**Condición (Usuario):** Si no es admin, llama a `this.orderService.loadUserOrders()` para obtener solo los pedidos del usuario actual.",
                "Se suscribe a los observables `allOrders$` o `userOrders$` para recibir actualizaciones en tiempo real."
              ],
              "database_interaction": "Lectura. Se suscribe a la colección `orders` de Firestore, con o sin filtro por `userId`."
            },
            {
              "name": "updateStatus(order)",
              "description": "(Admin) Actualiza el estado de un pedido.",
              "logic": "Muestra un `AlertController` con los siguientes estados posibles. Al seleccionar uno, llama a `this.orderService.updateOrderStatus()` para modificar el documento del pedido en Firestore.",
              "database_interaction": "Escritura. Modifica el campo `status` del documento del pedido en la colección `orders`."
            },
            {
              "name": "goToChat(order)",
              "description": "Navega a la pantalla de chat para un pedido específico.",
              "logic": "Usa el `Router` para navegar a `/tabs/conversation`, pasando el `orderId` y `orderCode` como parámetros de la consulta."
            }
          ]
        }
      ]
    },
    {
      "interface": "Profile",
      "path": "src/app/profile",
      "description": "Permite al usuario ver y editar su información personal, y cerrar sesión.",
      "files": [
        {
          "path": "src/app/profile/profile.page.html",
          "type": "HTML",
          "description": "Estructura de la página de perfil.",
          "important_sections": [
            {
              "section": "Encabezado de Perfil",
              "description": "Muestra la foto de perfil, nombre y email. La foto tiene un overlay para indicar que se puede cambiar."
            },
            {
              "section": "Información Personal",
              "description": "Muestra los datos del usuario. Utiliza un `*ngIf` para cambiar entre el modo de visualización y el modo de edición (`isEditing`). En modo de edición, los `ion-label` se reemplazan por `ion-input`."
            },
            {
              "section": "Botón de Cerrar Sesión",
              "description": "Botón que ejecuta la función `logout()`."
            }
          ]
        },
        {
          "path": "src/app/profile/profile.page.ts",
          "type": "TypeScript",
          "description": "Lógica para la gestión del perfil de usuario.",
          "dependencies": ["AuthService", "UserService", "PhotoService", "Router"],
          "methods": [
            {
              "name": "loadUserProfile()",
              "description": "Carga los datos del perfil del usuario.",
              "logic": "Obtiene el usuario actual de `AuthService` y luego usa su UID para llamar a `this.userService.getUserProfile(uid)` y obtener los datos del documento correspondiente en Firestore.",
              "database_interaction": "Lectura. Obtiene un documento de la colección `users` de Firestore."
            },
            {
              "name": "saveProfile()",
              "description": "Guarda los cambios realizados en el perfil.",
              "logic": "Llama a `this.userService.updateUserProfile()` con los datos del formulario de edición para actualizar el documento en Firestore.",
              "database_interaction": "Escritura. Actualiza los campos en el documento del usuario en la colección `users`."
            },
            {
              "name": "changePhoto()",
              "description": "Inicia el proceso para cambiar la foto de perfil.",
              "logic": "Muestra un `AlertController` con opciones (Cámara, Galería). Llama a `takePhoto()` que a su vez usa `PhotoService` para capturar la imagen, `photoService.uploadPhoto()` para subirla a Firebase Storage, y finalmente `userService.updateUserProfile()` para guardar la nueva URL de la foto en Firestore.",
              "apis_and_microservices": "Interactúa con **Firebase Storage** para subir la imagen y con **Capacitor Camera API** para acceder al hardware."
            },
            {
              "name": "logout()",
              "description": "Cierra la sesión del usuario.",
              "logic": "Llama a `this.authService.logout()` para invalidar la sesión en Firebase Authentication y luego redirige al usuario a la página de `/login`."
            }
          ]
        }
      ]
    },
    {
      "interface": "Admin",
      "path": "src/app/admin",
      "description": "Panel de administración para la gestión completa de productos y categorías.",
      "files": [
        {
          "path": "src/app/admin/admin.page.html",
          "type": "HTML",
          "description": "Estructura del panel de administración.",
          "important_sections": [
            {
              "section": "Lista de Productos",
              "description": "Muestra los productos en tarjetas con información detallada y múltiples botones para editar, eliminar, ver detalles y cambiar disponibilidad."
            },
            {
              "section": "Modal de Formulario de Producto",
              "description": "Un `ion-modal` que contiene un formulario completo para crear o editar un producto, incluyendo campos para detalles básicos, ingredientes, alérgenos, información nutricional e imágenes."
            },
            {
              "section": "Integración con Google Drive",
              "description": "Botones para conectar, seleccionar o subir imágenes desde Google Drive, visibles en la barra de herramientas y en el formulario de producto."
            }
          ]
        },
        {
          "path": "src/app/admin/admin.page.ts",
          "type": "TypeScript",
          "description": "Lógica de negocio para toda la gestión de la tienda.",
          "dependencies": ["ProductService", "UserService", "AuthService", "GoogleDriveService", "IngredientsAllergensService"],
          "methods": [
            {
              "name": "saveProduct()",
              "description": "Crea o actualiza un producto.",
              "logic": [
                "Valida el formulario.",
                "**Condición (Edición):** Si `editingProduct` no es nulo, llama a `productService.updateProduct()`.",
                "**Condición (Creación):** Si es un producto nuevo, llama a `productService.createProduct()`.",
                "Maneja la subida de imágenes a Firebase Storage si la imagen es local (data URL) o simplemente guarda la URL si es externa o de Google Drive."
              ],
              "database_interaction": "Escritura/Actualización. Crea o modifica documentos en la colección `products` de Firestore."
            },
            {
              "name": "deleteProduct(product)",
              "description": "Elimina un producto.",
              "logic": "Muestra una alerta de confirmación y, si se acepta, llama a `productService.deleteProduct(product.id)`.",
              "database_interaction": "Eliminación. Borra un documento de la colección `products`."
            },
            {
              "name": "connectGoogleDrive() / selectFromGoogleDrive() / uploadToGoogleDrive()",
              "description": "Gestiona la integración con Google Drive.",
              "logic": "Utiliza `GoogleDriveService` para manejar la autenticación OAuth 2.0, abrir el Google Picker (una API de Google para seleccionar archivos) y subir archivos a la cuenta de Drive del usuario.",
              "apis_and_microservices": "Usa la **API de Google Drive** y la **API de Google Picker** a través del `GoogleDriveService`."
            },
            {
              "name": "addNewIngredient() / addNewAllergen()",
              "description": "Añade nuevos ingredientes o alérgenos a la base de datos global.",
              "logic": "Llama a `ingredientsAllergensService` para añadir el nuevo término a un documento central en Firestore que contiene dos arrays: `ingredients` y `allergens`.",
              "database_interaction": "Actualización. Modifica un documento en la colección `ingredients_allergens` para añadir nuevos elementos a los arrays."
            }
          ]
        }
      ]
    },
    {
      "interface": "Conversation",
      "path": "src/app/chat",
      "description": "Interfaz de chat en tiempo real para la comunicación entre el cliente y el administrador sobre un pedido específico.",
      "files": [
        {
          "path": "src/app/chat/conversation.page.html",
          "type": "HTML",
          "description": "Define la vista de la conversación de chat.",
          "important_sections": [
            {
              "section": "Contenedor de Mensajes",
              "description": "Itera sobre el array `messages` y muestra cada mensaje en una 'burbuja'. Utiliza `[ngClass]` para aplicar estilos diferentes si el mensaje es del usuario actual (`my-message`) o del otro participante (`other-message`)."
            },
            {
              "section": "Input de Mensaje",
              "description": "Un `ion-textarea` en el pie de página para escribir nuevos mensajes, con un botón de envío que llama a `sendMessage()`."
            }
          ]
        },
        {
          "path": "src/app/chat/conversation.page.ts",
          "type": "TypeScript",
          "description": "Controla la lógica del chat en tiempo real.",
          "dependencies": ["ChatService", "AuthService", "OrderService", "ActivatedRoute"],
          "methods": [
            {
              "name": "ngOnInit()",
              "description": "Inicializa la página de chat.",
              "logic": [
                "Obtiene el `orderId` de los parámetros de la ruta (`ActivatedRoute`).",
                "Obtiene el ID del usuario actual desde `AuthService`.",
                "Llama a `this.chatService.loadMessages(this.orderId)` para empezar a escuchar los cambios en la subcolección de chat del pedido.",
                "Se suscribe al observable `messages$` del `ChatService` para recibir los mensajes en tiempo real y actualizar la vista."
              ],
              "database_interaction": "Lectura en tiempo real (suscripción). `ChatService` se suscribe a la subcolección `messages` dentro del documento de un pedido específico en la colección `orders` de Firestore."
            },
            {
              "name": "sendMessage()",
              "description": "Envía un nuevo mensaje.",
              "logic": "Llama a `this.chatService.sendMessage()` con el ID del pedido, el texto del mensaje y la información del remitente. El servicio se encarga de crear un nuevo documento en la subcolección de mensajes.",
              "database_interaction": "Escritura. `ChatService` añade un nuevo documento a la subcolección `messages` del pedido correspondiente."
            }
          ]
        }
      ]
    }
  ]
}