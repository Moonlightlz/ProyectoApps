import { Component, OnInit } from '@angular/core';
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
  IonCardContent,
  IonButton,
  IonIcon,
  IonAvatar,
  IonImg,
  IonItem,
  IonLabel,
  IonInput,
  IonChip,
  IonGrid,
  IonRow,
  IonCol,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  ToastController,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user';
import { PhotoService } from '../services/photo';
import { User } from '../models/user.model';
import { addIcons } from 'ionicons';
import { 
  logOut, 
  person, 
  mail, 
  call, 
  location, 
  camera, 
  create, 
  save, 
  close,
  checkmarkCircle,
  timeOutline,
  starOutline,
  heartOutline,
  bagOutline
} from 'ionicons/icons';

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
    IonCardContent,
    IonButton,
    IonIcon,
    IonAvatar,
    IonImg,
    IonItem,
    IonLabel,
    IonInput,
    IonChip,
    IonGrid,
    IonRow,
    IonCol,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
    CommonModule, 
    FormsModule
  ]
})
export class ProfilePage implements OnInit {
  user: User | null = null;
  isLoading = true;
  isEditing = false;
  
  // Datos editables
  editData = {
    name: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'México'
    }
  };

  constructor(
    private router: Router,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private userService: UserService,
    private photoService: PhotoService
  ) { 
    addIcons({
      logOut,
      person,
      mail,
      call,
      location,
      camera,
      create,
      save,
      close,
      checkmarkCircle,
      timeOutline,
      starOutline,
      heartOutline,
      bagOutline
    });
  }

  async ngOnInit() {
    await this.loadUserProfile();
  }

  async loadUserProfile() {
    try {
      this.isLoading = true;
      const currentUser = await this.authService.getCurrentUser();
      
      if (currentUser) {
        this.user = await this.userService.getUserProfile(currentUser.uid);
        if (this.user) {
          // Inicializar datos editables
          this.editData.name = this.user.profile?.name || this.user.displayName || '';
          this.editData.phone = this.user.profile?.phone || this.user.phoneNumber || '';
          if (this.user.profile?.address) {
            this.editData.address = { ...this.user.profile.address };
          }
        }
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
      await this.showToast('Error al cargar el perfil', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async doRefresh(event: any) {
    await this.loadUserProfile();
    event.target.complete();
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      // Restaurar datos originales si cancela
      this.editData.name = this.user?.profile?.name || this.user?.displayName || '';
      this.editData.phone = this.user?.profile?.phone || this.user?.phoneNumber || '';
      if (this.user?.profile?.address) {
        this.editData.address = { ...this.user.profile.address };
      }
    }
  }

  async saveProfile() {
    if (!this.user) return;

    const loading = await this.loadingController.create({
      message: 'Guardando cambios...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const updates = {
        profile: {
          name: this.editData.name,
          phone: this.editData.phone,
          address: this.editData.address
        }
      };

      await this.userService.updateUserProfile(this.user.uid, updates);
      
      // Actualizar datos locales
      if (this.user.profile) {
        this.user.profile.name = this.editData.name;
        this.user.profile.phone = this.editData.phone;
        this.user.profile.address = this.editData.address;
      }
      
      this.isEditing = false;
      await this.showToast('Perfil actualizado correctamente', 'success');
      
    } catch (error) {
      console.error('Error guardando perfil:', error);
      await this.showToast('Error al guardar los cambios', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async changePhoto() {
    const actionSheet = await this.alertController.create({
      header: '📸 Cambiar Foto de Perfil',
      buttons: [
        {
          text: '📷 Tomar Foto',
          handler: () => this.takePhoto('camera')
        },
        {
          text: '🖼️ Elegir de Galería',
          handler: () => this.takePhoto('gallery')
        },
        {
          text: '👤 Elegir Avatar',
          handler: () => this.selectAvatar()
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePhoto(source: 'camera' | 'gallery') {
    if (!this.user) return;

    const loading = await this.loadingController.create({
      message: 'Procesando foto...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const photo = await this.photoService.takePhoto({ source });
      
      if (photo) {
        const photoUrl = await this.photoService.uploadPhoto(photo, `profile/${this.user.uid}`);
        
        if (photoUrl) {
          // Actualizar foto en el perfil
          await this.userService.updateUserProfile(this.user.uid, {
            photoURL: photoUrl
          });
          
          // Actualizar datos locales
          this.user.photoURL = photoUrl;
          
          await this.showToast('Foto actualizada correctamente', 'success');
        }
      }
      
    } catch (error) {
      console.error('Error actualizando foto:', error);
      await this.showToast('Error al actualizar la foto', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async selectAvatar() {
    // Implementar selección de avatars predefinidos
    await this.showToast('Función de avatars próximamente', 'warning');
  }

  async logout() {
    const alert = await this.alertController.create({
      header: '🚪 Cerrar Sesión',
      message: '¿Estás seguro que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Cerrando sesión...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              await this.authService.logout();
              await this.showToast('¡Hasta pronto! Sesión cerrada correctamente', 'success');
              setTimeout(() => {
                this.router.navigate(['/login']);
              }, 1000);
            } catch (error) {
              console.error('Error cerrando sesión:', error);
              await this.showToast('Error al cerrar sesión', 'danger');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
      icon: color === 'success' ? 'checkmarkCircle' : undefined
    });
    await toast.present();
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
