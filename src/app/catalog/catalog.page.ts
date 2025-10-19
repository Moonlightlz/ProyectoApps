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
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonImg,
  IonChip,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonFab,
  IonFabButton,
  ToastController,
  LoadingController
} from '@ionic/angular/standalone';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user';
import { Product, ProductCategory } from '../models/product.model';
import { UserRole } from '../models/user.model';
import { addIcons } from 'ionicons';
import { 
  search, 
  pricetag, 
  heart, 
  heartOutline, 
  add, 
  settings,
  funnel,
  grid,
  list
} from 'ionicons/icons';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
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
    IonIcon,
    IonImg,
    IonChip,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonGrid,
    IonRow,
    IonCol,
    IonSearchbar,
    IonRefresher,
    IonRefresherContent,
    IonSkeletonText,
    IonFab,
    IonFabButton,
    CommonModule, 
    FormsModule
  ]
})
export class CatalogPage implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: ProductCategory[] = [];
  isLoading = true;
  isAdmin = false;
  selectedCategory = 'all';
  searchTerm = '';
  viewMode: 'grid' | 'list' = 'grid';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) {
    addIcons({
      search,
      pricetag,
      heart,
      heartOutline,
      add,
      settings,
      funnel,
      grid,
      list
    });
  }

  async ngOnInit() {
    await this.loadData();
    await this.checkAdminStatus();
  }

  async loadData() {
    try {
      this.isLoading = true;
      
      // Cargar categorías y productos en paralelo
      const [categories, products] = await Promise.all([
        this.productService.getActiveCategories(),
        this.productService.getAvailableProducts()
      ]);
      
      this.categories = categories;
      this.products = products;
      this.filteredProducts = products;
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      await this.showToast('Error al cargar el catálogo', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async checkAdminStatus() {
    try {
      // Verificar si está logueado
      if (!this.authService.isLoggedIn()) {
        this.isAdmin = false;
        return;
      }

      const currentUser = this.authService.getCurrentUser();
      
      // Si es un usuario de Firebase, verificar por UID
      if (currentUser) {
        this.isAdmin = await this.userService.isAdmin(currentUser.uid);
        return;
      }

      // Si es un usuario demo (credenciales de prueba)
      const username = localStorage.getItem('username');
      this.isAdmin = username === 'admin';
      
    } catch (error) {
      console.error('Error verificando status de admin:', error);
      this.isAdmin = false;
    }
  }

  async doRefresh(event: any) {
    await this.loadData();
    event.target.complete();
  }

  onCategoryChange(event: any) {
    this.selectedCategory = event.detail.value;
    this.filterProducts();
  }

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value;
    this.filterProducts();
  }

  filterProducts() {
    let filtered = this.products;

    // Filtrar por categoría
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category.id === this.selectedCategory
      );
    }

    // Filtrar por búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term) ||
        product.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(term)
        )
      );
    }

    this.filteredProducts = filtered;
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  async addToCart(product: Product) {
    // TODO: Implementar lógica del carrito
    await this.showToast(`${product.name} agregado al carrito`, 'success');
  }

  async toggleFavorite(product: Product) {
    // TODO: Implementar lógica de favoritos
    await this.showToast(`${product.name} agregado a favoritos`, 'success');
  }

  viewProductDetails(product: Product) {
    // TODO: Navegar a página de detalles del producto
    console.log('Ver detalles de:', product.name);
  }

  goToAdminPanel() {
    this.router.navigate(['/admin']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
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
