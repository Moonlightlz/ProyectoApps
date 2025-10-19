import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonItem,
  IonInput,
  IonButton,
  IonIcon,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { mail, arrowBack, personAdd, checkmarkCircle } from 'ionicons/icons';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButtons,
    IonBackButton,
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
export class ForgotPasswordPage {
  email: string = '';
  emailSent: boolean = false;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService
  ) {
    addIcons({ mail, arrowBack, personAdd, checkmarkCircle });
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return this.email.trim() !== '' && emailRegex.test(this.email);
  }

  async sendResetEmail() {
    if (!this.isEmailValid()) {
      await this.showMessage('Por favor, ingresa un correo electrónico válido', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando correo de recuperación...',
      duration: 10000
    });
    await loading.present();

    try {
      const result = await this.authService.sendPasswordReset(this.email);
      
      await loading.dismiss();
      
      if (result.success) {
        this.emailSent = true;
        await this.showMessage('Correo de recuperación enviado exitosamente', 'success');
      } else {
        await this.showMessage(result.error || 'Error al enviar el correo', 'danger');
      }
    } catch (error) {
      await loading.dismiss();
      await this.showMessage('Error de conexión. Intenta nuevamente', 'danger');
    }
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
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
}
