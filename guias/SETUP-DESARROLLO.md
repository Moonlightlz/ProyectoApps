# Configuración Inicial del Entorno de Desarrollo

Esta guía explica qué software y herramientas necesita instalar un desarrollador para trabajar con este proyecto después de clonarlo.

## Requisitos del Sistema

### Software Base Requerido

#### 1. Node.js (Versión 18 o superior)
- **Descargar**: https://nodejs.org/
- **Verificar instalación**: 
  ```bash
  node --version
  npm --version
  ```
- **Notas**: Se recomienda la versión LTS más reciente

#### 2. Git
- **Windows**: https://git-scm.com/download/win
- **Mac**: Viene preinstalado o `brew install git`
- **Linux**: `sudo apt install git` (Ubuntu/Debian)
- **Verificar instalación**:
  ```bash
  git --version
  ```

### Herramientas de Desarrollo

#### 3. Visual Studio Code (Recomendado)
- **Descargar**: https://code.visualstudio.com/
- **Extensiones recomendadas**:
  - Angular Language Service
  - Ionic Extension Pack
  - Firebase Explorer
  - GitLens
  - Prettier - Code formatter

#### 4. Ionic CLI
```bash
npm install -g @ionic/cli
```

#### 5. Firebase CLI
```bash
npm install -g firebase-tools
```

## Para Desarrollo Móvil (Opcional al inicio)

### Android (Windows/Mac/Linux)
#### Android Studio
- **Descargar**: https://developer.android.com/studio
- **Configurar**:
  - Instalar Android SDK
  - Configurar variables de entorno (ANDROID_HOME)
  - Crear un AVD (Android Virtual Device)

#### Java JDK 11 o superior
- **Descargar**: https://adoptium.net/
- **Verificar**: `java --version`

### iOS (Solo Mac)
#### Xcode
- **Instalar**: Desde Mac App Store
- **Configurar**: Command Line Tools
- **Verificar**: `xcode-select --version`

#### CocoaPods
```bash
sudo gem install cocoapods
```

## Configuración del Proyecto

### 1. Clonar el repositorio
```bash
git clone https://github.com/Moonlightlz/ProyectoApps.git
cd ProyectoApps
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase (Importante)
- Solicitar acceso al proyecto Firebase "pasteleria-d-diego"
- O crear un nuevo proyecto Firebase personal para desarrollo
- Los archivos `environment.ts` ya están configurados con el proyecto principal

### 4. Verificar instalación
```bash
ionic info
```
Este comando muestra todas las versiones instaladas y detecta problemas.

## Primer Ejecutación

### 1. Probar en navegador
```bash
ionic serve
```
Debería abrir http://localhost:8100

### 2. Probar compilación
```bash
ionic build
```

### 3. (Opcional) Probar en Android
```bash
ionic capacitor add android
ionic capacitor run android
```

## Configuración Adicional

### Variables de Entorno (Windows)
Si usa Android, agregar a las variables del sistema:
```
ANDROID_HOME=C:\Users\[usuario]\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-11.x.x.x-hotspot
```

### Git Configuration
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu.email@ejemplo.com"
```

## Problemas Comunes

### Error: "ionic: command not found"
```bash
npm install -g @ionic/cli
```

### Error: "ANDROID_HOME not set"
Configurar las variables de entorno de Android SDK

### Error: "Permission denied" en Mac/Linux
Usar `sudo` para instalaciones globales o configurar npm para no requerir sudo

### Error de permisos Firebase
Solicitar acceso al proyecto o configurar uno propio para desarrollo

## Verificación Final

Ejecutar estos comandos para verificar que todo funciona:

```bash
# Verificar versiones
node --version        # Debería ser 18+
npm --version         # Debería ser 9+
ionic --version       # Debería ser 7+
firebase --version    # Debería estar instalado

# Probar el proyecto
npm install           # Instalar dependencias
ionic serve           # Debería abrir en http://localhost:8100
```

## Flujo de Trabajo Recomendado

1. **Crear rama para feature**:
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```

2. **Desarrollar**:
   ```bash
   ionic serve
   ```

3. **Probar y hacer commit**:
   ```bash
   git add .
   git commit -m "feat: nueva funcionalidad"
   git push origin feature/mi-nueva-funcionalidad
   ```

4. **Crear Pull Request** en GitHub

## Soporte

Si encuentras problemas durante la configuración:
1. Revisar la documentación oficial de cada herramienta
2. Verificar versiones con `ionic info`
3. Consultar con el equipo de desarrollo

---

**Tiempo estimado de configuración**: 30-60 minutos (dependiendo de la velocidad de internet y si se instala Android Studio)