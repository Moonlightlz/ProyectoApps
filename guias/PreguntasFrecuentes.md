# Preguntas frecuentes (FAQ) — Proyecto Pastelería D'Diego

Este archivo responde preguntas técnicas habituales sobre el proyecto y añade varias preguntas que suelen surgir en revisiones técnicas o entrevistas.

---

1) ¿Cuál es la ubicación y las rutas principales del proyecto en VS Code?
- Ruta raíz del proyecto (workspace): `C:\Users\MoonPache\Desktop\ProyectoApps\ProyectoApps`
- Carpetas y archivos clave:
  - `src/` — código fuente Angular/Ionic (páginas, componentes, servicios, assets)
  - `src/app/` — componentes y páginas de la app (ej.: `orders`, `chat`, `admin`, `services`)
  - `android/` — proyecto Android (Capacitor)
  - `ios/` — proyecto iOS (Capacitor, macOS)
  - `www/` — carpeta generada con los assets compilados (build output)
  - `package.json`, `angular.json`, `tsconfig.json`, `ionic.config.json` — configuración del proyecto

2) ¿Dónde está el código o método que inicia la transpilación?
- La transpilación la dispara el build de Angular/Ionic. Los puntos relevantes:
  - `package.json` — scripts: `ionic build`, `ng run app:build` u `npm run build`.
  - `angular.json` — configuración de build (project → architect → build → options)
  - `tsconfig.json` — configuración del compilador TypeScript (`target`, `module`, etc.).
  - Comando usado: `ionic build --prod` o `npm run build:prod`.

3) ¿Dónde está la "regla" para asignar imágenes en Ionic?
- No existe una única "regla" global; las imágenes se asignan en código y plantillas:
  - Plantillas (HTML): `<img [src]="product.imageUrl" />` o en componentes `background-image` en CSS.
  - Servicios que generan/guardan URLs de imagen:
    - `src/app/services/product.service.ts` — guarda `imageUrl` y `driveFileId` al crear productos.
    - `src/app/services/photo.ts` y `src/app/services/google-drive.service.ts` — gestionan la subida y obtención de URLs (Firebase Storage o Google Drive).
  - Estilos globales que afectan cómo se muestran: `src/global.scss` y `src/app/components/*.scss`.

4) ¿Qué framework se usa para tu API / servicio web?
- No hay API REST propia en este repositorio. El proyecto usa BaaS y APIs externas:
  - Backend principal: **Firebase** (Firestore + Auth + Storage) — usado como backend.
  - Servicio externo de ficheros: **Google Drive API** (Drive v3) para subida/gestión de imágenes desde admin.

5) ¿Qué servidor de base de datos usaste?
- Se utiliza **Firestore** (Firebase, NoSQL) como base de datos principal.
  - Uso: colecciones `products`, `orders`, `users`, `chatConversations`, etc.

6) ¿Cuántos archivos se crean cuando creas un componente (Ionic/Angular)?
- Por defecto `ionic generate component <name>` crea 4 archivos principales:
  - `<name>.component.ts` (lógica)
  - `<name>.component.html` (plantilla)
  - `<name>.component.scss` (estilos)
  - `<name>.component.spec.ts` (pruebas unitarias)
- Nota: en Angular también puede generarse un módulo o `index.ts` según la configuración; hoy muchos componentes son `standalone`.

7) ¿Dónde ver la versión que se va a transpilar?
- Para saber el "target" de JS que generará TypeScript: `tsconfig.json` → `compilerOptions.target` (ej.: `"target": "es2022"`).
- Para ver versiones de framework/librerías (Angular, Ionic, Firebase): `package.json` → dependencias y `version`.
- Para ver la configuración de build: `angular.json` (opciones del builder).

8) ¿Dónde está la línea de código que permite "aceptar" (guardar) peticiones del front?
- No existe un endpoint HTTP propio. La app escribe directamente en Firestore desde el front. Ejemplos de piezas de código que guardan datos:
  - `src/app/services/firestore.service.ts` → método `create()` usa `addDoc(collection(this.firestore, collectionName), ...)`.
  - `src/app/services/order.service.ts` → `addDoc(ordersRef, orderData)` crea pedidos.
  - `src/app/services/product.service.ts` → guarda productos con `setDoc` o `addDoc`.
  - Si tu pregunta se refiere a un servidor Express/endpoint HTTP, en este repo NO hay código de servidor; la "aceptación" se hace por las llamadas SDK a Firestore.

9) ¿Qué y cómo interactúan los componentes?
- Patrón general de la app:
  - Componentes y páginas solicitan/actualizan datos a través de **servicios** (`AuthService`, `ProductService`, `OrderService`, `ChatService`, etc.).
  - Los servicios usan Firebase SDK para persistencia y BehaviorSubjects/Observables para propagar cambios en tiempo real.
  - La navegación entre páginas se realiza mediante el `Router` y rutas en `src/app/tabs/tabs.routes.ts` y `src/app/app.routes.ts`.
  - Ejemplo: `OrdersPage` usa `OrderService.userOrders$` para mostrar pedidos; `ConversationPage` usa `ChatService.messages$` para renderizar mensajes en tiempo real.

10) Pregunta extra sugerida: ¿Cómo se manejan los usuarios administradores?
- El app usa lógica en `src/app/services/user.ts` y comprobaciones de email en `AuthService`/`ChatService` para determinar si el usuario es admin (lista de emails autorizados). En producción se recomienda usar claims personalizados o reglas en Firestore para seguridad.

11) ¿Cómo transpilas tu código?
- Flujo de compilación/transpilación:
  1. `ionic build --prod` (o `npm run build:prod`) ejecuta Angular CLI.
  2. Angular CLI invoca el compilador TypeScript según `tsconfig.json` y el Angular Compiler (Ivy/Angular compiler).
  3. Salida: carpeta `www/` con HTML/CSS/JS transpilado y optimizado.
- Comandos útiles:
```powershell
ionic build --prod
npm run build
npx ng build --configuration production
```

12) ¿Cuáles son los 4 archivos que se crean al iniciar un proyecto Ionic (mínimos en la raíz)?
- Archivos típicos generados al crear un nuevo proyecto Ionic + Angular:
  - `package.json` (metadatos y scripts)
  - `angular.json` (configuración del build)
  - `tsconfig.json` (configuración TypeScript)
  - `ionic.config.json` (configuración específica de Ionic)
- Nota: también se crean carpetas como `src/`, `e2e/`, y archivos `README.md`, `.gitignore`.

13) ¿Cómo ver la versión de JS que emite TypeScript?
- Revisa `tsconfig.json` → `compilerOptions.target` (ejemplo en este proyecto: `"target": "es2022"`).
  - Archivo: `tsconfig.json` (línea: `"target": "es2022"`).

14) ¿En qué archivo puedes moverte entre pestañas (producto, carrito, pedidos, perfil)?
- Rutas y pestañas:
  - `src/app/tabs/tabs.page.html` — plantilla del tab bar (botones de pestañas)
  - `src/app/tabs/tabs.routes.ts` — rutas hijas que sirven cada pestaña: `home`, `catalog`, `orders`, `cart`, `profile`, `conversation`.

---

Otras preguntas útiles que pueden surgir (añadidas)

A) ¿Dónde están las credenciales (Firebase / Google Drive)?
- `src/environments/environment.ts` y `src/environments/environment.prod.ts` contienen `firebaseConfig`.
- `src/app/services/google-drive.service.ts` incluye `CLIENT_ID` y `API_KEY` (si están en el código; preferible mover a variables de entorno).

B) ¿Cómo firmaste el APK y dónde está la keystore?
- En este proyecto generamos `android/pasteleria-diego.keystore` y configuramos `android/app/build.gradle` con `signingConfigs.release`.
- APK firmado: `android/app/build/outputs/apk/release/app-release.apk`.

C) ¿Cómo probar push/real-time notifications o chat?
- Chat usa Firestore `onSnapshot`—prueba con dos sesiones (admin + usuario) simultáneas; mensajes se sincronizan en tiempo real.

D) ¿Dónde están las reglas de seguridad de Firestore?
- Las reglas de seguridad NO están en este repo; se definen en la consola de Firebase o en un proyecto de Infrastructure/Functions si existe. Recomendación: exportarlas y mantenerlas en `infrastructure/`.

E) ¿Cómo agregar pagos (Stripe, MercadoPago)?
- Recomendación: crear un `payment.service.ts` y usar un backend seguro (Cloud Functions o servidor propio) para manejar llaves secretas y crear intenciones de pago.

---

Si quieres, puedo:
- Añadir ejemplos de líneas específicas (con número de archivo y línea) para los métodos (`addDoc`, `updateDoc`) o para el `tsconfig.target`.
- Generar una versión imprimible (PDF) de este FAQ.
- Añadir las preguntas a `README.md` o `docs/FAQ.md` en otro formato.

---

**Archivo generado:** `guias/PreguntasFrecuentes.md`

Estado del TODO: marcaré este item como completado en la lista de tareas.
