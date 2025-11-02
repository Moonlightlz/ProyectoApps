import { Injectable } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  user, 
  User,
  sendPasswordResetEmail,
  updateProfile,
  updatePassword
} from '@angular/fire/auth';
import { Observable } from 'rxjs';

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  photoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Observable del usuario actual
  user$: Observable<User | null> = user(this.auth);

  // Credenciales de prueba (mantenidas internamente)
  private readonly TEST_CREDENTIALS = {
    username: 'admin',
    password: 'admin'
  };

  constructor(private auth: Auth) {}

  /**
   * Iniciar sesión con email y contraseña
   */
  async login(email: string, password: string) {
    try {
      // Verificar credenciales de prueba primero
      if (email.toLowerCase() === this.TEST_CREDENTIALS.username && 
          password === this.TEST_CREDENTIALS.password) {
        // Simular login exitoso para credenciales de prueba
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', this.TEST_CREDENTIALS.username); // Guardar 'admin', no el email
        // Limpiar userEmail de Firebase si existe
        localStorage.removeItem('userEmail');
        console.log('AuthService: Login demo exitoso, guardando username =', this.TEST_CREDENTIALS.username);
        return { success: true, user: null, isDemo: true };
      }

      const result = await signInWithEmailAndPassword(this.auth, email, password);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      // Limpiar username de admin si existe
      localStorage.removeItem('username');
      return { success: true, user: result.user, isDemo: false };
    } catch (error: any) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Registrar nuevo usuario con información completa
   */
  async register(userData: RegisterData) {
    try {
      console.log('AuthService: Intentando crear usuario con email:', userData.email);
      
      const result = await createUserWithEmailAndPassword(
        this.auth, 
        userData.email, 
        userData.password
      );

      console.log('AuthService: Usuario creado exitosamente:', result.user.uid);

      // Actualizar perfil del usuario
      try {
        await updateProfile(result.user, {
          displayName: userData.name,
          photoURL: userData.photoUrl || this.getDefaultAvatar()
        });
        console.log('AuthService: Perfil actualizado exitosamente');
      } catch (profileError) {
        console.warn('AuthService: Error actualizando perfil, pero usuario creado:', profileError);
        // No fallar completamente si solo el perfil no se actualiza
      }

      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('AuthService: Error en registro:', error.code, error.message);
      return { 
        success: false, 
        error: this.getErrorMessage(error.code),
        errorCode: error.code 
      };
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  async sendPasswordReset(email: string) {
    try {
      await sendPasswordResetEmail(this.auth, email, {
        url: window.location.origin + '/login',
        handleCodeInApp: false
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Actualizar perfil del usuario
   */
  async updateUserProfile(displayName: string, photoURL?: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      await updateProfile(user, { displayName, photoURL });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Cambiar contraseña del usuario
   */
  async changePassword(newPassword: string) {
    try {
      const user = this.auth.currentUser;
      if (!user) throw new Error('Usuario no autenticado');

      await updatePassword(user, newPassword);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: this.getErrorMessage(error.code) };
    }
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    try {
      await signOut(this.auth);
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('username');
      localStorage.removeItem('userEmail');
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Verificar si hay un usuario logueado
   */
  isLoggedIn(): boolean {
    return !!this.auth.currentUser || localStorage.getItem('isLoggedIn') === 'true';
  }

  /**
   * Obtener avatar por defecto
   */
  private getDefaultAvatar(): string {
    return 'https://via.placeholder.com/150x150/ff6b9d/ffffff?text=👤';
  }

  /**
   * Traducir códigos de error de Firebase
   */
  private getErrorMessage(errorCode: string): string {
    const errorMessages: { [key: string]: string } = {
      'auth/user-not-found': 'No existe una cuenta con este correo electrónico',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/email-already-in-use': 'Ya existe una cuenta con este correo electrónico',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Correo electrónico no válido',
      'auth/too-many-requests': 'Demasiados intentos fallidos. Intenta más tarde',
      'auth/network-request-failed': 'Error de conexión. Verifica tu internet',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/requires-recent-login': 'Necesitas volver a iniciar sesión para esta acción'
    };

    return errorMessages[errorCode] || 'Error desconocido. Intenta nuevamente';
  }
}