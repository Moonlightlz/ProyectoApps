import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController, ToastController, ActionSheetController, IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProductService } from '../services/product.service';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { PhotoService } from '../services/photo';
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
    private photoService: PhotoService,
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
      if (!this.authService.isLoggedIn()) {
        await this.showToast('Debes iniciar sesión para acceder.', 'danger');
        this.router.navigate(['/login']);
        return;
      }

      const currentUser = this.authService.getCurrentUser();
      
      if (currentUser) {
        if (currentUser.email) {
          const isAdminByEmail = this.userService.isAdminEmail(currentUser.email);
          if (isAdminByEmail) {
            this.isAdmin = true;
            return;
          }
        }
        
        this.isAdmin = await this.userService.isAdmin(currentUser.uid);
        
        if (!this.isAdmin) {
          await this.showToast('Acceso denegado. Se requieren permisos de administrador.', 'danger');
          this.router.navigate(['/tabs/catalog']);
          return;
        }
        return;
      }

      const username = localStorage.getItem('username');
      const isLoggedInFlag = localStorage.getItem('isLoggedIn');
      
      if (username === 'admin' && isLoggedInFlag === 'true') {
        this.isAdmin = true;
        return;
      }

      await this.showToast('Acceso denegado. Se requieren permisos de administrador.', 'danger');
      this.router.navigate(['/tabs/catalog']);
      
    } catch (error) {
      await this.showToast('Error verificando permisos de administrador.', 'danger');
      this.router.navigate(['/tabs/catalog']);
    }
  }

  private async loadData() {
    const loading = await this.loadingController.create({
      message: 'Cargando productos...'
    });
    await loading.present();

    try {
      // Limpiar datos existentes para evitar acumulación
      this.products = [];
      this.categories = [];
      this.filteredProducts = [];
      
      // Cargar productos y categorías en paralelo
      const [products, categories] = await Promise.all([
        this.productService.getAllProducts(),
        this.productService.getCategories()
      ]);

      this.products = products || [];
      
      // Limpiar categorías existentes y crear conjunto único
      const rawCategories = categories || [];
      const uniqueCategoryMap = new Map();
      
      // Usar Map para garantizar unicidad por ID
      rawCategories.forEach(category => {
        if (category && category.id) {
          uniqueCategoryMap.set(category.id, category);
        }
      });
      
      // Convertir Map a array
      this.categories = Array.from(uniqueCategoryMap.values());
      this.filteredProducts = [...this.products];
      
    } catch (error) {
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

  // Filtro de categorías (para la lista de productos)
  onCategoryFilterChange(category: string | undefined) {
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
      categoryId: '',
      category: '',
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
        await loading.dismiss();
        await this.showToast('Error: Usuario no autenticado', 'danger');
        return;
      }

      // Procesar imagen si es dataUrl
      let processedImageUrl = this.productForm.imageUrl;
      if (this.productForm.imageUrl && this.productForm.imageUrl.startsWith('data:')) {
        try {
          const tempProductId = this.editingProduct?.id || Date.now().toString();
          const uploadedUrl = await this.productService.uploadProductImage(this.productForm.imageUrl, tempProductId);
          if (uploadedUrl) {
            processedImageUrl = uploadedUrl;
          }
        } catch (error) {
          // Continuar con dataUrl como fallback
        }
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
          imageUrl: processedImageUrl
        };
        await this.productService.updateProduct(this.editingProduct.id, updateRequest);
        await this.showToast('Producto actualizado correctamente', 'success');
        await loading.dismiss();
        this.closeProductForm();
        await this.loadData();
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
          imageUrl: processedImageUrl
        };
        const productId = await this.productService.createProduct(createRequest, currentUser.uid);
        
        if (productId) {
          await this.showToast('Producto creado correctamente', 'success');
          await loading.dismiss();
          this.closeProductForm();
          await this.loadData();
        } else {
          await loading.dismiss();
          await this.showToast('Error al crear el producto', 'danger');
          return;
        }
      }
      
    } catch (error) {
      await loading.dismiss();
      await this.showToast('Error al guardar el producto', 'danger');
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
    await this.selectPhotoSource();
  }

  // Función simplificada usando metodología del registro
  private async takePhoto() {
    await this.selectPhotoSource();
  }

  async selectPhotoSource() {
    try {
      const alert = await this.alertController.create({
        header: 'Seleccionar foto',
        message: '¿Cómo deseas agregar la foto del producto?',
        buttons: [
          {
            text: 'Cámara',
            handler: () => this.takePhotoFromCamera()
          },
          {
            text: 'Galería',
            handler: () => this.takePhotoFromGallery()
          },
          {
            text: 'Cancelar',
            role: 'cancel'
          }
        ]
      });
      await alert.present();
    } catch (error) {
      await this.showToast('Error al acceder a las opciones de foto', 'danger');
    }
  }



  // Función eliminada - ahora la subida se hace en saveProduct() igual que en el registro






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
    this.router.navigate(['/tabs/catalog']);
  }

  goToCatalog() {
    this.showToast('Navegando al catálogo...', 'success');
    this.router.navigate(['/tabs/catalog']);
  }

  // Utilidades
  getCategoryName(categoryId: string | undefined): string {
    if (!categoryId) return '';
    const category = this.categories.find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  }

  getProductsCountByCategory(categoryId: string): number {
    return this.products.filter(product => product.categoryId === categoryId || product.category?.id === categoryId).length;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
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

  // Funciones para manejo de imágenes con cámara y galería
  


  /**
   * Tomar foto directamente con Capacitor (cámara o galería)
   */
  async takePhotoDirectly(source: 'camera' | 'gallery') {
    try {
      const sourceText = source === 'camera' ? 'cámara' : 'galería';
      
      const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
      
      const permissions = await Camera.requestPermissions();
      
      if (permissions.camera === 'granted') {
        
        const image = await Camera.getPhoto({
          quality: 80,
          allowEditing: true,
          resultType: CameraResultType.DataUrl,
          source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
          width: 800, // Redimensionar a 800px de ancho máximo
          height: 600 // Redimensionar a 600px de alto máximo
        });
        
        if (image.dataUrl) {
          const resizedImage = await this.resizeImage(image.dataUrl, 300, 300);
          this.addImageToForm(resizedImage);
          await this.showToast(`¡Imagen de ${sourceText} agregada exitosamente!`, 'success');
        } else {
          await this.showToast(`No se obtuvo imagen de ${sourceText}`, 'danger');
        }
      } else {
        await this.showToast('Permisos de cámara denegados', 'danger');
      }
      
    } catch (error) {
      await this.showToast('Error: ' + String(error), 'danger');
    }
  }

  /**
   * Redimensionar imagen para optimizar el tamaño de visualización
   */
  async resizeImage(dataUrl: string, maxWidth: number, maxHeight: number): Promise<string> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo aspecto
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Dibujar imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convertir a dataUrl con calidad optimizada
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(resizedDataUrl);
      };
      
      img.src = dataUrl;
    });
  }

  /**
   * Tomar foto con cámara (método simple como en registro)
   */
  async takePhotoFromCamera() {
    try {
      const photoUrl = await this.photoService.takePhoto({ source: 'camera' });
      if (photoUrl) {
        this.addImageToForm(photoUrl);
        await this.showToast('Foto agregada exitosamente', 'success');
      } else {
        await this.showToast('Error al capturar la foto', 'danger');
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      await this.showToast('Error al acceder a la cámara: ' + String(error), 'danger');
    }
  }

  /**
   * Seleccionar foto de galería (método simple como en registro)
   */
  async takePhotoFromGallery() {
    try {
      const photoUrl = await this.photoService.takePhoto({ source: 'gallery' });
      if (photoUrl) {
        this.addImageToForm(photoUrl);
        await this.showToast('Imagen agregada exitosamente', 'success');
      } else {
        await this.showToast('Error al seleccionar la foto', 'danger');
      }
    } catch (error) {
      console.error('Error al acceder a la galería:', error);
      await this.showToast('Error al acceder a la galería: ' + String(error), 'danger');
    }
  }

  // FUNCIONES ORIGINALES COMENTADAS - USAR LAS SIMPLES DE ARRIBA


  /**
   * Agregar imagen por URL
   */
  async addImageByURL() {
    const alert = await this.alertController.create({
      header: 'Agregar Imagen por URL',
      inputs: [
        {
          name: 'imageUrl',
          type: 'text',
          placeholder: 'https://ejemplo.com/imagen.jpg'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Agregar',
          handler: (data) => {
            if (data.imageUrl) {
              this.addImageToForm(data.imageUrl);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Agregar imagen al formulario
   */
  addImageToForm(imageUrl: string) {
    if (!this.productForm.images) {
      this.productForm.images = [];
    }
    
    // Si no hay imagen principal, establecer como imagen principal
    if (!this.productForm.imageUrl) {
      this.productForm.imageUrl = imageUrl;
    } else {
      // Si ya hay imagen principal, agregar a la lista de imágenes adicionales
      this.productForm.images.push(imageUrl);
    }
  }

  /**
   * Remover imagen principal
   */
  removeMainImage() {
    this.productForm.imageUrl = '';
    // Si hay imágenes adicionales, promover la primera a imagen principal
    if (this.productForm.images.length > 0) {
      this.productForm.imageUrl = this.productForm.images.shift() || '';
    }
  }

  // Nuevos métodos para funcionalidad del administrador

  /**
   * Abre el gestor de imágenes para un producto
   */
  async openImageManager(product: Product) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Gestionar Imagen',
      buttons: [
        {
          text: 'Cambiar Imagen',
          icon: 'camera',
          handler: () => {
            this.changeProductImage(product);
          }
        },
        {
          text: 'Ver Imagen Actual',
          icon: 'eye',
          handler: () => {
            this.viewProductImage(product);
          }
        },
        {
          text: 'Eliminar Imagen',
          icon: 'trash',
          role: 'destructive',
          handler: () => {
            this.removeProductImage(product);
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

  /**
   * Cambia la imagen de un producto
   */
  async changeProductImage(product: Product) {
    const alert = await this.alertController.create({
      header: 'Cambiar Imagen',
      message: 'Ingresa la nueva URL de la imagen',
      inputs: [
        {
          name: 'imageUrl',
          type: 'text',
          placeholder: 'https://ejemplo.com/imagen.jpg',
          value: product.imageUrl || ''
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.imageUrl) {
              await this.updateProductField(product, 'imageUrl', data.imageUrl);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Ver imagen del producto en tamaño completo
   */
  async viewProductImage(product: Product) {
    if (!product.imageUrl) {
      await this.showToast('Este producto no tiene imagen', 'warning');
      return;
    }
    
    const alert = await this.alertController.create({
      header: product.name,
      message: `<img src="${product.imageUrl}" style="width: 100%; max-width: 300px; height: auto;">`,
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  /**
   * Elimina la imagen de un producto
   */
  async removeProductImage(product: Product) {
    const alert = await this.alertController.create({
      header: 'Eliminar Imagen',
      message: '¿Estás seguro de que quieres eliminar la imagen de este producto?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.updateProductField(product, 'imageUrl', '');
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Elimina una imagen del formulario por índice
   */
  removeFormImage(index: number) {
    if (index !== undefined && this.productForm.images.length > index) {
      this.productForm.images.splice(index, 1);
    } else {
      this.productForm.imageUrl = '';
    }
  }

  /**
   * Edita la información básica del producto (nombre y descripción)
   */
  async editProductInfo(product: Product) {
    const alert = await this.alertController.create({
      header: 'Editar Información',
      inputs: [
        {
          name: 'name',
          type: 'text',
          placeholder: 'Nombre del producto',
          value: product.name
        },
        {
          name: 'description',
          type: 'textarea',
          placeholder: 'Descripción del producto',
          value: product.description
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (data.name && data.description) {
              const updates: Partial<Product> = {
                name: data.name,
                description: data.description
              };
              await this.updateProductFields(product, updates);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Edita el precio del producto
   */
  async editPrice(product: Product) {
    const alert = await this.alertController.create({
      header: 'Editar Precio',
      message: 'Ingresa el nuevo precio del producto',
      inputs: [
        {
          name: 'price',
          type: 'number',
          placeholder: 'Precio en SOLES',
          value: product.price.toString()
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Guardar',
          handler: async (data) => {
            const price = parseFloat(data.price);
            if (price > 0) {
              await this.updateProductField(product, 'price', price);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Ver detalles completos del producto
   */
  async viewProductDetails(product: Product) {
    const alert = await this.alertController.create({
      header: product.name,
      message: `
        <div style="text-align: left;">
          <p><strong>Descripción:</strong> ${product.description || 'Sin descripción'}</p>
          <p><strong>Precio:</strong> ${this.formatPrice(product.price)}</p>
          <p><strong>Categoría:</strong> ${this.getCategoryName(product.categoryId)}</p>
          <p><strong>Disponible:</strong> ${product.isAvailable ? 'Sí' : 'No'}</p>
          ${product.preparationTime ? `<p><strong>Tiempo de preparación:</strong> ${product.preparationTime} min</p>` : ''}
          ${product.servingSize ? `<p><strong>Porciones:</strong> ${product.servingSize}</p>` : ''}
          ${product.ingredients?.length ? `<p><strong>Ingredientes:</strong> ${product.ingredients.join(', ')}</p>` : ''}
          ${product.allergens?.length ? `<p><strong>Alérgenos:</strong> ${product.allergens.join(', ')}</p>` : ''}
        </div>
      `,
      buttons: [
        {
          text: 'Editar',
          handler: () => {
            this.editProduct(product);
          }
        },
        {
          text: 'Cerrar'
        }
      ]
    });
    await alert.present();
  }

  /**
   * Abre el formulario de edición completa del producto
   */
  editProduct(product: Product) {
    this.openProductForm(product);
  }

  /**
   * Actualiza un campo específico del producto
   */
  async updateProductField(product: Product, field: keyof Product, value: any) {
    const loading = await this.loadingController.create({
      message: 'Actualizando producto...'
    });
    await loading.present();

    try {
      const updateData: any = { [field]: value };
      const success = await this.productService.updateProduct(product.id, updateData);
      
      if (success) {
        // Actualizar el producto local
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], [field]: value };
          this.filterProducts();
        }
        await this.showToast('Producto actualizado exitosamente');
      } else {
        await this.showToast('Error al actualizar producto', 'danger');
      }
    } catch (error) {
      console.error('Error updating product field:', error);
      await this.showToast('Error al actualizar producto', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Actualiza múltiples campos del producto
   */
  async updateProductFields(product: Product, updates: Partial<Product>) {
    const loading = await this.loadingController.create({
      message: 'Actualizando producto...'
    });
    await loading.present();

    try {
      const success = await this.productService.updateProduct(product.id, updates);
      
      if (success) {
        // Actualizar el producto local
        const index = this.products.findIndex(p => p.id === product.id);
        if (index !== -1) {
          this.products[index] = { ...this.products[index], ...updates };
          this.filterProducts();
        }
        await this.showToast('Producto actualizado exitosamente');
      } else {
        await this.showToast('Error al actualizar producto', 'danger');
      }
    } catch (error) {
      console.error('Error updating product fields:', error);
      await this.showToast('Error al actualizar producto', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  // Validación del formulario
  isFormValid(): boolean {
    const form = this.productForm;
    return !!(
      form.name?.trim() &&
      form.description?.trim() &&
      form.price &&
      form.price > 0 &&
      form.categoryId
    );
  }

  /**
   * Función temporal para limpiar categorías duplicadas
   */
  async cleanDuplicateCategories() {
    const loading = await this.loadingController.create({
      message: 'Limpiando categorías duplicadas...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.productService.cleanDuplicateCategories();
      await this.showToast('Categorías duplicadas eliminadas exitosamente', 'success');
      await this.loadData(); // Recargar datos
    } catch (error) {
      await this.showToast('Error al limpiar categorías duplicadas', 'danger');
    } finally {
      await loading.dismiss();
    }
  }


}