import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonFooter,
  IonTextarea,
  IonButton,
  IonIcon,
  IonBadge,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import { ChatService } from '../services/chat.service';
import { AuthService } from '../services/auth.service';
import { OrderService } from '../services/order.service';
import { ChatMessage } from '../models/chat.model';
import { Order } from '../models/order.model';
import { addIcons } from 'ionicons';
import { sendOutline, receiptOutline } from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonBackButton,
    IonButtons,
    IonFooter,
    IonTextarea,
    IonButton,
    IonIcon,
    IonBadge,
    IonCard,
    IonCardContent,
    CommonModule,
    FormsModule
  ]
})
export class ConversationPage implements OnInit, OnDestroy {
  @ViewChild(IonContent) content!: IonContent;
  
  orderId: string | null = null;
  orderCode: string | null = null;
  order: Order | null = null;
  messages: ChatMessage[] = [];
  newMessage: string = '';
  currentUserId: string = '';
  isAdmin: boolean = false;

  private messagesSubscription: Subscription | null = null;
  private routeParamsSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private authService: AuthService,
    private orderService: OrderService
  ) {
    addIcons({ sendOutline, receiptOutline });
  }

  async ngOnInit() {
    console.log('💬 Conversation page initialized');
    
    // Escuchar cambios en query params — permite abrir conversaciones distintas sin recrear el componente
    this.routeParamsSubscription = this.route.queryParamMap.subscribe(async (params) => {
      const newOrderId = params.get('orderId');
      const newOrderCode = params.get('orderCode');

      console.log('💬 Query params changed:', { orderId: newOrderId, orderCode: newOrderCode });

      if (!newOrderId) {
        console.error('❌ No se proporcionó orderId en query params');
        this.router.navigate(['/tabs/orders']);
        return;
      }

      // Si cambió el pedido, limpiar listeners previos y recargar
      if (this.orderId !== newOrderId) {
        console.log('💬 Cambiando conversación de', this.orderId, 'a', newOrderId);
        // limpiar listeners y estado local
        this.chatService.unsubscribe();
        this.messages = [];
        this.orderId = newOrderId;
        this.orderCode = newOrderCode;

        // Cargar pedido y mensajes para el nuevo orderId
        await this.loadOrder();
        this.loadMessages();
        await this.chatService.markAsRead(this.orderId);
      }
    });

    // Obtener usuario actual
    const user = this.authService.getCurrentUser();
    if (!user) {
      console.error('Usuario no autenticado');
      this.router.navigate(['/login']);
      return;
    }

    this.currentUserId = user.uid;
    const adminEmails = ['admin@pasteleria.com', 'diego@pasteleria-diego.com'];
    this.isAdmin = adminEmails.includes(user.email || '');

    // Suscribirse a nuevos mensajes (el stream será actualizado por loadMessages)
    this.messagesSubscription = this.chatService.messages$.subscribe(messages => {
      console.log('💬 Mensajes recibidos en la página:', messages.length);
      console.log('💬 Mensajes:', messages);
      this.messages = messages;
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  ngOnDestroy() {
    if (this.messagesSubscription) {
      this.messagesSubscription.unsubscribe();
    }
    if (this.routeParamsSubscription) {
      this.routeParamsSubscription.unsubscribe();
    }
    this.chatService.unsubscribe();
  }

  async loadOrder() {
    if (!this.orderId) return;
    try {
      this.order = await this.orderService.getOrderById(this.orderId);
      if (this.order && !this.orderCode) {
        this.orderCode = this.order.orderCode;
      }
    } catch (error) {
      console.error('Error cargando pedido:', error);
    }
  }

  loadMessages() {
    if (!this.orderId) return;
    this.chatService.loadMessages(this.orderId);
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.orderId || !this.orderCode) return;

    try {
      await this.chatService.sendMessage(
        this.orderId,
        this.orderCode,
        this.newMessage,
        this.order?.userId,
        this.order?.customerInfo.name,
        this.order?.customerInfo.email
      );

      this.newMessage = '';
      this.scrollToBottom();
    } catch (error) {
      console.error('Error enviando mensaje:', error);
    }
  }

  isMyMessage(message: ChatMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  formatTime(date: Date): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('es-PE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDate(date: Date): string {
    if (!date) return '';
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    return messageDate.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short' 
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      this.content?.scrollToBottom(300);
    }, 100);
  }
}
