# Script para Generar APK de Android - Pastelería D'Diego

## 1. VERIFICAR PLATAFORMAS INSTALADAS
echo "Verificando plataformas instaladas..."
ionic capacitor ls

## 2. INSTALAR ANDROID (si no está instalado)
echo "Instalando plataforma Android..."
ionic capacitor add android

## 3. BUILD DE PRODUCCIÓN
echo "Generando build de producción..."
ionic build --prod

## 4. SINCRONIZAR CON CAPACITOR
echo "Sincronizando con Android..."
ionic capacitor sync android

## 5. COPIAR ASSETS
echo "Copiando assets..."
ionic capacitor copy android

## 6. ABRIR EN ANDROID STUDIO (MANUAL)
echo "Abriendo Android Studio..."
ionic capacitor open android

# NOTAS IMPORTANTES:
# - Una vez en Android Studio, ir a Build > Generate Signed Bundle/APK
# - Seleccionar APK
# - Crear keystore si es primera vez
# - Build > Make Project para compilar
# - El APK estará en: android/app/build/outputs/apk/debug/app-debug.apk