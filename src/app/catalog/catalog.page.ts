import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  IonContent, 
  IonHeader, 
  IonTitle, 
  IonToolbar,
  IonButtons,
  IonCard,
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
  LoadingController,
  ModalController
} from '@ionic/angular/standalone';
import { ProductService } from '../services/product.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user';
import { FavoritesService } from '../services/favorites.service';
import { CartService } from '../services/cart.service';
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
  list,
  eye,
  checkmark
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
    IonButtons,
    IonCard,
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
export class CatalogPage implements OnInit, ViewWillEnter {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: ProductCategory[] = [];
  isLoading = true;
  isAdmin = false;
  selectedCategory = 'all';
  searchTerm = '';
  viewMode: 'grid' | 'list' = 'grid';
  showOnlyFavorites = false;

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private modalController: ModalController,
    private favoritesService: FavoritesService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
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
      list,
      eye,
      checkmark
    });
  }

  async ngOnInit() {
    // Cargar favoritos del usuario
    await this.favoritesService.loadUserFavorites();
    await this.checkAdminStatus();
  }

  async ionViewWillEnter() {
    // Verificar si viene con parámetro de favoritos
    const snapshot = this.activatedRoute.snapshot;
    const showFavoritesParam = snapshot.queryParams['showFavorites'];
    
    // Solo activar filtro de favoritos si viene explícitamente en la URL
    if (showFavoritesParam === 'true') {
      this.showOnlyFavorites = true;
    } else {
      // Resetear a mostrar todos los productos
      this.showOnlyFavorites = false;
    }
    
    // Forzar detección de cambios para actualizar el botón visual
    this.cdr.detectChanges();
    
    await this.loadData();
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
      console.error('Error cargando datos del catálogo:', error);
      await this.showToast('Error al cargar el catálogo. Verifique su conexión.', 'danger');
      
      this.categories = [];
      this.products = [];
      this.filteredProducts = [];
    } finally {
      this.isLoading = false;
    }
  }

  async checkAdminStatus() {
    try {
      console.log('CatalogPage: Verificando status de admin...');
      
      // Verificar si está logueado
      const isLoggedIn = this.authService.isLoggedIn();
      console.log('CatalogPage: isLoggedIn =', isLoggedIn);
      
      if (!isLoggedIn) {
        console.log('CatalogPage: No está logueado, isAdmin = false');
        this.isAdmin = false;
        return;
      }

      const currentUser = this.authService.getCurrentUser();
      console.log('CatalogPage: currentUser =', currentUser);
      
      // Si es un usuario de Firebase, verificar por email y UID
      if (currentUser) {
        console.log('CatalogPage: Usuario Firebase encontrado, email:', currentUser.email);
        
        // Verificar por email primero
        if (currentUser.email) {
          const isAdminByEmail = this.userService.isAdminEmail(currentUser.email);
          console.log('CatalogPage: Admin por email =', isAdminByEmail);
          
          if (isAdminByEmail) {
            this.isAdmin = true;
            return;
          }
        }
        
        // Verificar por UID como respaldo
        this.isAdmin = await this.userService.isAdmin(currentUser.uid);
        console.log('CatalogPage: Admin por UID =', this.isAdmin);
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

    // Filtrar por favoritos si está activo
    if (this.showOnlyFavorites) {
      filtered = filtered.filter(product => 
        this.favoritesService.isFavorite(product.id)
      );
    }

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

  toggleFavoritesFilter() {
    this.showOnlyFavorites = !this.showOnlyFavorites;
    this.filterProducts();
  }

  clearSearch() {
    this.searchTerm = '';
    this.selectedCategory = 'all';
    this.filterProducts();
  }

  async addToCart(product: Product) {
    try {
      
      const success = await this.cartService.addToCart(product, 1);
      
      if (success) {
        await this.showToast(`✅ ${product.name} agregado al carrito`, 'success');
        
        // Agregar pequeña vibración si está disponible
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      } else {
        await this.showToast(`❌ Error agregando ${product.name} al carrito`, 'danger');
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      await this.showToast('Error al agregar al carrito. Intente nuevamente.', 'danger');
    }
  }

  async toggleFavorite(product: Product) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        await this.showToast('Debe iniciar sesión para agregar favoritos', 'warning');
        return;
      }

      const isFavorite = await this.favoritesService.toggleFavorite(product);
      
      if (isFavorite) {
        await this.showToast(`❤️ ${product.name} agregado a favoritos`, 'success');
      } else {
        await this.showToast(`💔 ${product.name} eliminado de favoritos`, 'success');
      }
      
      if ('vibrate' in navigator) {
        navigator.vibrate(30);
      }
    } catch (error) {
      console.error('Error con favoritos:', error);
      await this.showToast('Error al gestionar favoritos. Intente nuevamente.', 'danger');
    }
  }

  isFavorite(productId: string): boolean {
    return this.favoritesService.isFavorite(productId);
  }

  isInCart(productId: string): boolean {
    return this.cartService.isInCart(productId);
  }

  getCartQuantity(productId: string): number {
    return this.cartService.getProductQuantityInCart(productId);
  }

  async viewProductDetails(product: Product) {
    try {
      const { ProductDetailsModalComponent } = await import('../components/product-details-modal.component');
      
      const modal = await this.modalController.create({
        component: ProductDetailsModalComponent,
        componentProps: {
          product: product
        },
        breakpoints: [0, 0.3, 0.7, 1],
        initialBreakpoint: 0.7
      });

      await modal.present();
      await modal.onDidDismiss();
      
    } catch (error) {
      console.error('Error abriendo modal de detalles:', error);
      await this.showToast('Error al cargar los detalles del producto', 'danger');
    }
  }

  goToAdminPanel() {
    this.router.navigate(['/admin']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
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
