# Conectar Firebase a la App

Firebase está instalado y configurado básicamente, pero falta conectarlo con el proyecto real. Aquí están los pasos realizados:

## Estado actual del proyecto
- Firebase SDK instalado
- Servicios básicos creados (auth, firestore)
- Página de prueba implementada en el Tab 1

## Cómo conectar la base de datos

### Paso 1: Obtener la configuración del proyecto
Es necesario ir a la consola de Firebase y obtener los datos de configuración:
1. Entrar a console.firebase.google.com
2. Seleccionar el proyecto "pasteleria-d-diego"
3. Ir a configuración del proyecto (el engranaje)
4. En la sección "Tus apps", seleccionar la app web
5. Ahí aparece todo el código de configuración

### Paso 2: Configurar los datos en el código

Se debe editar el archivo `src/environments/environment.ts` y colocar los datos reales del proyecto:

```typescript
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyDo7sejiP9Wdz99lbc0zeZfFwg6Yu7fSw0",
    authDomain: "pasteleria-d-diego.firebaseapp.com",
    projectId: "pasteleria-d-diego",
    storageBucket: "pasteleria-d-diego.firebasestorage.app",
    messagingSenderId: "134621478329",
    appId: "1:134621478329:web:c3690714c011a5bfa70a68",
    measurementId: "G-8V0C78SQEQ"
  }
};
```

### Paso 3: Activar Firestore 
También es necesario crear la base de datos en Firebase:
1. En la consola, ir a "Firestore Database"
2. Hacer clic en "Crear base de datos"
3. Seleccionar "modo de prueba" para empezar (los permisos se cambian después)
4. Seleccionar la región más cercana

### Paso 4: Probar la conexión

Ejecutar `ionic serve` e ir al Tab 1. Ahí hay una interfaz simple para:
- Ver si está conectado a Firebase
- Agregar elementos a la base de datos
- Ver la lista en tiempo real

## Problemas comunes

### Si aparece "Permission denied"
Las reglas de Firestore están muy restrictivas. Para desarrollo, se pueden cambiar las reglas a:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; 
    }
  }
}
```

Esto es solo para desarrollo. Para producción se deben implementar reglas más seguras.

### Si aparece "Project not found"
Verificar que el projectId en environment.ts esté correctamente escrito.

## Funcionalidades disponibles

Con esta configuración ya es posible:
- Guardar y leer datos de Firebase
- Tener sincronización automática entre dispositivos
- Usar la misma base de datos en web, Android e iOS

La ventaja es que Firebase maneja todo el backend automáticamente, permitiendo enfocarse en el desarrollo de la aplicación.
- ☁️ Escalabilidad automática

¡Tu base de datos Firebase ya está integrada! 🚀