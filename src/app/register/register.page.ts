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
  IonCheckbox,
  IonLabel,
  ToastController,
  LoadingController,
  AlertController
} from '@ionic/angular/standalone';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { camera, personAdd, logIn, arrowBack } from 'ionicons/icons';
import { AuthService, RegisterData } from '../services/auth.service';
import { UserService } from '../services/user';
import { PhotoService } from '../services/photo';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
    IonCheckbox,
    IonLabel,
    CommonModule, 
    FormsModule
  ]
})
export class RegisterPage {
  registerForm: RegisterForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  };
  
  selectedPhoto: string | null = null;

  constructor(
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private authService: AuthService,
    private userService: UserService,
    private photoService: PhotoService
  ) {
    addIcons({ camera, personAdd, logIn, arrowBack });
  }

  async selectPhoto() {
    try {
      const alert = await this.alertController.create({
        header: 'Seleccionar foto',
        message: '¿Cómo deseas agregar tu foto de perfil?',
        buttons: [
          {
            text: 'Cámara',
            handler: () => this.takePhotoFromCamera()
          },
          {
            text: 'Galería',
            handler: () => this.takePhotoFromGallery()
          },
          {
            text: 'Avatar predeterminado',
            handler: () => this.selectDefaultAvatar()
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      });
      await alert.present();
    } catch (error) {
      await this.showMessage('Error al acceder a las opciones de foto', 'danger');
    }
  }

  async takePhotoFromCamera() {
    const photoUrl = await this.photoService.takePhoto({ source: 'camera' });
    if (photoUrl) {
      this.selectedPhoto = photoUrl;
    } else {
      await this.showMessage('Error al capturar la foto', 'danger');
    }
  }

  async takePhotoFromGallery() {
    const photoUrl = await this.photoService.takePhoto({ source: 'gallery' });
    if (photoUrl) {
      this.selectedPhoto = photoUrl;
    } else {
      await this.showMessage('Error al seleccionar la foto', 'danger');
    }
  }

  async selectDefaultAvatar() {
    const avatars = this.photoService.getDefaultAvatars();
    const alert = await this.alertController.create({
      header: 'Seleccionar avatar',
      message: 'Elige un avatar predeterminado:',
      buttons: [
        ...avatars.map((avatar, index) => ({
          text: `Avatar ${index + 1}`,
          handler: () => {
            this.selectedPhoto = avatar;
          }
        })),
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  isFormValid(): boolean {
    return this.registerForm.name.trim() !== '' &&
           this.registerForm.email.trim() !== '' &&
           this.registerForm.password.trim() !== '' &&
           this.registerForm.confirmPassword.trim() !== '' &&
           this.registerForm.acceptTerms &&
           this.isEmailValid() &&
           this.passwordsMatch();
  }

  isEmailValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.registerForm.email);
  }

  passwordsMatch(): boolean {
    return this.registerForm.password === this.registerForm.confirmPassword;
  }

  async register() {
    if (!this.isFormValid()) {
      await this.showMessage('Por favor, completa correctamente todos los campos', 'warning');
      return;
    }

    if (!this.isEmailValid()) {
      await this.showMessage('Por favor, ingresa un correo electrónico válido', 'warning');
      return;
    }

    if (!this.passwordsMatch()) {
      await this.showMessage('Las contraseñas no coinciden', 'warning');
      return;
    }

    if (this.registerForm.password.length < 6) {
      await this.showMessage('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    // Verificar si el email ya existe
    const emailExists = await this.userService.emailExists(this.registerForm.email);
    if (emailExists) {
      await this.showMessage('Este correo ya tiene una cuenta. ¿Deseas iniciar sesión?', 'warning');
      setTimeout(() => {
        this.goToLogin();
      }, 2000);
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Creando tu cuenta...',
      duration: 15000
    });
    await loading.present();

    try {
      // Preparar datos de registro
      const registerData: RegisterData = {
        name: this.registerForm.name,
        email: this.registerForm.email,
        phone: this.registerForm.phone,
        password: this.registerForm.password,
        photoUrl: this.selectedPhoto || undefined
      };

      console.log('Iniciando registro con datos:', registerData);

      // Registrar con Firebase Auth
      const result = await this.authService.register(registerData);
      console.log('Resultado de auth:', result);
      
      if (result.success && result.user) {
        console.log('Usuario creado exitosamente, creando perfil...');
        
        try {
          // crear perfil en firestore
          const profileCreated = await this.userService.createUserProfile(result.user.uid, {
            name: registerData.name,
            email: registerData.email,
            phone: registerData.phone,
            password: registerData.password,
            photoUrl: registerData.photoUrl
          });

          await loading.dismiss();
          
          if (profileCreated) {
            console.log('Perfil creado exitosamente');
            await this.showMessage('¡Cuenta creada exitosamente!', 'success');
            this.clearForm();
            this.goToLogin();
          } else {
            console.log('Error al crear perfil, pero cuenta Auth existe');
            await this.showMessage('Cuenta creada, pero hubo un problema con el perfil. Puedes iniciar sesión normalmente.', 'warning');
            this.clearForm();
            this.goToLogin();
          }
        } catch (profileError) {
          console.error('Error creando perfil:', profileError);
          await loading.dismiss();
          await this.showMessage('Cuenta creada exitosamente. Puedes iniciar sesión.', 'success');
          this.goToLogin();
        }
      } else {
        await loading.dismiss();
        console.error('Error en auth:', result.error);
        
        // Verificar si el error es porque el email ya existe
        if (result.error && result.error.includes('email-already-in-use')) {
          await this.showMessage('Este correo ya tiene una cuenta. ¿Deseas iniciar sesión?', 'warning');
          setTimeout(() => {
            this.goToLogin();
          }, 2000);
        } else {
          await this.showMessage(result.error || 'Error al crear la cuenta', 'danger');
        }
      }
    } catch (error: any) {
      await loading.dismiss();
      console.error('Error general:', error);
      
      // Si el error contiene información sobre email ya existente
      if (error.message && error.message.includes('email-already-in-use')) {
        await this.showMessage('Este correo ya tiene una cuenta. Redirigiendo al login...', 'warning');
        setTimeout(() => {
          this.goToLogin();
        }, 2000);
      } else {
        await this.showMessage('Error de conexión. Intenta nuevamente', 'danger');
      }
    }
  }

  async showTerms() {
    const alert = await this.alertController.create({
      header: 'Términos y Condiciones',
      message: `
        <p><strong>Pastelería D'Diego - Términos de Uso</strong></p>
        <p>Al usar esta aplicación, aceptas:</p>
        <ul>
          <li>Proporcionar información veraz</li>
          <li>Usar la app solo para pedidos legítimos</li>
          <li>Respetar nuestras políticas de privacidad</li>
          <li>Pagar puntualmente tus pedidos</li>
        </ul>
        <p>Nos reservamos el derecho de cancelar cuentas que incumplan estos términos.</p>
      `,
      buttons: [
        {
          text: 'Entendido',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  private clearForm() {
    this.registerForm = {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    };
    this.selectedPhoto = null;
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
