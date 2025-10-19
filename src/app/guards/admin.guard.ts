import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  async canActivate(): Promise<boolean> {
    try {
      // Verificar si está logueado primero
      if (!this.authService.isLoggedIn()) {
        this.router.navigate(['/login']);
        return false;
      }

      const currentUser = this.authService.getCurrentUser();
      
      // Si es un usuario de Firebase, verificar por UID
      if (currentUser) {
        const isAdmin = await this.userService.isAdmin(currentUser.uid);
        if (!isAdmin) {
          this.router.navigate(['/catalog']);
          return false;
        }
        return true;
      }

      // Si es un usuario demo (credenciales de prueba)
      const username = localStorage.getItem('username');
      if (username === 'admin') {
        return true; // El usuario 'admin' es administrador
      }

      // Si no es admin, redirigir al catálogo
      this.router.navigate(['/catalog']);
      return false;
    } catch (error) {
      console.error('Error en AdminGuard:', error);
      this.router.navigate(['/catalog']);
      return false;
    }
  }
}