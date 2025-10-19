# 🔥 Guía de Integración Firebase con Ionic

## 🎯 ¿Por qué Firebase para tu app híbrida?

Firebase es la solución perfecta para tu proyecto porque:

- ✅ **Backend completo** sin servidor
- ✅ **Una configuración** para web, Android e iOS  
- ✅ **Sincronización en tiempo real**
- ✅ **Trabajo offline automático**
- ✅ **Escalabilidad automática**
- ✅ **Costo inicial gratuito**

## 🛠️ Servicios Firebase Instalados

Ya tienes instalado:
- **Firebase SDK** v10.x
- **@angular/fire** v18.x
- **Firebase CLI** (firebase-tools)

## 🚀 Configuración Paso a Paso

### 1. Crear proyecto en Firebase Console

1. Ve a https://console.firebase.google.com
2. Clic en "Crear un proyecto"
3. Nombre: **ProyectoApps** (o el que prefieras)
4. Habilita Google Analytics (recomendado)

### 2. Agregar apps a tu proyecto Firebase

En la consola de Firebase:

**Para Web:**
1. Clic en "Web" icon (</>)
2. Nombre: **ProyectoApps Web**
3. ✅ Marca "También configurar Firebase Hosting"
4. Copia la configuración (firebaseConfig)

**Para Android:**
1. Clic en "Android" icon
2. Nombre del paquete: **io.ionic.starter**
3. Descarga google-services.json

**Para iOS:**
1. Clic en "iOS" icon  
2. ID del paquete: **io.ionic.starter**
3. Descarga GoogleService-Info.plist

### 3. Configurar en tu proyecto

Crea el archivo de configuración:

\`\`\`typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id",
    measurementId: "G-XXXXXXXXXX"
  }
};
\`\`\`

\`\`\`typescript  
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  firebaseConfig: {
    // Misma configuración
  }
};
\`\`\`

### 4. Configurar en app.config.ts

\`\`\`typescript
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideIonicAngular(),
    importProvidersFrom([
      provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
      provideAuth(() => getAuth()),
      provideFirestore(() => getFirestore()),
      provideStorage(() => getStorage()),
    ]),
  ],
};
\`\`\`

## 📱 Servicios Firebase Principales

### 🔐 Authentication (Autenticación)

\`\`\`typescript
// src/services/auth.service.ts
import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user$ = user(this.auth);

  constructor(private auth: Auth) {}

  async login(email: string, password: string) {
    return await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(email: string, password: string) {
    return await createUserWithEmailAndPassword(this.auth, email, password);
  }

  async logout() {
    return await signOut(this.auth);
  }
}
\`\`\`

### 🗄️ Firestore (Base de datos)

\`\`\`typescript
// src/services/firestore.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  
  constructor(private firestore: Firestore) {}

  // Crear documento
  async create(collectionName: string, data: any) {
    const collectionRef = collection(this.firestore, collectionName);
    return await addDoc(collectionRef, data);
  }

  // Leer documentos
  async read(collectionName: string) {
    const collectionRef = collection(this.firestore, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Actualizar documento
  async update(collectionName: string, id: string, data: any) {
    const docRef = doc(this.firestore, collectionName, id);
    return await updateDoc(docRef, data);
  }

  // Eliminar documento
  async delete(collectionName: string, id: string) {
    const docRef = doc(this.firestore, collectionName, id);
    return await deleteDoc(docRef);
  }
}
\`\`\`

### ☁️ Storage (Archivos)

\`\`\`typescript
// src/services/storage.service.ts
import { Injectable } from '@angular/core';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: Storage) {}

  async uploadFile(file: File, path: string) {
    const storageRef = ref(this.storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
}
\`\`\`

## 📱 Configuración Nativa (Capacitor)

### Para Android:
1. Copia \`google-services.json\` a \`android/app/\`
2. En \`android/app/build.gradle\`:
   \`\`\`gradle
   apply plugin: 'com.google.gms.google-services'
   \`\`\`

### Para iOS:
1. Copia \`GoogleService-Info.plist\` a \`ios/App/App/\`
2. Instala pods:
   \`\`\`bash
   cd ios/App && pod install
   \`\`\`

## 🚀 Comandos Útiles

\`\`\`bash
# Inicializar Firebase en el proyecto
firebase init

# Deploy a Firebase Hosting
firebase deploy

# Ver logs en tiempo real
firebase logs:tail

# Emular localmente
firebase emulators:start
\`\`\`

## 📋 Servicios Recomendados para tu App

### 🔥 Esenciales:
- ✅ **Authentication** - Login/registro
- ✅ **Firestore** - Base de datos NoSQL
- ✅ **Storage** - Subir imágenes/archivos
- ✅ **Hosting** - Deploy web gratuito

### 🚀 Avanzados:
- 📱 **Cloud Messaging** - Push notifications
- 📊 **Analytics** - Métricas de uso  
- ⚡ **Functions** - API serverless
- 🔍 **Crashlytics** - Reporte de errores

## 💡 Ejemplo de Uso en Componente

\`\`\`typescript
// src/app/tab1/tab1.page.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html'
})
export class Tab1Page implements OnInit {
  user$ = this.authService.user$;
  items: any[] = [];

  constructor(
    private authService: AuthService,
    private firestoreService: FirestoreService
  ) {}

  async ngOnInit() {
    this.items = await this.firestoreService.read('items');
  }

  async addItem() {
    await this.firestoreService.create('items', {
      name: 'Nuevo item',
      createdAt: new Date()
    });
    this.items = await this.firestoreService.read('items');
  }
}
\`\`\`

## 🎯 Próximos Pasos

1. **Crear proyecto Firebase**
2. **Configurar environment.ts**
3. **Actualizar app.config.ts**
4. **Crear servicios básicos**
5. **Implementar autenticación**
6. **Agregar Firestore**
7. **Deploy a Firebase Hosting**

¡Firebase te dará superpoderes a tu app híbrida! 🔥✨