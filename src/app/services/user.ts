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
import { User, UserProfile, CreateUserRequest, UpdateUserRequest, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  // emails de administradores predefinidos
  private readonly ADMIN_EMAILS = [
    'admin@pasteleria-diego.com',
    'diego@pasteleria-diego.com',
    'administrador@pasteleria-diego.com'
  ];

  constructor(private firestore: Firestore) { }

  // crear perfil de usuario en firestore
  async createUserProfile(uid: string, userData: CreateUserRequest): Promise<boolean> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      
      // verificar si el perfil ya existe
      const existingProfile = await getDoc(userRef);
      
      if (existingProfile.exists()) {
        // si ya existe actualizar con la nueva informacion
        await updateDoc(userRef, {
          displayName: userData.name,
          photoURL: userData.photoUrl,
          phoneNumber: userData.phone,
          lastLoginAt: new Date(),
          'profile.name': userData.name,
          'profile.phone': userData.phone
        });
        return true;
      }
      
      // determinar rol del usuario
      const userRole = this.determineUserRole(userData.email);
      
      // simplificar el objeto para evitar problemas de serializacion
      const userProfile = {
        uid,
        email: userData.email,
        displayName: userData.name,
        photoURL: userData.photoUrl || null,
        phoneNumber: userData.phone || null,
        emailVerified: false,
        role: userRole,
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

      await setDoc(userRef, userProfile);
      
      // verificar que se creo correctamente
      const verifyDoc = await getDoc(userRef);
      
      return verifyDoc.exists();
      
    } catch (error: any) {
      console.error('error creating user profile:', error);
      return false;
    }
  }

  // obtener perfil de usuario
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
      console.error('error getting user profile:', error);
      return null;
    }
  }

  // actualizar perfil de usuario
  async updateUserProfile(uid: string, updates: UpdateUserRequest): Promise<boolean> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      
      // preparar datos para actualizar
      const updateData: any = { ...updates };
      updateData.lastLoginAt = new Date();

      await updateDoc(userRef, updateData);
      return true;
    } catch (error) {
      console.error('error updating user profile:', error);
      return false;
    }
  }

  // actualizar ultima conexion
  async updateLastLogin(uid: string): Promise<boolean> {
    try {
      const userRef = doc(this.firestore, 'users', uid);
      await updateDoc(userRef, {
        lastLoginAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('error updating last login:', error);
      return false;
    }
  }

  // agregar producto a favoritos
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
      console.error('error adding to favorites:', error);
      return false;
    }
  }

  // quitar producto de favoritos
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
      console.error('error removing from favorites:', error);
      return false;
    }
  }

  // actualizar preferencias de notificaciones
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
      console.error('error updating notification preferences:', error);
      return false;
    }
  }

  // determinar rol del usuario basado en email
  private determineUserRole(email: string): UserRole {
    if (this.ADMIN_EMAILS.includes(email.toLowerCase())) {
      return UserRole.ADMIN;
    }
    return UserRole.USER;
  }

  // verificar si un usuario es administrador
  async isAdmin(uid: string): Promise<boolean> {
    try {
      const user = await this.getUserProfile(uid);
      return user?.role === UserRole.ADMIN || user?.role === UserRole.SUPER_ADMIN;
    } catch (error) {
      console.error('error checking admin status:', error);
      return false;
    }
  }

  // verificar si un usuario tiene permisos de administrador por email
  isAdminEmail(email: string): boolean {
    return this.ADMIN_EMAILS.includes(email.toLowerCase());
  }

  // actualizar rol de usuario solo para super admin
  async updateUserRole(uid: string, newRole: UserRole, adminUid: string): Promise<boolean> {
    try {
      // verificar que quien hace el cambio es super admin
      const admin = await this.getUserProfile(adminUid);
      if (admin?.role !== UserRole.SUPER_ADMIN) {
        console.error('solo super admin puede cambiar roles');
        return false;
      }

      await this.updateUserProfile(uid, { role: newRole });
      return true;
    } catch (error) {
      console.error('error updating user role:', error);
      return false;
    }
  }

  // obtener usuarios por rol
  async getUsersByRole(role: UserRole): Promise<User[]> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('role', '==', role));
      const querySnapshot = await getDocs(q);
      
      const users: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          uid: userData['uid'],
          email: userData['email'],
          displayName: userData['displayName'],
          photoURL: userData['photoURL'],
          phoneNumber: userData['phoneNumber'],
          emailVerified: userData['emailVerified'],
          role: userData['role'],
          createdAt: userData['createdAt'],
          lastLoginAt: userData['lastLoginAt'],
          profile: userData['profile']
        } as User);
      });
      
      return users;
    } catch (error) {
      console.error('error getting users by role:', error);
      return [];
    }
  }

  // verificar si email existe
  async emailExists(email: string): Promise<boolean> {
    try {
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('error checking email existence:', error);
      return false;
    }
  }
}
