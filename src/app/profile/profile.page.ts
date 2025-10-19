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
import { FavoritesService } from '../services/favorites.service';
import { CartService } from '../services/cart.service';
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
  bagOutline,
  cartOutline
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
  
  // Estadísticas
  favoritesCount = 0;
  cartItemsCount = 0;
  
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
    private photoService: PhotoService,
    private favoritesService: FavoritesService,
    private cartService: CartService
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
      bagOutline,
      cartOutline
    });
  }

  async ngOnInit() {
    await this.loadUserProfile();
    await this.loadUserStats();
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

  async loadUserStats() {
    try {
      // Cargar estadísticas de favoritos y carrito
      this.favoritesCount = this.favoritesService.getFavoritesCount();
      this.cartItemsCount = this.cartService.getItemCount();
      
      // Suscribirse a cambios en tiempo real
      this.favoritesService.getFavorites$().subscribe(favorites => {
        this.favoritesCount = favorites.length;
      });
      
      this.cartService.getCart$().subscribe(cart => {
        this.cartItemsCount = cart ? cart.totalItems : 0;
      });
      
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }

  async doRefresh(event: any) {
    await this.loadUserProfile();
    await this.loadUserStats();
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
    console.log('ProfilePage: Iniciando cambio de foto');
    
    const alert = await this.alertController.create({
      header: '📸 Cambiar Foto de Perfil',
      buttons: [
        {
          text: '📷 Tomar Foto',
          handler: () => {
            console.log('ProfilePage: Usuario seleccionó cámara');
            this.takePhoto('camera');
          }
        },
        {
          text: '🖼️ Elegir de Galería',
          handler: () => {
            console.log('ProfilePage: Usuario seleccionó galería');
            this.takePhoto('gallery');
          }
        },
        {
          text: '👤 Elegir Avatar',
          handler: () => {
            console.log('ProfilePage: Usuario seleccionó avatar');
            this.selectAvatar();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('ProfilePage: Usuario canceló cambio de foto');
          }
        }
      ]
    });
    
    await alert.present();
    console.log('ProfilePage: AlertController presentado');
  }

  async takePhoto(source: 'camera' | 'gallery') {
    console.log('ProfilePage: takePhoto iniciado con source:', source);
    
    if (!this.user) {
      console.error('ProfilePage: No hay usuario activo');
      await this.showToast('Error: No hay usuario activo', 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Procesando foto...',
      spinner: 'crescent'
    });
    await loading.present();
    console.log('ProfilePage: Loading mostrado');

    try {
      console.log('ProfilePage: Llamando photoService.takePhoto');
      const photo = await this.photoService.takePhoto({ source });
      console.log('ProfilePage: Foto capturada:', photo ? 'Éxito' : 'Falló');
      
      if (photo) {
        console.log('ProfilePage: Iniciando upload de foto');
        const photoUrl = await this.photoService.uploadPhoto(photo, `profile/${this.user.uid}`);
        console.log('ProfilePage: Upload resultado:', photoUrl ? 'Éxito' : 'Falló');
        
        if (photoUrl) {
          console.log('ProfilePage: Actualizando perfil con nueva foto URL');
          
          // Actualizar foto en el perfil
          const updateResult = await this.userService.updateUserProfile(this.user.uid, {
            photoURL: photoUrl
          });
          console.log('ProfilePage: Actualización de perfil resultado:', updateResult);
          
          if (updateResult) {
            // Actualizar datos locales
            this.user.photoURL = photoUrl;
            console.log('ProfilePage: Datos locales actualizados');
            await this.showToast('Foto actualizada correctamente', 'success');
          } else {
            console.error('ProfilePage: Falló la actualización del perfil en Firestore');
            await this.showToast('Error al guardar la foto en el perfil', 'danger');
          }
        } else {
          console.error('ProfilePage: Falló el upload de la foto');
          await this.showToast('Error al subir la foto', 'danger');
        }
      } else {
        console.log('ProfilePage: No se capturó ninguna foto');
        await this.showToast('No se seleccionó ninguna foto', 'warning');
      }
      
    } catch (error) {
      console.error('ProfilePage: Error completo en takePhoto:', error);
      await this.showToast('Error al actualizar la foto: ' + error, 'danger');
    } finally {
      console.log('ProfilePage: Ocultando loading');
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

  async viewMyFavorites() {
    // Navegar al catálogo con filtro de favoritos
    this.router.navigate(['/tabs/catalog'], { 
      queryParams: { showFavorites: 'true' } 
    });
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
