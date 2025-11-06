# Documentación: APIs y servicios — Proyecto Pastelería D'Diego

Este documento sirve como referencia técnica (documentación) de las APIs externas y servicios integrados en la aplicación. Incluye el propósito de cada servicio, el alcance funcional y los archivos principales donde se consumen.

## Resumen rápido
- Backend / BaaS principal: Firebase (Auth, Firestore, Storage) — usado como autenticación, base de datos y almacenamiento de archivos.
- Servicio externo para archivos: Google Drive API (Drive v3 + Google Identity Services + Picker) — para subir y gestionar imágenes desde el panel admin.
- Plugins nativos: Capacitor (camera, filesystem, keyboard, status-bar, haptics, app) — para funcionalidades nativas en móvil.
- Otros: Google Fonts (CSS), DiceBear (avatares). Muchas llamadas HTTP/REST se realizan con `fetch()` (ej. Google Drive API).

---

## 1) Firebase (Auth, Firestore, Storage)
Qué hace:
- Autenticación de usuarios (registro/login, reset password).
- Persistencia de datos: colecciones como `products`, `orders`, `users`, `chatConversations`, etc.
- Almacenamiento de archivos: Firebase Storage (imágenes de perfil/producto).

Archivos principales donde aparece:
- `src/main.ts` — registro de providers: `provideFirebaseApp`, `provideFirestore`, `provideStorage`.
- `src/environments/environment.ts` y `src/environments/environment.prod.ts` — `firebaseConfig`.
- Servicios que usan Firebase:
  - `src/app/services/auth.service.ts` (Auth — login/register/reset/update)
  - `src/app/services/firestore.service.ts` (wrapper CRUD genérico para Firestore)
  - `src/app/services/product.service.ts` (products — Firestore + Storage)
  - `src/app/services/order.service.ts` (orders — Firestore, Timestamps)
  - `src/app/services/chat.service.ts` (chatConversations, mensajes — onSnapshot, subcolecciones)
  - `src/app/services/photo.ts` (subir fotos a Firebase Storage: `uploadString`, `getDownloadURL`)
  - `src/app/services/favorites.service.ts`, `src/app/services/cart.service.ts` (acceso a Firestore)
  - `src/app/services/user.ts` (servicio de usuario, roles/admin logic)

Notas técnicas:
- Import común observado: `import { Firestore, collection, addDoc, getDocs, query, where, doc, updateDoc, Timestamp } from '@angular/fire/firestore'`
- Storage import: `import { Storage, ref, uploadString, getDownloadURL, deleteObject } from '@angular/fire/storage'`

---

## 2) Google Drive API (Drive v3 + Google Identity Services + Picker)
Qué hace:
- Autenticación OAuth (Google Identity Services) para admin.
- Subida de imágenes (multipart), conversión a WebP, creación de carpeta de productos, hacer archivos públicos y obtener URLs.
- Google Picker para selección de archivos.

Archivo principal:
- `src/app/services/google-drive.service.ts` — implementación completa: carga de `gsi` y `gapi`, `fetch()` directo a `https://www.googleapis.com/drive/v3` y `upload/drive/v3`.

Uso en UI/admin:
- `src/app/admin/admin.page.ts` — invoca funciones del servicio para subir/gestionar imágenes.

Notas:
- El servicio hace `fetch()` con `Authorization: Bearer <access_token>`; requiere configurar `CLIENT_ID` y `API_KEY` en Google Cloud Console. Ver `guias/GoogleDriveSetup.md` (referencia en el servicio).

---

## 3) Capacitor (plugins nativos)
Qué hace:
- Proporciona acceso a cámara, filesystem y otras APIs nativas cuando la app corre en Android/iOS.

Plugins detectados y archivos que los usan:
- `@capacitor/camera` — usado en `src/app/services/photo.ts`, `src/app/register/register.page.ts`, `src/app/admin/admin.page.ts`.
- `@capacitor/filesystem` — usado en `src/app/services/photo.ts`.
- Otros plugins incluidos en el build: `@capacitor/app`, `@capacitor/haptics`, `@capacitor/keyboard`, `@capacitor/status-bar` (listados en `android/app/src/main/assets/capacitor.plugins.json`).

---

## 4) Otras APIs / recursos externos
- Google Fonts — import en `src/global.scss` (`@import url('https://fonts.googleapis.com/...')`).
- DiceBear Avatars — URLs usadas en `src/app/services/photo.ts` (`getDefaultAvatars()` devuelve URLs de DiceBear).
- `fetch()` — se usa ampliamente (Google Drive, y el bundle contiene fetch usado por Firebase SDK). Revisa `google-drive.service.ts` y los bundles en `android/app/src/main/assets/public`.

---

## 5) Microservicios / Backend
Qué hay:
- No hay microservicios internos / backend personalizado en el repo (no hay carpeta `server/`, `api/` ni funciones Cloud locales). El proyecto usa BaaS y APIs externas:
  - **Firebase**: Actúa como backend (Auth, Firestore, Storage).
  - **Google Drive**: Servicio externo para archivos (opcional, usado por admin).

Archivos relevantes (Firebase como "backend"):
- `src/main.ts` (configuración)
- `src/environments/*.ts` (credenciales)
- Servicios que interactúan con Firestore: `src/app/services/firestore.service.ts`, `product.service.ts`, `order.service.ts`, `chat.service.ts`, `user.ts`, etc.

---

## 6) Localización de credenciales y configuración
- Firebase: `src/environments/environment.ts` / `environment.prod.ts` (no subas credenciales a repos públicos si las modificas).
- Google Drive: `CLIENT_ID` y `API_KEY` están en `src/app/services/google-drive.service.ts` (se menciona `guias/GoogleDriveSetup.md` para configuración segura).

---

## 7) Notas y recomendaciones
- (Opcional) Crear `guias/GoogleDriveSetup.md` con instrucciones para generar `CLIENT_ID` y `API_KEY` en Google Cloud y cómo configurar redirecciones y permisos.
- Mover credenciales y secretos fuera del código fuente y gestionarlos mediante variables de entorno o archivos de configuración no versionados (`.env`, `gradle.properties` para Android, etc.).
- Si en el futuro se requieren endpoints propios (por ejemplo, para pagos o webhooks), considerar añadir un backend o utilizar Cloud Functions y documentar su integración.

---

## 8) Mapa rápido (archivo → responsabilidad)
- `src/main.ts` — inicialización Firebase
- `src/environments/environment.ts` — credenciales y flags
- `src/app/services/auth.service.ts` — Firebase Auth
- `src/app/services/firestore.service.ts` — wrapper CRUD Firestore
- `src/app/services/product.service.ts` — productos (Firestore + Storage)
- `src/app/services/order.service.ts` — pedidos (Firestore)
- `src/app/services/chat.service.ts` — chat en tiempo real (Firestore)
- `src/app/services/photo.ts` — cámara y subida a Firebase Storage (usa Capacitor)
- `src/app/services/google-drive.service.ts` — Google Drive API, Picker y upload
- `src/app/admin/admin.page.ts` — UI/admin que usa Google Drive para imágenes
