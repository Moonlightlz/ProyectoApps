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
      // Por ahora, verificamos si el email está en la lista de admins
      // En un futuro se podría consultar la base de datos
      
      // Simulamos la verificación - en producción esto consultaría Firebase
      return this.checkAdminByUid(uid);
    } catch (error) {
      console.error('Error verificando si es admin:', error);
      return false;
    }
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
    // Simulación - en producción consultaría la base de datos
    // por ahora retornamos true para ciertos UIDs de prueba
    const adminUids = ['admin-uid-1', 'admin-uid-2'];
    return adminUids.includes(uid);
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