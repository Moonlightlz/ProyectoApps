import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user';
import { addIcons } from 'ionicons';
import { logIn, personAdd, helpCircle, checkmarkCircle, alertCircle, informationCircle } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardContent,
    IonItem,
    IonInput,
    IonButton,
    IonIcon,
    CommonModule, 
    FormsModule
  ]
})
export class LoginPage {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private userService: UserService
  ) {
    addIcons({ logIn, personAdd, helpCircle, checkmarkCircle, alertCircle, informationCircle });
  }

  async login() {
    // Validar campos vacíos
    if (!this.username.trim() || !this.password.trim()) {
      await this.showMessage('Por favor, completa todos los campos', 'warning');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      duration: 10000
    });
    await loading.present();

    try {
      // Intentar login con AuthService
      const result = await this.authService.login(this.username, this.password);
      
      if (result.success) {
        // Actualizar última conexión si no es demo
        if (!result.isDemo && result.user) {
          await this.userService.updateLastLogin(result.user.uid);
        }

        await loading.dismiss();
        await this.showMessage('¡Bienvenido a Pastelería D\'Diego!', 'success');
        
        // Navegar a la app principal con tabs
        this.router.navigateByUrl('/tabs');
        
      } else {
        await loading.dismiss();
        await this.showMessage(result.error || 'Error al iniciar sesión', 'danger');
        this.clearForm();
      }
    } catch (error) {
      await loading.dismiss();
      await this.showMessage('Error de conexión. Intenta nuevamente', 'danger');
      this.clearForm();
    }
  }

  private async showMessage(message: string, color: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
      icon: color === 'success' ? 'checkmark-circle' : 
            color === 'danger' ? 'alert-circle' : 'information-circle'
    });
    await toast.present();
  }

  private clearForm() {
    this.password = '';
  }

  // Navegar a registro
  goToRegister = () => {
    console.log('Navegando a registro...');
    this.router.navigate(['/register']).then((success) => {
      if (success) {
        console.log('Navegación exitosa a registro');
      } else {
        console.error('Error en navegación a registro');
      }
    }).catch(error => {
      console.error('Error de navegación:', error);
    });
  }

  // Navegar a recuperar contraseña
  goToForgotPassword = () => {
    console.log('Navegando a recuperar contraseña...');
    this.router.navigate(['/forgot-password']).then((success) => {
      if (success) {
        console.log('Navegación exitosa a recuperar contraseña');
      } else {
        console.error('Error en navegación a recuperar contraseña');
      }
    }).catch(error => {
      console.error('Error de navegación:', error);
    });
  }
}
