# 🚀 Guía de Instalación Rápida

## Para nuevos desarrolladores que clonan el proyecto

### Opción 1: Script Automático Windows (MÁS FÁCIL)
```powershell
# Después de clonar el repositorio
cd ProyectoApps

# Ejecutar script de Windows (como Administrador)
.\install-windows.ps1

# O usando el archivo .bat
.\install-windows.bat
```

### Opción 2: Setup Manual Universal
```bash
# 1. Limpiar cualquier instalación anterior
rm -rf node_modules package-lock.json

# 2. Instalar dependencias
npm install

# 3. El script post-install verificará automáticamente
# Si hay errores, ejecutar:
npm run fix
```

### Opción 3: Setup Node.js Manual
```bash
# 1. Instalar Ionic CLI globalmente
npm install -g @ionic/cli

# 2. Instalar dependencias específicas si fallan
npm install @capacitor/core @capacitor/cli @capacitor/camera @capacitor/filesystem

# 3. Verificar instalación
npm run doctor
```

## Errores Comunes y Soluciones

### ❌ "Cannot find module '@capacitor/camera'" (ERROR DE KENNY)
```powershell
# SOLUCIÓN WINDOWS (PowerShell):
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm cache clean --force
npm install

# Si persiste, instalar manualmente:
npm install @capacitor/camera @capacitor/filesystem @capacitor/core @capacitor/cli

# Verificar:
npm run doctor
```

```bash
# SOLUCIÓN UNIVERSAL (Git Bash/CMD):
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