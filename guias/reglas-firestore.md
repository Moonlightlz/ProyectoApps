# 🔧 Reglas de Firestore Necesarias

## 📋 Configuración de Firebase Console

Para que funcione la creación de perfiles de usuario, necesitas configurar las reglas de Firestore en Firebase Console:

### 🔐 **Reglas de Firestore**

Ve a: **Firebase Console → Firestore Database → Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para la colección de usuarios
    match /users/{userId} {
      // Permitir lectura y escritura solo al usuario autenticado
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Reglas para la colección de prueba
    match /test/{document=**} {
      // Permitir lectura y escritura para usuarios autenticados (solo para testing)
      allow read, write: if request.auth != null;
    }
    
    // Reglas para otras colecciones (productos, pedidos, etc.)
    match /{document=**} {
      // Por defecto, denegar todo
      allow read, write: if false;
    }
  }
}
```

### 🛠️ **Pasos para Configurar:**

1. **Ve a Firebase Console**: https://console.firebase.google.com/
2. **Selecciona tu proyecto**: "pasteleria-d-diego"
3. **Ve a Firestore Database**
4. **Haz clic en la pestaña "Rules"**
5. **Reemplaza las reglas actuales con las de arriba**
6. **Haz clic en "Publish"**

### ⚠️ **Reglas Temporales para Testing**

Si necesitas testing rápido, puedes usar estas reglas (SOLO para desarrollo):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ⚠️ SOLO PARA TESTING
    }
  }
}
```

**IMPORTANTE**: ⚠️ Las reglas de "allow true" son inseguras para producción.

### 🔍 **Verificar Reglas Actuales**

Las reglas actuales probablemente sean:
```javascript
allow read, write: if false; // Denegar todo
```
o
```javascript
allow read, write: if request.time < timestamp.date(2024, 11, 20); // Expiradas
```

### 📱 **Después de Cambiar las Reglas**

1. **Guarda y publica las reglas**
2. **Espera 1-2 minutos** para que se propaguen
3. **Prueba el registro nuevamente**
4. **Revisa la consola del navegador** para ver si los logs cambian

---

**¡Configura estas reglas y prueba el registro nuevamente!** 🚀