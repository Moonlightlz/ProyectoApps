# 🚨 SOLUCIÓN PARA EL ERROR DE KENNY

## Error Específico:
```
TS2307: Cannot find module '@capacitor/camera' or its corresponding type declarations.
```

## ✅ SOLUCIÓN RÁPIDA (Kenny - Ejecutar en PowerShell):

### Paso 1: Limpiar proyecto
```powershell
cd C:\Users\kenny\OneDrive\Documentos\GitHub\ProyectoApps

# Eliminar carpetas problemáticas
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# Limpiar caché de npm
npm cache clean --force
```

### Paso 2: Reinstalar todo
```powershell
# Instalar dependencias
npm install

# Si falla, usar modo legacy
npm install --legacy-peer-deps
```

### Paso 3: Verificar instalación específica de Capacitor
```powershell
# Instalar módulos específicos que faltan
npm install @capacitor/camera @capacitor/filesystem @capacitor/core @capacitor/cli @capacitor/app

# Verificar que están instalados
ls node_modules | findstr capacitor
```

### Paso 4: Instalar Ionic CLI globalmente
```powershell
# Si no tienes Ionic CLI
npm install -g @ionic/cli

# Verificar versión
ionic --version
```

### Paso 5: Probar la aplicación
```powershell
# Ejecutar diagnóstico
npm run doctor

# Si todo está OK, ejecutar
ionic serve
```

## 🛠️ SOLUCIÓN ALTERNATIVA (Script Automático):

```powershell
# Ejecutar script de Windows
.\install-windows.ps1

# O usar el .bat
.\install-windows.bat
```

## 🔍 DIAGNÓSTICO:

Si sigues teniendo problemas, ejecuta:
```powershell
node diagnostic.js
```

Esto te mostrará exactamente qué está faltando.

## 📞 SI NADA FUNCIONA:

1. Verifica que tienes Node.js 18+ instalado: `node --version`
2. Verifica que tienes npm funcionando: `npm --version`
3. Asegúrate de estar en la carpeta correcta del proyecto
4. Ejecuta `npm run fix` que hace una limpieza completa

## ⚡ COMANDOS RÁPIDOS PARA COPIAR:

```powershell
cd C:\Users\kenny\OneDrive\Documentos\GitHub\ProyectoApps
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm cache clean --force
npm install
npm install @capacitor/camera @capacitor/filesystem @capacitor/core @capacitor/cli
npm install -g @ionic/cli
ionic serve
```