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
  IonCheckbox,
  IonSelect,
  IonSelectOption,
  ToastController,
  AlertController,
  LoadingController
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
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
  bagCheckOutline,
  warningOutline
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { doc, updateDoc } from 'firebase/firestore';

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
    IonCheckbox,
    IonSelect,
    IonSelectOption,
    CommonModule, 
    FormsModule
  ]
})
export class CartPage implements OnInit, OnDestroy {
  cart: Cart | null = null;
  isLoading = false;
  private cartSubscription: Subscription | null = null;

  // Delivery options
  includeDelivery = false;
  selectedDistance: 'near' | 'medium' | 'far' | null = null;
  deliveryCost = 0;
  
  // Phone number para el pedido (temporal hasta que se cree)
  private customerPhone: string | undefined;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private authService: AuthService,
    private userService: UserService,
    private firestore: Firestore,
    private router: Router,
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
      bagCheckOutline,
      warningOutline
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

    // Validar que si eligió delivery, haya seleccionado distancia
    if (this.includeDelivery && !this.selectedDistance) {
      await this.showToast('Por favor selecciona la distancia para el delivery', 'warning');
      return;
    }

    // Verificar si el usuario tiene teléfono guardado
    const user = await this.authService.getCurrentUser();
    if (user) {
      const userData = await this.userService.getUserProfile(user.uid);
      
      // Si no tiene teléfono, solicitarlo
      if (!userData?.profile?.phone) {
        const phoneAlert = await this.alertController.create({
          header: '📱 Teléfono de contacto',
          message: 'Para procesar tu pedido necesitamos tu número de teléfono:',
          inputs: [
            {
              name: 'phone',
              type: 'tel',
              placeholder: '999 999 999',
              attributes: {
                maxlength: 15,
                minlength: 9
              }
            }
          ],
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Continuar',
              handler: async (data) => {
                if (!data.phone || data.phone.trim().length < 9) {
                  await this.showToast('Por favor ingresa un teléfono válido', 'warning');
                  return false;
                }
                
                // Guardar el teléfono temporalmente para el pedido
                this.customerPhone = data.phone.trim();
                
                // También guardarlo en el perfil del usuario en Firestore para futuros pedidos
                try {
                  const userDocRef = doc(this.firestore, `users/${user.uid}`);
                  await updateDoc(userDocRef, {
                    'profile.phone': data.phone.trim()
                  });
                } catch (error) {
                  console.error('Error guardando teléfono en perfil:', error);
                  // No detenemos el flujo si falla guardar en el perfil
                }
                
                await this.showConfirmOrderAlert();
                return true;
              }
            }
          ]
        });
        await phoneAlert.present();
        return;
      } else {
        // Si ya tiene teléfono, guardarlo temporalmente
        this.customerPhone = userData.profile.phone;
      }
    }

    // Si ya tiene teléfono o es invitado, continuar con el resumen
    await this.showConfirmOrderAlert();
  }

  private async showConfirmOrderAlert() {
    const deliveryText = this.includeDelivery 
      ? `Delivery: ${this.formatPrice(this.deliveryCost)}` 
      : 'Recojo en tienda';

    const alert = await this.alertController.create({
      header: '🛒 Confirmar Pedido',
      subHeader: 'Resumen del pedido:',
      message: `
${this.cart!.totalItems} productos
Subtotal: ${this.formatPrice(this.cart!.subtotal)}
${deliveryText}
Total: ${this.formatPrice(this.getFinalTotal())}

⏰ Importante: Tendrás 1 minuto para editar tu pedido antes de que se confirme automáticamente.
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Realizar Pedido',
          handler: async () => {
            await this.createOrder();
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Crear el pedido
   */
  private async createOrder() {
    const loading = await this.loadingController.create({
      message: 'Creando pedido...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      if (!this.cart) {
        throw new Error('Carrito no disponible');
      }

      // Crear el pedido (pasando el teléfono si está disponible)
      const order = await this.orderService.createOrderFromCart(
        this.cart,
        {
          includeDelivery: this.includeDelivery,
          deliveryCost: this.deliveryCost,
          selectedDistance: this.selectedDistance || undefined
        },
        undefined, // paymentMethod
        undefined, // notes
        this.customerPhone // phone number
      );

      await loading.dismiss();

      // Limpiar el carrito
      await this.cartService.clearCart();
      
      // Resetear opciones de delivery
      this.includeDelivery = false;
      this.selectedDistance = null;
      this.deliveryCost = 0;
      this.customerPhone = undefined;

      // Mostrar mensaje de éxito
      await this.showToast('¡Pedido creado exitosamente!', 'success');

      // Navegar a la página de pedidos con el ID del pedido nuevo
      this.router.navigate(['/tabs/orders'], { 
        queryParams: { pendingOrderId: order.id }
      });

    } catch (error) {
      await loading.dismiss();
      console.error('Error creando pedido:', error);
      await this.showToast('Error al crear el pedido. Intenta nuevamente.', 'danger');
    }
  }

  // Métodos para cálculos de delivery y IGV
  onDeliveryChange() {
    if (!this.includeDelivery) {
      this.selectedDistance = null;
      this.deliveryCost = 0;
    }
  }

  calculateDeliveryCost() {
    if (!this.selectedDistance) {
      this.deliveryCost = 0;
      return;
    }

    switch (this.selectedDistance) {
      case 'near':
        this.deliveryCost = 5;
        break;
      case 'medium':
        this.deliveryCost = 10;
        break;
      case 'far':
        this.deliveryCost = 15;
        break;
      default:
        this.deliveryCost = 0;
    }
  }

  getSubtotalWithoutIGV(): number {
    if (!this.cart) return 0;
    // El subtotal actual incluye IGV, lo dividimos entre 1.18 para obtener el valor sin IGV
    return this.cart.subtotal / 1.18;
  }

  getIGVAmount(): number {
    if (!this.cart) return 0;
    // IGV es el 18% del subtotal sin IGV
    return this.getSubtotalWithoutIGV() * 0.18;
  }

  getFinalTotal(): number {
    if (!this.cart) return 0;
    let total = this.cart.subtotal;
    
    // Agregar delivery si está incluido
    if (this.includeDelivery) {
      total += this.deliveryCost;
    }
    
    // Restar descuento si existe
    if (this.cart.discount) {
      total -= this.cart.discount;
    }
    
    return total;
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
