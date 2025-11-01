import { Injectable } from '@angular/core';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // emails que tienen permisos de administrador
  private readonly ADMIN_EMAILS = [
    'admin@pasteleria-diego.com',
    'diego@pasteleria-diego.com',
    'administrador@pasteleria-diego.com'
  ];

  constructor() { }

  // verifica si un usuario es administrador basado en su uid
  async isAdmin(uid: string): Promise<boolean> {
    try {
      // obtener el email del usuario actual de firebase auth
      // en una implementacion real esto consultaria firestore
      return this.checkAdminByUid(uid);
    } catch (error) {
      console.error('error verificando si es admin:', error);
      return false;
    }
  }

  // verifica si un usuario es administrador basado en su email
  async isAdminByEmail(email: string): Promise<boolean> {
    return this.isAdminEmail(email);
  }

  // verifica si un email es de administrador
  isAdminEmail(email: string): boolean {
    return this.ADMIN_EMAILS.includes(email.toLowerCase());
  }

  // obtiene el rol de un usuario basado en su email
  getUserRole(email: string): string {
    return this.isAdminEmail(email) ? 'ADMIN' : 'USER';
  }

  // verifica admin por uid metodo privado
  // en produccion esto consultaria firestore
  private async checkAdminByUid(uid: string): Promise<boolean> {
    try {
      // en una implementacion real esto haria una consulta a firestore
      // para obtener el perfil del usuario y verificar su rol o email
      
      // verificar si el uid contiene palabras clave de admin
      // en el futuro esto sera reemplazado por una consulta real a firestore
      
      const adminKeywords = ['admin', 'diego', 'administrador'];
      const isAdminUID = adminKeywords.some(keyword => uid.toLowerCase().includes(keyword));
      
      return isAdminUID;
    } catch (error) {
      console.error('error en checkAdminByUid:', error);
      return false;
    }
  }

  // actualiza el perfil de un usuario
  async updateUserProfile(uid: string, profileData: Partial<User>): Promise<void> {
    try {
      // implementar actualizacion en firestore
    } catch (error) {
      console.error('error actualizando perfil:', error);
      throw error;
    }
  }

  // obtiene el perfil de un usuario
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      // implementar consulta a firestore
      return null;
    } catch (error) {
      console.error('error obteniendo perfil:', error);
      return null;
    }
  }
}