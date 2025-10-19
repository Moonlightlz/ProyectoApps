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
      console.log('AdminGuard: Verificando acceso de administrador...');
      
      // Verificar si está logueado primero
      const isLoggedIn = this.authService.isLoggedIn();
      console.log('AdminGuard: ¿Está logueado?', isLoggedIn);
      
      if (!isLoggedIn) {
        console.log('AdminGuard: Usuario no logueado, redirigiendo a login');
        this.router.navigate(['/login']);
        return false;
      }

      const currentUser = this.authService.getCurrentUser();
      console.log('AdminGuard: Usuario actual de Firebase:', currentUser);
      
      // Si es un usuario de Firebase, verificar por email
      if (currentUser) {
        console.log('AdminGuard: Usuario Firebase encontrado, email:', currentUser.email);
        
        // Verificar por email si es admin
        if (currentUser.email) {
          const isAdminByEmail = this.userService.isAdminEmail(currentUser.email);
          console.log('AdminGuard: ¿Es admin por email?', isAdminByEmail);
          
          if (isAdminByEmail) {
            return true;
          }
        }
        
        // Verificar por UID como respaldo
        const isAdmin = await this.userService.isAdmin(currentUser.uid);
        console.log('AdminGuard: ¿Es admin por UID?', isAdmin);
        if (!isAdmin) {
          console.log('AdminGuard: Usuario de Firebase no es admin, redirigiendo a catalog');
          this.router.navigate(['/tabs/catalog']);
          return false;
        }
        return true;
      }

      // Si es un usuario demo (credenciales de prueba)
      const username = localStorage.getItem('username');
      const isLoggedInFlag = localStorage.getItem('isLoggedIn');
      console.log('AdminGuard: Username en localStorage:', username);
      console.log('AdminGuard: isLoggedIn en localStorage:', isLoggedInFlag);
      
      if (username === 'admin' && isLoggedInFlag === 'true') {
        console.log('AdminGuard: Usuario demo admin verificado');
        return true; // El usuario 'admin' es administrador
      }

      // Si no es admin, redirigir al catálogo
      console.log('AdminGuard: Usuario no es admin, redirigiendo a catalog');
      this.router.navigate(['/tabs/catalog']);
      return false;
    } catch (error) {
      console.error('Error en AdminGuard:', error);
      this.router.navigate(['/login']);
      return false;
    }
  }
}