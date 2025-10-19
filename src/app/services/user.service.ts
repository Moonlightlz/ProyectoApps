import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // Emails que tienen permisos de administrador
  private readonly ADMIN_EMAILS = [
    'admin@pasteleria-diego.com',
    'diego@pasteleria-diego.com',
    'administrador@pasteleria-diego.com'
  ];

  constructor() { }

  /**
   * Verifica si un usuario es administrador basado en su UID
   */
  async isAdmin(uid: string): Promise<boolean> {
    try {
      console.log('UserService: Verificando admin para UID:', uid);
      
      // Obtener el email del usuario actual de Firebase Auth
      // En una implementación real, esto consultaría Firestore
      return this.checkAdminByUid(uid);
    } catch (error) {
      console.error('Error verificando si es admin:', error);
      return false;
    }
  }

  /**
   * Verifica si un usuario es administrador basado en su email
   */
  async isAdminByEmail(email: string): Promise<boolean> {
    console.log('UserService: Verificando admin por email:', email);
    return this.isAdminEmail(email);
  }

  /**
   * Verifica si un email es de administrador
   */
  isAdminEmail(email: string): boolean {
    return this.ADMIN_EMAILS.includes(email.toLowerCase());
  }

  /**
   * Obtiene el rol de un usuario basado en su email
   */
  getUserRole(email: string): string {
    return this.isAdminEmail(email) ? 'ADMIN' : 'USER';
  }

  /**
   * Verifica admin por UID (método privado)
   * En producción esto consultaría Firestore
   */
  private async checkAdminByUid(uid: string): Promise<boolean> {
    try {
      console.log('UserService: checkAdminByUid - UID:', uid);
      
      // En una implementación real, esto haría una consulta a Firestore
      // para obtener el perfil del usuario y verificar su rol o email
      
      // Por ahora, como es una simulación, vamos a:
      // 1. Verificar si el UID contiene palabras clave de admin
      // 2. En el futuro, esto sería reemplazado por una consulta real a Firestore
      
      const adminKeywords = ['admin', 'diego', 'administrador'];
      const isAdminUID = adminKeywords.some(keyword => uid.toLowerCase().includes(keyword));
      
      console.log('UserService: checkAdminByUid - Es admin?', isAdminUID);
      return isAdminUID;
    } catch (error) {
      console.error('Error en checkAdminByUid:', error);
      return false;
    }
  }

  /**
   * Actualiza el perfil de un usuario
   */
  async updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    try {
      // Implementar actualización en Firestore
      console.log('Actualizando perfil:', uid, profileData);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      throw error;
    }
  }

  /**
   * Obtiene el perfil de un usuario
   */
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      // Implementar consulta a Firestore
      console.log('Obteniendo perfil:', uid);
      return null;
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return null;
    }
  }
}