# 📱 Guía para Generar APK - Pastelería D'Diego

## ✅ Estado Actual
- ✅ Proyecto compilado exitosamente
- ✅ Archivos sincronizados con Android
- ✅ Android Studio debe estar abriéndose automáticamente

## 🛠️ Pasos para Generar APK

### Opción 1: Desde Android Studio (Recomendado)

1. **Espera a que Android Studio termine de cargar**
   - Puede tardar varios minutos la primera vez
   - Dejará de mostrar "Gradle Build Running"

2. **Genera APK para Debug**
   ```
   Build → Build Bundle(s) / APK(s) → Build APK(s)
   ```

3. **Localiza tu APK**
   - Aparecerá notificación con link "locate"
   - Ruta: `android/app/build/outputs/apk/debug/app-debug.apk`

### Opción 2: Desde Terminal (Si Android Studio no funciona)

```powershell
# Navegar al directorio android
cd android

# Generar APK debug
./gradlew assembleDebug

# El APK estará en: app/build/outputs/apk/debug/app-debug.apk
```

### Opción 3: APK Firmado para Producción

```powershell
# Generar APK de release (firmado)
cd android
./gradlew assembleRelease
```

## 📍 Ubicación de Archivos

- **APK Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **APK Release**: `android/app/build/outputs/apk/release/app-release.apk`

## 🔧 Solución de Problemas

### Si Android Studio no abre:
1. Instalar Android Studio desde: https://developer.android.com/studio
2. Configurar SDK de Android
3. Agregar variables de entorno ANDROID_HOME

### Si Gradle falla:
```powershell
# Limpiar proyecto
cd android
./gradlew clean
./gradlew build
```

## 📱 Instalar en Dispositivo

1. **Habilitar Desarrollo USB** en tu teléfono Android
2. **Instalar APK**:
   ```
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

## 🎯 Credenciales de Prueba

- **Usuario**: admin
- **Contraseña**: admin

---

**¡Tu app está lista para probar!** 🚀