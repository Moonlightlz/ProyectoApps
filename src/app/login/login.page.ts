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
  showToast: boolean = false;
  toastMessage: string = '';
  toastColor: string = 'danger';

  // Credenciales de prueba
  private readonly TEST_CREDENTIALS = {
    username: 'admin',
    password: 'admin'
  };

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {}

  async login() {
    // Validar campos vacíos
    if (!this.username.trim() || !this.password.trim()) {
      await this.showMessage('Por favor, completa todos los campos', 'warning');
      return;
    }

    // Mostrar loading
    const loading = await this.loadingController.create({
      message: 'Iniciando sesión...',
      duration: 1500
    });
    await loading.present();

    // Simular delay de autenticación
    setTimeout(async () => {
      await loading.dismiss();
      
      // Verificar credenciales
      if (this.username.toLowerCase() === this.TEST_CREDENTIALS.username && 
          this.password === this.TEST_CREDENTIALS.password) {
        
        // Guardar estado de login PRIMERO
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', this.username);
        
        // Login exitoso
        await this.showMessage('¡Bienvenido a Pastelería D\'Diego!', 'success');
        
        // Navegar a la app principal
        this.router.navigateByUrl('/tabs');
        
      } else {
        // Login fallido
        await this.showMessage('Usuario o contraseña incorrectos', 'danger');
        this.clearForm();
      }
    }, 1500);
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

  // Método para mostrar credenciales de demo
  showDemoCredentials() {
    this.username = this.TEST_CREDENTIALS.username;
    this.password = this.TEST_CREDENTIALS.password;
  }
}
