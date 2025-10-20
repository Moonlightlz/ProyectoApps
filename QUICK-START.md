# 🚀 Guía de Instalación Rápida

## Para nuevos desarrolladores que clonan el proyecto

### Opción 1: Setup Automático (Recomendado)
```bash
# Después de clonar el repositorio
cd ProyectoApps
node setup.js
```

### Opción 2: Setup Manual
```bash
# 1. Instalar Ionic CLI globalmente
npm install -g @ionic/cli

# 2. Instalar dependencias
npm install

# 3. Si hay errores de Capacitor, reinstalar módulos
npm install @capacitor/core @capacitor/cli @capacitor/camera @capacitor/filesystem

# 4. Verificar instalación
ionic info
npx cap doctor
```

## Errores Comunes y Soluciones

### ❌ "Cannot find module '@capacitor/camera'"
```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install
```

### ❌ "JAVA_HOME not set" (Windows)
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
```

### ❌ "ionic: command not found"
```bash
npm install -g @ionic/cli
```

## Ejecutar el Proyecto

```bash
# Servidor de desarrollo
ionic serve

# Para Android (requiere Android Studio)
ionic capacitor add android
ionic build
ionic capacitor sync android
ionic capacitor run android
```

## Verificar que Todo Está Bien

```bash
# Debe mostrar información completa sin errores
ionic info

# Debe mostrar "✅" en la mayoría de checks
npx cap doctor
```

---

**¿Sigue sin funcionar?** Revisa el README.md completo o contacta al equipo de desarrollo.