import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent
} from '@ionic/angular/standalone';
import { IonButton } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ChatService } from '../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
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
    CommonModule, 
    FormsModule
  ]
})
export class ChatPage implements OnInit {

  // Placeholder: mostrar el botón sólo para usuarios.
  // Nota: conectar esto con el servicio de usuario/estado real cuando se implemente la lógica de roles.
  public isUser: boolean = true;
  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private router: Router
  ) { }

  ngOnInit() {
  }

  // Lógica mínima para iniciar una conversación y enviar/mostrar mensajes
  async startCustomOrderChat() {
    try {
      const currentUser = this.authService.getCurrentUser();
      const uid = currentUser?.uid || 'anonymous';

      // Crear conversación
      const created = await this.chatService.createConversationForAdmin(uid, 'custom_order');
      if (created && created.success) {
        // Enviar mensaje inicial
        await this.chatService.sendMessage(created.id as string, uid, 'Hola, quiero iniciar un pedido personalizado.');
        // Navegar a la página de conversación (nueva ventana/página)
        await this.router.navigate(['/tabs', 'chat', 'conversation', created.id]);
      }
    } catch (error) {
      console.error('startCustomOrderChat error', error);
    }
  }
  

}
