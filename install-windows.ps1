# Script de instalación para PowerShell - Pastelería D'Diego App

Write-Host ""
Write-Host "🍰 Instalando Pastelería D'Diego App..." -ForegroundColor Cyan
Write-Host ""

# Función para mostrar mensajes con colores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    } else {
        $input | Write-Output
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

# Verificar Node.js
try {
    $nodeVersion = node --version
    Write-ColorOutput Green "✅ Node.js encontrado: $nodeVersion"
} catch {
    Write-ColorOutput Red "❌ Node.js no está instalado"
    Write-ColorOutput Yellow "📦 Instalar desde: https://nodejs.org/"
    Read-Host "Presiona Enter para continuar"
    exit 1
}

# Verificar npm
try {
    $npmVersion = npm --version
    Write-ColorOutput Green "✅ npm encontrado: $npmVersion"
} catch {
    Write-ColorOutput Red "❌ npm no está disponible"
    Read-Host "Presiona Enter para continuar"
    exit 1
}

# Limpiar instalación anterior
if (Test-Path "node_modules") {
    Write-ColorOutput Yellow "🗑️  Limpiando node_modules..."
    Remove-Item -Recurse -Force node_modules
}

if (Test-Path "package-lock.json") {
    Write-ColorOutput Yellow "🗑️  Limpiando package-lock.json..."
    Remove-Item package-lock.json
}

# Limpiar caché de npm
Write-ColorOutput Blue "🧹 Limpiando caché de npm..."
npm cache clean --force

# Instalar dependencias
Write-ColorOutput Blue "📦 Instalando dependencias..."
try {
    npm install
    Write-ColorOutput Green "✅ Dependencias instaladas"
} catch {
    Write-ColorOutput Red "❌ Error instalando dependencias"
    Write-ColorOutput Yellow "Intentando con configuración alternativa..."
    npm install --legacy-peer-deps
}

# Verificar dependencias específicas de Capacitor
Write-ColorOutput Blue "🔍 Verificando dependencias de Capacitor..."
$capacitorDeps = @("@capacitor/camera", "@capacitor/filesystem", "@capacitor/core", "@capacitor/cli")
$missingDeps = @()

foreach ($dep in $capacitorDeps) {
    if (!(Test-Path "node_modules\$dep")) {
        $missingDeps += $dep
        Write-ColorOutput Red "❌ Falta: $dep"
    } else {
        Write-ColorOutput Green "✅ Encontrado: $dep"
    }
}

# Instalar dependencias faltantes
if ($missingDeps.Count -gt 0) {
    Write-ColorOutput Yellow "📦 Instalando dependencias faltantes..."
    $depsString = $missingDeps -join " "
    npm install $depsString
}

# Verificar Ionic CLI
try {
    $ionicVersion = ionic --version
    Write-ColorOutput Green "✅ Ionic CLI encontrado: $ionicVersion"
} catch {
    Write-ColorOutput Yellow "📦 Instalando Ionic CLI globalmente..."
    npm install -g @ionic/cli
}

# Ejecutar verificación post-instalación
Write-ColorOutput Blue "🔍 Ejecutando verificación final..."
node post-install.js

Write-Host ""
Write-ColorOutput Green "🎉 ¡Instalación completada!"
Write-Host ""
Write-ColorOutput Cyan "📝 Próximos pasos:"
Write-Host "   • Para ejecutar: ionic serve"
Write-Host "   • Para diagnóstico: npm run doctor"
Write-Host "   • Para ayuda: ver README.md"
Write-Host ""

# Mostrar información del sistema
Write-ColorOutput Blue "📊 Información del sistema:"
ionic info

Read-Host "Presiona Enter para continuar"