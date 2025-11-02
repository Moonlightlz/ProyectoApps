import { Component, OnInit } from '@angular/core';
import { 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButton, 
  IonCard, 
  IonCardHeader, 
  IonCardTitle, 
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonSpinner,
  IonBadge,
  ModalController,
  ViewWillEnter
} from '@ionic/angular/standalone';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
import { Product } from '../models/product.model';
import { ProductDetailsModalComponent } from '../components/product-details-modal.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton, 
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
    IonList, IonItem, IonLabel, IonGrid, IonRow, IonCol, IonIcon,
    IonSpinner, IonBadge,
    CommonModule, RouterModule
  ],
})
export class Tab1Page implements OnInit, ViewWillEnter {
  featuredProducts: Product[] = [];
  loading = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    // La carga inicial se hace en ionViewWillEnter
  }

  /**
   * Se ejecuta cada vez que se va a mostrar la página.
   * Esto asegura que los productos destacados se actualicen cuando vuelvas a la pestaña.
   */
  ionViewWillEnter() {
    this.loadFeaturedProducts();
  }

  /**
   * Carga los productos destacados desde Firestore.
   */
  async loadFeaturedProducts() {
    this.loading = true;
    try {
      console.log('🔍 Cargando productos destacados...');
      this.featuredProducts = await this.productService.getFeaturedProducts();
      console.log('✅ Productos destacados cargados:', this.featuredProducts.length);
      console.log('📦 Productos:', this.featuredProducts);
    } catch (error) {
      console.error('❌ Error cargando productos destacados:', error);
    } finally {
      this.loading = false;
    }
  }

  /**
   * Abre el modal con los detalles de un producto.
   */
  async openProductDetails(product: Product) {
    const modal = await this.modalController.create({
      component: ProductDetailsModalComponent,
      componentProps: { product }
    });
    await modal.present();
  }

  /**
   * Agrega un producto al carrito directamente.
   */
  addToCart(product: Product, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(product);
  }
}
