import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController, ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Product, ProductCategory, CreateProductRequest, UpdateProductRequest } from '../models/product.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class AdminPage implements OnInit, OnDestroy {
  products: Product[] = [];
  categories: ProductCategory[] = [];
  filteredProducts: Product[] = [];
  
  // Estados de UI
  loading = false;
  isAdmin = false;
  selectedCategory = 'all';
  searchTerm = '';
  
  // Formulario de producto
  showProductForm = false;
  editingProduct: Product | null = null;
  productForm = {
    name: '',
    description: '',
    shortDescription: '',
    price: 0,
    categoryId: '',
    category: '',
    ingredients: [] as string[],
    nutritionalInfo: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0
    },
    allergens: [] as string[],
    isAvailable: true,
    available: true,
    featured: false,
    preparationTime: 0,
    servingSize: '',
    imageUrl: '',
    images: [] as string[]
  };
  
  // Ingredientes y alérgenos disponibles
  availableIngredients = [
    'Harina', 'Azúcar', 'Huevos', 'Mantequilla', 'Leche', 'Chocolate', 'Vainilla', 
    'Fresas', 'Crema', 'Coco', 'Almendras', 'Nueces', 'Canela', 'Miel'
  ];
  
  availableAllergens = [
    'Gluten', 'Lácteos', 'Huevos', 'Frutos secos', 'Soja', 'Pescado', 'Mariscos'
  ];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  async ngOnInit() {
    await this.checkAdminAccess();
    if (this.isAdmin) {
      await this.loadData();
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private async checkAdminAccess() {
    try {
      const currentUser = await this.authService.getCurrentUser();
      if (currentUser) {
        this.isAdmin = await this.userService.isAdmin(currentUser.uid);
        if (!this.isAdmin) {
          await this.showToast('Acceso denegado. Se requieren permisos de administrador.', 'danger');
          this.router.navigate(['/catalog']);
        }
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error verificando acceso de admin:', error);
      this.router.navigate(['/catalog']);
    }
  }

  private async loadData() {
    const loading = await this.loadingController.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      // Cargar productos y categorías en paralelo
      const [products, categories] = await Promise.all([
        this.productService.getAllProducts(),
        this.productService.getCategories()
      ]);

      this.products = products || [];
      this.categories = categories || [];
      this.filteredProducts = [...this.products];
      
    } catch (error) {
      console.error('Error cargando datos:', error);
      await this.showToast('Error al cargar los datos', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  // Filtrado y búsqueda
  onSearchChange(event: any) {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.filterProducts();
  }

  onCategoryChange(category: string | undefined) {
    this.selectedCategory = category || 'all';
    this.filterProducts();
  }

  private filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = !this.searchTerm || 
        product.name.toLowerCase().includes(this.searchTerm) ||
        product.description.toLowerCase().includes(this.searchTerm);
      
      const matchesCategory = this.selectedCategory === 'all' || 
        product.category.id === this.selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }

  // Gestión de productos
  openProductForm(product?: Product) {
    if (product) {
      this.editingProduct = product;
      this.productForm = {
        name: product.name,
        description: product.description,
        shortDescription: product.shortDescription || '',
        price: product.price,
        categoryId: product.categoryId || product.category?.id || '',
        category: product.category?.name || '',
        ingredients: product.ingredients ? [...product.ingredients] : [],
        nutritionalInfo: {
          calories: product.nutritionalInfo?.calories || 0,
          protein: product.nutritionalInfo?.protein || 0,
          carbs: product.nutritionalInfo?.carbs || 0,
          fat: product.nutritionalInfo?.fat || 0,
          sugar: product.nutritionalInfo?.sugar || 0
        },
        allergens: product.allergens ? [...product.allergens] : [],
        isAvailable: product.isAvailable,
        available: product.isAvailable,
        featured: product.featured || false,
        preparationTime: product.preparationTime || 0,
        servingSize: product.servingSize || '',
        imageUrl: product.imageUrl || '',
        images: product.images ? [...product.images] : []
      };
    } else {
      this.editingProduct = null;
      this.resetProductForm();
    }
    this.showProductForm = true;
  }

  closeProductForm() {
    this.showProductForm = false;
    this.editingProduct = null;
    this.resetProductForm();
  }

  private resetProductForm() {
    this.productForm = {
      name: '',
      description: '',
      shortDescription: '',
      price: 0,
      categoryId: this.categories[0]?.id || '',
      category: this.categories[0]?.name || '',
      ingredients: [],
      nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0 },
      allergens: [],
      isAvailable: true,
      available: true,
      featured: false,
      preparationTime: 0,
      servingSize: '',
      imageUrl: '',
      images: []
    };
  }

  async saveProduct() {
    if (!this.validateProductForm()) {
      return;
    }

    const loading = await this.loadingController.create({
      message: this.editingProduct ? 'Actualizando producto...' : 'Creando producto...'
    });
    await loading.present();

    try {
      const currentUser = await this.authService.getCurrentUser();
      if (!currentUser) {
        await this.showToast('Error: Usuario no autenticado', 'danger');
        return;
      }

      if (this.editingProduct) {
        // Actualizar producto existente
        const updateRequest: UpdateProductRequest = {
          name: this.productForm.name,
          description: this.productForm.description,
          price: this.productForm.price,
          categoryId: this.productForm.categoryId,
          isAvailable: this.productForm.isAvailable,
          ingredients: this.productForm.ingredients,
          allergens: this.productForm.allergens,
          nutritionalInfo: this.productForm.nutritionalInfo,
          imageUrl: this.productForm.imageUrl
        };
        await this.productService.updateProduct(this.editingProduct.id, updateRequest);
        await this.showToast('Producto actualizado correctamente', 'success');
      } else {
        // Crear nuevo producto
        const createRequest: CreateProductRequest = {
          name: this.productForm.name,
          description: this.productForm.description,
          price: this.productForm.price,
          categoryId: this.productForm.categoryId,
          ingredients: this.productForm.ingredients,
          allergens: this.productForm.allergens,
          nutritionalInfo: this.productForm.nutritionalInfo,
          imageUrl: this.productForm.imageUrl
        };
        await this.productService.createProduct(createRequest, currentUser.uid);
        await this.showToast('Producto creado correctamente', 'success');
      }

      this.closeProductForm();
      await this.loadData();
      
    } catch (error) {
      console.error('Error guardando producto:', error);
      await this.showToast('Error al guardar el producto', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  private validateProductForm(): boolean {
    if (!this.productForm.name.trim()) {
      this.showToast('El nombre del producto es obligatorio', 'warning');
      return false;
    }
    
    if (!this.productForm.description.trim()) {
      this.showToast('La descripción del producto es obligatoria', 'warning');
      return false;
    }
    
    if (this.productForm.price <= 0) {
      this.showToast('El precio debe ser mayor a 0', 'warning');
      return false;
    }
    
    if (!this.productForm.categoryId) {
      this.showToast('Seleccione una categoría', 'warning');
      return false;
    }
    
    return true;
  }

  async deleteProduct(product: Product) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de que quieres eliminar "${product.name}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.performDeleteProduct(product);
          }
        }
      ]
    });

    await alert.present();
  }

  private async performDeleteProduct(product: Product) {
    const loading = await this.loadingController.create({
      message: 'Eliminando producto...'
    });
    await loading.present();

    try {
      await this.productService.deleteProduct(product.id);
      await this.showToast('Producto eliminado correctamente', 'success');
      await this.loadData();
    } catch (error) {
      console.error('Error eliminando producto:', error);
      await this.showToast('Error al eliminar el producto', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async toggleProductAvailability(product: Product) {
    try {
      const updateRequest: UpdateProductRequest = {
        isAvailable: !product.isAvailable
      };
      
      await this.productService.updateProduct(product.id, updateRequest);
      product.isAvailable = !product.isAvailable;
      
      const status = product.isAvailable ? 'disponible' : 'no disponible';
      await this.showToast(`Producto marcado como ${status}`, 'success');
      
    } catch (error) {
      console.error('Error actualizando disponibilidad:', error);
      await this.showToast('Error al actualizar la disponibilidad', 'danger');
    }
  }

  // Gestión de imágenes
  async addProductImage() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Agregar imagen',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera',
          handler: () => {
            this.takePhoto();
          }
        },
        {
          text: 'Seleccionar de galería',
          icon: 'images',
          handler: () => {
            this.selectFromGallery();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  private async takePhoto() {
    try {
      // TODO: Implementar toma de foto
      const imageUrl = 'https://via.placeholder.com/300x200.png?text=Producto';
      this.productForm.imageUrl = imageUrl;
      await this.showToast('Imagen agregada temporalmente', 'success');
    } catch (error) {
      console.error('Error tomando foto:', error);
      await this.showToast('Error al tomar la foto', 'danger');
    }
  }

  private async selectFromGallery() {
    // Implementar selección de galería si es necesario
    await this.showToast('Función de galería en desarrollo', 'warning');
  }

  private async uploadProductImage(photo: any): Promise<string> {
    const loading = await this.loadingController.create({
      message: 'Subiendo imagen...'
    });
    await loading.present();

    try {
      // Aquí se subiría la imagen a Firebase Storage
      // Por ahora retornamos una URL de placeholder
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular carga
      return 'https://via.placeholder.com/300x200.png?text=Producto';
    } catch (error) {
      throw error;
    } finally {
      await loading.dismiss();
    }
  }

  removeProductImage(index?: number) {
    if (index !== undefined && this.productForm.images.length > index) {
      this.productForm.images.splice(index, 1);
    } else {
      this.productForm.imageUrl = '';
    }
  }

  // Gestión de ingredientes y alérgenos
  toggleIngredient(ingredient: string) {
    const index = this.productForm.ingredients.indexOf(ingredient);
    if (index > -1) {
      this.productForm.ingredients.splice(index, 1);
    } else {
      this.productForm.ingredients.push(ingredient);
    }
  }

  toggleAllergen(allergen: string) {
    const index = this.productForm.allergens.indexOf(allergen);
    if (index > -1) {
      this.productForm.allergens.splice(index, 1);
    } else {
      this.productForm.allergens.push(allergen);
    }
  }

  // Navegación
  goBack() {
    this.router.navigate(['/catalog']);
  }

  // Utilidades
  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'success') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'bottom'
    });
    await toast.present();
  }

  async doRefresh(event: any) {
    try {
      await this.loadData();
    } finally {
      event.target.complete();
    }
  }

  // Métodos adicionales para las estadísticas
  getAvailableProductsCount(): number {
    return this.filteredProducts.filter(product => product.isAvailable).length;
  }

  getUnavailableProductsCount(): number {
    return this.filteredProducts.filter(product => !product.isAvailable).length;
  }
}