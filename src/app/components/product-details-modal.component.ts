import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonButtons,
  IonIcon,
  IonImg,
  IonChip,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonList,
  ModalController,
  ToastController
} from '@ionic/angular/standalone';
import { Product } from '../models/product.model';
import { FavoritesService } from '../services/favorites.service';
import { CartService } from '../services/cart.service';
import { AuthService } from '../services/auth.service';
import { addIcons } from 'ionicons';
import { 
  close, 
  time, 
  people, 
  pricetag, 
  restaurant, 
  checkmarkCircle,
  alertCircle,
  add,
  heart,
  heartOutline,
  checkmark
} from 'ionicons/icons';

@Component({
  selector: 'app-product-details-modal',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>{{ product.name }}</ion-title>
        <ion-buttons slot="end">
          <ion-button fill="clear" (click)="dismiss()">
            <ion-icon name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div *ngIf="product">
        <!-- Imagen del producto -->
        <div class="product-image-section">
          <ion-img 
            [src]="product.imageUrl || 'assets/placeholder-product.jpg'" 
            [alt]="product.name"
            class="detail-product-image">
          </ion-img>
        </div>

        <!-- Información básica -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>{{ product.name }}</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="price-section">
              <h2 class="price">{{ formatPrice(product.price) }}</h2>
              <ion-chip 
                [color]="product.isAvailable ? 'success' : 'danger'"
                class="availability-chip">
                <ion-icon 
                  [name]="product.isAvailable ? 'checkmark-circle' : 'alert-circle'"
                  slot="start">
                </ion-icon>
                <ion-label>{{ product.isAvailable ? 'Disponible' : 'No disponible' }}</ion-label>
              </ion-chip>
            </div>
            
            <p class="description">{{ product.description }}</p>
            
            <div class="product-info-grid">
              <!-- Categoría -->
              <ion-item lines="none" class="info-item">
                <ion-icon name="restaurant" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h3>Categoría</h3>
                  <p>{{ product.category.name || 'Sin categoría' }}</p>
                </ion-label>
              </ion-item>

              <!-- Tiempo de preparación -->
              <ion-item lines="none" class="info-item" *ngIf="product.preparationTime">
                <ion-icon name="time" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h3>Tiempo de preparación</h3>
                  <p>{{ product.preparationTime }} minutos</p>
                </ion-label>
              </ion-item>

              <!-- Tamaño de porción -->
              <ion-item lines="none" class="info-item" *ngIf="product.servingSize">
                <ion-icon name="people" slot="start" color="primary"></ion-icon>
                <ion-label>
                  <h3>Tamaño de porción</h3>
                  <p>{{ product.servingSize }} personas</p>
                </ion-label>
              </ion-item>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Ingredientes -->
        <ion-card *ngIf="product.ingredients && product.ingredients.length > 0">
          <ion-card-header>
            <ion-card-title>Ingredientes</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="ingredients-list">
              <ion-chip 
                *ngFor="let ingredient of product.ingredients" 
                color="tertiary"
                class="ingredient-chip">
                {{ ingredient }}
              </ion-chip>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Alérgenos -->
        <ion-card *ngIf="product.allergens && product.allergens.length > 0">
          <ion-card-header>
            <ion-card-title>Alérgenos</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="allergens-list">
              <ion-chip 
                *ngFor="let allergen of product.allergens" 
                color="warning"
                class="allergen-chip">
                <ion-icon name="alert-circle" slot="start"></ion-icon>
                {{ allergen }}
              </ion-chip>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Información nutricional -->
        <ion-card *ngIf="product.nutritionalInfo">
          <ion-card-header>
            <ion-card-title>Información Nutricional</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item *ngIf="product.nutritionalInfo.calories">
                <ion-label>
                  <h3>Calorías</h3>
                  <p>{{ product.nutritionalInfo.calories }} kcal</p>
                </ion-label>
              </ion-item>
              <ion-item *ngIf="product.nutritionalInfo.protein">
                <ion-label>
                  <h3>Proteínas</h3>
                  <p>{{ product.nutritionalInfo.protein }}g</p>
                </ion-label>
              </ion-item>
              <ion-item *ngIf="product.nutritionalInfo.carbs">
                <ion-label>
                  <h3>Carbohidratos</h3>
                  <p>{{ product.nutritionalInfo.carbs }}g</p>
                </ion-label>
              </ion-item>
              <ion-item *ngIf="product.nutritionalInfo.fat">
                <ion-label>
                  <h3>Grasas</h3>
                  <p>{{ product.nutritionalInfo.fat }}g</p>
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Botones de acción -->
        <div class="action-buttons-section">
          <ion-button 
            expand="block" 
            size="large"
            [color]="isInCart() ? 'success' : 'primary'"
            [disabled]="!product.isAvailable"
            (click)="addToCart()">
            <ion-icon [name]="isInCart() ? 'checkmark' : 'add'" slot="start"></ion-icon>
            {{ isInCart() ? 'En carrito (' + getCartQuantity() + ')' : 'Agregar al carrito' }}
          </ion-button>
          
          <ion-button 
            expand="block" 
            fill="outline"
            size="large"
            [color]="isFavorite() ? 'danger' : 'medium'"
            (click)="toggleFavorite()">
            <ion-icon [name]="isFavorite() ? 'heart' : 'heart-outline'" slot="start"></ion-icon>
            {{ isFavorite() ? 'Eliminar de favoritos' : 'Agregar a favoritos' }}
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .product-image-section {
      text-align: center;
      margin-bottom: 16px;
    }

    .detail-product-image {
      width: 100%;
      max-width: 300px;
      height: 200px;
      object-fit: cover;
      border-radius: 8px;
      margin: 0 auto;
    }

    .price-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .price {
      font-size: 1.8em;
      font-weight: bold;
      color: var(--ion-color-primary);
      margin: 0;
    }

    .availability-chip {
      margin: 0;
    }

    .description {
      font-size: 1em;
      line-height: 1.5;
      color: var(--ion-color-medium);
      margin-bottom: 16px;
    }

    .product-info-grid {
      margin-top: 16px;
    }

    .info-item {
      --padding-start: 0;
      --inner-padding-end: 0;
      margin-bottom: 8px;
    }

    .ingredients-list,
    .allergens-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .ingredient-chip,
    .allergen-chip {
      margin: 0;
    }

    .action-buttons-section {
      padding: 16px 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    ion-card {
      margin: 16px 0;
    }

    ion-card-title {
      font-size: 1.2em;
      font-weight: 600;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, 
    IonHeader, 
    IonTitle, 
    IonToolbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonImg,
    IonChip,
    IonLabel,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonItem,
    IonList
  ]
})
export class ProductDetailsModalComponent {
  @Input() product!: Product;

  constructor(
    private modalController: ModalController,
    private favoritesService: FavoritesService,
    private cartService: CartService,
    private authService: AuthService,
    private toastController: ToastController
  ) {
    addIcons({
      close,
      time,
      people,
      pricetag,
      restaurant,
      checkmarkCircle,
      alertCircle,
      add,
      heart,
      heartOutline,
      checkmark
    });
  }

  dismiss() {
    this.modalController.dismiss();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0
    }).format(price);
  }

  async addToCart() {
    try {
      console.log('Agregando al carrito desde modal:', this.product.name);
      
      const success = await this.cartService.addToCart(this.product, 1);
      
      if (success) {
        await this.showToast(`✅ ${this.product.name} agregado al carrito`, 'success');
      } else {
        await this.showToast(`❌ Error agregando ${this.product.name} al carrito`, 'danger');
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      await this.showToast('Error al agregar al carrito. Intente nuevamente.', 'danger');
    }
  }

  async toggleFavorite() {
    try {
      console.log('Toggle favorito desde modal:', this.product.name);
      
      const user = this.authService.getCurrentUser();
      if (!user) {
        await this.showToast('Debe iniciar sesión para agregar favoritos', 'warning');
        return;
      }

      const isFavorite = await this.favoritesService.toggleFavorite(this.product);
      
      if (isFavorite) {
        await this.showToast(`❤️ ${this.product.name} agregado a favoritos`, 'success');
      } else {
        await this.showToast(`💔 ${this.product.name} eliminado de favoritos`, 'success');
      }
    } catch (error) {
      console.error('Error con favoritos:', error);
      await this.showToast('Error al gestionar favoritos. Intente nuevamente.', 'danger');
    }
  }

  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product.id);
  }

  isInCart(): boolean {
    return this.cartService.isInCart(this.product.id);
  }

  getCartQuantity(): number {
    return this.cartService.getProductQuantityInCart(this.product.id);
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