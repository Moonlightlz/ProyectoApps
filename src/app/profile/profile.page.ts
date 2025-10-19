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
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  ToastController
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardSubtitle,
    IonCardContent,
    IonButton,
    IonIcon,
    CommonModule, 
    FormsModule
  ]
})
export class ProfilePage {

  constructor(
    private router: Router,
    private toastController: ToastController
  ) { }

  async logout() {
    // Limpiar el localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    // Mostrar mensaje de despedida
    const toast = await this.toastController.create({
      message: '¡Hasta pronto! Sesión cerrada correctamente',
      duration: 2000,
      color: 'success',
      position: 'top',
      icon: 'checkmark-circle'
    });
    await toast.present();
    
    // Navegar al login
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1000);
  }
}
