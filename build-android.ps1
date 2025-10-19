# Script de Build para Android - Pastelería D'Diego
# Ejecutar desde la carpeta raíz del proyecto

Write-Host "🧁 Iniciando build para Android - Pastelería D'Diego" -ForegroundColor Green

# Verificar si existe la plataforma Android
if (!(Test-Path "android")) {
    Write-Host "📱 Agregando plataforma Android..." -ForegroundColor Yellow
    ionic capacitor add android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Error al agregar plataforma Android" -ForegroundColor Red
        exit 1
    }
}

# Build de producción
Write-Host "🔨 Generando build de producción..." -ForegroundColor Yellow
ionic build --prod
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en build de producción" -ForegroundColor Red
    exit 1
}

# Sincronizar con Android
Write-Host "🔄 Sincronizando con Android..." -ForegroundColor Yellow
ionic capacitor sync android
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en sincronización" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Ejecutar: ionic capacitor open android" -ForegroundColor White
Write-Host "2. En Android Studio:" -ForegroundColor White
Write-Host "   - Build > Make Project" -ForegroundColor Gray
Write-Host "   - Build > Generate Signed Bundle/APK > APK" -ForegroundColor Gray
Write-Host "   - El APK estará en: android/app/build/outputs/apk/debug/" -ForegroundColor Gray
Write-Host ""
Write-Host "🚀 ¿Quieres abrir Android Studio ahora? (Y/N)" -ForegroundColor Yellow
$response = Read-Host
if ($response -eq "Y" -or $response -eq "y") {
    ionic capacitor open android
}