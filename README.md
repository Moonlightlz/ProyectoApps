# Pastelería D'Diego - App Móvil

Aplicación móvil híbrida para la pastelería D'Diego, desarrollada con Ionic, Angular y Firebase.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Git

### Instalación

#### Opción 1: Setup Automático (Recomendado)
```bash
# Clonar el repositorio
git clone https://github.com/Moonlightlz/ProyectoApps.git
cd ProyectoApps

# Configuración automática
node setup.js
```

#### Opción 2: Setup Manual
```bash
# Instalar Ionic CLI globalmente
npm install -g @ionic/cli

# Instalar dependencias
npm install

# Verificar instalación
npm run doctor

# Ejecutar en desarrollo
ionic serve
```

La aplicación estará disponible en http://localhost:8100

## 📱 Características

- **Multiplataforma**: Web, Android, iOS
- **Tiempo real**: Sincronización automática con Firebase
- **Offline**: Funciona sin conexión a internet
- **Responsive**: Adaptable a diferentes tamaños de pantalla

## 🧭 Navegación de la App

La aplicación está organizada en **6 pestañas principales**:

1. **🏠 Inicio** - Pantalla principal con información de la pastelería
2. **🧁 Menú/Tienda** - Catálogo de productos disponibles
3. **📋 Pedidos** - Historial y seguimiento de órdenes
4. **💬 Chat** - Comunicación directa con atención al cliente
5. **🛒 Carrito** - Productos seleccionados para compra
6. **👤 Perfil** - Información personal y configuraciones

### Páginas adicionales:
- **🔐 Login** - Autenticación de usuarios y administradores

## 🛠️ Tecnologías

- **Frontend**: Ionic 7 + Angular 20
- **Backend**: Firebase (Firestore, Auth, Storage)
- **Móvil**: Capacitor
- **Lenguaje**: TypeScript

## 📋 Configuración Completa

Para una configuración detallada del entorno de desarrollo, consulta:
- [📖 **Guía de Configuración**](SETUP-DESARROLLO.md) - Instalación paso a paso
- [🔧 **Documentación de Desarrollo**](GUIA-DESARROLLO-IONIC.md) - Comandos y estructura
- [🔥 **Integración Firebase**](FIREBASE-INTEGRATION.md) - Configuración del backend

## 🏗️ Estructura del Proyecto

```
ProyectoApps/
├── src/
│   ├── app/
│   │   ├── tabs/           # Sistema de navegación por pestañas
│   │   ├── tab1/          # Página de Inicio (Home)
│   │   ├── catalog/       # Menú y Tienda
│   │   ├── orders/        # Historial de Pedidos
│   │   ├── chat/          # Chat con atención al cliente
│   │   ├── cart/          # Carrito de compras
│   │   ├── profile/       # Perfil de usuario
│   │   └── login/         # Autenticación de usuarios
│   ├── services/          # Servicios Firebase (auth, firestore)
│   ├── theme/             # Estilos CSS personalizados
│   └── environments/      # Configuración de entornos
├── android/               # Proyecto Android nativo
├── ios/                   # Proyecto iOS nativo
└── www/                   # Build de producción
```

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo web
ionic serve

# Build para producción
ionic build

# Android
ionic capacitor run android

# iOS (solo Mac)
ionic capacitor run ios

# Generar componente
ionic generate component nombre-componente

# Generar página
ionic generate page nombre-pagina
```

## 🤝 Contribución

1. Fork el repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Hacer commit de los cambios (`git commit -m 'feat: nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

### Convención de Commits
- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato
- `refactor:` Refactorización de código
- `test:` Agregar o modificar tests

## 📝 Scripts Disponibles

```bash
npm start                    # ionic serve
npm run build               # ionic build
npm run build:prod          # ionic build --prod
npm run android             # ionic capacitor run android
npm run ios                 # ionic capacitor run ios
```

## 🔧 Configuración Firebase

El proyecto está configurado para usar Firebase como backend. Las configuraciones están en:
- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

Para desarrollo local, solicita acceso al proyecto Firebase o configura tu propio proyecto.

## 📱 Capacidades Nativas

La aplicación incluye acceso a:
- Cámara del dispositivo
- Almacenamiento local
- Notificaciones push (configuración pendiente)
- Geolocalización (configuración pendiente)

## 🐛 Problemas Conocidos y Soluciones

### Error: "Cannot find module '@capacitor/camera'"
**Problema**: Al clonar el proyecto y ejecutar `ionic serve`, aparecen errores de módulos de Capacitor no encontrados.

**Solución**:
```bash
# 1. Verificar que Node.js está instalado (versión 18+)
node --version

# 2. Limpiar caché e instalar dependencias
rm -rf node_modules package-lock.json
npm install

# 3. Si persiste, instalar dependencias de Capacitor manualmente
npm install @capacitor/camera @capacitor/filesystem @capacitor/core @capacitor/cli

# 4. Verificar instalación
ionic info
npx cap doctor
```

### Error: "JAVA_HOME not set" (Solo Android)
**Problema**: Al generar APK, Gradle no encuentra Java.

**Solución Windows**:
```powershell
# Configurar variables de entorno temporalmente
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
java -version
```

### Error de permisos en Android
**Problema**: La cámara no funciona en dispositivos Android.

**Solución**: Verificar permisos en `android/app/src/main/AndroidManifest.xml`

### Otros problemas comunes
- La primera carga puede ser lenta debido a la inicialización de Firebase
- En iOS, las notificaciones push requieren certificados de Apple
- Usar Java 11+ para compilación de Android (Java 8 no es compatible)

## 📊 Estado del Proyecto

- ✅ Configuración base de Ionic + Angular
- ✅ Integración con Firebase (Auth, Firestore, Storage)
- ✅ Configuración para Android e iOS
- ✅ Estructura de navegación por pestañas (6 secciones principales)
- ✅ Páginas base creadas: Inicio, Menú, Pedidos, Chat, Carrito, Perfil
- ✅ Página de login con diseño base
- ⏳ Sistema de autenticación funcional
- ⏳ Catálogo de productos con Firebase
- ⏳ Sistema de pedidos y carrito
- ⏳ Chat funcional con soporte para fotos

## 🔗 Enlaces Útiles

- [Documentación de Ionic](https://ionicframework.com/docs)
- [Documentación de Angular](https://angular.dev)
- [Documentación de Firebase](https://firebase.google.com/docs)
- [Documentación de Capacitor](https://capacitorjs.com/docs)

## 📄 Licencia

Este proyecto es privado y pertenece a Pastelería D'Diego.

## 👥 Equipo de Desarrollo

- **Desarrollador Principal**: [MoonPache](https://github.com/Moonlightlz)
- **Colaboradores**: Ver [Contributors](https://github.com/Moonlightlz/ProyectoApps/contributors)

---

**¿Necesitas ayuda?** Revisa la [guía de configuración](SETUP-DESARROLLO.md) o contacta al equipo de desarrollo.