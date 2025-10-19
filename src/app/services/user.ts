import { Injectable } from '@angular/core';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs 
} from '@angular/fire/firestore';
import { User, UserProfile, CreateUserRequest, UpdateUserRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) { }

  /**
   * Método de prueba para verificar conexión con Firestore
   */
  async testFirestoreConnection(): Promise<boolean> {
    try {
      console.log('UserService: Probando conexión con Firestore...');
      const testRef = doc(this.firestore, 'test', 'connection');
      await setDoc(testRef, {
        timestamp: new Date(),
        message: 'Test de conexión'
      });
      console.log('UserService: Test de escritura exitoso');
      
      const testDoc = await getDoc(testRef);
      console.log('UserService: Test de lectura exitoso:', testDoc.exists());
      
      return testDoc.exists();
    } catch (error) {
      console.error('UserService: Error en test de conexión:', error);
      return false;
    }
  }

  /**
   * Crear perfil de usuario en Firestore
   */
  async createUserProfile(uid: string, userData: CreateUserRequest): Promise<boolean> {
    try {
      console.log('UserService: Iniciando creación de perfil para usuario:', uid);
      console.log('UserService: Datos del usuario:', userData);
      console.log('UserService: Firestore instance:', this.firestore);
      
      const userRef = doc(this.firestore, 'users', uid);
      console.log('UserService: Referencia creada:', userRef);
      
      // Verificar si el perfil ya existe
      console.log('UserService: Verificando si el perfil ya existe...');
      const existingProfile = await getDoc(userRef);
      console.log('UserService: Resultado de verificación:', existingProfile.exists());
      
      if (existingProfile.exists()) {
        console.log('UserService: El perfil ya existe, actualizando...');
        // Si ya existe, actualizar con la nueva información
        await updateDoc(userRef, {
          displayName: userData.name,
          photoURL: userData.photoUrl,
          phoneNumber: userData.phone,
          lastLoginAt: new Date(),
          'profile.name': userData.name,
          'profile.phone': userData.phone
        });
        console.log('UserService: Perfil actualizado exitosamente');
        return true;
      }
      
      console.log('UserService: Creando nuevo perfil...');
      // Simplificar el objeto para evitar problemas de serialización
      const userProfile = {
        uid,
        email: userData.email,
        displayName: userData.name,
        photoURL: userData.photoUrl || null,
        phoneNumber: userData.phone || null,
        emailVerified: false,
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        profile: {
          name: userData.name,
          phone: userData.phone || null,
          preferences: {
            notifications: {
              orderUpdates: true,
              promotions: true,
              newProducts: false,
              reminders: true
            },
            language: 'es',
            currency: 'COP'
          },
          favoriteProducts: [],
          orderHistory: []
        }
      };

      console.log('UserService: Perfil a crear:', userProfile);
      await setDoc(userRef, userProfile);
      console.log('UserService: setDoc completado exitosamente');
      
      // Verificar que se creó correctamente
      const verifyDoc = await getDoc(userRef);
      console.log('UserService: Verificación final - documento existe:', verifyDoc.exists());
      
      if (verifyDoc.exists()) {
        console.log('UserService: Perfil creado y verificado exitosamente');
        return true;
      } else {
        console.error('UserService: El documento no se encontró después de crearlo');
        return false;
      }
      
    } catch (error: any) {
      console.error('UserService: Error detallado creating user profile:', error);
      console.error('UserService: Error code:', error.code);
      console.error('UserService: Error message:', error.message);
      console.error('UserService: Error stack:', error.stack);
      return false;
    }
  }

  /**
   * Obtener perfil de usuario
   */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        return userSnap.data() as User;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateUserProfile(uid: string, updates: UpdateUserRequest): Promise<boolean> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      
      // Preparar datos para actualizar
      const updateData: any = { ...updates };
      updateData.lastLoginAt = new Date();

      await updateDoc(userRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  }

  /**
   * Actualizar última conexión
   */
  async updateLastLogin(uid: string): Promise<boolean> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, {
        lastLoginAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Error updating last login:', error);
      return false;
    }
  }

  /**
   * Agregar producto a favoritos
   */
  async addToFavorites(uid: string, productId: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(uid);
      if (!userProfile) return false;

      const favorites = userProfile.profile?.favoriteProducts || [];
      if (!favorites.includes(productId)) {
        favorites.push(productId);
        
        await this.updateUserProfile(uid, {
          profile: {
            ...userProfile.profile,
            favoriteProducts: favorites
          }
        });
      }
      
      return true;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  /**
   * Quitar producto de favoritos
   */
  async removeFromFavorites(uid: string, productId: string): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(uid);
      if (!userProfile) return false;

      const favorites = userProfile.profile?.favoriteProducts || [];
      const updatedFavorites = favorites.filter(id => id !== productId);
      
      await this.updateUserProfile(uid, {
        profile: {
          ...userProfile.profile,
          favoriteProducts: updatedFavorites
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  /**
   * Actualizar preferencias de notificaciones
   */
  async updateNotificationPreferences(uid: string, notifications: any): Promise<boolean> {
    try {
      const userProfile = await this.getUserProfile(uid);
      if (!userProfile) return false;

      await this.updateUserProfile(uid, {
        profile: {
          ...userProfile.profile,
          preferences: {
            ...userProfile.profile?.preferences,
            notifications,
            language: userProfile.profile?.preferences?.language || 'es',
            currency: userProfile.profile?.preferences?.currency || 'COP'
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  /**
   * Verificar si email existe
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  }
}
