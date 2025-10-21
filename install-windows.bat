@echo off
REM Script de instalación para Windows - Pastelería D'Diego App

echo.
echo 🍰 Instalando Pastelería D'Diego App...
echo.

REM Verificar que Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js no está instalado
    echo 📦 Instalar desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar que npm está disponible
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm no está disponible
    pause
    exit /b 1
)

echo ✅ Node.js y npm encontrados

REM Limpiar instalación anterior si existe
if exist "node_modules" (
    echo 🗑️  Limpiando instalación anterior...
    rmdir /s /q node_modules
)

if exist "package-lock.json" (
    del package-lock.json
)

REM Instalar dependencias
echo 📦 Instalando dependencias...
npm install

REM Verificar instalación
echo.
echo 🔍 Verificando instalación...
node post-install.js

REM Instalar Ionic CLI globalmente si no está instalado
ionic --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo 📦 Instalando Ionic CLI globalmente...
    npm install -g @ionic/cli
)

echo.
echo 🎉 ¡Instalación completada!
echo.
echo 📝 Próximos pasos:
echo    • Para ejecutar: ionic serve
echo    • Para diagnóstico: npm run doctor
echo    • Para ayuda: ver README.md
echo.
pause