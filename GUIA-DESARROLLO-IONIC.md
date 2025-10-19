# Documentación del Proyecto - Pastelería D'Diego

## Descripción del proyecto

Esta es una aplicación móvil híbrida desarrollada con Ionic y Angular. La aplicación funciona tanto en navegadores web como en Android e iOS, utilizando el mismo código base.

El proyecto está configurado con:
- Ionic Framework para la interfaz de usuario
- Capacitor para acceso a funciones nativas del dispositivo
- Firebase como backend (base de datos, autenticación, etc.)

## Comandos de desarrollo

### Para trabajar en el navegador
```bash
ionic serve
```
Esto inicia un servidor local en http://localhost:8100 y se actualiza automáticamente cuando se modifican archivos.

### Para probar en Android
```bash
ionic capacitor run android
```
Requiere tener Android Studio instalado.

### Para probar en iOS (solo en Mac)
```bash
ionic capacitor run ios
```
Requiere Xcode instalado.

## Estructura del código

```
ProyectoApps/
├── src/                    # Código fuente de la aplicación
│   ├── app/               # Componentes y páginas
│   ├── theme/             # Estilos CSS
│   └── assets/            # Imágenes, iconos, etc.
├── android/               # Proyecto Android (generado automáticamente)
├── ios/                   # Proyecto iOS (generado automáticamente)
└── www/                   # Aplicación compilada (generada al hacer build)
```

## Flujo de desarrollo recomendado

El proceso típico de desarrollo es:

1. **Desarrollo en el navegador** (más rápido):
   ```bash
   ionic serve
   ```
   Los cambios en el código se reflejan automáticamente en el navegador.

2. **Para probar en dispositivos móviles**:
   ```bash
   ionic build
   ionic capacitor sync
   ionic capacitor run android
   ```
   
   - `build` compila la aplicación
   - `sync` actualiza los proyectos nativos
   - `run` instala y ejecuta en el dispositivo

## 📱 Capacidades Nativas Disponibles

Ya tienes instalados estos plugins de Capacitor:

- **@capacitor/app** - Información de la app
- **@capacitor/haptics** - Vibración
- **@capacitor/keyboard** - Control del teclado
- **@capacitor/status-bar** - Barra de estado

### Para agregar más funcionalidades nativas:

```bash
# Cámara
npm install @capacitor/camera
ionic capacitor sync

# Geolocalización
npm install @capacitor/geolocation
ionic capacitor sync

# Almacenamiento local
npm install @capacitor/preferences
ionic capacitor sync

# Push notifications
npm install @capacitor/push-notifications
ionic capacitor sync
```

## 🛠️ Requisitos para Compilar Nativo

### Para Android:
- ✅ **Android Studio** instalado
- ✅ **Java JDK 11+** 
- ✅ **SDK de Android**

### Para iOS (solo Mac):
- ✅ **Xcode** instalado
- ✅ **CocoaPods** (`sudo gem install cocoapods`)

## 🎨 Personalización

### Cambiar tema/colores:
Edita: `src/theme/variables.css`

### Agregar páginas:
```bash
ionic generate page nombre-pagina
```

### Agregar componentes:
```bash
ionic generate component nombre-componente
```

## 🌐 URLs Importantes

- **Desarrollo local**: http://localhost:8100
- **Documentación Ionic**: https://ionicframework.com/docs
- **Capacitor Plugins**: https://capacitorjs.com/docs/plugins

## 🚀 Compilar para Producción

### Web:
```bash
ionic build --prod
```

### Android APK:
```bash
ionic build --prod
ionic capacitor sync android
ionic capacitor run android --prod
```

### iOS (en Mac):
```bash
ionic build --prod
ionic capacitor sync ios
ionic capacitor run ios --prod
```

## � Firebase Integrado

Ya tienes **Firebase** instalado y configurado:
- ✅ **Firebase SDK** + AngularFire
- ✅ **Servicios base** creados (Auth, Firestore)
- ✅ **Configuración** lista para usar

**📖 Ver guía completa**: `FIREBASE-INTEGRATION.md`

### Configuración rápida:
1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Reemplazar configuración en `src/environments/environment.ts`
3. Configurar app.config.ts (ver guía Firebase)

## �📝 Próximos Pasos Recomendados

1. **Probar la app**: `ionic serve`
2. **Configurar Firebase** (ver FIREBASE-INTEGRATION.md)
3. **Personalizar el tema** en `src/theme/variables.css`
4. **Crear tu primera página personalizada**
5. **Implementar autenticación Firebase**
6. **Integrar APIs nativas** según necesites

## 🤝 Trabajo Colaborativo

Recuerda el flujo de Git que vimos antes:
```bash
git checkout -b feature/nueva-funcionalidad
# Hacer cambios
git add .
git commit -m "feat: nueva funcionalidad"
git push origin feature/nueva-funcionalidad
# Crear Pull Request en GitHub
```

¡Tu proyecto está 100% listo para desarrollo híbrido! 🎉