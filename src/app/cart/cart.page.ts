import { Component, OnInit, OnDestroy } from '@angular/core';
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
  IonCardContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  ToastController,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { CartService } from '../services/cart.service';
import { Cart, CartItem } from '../models/cart.model';
import { addIcons } from 'ionicons';
import { 
  add, 
  remove, 
  trash, 
  card, 
  checkmarkCircle, 
  closeCircle,
  cartOutline,
  bagCheckOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
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
    IonItem,
    IonLabel,
    IonList,
    IonImg,
    IonGrid,
    IonRow,
    IonCol,
    IonChip,
    IonBadge,
    IonRefresher,
    IonRefresherContent,
    CommonModule, 
    FormsModule
  ]
})
export class CartPage implements OnInit, OnDestroy {
  cart: Cart | null = null;
  isLoading = false;
  private cartSubscription: Subscription | null = null;

  constructor(
    private cartService: CartService,
    private toastController: ToastController,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { 
    addIcons({
      add,
      remove,
      trash,
      card,
      checkmarkCircle,
      closeCircle,
      cartOutline,
      bagCheckOutline
    });
  }

  ngOnInit() {
    this.loadCart();
  }

  ngOnDestroy() {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  loadCart() {
    // Suscribirse a cambios del carrito en tiempo real
    this.cartSubscription = this.cartService.getCart$().subscribe(cart => {
      this.cart = cart;
    });
  }

  async doRefresh(event: any) {
    this.loadCart();
    setTimeout(() => {
      event.target.complete();
    }, 1000);
  }

  async increaseQuantity(item: CartItem) {
    try {
      await this.cartService.updateItemQuantity(item.id, item.quantity + 1);
    } catch (error) {
      console.error('Error aumentando cantidad:', error);
      await this.showToast('Error al actualizar cantidad', 'danger');
    }
  }

  async decreaseQuantity(item: CartItem) {
    try {
      if (item.quantity > 1) {
        await this.cartService.updateItemQuantity(item.id, item.quantity - 1);
      } else {
        await this.removeItem(item);
      }
    } catch (error) {
      console.error('Error disminuyendo cantidad:', error);
      await this.showToast('Error al actualizar cantidad', 'danger');
    }
  }

  async removeItem(item: CartItem) {
    const alert = await this.alertController.create({
      header: 'Confirmar',
      message: `¿Deseas eliminar "${item.product.name}" del carrito?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            try {
              await this.cartService.removeFromCart(item.id);
              await this.showToast(`${item.product.name} eliminado del carrito`, 'success');
            } catch (error) {
              console.error('Error eliminando item:', error);
              await this.showToast('Error al eliminar producto', 'danger');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async clearCart() {
    if (!this.cart || this.cart.items.length === 0) {
      await this.showToast('El carrito ya está vacío', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Vaciar Carrito',
      message: '¿Estás seguro de que deseas vaciar todo el carrito? Esta acción no se puede deshacer.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Vaciar',
          role: 'destructive',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Vaciando carrito...',
              spinner: 'crescent'
            });
            await loading.present();

            try {
              await this.cartService.clearCart();
              await this.showToast('Carrito vaciado exitosamente', 'success');
            } catch (error) {
              console.error('Error vaciando carrito:', error);
              await this.showToast('Error al vaciar carrito', 'danger');
            } finally {
              await loading.dismiss();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async proceedToCheckout() {
    if (!this.cart || this.cart.items.length === 0) {
      await this.showToast('Agrega productos al carrito para continuar', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: '🛒 Realizar Pedido',
      message: `
        <div style="text-align: left;">
          <p><strong>Resumen del pedido:</strong></p>
          <p>• ${this.cart.totalItems} productos</p>
          <p>• Total: ${this.formatPrice(this.cart.total)}</p>
          <br>
          <p><em>Esta función estará disponible próximamente. Actualmente es solo una demostración.</em></p>
        </div>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Continuar (Demo)',
          handler: async () => {
            const loading = await this.loadingController.create({
              message: 'Procesando pedido...',
              spinner: 'crescent'
            });
            await loading.present();

            // Simular procesamiento
            setTimeout(async () => {
              await loading.dismiss();
              await this.showToast('¡Pedido simulado! Funcionalidad en desarrollo', 'success');
            }, 2000);
          }
        }
      ]
    });
    await alert.present();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(price);
  }

  getItemTotal(item: CartItem): number {
    return item.quantity * item.unitPrice;
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
