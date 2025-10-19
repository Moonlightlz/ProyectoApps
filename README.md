# Pastelería D'Diego - App Móvil

Aplicación móvil híbrida para la pastelería D'Diego, desarrollada con Ionic, Angular y Firebase.

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Git

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/Moonlightlz/ProyectoApps.git
cd ProyectoApps

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ionic serve
```

La aplicación estará disponible en http://localhost:8100

## 📱 Características

- **Multiplataforma**: Web, Android, iOS
- **Tiempo real**: Sincronización automática con Firebase
- **Offline**: Funciona sin conexión a internet
- **Responsive**: Adaptable a diferentes tamaños de pantalla

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
│   ├── app/                 # Componentes y páginas Angular
│   ├── services/            # Servicios Firebase
│   ├── theme/              # Estilos CSS personalizados
│   └── environments/       # Configuración de entornos
├── android/                # Proyecto Android nativo
├── ios/                    # Proyecto iOS nativo
└── www/                    # Build de producción
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

## 🐛 Problemas Conocidos

- La primera carga puede ser lenta debido a la inicialización de Firebase
- En iOS, las notificaciones push requieren certificados de Apple
- Android requiere permisos específicos para cámara y almacenamiento

## 📊 Estado del Proyecto

- ✅ Configuración base de Ionic + Angular
- ✅ Integración con Firebase (Auth, Firestore, Storage)
- ✅ Configuración para Android e iOS
- ⏳ Desarrollo de pantallas principales
- ⏳ Sistema de autenticación de usuarios
- ⏳ Catálogo de productos
- ⏳ Sistema de pedidos

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