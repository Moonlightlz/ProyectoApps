# Guía de Instalación - Pastelería D'Diego App

Esta guía describe los comandos necesarios para instalar y ejecutar la aplicación de Pastelería D'Diego después de clonar el repositorio.

## 📋 Requisitos Previos

- **Node.js**: 18+ (Versión probada: 22.19.0)
- **npm**: 9+ (Versión probada: 11.6.1)
- **Ionic CLI**: 7+ (Versión probada: 7.2.1)

### Verificar versiones instaladas:
```powershell
node --version
npm --version
ionic --version
```

### Si Ionic CLI no está instalado:
```powershell
npm install -g @ionic/cli
```

## 🚀 Instalación

### Paso 1: Instalar Dependencias

Después de clonar el repositorio, ejecuta:

```powershell
npm install
```

Durante la instalación, el script `post-install.js` verificará automáticamente que todos los paquetes estén correctamente instalados.

### Paso 2: Verificar la Instalación (Opcional)

```powershell
npm run doctor
```

## 🌐 Ejecutar la Aplicación en el Navegador

### Iniciar el Servidor de Desarrollo

```powershell
ionic serve
```

La aplicación se abrirá automáticamente en: **http://localhost:8100**

### Comandos Alternativos

```powershell
npm start                    # Equivalente a ionic serve
ionic serve --port 8080      # Usar un puerto diferente
ionic serve --no-open        # No abrir el navegador automáticamente
```

## � Comandos Útiles

### Desarrollo
```powershell
ionic serve              # Iniciar servidor de desarrollo
npm start                # Alternativa a ionic serve
npm run build            # Compilar en modo desarrollo
npm run build:prod       # Compilar en modo producción
npm test                 # Ejecutar tests
npm run lint             # Ejecutar linter
```

### Utilidades
```powershell
npm run doctor           # Diagnosticar el proyecto
npm run fix              # Reparar instalación (limpia y reinstala)
ionic generate           # Generar componentes/páginas/servicios
```

### Móvil (Opcional)
```powershell
npm run sync             # Sincronizar con plataformas nativas
npm run android          # Ejecutar en Android
npm run ios              # Ejecutar en iOS (solo macOS)
```

## 🐛 Solución de Problemas

### Error al instalar dependencias
```powershell
npm cache clean --force      # Limpiar caché de npm
npm run fix                  # Eliminar node_modules y reinstalar
```

### Puerto 8100 ya está en uso
```powershell
ionic serve --port 8080      # Usar un puerto diferente
```

### Error 504 (Outdated Optimize Dep) / Página en blanco
```powershell
# 1. Limpiar caché de Angular y rebuilds
Remove-Item -Path ".angular/cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "www" -Recurse -Force -ErrorAction SilentlyContinue

# 2. Limpiar caché de npm
npm cache clean --force

# 3. Reiniciar el servidor
ionic serve --no-open
```

**Además, en el navegador:**
- Limpiar caché del navegador: `Ctrl + Shift + Delete`
- Recargar forzadamente: `Ctrl + Shift + R` o `Ctrl + F5`
- Probar en modo incógnito: `Ctrl + Shift + N`
- Desactivar Service Workers (en consola F12):
```javascript
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
  }
});
```

### La aplicación no se carga
1. Verificar errores en la consola del terminal
2. Verificar errores en la consola del navegador (F12)
3. Limpiar caché del navegador
4. Probar en modo incógnito o con otro navegador

## 📚 Configuración

### Firebase
La aplicación está configurada con Firebase. Credenciales en:
- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

### Tecnologías Principales
- **Angular**: 20.0.0
- **Ionic**: 8.0.0
- **Firebase**: 11.10.0
- **Capacitor**: 7.4.3
- **TypeScript**: 5.8.0

## ✅ Verificación

Después de la instalación, deberías poder:
1. Ejecutar `ionic serve` sin errores
2. Ver la aplicación en http://localhost:8100
3. Navegar por las páginas (Login, Register, Catalog, Cart, etc.)

## 💡 Notas

- El servidor usa **Live Reload** (los cambios se reflejan automáticamente)
- Presiona `Ctrl + C` para detener el servidor
- Presiona `h + Enter` en el terminal para ver ayuda

## 📖 Más Información

Consulta las guías en la carpeta `guias/` para:
- `GUIA-DESARROLLO-IONIC.md` - Desarrollo con Ionic
- `FIREBASE-INTEGRATION.md` - Integración con Firebase
- `generar-apk.md` - Compilar para Android

---

**Última actualización**: Noviembre 2025
**Versión de la aplicación**: 0.1.0
**Autor**: Pastelería D'Diego
