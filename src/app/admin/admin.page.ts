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
      console.log('AdminPage: Verificando acceso de administrador...');
      
      // Verificar si está logueado
      if (!this.authService.isLoggedIn()) {
        console.log('AdminPage: No está logueado');
        await this.showToast('Debes iniciar sesión para acceder.', 'danger');
        this.router.navigate(['/login']);
        return;
      }

      const currentUser = this.authService.getCurrentUser();
      console.log('AdminPage: Usuario actual:', currentUser);
      
      // Si es un usuario de Firebase, verificar por email primero
      if (currentUser) {
        console.log('AdminPage: Usuario Firebase encontrado, email:', currentUser.email);
        
        // Verificar por email si es admin
        if (currentUser.email) {
          const isAdminByEmail = this.userService.isAdminEmail(currentUser.email);
          console.log('AdminPage: ¿Es admin por email?', isAdminByEmail);
          
          if (isAdminByEmail) {
            this.isAdmin = true;
            console.log('AdminPage: Acceso concedido por email de admin');
            return;
          }
        }
        
        // Verificar por UID como respaldo
        this.isAdmin = await this.userService.isAdmin(currentUser.uid);
        console.log('AdminPage: ¿Es admin por UID?', this.isAdmin);
        
        if (!this.isAdmin) {
          console.log('AdminPage: Usuario de Firebase no es admin');
          await this.showToast('Acceso denegado. Se requieren permisos de administrador.', 'danger');
          this.router.navigate(['/catalog']);
          return;
        }
        return;
      }

      // Si es un usuario demo (credenciales de prueba)
      const username = localStorage.getItem('username');
      const isLoggedInFlag = localStorage.getItem('isLoggedIn');
      console.log('AdminPage: Username en localStorage:', username);
      console.log('AdminPage: isLoggedIn en localStorage:', isLoggedInFlag);
      
      if (username === 'admin' && isLoggedInFlag === 'true') {
        console.log('AdminPage: Usuario demo admin verificado');
        this.isAdmin = true;
        return;
      }

      // Si llegamos aquí, no es admin
      console.log('AdminPage: Acceso denegado - no es administrador');
      await this.showToast('Acceso denegado. Se requieren permisos de administrador.', 'danger');
      this.router.navigate(['/catalog']);
      
    } catch (error) {
      console.error('Error verificando acceso de admin:', error);
      await this.showToast('Error verificando permisos de administrador.', 'danger');
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
  // Función deprecada - ahora se usa selectImageSource()
  async addProductImage() {
    await this.selectImageSource();
  }

  // Función deprecada - ahora se usa takePictureFromCamera()
  private async takePhoto() {
    await this.takePictureFromCamera();
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
   * Abre opciones para seleccionar imagen (cámara o galería)
   */
  async selectImageSource() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar Imagen',
      buttons: [
        {
          text: 'Tomar Foto',
          icon: 'camera',
          handler: () => {
            this.takePictureFromCamera();
          }
        },
        {
          text: 'Elegir de Galería',
          icon: 'images',
          handler: () => {
            this.selectFromGallery();
          }
        },
        {
          text: 'Ingresar URL',
          icon: 'link',
          handler: () => {
            this.addImageByURL();
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
   * Tomar foto con la cámara
   */
  async takePictureFromCamera() {
    try {
      // En un entorno real, aquí usarías Capacitor Camera
      // Por ahora, simularemos con una URL de placeholder
      const alert = await this.alertController.create({
        header: 'Simulación de Cámara',
        message: 'En una app real, esto abriría la cámara. Por ahora, ingresa una URL de imagen:',
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
    } catch (error) {
      console.error('Error tomando foto:', error);
      await this.showToast('Error al acceder a la cámara', 'danger');
    }
  }

  /**
   * Seleccionar imagen de la galería
   */
  async selectFromGallery() {
    try {
      // En un entorno real, aquí usarías Capacitor Camera para gallery
      // Por ahora, simularemos con una URL de placeholder
      const alert = await this.alertController.create({
        header: 'Simulación de Galería',
        message: 'En una app real, esto abriría la galería. Por ahora, ingresa una URL de imagen:',
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
    } catch (error) {
      console.error('Error accediendo a galería:', error);
      await this.showToast('Error al acceder a la galería', 'danger');
    }
  }

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
    
    this.showToast('Imagen agregada exitosamente', 'success');
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
}