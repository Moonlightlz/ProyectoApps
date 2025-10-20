# Firebase en la App

## Justificación de Firebase

Firebase fue seleccionado como backend después de evaluar varias opciones, por las siguientes razones:

- No requiere mantenimiento de servidor
- Funciona igual en web, Android e iOS con la misma configuración
- Tiene sincronización automática entre dispositivos
- Funciona offline y se sincroniza cuando se restablece la conexión
- Es gratuito para empezar y escala automáticamente
- Es mantenido por Google, garantizando confiabilidad

## Componentes instalados
aaa
El proyecto incluye:
- Firebase SDK versión 10.x
- AngularFire (integración con Angular)
- Firebase CLI para deploy y gestión

## Configuración de Firebase

### 1. Creación del proyecto en Firebase
Se creó un proyecto en console.firebase.google.com llamado "pasteleria-d-diego". Se activó Google Analytics para obtener métricas de uso.

### 2. Configuración para aplicación híbrida
Como la aplicación es híbrida, solo se necesitó configurar la parte web. Los proyectos de Android e iOS usan la misma configuración web a través de Capacitor.

En Firebase Console:
- Se agregó una aplicación web
- Se copió la configuración proporcionada
- Se integró en los archivos de environment

### 3. Integración con Angular
Firebase se conectó con la aplicación Angular modificando el archivo `main.ts`:

```typescript
// main.ts
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from './environments/environment';

// En la configuración de providers:
provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
provideAuth(() => getAuth()),
provideFirestore(() => getFirestore()),
provideStorage(() => getStorage()),
```

### 4. Creación de servicios Firebase
Se desarrollaron servicios básicos para encapsular la funcionalidad de Firebase y evitar repetir código en los componentes.

## Servicios implementados

### Servicio de autenticación
El archivo `src/services/auth.service.ts` contiene métodos para:
- Registro de usuarios
- Login con email/password
- Logout
- Verificación de estado de usuario

```typescript
async login(email: string, password: string) {
  try {
    const result = await signInWithEmailAndPassword(this.auth, email, password);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Servicio de base de datos (Firestore)
El archivo `src/services/firestore.service.ts` contiene métodos para:
- Crear, leer, actualizar y eliminar datos
- Realizar consultas con filtros
- Manejar errores de forma consistente

```typescript
async create(collectionName: string, data: any) {
  try {
    const collectionRef = collection(this.firestore, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### Servicio de archivos (Storage)
Se implementó un servicio para subir archivos como fotos de productos:

```typescript
async uploadFile(file: File, path: string) {
  const storageRef = ref(this.storage, path);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}
```

## Configuración para móviles (Android/iOS)

Para usar funciones específicas de móviles se requiere:
- Para Android: el archivo `google-services.json` en `android/app/`
- Para iOS: el archivo `GoogleService-Info.plist` en `ios/App/App/`

Para el desarrollo inicial, la configuración web es suficiente.

## Servicios Firebase utilizados

Servicios actualmente implementados:
- **Firestore**: Base de datos NoSQL para productos, pedidos, etc.
- **Authentication**: Sistema de login de usuarios
- **Storage**: Almacenamiento de fotos de productos

Servicios a considerar para el futuro:
- **Cloud Messaging**: Notificaciones push
- **Analytics**: Métricas de uso de la aplicación
- **Hosting**: Publicación de la versión web

## Ejemplo de implementación

En el Tab 1 se implementó un ejemplo básico para probar la funcionalidad:

```typescript
export class Tab1Page implements OnInit {
  items: any[] = [];
  connectionStatus: string = 'Conectando...';

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit() {
    await this.loadItems();
  }

  async loadItems() {
    const result = await this.firestoreService.readAll('test-items');
    if (result.success) {
      this.items = result.data || [];
      this.connectionStatus = 'Conectado a Firebase';
    }
  }

  async addItem() {
    if (this.newItemName.trim()) {
      await this.firestoreService.create('test-items', {
        name: this.newItemName,
        timestamp: new Date()
      });
      await this.loadItems(); // Recargar la lista
    }
  }
}
```

## Comandos útiles

```bash
# Para publicar en Firebase Hosting
firebase deploy

# Para ver logs en tiempo real
firebase logs:tail

# Para trabajar offline (emulador)
firebase emulators:start
```

## Plan de desarrollo

1. ✅ Configurar Firebase (completado)
2. ✅ Crear servicios básicos (completado) 
3. Implementar sistema de login de usuarios
4. Desarrollar las pantallas de la pastelería
5. Implementar subida de fotos de productos
6. Crear sistema de pedidos

Firebase facilita significativamente el desarrollo al eliminar la necesidad de mantener un servidor backend.