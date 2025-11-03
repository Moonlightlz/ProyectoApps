import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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
  IonButtons,
  IonIcon,
  IonBadge,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonRefresher,
  IonRefresherContent,
  IonSegment,
  IonSegmentButton,
  IonProgressBar,
  AlertController,
  ToastController,
  ModalController
} from '@ionic/angular/standalone';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { ChatService } from '../services/chat.service';
import { Order, OrderStatus, OrderStatusLabels, OrderStatusColors } from '../models/order.model';
import { OrderDetailModalComponent } from '../components/order-detail-modal.component';
import { UnreadCount } from '../models/chat.model';
import { addIcons } from 'ionicons';
import { 
  receiptOutline,
  timeOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  chevronForwardOutline,
  refreshOutline,
  chatbubbleEllipsesOutline,
  createOutline,
  cartOutline
} from 'ionicons/icons';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
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
    IonButtons,
    IonIcon,
    IonBadge,
    IonList,
    IonItem,
    IonLabel,
    IonChip,
    IonRefresher,
    IonRefresherContent,
    IonSegment,
    IonSegmentButton,
    IonProgressBar,
    CommonModule, 
    FormsModule
  ]
})
export class OrdersPage implements OnInit, OnDestroy {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  pendingOrder: Order | null = null;
  isAdmin = false;
  selectedFilter: 'all' | 'pending' | 'completed' = 'all';
  
  // Timer para el pedido pendiente
  timeRemaining: number = 60; // segundos
  timerSubscription: Subscription | null = null;
  
  // Contador de mensajes no leídos
  unreadCount: UnreadCount = { total: 0, byOrder: {} };
  
  OrderStatus = OrderStatus;
  OrderStatusLabels = OrderStatusLabels;
  OrderStatusColors = OrderStatusColors;

  private ordersSubscription: Subscription | null = null;
  private pendingOrderSubscription: Subscription | null = null;
  private unreadCountSubscription: Subscription | null = null;

  constructor(
    private orderService: OrderService,
    private authService: AuthService,
    private cartService: CartService,
    private productService: ProductService,
    private chatService: ChatService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private alertController: AlertController,
    private toastController: ToastController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      receiptOutline,
      timeOutline,
      checkmarkCircleOutline,
      closeCircleOutline,
      chevronForwardOutline,
      refreshOutline,
      chatbubbleEllipsesOutline,
      createOutline,
      cartOutline
    });
  }

  async ngOnInit() {
    await this.checkAdminStatus();
    await this.loadOrders();
    
    // Suscribirse al pedido pendiente
    this.pendingOrderSubscription = this.orderService.pendingOrder$.subscribe(order => {
      this.pendingOrder = order;
      
      if (order && order.status === OrderStatus.PENDING_CONFIRMATION) {
        this.startCountdown(order);
      } else {
        this.stopCountdown();
      }
    });

    // Suscribirse al contador de mensajes no leídos
    this.unreadCountSubscription = this.chatService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.detectChanges();
    });

    // Verificar si viene de crear un pedido
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['pendingOrderId']) {
        this.scrollToPendingOrder();
      }
    });
  }

  ngOnDestroy() {
    this.stopCountdown();
    
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    
    if (this.pendingOrderSubscription) {
      this.pendingOrderSubscription.unsubscribe();
    }

    if (this.unreadCountSubscription) {
      this.unreadCountSubscription.unsubscribe();
    }
  }

  async checkAdminStatus() {
    try {
      const isLoggedIn = this.authService.isLoggedIn();
      
      if (!isLoggedIn) {
        console.log('👤 Usuario no logueado');
        this.isAdmin = false;
        return;
      }

      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser && currentUser.email) {
        const adminEmails = ['admin@pasteleria.com', 'diego@pasteleria-diego.com'];
        this.isAdmin = adminEmails.includes(currentUser.email);
        console.log('👤 Usuario:', currentUser.email, '| Es admin:', this.isAdmin);
      } else {
        console.log('👤 Usuario sin email');
        this.isAdmin = false;
      }
    } catch (error) {
      console.error('Error verificando status de admin:', error);
      this.isAdmin = false;
    }
  }

  async loadOrders() {
    console.log('🔄 Cargando pedidos, isAdmin:', this.isAdmin);
    
    if (this.isAdmin) {
      console.log('🔑 Cargando como ADMINISTRADOR');
      await this.orderService.loadAllOrders();
      this.ordersSubscription = this.orderService.allOrders$.subscribe(orders => {
        this.orders = orders;
        console.log(`📋 Total pedidos cargados (admin): ${orders.length}`, orders.map(o => ({ code: o.orderCode, status: o.status })));
        this.filterOrders();
      });
    } else {
      console.log('👤 Cargando como USUARIO');
      await this.orderService.loadUserOrders();
      this.ordersSubscription = this.orderService.userOrders$.subscribe(orders => {
        this.orders = orders;
        console.log(`📋 Total pedidos cargados (usuario): ${orders.length}`, orders.map(o => ({ code: o.orderCode, status: o.status })));
        this.filterOrders();
      });
    }
  }

  filterOrders() {
    switch (this.selectedFilter) {
      case 'pending':
        // Pedidos pendientes: en confirmación, confirmados, preparando, listos y en camino
        this.filteredOrders = this.orders.filter(o => 
          o.status === OrderStatus.PENDING_CONFIRMATION ||
          o.status === OrderStatus.CONFIRMED ||
          o.status === OrderStatus.PREPARING ||
          o.status === OrderStatus.READY ||
          o.status === OrderStatus.IN_DELIVERY
        );
        break;
      case 'completed':
        // Pedidos finalizados: completados o cancelados
        this.filteredOrders = this.orders.filter(o => 
          o.status === OrderStatus.COMPLETED ||
          o.status === OrderStatus.CANCELLED
        );
        break;
      default:
        // Todos los pedidos
        this.filteredOrders = [...this.orders];
    }
    console.log(`🔍 Filtro: ${this.selectedFilter}, Pedidos filtrados: ${this.filteredOrders.length}`, this.filteredOrders.map(o => ({ code: o.orderCode, status: o.status })));
  }

  onFilterChange(event: any) {
    this.selectedFilter = event.detail.value;
    this.filterOrders();
  }

  /**
   * Iniciar countdown de 1 minuto
   */
  startCountdown(order: Order) {
    this.stopCountdown(); // Detener cualquier countdown previo
    
    const createdTime = order.createdAt.getTime();
    const now = Date.now();
    const elapsed = Math.floor((now - createdTime) / 1000);
    this.timeRemaining = Math.max(60 - elapsed, 0);
    
    if (this.timeRemaining > 0) {
      this.timerSubscription = interval(1000).subscribe(() => {
        this.timeRemaining--;
        this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la UI
        
        if (this.timeRemaining <= 0) {
          this.stopCountdown();
        }
      });
    }
  }

  stopCountdown() {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  getTimerProgress(): number {
    return this.timeRemaining / 60;
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Editar compra (volver al carrito)
   */
  async editOrder() {
    if (!this.pendingOrder) return;

    const alert = await this.alertController.create({
      header: 'Editar Pedido',
      message: '¿Deseas volver al carrito para modificar tu pedido? El pedido actual se cancelará.',
      buttons: [
        {
          text: 'No, mantener',
          role: 'cancel'
        },
        {
          text: 'Sí, editar',
          handler: async () => {
            try {
              // Restaurar items al carrito
              console.log('Restaurando items al carrito...');
              const products = await this.productService.getAllProducts();
              
              for (const item of this.pendingOrder!.items) {
                const product = products.find(p => p.id === item.productId);
                if (product) {
                  await this.cartService.addToCart(product, item.quantity, item.notes);
                  console.log(`✅ Restaurado: ${item.productName} x${item.quantity}`);
                }
              }
              
              // Cancelar el pedido actual
              await this.orderService.cancelOrder(
                this.pendingOrder!.id,
                'Cliente decidió editar el pedido'
              );
              
              await this.showToast('Productos restaurados al carrito', 'success');
              this.router.navigate(['/tabs/cart']);
            } catch (error) {
              console.error('Error editando pedido:', error);
              await this.showToast('Error al cancelar pedido', 'danger');
            }
          }
        }
      ]
    });
    
    await alert.present();
  }

  /**
   * Ver detalle del pedido
   */
  async viewOrderDetail(order: Order) {
    const modal = await this.modalController.create({
      component: OrderDetailModalComponent,
      componentProps: {
        order: order
      }
    });

    await modal.present();
  }

  /**
   * Ir al chat con el pedido etiquetado
   */
  goToChat(order: Order) {
    console.log('� BOTÓN CHAT CLICKEADO');
    console.log('�💬 Navegando al chat del pedido:', order);
    console.log('💬 Order ID:', order.id);
    console.log('💬 Order Code:', order.orderCode);
    
    this.router.navigate(['/tabs/conversation'], {
      queryParams: { 
        orderId: order.id,
        orderCode: order.orderCode
      }
    }).then(success => {
      console.log('✅ Navegación exitosa:', success);
    }).catch(error => {
      console.error('❌ Error en navegación:', error);
    });
  }

  /**
   * Obtener cantidad de mensajes no leídos para un pedido
   */
  getUnreadCountForOrder(orderId: string): number {
    return this.unreadCount.byOrder[orderId] || 0;
  }

  /**
   * Actualizar estado (solo admin)
   */
  async updateStatus(order: Order) {
    if (!this.isAdmin) return;

    const nextStatuses = this.getNextPossibleStatuses(order.status);
    
    const buttons = nextStatuses.map(status => ({
      text: OrderStatusLabels[status],
      handler: async () => {
        try {
          const user = this.authService.getCurrentUser();
          if (!user) return;

          await this.orderService.updateOrderStatus(
            order.id,
            status,
            user.uid,
            user.displayName || 'Admin',
            `Estado actualizado a: ${OrderStatusLabels[status]}`
          );

          await this.showToast('Estado actualizado correctamente', 'success');
        } catch (error) {
          console.error('Error actualizando estado:', error);
          await this.showToast('Error al actualizar estado', 'danger');
        }
      }
    }));

    buttons.push({
      text: 'Cancelar',
      handler: async () => {}
    });

    const alert = await this.alertController.create({
      header: 'Actualizar Estado',
      message: `Pedido: ${order.orderCode}`,
      buttons: buttons as any
    });

    await alert.present();
  }

  getNextPossibleStatuses(currentStatus: OrderStatus): OrderStatus[] {
    switch (currentStatus) {
      case OrderStatus.PENDING_CONFIRMATION:
        return [OrderStatus.CONFIRMED, OrderStatus.CANCELLED];
      case OrderStatus.CONFIRMED:
        return [OrderStatus.PREPARING, OrderStatus.CANCELLED];
      case OrderStatus.PREPARING:
        return [OrderStatus.READY, OrderStatus.CANCELLED];
      case OrderStatus.READY:
        return [OrderStatus.IN_DELIVERY, OrderStatus.COMPLETED];
      case OrderStatus.IN_DELIVERY:
        return [OrderStatus.COMPLETED];
      default:
        return [];
    }
  }

  async doRefresh(event: any) {
    await this.loadOrders();
    event.target.complete();
  }

  scrollToPendingOrder() {
    // Scroll automático al pedido pendiente
    setTimeout(() => {
      const pendingElement = document.getElementById('pending-order');
      if (pendingElement) {
        pendingElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
